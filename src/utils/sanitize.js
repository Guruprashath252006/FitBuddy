export const sanitizeString = (str, max = 50) =>
  String(str || '').trim().slice(0, max).replace(/[<>"'`]/g, '');

export const sanitizeNumber = (val, min, max) => {
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  return Math.min(Math.max(n, min), max);
};

export const toISODate = (date = new Date()) =>
  date.toISOString().split('T')[0];

export const isToday = (dateStr) => toISODate() === dateStr;

export const daysBetween = (a, b = new Date()) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b) - new Date(a)) / msPerDay);
};
