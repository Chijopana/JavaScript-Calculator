const { useState } = React;

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [formula, setFormula] = useState("");
  const [evaluated, setEvaluated] = useState(false);

  const handleClear = () => {
    setDisplay("0");
    setFormula("");
    setEvaluated(false);
  };

  
  const handleNumber = (num) => {
    if (evaluated) {
    
      setDisplay(num);
      setFormula(num);
      setEvaluated(false);
    } else {
     
      if (display === "0" && num === "0") return;
      if (display === "0") {
        setDisplay(num);
        if (formula === "" || formula === "0") {
          setFormula(num);
        } else {
          setFormula(formula + num);
        }
      } else {
        setDisplay(display + num);
        setFormula(formula + num);
      }
    }
  };

 
  const handleOperator = (op) => {
    if (evaluated) {
     
      setFormula(display + op);
      setDisplay(op);
      setEvaluated(false);
    } else {
 
      if (/[+\-*/]$/.test(formula)) {
      
        if (op === "-" && !/[-]$/.test(formula)) {
          setFormula(formula + op);
          setDisplay(op);
        } else {
          setFormula(formula.replace(/[+\-*/]+$/, op));
          setDisplay(op);
        }
      } else {
        setFormula(formula + op);
        setDisplay(op);
      }
    }
  };

  const handleDecimal = () => {
    if (evaluated) {
      setDisplay("0.");
      setFormula("0.");
      setEvaluated(false);
    } else {
  
      const parts = formula.split(/[+\-*/]/);
      const current = parts[parts.length - 1];
      if (!current.includes(".")) {
        setDisplay(display + ".");
        setFormula(formula + ".");
      }
    }
  };


  const handleEquals = () => {
    let expr = formula;
  
    if (/[+\-*/]$/.test(expr)) {
      expr = expr.slice(0, -1);
    }
    try {
      let result = eval(expr);
      result = Math.round(result * 10000) / 10000;
      setDisplay(result.toString());
      setFormula(result.toString());
      setEvaluated(true);
    } catch (error) {
      setDisplay("error");
      setFormula("");
      setEvaluated(true);
    }
  };

  return (
    <div className="calculator">
      <div id="display">{display}</div>
      <div className="buttons">
      
        <button id="clear" onClick={handleClear}>AC</button>
       
        <button id="divide" onClick={() => handleOperator("/")}>/</button>
        <button id="multiply" onClick={() => handleOperator("*")}>*</button>
        <button id="subtract" onClick={() => handleOperator("-")}>-</button>
      
        <button id="seven" onClick={() => handleNumber("7")}>7</button>
        <button id="eight" onClick={() => handleNumber("8")}>8</button>
        <button id="nine" onClick={() => handleNumber("9")}>9</button>
        <button id="add" onClick={() => handleOperator("+")}>+</button>
        
        <button id="four" onClick={() => handleNumber("4")}>4</button>
        <button id="five" onClick={() => handleNumber("5")}>5</button>
        <button id="six" onClick={() => handleNumber("6")}>6</button>
     
        <button id="one" onClick={() => handleNumber("1")}>1</button>
        <button id="two" onClick={() => handleNumber("2")}>2</button>
        <button id="three" onClick={() => handleNumber("3")}>3</button>
      
        <button id="equals" onClick={handleEquals}>=</button>
   
        <button id="zero" onClick={() => handleNumber("0")}>0</button>
        <button id="decimal" onClick={handleDecimal}>.</button>
      </div>
    </div>
  );
}

ReactDOM.render(<Calculator />, document.getElementById("root"));
