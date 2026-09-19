import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Display from "./Display.jsx";
import Keypad from "./Keypad.jsx";
import ConverterPanel from "./ConverterPanel.jsx";
import HistoryDrawer from "./HistoryDrawer.jsx";
import Key from "./Key.jsx";
import { HistoryIcon, MonitorIcon, MoonIcon, SunIcon } from "./icons.jsx";

import { cx } from "../lib/cx.js";
import { formatNumber, toEditableString } from "../lib/format.js";
import { CalcError, evaluate, tryEvaluate } from "../lib/evaluate.js";
import { appendToken, backspace, balanceParens, toggleSign } from "../lib/expressionInput.js";
import { STORAGE_KEYS } from "../lib/storage.js";
import { usePersistentState } from "../hooks/usePersistentState.js";
import { useTheme } from "../hooks/useTheme.js";
import { useClipboard } from "../hooks/useClipboard.js";

const MODES = [
  { id: "standard", label: "Estándar" },
  { id: "scientific", label: "Científica" },
  { id: "conversion", label: "Conversión" },
];

const MAX_HISTORY = 50;

// Teclas físicas que empiezan un número o una función nueva tras un "=".
const KEYBOARD_OPERATORS = { "*": "×", x: "×", "/": "÷", "-": "−", "+": "+", "^": "^" };

const THEME_META = {
  system: { Icon: MonitorIcon, label: "Tema del sistema" },
  light: { Icon: SunIcon, label: "Tema claro" },
  dark: { Icon: MoonIcon, label: "Tema oscuro" },
};

