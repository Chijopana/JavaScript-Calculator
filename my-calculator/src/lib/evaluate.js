// Evaluador de expresiones aritméticas.
//
// Sustituye al `eval()` original: además del riesgo de seguridad, `eval` no
// permite dar mensajes de error útiles, reventaba con paréntesis desbalanceados
// y obligaba a trucos de reemplazo de texto que daban resultados incorrectos
// (por ejemplo "%" -> "/100" convertía 10%3 en 10/1003).
//
// Gramática (descenso recursivo):
//   expresion := termino (("+" | "-") termino)*
//   termino   := unario (("*" | "/") unario | unario)*  <- la última rama es la
//                                                          multiplicación
//                                                          implícita: 2π
//   unario    := ("-" | "+") unario | potencia
//   potencia  := posfijo ("^" unario)?                  <- asociativa a la
//                                                          derecha
//   posfijo   := primario ("%" | "!")*
//   primario  := numero | constante | funcion "(" expresion ")" | "(" expresion ")"

import { roundFloat } from "./format.js";

export class CalcError extends Error {
  constructor(message) {
    super(message);
    this.name = "CalcError";
  }
}

const CONSTANTS = {
  pi: Math.PI,
  e: Math.E,
};

const FUNCTION_NAMES = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "ln",
  "log",
  "sqrt",
  "cbrt",
  "abs",
]);

const NUMBER_RE = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/;
const IDENT_RE = /^[a-zA-Z]+/;
const OPERATORS = new Set(["+", "-", "*", "/", "^", "%", "!", "(", ")"]);

/** Pasa la notación "bonita" de la interfaz a la interna. */
export function normalize(expression) {
  return String(expression)
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/√/g, "sqrt")
    .replace(/π/g, "pi")
    .replace(/,/g, "")
    .replace(/\s+/g, "");
}

function tokenize(source) {
  const tokens = [];
  let index = 0;

  while (index < source.length) {
    const rest = source.slice(index);
    const char = source[index];

    if (/[\d.]/.test(char)) {
      const numberMatch = NUMBER_RE.exec(rest);
      if (!numberMatch) throw new CalcError("Hay un número mal escrito");
      const raw = numberMatch[0];
      const value = Number(raw);
      if (Number.isNaN(value)) throw new CalcError(`Número no válido: "${raw}"`);
      tokens.push({ type: "number", value });
      index += raw.length;
      continue;
    }

    const identMatch = IDENT_RE.exec(rest);
    if (identMatch) {
      tokens.push({ type: "ident", value: identMatch[0].toLowerCase() });
      index += identMatch[0].length;
      continue;
    }

    if (OPERATORS.has(char)) {
      tokens.push({ type: "op", value: char });
      index += 1;
      continue;
    }

    throw new CalcError(`No entiendo el símbolo "${char}"`);
  }

  return tokens;
}

function isOp(token, ...values) {
  return Boolean(token) && token.type === "op" && values.includes(token.value);
}

function startsPrimary(token) {
  if (!token) return false;
  if (token.type === "number" || token.type === "ident") return true;
  return isOp(token, "(");
}

function parse(tokens) {
  let position = 0;
  const peek = () => tokens[position];
  const advance = () => tokens[position++];

  function parseExpression() {
    let node = parseTerm();
    while (isOp(peek(), "+", "-")) {
      const op = advance().value;
      node = { type: "binary", op, left: node, right: parseTerm() };
    }
    return node;
  }

  function parseTerm() {
    let node = parseUnary();
    for (;;) {
      if (isOp(peek(), "*", "/")) {
        const op = advance().value;
        node = { type: "binary", op, left: node, right: parseUnary() };
        continue;
      }
      // Multiplicación implícita: "2π", "3(4+1)", "2sqrt(9)".
      if (startsPrimary(peek())) {
        node = { type: "binary", op: "*", left: node, right: parseUnary() };
        continue;
      }
      break;
    }
    return node;
  }

  function parseUnary() {
    if (isOp(peek(), "-", "+")) {
      const op = advance().value;
      return { type: "unary", op, arg: parseUnary() };
    }
    return parsePower();
  }

  function parsePower() {
    const base = parsePostfix();
    if (isOp(peek(), "^")) {
      advance();
      return { type: "binary", op: "^", left: base, right: parseUnary() };
    }
    return base;
  }

  function parsePostfix() {
    let node = parsePrimary();
    for (;;) {
      if (isOp(peek(), "%")) {
        advance();
        node = { type: "percent", arg: node };
        continue;
      }
      if (isOp(peek(), "!")) {
        advance();
        node = { type: "factorial", arg: node };
        continue;
      }
      break;
    }
    return node;
  }

  function parsePrimary() {
    const token = advance();
    if (!token) throw new CalcError("La expresión está incompleta");

    if (token.type === "number") return { type: "number", value: token.value };

    if (token.type === "ident") {
      if (token.value in CONSTANTS) {
        return { type: "number", value: CONSTANTS[token.value] };
      }
      if (FUNCTION_NAMES.has(token.value)) {
        if (!isOp(peek(), "(")) throw new CalcError(`Falta "(" después de ${token.value}`);
        advance();
        const arg = parseExpression();
        if (!isOp(peek(), ")")) throw new CalcError("Falta cerrar un paréntesis");
        advance();
        return { type: "call", name: token.value, arg };
      }
      throw new CalcError(`No reconozco "${token.value}"`);
    }

    if (isOp(token, "(")) {
      if (isOp(peek(), ")")) throw new CalcError("Los paréntesis están vacíos");
      const inner = parseExpression();
      if (!isOp(peek(), ")")) throw new CalcError("Falta cerrar un paréntesis");
      advance();
      return inner;
    }

    if (isOp(token, ")")) throw new CalcError("Sobra un paréntesis de cierre");

    throw new CalcError(`El operador "${token.value}" está fuera de lugar`);
  }

  const ast = parseExpression();
  if (position < tokens.length) {
    throw new CalcError("La expresión no es válida");
  }
  return ast;
}

