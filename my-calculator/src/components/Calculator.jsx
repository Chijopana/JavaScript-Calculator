import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEYS = {
  memory: "calc_memory",
  history: "calc_history",
  last: "calc_last",
  theme: "calc_theme",
};

const unitGroups = {
  length: ["m", "cm", "km", "mm", "milla", "pulgada", "pie", "yarda"],
  temperature: ["C", "F", "K"],
  weight: ["kg", "g", "mg", "lb", "oz", "t"],
  volume: ["L", "ml", "gal_US", "gal_UK", "pt", "taza", "fl_oz"],
  speed: ["m/s", "km/h", "mph", "nudos", "ft/s"],
};

const categoryLabels = {
  length: "Longitud",
  temperature: "Temperatura",
  weight: "Peso",
  volume: "Volumen",
  speed: "Velocidad",
};

const unitLabels = {
  m: "m",
  cm: "cm",
  km: "km",
  mm: "mm",
  milla: "milla",
  pulgada: "pulgada",
  pie: "pie",
  yarda: "yarda",
  C: "°C",
  F: "°F",
  K: "K",
  kg: "kg",
  g: "g",
  mg: "mg",
  lb: "lb",
  oz: "oz",
  t: "t",
  L: "L",
  ml: "ml",
  gal_US: "galón US",
  gal_UK: "galón UK",
  pt: "pinta",
  taza: "taza",
  fl_oz: "fl oz",
  "m/s": "m/s",
  "km/h": "km/h",
  mph: "mph",
  nudos: "nudos",
  "ft/s": "ft/s",
};

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  const safe = Number(value);
  if (!Number.isFinite(safe)) return "Error";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(safe);
}

function isNumericInput(value) {
  return /^\d*(\.\d*)?$/.test(value);
}

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function evaluateExpression(expression) {
  if (!expression.trim()) return null;
  const prepared = expression
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/%/g, "/100")
    .replace(/π/g, "Math.PI")
    .replace(/\be\b/g, "Math.E");

  const result = eval(prepared);
  if (!Number.isFinite(result)) return null;
  return result;
}

function getPendingParts(expression) {
  const match = expression.match(/^(.*?)([+\-×÷*/%])([^+\-×÷*/%]*)$/);
  if (!match) return { left: "", op: "", right: expression };
  return { left: match[1], op: match[2], right: match[3] };
}

function convertValue(category, from, to, rawValue) {
  const value = Number(String(rawValue).replace(/,/g, ""));
  if (!Number.isFinite(value)) return null;

  if (category === "length") {
    const toMeters = {
      m: 1,
      cm: 0.01,
      km: 1000,
      mm: 0.001,
      milla: 1609.344,
      pulgada: 0.0254,
      pie: 0.3048,
      yarda: 0.9144,
    };
    return (value * toMeters[from]) / toMeters[to];
  }

  if (category === "temperature") {
    const toCelsius = (v, unit) => {
      if (unit === "C") return v;
      if (unit === "F") return ((v - 32) * 5) / 9;
      return v - 273.15;
    };
    const fromCelsius = (v, unit) => {
      if (unit === "C") return v;
      if (unit === "F") return (v * 9) / 5 + 32;
      return v + 273.15;
    };
    return fromCelsius(toCelsius(value, from), to);
  }

  if (category === "weight") {
    const toKg = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, t: 1000 };
    return (value * toKg[from]) / toKg[to];
  }

  if (category === "volume") {
    const toL = {
      L: 1,
      ml: 0.001,
      gal_US: 3.78541,
      gal_UK: 4.54609,
      pt: 0.473176,
      taza: 0.236588,
      fl_oz: 0.0295735,
    };
    return (value * toL[from]) / toL[to];
  }

  if (category === "speed") {
    const toMs = { "m/s": 1, "km/h": 0.277778, mph: 0.44704, nudos: 0.51444, "ft/s": 0.3048 };
    return (value * toMs[from]) / toMs[to];
  }

  return null;
}

