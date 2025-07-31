export const toTitleCase = (str = '') => str.replace(/[\w-]+/g, w =>
  w.replace(/\w/g, (c, i) => i === 0 ? c.toUpperCase() : c.toLowerCase())
);
