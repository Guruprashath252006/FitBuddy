// Versioned localStorage helpers
const VERSION = 'fb2';

export const storage = {
  get: (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(`${VERSION}_${key}`);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(`${VERSION}_${key}`, JSON.stringify(value)); } catch {}
  },
  remove: (key) => {
    try { localStorage.removeItem(`${VERSION}_${key}`); } catch {}
  },
  clear: () => {
    try {
      Object.keys(localStorage).filter(k => k.startsWith(`${VERSION}_`)).forEach(k => localStorage.removeItem(k));
    } catch {}
  }
};
