// const multilineToInline = (multi) => {
//   return multi?.replace(/\n/g, "\\n")?.replace(/"/g, '\\"');
// };
// const inlineToMultiline = (inline) => {
//   return inline?.replace(/\\n/g, "\n")?.replace(/\\"/g, '"');
// };

// export const homeHeader = {
//   id: "homeHeader",
//   label: "Home Header",
//   // icon: "lunch_dining",
//   fields: [
//     {
//       name: "preHeading",
//       label: "Pre Heading",
//       widget: "string",
//       required: true,
//     },
//     {
//       name: "heading",
//       label: "Heading",
//       widget: "string",
//       required: true,
//     },
//     {
//       name: "bottom",
//       label: "Bottom",
//       widget: "markdown",
//       required: false,
//     },
//   ],
//   pattern:
//     /^{% component "home-header\.md", { preHeading: "(?<preHeading>.*?)", heading: "(?<heading>.*?)", bottom: "(?<bottom>.*?)" } %}$/ms,
//   fromBlock: function (match) {
//     return {
//       preHeading: match?.groups?.preHeading,
//       heading: match?.groups?.heading,
//       bottom: inlineToMultiline(match?.groups?.bottom) || "",
//     };
//   },
//   toBlock: function ({ preHeading, heading, bottom }) {
//     const escapedBottom = multilineToInline(bottom) || "";
//     return `{% component "home-header.md", { preHeading: "${preHeading}", heading: "${heading}", bottom: "${escapedBottom}" } %}`;
//   },
//   toPreview: function (data) {
//     return `TEST`;
//   },
// };
