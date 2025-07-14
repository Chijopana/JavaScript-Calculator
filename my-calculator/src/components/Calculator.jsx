import React, { useState } from "react";

export default function Calculator() {
  const [input, setInput] = useState("");
  const [animateResult, setAnimateResult] = useState(false);

  // Formatea números con separador de miles
  const formatWithCommas = (num) => {
    if (!isNaN(num)) {
      return new Intl.NumberFormat("en-US").format(num);
    }
    return num;
  };
  
const [scientificMode, setScientificMode] = useState(false);

const toggleScientificMode = () => {
  setScientificMode((prev) => !prev);
};

  const handleButtonClick = (value) => {
    // Reiniciar input si hay error y el usuario empieza a escribir número o punto
    if (input === "Error") {
      if (/[0-9.]/.test(value)) {
        if (value === ".") {
          setInput("0.");
        } else {
          setInput(value);
        }
        setAnimateResult(false);
        return;
      } else {
        // No permitir operadores tras error
        return;
      }
    }

    if (input === "" && ["+", "*", "/", ".", "%"].includes(value)) return;

    const lastChar = input.slice(-1);
    if (
      ["+", "-", "*", "/", ".", "%"].includes(lastChar) &&
      ["+", "*", "/", ".", "%"].includes(value)
    )
      return;

    // Dividir el input en números actuales (separados por operadores)
    const parts = input.split(/[\+\-\*\/%]/);
    const currentNumber = parts[parts.length - 1];

    // Evitar múltiples ceros iniciales
    if (value === "0") {
      if (currentNumber === "0") return; // no más ceros si ya hay uno
    }

    // Si currentNumber es '0' y se intenta agregar otro número distinto de punto, reemplazar
    if (/^0$/.test(currentNumber) && value !== ".") {
      setInput((prev) => prev.slice(0, -1) + value);
      setAnimateResult(false);
      return;
    }

    // Evitar múltiples puntos decimales en un número
    if (value === ".") {
      if (currentNumber.includes(".")) return;
      if (currentNumber === "") {
        setInput((prev) => prev + "0.");
        setAnimateResult(false);
        return;
      }
    }

    setInput((prev) => prev + value);
    setAnimateResult(false);
  };

  const handleClear = () => {
    setInput("");
    setAnimateResult(false);
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
    setAnimateResult(false);
  };

  const handleEqual = () => {
    if (input === "") return;
    try {
      let expression = input.replace(/%/g, "/100");

      // eslint-disable-next-line no-eval
      let result = eval(expression);

      if (typeof result === "number" && !Number.isInteger(result)) {
        result = parseFloat(result.toFixed(6));
      }

      // Formatear resultado con separadores de miles
      const parts = String(result).split(".");
      parts[0] = formatWithCommas(parts[0]);
      const formattedResult = parts.join(".");

      setInput(formattedResult);
      setAnimateResult(true);
      setTimeout(() => setAnimateResult(false), 600);
    } catch {
      setInput("Error");
      setAnimateResult(true);
      setTimeout(() => setAnimateResult(false), 600);
    }
  };

  const handleScientificFunction = (func) => {
  try {
    let result;

    switch (func) {
      case "sin":
        result = Math.sin(toRadians(eval(input)));
        break;
      case "cos":
        result = Math.cos(toRadians(eval(input)));
        break;
      case "tan":
        result = Math.tan(toRadians(eval(input)));
        break;
      case "sqrt":
        result = Math.sqrt(eval(input));
        break;
      case "square":
        result = Math.pow(eval(input), 2);
        break;
      case "log":
        result = Math.log10(eval(input));
        break;
      case "ln":
        result = Math.log(eval(input));
        break;
      case "pi":
        result = Math.PI;
        break;
      case "e":
        result = Math.E;
        break;
      case "fact":
        result = factorial(eval(input));
        break;
      default:
        return;
    }

    if (typeof result === "number" && !Number.isInteger(result)) {
      result = parseFloat(result.toFixed(6));
    }

    const parts = String(result).split(".");
    parts[0] = formatWithCommas(parts[0]);
    const formattedResult = parts.join(".");

    setInput(formattedResult);
    setAnimateResult(true);
    setTimeout(() => setAnimateResult(false), 600);
  } catch {
    setInput("Error");
  }
};

const toRadians = (deg) => (deg * Math.PI) / 180;
const factorial = (n) => {
  if (n < 0) return "Error";
  if (n === 0) return 1;
  return n === 1 ? 1 : n * factorial(n - 1);
};

  
  return (
  <div className="bg-gray-900 rounded-3xl shadow-xl w-full max-w-md p-6 mx-auto">
    {/* Display */}
    <div
      className={`bg-gray-800 text-white text-right text-5xl p-5 rounded-2xl mb-6 font-mono break-words min-h-[90px] select-none transition-transform ${
        animateResult ? "scale-105" : ""
      }`}
      aria-live="polite"
    >
      {input || "0"}
    </div>

    {/* Botón para cambiar de modo */}
    <div className="flex justify-end mb-4">
      <button
        onClick={toggleScientificMode}
        className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded-xl shadow transition-colors duration-300"
      >
        {scientificMode ? "Modo Normal" : "Modo Científico"}
      </button>
    </div>

    {/* Contenedor con animación de transición */}
    <div
      className={`grid grid-cols-4 gap-3 mb-4 overflow-hidden transition-all duration-500 ease-in-out transform ${
        scientificMode
          ? "opacity-100 max-h-[500px] scale-100"
          : "opacity-0 max-h-0 scale-95 pointer-events-none"
      }`}
    >
      <button
        onClick={() => handleScientificFunction("sin")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
      >
        sin
      </button>
      <button
        onClick={() => handleScientificFunction("cos")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
      >
        cos
      </button>
      <button
        onClick={() => handleScientificFunction("tan")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
      >
        tan
      </button>
      <button
        onClick={() => handleScientificFunction("sqrt")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
      >
        √
      </button>
      <button
        onClick={() => handleScientificFunction("square")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
      >
        x²
      </button>
      <button
        onClick={() => handleScientificFunction("log")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
      >
        log
      </button>
      <button
        onClick={() => handleScientificFunction("ln")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
      >
        ln
      </button>
      <button
        onClick={() => handleScientificFunction("fact")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
      >
        n!
      </button>
      <button
        onClick={() => handleScientificFunction("pi")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
      >
        π
      </button>
      <button
        onClick={() => handleScientificFunction("e")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
      >
        e
      </button>
    </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-4">
        {/* Clear */}
        <button
          onClick={handleClear}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-5 shadow-md transition-colors"
          aria-label="Clear"
          title="Clear"
        >
          C
        </button>

        {/* Backspace */}
        <button
          onClick={handleBackspace}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-5 shadow-md transition-colors"
          aria-label="Backspace"
          title="Backspace"
        >
          ⌫
        </button>

        {/* Percent */}
        <button
          onClick={() => handleButtonClick("%")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl py-5 shadow-md transition-colors"
          aria-label="Percent"
          title="Percent"
        >
          %
        </button>

        {/* Divide */}
        <button
          onClick={() => handleButtonClick("/")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl py-5 shadow-md transition-colors"
          aria-label="Divide"
          title="Divide"
        >
          ÷
        </button>

        {/* Numbers 7-9 */}
        {["7", "8", "9"].map((num) => (
          <button
            key={num}
            onClick={() => handleButtonClick(num)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-xl py-5 shadow-md transition-colors"
            aria-label={num}
            title={num}
          >
            {num}
          </button>
        ))}

        {/* Multiply */}
        <button
          onClick={() => handleButtonClick("*")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl py-5 shadow-md transition-colors"
          aria-label="Multiply"
          title="Multiply"
        >
          ×
        </button>

        {/* Numbers 4-6 */}
        {["4", "5", "6"].map((num) => (
          <button
            key={num}
            onClick={() => handleButtonClick(num)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-xl py-5 shadow-md transition-colors"
            aria-label={num}
            title={num}
          >
            {num}
          </button>
        ))}

        {/* Minus */}
        <button
          onClick={() => handleButtonClick("-")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl py-5 shadow-md transition-colors"
          aria-label="Minus"
          title="Minus"
        >
          −
        </button>

        {/* Numbers 1-3 */}
        {["1", "2", "3"].map((num) => (
          <button
            key={num}
            onClick={() => handleButtonClick(num)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-xl py-5 shadow-md transition-colors"
            aria-label={num}
            title={num}
          >
            {num}
          </button>
        ))}

        {/* Plus */}
        <button
          onClick={() => handleButtonClick("+")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl py-5 shadow-md transition-colors"
          aria-label="Plus"
          title="Plus"
        >
          +
        </button>

        {/* Zero */}
        <button
          onClick={() => handleButtonClick("0")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-xl py-5 shadow-md transition-colors col-span-2"
          aria-label="0"
          title="0"
        >
          0
        </button>

        {/* Decimal */}
        <button
          onClick={() => handleButtonClick(".")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-xl py-5 shadow-md transition-colors"
          aria-label="Decimal point"
          title="Decimal point"
        >
          .
        </button>

        {/* Equal */}
        <button
          onClick={handleEqual}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl py-5 shadow-md transition-colors"
          aria-label="Equals"
          title="Equals"
        >
          =
        </button>
      </div>
    </div>

  );
}
