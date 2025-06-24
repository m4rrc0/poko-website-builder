const rates = {
  default: {
    price: 150,
  },
  1: {
    price: 150,
    from: "2025-06-20",
    until: "2025-06-26",
  },
};

const calendarStart = new Date("2025-06-01");
const calendarEnd = new Date("2025-12-31");
const monthStart = calendarStart.getMonth();
const monthEnd = calendarEnd.getMonth();
const yearStart = calendarStart.getFullYear();
const yearEnd = calendarEnd.getFullYear();
let currentMonth = monthStart;
let currentYear = yearStart;

const months = [];

while (currentMonth <= monthEnd && currentYear <= yearEnd) {
  months.push({
    month: currentMonth,
    year: currentYear,
  });
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
}

// for (let i = 0; i < 12; i++) {
//   weeks.push({
//     id: i,
//     from: new Date(new Date().setDate(new Date().getDate() + i * 7)),
//     until: new Date(new Date().setDate(new Date().getDate() + (i + 1) * 7)),
//   });
// }

console.log({
  calendarStart,
  calendarEnd,
  monthStart,
  monthEnd,
  yearStart,
  yearEnd,
});

export default function () {
  return [
    {
      month: 5,
      year: 2025,
      weeks: [
        [
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { date: 1, price: 150, booked: 1 },
        ],
        [
          { date: 2, price: 150, booked: 1 },
          { date: 3, price: 150, booked: 1 },
          { date: 4, price: 150, booked: 1 },
          { date: 5, price: 150, booked: 1 },
          { date: 6, price: 150, booked: 1 },
          { date: 7, price: 150, booked: 1 },
          { date: 8, price: 150, booked: 1 },
        ],
        [
          { date: 9, price: 150, booked: 1 },
          { date: 10, price: 150, booked: 1 },
          { date: 11, price: 150, booked: 1 },
          { date: 12, price: 150, booked: 1 },
          { date: 13, price: 150, booked: 1 },
          { date: 14, price: 150, booked: 1 },
          { date: 15, price: 150, booked: 1 },
        ],
        [
          { date: 16, price: 150, booked: 1 },
          { date: 17, price: 150, booked: 1 },
          { date: 18, price: 150, booked: 1 },
          { date: 19, price: 150, booked: 1 },
          { date: 20, price: 150, booked: 1 },
          { date: 21, price: 150, booked: 1 },
          { date: 22, price: 150, booked: 1 },
        ],
        [
          { date: 23, price: 150, booked: 1 },
          { date: 24, price: 150, booked: 1 },
          { date: 25, price: 150, booked: 1 },
          { date: 26, price: 150, booked: 1 },
          { date: 27, price: 150, booked: 1 },
          { date: 28, price: 150, booked: 1 },
          { date: 29, price: 150, booked: 1 },
        ],
        [{ date: 30, price: 150, booked: 1 }],
      ],
    },
    {
      month: 6,
      year: 2025,
      weeks: [
        [
          undefined,
          { date: 1, price: 150, booked: 1 },
          { date: 2, price: 150, booked: 1 },
          { date: 3, price: 150, booked: 1 },
          { date: 4, price: 150, booked: 1 },
          { date: 5, price: 150, booked: 1 },
          { date: 6, price: 150, booked: 1 },
        ],
        [
          { date: 7, price: 150, booked: 0 },
          { date: 8, price: 150, booked: 0 },
          { date: 9, price: 150, booked: 0 },
          { date: 10, price: 150, booked: 0 },
          { date: 11, price: 150, booked: 0 },
          { date: 12, price: 150, booked: 0 },
          { date: 13, price: 150, booked: 0 },
        ],
        [
          { date: 14, price: 150, booked: 0 },
          { date: 15, price: 150, booked: 0 },
          { date: 16, price: 150, booked: 0 },
          { date: 17, price: 150, booked: 0 },
          { date: 18, price: 150, booked: 0 },
          { date: 19, price: 150, booked: 0 },
          { date: 20, price: 150, booked: 0 },
        ],
        [
          { date: 21, price: 150, booked: 0 },
          { date: 22, price: 150, booked: 0 },
          { date: 23, price: 150, booked: 0 },
          { date: 24, price: 150, booked: 1 },
          { date: 25, price: 150, booked: 1 },
          { date: 26, price: 150, booked: 1 },
          { date: 27, price: 150, booked: 1 },
        ],
        [
          { date: 28, price: 150, booked: 1 },
          { date: 29, price: 150, booked: 1 },
          { date: 30, price: 150, booked: 1 },
          { date: 31, price: 150, booked: 1 },
        ],
      ],
    },
    {
      month: 7,
      year: 2025,
      weeks: [
        [
          undefined,
          undefined,
          undefined,
          undefined,
          { date: 1, price: 150, booked: 1 },
          { date: 2, price: 150, booked: 1 },
          { date: 3, price: 150, booked: 1 },
        ],
        [
          { date: 4, price: 150, booked: 1 },
          { date: 5, price: 150, booked: 1 },
          { date: 6, price: 150, booked: 1 },
          { date: 7, price: 150, booked: 1 },
          { date: 8, price: 150, booked: 1 },
          { date: 9, price: 150, booked: 1 },
          { date: 10, price: 150, booked: 1 },
        ],
        [
          { date: 11, price: 150, booked: 1 },
          { date: 12, price: 150, booked: 0 },
          { date: 13, price: 150, booked: 0 },
          { date: 14, price: 150, booked: 0 },
          { date: 15, price: 150, booked: 0 },
          { date: 16, price: 150, booked: 0 },
          { date: 17, price: 150, booked: 0 },
        ],
        [
          { date: 18, price: 150, booked: 0 },
          { date: 19, price: 150, booked: 0 },
          { date: 20, price: 150, booked: 0 },
          { date: 21, price: 150, booked: 0 },
          { date: 22, price: 150, booked: 0 },
          { date: 23, price: 150, booked: 0 },
          { date: 24, price: 150, booked: 0 },
        ],
        [
          { date: 25, price: 150, booked: 0 },
          { date: 26, price: 150, booked: 0 },
          { date: 27, price: 150, booked: 0 },
          { date: 28, price: 150, booked: 0 },
          { date: 29, price: 150, booked: 0 },
          { date: 30, price: 150, booked: 0 },
          { date: 31, price: 150, booked: 0 },
        ],
      ],
    },
    {
      month: 8,
      year: 2025,
      weeks: [
        [
          { date: 1, price: 150, booked: 0 },
          { date: 2, price: 150, booked: 0 },
          { date: 3, price: 150, booked: 0 },
          { date: 4, price: 150, booked: 0 },
          { date: 5, price: 150, booked: 0 },
          { date: 6, price: 150, booked: 0 },
          { date: 7, price: 150, booked: 0 },
        ],
        [
          { date: 8, price: 150, booked: 0 },
          { date: 9, price: 150, booked: 0 },
          { date: 10, price: 150, booked: 0 },
          { date: 11, price: 150, booked: 0 },
          { date: 12, price: 150, booked: 0 },
          { date: 13, price: 150, booked: 0 },
          { date: 14, price: 150, booked: 0 },
        ],
        [
          { date: 15, price: 150, booked: 0 },
          { date: 16, price: 150, booked: 0 },
          { date: 17, price: 150, booked: 0 },
          { date: 18, price: 150, booked: 0 },
          { date: 19, price: 150, booked: 0 },
          { date: 20, price: 150, booked: 0 },
          { date: 21, price: 150, booked: 0 },
        ],
        [
          { date: 22, price: 150, booked: 0 },
          { date: 23, price: 150, booked: 0 },
          { date: 24, price: 150, booked: 0 },
          { date: 25, price: 150, booked: 0 },
          { date: 26, price: 150, booked: 0 },
          { date: 27, price: 150, booked: 0 },
          { date: 28, price: 150, booked: 0 },
        ],
        [
          { date: 29, price: 150, booked: 0 },
          { date: 30, price: 150, booked: 0 },
        ],
      ],
    },
    {
      month: 9,
      year: 2025,
      weeks: [
        [
          undefined,
          undefined,
          { date: 1, price: 150, booked: 0 },
          { date: 2, price: 150, booked: 0 },
          { date: 3, price: 150, booked: 0 },
          { date: 4, price: 150, booked: 0 },
          { date: 5, price: 150, booked: 0 },
        ],
        [
          { date: 6, price: 150, booked: 0 },
          { date: 7, price: 150, booked: 0 },
          { date: 8, price: 150, booked: 0 },
          { date: 9, price: 150, booked: 0 },
          { date: 10, price: 150, booked: 0 },
          { date: 11, price: 150, booked: 0 },
          { date: 12, price: 150, booked: 0 },
        ],
        [
          { date: 13, price: 150, booked: 0 },
          { date: 14, price: 150, booked: 0 },
          { date: 15, price: 150, booked: 0 },
          { date: 16, price: 150, booked: 0 },
          { date: 17, price: 150, booked: 0 },
          { date: 18, price: 150, booked: 0 },
          { date: 19, price: 150, booked: 0 },
        ],
        [
          { date: 20, price: 150, booked: 0 },
          { date: 21, price: 150, booked: 0 },
          { date: 22, price: 150, booked: 0 },
          { date: 23, price: 150, booked: 0 },
          { date: 24, price: 150, booked: 0 },
          { date: 25, price: 150, booked: 0 },
          { date: 26, price: 150, booked: 0 },
        ],
        [
          { date: 27, price: 150, booked: 0 },
          { date: 28, price: 150, booked: 0 },
          { date: 29, price: 150, booked: 0 },
          { date: 30, price: 150, booked: 0 },
          { date: 31, price: 150, booked: 0 },
        ],
      ],
    },
  ];
}
