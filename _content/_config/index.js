import {
  NODE_ENV,
  WORKING_DIR_ABSOLUTE,
  CONTENT_PATH_PREFIX,
  CONTENT_DIR,
  PROD_URL,
  DISPLAY_URL,
  CMS_AUTH_URL,
  CMS_REPO,
  CMS_BACKEND,
  CMS_BRANCH,
} from "../../env.config.js";

const calendarSingleton = {
  name: "calendar-data",
  label: "Calendar Data",
  file: `${CONTENT_DIR}/_data/calendar-data.yaml`,
  icon: "date_range", // You can specify an icon
  fields: [
    {
      label: "Bookings",
      name: "bookings",
      widget: "list",
      summary: "{{fields.from}} -> {{fields.until}}",
      collapsed: true,
      // minimize_collapsed: true,
      add_to_top: true,
      fields: [
        {
          label: "From",
          name: "from",
          widget: "datetime",
          time_format: false,
          default: "{{now}}",
        },
        {
          label: "Until",
          name: "until",
          widget: "datetime",
          time_format: false,
          default: "{{now}}",
        },
      ],
    },
  ],
};

export const collections = [];

export const singletons = [calendarSingleton];
