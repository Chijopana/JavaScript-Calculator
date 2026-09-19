import { describe, expect, it } from "vitest";
import { appendToken, backspace, balanceParens, toggleSign } from "./expressionInput.js";

describe("appendToken", () => {
  it("no deja ceros a la izquierda", () => {
    expect(appendToken("0", "5")).toBe("5");
    expect(appendToken("0", ".")).toBe("0.");
    expect(appendToken("10", "0")).toBe("100");
  });

  it("permite un solo punto decimal por número", () => {
    expect(appendToken("1.5", ".")).toBe("1.5");
    expect(appendToken("1.5+2", ".")).toBe("1.5+2.");
    expect(appendToken("1.5+", ".")).toBe("1.5+0.");
  });

  it("sustituye el operador en vez de encadenar dos", () => {
    expect(appendToken("5+", "×")).toBe("5×");
    expect(appendToken("5×", "+")).toBe("5+");
  });

  it("deja escribir un número negativo", () => {
    // Antes era imposible: la expresión no podía empezar por un operador.
    expect(appendToken("", "−")).toBe("−");
    expect(appendToken("", "+")).toBe("");
    expect(appendToken("5×", "−")).toBe("5×−");
  });

  it("sólo cierra paréntesis que estén abiertos", () => {
    expect(appendToken("(1+2", ")")).toBe("(1+2)");
    expect(appendToken("1+2", ")")).toBe("1+2");
    expect(appendToken("(", ")")).toBe("(");
  });

  it("no acepta % ni ! sin un número delante", () => {
    expect(appendToken("", "%")).toBe("");
    expect(appendToken("5+", "%")).toBe("5+");
    expect(appendToken("5", "%")).toBe("5%");
  });
});

describe("toggleSign", () => {
  it("alterna el signo del número que se está escribiendo", () => {
    expect(toggleSign("")).toBe("−");
    expect(toggleSign("5")).toBe("−5");
    expect(toggleSign("−5")).toBe("5");
  });

  it("distingue el signo de la resta", () => {
    expect(toggleSign("8−3")).toBe("8+3");
    expect(toggleSign("8+3")).toBe("8−3");
    expect(toggleSign("8×3")).toBe("8×−3");
  });
});

describe("backspace", () => {
  it("borra las funciones de una pieza", () => {
    expect(backspace("2+sin(")).toBe("2+");
    expect(backspace("2+√(")).toBe("2+");
    expect(backspace("123")).toBe("12");
  });
});

describe("balanceParens", () => {
  it("cierra lo que falta", () => {
    expect(balanceParens("sin(2")).toBe("sin(2)");
    expect(balanceParens("1+1")).toBe("1+1");
  });
});
