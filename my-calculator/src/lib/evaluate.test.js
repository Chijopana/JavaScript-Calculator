import { describe, expect, it } from "vitest";
import { CalcError, autoCloseParens, evaluate } from "./evaluate.js";

describe("aritmética básica", () => {
  it("respeta la precedencia de operadores", () => {
    expect(evaluate("2+3*4")).toBe(14);
    expect(evaluate("(2+3)*4")).toBe(20);
    expect(evaluate("2+3×4")).toBe(14);
  });

  it("corrige el ruido de coma flotante", () => {
    expect(evaluate("0.1+0.2")).toBe(0.3);
    expect(evaluate("1.1*3")).toBe(3.3);
  });

  it("acepta números negativos y el signo unario", () => {
    expect(evaluate("-5+2")).toBe(-3);
    expect(evaluate("2*-3")).toBe(-6);
    expect(evaluate("-2^2")).toBe(-4);
  });

  it("eleva de derecha a izquierda", () => {
    expect(evaluate("2^3^2")).toBe(512);
  });

  it("entiende la multiplicación implícita", () => {
    expect(evaluate("3(4+1)")).toBe(15);
    expect(evaluate("2π")).toBeCloseTo(2 * Math.PI, 10);
  });
});

describe("porcentajes", () => {
  // El código anterior reemplazaba "%" por "/100" con un replace de texto:
  // "200+10%" daba 200.1 y "10%3" se convertía en "10/1003".
  it("suma y resta el porcentaje sobre el operando de la izquierda", () => {
    expect(evaluate("200+10%")).toBe(220);
    expect(evaluate("100-20%")).toBe(80);
  });

  it("un porcentaje suelto es una división entre 100", () => {
    expect(evaluate("50%")).toBe(0.5);
    expect(evaluate("10%*3")).toBe(0.3);
  });
});

describe("funciones científicas", () => {
  it("trabaja en grados por defecto", () => {
    expect(evaluate("sin(90)")).toBe(1);
    expect(evaluate("cos(0)")).toBe(1);
  });

  it("acepta radianes", () => {
    expect(evaluate("sin(π/2)", { angleMode: "rad" })).toBe(1);
  });

  it("calcula raíces, logaritmos y factoriales", () => {
    expect(evaluate("√(9)")).toBe(3);
    expect(evaluate("log(100)")).toBe(2);
    expect(evaluate("ln(e)")).toBe(1);
    expect(evaluate("5!")).toBe(120);
  });
});

describe("errores", () => {
  const casos = [
    ["5/0", "No se puede dividir entre 0"],
    ["(2+3", "Falta cerrar un paréntesis"],
    ["√(-1)", "No existe la raíz cuadrada de un número negativo"],
    ["log(0)", "El logaritmo necesita un número mayor que 0"],
    ["tan(90)", "La tangente no existe en 90 grados"],
    ["5+", "La expresión está incompleta"],
    ["", "No hay nada que calcular"],
  ];

  it.each(casos)("%s lanza un CalcError explicativo", (entrada, mensaje) => {
    expect(() => evaluate(entrada)).toThrow(CalcError);
    expect(() => evaluate(entrada)).toThrow(mensaje);
  });

  it("no cuelga ni ejecuta código arbitrario", () => {
    // Con eval() esto era código ejecutable.
    expect(() => evaluate("alert(1)")).toThrow(CalcError);
    expect(() => evaluate("window.location")).toThrow(CalcError);
  });
});

describe("autoCloseParens", () => {
  it("cierra lo que falta y deja en paz lo equilibrado", () => {
    expect(autoCloseParens("sin(2")).toBe("sin(2)");
    expect(autoCloseParens("((1+2")).toBe("((1+2))");
    expect(autoCloseParens("(1+2)")).toBe("(1+2)");
  });
});