function ConversionPanel({ theme, onLiveResult, onResultCopy }) {
  const [category, setCategory] = useState("length");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("cm");
  const [value, setValue] = useState("1");
  const [error, setError] = useState("");
  const onLiveResultRef = useRef(onLiveResult);

  const options = unitGroups[category];

  useEffect(() => {
    onLiveResultRef.current = onLiveResult;
  }, [onLiveResult]);

  useEffect(() => {
    const nextOptions = unitGroups[category];
    setFrom(nextOptions[0]);
    setTo(nextOptions[1] || nextOptions[0]);
    setValue("1");
  }, [category]);

  const derived = useMemo(() => {
    const raw = String(value).replace(/,/g, "");
    if (!isNumericInput(raw)) return { error: "Introduce un número válido" };
    const forward = convertValue(category, from, to, raw);
    const backward = convertValue(category, to, from, raw);
    if (forward === null || backward === null) return { error: "Error" };
    return {
      forward,
      backward,
      raw,
      valueNumber: Number(raw),
    };
  }, [category, from, to, value]);

  useEffect(() => {
    if (derived.error) {
      setError(derived.error);
      onLiveResultRef.current({ error: derived.error });
      return;
    }
    setError("");
    onLiveResultRef.current({
      expression: `${formatNumber(derived.valueNumber)} ${unitLabels[from]} → ${unitLabels[to]}`,
      result: `${formatNumber(derived.forward)} ${unitLabels[to]}`,
      reverse: `${formatNumber(derived.backward)} ${unitLabels[from]}`,
      kind: "conversion",
    });
  }, [derived, from, to]);

  const handleInputChange = (event) => {
    const next = event.target.value.replace(/,/g, "");
    if (next === "" || isNumericInput(next)) {
      setValue(next);
    }
  };

  const handleKeyDown = (event) => {
    const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (allowed.includes(event.key)) return;
    if (/^\d$/.test(event.key)) return;
    if (event.key === "." && !String(value).includes(".")) return;
    event.preventDefault();
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${theme === "dark" ? "border-slate-700 bg-[#2d3548] text-white" : "border-slate-200 bg-white text-slate-900"}`}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_0.9fr_0.9fr]">
        <label className="flex flex-col gap-1 md:col-span-3">
          <span className="text-xs uppercase tracking-[0.2em] opacity-70">Categoría</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={`w-full rounded-xl border px-3 py-3 text-lg outline-none transition ${theme === "dark" ? "border-slate-600 bg-[#1a1f2e] text-white" : "border-slate-300 bg-white text-slate-900"}`}
          >
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.2em] opacity-70">Input</span>
          <input
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            inputMode="decimal"
            placeholder="1.5"
            className={`w-full rounded-xl border px-3 py-3 text-lg outline-none transition ${theme === "dark" ? "border-slate-600 bg-[#1a1f2e] text-white placeholder:text-slate-400" : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-500"}`}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.2em] opacity-70">From</span>
          <select
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className={`w-full rounded-xl border px-3 py-3 text-lg outline-none transition ${theme === "dark" ? "border-slate-600 bg-[#1a1f2e] text-white" : "border-slate-300 bg-white text-slate-900"}`}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                  {unitLabels[option] || option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.2em] opacity-70">To</span>
          <select
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className={`w-full rounded-xl border px-3 py-3 text-lg outline-none transition ${theme === "dark" ? "border-slate-600 bg-[#1a1f2e] text-white" : "border-slate-300 bg-white text-slate-900"}`}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                  {unitLabels[option] || option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-slate-400/40 p-4">
        {error ? (
          <div className="text-lg font-semibold text-red-500">Error</div>
        ) : (
          <>
              <div className="text-sm opacity-70">Resultado en tiempo real</div>
            <button
              type="button"
                onClick={() => derived.forward !== undefined && onResultCopy(`${formatNumber(derived.forward)} ${unitLabels[to]}`)}
              className="mt-2 block w-full text-left text-3xl font-bold tracking-tight"
              title="Copiar resultado"
            >
                {formatNumber(derived.forward)} {unitLabels[to]}
            </button>
              <div className="mt-2 text-sm opacity-75">Invertido: {formatNumber(derived.backward)} {unitLabels[from]}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Calculator() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("standard");
  const [theme, setTheme] = useState("dark");
  const [memory, setMemory] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayError, setDisplayError] = useState("");
  const [pendingDisplay, setPendingDisplay] = useState({ left: "", op: "", right: "" });
  const [calcStatus, setCalcStatus] = useState(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    const storedMemory = localStorage.getItem(STORAGE_KEYS.memory);
    const storedHistory = localStorage.getItem(STORAGE_KEYS.history);
    const storedLast = localStorage.getItem(STORAGE_KEYS.last);

    if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
    if (storedMemory !== null) setMemory(Number(storedMemory));
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch {
        setHistory([]);
      }
    }
    if (storedLast) {
      try {
        const parsed = JSON.parse(storedLast);
        if (parsed?.input) setInput(parsed.input);
      } catch {
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    document.body.style.background = theme === "dark" ? "#1a1f2e" : "#f5f5f5";
    document.body.style.color = theme === "dark" ? "#ffffff" : "#1a1a1a";
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.memory, memory === null ? "" : String(memory));
  }, [memory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    setPendingDisplay(getPendingParts(input));
  }, [input]);

  const themeClasses = theme === "dark"
    ? {
        shell: "bg-[#1a1f2e] text-white",
        panel: "bg-[#2d3548] text-white border-slate-700",
        display: "bg-[#2d3548] text-white border-slate-700",
        displaySecondary: "text-slate-300",
        input: "bg-[#1a1f2e] text-white border-slate-600 placeholder:text-slate-400",
        select: "bg-[#1a1f2e] text-white border-slate-600",
        number: "bg-white text-[#1a1a1a] border-[#ddd] hover:bg-slate-50",
        operator: "bg-sky-500 text-white border-sky-400 hover:bg-sky-400",
        danger: "bg-sky-500 text-white border-sky-400 hover:bg-sky-400",
        accent: "bg-sky-500 text-white border-sky-400 hover:bg-sky-400",
        memoryActive: "bg-sky-400 text-slate-900 border-sky-200",
      }
    : {
        shell: "bg-[#f5f5f5] text-[#1a1a1a]",
        panel: "bg-white text-[#1a1a1a] border-slate-300",
        display: "bg-white text-[#000000] border-slate-300",
        displaySecondary: "text-slate-600",
        input: "bg-white text-[#1a1a1a] border-slate-300 placeholder:text-slate-500",
        select: "bg-white text-[#1a1a1a] border-slate-300",
        number: "bg-white text-[#000000] border-[#ccc] hover:bg-slate-100",
        operator: "bg-sky-400 text-white border-sky-400 hover:bg-sky-300",
        danger: "bg-sky-400 text-white border-sky-400 hover:bg-sky-300",
        accent: "bg-sky-400 text-white border-sky-400 hover:bg-sky-300",
        memoryActive: "bg-sky-100 text-sky-900 border-sky-300",
      };

  const pushHistory = (entry) => {
    setHistory((prev) => [{ ...entry, id: Date.now() + Math.random() }, ...prev].slice(0, 60));
  };

  const copyText = async (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 900);
      }
    } catch {
      setCopied(false);
    }
  };

  const handlePressFeedback = () => {
    window.clearTimeout(handlePressFeedback.timer);
    handlePressFeedback.timer = window.setTimeout(() => {}, 100);
  };

  const handleButtonClick = (value) => {
    handlePressFeedback(value);

    if (input === "Error") {
      if (/^\d$|\.$/.test(value)) {
        setInput(value === "." ? "0." : value);
        setDisplayError("");
      }
      return;
    }

    if (value === ".") {
      const current = input.split(/[+\-×÷*/()%]/).pop();
      if (current.includes(".")) return;
      if (!current) {
        setInput((prev) => `${prev}0.`);
        return;
      }
    }

    if (/^[0-9]$/.test(value)) {
      const current = input.split(/[+\-×÷*/()%]/).pop();
      if (current === "0") {
        setInput((prev) => prev.slice(0, -1) + value);
        return;
      }
    }

    const last = input.slice(-1);
    const operators = ["+", "-", "×", "÷", "*", "/", "%"];
    if (!input && operators.includes(value)) return;
    if (operators.includes(last) && operators.includes(value)) return;

    setInput((prev) => prev + value);
    setDisplayError("");
  };

  const handleClear = () => {
    handlePressFeedback("C");
    setInput("");
    setDisplayError("");
    setPendingDisplay({ left: "", op: "", right: "" });
  };

  const handleBackspace = () => {
    handlePressFeedback("DEL");
    setInput((prev) => prev.slice(0, -1));
  };

  const handleEqual = () => {
    const result = evaluateExpression(input);
    if (result === null) {
      setInput("Error");
      setDisplayError("Error");
      return;
    }

    const formatted = formatNumber(result);
    setInput(String(formatted).replace(/,/g, ""));
    pushHistory({
      kind: "calc",
      expr: input,
      result: formatted,
      label: `${input} = ${formatted}`,
      unit: "",
    });
    localStorage.setItem(STORAGE_KEYS.last, JSON.stringify({ input: String(formatted) }));
    copyText(String(formatted));
  };

  const handleScientificFunction = (fn) => {
    handlePressFeedback(fn);
    const numeric = evaluateExpression(input);
    if (numeric === null) {
      setInput("Error");
      setDisplayError("Error");
      return;
    }

    let result = null;
    if (fn === "sin") result = Math.sin(toRadians(numeric));
    if (fn === "cos") result = Math.cos(toRadians(numeric));
    if (fn === "tan") result = Math.tan(toRadians(numeric));
    if (fn === "sqrt") result = numeric < 0 ? null : Math.sqrt(numeric);
    if (fn === "square") result = numeric ** 2;
    if (fn === "log") result = numeric <= 0 ? null : Math.log10(numeric);
    if (fn === "ln") result = numeric <= 0 ? null : Math.log(numeric);
    if (fn === "pi") result = Math.PI;
    if (fn === "e") result = Math.E;

    if (result === null || !Number.isFinite(result)) {
      setInput("Error");
      setDisplayError("Error");
      return;
    }

    const formatted = formatNumber(result);
    setInput(String(formatted).replace(/,/g, ""));
    pushHistory({
      kind: "calc",
      expr: `${fn}(${input})`,
      result: formatted,
      label: `${fn}(${input}) = ${formatted}`,
      unit: "",
    });
    copyText(String(formatted));
  };

  const handleMemoryAdd = () => {
    const numeric = evaluateExpression(input);
    if (numeric === null) return;
    const next = (memory ?? 0) + numeric;
    setMemory(next);
  };

  const handleMemorySub = () => {
    const numeric = evaluateExpression(input);
    if (numeric === null) return;
    const next = (memory ?? 0) - numeric;
    setMemory(next);
  };

  const handleMemoryRecall = () => {
    if (memory === null) return;
    setInput(String(memory));
    handlePressFeedback("MR");
  };

  const handleMemoryClear = () => setMemory(null);

  const handleHistoryCopy = (value) => copyText(String(value));

  const handleHistoryUse = (entry) => {
    if (entry.kind === "conversion" && entry.value !== undefined) {
      setMode("conversion");
      return;
    }
    setInput(String(entry.result).replace(/,/g, ""));
  };

  const onGlobalKeyDown = (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (mode === "conversion") return;
    const key = event.key;
    if (/^\d$/.test(key)) return handleButtonClick(key);
    if (key === ".") return handleButtonClick(".");
    if (["+", "-", "*", "/", "%"].includes(key)) return handleButtonClick(key === "*" ? "×" : key === "/" ? "÷" : key);
    if (key === "Enter") {
      event.preventDefault();
      handleEqual();
      return;
    }
    if (key === "Backspace") return handleBackspace();
    if (key === "Delete" || key === "Escape") return handleClear();
  };

  useEffect(() => {
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  });

  const buttonClass = (kind) =>
    [
      "rounded-2xl border px-3 py-4 font-semibold transition-all duration-100 active:scale-95 active:brightness-110 focus:outline-none focus:ring-2 focus:ring-sky-400/70",
      kind === "number" ? themeClasses.number : "",
      kind === "operator" ? themeClasses.operator : "",
      kind === "danger" ? themeClasses.danger : "",
      kind === "accent" ? themeClasses.accent : "",
      kind === "memory" && memory !== null ? themeClasses.memoryActive : themeClasses.operator,
      kind === "memory" && memory === null ? themeClasses.operator : "",
    ].join(" ");

  const buttonTextStyle = (kind) => {
    if (kind === "number") {
      return { color: theme === "dark" ? "#1a1a1a" : "#000000" };
    }
    if (kind === "operator" || kind === "danger" || kind === "accent" || kind === "memory") {
      return { color: "#ffffff" };
    }
    return undefined;
  };

  const memoryTooltip = memory === null ? "Sin memoria guardada" : `Memoria: ${formatNumber(memory)}`;

  return (
    <div className={`min-h-screen w-full ${themeClasses.shell}`}>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center p-4 md:p-8">
        <div className={`relative w-full overflow-hidden rounded-[2rem] border shadow-2xl ${themeClasses.panel}`}>
          <div className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setMode("standard")} className={buttonClass(mode === "standard" ? "accent" : "operator")} style={buttonTextStyle(mode === "standard" ? "accent" : "operator")}>ESTÁNDAR</button>
                <button onClick={() => setMode("scientific")} className={buttonClass(mode === "scientific" ? "accent" : "operator")} style={buttonTextStyle(mode === "scientific" ? "accent" : "operator")}>CIENTÍFICA</button>
                <button onClick={() => setMode("conversion")} className={buttonClass(mode === "conversion" ? "accent" : "operator")} style={buttonTextStyle(mode === "conversion" ? "accent" : "operator")}>CONVERSIÓN</button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                  className={buttonClass("operator")}
                  style={buttonTextStyle("operator")}
                  aria-label="Cambiar tema"
                  title="Cambiar tema"
                >
                  {theme === "dark" ? "🌙" : "☀️"}
                </button>
                <button onClick={() => setShowHistory((prev) => !prev)} className={buttonClass("operator")} style={buttonTextStyle("operator")}>Historial</button>
                <button onClick={handleMemoryAdd} className={buttonClass("memory")} style={buttonTextStyle("memory")}>M+</button>
                <button onClick={handleMemorySub} className={buttonClass("memory")} style={buttonTextStyle("memory")}>M-</button>
                <button onClick={handleMemoryRecall} className={`${buttonClass("memory")} ${memory !== null ? "bg-sky-400 text-slate-900 border-sky-200" : ""}`} style={buttonTextStyle("memory")} title={memoryTooltip}>
                  MR
                </button>
                <button onClick={handleMemoryClear} className={buttonClass("danger")} style={buttonTextStyle("danger")}>MC</button>
              </div>
            </div>

            <div className={`rounded-3xl border p-5 shadow-inner ${themeClasses.display}`} onClick={() => input && copyText(input)} role="button" tabIndex={0} title="Click para copiar resultado">
              <div className={`mb-2 text-sm uppercase tracking-[0.2em] ${themeClasses.displaySecondary}`}>{mode.toUpperCase()}</div>
              <div className="flex min-h-[88px] flex-col justify-center">
                <div className={`min-h-[24px] text-right text-sm ${themeClasses.displaySecondary}`}>
                  {pendingDisplay.left ? `${pendingDisplay.left} ${pendingDisplay.op}` : displayError || ""}
                </div>
                <div className={`text-right text-4xl font-bold leading-tight md:text-6xl ${theme === "dark" ? "text-white" : "text-black"}`}>
                  {mode === "conversion" && calcStatus?.error
                    ? "Error"
                    : mode === "conversion" && calcStatus?.result
                      ? calcStatus.result
                      : input || "0"}
                </div>
                {mode === "conversion" && calcStatus?.reverse ? (
                  <div className={`mt-2 text-right text-sm ${themeClasses.displaySecondary}`}>{calcStatus.reverse}</div>
                ) : null}
              </div>
              {copied ? <div className="mt-2 text-right text-xs text-emerald-500">Copiado</div> : null}
            </div>

            {mode === "conversion" ? (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <ConversionPanel
                  theme={theme}
                  onLiveResult={(status) => {
                    setCalcStatus(status);
                    if (!status.error) {
                      pushHistory({
                        kind: "conversion",
                        expr: status.expression,
                        result: status.result,
                        reverse: status.reverse,
                        label: `${status.expression} = ${status.result}`,
                        unit: status.result?.split(" ").slice(-1)[0] || "",
                      });
                    }
                  }}
                  onResultCopy={(text) => copyText(text)}
                />

                <div className={`rounded-2xl border p-4 ${themeClasses.panel}`}>
                  <div className="mb-3 text-sm uppercase tracking-[0.2em] opacity-70">Teclado</div>
                  <div className="grid grid-cols-3 gap-3">
                    {["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "C", "="]
                      .map((label) => {
                        if (label === "C") {
                          return (
                            <button key={label} onClick={handleClear} className={buttonClass("danger")} style={buttonTextStyle("danger")}>
                              C
                            </button>
                          );
                        }
                        if (label === "=") {
                          return (
                            <button key={label} onClick={handleEqual} className={buttonClass("accent")} style={buttonTextStyle("accent")}>
                              =
                            </button>
                          );
                        }
                        const kind = label === "." || /^\d$/.test(label) ? "number" : "operator";
                        return (
                          <button
                            key={label}
                            onClick={() => handleButtonClick(label)}
                            className={buttonClass(kind)}
                            style={buttonTextStyle(kind)}
                          >
                            {label}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {mode === "scientific" ? (
                  <div className={`grid grid-cols-4 gap-3 rounded-2xl border p-4 ${themeClasses.panel}`}>
                    {["(", ")", "π", "e", "sin", "cos", "tan", "sqrt", "x²", "log", "ln", "%"].map((label) => (
                      <button
                        key={label}
                        onClick={() => {
                          if (label === "π") return handleButtonClick("π");
                          if (label === "e") return handleButtonClick("e");
                          if (label === "(") return handleButtonClick("(");
                          if (label === ")") return handleButtonClick(")");
                          return handleScientificFunction(label === "x²" ? "square" : label);
                        }}
                        className={buttonClass("operator")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : null}

                {mode !== "conversion" ? (
                  <div className="grid grid-cols-4 gap-3">
                    <button onClick={handleClear} className={buttonClass("danger")} style={buttonTextStyle("danger")}>
                      C
                    </button>
                    <button onClick={handleBackspace} className={buttonClass("danger")} style={buttonTextStyle("danger")}>
                      ⌫
                    </button>
                    <button onClick={() => handleButtonClick("%")} className={buttonClass("operator")} style={buttonTextStyle("operator")}>%</button>
                    <button onClick={() => handleButtonClick("÷")} className={buttonClass("operator")} style={buttonTextStyle("operator")}>÷</button>

                    {["7", "8", "9"].map((label) => (
                      <button key={label} onClick={() => handleButtonClick(label)} className={buttonClass("number")} style={buttonTextStyle("number")}>
                        {label}
                      </button>
                    ))}
                    <button onClick={() => handleButtonClick("×")} className={buttonClass("operator")} style={buttonTextStyle("operator")}>×</button>

                    {["4", "5", "6"].map((label) => (
                      <button key={label} onClick={() => handleButtonClick(label)} className={buttonClass("number")} style={buttonTextStyle("number")}>
                        {label}
                      </button>
                    ))}
                    <button onClick={() => handleButtonClick("-")} className={buttonClass("operator")} style={buttonTextStyle("operator")}>−</button>

                    {["1", "2", "3"].map((label) => (
                      <button key={label} onClick={() => handleButtonClick(label)} className={buttonClass("number")} style={buttonTextStyle("number")}>
                        {label}
                      </button>
                    ))}
                    <button onClick={() => handleButtonClick("+")} className={buttonClass("operator")} style={buttonTextStyle("operator")}>+</button>

                    <button onClick={() => handleButtonClick("0")} className={`${buttonClass("number")} col-span-2`} style={buttonTextStyle("number")}>
                      0
                    </button>
                    <button onClick={() => handleButtonClick(".")} className={buttonClass("number")} style={buttonTextStyle("number")}>
                      .
                    </button>
                    <button onClick={handleEqual} className={buttonClass("accent")} style={buttonTextStyle("accent")}>
                      =
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {showHistory ? (
            <aside className={`absolute inset-y-0 right-0 w-full max-w-md border-l p-4 shadow-2xl ${themeClasses.panel}`}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">Historial</h3>
                <button onClick={() => setShowHistory(false)} className={buttonClass("operator")}>
                  Cerrar
                </button>
              </div>
              <div className="mt-4 space-y-3 overflow-auto pr-1" style={{ maxHeight: "calc(100vh - 140px)" }}>
                {history.length === 0 ? (
                  <div className="text-sm opacity-70">No hay entradas todavía.</div>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-slate-300/30 p-3">
                      <div className="text-sm opacity-80">{entry.label}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button onClick={() => handleHistoryUse(entry)} className={buttonClass("accent")}>
                          Usar
                        </button>
                        <button onClick={() => handleHistoryCopy(entry.result)} className={buttonClass("operator")}>
                          Copiar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}