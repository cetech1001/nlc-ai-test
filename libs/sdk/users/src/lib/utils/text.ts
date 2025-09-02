export const toTitleCase = (str = '') => str.replace(/[\w-]+/g, w =>
  w.replace(/\w/g, (c, i) => i === 0 ? c.toUpperCase() : c.toLowerCase())
);

export const getInitials = (str = '') =>
  str.split(' ').map(word => word[0]?.toUpperCase()).join('');