function toRadians(value, angleMode) {
  return angleMode === "deg" ? (value * Math.PI) / 180 : value;
}

function factorial(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new CalcError("El factorial sólo existe para enteros positivos");
  }
  if (n > 170) throw new CalcError("El factorial es demasiado grande");
  let accumulator = 1;
  for (let i = 2; i <= n; i += 1) accumulator *= i;
  return accumulator;
}

function applyFunction(name, value, angleMode) {
  switch (name) {
    case "sin":
      return Math.sin(toRadians(value, angleMode));
    case "cos":
      return Math.cos(toRadians(value, angleMode));
    case "tan": {
      if (angleMode === "deg" && (((value % 180) + 180) % 180) === 90) {
        throw new CalcError("La tangente no existe en 90 grados");
      }
      return Math.tan(toRadians(value, angleMode));
    }
    case "asin":
    case "acos": {
      if (value < -1 || value > 1) {
        throw new CalcError(`${name} sólo acepta valores entre -1 y 1`);
      }
      const radians = name === "asin" ? Math.asin(value) : Math.acos(value);
      return angleMode === "deg" ? (radians * 180) / Math.PI : radians;
    }
    case "atan": {
      const radians = Math.atan(value);
      return angleMode === "deg" ? (radians * 180) / Math.PI : radians;
    }
    case "ln":
      if (value <= 0) throw new CalcError("El logaritmo necesita un número mayor que 0");
      return Math.log(value);
    case "log":
      if (value <= 0) throw new CalcError("El logaritmo necesita un número mayor que 0");
      return Math.log10(value);
    case "sqrt":
      if (value < 0) throw new CalcError("No existe la raíz cuadrada de un número negativo");
      return Math.sqrt(value);
    case "cbrt":
      return Math.cbrt(value);
    case "abs":
      return Math.abs(value);
    default:
      throw new CalcError(`Función desconocida: ${name}`);
  }
}

function evaluateNode(node, angleMode) {
  switch (node.type) {
    case "number":
      return node.value;

    case "unary": {
      const value = evaluateNode(node.arg, angleMode);
      return node.op === "-" ? -value : value;
    }

    // Un "%" suelto es simplemente "dividir entre 100".
    case "percent":
      return evaluateNode(node.arg, angleMode) / 100;

    case "factorial":
      return factorial(evaluateNode(node.arg, angleMode));

    case "call":
      return applyFunction(node.name, evaluateNode(node.arg, angleMode), angleMode);

    case "binary": {
      const left = evaluateNode(node.left, angleMode);

      // "200 + 10%" son 220, no 200.1: en sumas y restas el porcentaje se
      // calcula sobre el operando de la izquierda, como en cualquier
      // calculadora de bolsillo.
      if ((node.op === "+" || node.op === "-") && node.right.type === "percent") {
        const percent = evaluateNode(node.right.arg, angleMode);
        const delta = (left * percent) / 100;
        return node.op === "+" ? left + delta : left - delta;
      }

      const right = evaluateNode(node.right, angleMode);
      switch (node.op) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          if (right === 0) throw new CalcError("No se puede dividir entre 0");
          return left / right;
        case "^": {
          const result = left ** right;
          if (Number.isNaN(result)) throw new CalcError("Esa potencia no está definida");
          return result;
        }
        default:
          throw new CalcError(`Operador desconocido: ${node.op}`);
      }
    }

    default:
      throw new CalcError("La expresión no es válida");
  }
}

/** Añade los paréntesis de cierre que falten al pulsar "=". */
export function autoCloseParens(expression) {
  let open = 0;
  for (const char of String(expression)) {
    if (char === "(") open += 1;
    if (char === ")") open -= 1;
  }
  return open > 0 ? expression + ")".repeat(open) : expression;
}

/**
 * Evalúa una expresión. Lanza `CalcError` con un mensaje en español cuando algo
 * no cuadra, para que la interfaz pueda explicarlo en vez de mostrar un "Error"
 * a secas que además borraba lo que el usuario había escrito.
 */
export function evaluate(expression, { angleMode = "deg" } = {}) {
  const normalized = normalize(expression);
  if (!normalized) throw new CalcError("No hay nada que calcular");

  const ast = parse(tokenize(normalized));
  const result = evaluateNode(ast, angleMode);

  if (Number.isNaN(result)) throw new CalcError("El resultado no es un número");
  if (!Number.isFinite(result)) throw new CalcError("El resultado es demasiado grande");

  return roundFloat(result);
}

/** Versión silenciosa, para la vista previa en vivo. */
export function tryEvaluate(expression, options) {
  try {
    return { value: evaluate(expression, options), error: null };
  } catch (error) {
    return { value: null, error: error instanceof CalcError ? error.message : "Error" };
  }
}
