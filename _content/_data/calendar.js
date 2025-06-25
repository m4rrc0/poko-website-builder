const rates = {
  default: {
    price: 150,
  },
  peak: {
    price: 150,
    from: "05-01",
    until: "09-30",
  },
  low: {
    price: 150,
    from: "10-01",
    until: "04-30",
  },
};

const bookings = [
  {
    from: "2025-06-01",
    until: "2025-07-08",
  },
  {
    from: "2025-07-24",
    until: "2025-08-11",
  },
];

/**
 * Generate calendar data based on rates and bookings
 * @param {number} offsetDays - Number of days to subtract from today (default: 15)
 * @returns {Array} Calendar data for the specified period
 */
function generateCalendar(offsetDays = 15) {
  // Get today's date
  const now = new Date("2025-06-25T23:05:09+02:00"); // Using provided timestamp

  // Calculate start date (today - offsetDays)
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - offsetDays);

  // Start from the beginning of the month for startDate
  const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  // Find the latest booking date from our data
  // Parse all booking dates to find the latest one
  const bookingDates = bookings.map((booking) => new Date(booking.until));
  const latestBookingDate = new Date(
    Math.max(...bookingDates.map((date) => date.getTime()))
  );

  // Calculate minimum and maximum end dates
  const minEndDate = new Date(now);
  minEndDate.setMonth(minEndDate.getMonth() + 6); // At least 6 months from now

  const maxEndDate = new Date(now);
  maxEndDate.setMonth(maxEndDate.getMonth() + 12); // At most 12 months from now

  // Determine actual end date based on rules
  let actualEndDate;

  if (latestBookingDate < minEndDate) {
    // If latest booking is before min end date, use min end date (6 months from now)
    actualEndDate = new Date(minEndDate);
  } else if (latestBookingDate > maxEndDate) {
    // If latest booking is after max end date, use max end date (12 months from now)
    actualEndDate = new Date(maxEndDate);
  } else {
    // If latest booking is between min and max, use that date
    actualEndDate = new Date(latestBookingDate);
  }

  // Ensure we cover until the end of the month for the end date
  const finalDateInRange = new Date(
    actualEndDate.getFullYear(),
    actualEndDate.getMonth() + 1,
    0
  );

  // Create a set of all booked dates for quick lookup
  const bookedDates = new Set();
  bookings.forEach((booking) => {
    // Parse booking dates and ensure they're set to the right day boundaries
    const start = new Date(booking.from);
    start.setHours(0, 0, 0, 0);

    const end = new Date(booking.until);
    end.setHours(23, 59, 59, 999);

    // Add all dates in the booking range (inclusive of start and end dates)
    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dateString = date.toISOString().split("T")[0];
      bookedDates.add(dateString);
    }
  });

  // Helper function to convert day of week from Sunday=0 to Monday=0 format
  const adjustDayOfWeek = (dayOfWeek) => {
    // Convert from JavaScript's Sunday=0 to Monday=0
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  // Function to get price for a specific date
  const getPriceForDate = (date) => {
    // Get month and day as MM-DD format
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const mmdd = `${month}-${day}`;

    // Check if date falls within peak season
    if (isDateInRange(mmdd, rates.peak.from, rates.peak.until)) {
      return rates.peak.price;
    }

    // Check if date falls within low season
    if (isDateInRange(mmdd, rates.low.from, rates.low.until)) {
      return rates.low.price;
    }

    // Default rate
    return rates.default.price;
  };

  // Helper function to check if a date is in a specific range
  const isDateInRange = (date, from, until) => {
    // Handle ranges that span across year boundary
    if (from > until) {
      return date >= from || date <= until;
    }
    return date >= from && date <= until;
  };

  // Generate calendar data
  const calendarData = [];

  // Start from the beginning of the month for the start date
  let currentDate = new Date(startMonth);

  // Ensure we generate calendar data through at least January 2026
  // This is to meet the requirement that the last month shown is January 2026
  const targetEndDate = new Date(2026, 0, 31); // January 31, 2026

  // Get the last date we need to show
  const lastDateToShow = new Date(
    Math.max(targetEndDate.getTime(), actualEndDate.getTime())
  );

  // Calculate the last month date (1st day of the month after the last month to show)
  const lastMonthDate = new Date(
    lastDateToShow.getFullYear(),
    lastDateToShow.getMonth() + 1,
    1
  );

  // Generate calendar month by month
  while (currentDate < lastMonthDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-based month

    // Calculate first day of month and total days
    const jsFirstDay = new Date(year, month - 1, 1).getDay(); // JavaScript day (0 = Sunday)
    const firstDay = adjustDayOfWeek(jsFirstDay); // Adjusted day (0 = Monday)
    const daysInMonth = new Date(year, month, 0).getDate();

    // Initialize weeks array
    const weeks = [];
    let week = Array(7).fill(undefined);

    // Fill in days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      week[i] = undefined;
    }

    // Fill in all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split("T")[0];
      const jsDayOfWeek = date.getDay(); // JavaScript day (0 = Sunday)
      const dayOfWeek = adjustDayOfWeek(jsDayOfWeek); // Adjusted day (0 = Monday)

      // Create day object
      const dayObj = {
        date: day,
        price: getPriceForDate(date),
      };

      // Check if day is booked
      if (bookedDates.has(dateStr)) {
        dayObj.booked = true;
      }

      // Add day to current week
      week[dayOfWeek] = dayObj;

      // If it's the last day of the week or last day of the month, push the week
      if (dayOfWeek === 6 || day === daysInMonth) {
        weeks.push([...week]); // Create a copy of the week array
        week = Array(7).fill(undefined); // Reset week
      }
    }

    // Add month data to calendar
    calendarData.push({
      month,
      year,
      weeks,
    });

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return calendarData;
}

// export default generateCalendar;
export default function () {
  return generateCalendar();
}
