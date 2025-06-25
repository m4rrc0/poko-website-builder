import assert from 'node:assert';
import { ensureKeyValObject, getNestedValue } from "../../utils/objects.js";

// Convert an array of key: value pairs to an object
export const varArrayToObj = (varArray = []) => {
  assert(Array.isArray(varArray), 'Trying to process an array of variables but it is not an array');
  const obj = {};
  for (const { key, value } of (varArray || [])) {
    obj[key] = value;
  }
  return obj;
}

export const replaceVariablesInKeyValObject = (obj, variables) => {
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string' && /\$/.test(value)) {
      // TODO: We should handle partial matches (e.g. "URL: $page.url")
      obj[key] = getNestedValue(variables, value.replace('$', '')) || value
    }
  })
}

// PARTIALS
export const formatPartialFileName = (discriminant, value) => {
  let file = value.endsWith('.mdoc') ? value : `${value}.mdoc`;
  file = discriminant === 'global' ? `global/${file}` : file;
  return file;
}

export class PartialFile {
  validate(fileRaw, config) {
    const { discriminant, value } = fileRaw;
    const file = formatPartialFileName(discriminant, value);
    const { partials = {} } = config;
    const partial = partials[file];

    if (!partial)
      return [
        {
          id: 'attribute-value-invalid',
          level: 'error',
          message: `Partial \`${file}\` not found. The 'file' attribute must be set in \`config.partials\``,
        },
      ];

    return [];
  }
}

export const retrievePartial = (config, file) => {
  const { partials = {} } = config;
  const partial = partials[file];
  if (!partial) return null;
  return partial;
}