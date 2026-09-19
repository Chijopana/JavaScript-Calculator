// Catálogo de unidades y conversiones.
//
// Todas las categorías salvo temperatura se resuelven con un factor respecto a
// una unidad base, así que basta con `valor * factorOrigen / factorDestino`.
// Los factores son los exactos de la definición internacional (el código
// anterior usaba redondeos como 0.51444 para el nudo o 0.277778 para km/h, que
// introducían error desde la primera conversión).

export const CATEGORIES = [
  {
    id: "length",
    label: "Longitud",
    base: "m",
    units: [
      { id: "mm", label: "Milímetro", symbol: "mm", factor: 0.001 },
      { id: "cm", label: "Centímetro", symbol: "cm", factor: 0.01 },
      { id: "m", label: "Metro", symbol: "m", factor: 1 },
      { id: "km", label: "Kilómetro", symbol: "km", factor: 1000 },
      { id: "in", label: "Pulgada", symbol: "in", factor: 0.0254 },
      { id: "ft", label: "Pie", symbol: "ft", factor: 0.3048 },
      { id: "yd", label: "Yarda", symbol: "yd", factor: 0.9144 },
      { id: "mi", label: "Milla", symbol: "mi", factor: 1609.344 },
      { id: "nmi", label: "Milla náutica", symbol: "M", factor: 1852 },
    ],
  },
  {
    id: "mass",
    label: "Masa",
    base: "kg",
    units: [
      { id: "mg", label: "Miligramo", symbol: "mg", factor: 0.000001 },
      { id: "g", label: "Gramo", symbol: "g", factor: 0.001 },
      { id: "kg", label: "Kilogramo", symbol: "kg", factor: 1 },
      { id: "t", label: "Tonelada", symbol: "t", factor: 1000 },
      { id: "oz", label: "Onza", symbol: "oz", factor: 0.028349523125 },
      { id: "lb", label: "Libra", symbol: "lb", factor: 0.45359237 },
      { id: "st", label: "Stone", symbol: "st", factor: 6.35029318 },
    ],
  },
  {
    id: "temperature",
    label: "Temperatura",
    base: "C",
    units: [
      { id: "C", label: "Celsius", symbol: "°C" },
      { id: "F", label: "Fahrenheit", symbol: "°F" },
      { id: "K", label: "Kelvin", symbol: "K" },
    ],
  },
  {
    id: "area",
    label: "Área",
    base: "m2",
    units: [
      { id: "cm2", label: "Centímetro cuadrado", symbol: "cm²", factor: 0.0001 },
      { id: "m2", label: "Metro cuadrado", symbol: "m²", factor: 1 },
      { id: "ha", label: "Hectárea", symbol: "ha", factor: 10000 },
      { id: "km2", label: "Kilómetro cuadrado", symbol: "km²", factor: 1000000 },
      { id: "ft2", label: "Pie cuadrado", symbol: "ft²", factor: 0.09290304 },
      { id: "acre", label: "Acre", symbol: "ac", factor: 4046.8564224 },
      { id: "mi2", label: "Milla cuadrada", symbol: "mi²", factor: 2589988.110336 },
    ],
  },
  {
    id: "volume",
    label: "Volumen",
    base: "l",
    units: [
      { id: "ml", label: "Mililitro", symbol: "ml", factor: 0.001 },
      { id: "l", label: "Litro", symbol: "L", factor: 1 },
      { id: "m3", label: "Metro cúbico", symbol: "m³", factor: 1000 },
      { id: "tsp", label: "Cucharadita", symbol: "cdta", factor: 0.00492892159375 },
      { id: "tbsp", label: "Cucharada", symbol: "cda", factor: 0.01478676478125 },
      { id: "cup", label: "Taza", symbol: "taza", factor: 0.2365882365 },
      { id: "pt", label: "Pinta (US)", symbol: "pt", factor: 0.473176473 },
      { id: "gal_us", label: "Galón (US)", symbol: "gal US", factor: 3.785411784 },
      { id: "gal_uk", label: "Galón (UK)", symbol: "gal UK", factor: 4.54609 },
    ],
  },
  {
    id: "speed",
    label: "Velocidad",
    base: "mps",
    units: [
      { id: "mps", label: "Metro por segundo", symbol: "m/s", factor: 1 },
      { id: "kmh", label: "Kilómetro por hora", symbol: "km/h", factor: 1 / 3.6 },
      { id: "mph", label: "Milla por hora", symbol: "mph", factor: 0.44704 },
      { id: "fts", label: "Pie por segundo", symbol: "ft/s", factor: 0.3048 },
      { id: "knot", label: "Nudo", symbol: "kn", factor: 1852 / 3600 },
    ],
  },
  {
    id: "time",
    label: "Tiempo",
    base: "s",
    units: [
      { id: "ms", label: "Milisegundo", symbol: "ms", factor: 0.001 },
      { id: "s", label: "Segundo", symbol: "s", factor: 1 },
      { id: "min", label: "Minuto", symbol: "min", factor: 60 },
      { id: "h", label: "Hora", symbol: "h", factor: 3600 },
      { id: "day", label: "Día", symbol: "d", factor: 86400 },
      { id: "week", label: "Semana", symbol: "sem", factor: 604800 },
      { id: "year", label: "Año", symbol: "a", factor: 31557600 },
    ],
  },
  {
    id: "data",
    label: "Datos",
    base: "byte",
    units: [
      { id: "bit", label: "Bit", symbol: "bit", factor: 0.125 },
      { id: "byte", label: "Byte", symbol: "B", factor: 1 },
      { id: "kb", label: "Kilobyte", symbol: "kB", factor: 1000 },
      { id: "mb", label: "Megabyte", symbol: "MB", factor: 1000000 },
      { id: "gb", label: "Gigabyte", symbol: "GB", factor: 1000000000 },
      { id: "tb", label: "Terabyte", symbol: "TB", factor: 1000000000000 },
      { id: "kib", label: "Kibibyte", symbol: "KiB", factor: 1024 },
      { id: "mib", label: "Mebibyte", symbol: "MiB", factor: 1048576 },
      { id: "gib", label: "Gibibyte", symbol: "GiB", factor: 1073741824 },
    ],
  },
];

