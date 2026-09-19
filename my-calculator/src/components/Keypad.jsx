import { Fragment } from "react";
import Key from "./Key.jsx";

// Cada fila de dígitos viaja con el operador que la acompaña a la derecha.
const DIGIT_ROWS = [
  { digits: ["7", "8", "9"], operator: "×", label: "Multiplicar" },
  { digits: ["4", "5", "6"], operator: "−", label: "Restar" },
  { digits: ["1", "2", "3"], operator: "+", label: "Sumar" },
];

function ScientificKeys({ angleMode, onToggleAngleMode, onToken, onReciprocal }) {
  return (
    <div className="grid grid-cols-5 gap-2 rounded-2xl border border-line bg-elevated p-2">
      <Key
        variant="function"
        onClick={onToggleAngleMode}
        aria-label={`Cambiar a ${angleMode === "deg" ? "radianes" : "grados"}`}
        title="Grados o radianes"
        className="text-sm sm:text-base"
      >
        {angleMode === "deg" ? "DEG" : "RAD"}
      </Key>
      <Key variant="function" onClick={() => onToken("(")} aria-label="Abrir paréntesis">
        (
      </Key>
      <Key variant="function" onClick={() => onToken(")")} aria-label="Cerrar paréntesis">
        )
      </Key>
      <Key
        variant="function"
        onClick={() => onToken("^")}
        aria-label="Elevado a"
        className="text-base sm:text-lg"
      >
        xʸ
      </Key>
      <Key variant="function" onClick={() => onToken("!")} aria-label="Factorial">
        n!
      </Key>

      {["sin", "cos", "tan", "ln", "log"].map((fn) => (
        <Key
          key={fn}
          variant="function"
          onClick={() => onToken(`${fn}(`)}
          aria-label={fn}
          className="text-base sm:text-lg"
        >
          {fn}
        </Key>
      ))}

      <Key variant="function" onClick={() => onToken("√(")} aria-label="Raíz cuadrada">
        √
      </Key>
      <Key
        variant="function"
        onClick={() => onToken("^2")}
        aria-label="Al cuadrado"
        className="text-base sm:text-lg"
      >
        x²
      </Key>
      <Key
        variant="function"
        onClick={onReciprocal}
        aria-label="Uno dividido entre el resultado"
        className="text-base sm:text-lg"
      >
        1/x
      </Key>
      <Key variant="function" onClick={() => onToken("π")} aria-label="Pi">
        π
      </Key>
      <Key variant="function" onClick={() => onToken("e")} aria-label="Número e">
        e
      </Key>
    </div>
  );
}

export default function Keypad({
  mode,
  angleMode,
  onToggleAngleMode,
  onToken,
  onClear,
  onBackspace,
  onToggleSign,
  onReciprocal,
  onEqual,
}) {
  return (
    <div className="flex flex-col gap-2">
      {mode === "scientific" ? (
        <ScientificKeys
          angleMode={angleMode}
          onToggleAngleMode={onToggleAngleMode}
          onToken={onToken}
          onReciprocal={onReciprocal}
        />
      ) : null}

      <div className="grid grid-cols-4 gap-2">
        <Key variant="danger" onClick={onClear} aria-label="Borrar todo">
          C
        </Key>
        <Key variant="function" onClick={onBackspace} aria-label="Borrar el último carácter">
          ⌫
        </Key>
        <Key variant="function" onClick={() => onToken("%")} aria-label="Porcentaje">
          %
        </Key>
        <Key variant="operator" onClick={() => onToken("÷")} aria-label="Dividir">
          ÷
        </Key>

        {DIGIT_ROWS.map(({ digits, operator, label }) => (
          <Fragment key={operator}>
            {digits.map((digit) => (
              <Key key={digit} onClick={() => onToken(digit)} aria-label={digit}>
                {digit}
              </Key>
            ))}
            <Key variant="operator" onClick={() => onToken(operator)} aria-label={label}>
              {operator}
            </Key>
          </Fragment>
        ))}

        <Key variant="function" onClick={onToggleSign} aria-label="Cambiar el signo">
          ±
        </Key>
        <Key onClick={() => onToken("0")} aria-label="0">
          0
        </Key>
        <Key onClick={() => onToken(".")} aria-label="Coma decimal">
          .
        </Key>
        <Key variant="brand" onClick={onEqual} aria-label="Calcular el resultado">
          =
        </Key>
      </div>
    </div>
  );
}
