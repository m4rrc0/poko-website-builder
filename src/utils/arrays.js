import { sort } from "fast-sort";
// TODO: Memoize this function
// import memoize from "memoize";
import { tryMatchNestedVariable } from "./objects.js";

export function filterCollection(collection, filtersRaw, exclusions = false) {
  const toInt = (value) => (isNaN(parseInt(value)) ? 1 : parseInt(value));
  const toArrayOfStrings = (value) => {
    const arr = Array.isArray(value) ? value : [value];
    return arr.map((v) => v.toString());
  };
  const toString = (value) => (!!value ? value.toString() : "");

  const filters = Array.isArray(filtersRaw) ? filtersRaw : [filtersRaw];

  const filterAcc = (acc, callback) => acc.filter((item) => !!callback(item));

  const filteredCollection = filters.reduce((acc, { by, value } = {}) => {
    switch (by) {
      // NOTE: Match some special keywords first
      case "truthy": {
        const valueMatch = value === "false" ? false : Boolean(value);
        return filterAcc(acc, (item) => Boolean(item) === valueMatch);
      }
      case "slug": {
        const needles = toArrayOfStrings(value)
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean);
        if (needles.length === 0) return acc;
        return filterAcc(acc, (item) => {
          const slug = toString(item.page.fileSlug).toLowerCase();
          if (!slug) return false;
          return needles.some((s) => slug.includes(s));
        });
      }
      case "name": {
        const needles = toArrayOfStrings(value)
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean);
        if (needles.length === 0) return acc;
        return filterAcc(acc, (item) => {
          const name = toString(item.data?.name || item?.name).toLowerCase();
          if (!name) return false;
          return needles.some((n) => name.includes(n));
        });
      }
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
      case "tag":
      case "tags":
        const tagsToMatch = toArrayOfStrings(value);
        return filterAcc(acc, (item) =>
          item.data.tags?.some((tag) => tagsToMatch.includes(tag)),
        );
      case "lang":
        return acc.filter((item) => {
          return (item.data.lang || item.data?.page?.lang) === value;
        });
      case "parent":
        // If we provide a nullish value, we want no parent so we need an && operator
        if (!value) {
          return filterAcc(
            acc,
            (item) =>
              toString(item.data.parent) === toString(value) &&
              toString(item.data.eleventyNavigation?.parent) ===
                toString(value),
          );
        }
        return filterAcc(
          acc,
          (item) =>
            toString(item.data.parent) === toString(value) ||
            toString(item.data.eleventyNavigation?.parent) === toString(value),
        );
      // NOTE: If no keyword is matched, suppose it is a nested property to be filtered by
      // TODO: Debug: This does not seem to work
      default:
        if (typeof by === "string") {
          if (Array.isArray(value)) {
            return filterAcc(acc, (item) =>
              value.some((v) => tryMatchNestedVariable(item, by) === v),
            );
          } else if (typeof value === "string" || typeof value === "number") {
            return filterAcc(
              acc,
              (item) => tryMatchNestedVariable(item, by) === value,
            );
            // We only match `true` here. `false` is ok to be matched as falsy value?
          } else if (value === true) {
            return filterAcc(acc, (item) => tryMatchNestedVariable(item, by));
          } else if (!value) {
            return filterAcc(acc, (item) => {
              const val = tryMatchNestedVariable(item, by);
              return val === undefined || val === null || val === false;
            });
          }
        }
        return acc;
    }
  }, collection || []);

  if (exclusions) {
    return collection.filter((item) => !filteredCollection.includes(item));
  }

  return filteredCollection;
}

const sortCb = (collectionItem, by) => {
  const value = tryMatchNestedVariable(collectionItem, by);
  // Normalize strings to lowercase for case-insensitive sorting
  return typeof value === "string" ? value.toLowerCase() : value;
};

export function sortCollection(collection, sortCriteriasRaw = []) {
  let sortCriterias = Array.isArray(sortCriteriasRaw)
    ? [...sortCriteriasRaw]
    : [sortCriteriasRaw];

  sortCriterias = sortCriterias.filter((sc) => sc);
  sortCriterias =
    sortCriterias.length === 0
      ? [{ direction: "asc", by: "order" }]
      : sortCriterias;

  // If any criteria requests randomization, shuffle and short-circuit.
  if (sortCriterias.some((sc) => sc?.by === "random")) {
    const shuffled = [...collection];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const sortedCollection = sort(collection).by(
    sortCriterias
      .filter((sc) => sc?.by && sc?.direction)
      .map(({ direction, by }) => ({
        [direction]: (collectionItem) => sortCb(collectionItem, by),
      })),
  );

  return sortedCollection;
}
