import { cx } from "../lib/cx.js";

const VARIANTS = {
  number: "bg-key text-ink hover:bg-key-hover",
  function: "bg-keyalt text-ink hover:bg-keyalt-hover",
  operator: "bg-op text-op-ink hover:bg-op-hover",
  brand: "bg-brand text-brand-ink hover:bg-brand-hover",
  danger: "bg-keyalt text-danger hover:bg-keyalt-hover",
  ghost: "bg-transparent text-muted hover:bg-keyalt hover:text-ink",
};

const SIZES = {
  key: "h-14 rounded-2xl text-xl sm:h-16 sm:text-2xl",
  small: "h-10 rounded-xl px-3 text-sm",
  chip: "h-9 rounded-full px-4 text-xs font-semibold uppercase tracking-wider",
};

/**
 * Botón único de la aplicación.
 *
 * Antes cada tecla repetía la misma tira de clases y encima recibía un `style`
 * en línea con el color del texto; cualquier cambio de diseño había que
 * hacerlo en veinte sitios.
 */
export default function Key({
  variant = "number",
  size = "key",
  className,
  children,
  onMouseDown,
  ...props
}) {
  return (
    <button
      type="button"
      // Impide que el clic del ratón deje el foco en la tecla. Si se quedaba,
      // pulsar Enter después volvía a activar el último botón pulsado en lugar
      // de calcular. Llegar con el tabulador sí da el foco, como debe ser.
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      className={cx(
        "inline-flex select-none items-center justify-center border border-line/70 font-semibold",
        "shadow-sm transition-[background-color,transform,box-shadow] duration-100",
        "active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100",
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
