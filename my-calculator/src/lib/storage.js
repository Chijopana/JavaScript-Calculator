// Acceso a localStorage tolerante a fallos.
//
// En modo incógnito de Safari, con cookies bloqueadas o con la cuota llena,
// `localStorage` lanza. El código anterior lo usaba a pelo, así que cualquiera
// de esos casos tumbaba la aplicación entera.

export const STORAGE_KEYS = {
  theme: "calc:theme",
  angleMode: "calc:angleMode",
  memory: "calc:memory",
  history: "calc:history",
  mode: "calc:mode",
};

export function readStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
