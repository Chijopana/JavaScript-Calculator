import { useEffect, useMemo } from "react";
import Key from "./Key.jsx";
import { cx } from "../lib/cx.js";
import { formatNumber, parseNumber } from "../lib/format.js";
import { CATEGORIES, convert, getCategory, getUnitSymbol } from "../lib/units.js";
import { usePersistentState } from "../hooks/usePersistentState.js";

const SELECT_CLASSES =
  "w-full appearance-none rounded-2xl border border-line bg-key py-3 pl-3 pr-9 text-base text-ink " +
  "shadow-sm transition hover:bg-key-hover";

/**
 * `appearance-none` quita la flecha nativa (que en tema oscuro se pinta negra
 * sobre negro), así que hay que dibujarla. Va en un `span` y no en un
 * `background-image` para que herede el color del tema.
 */
function UnitSelect({ label, value, units, onChange }) {
  return (
    <label className="flex flex-col gap-1 sm:w-44">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <div className="relative">
        <select value={value} onChange={onChange} className={SELECT_CLASSES}>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.label} ({unit.symbol})
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </label>
  );
}

export default function ConverterPanel({ onSave, onCopy, copied }) {
  const [categoryId, setCategoryId] = usePersistentState(
    "calc:conv:category",
    "length",
    (value) => CATEGORIES.some((category) => category.id === value),
  );
  const [from, setFrom] = usePersistentState("calc:conv:from", "m");
  const [to, setTo] = usePersistentState("calc:conv:to", "cm");
  const [rawValue, setRawValue] = usePersistentState("calc:conv:value", "1");

  const category = getCategory(categoryId);

  // Al cambiar de categoría sólo se reajustan las unidades si dejan de existir:
  // así no se pierde lo que el usuario ya había escrito.
  useEffect(() => {
    const ids = category.units.map((unit) => unit.id);
    if (!ids.includes(from) || !ids.includes(to) || from === to) {
      setFrom(category.units[0].id);
      setTo(category.units[1]?.id ?? category.units[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const parsed = useMemo(() => parseNumber(rawValue), [rawValue]);
  const isValid = Number.isFinite(parsed);
  const result = useMemo(
    () => (isValid ? convert(categoryId, from, to, parsed) : null),
    [categoryId, from, to, parsed, isValid],
  );

  const rate = useMemo(
    () => (categoryId === "temperature" ? null : convert(categoryId, from, to, 1)),
    [categoryId, from, to],
  );

  const fromSymbol = getUnitSymbol(categoryId, from);
  const toSymbol = getUnitSymbol(categoryId, to);
  const resultText = result === null ? "" : `${formatNumber(result)} ${toSymbol}`;

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    // El resultado pasa a ser el nuevo punto de partida: es lo que se espera al
    // invertir una conversión.
    if (result !== null) setRawValue(String(result));
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Categoría
        </p>
        <div
          className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          role="tablist"
          aria-label="Categorías de conversión"
        >
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === categoryId}
              onClick={() => setCategoryId(item.id)}
              className={cx(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                item.id === categoryId
                  ? "border-brand bg-brand text-brand-ink shadow-sm"
                  : "border-line bg-key text-muted hover:bg-key-hover hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Valor
          </span>
          <input
            value={rawValue}
            onChange={(event) => setRawValue(event.target.value)}
            inputMode="decimal"
            // `type="text"` a propósito: `type="number"` se come el valor al
            // escribir "-" o "1e" y bloquea el pegado en algunos navegadores.
            type="text"
            placeholder="0"
            aria-invalid={!isValid}
            aria-describedby={isValid ? undefined : "converter-error"}
            className={cx(
              "tnum w-full rounded-2xl border bg-key px-4 py-3 text-2xl font-semibold text-ink shadow-sm",
              "outline-none transition placeholder:text-muted",
              isValid ? "border-line" : "border-danger",
            )}
          />
        </label>

        <UnitSelect
          label="De"
          value={from}
          units={category.units}
          onChange={(event) => setFrom(event.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <Key
          variant="function"
          size="small"
          onClick={handleSwap}
          aria-label="Intercambiar las unidades"
          title="Intercambiar unidades"
          className="px-4"
        >
          ⇅ Invertir
        </Key>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Resultado
          </span>
          <output
            aria-live="polite"
            className={cx(
              "no-scrollbar tnum block overflow-x-auto whitespace-nowrap rounded-2xl border border-line",
              "bg-elevated px-4 py-3 text-right text-2xl font-bold text-ink shadow-inner",
            )}
          >
            {isValid ? formatNumber(result) : "—"}
            {isValid ? (
              <span className="ml-2 text-base font-semibold text-muted">{toSymbol}</span>
            ) : null}
          </output>
        </div>

        <UnitSelect
          label="A"
          value={to}
          units={category.units}
          onChange={(event) => setTo(event.target.value)}
        />
      </div>

      {isValid ? (
        rate !== null ? (
          <p className="tnum text-xs text-muted">
            1 {fromSymbol} = {formatNumber(rate)} {toSymbol}
          </p>
        ) : null
      ) : (
        <p id="converter-error" role="alert" className="text-xs font-medium text-danger">
          Escribe un número (se admiten decimales y negativos).
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Key
          variant="brand"
          size="small"
          className="flex-1"
          disabled={!isValid}
          onClick={() => onCopy(resultText)}
        >
          {copied ? "Copiado" : "Copiar resultado"}
        </Key>
        <Key
          variant="function"
          size="small"
          className="flex-1"
          disabled={!isValid}
          onClick={() =>
            onSave({
              kind: "conversion",
              expression: `${formatNumber(parsed)} ${fromSymbol} → ${toSymbol}`,
              resultText,
              resultValue: result,
            })
          }
        >
          Guardar en historial
        </Key>
      </div>
    </div>
  );
}
