import { describe, expect, it } from "vitest";
import { CATEGORIES, convert, getUnitSymbol } from "./units.js";

describe("conversiones", () => {
  it("convierte longitudes en ambos sentidos", () => {
    expect(convert("length", "m", "cm", 1)).toBe(100);
    expect(convert("length", "cm", "m", 100)).toBe(1);
    expect(convert("length", "mi", "km", 1)).toBeCloseTo(1.609344, 9);
  });

  it("convierte temperaturas, incluidos los negativos", () => {
    expect(convert("temperature", "C", "F", 0)).toBe(32);
    expect(convert("temperature", "C", "F", -40)).toBe(-40);
    expect(convert("temperature", "K", "C", 273.15)).toBeCloseTo(0, 10);
  });

  it("usa los factores exactos, no redondeados", () => {
    // 0.51444 (el valor anterior) daba 1.85198 km/h por nudo.
    expect(convert("speed", "knot", "kmh", 1)).toBeCloseTo(1.852, 10);
    expect(convert("mass", "lb", "kg", 1)).toBeCloseTo(0.45359237, 12);
  });

  it("devuelve null con datos inválidos en vez de lanzar", () => {
    expect(convert("length", "m", "cm", Number.NaN)).toBeNull();
    expect(convert("length", "m", "parsecs", 1)).toBeNull();
    expect(convert("inexistente", "m", "cm", 1)).toBeNull();
  });

  it("la ida y vuelta devuelve el valor original", () => {
    for (const category of CATEGORIES) {
      for (const unit of category.units) {
        const base = category.units[0];
        const ida = convert(category.id, base.id, unit.id, 7);
        const vuelta = convert(category.id, unit.id, base.id, ida);
        expect(vuelta).toBeCloseTo(7, 8);
      }
    }
  });
});

describe("catálogo", () => {
  it("no tiene identificadores repetidos dentro de una categoría", () => {
    for (const category of CATEGORIES) {
      const ids = category.units.map((unit) => unit.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("toda unidad tiene símbolo", () => {
    for (const category of CATEGORIES) {
      for (const unit of category.units) {
        expect(getUnitSymbol(category.id, unit.id)).toBeTruthy();
      }
    }
  });
});
