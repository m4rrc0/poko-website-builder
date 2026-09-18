import { pages, spreadPageSetup } from "poko-website-builder/cms-config";

export const collections = [
  {
    ...pages,
    ...spreadPageSetup("pages"),
    icon: "exercise",
  },
];

export const singletons = [];
