// Reglas de edición de la expresión.
//
// Vive fuera del componente para poder probarlo sin React y para que
// `Calculator.jsx` no vuelva a ser un archivo de 800 líneas.

const OPERATORS = ["+", "−", "×", "÷", "^"];
const FUNCTION_TOKENS = ["sin(", "cos(", "tan(", "ln(", "log(", "√(", "abs("];
const SEGMENT_SPLIT = /[+\-−×÷^()%!]/;

export const OPERATOR_SET = new Set(OPERATORS);

/** Último número que se está escribiendo (lo que hay tras el último operador). */
export function currentSegment(expression) {
  return expression.split(SEGMENT_SPLIT).pop() ?? "";
}

function countOpenParens(expression) {
  let open = 0;
  for (const char of expression) {
    if (char === "(") open += 1;
    if (char === ")") open -= 1;
  }
  return open;
}

/**
 * Devuelve la expresión resultante de pulsar una tecla, o la misma expresión si
 * la pulsación no es válida en ese punto (así el botón nunca genera algo que el
 * evaluador no pueda leer).
 */
export function appendToken(expression, token) {
  const last = expression.slice(-1);
  const segment = currentSegment(expression);

  if (/^\d$/.test(token)) {
    // "007" no, pero "0.7" sí.
    if (segment === "0") return expression.slice(0, -1) + token;
    return expression + token;
  }

  if (token === ".") {
    if (segment.includes(".")) return expression;
    if (segment === "") return `${expression}0.`;
    return `${expression}.`;
  }

  if (OPERATOR_SET.has(token)) {
    // Un menos inicial es un signo, no una resta: permite escribir -5.
    if (expression === "") return token === "−" ? token : expression;
    if (last === "(") return token === "−" ? expression + token : expression;
    if (OPERATOR_SET.has(last)) {
      // "×−" es válido (multiplicar por un negativo); el resto se sustituye.
      if (token === "−" && ["×", "÷", "^"].includes(last)) return expression + token;
      return expression.slice(0, -1) + token;
    }
    return expression + token;
  }

  if (token === "(") {
    return expression + token;
  }

  if (token === ")") {
    if (countOpenParens(expression) <= 0) return expression;
    if (last === "(" || OPERATOR_SET.has(last) || expression === "") return expression;
    return expression + token;
  }

  // Posfijos: necesitan un valor delante.
  if (token === "%" || token === "!" || token === "^2") {
    if (!/[\d)π%!e]$/.test(expression)) return expression;
    return expression + token;
  }

  if (token === "π" || token === "e") {
    return expression + token;
  }

  if (FUNCTION_TOKENS.includes(token)) {
    return expression + token;
  }

  return expression + token;
}

/** Borra una tecla, entendiendo que "sin(" es una sola cosa. */
export function backspace(expression) {
  for (const token of FUNCTION_TOKENS) {
    if (expression.endsWith(token)) return expression.slice(0, -token.length);
  }
  return expression.slice(0, -1);
}

/** Cambia el signo del número que se está escribiendo. */
export function toggleSign(expression) {
  if (expression === "") return "−";

  const match = /(\d*\.?\d+)$/.exec(expression);
  if (!match) return expression;

  const start = match.index;
  const before = expression.slice(0, start);
  const number = match[1];

  if (before.endsWith("+")) {
    return `${before.slice(0, -1)}−${number}`;
  }

  if (before.endsWith("−")) {
    const head = before.slice(0, -1);
    // Si delante hay un operador o nada, ese "−" era el signo: lo quitamos.
    if (head === "" || /[+−×÷^(]$/.test(head)) return head + number;
    // Si no, era una resta: 5−3 pasa a 5+3.
    return `${head}+${number}`;
  }

  return `${before}−${number}`;
}

/** Cierra los paréntesis que falten, para que "=" no falle por un descuido. */
export function balanceParens(expression) {
  const missing = countOpenParens(expression);
  return missing > 0 ? expression + ")".repeat(missing) : expression;
}
