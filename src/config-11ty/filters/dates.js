import dayjs from "dayjs";
import { DateTime } from "luxon";

const luxonShortcuts = {
  full: "DATETIME_FULL",
  long: "DATETIME_MED",
  medium: "DATETIME_MED_WITH_WEEKDAY",
  short: "DATETIME_SHORT",
  "date-full": "DATE_FULL",
  "date-long": "DATE_MED",
  "date-medium": "DATE_MED_WITH_WEEKDAY",
  "date-huge": "DATE_HUGE",
  "date-short": "DATE_SHORT",
  "time-full": "TIME_WITH_SECONDS",
  "time-long": "TIME_WITH_LONG_OFFSET",
  "time-medium": "TIME_WITH_SHORT_OFFSET",
  "time-short": "TIME_SIMPLE",
  "datetime-full": "DATETIME_FULL",
  "datetime-long": "DATETIME_MED",
  "datetime-medium": "DATETIME_MED_WITH_WEEKDAY",
  "datetime-short": "DATETIME_SHORT",
  "datetime-huge": "DATETIME_HUGE",
};

/** Converts the given date string to ISO8610 format. */
export const toISOString = (dateString) => dayjs(dateString).toISOString();

/** Formats a date using dayjs's conventions: https://day.js.org/docs/en/display/format */
export const formatDate = (date, format) => dayjs(date).format(format);
// export function formatDate(date, format, langOverride) {
//   return formatDateLocalized(date, format, langOverride);
// }

/** Converts a date to a slug using dayjs's conventions: https://day.js.org/docs/en/display/format */
export const dateToSlug = (dateString) =>
  dayjs(dateString).format("YYYY-MM-DD");

export const toLocaleString = (dateConst, lang, format) => {
  // TODO: check if this handles list of params in constructor
  let date;
  if (Array.isArray(dateConst)) {
    date = new Date(...dateConst);
  } else if (dateConst instanceof Date) {
    date = dateConst;
  } else if (typeof dateConst === "string") {
    date = new Date(dateConst);
  } else if (typeof dateConst === "number") {
    date = new Date(dateConst);
  } else if (!dateConst) {
    date = new Date();
  } else {
    throw new Error("Invalid date");
  }
  return date.toLocaleString(lang, format);
};

/** Formats a date with localization support using Luxon and Intl.DateTimeFormat */
export function formatDateLocalized(date, format, langOverride) {
  // Get the language from context or override
  const lang = langOverride || this?.page?.lang || this?.data?.lang || "en";

  // Parse the date using Luxon for robust handling
  let dt;
  if (typeof date === "string") {
    dt = DateTime.fromISO(date);
    if (!dt.isValid) {
      dt = DateTime.fromJSDate(new Date(date));
    }
  } else if (date instanceof Date) {
    dt = DateTime.fromJSDate(date);
  } else if (DateTime.isDateTime(date)) {
    dt = date;
  } else {
    dt = DateTime.fromJSDate(new Date(date));
  }

  if (!dt.isValid) {
    throw new Error("Invalid date format");
  }

  // Handle different format types
  if (typeof format === "string") {
    // Check if it's a predefined Luxon format
    if (luxonShortcuts[format]) {
      const result = dt
        .setLocale(lang)
        .toFormat(DateTime[luxonShortcuts[format]]);
      return result;
    }

    // If it's not a predefined format, use Luxon's toFormat with dayjs-style tokens
    // Convert common dayjs patterns to Luxon patterns
    let luxonFormat = format
      .replace(/YYYY/g, "yyyy")
      .replace(/YY/g, "yy")
      .replace(/MMMM/g, "LLLL")
      .replace(/MMM/g, "LLL")
      .replace(/MM/g, "LL")
      .replace(/M/g, "L")
      .replace(/DD/g, "dd")
      .replace(/D/g, "d")
      // .replace(/HH/g, "HH")
      // .replace(/H/g, "H")
      // .replace(/mm/g, "mm")
      // .replace(/m/g, "m")
      // .replace(/ss/g, "ss")
      // .replace(/s/g, "s")
      .replace(/A/g, "a");

    return dt.setLocale(lang).toFormat(luxonFormat);
  }

  // If format is an object, use Luxon's toLocaleString
  if (typeof format === "object") {
    return dt.setLocale(lang).toLocaleString(format);
  }

  // Default format - use localized date
  return dt.setLocale(lang).toLocaleString(DateTime.DATE_MED);
}
