
const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");
const buttons = document.querySelector(".buttons");

let expression = "";
let finished = false;

// Calculate an expression safely without using eval()
function calculate(expression) {
    const tokens = expression.match(/\d*\.?\d+|[+\-*/]/g);

    if (!tokens || tokens.join("") !== expression) {
        throw new Error("Invalid expression");
    }

    let position = 0;

    function number() {
        if (tokens[position] === "+") {
            position++;
            return number();
        }

        if (tokens[position] === "-") {
            position++;
            return -number();
        }

        const value = tokens[position++];

        if (value === undefined || !/^\d*\.?\d+$/.test(value)) {
            throw new Error("Invalid number");
        }

        return Number(value);
    }

    function term() {
        let result = number();

        while (tokens[position] === "*" ||
               tokens[position] === "/") {
            const operator = tokens[position++];
            const next = number();

            if (operator === "/" && next === 0) {
                throw new Error("Cannot divide by zero");
            }

            result = operator === "*"
                ? result * next
                : result / next;
        }

        return result;
    }

    function sum() {
        let result = term();

        while (tokens[position] === "+" ||
               tokens[position] === "-") {
            const operator = tokens[position++];
            const next = term();

            result = operator === "+"
                ? result + next
                : result - next;
        }

        return result;
    }

    const result = sum();

    if (position !== tokens.length || !Number.isFinite(result)) {
        throw new Error("Invalid expression");
    }

    return Number(result.toPrecision(12));
}

// Update the display and live result
function updateDisplay() {
    display.value = expression || "0";
    expressionDisplay.textContent = "";

    if (!expression || /[+\-*/.]$/.test(expression)) {
        return;
    }

    try {
        expressionDisplay.textContent =
            "= " + calculate(expression);
    } catch {
        expressionDisplay.textContent = "";
    }
}

// Add a number or arithmetic operator
function addValue(value) {
    if (finished && /[0-9.]/.test(value)) {
        expression = "";
    }

    finished = false;

    if (/[+\-*/]/.test(value)) {
        if (!expression && value !== "-") return;

        if (/[+\-*/]$/.test(expression)) {
            expression = expression.slice(0, -1);
        }

        expression += value;
    } else {
        if (value === ".") {
            const currentNumber = expression.split(/[+\-*/]/).pop();

            if (currentNumber.includes(".")) return;

            if (!currentNumber) expression += "0";
        }

        expression += value;
    }

    updateDisplay();
}

// Clear everything
function clearCalculator() {
    expression = "";
    finished = false;
    updateDisplay();
}

// Delete the last character
function deleteLast() {
    expression = expression.slice(0, -1);
    finished = false;
    updateDisplay();
}

// Calculate the final answer
function showResult() {
    if (!expression) return;

    try {
        const result = calculate(expression);
        expression = String(result);
        finished = true;
        updateDisplay();
        expressionDisplay.textContent = "Answer";
    } catch {
        expressionDisplay.textContent = "Invalid calculation";
    }
}

// Change the sign of the last number
function changeSign() {
    const match = expression.match(/(\d*\.?\d+)$/);

    if (!match) {
        if (!expression) expression = "-";
        else if (/[+\-*/]$/.test(expression)) expression += "-";
        updateDisplay();
        return;
    }

    const start = match.index;
    const before = expression.slice(0, start);
    const value = match[0];

    if (before.endsWith("-") &&
        (before.length === 1 || /[+\-*/]$/.test(before.slice(0, -1)))) {
        expression = before.slice(0, -1) + value;
    } else {
        expression = before + "(-" + value + ")";
    }

    // Parentheses are not supported by this simple parser,
    // so use the direct sign toggle instead.
    if (expression.includes("(")) {
        expression = before + "-" + value;
    }

    updateDisplay();
}

// Handle button clicks
buttons.addEventListener("click", function(event) {
    const button = event.target.closest("button");

    if (!button) return;

    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value !== undefined) {
        addValue(value);
    } else if (action === "clear") {
        clearCalculator();
    } else if (action === "delete") {
        deleteLast();
    } else if (action === "calculate") {
        showResult();
    } else if (action === "decimal") {
        addValue(".");
    } else if (action === "sign") {
        changeSign();
    }
});

// Keyboard support
document.addEventListener("keydown", function(event) {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        addValue(key);
    } else if (["+", "-", "*", "/"].includes(key)) {
        addValue(key);
    } else if (key === "Enter" || key === "=") {
        showResult();
    } else if (key === "Backspace") {
        deleteLast();
    } else if (key === "Escape") {
        clearCalculator();
    }
});

updateDisplay();
