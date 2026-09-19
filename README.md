# 🧮 Calculadora

Calculadora web con tres modos —estándar, científica y conversor de unidades—
construida con React, Vite y Tailwind CSS.

**Demo:** https://java-script-calculator-gzhd.vercel.app/

---

## ✨ Qué hace

**Calculadora**

- Expresiones completas con precedencia y paréntesis: `2+3×4` son 14, no 20.
- Vista previa del resultado mientras escribes, sin pulsar `=`.
- Porcentajes como los de una calculadora de bolsillo: `200+10%` son 220.
- Números negativos, memoria (`MS`, `MR`, `M+`, `M−`, `MC`) e historial de las
  últimas 50 operaciones.
- Mensajes de error concretos («No se puede dividir entre 0») que **no borran**
  lo que habías escrito.

**Científica**

- `sin`, `cos`, `tan`, `ln`, `log`, `√`, potencias, factorial, π y e.
- Conmutador de grados/radianes.
- Multiplicación implícita: `2π` y `3(4+1)` se entienden.

**Conversor**

- 8 categorías: longitud, masa, temperatura, área, volumen, velocidad, tiempo y
  datos.
- Factores exactos de la definición internacional, no redondeados.
- Admite valores negativos (imprescindible para temperaturas) y notación
  científica.

**En general**

- Tema claro, oscuro o el del sistema, recordado entre visitas.
- Funciona con el teclado físico: números, `+ − * / ^ ( ) % !`, `Enter`,
  `Retroceso`, `Supr` y `Esc`.
- Botones con etiquetas accesibles, resultado anunciado por lectores de pantalla
  y respeto por `prefers-reduced-motion`.
- Diseño adaptable desde 320 px.

---

## 🛠️ Tecnologías

React 19 · Vite 7 · Tailwind CSS 4 · Vitest · ESLint

---

## 🚀 Puesta en marcha

```bash
cd my-calculator
npm install
npm run dev
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Sirve la compilación de producción |
| `npm test` | Pruebas unitarias |
| `npm run lint` | ESLint |

---

## 📁 Estructura

```
my-calculator/src
├── components/     Calculator, Display, Keypad, ConverterPanel, HistoryDrawer…
├── hooks/          usePersistentState, useTheme, useClipboard
├── lib/
│   ├── evaluate.js        Tokenizador + parser de expresiones (sin eval)
│   ├── expressionInput.js Reglas de edición de la expresión
│   ├── units.js           Catálogo de unidades y conversiones
│   ├── format.js          Formato y redondeo de números
│   └── storage.js         localStorage a prueba de fallos
└── index.css       Tokens de color y tema
```

La lógica de cálculo, edición y conversión vive fuera de React y está cubierta
por pruebas (`npm test`), así que se puede tocar la interfaz sin miedo a romper
las cuentas.

---

## 🧠 Notas de implementación

- **Nada de `eval`.** Las expresiones se analizan con un parser de descenso
  recursivo propio. Además de evitar el riesgo de ejecutar código arbitrario,
  permite dar errores útiles y calcular bien casos que un `replace` de texto se
  come (`10%3`, `200+10%`, paréntesis desbalanceados).
- **Los resultados se guardan como números**, no como texto ya formateado, para
  no perder precisión al encadenar operaciones.
- **El tema se define una sola vez** con variables CSS y `data-theme`, en lugar
  de repetir clases de claro y oscuro en cada botón.