export default function Calculator() {
  const { theme, cycleTheme } = useTheme();
  const { copied, copy } = useClipboard();

  const [mode, setMode] = usePersistentState(STORAGE_KEYS.mode, "standard", (value) =>
    MODES.some((item) => item.id === value),
  );
  const [angleMode, setAngleMode] = usePersistentState(STORAGE_KEYS.angleMode, "deg", (value) =>
    ["deg", "rad"].includes(value),
  );
  const [memory, setMemory] = usePersistentState(
    STORAGE_KEYS.memory,
    null,
    (value) => value === null || Number.isFinite(value),
  );
  const [history, setHistory] = usePersistentState(STORAGE_KEYS.history, [], Array.isArray);

  const [expression, setExpression] = useState("");
  const [result, setResult] = useState(null);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [error, setError] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Vista previa en vivo: el resultado se ve mientras se escribe, sin pulsar "=".
  const preview = useMemo(() => {
    if (!expression) return { value: null, error: null };
    return tryEvaluate(balanceParens(expression), { angleMode });
  }, [expression, angleMode]);

  const currentValue = preview.value;

  const pushHistory = useCallback((entry) => {
    setHistory((previous) => {
      const first = previous[0];
      // No repetir la misma línea si se pulsa "=" dos veces seguidas.
      if (first && first.expression === entry.expression && first.resultText === entry.resultText) {
        return previous;
      }
      const next = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        at: Date.now(),
      };
      return [next, ...previous].slice(0, MAX_HISTORY);
    });
  }, [setHistory]);

  const handleToken = useCallback(
    (token) => {
      setError(null);
      setExpression((previous) => {
        if (!justEvaluated) return appendToken(previous, token);

        // Tras un "=": un número empieza de cero, un operador continúa el
        // cálculo a partir del resultado.
        const startsNewNumber = /^[\d.(]$/.test(token) || ["π", "e"].includes(token) || token.endsWith("(");
        const base = startsNewNumber ? "" : toEditableString(result).replace("-", "−");
        return appendToken(base, token);
      });
      setJustEvaluated(false);
    },
    [justEvaluated, result],
  );

  const handleClear = useCallback(() => {
    setExpression("");
    setResult(null);
    setJustEvaluated(false);
    setError(null);
  }, []);

  const handleBackspace = useCallback(() => {
    setError(null);
    setJustEvaluated(false);
    setExpression((previous) => backspace(previous));
  }, []);

  const handleToggleSign = useCallback(() => {
    setError(null);
    if (justEvaluated) {
      setExpression(toggleSign(toEditableString(result).replace("-", "−")));
      setJustEvaluated(false);
      return;
    }
    setExpression((previous) => toggleSign(previous));
  }, [justEvaluated, result]);

  const handleReciprocal = useCallback(() => {
    setError(null);
    setExpression((previous) => (previous ? `1÷(${balanceParens(previous)})` : "1÷"));
    setJustEvaluated(false);
  }, []);

  const handleEqual = useCallback(() => {
    if (!expression) return;
    const balanced = balanceParens(expression);

    try {
      const value = evaluate(balanced, { angleMode });
      setExpression(balanced);
      setResult(value);
      setJustEvaluated(true);
      setError(null);
      pushHistory({
        kind: "calc",
        expression: balanced,
        resultText: formatNumber(value),
        resultValue: value,
      });
    } catch (caught) {
      // La expresión se conserva: antes se sustituía por la palabra "Error" y
      // había que volver a teclearlo todo.
      setError(caught instanceof CalcError ? caught.message : "No se pudo calcular");
      setJustEvaluated(false);
    }
  }, [expression, angleMode, pushHistory]);

  const applyMemory = useCallback(
    (updater) => {
      if (!Number.isFinite(currentValue)) {
        setError("Escribe una operación válida antes de usar la memoria");
        return;
      }
      setError(null);
      setMemory((previous) => updater(previous ?? 0, currentValue));
    },
    [currentValue, setMemory],
  );

  const handleMemoryRecall = useCallback(() => {
    if (memory === null) return;
    const text = toEditableString(memory).replace("-", "−");
    setError(null);
    setJustEvaluated(false);
    setExpression((previous) => {
      if (justEvaluated || previous === "") return text;
      return /[\d)π!%e]$/.test(previous) ? `${previous}×${text}` : `${previous}${text}`;
    });
  }, [memory, justEvaluated]);

  const handleUseHistoryEntry = useCallback(
    (entry) => {
      if (!Number.isFinite(entry.resultValue)) return;
      setMode((previous) => (previous === "conversion" ? "standard" : previous));
      setExpression(toEditableString(entry.resultValue).replace("-", "−"));
      setResult(null);
      setJustEvaluated(false);
      setError(null);
      setHistoryOpen(false);
    },
    [setMode],
  );

  // --- Teclado físico -------------------------------------------------------
  // El listener se registra una sola vez y lee el handler más reciente desde un
  // ref; antes se añadía y quitaba en cada render.
  const keyHandlerRef = useRef(null);

  const handleGlobalKeyDown = useCallback(
    (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const active = document.activeElement;
      const tag = active?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || active?.isContentEditable) {
        return;
      }

      // Un botón enfocado se queda con Enter y Espacio; si no, se dispararían a
      // la vez su click y el "=". Sólo puede estar enfocado si se llegó con el
      // tabulador: `Key` impide que el ratón deje el foco puesto.
      if ((event.key === "Enter" || event.key === " ") && tag === "BUTTON") return;

      if (event.key === "Escape") {
        if (historyOpen) return;
        event.preventDefault();
        handleClear();
        return;
      }

      if (mode === "conversion") return;

      const { key } = event;

      if (key === " ") {
        // Sin esto, el espacio desplaza la página o repulsa el botón enfocado.
        event.preventDefault();
        return;
      }

      if (/^\d$/.test(key) || key === ".") {
        event.preventDefault();
        handleToken(key);
        return;
      }
      if (key === ",") {
        event.preventDefault();
        handleToken(".");
        return;
      }
      if (key in KEYBOARD_OPERATORS) {
        event.preventDefault();
        handleToken(KEYBOARD_OPERATORS[key]);
        return;
      }
      if (key === "(" || key === ")" || key === "%" || key === "!") {
        event.preventDefault();
        handleToken(key);
        return;
      }
      if (key === "Enter" || key === "=") {
        event.preventDefault();
        handleEqual();
        return;
      }
      if (key === "Backspace") {
        event.preventDefault();
        handleBackspace();
        return;
      }
      if (key === "Delete") {
        event.preventDefault();
        handleClear();
      }
    },
    [mode, historyOpen, handleToken, handleEqual, handleBackspace, handleClear],
  );

  useEffect(() => {
    keyHandlerRef.current = handleGlobalKeyDown;
  }, [handleGlobalKeyDown]);

  useEffect(() => {
    const listener = (event) => keyHandlerRef.current?.(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  // --- Pantalla -------------------------------------------------------------
  const isConversion = mode === "conversion";

  const displayValue = justEvaluated ? formatNumber(result) : expression || "0";
  // La vista previa sólo aparece cuando hay algo que resolver: con "1000"
  // escrito sobra un "= 1,000" debajo.
  const hasOperation = /[^\d.]/.test(expression);
  const displayHint = justEvaluated
    ? `${expression} =`
    : preview.value !== null && hasOperation
      ? `= ${formatNumber(preview.value)}`
      : "";

  const copyTarget = justEvaluated ? formatNumber(result) : formatNumber(preview.value);

  const badges = [
    ...(mode === "scientific"
      ? [{ label: angleMode, active: true, title: "Unidad de ángulo" }]
      : []),
    ...(memory !== null
      ? [{ label: "M", active: true, title: `Memoria: ${formatNumber(memory)}` }]
      : []),
  ];

  const ThemeIcon = THEME_META[theme].Icon;

  return (
    <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
      <main className="w-full max-w-lg overflow-hidden rounded-[28px] border border-line bg-surface shadow-2xl">
        <div className="flex flex-col gap-4 p-3 sm:p-5">
          <header className="flex items-center justify-between gap-2">
            <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-muted">Calculadora</h1>
            <div className="flex gap-2">
              <Key
                variant="ghost"
                size="small"
                onClick={cycleTheme}
                aria-label={`${THEME_META[theme].label}. Pulsa para cambiar`}
                title={THEME_META[theme].label}
                className="border-line px-2.5"
              >
                <ThemeIcon />
              </Key>
              <Key
                variant="ghost"
                size="small"
                onClick={() => setHistoryOpen(true)}
                aria-label="Abrir el historial"
                title="Historial"
                className="gap-1.5 border-line px-3"
              >
                <HistoryIcon />
                <span className="hidden sm:inline">Historial</span>
                {history.length > 0 ? (
                  <span className="rounded-full bg-brand px-1.5 text-[10px] font-bold text-brand-ink">
                    {history.length}
                  </span>
                ) : null}
              </Key>
            </div>
          </header>

          <div role="tablist" aria-label="Modo de la calculadora" className="flex gap-1 rounded-2xl bg-elevated p-1">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === mode}
                onClick={() => setMode(item.id)}
                className={cx(
                  "flex-1 rounded-xl px-2 py-2 text-sm font-semibold transition",
                  item.id === mode
                    ? "bg-brand text-brand-ink shadow-sm"
                    : "text-muted hover:bg-keyalt hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {isConversion ? (
            <ConverterPanel onSave={pushHistory} onCopy={copy} copied={copied} />
          ) : (
            <>
              <Display
                hint={displayHint}
                value={displayValue}
                error={error}
                badges={badges}
                copied={copied}
                onCopy={() => copy(copyTarget)}
                copyDisabled={!copyTarget}
              />

              <div className="flex flex-wrap gap-1.5">
                <Key
                  variant="ghost"
                  size="small"
                  className="border-line"
                  onClick={() => setMemory(null)}
                  disabled={memory === null}
                  title="Borrar la memoria"
                >
                  MC
                </Key>
                <Key
                  variant="ghost"
                  size="small"
                  className="border-line"
                  onClick={handleMemoryRecall}
                  disabled={memory === null}
                  title={memory === null ? "Memoria vacía" : `Memoria: ${formatNumber(memory)}`}
                >
                  MR
                </Key>
                <Key
                  variant="ghost"
                  size="small"
                  className="border-line"
                  onClick={() => applyMemory((stored, value) => stored + value)}
                >
                  M+
                </Key>
                <Key
                  variant="ghost"
                  size="small"
                  className="border-line"
                  onClick={() => applyMemory((stored, value) => stored - value)}
                >
                  M−
                </Key>
                <Key
                  variant="ghost"
                  size="small"
                  className="border-line"
                  onClick={() => applyMemory((_, value) => value)}
                  title="Guardar en memoria"
                >
                  MS
                </Key>
                {memory !== null ? (
                  <span className="tnum ml-auto self-center truncate text-xs text-muted">
                    M = {formatNumber(memory)}
                  </span>
                ) : null}
              </div>

              <Keypad
                mode={mode}
                angleMode={angleMode}
                onToggleAngleMode={() =>
                  setAngleMode((previous) => (previous === "deg" ? "rad" : "deg"))
                }
                onToken={handleToken}
                onClear={handleClear}
                onBackspace={handleBackspace}
                onToggleSign={handleToggleSign}
                onReciprocal={handleReciprocal}
                onEqual={handleEqual}
              />

              <p className="text-center text-[11px] text-muted">
                También funciona con el teclado: números, <kbd>+ − * /</kbd>, <kbd>Enter</kbd>,{" "}
                <kbd>Retroceso</kbd> y <kbd>Esc</kbd>.
              </p>
            </>
          )}
        </div>
      </main>

      <HistoryDrawer
        open={historyOpen}
        entries={history}
        onClose={() => setHistoryOpen(false)}
        onUse={handleUseHistoryEntry}
        onCopy={copy}
        onDelete={(id) => setHistory((previous) => previous.filter((item) => item.id !== id))}
        onClear={() => setHistory([])}
      />
    </div>
  );
}
