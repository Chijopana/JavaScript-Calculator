// Utilidades de formato y redondeo de números.
//
// Toda la app trabaja internamente con `number` y sólo convierte a texto al
// pintar. Así no se pierde precisión al encadenar operaciones (el error clásico
// de guardar el resultado ya formateado y volver a parsearlo).

const SIGNIFICANT_DIGITS = 12;
const EXP_UPPER = 1e15;
const EXP_LOWER = 1e-9;

/**
 * Recorta el ruido binario del IEEE-754: 0.1 + 0.2 -> 0.3 en vez de
 * 0.30000000000000004.
 */
export function roundFloat(value) {
  if (!Number.isFinite(value)) return value;
  const rounded = Number(value.toPrecision(SIGNIFICANT_DIGITS));
  return Object.is(rounded, -0) ? 0 : rounded;
}

/** Texto listo para pintar: separadores de miles o notación científica. */
export function formatNumber(value) {
  if (value === null || value === undefined) return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "∞";

  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= EXP_UPPER || abs < EXP_LOWER)) {
    return n
      .toExponential(8)
      .replace(/\.?0+e/, "e")
      .replace("e+", "e");
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 10,
    useGrouping: true,
  }).format(n);
}

/** Igual que `formatNumber` pero sin separadores: sirve para volver a editar. */
export function toEditableString(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= EXP_UPPER || abs < EXP_LOWER)) {
    return n.toExponential(8).replace(/\.?0+e/, "e");
  }
  return String(roundFloat(n));
}

/** Acepta "1,234.5", " 12 ", "-40", "1e3". Devuelve NaN si no es un número. */
export function parseNumber(text) {
  const cleaned = String(text).replace(/[\s,]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") return NaN;
  return Number(cleaned);
}
