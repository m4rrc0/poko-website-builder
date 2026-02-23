import { sort } from "fast-sort";
// TODO: Memoize this function
// import memoize from "memoize";
import { tryMatchNestedVariable } from "./objects.js";

export function filterCollection(collection, filtersRaw) {
  const toInt = (value) => (isNaN(parseInt(value)) ? 1 : parseInt(value));
  const toArrayOfStrings = (value) => {
    const arr = Array.isArray(value) ? value : [value];
    return arr.map((v) => v.toString());
  };
  const toString = (value) => (!!value ? value.toString() : "");

  const filters = Array.isArray(filtersRaw) ? filtersRaw : [filtersRaw];

  const filteredCollection = filters.reduce((acc, { by, value } = {}) => {
    switch (by) {
      // NOTE: Match some special keywords first
      case "last":
        return acc.slice(-toInt(value));
      case "first":
        return acc.slice(0, toInt(value));
      case "random":
        // Randomly pick 'value' items from the collection while keeping the items in the same sort order
        const itemIndexes = Array.from(
          {
            length: toInt(value) > acc.length ? acc.length : toInt(value),
          },
          () => Math.floor(Math.random() * acc.length),
        ).sort((a, b) => a - b);
        return itemIndexes.map((index) => collection[index]);
      case "tags":
        const tagsToMatch = toArrayOfStrings(value);
        return acc.filter((item) =>
          item.data.tags?.some((tag) => tagsToMatch.includes(tag)),
        );
      case "lang":
        return acc.filter((item) => {
          return (item.data.lang || item.data?.page?.lang) === value;
        });
      case "parent":
        // If we provide a nullish value, we want no parent so we need an && operator
        if (!value) {
          return acc.filter(
            (item) =>
              toString(item.data.parent) === toString(value) &&
              toString(item.data.eleventyNavigation?.parent) ===
                toString(value),
          );
        }
        return acc.filter(
          (item) =>
            toString(item.data.parent) === toString(value) ||
            toString(item.data.eleventyNavigation?.parent) === toString(value),
        );
      // NOTE: If no keyword is matched, suppose it is a nested property to be filtered by
      // TODO: Debug: This does not seem to work
      default:
        if (typeof by === "string") {
          if (Array.isArray(value)) {
            return acc.filter((item) =>
              value.some((v) => tryMatchNestedVariable(item, by) === v),
            );
          } else if (typeof value === "string" || typeof value === "number") {
            return acc.filter(
              (item) => tryMatchNestedVariable(item, by) === value,
            );
          } else if (typeof value === "boolean") {
            return acc.filter((item) => tryMatchNestedVariable(item, by));
          } else if (!value) {
            return acc.filter((item) => {
              const val = tryMatchNestedVariable(item, by);
              return val === undefined || val === null || val === false;
            });
          }
        }
        return acc;
    }
  }, collection);

  return filteredCollection;
}

const sortCb = (collectionItem, by) => {
  const value = tryMatchNestedVariable(collectionItem, by);
  // Normalize strings to lowercase for case-insensitive sorting
  return typeof value === "string" ? value.toLowerCase() : value;
};

export function sortCollection(collection, sortCriteriasRaw) {
  const sortCriterias = Array.isArray(sortCriteriasRaw)
    ? sortCriteriasRaw
    : [sortCriteriasRaw];

  const sortedCollection = sort(collection).by(
    sortCriterias.map(({ direction, by }) => ({
      [direction]: (collectionItem) => sortCb(collectionItem, by),
    })),
  );

  return sortedCollection;
}
