import dayjs from "dayjs";

/** Converts the given date string to ISO8610 format. */
export const toISOString = (dateString) => dayjs(dateString).toISOString();

/** Formats a date using dayjs's conventions: https://day.js.org/docs/en/display/format */
export const formatDate = (date, format) => dayjs(date).format(format);

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