const CATEGORY_BY_ID = new Map(CATEGORIES.map((category) => [category.id, category]));

export function getCategory(categoryId) {
  const category = CATEGORY_BY_ID.get(categoryId);
  if (!category) throw new Error(`Categoría desconocida: ${categoryId}`);
  return category;
}

export function getUnit(categoryId, unitId) {
  return getCategory(categoryId).units.find((unit) => unit.id === unitId) ?? null;
}

export function getUnitSymbol(categoryId, unitId) {
  return getUnit(categoryId, unitId)?.symbol ?? unitId;
}

function celsiusFrom(value, unitId) {
  if (unitId === "F") return ((value - 32) * 5) / 9;
  if (unitId === "K") return value - 273.15;
  return value;
}

function celsiusTo(value, unitId) {
  if (unitId === "F") return (value * 9) / 5 + 32;
  if (unitId === "K") return value + 273.15;
  return value;
}

/**
 * Convierte `value` entre dos unidades de la misma categoría.
 * Devuelve `null` si los datos no son válidos, nunca lanza.
 */
export function convert(categoryId, fromId, toId, value) {
  if (!Number.isFinite(value)) return null;

  const category = CATEGORY_BY_ID.get(categoryId);
  if (!category) return null;

  const from = getUnit(categoryId, fromId);
  const to = getUnit(categoryId, toId);
  if (!from || !to) return null;

  if (categoryId === "temperature") {
    return celsiusTo(celsiusFrom(value, fromId), toId);
  }

  return (value * from.factor) / to.factor;
}

/** Texto de referencia del tipo "1 m = 100 cm", para mostrar bajo el resultado. */
export function conversionRate(categoryId, fromId, toId) {
  if (categoryId === "temperature") return null;
  const rate = convert(categoryId, fromId, toId, 1);
  if (rate === null) return null;
  return rate;
}
