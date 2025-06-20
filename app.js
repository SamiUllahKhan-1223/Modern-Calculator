// Modern Calculator Logic
let state = {
    current: '0',
    previous: null,
    operator: null,
    memory: 0,
    shouldReset: false,
    history: []
};

const display = document.getElementById('display');
const buttons = document.getElementById('buttons');
const historyPanel = document.querySelector('.history-panel');
const overlay = document.querySelector('.overlay');
const historyList = document.querySelector('.history-list');

function updateDisplay() {
    display.textContent = state.current;
    if (state.current.length > 10) {
        display.classList.add('typing');
    } else {
        display.classList.remove('typing');
    }
}

function addToHistory(calc, result) {
    state.history.unshift({ calc, result, timestamp: new Date().toLocaleTimeString() });
    if (state.history.length > 20) state.history = state.history.slice(0, 20);
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    if (state.history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No calculations yet.</div>';
        return;
    }
    historyList.innerHTML = state.history.map((item, idx) => `
        <div class="history-item" data-history="${idx}">
            <div class="history-calculation">${item.calc}</div>
            <div class="history-result">= ${item.result}</div>
        </div>
    `).join('');
}

function clearAll() {
    state.current = '0';
    state.previous = null;
    state.operator = null;
    state.shouldReset = false;
    updateDisplay();
}

function deleteLast() {
    if (state.shouldReset) return;
    if (state.current.length === 1) {
        state.current = '0';
    } else {
        state.current = state.current.slice(0, -1);
    }
    updateDisplay();
}

function appendNumber(num) {
    if (state.shouldReset) {
        state.current = '';
        state.shouldReset = false;
    }
    if (state.current === '0' && num !== '.') {
        state.current = num;
    } else if (num === '.' && state.current.includes('.')) {
        return;
    } else {
        state.current += num;
    }
    updateDisplay();
}

function setOperator(op) {
    if (state.operator && !state.shouldReset) {
        calculate();
    }
    state.previous = state.current;
    state.operator = op;
    state.shouldReset = true;
}

function calculate() {
    if (!state.operator || state.shouldReset) return;
    let prev = parseFloat(state.previous);
    let curr = parseFloat(state.current);
    let result;
    switch (state.operator) {
        case '+': result = prev + curr; break;
        case '-': result = prev - curr; break;
        case '*': result = prev * curr; break;
        case '/':
            if (curr === 0) {
                alert('Cannot divide by zero!');
                clearAll();
                return;
            }
            result = prev / curr; break;
        default: return;
    }
    result = Math.round(result * 100000000) / 100000000;
    addToHistory(`${state.previous} ${state.operator} ${state.current}`, result);
    state.current = result.toString();
    state.operator = null;
    state.previous = null;
    state.shouldReset = true;
    updateDisplay();
}

function percent() {
    let curr = parseFloat(state.current);
    let result = curr / 100;
    addToHistory(`${state.current} %`, result);
    state.current = result.toString();
    state.shouldReset = true;
    updateDisplay();
}

function reciprocal() {
    let curr = parseFloat(state.current);
    if (curr === 0) {
        alert('Cannot divide by zero!');
        return;
    }
    let result = 1 / curr;
    addToHistory(`1/(${state.current})`, result);
    state.current = result.toString();
    state.shouldReset = true;
    updateDisplay();
}

function squareRoot() {
    let curr = parseFloat(state.current);
    if (curr < 0) {
        alert('Invalid input for square root!');
        return;
    }
    let result = Math.sqrt(curr);
    addToHistory(`√(${state.current})`, result);
    state.current = result.toString();
    state.shouldReset = true;
    updateDisplay();
}

function toggleSign() {
    if (state.current === '0') return;
    if (state.current.startsWith('-')) {
        state.current = state.current.slice(1);
    } else {
        state.current = '-' + state.current;
    }
    updateDisplay();
}

// Memory functions
function memoryClear() { state.memory = 0; }
function memoryRecall() {
    state.current = state.memory.toString();
    state.shouldReset = true;
    updateDisplay();
}
function memoryAdd() {
    state.memory += parseFloat(state.current) || 0;
    state.shouldReset = true;
}
function memorySubtract() {
    state.memory -= parseFloat(state.current) || 0;
    state.shouldReset = true;
}

// Show/hide history panel and overlay
function showHistoryPanel() {
    historyPanel.classList.add('open');
    overlay.classList.add('open');
}
function hideHistoryPanel() {
    historyPanel.classList.remove('open');
    overlay.classList.remove('open');
}

// Event Delegation for Buttons
buttons.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 100);
    if (!action) return;
    if (!isNaN(action)) {
        appendNumber(action);
    } else if (action === 'decimal') {
        appendNumber('.');
    } else if (["+", "-", "*", "/"].includes(action)) {
        setOperator(action);
    } else if (action === 'equals') {
        calculate();
    } else if (action === 'clear') {
        clearAll();
    } else if (action === 'delete') {
        deleteLast();
    } else if (action === 'percent') {
        percent();
    } else if (action === 'reciprocal') {
        reciprocal();
    } else if (action === 'sqrt') {
        squareRoot();
    } else if (action === 'sign') {
        toggleSign();
    } else if (action === 'MC') {
        memoryClear();
    } else if (action === 'MR') {
        memoryRecall();
    } else if (action === 'M+') {
        memoryAdd();
    } else if (action === 'M-') {
        memorySubtract();
    } else if (action === 'history') {
        showHistoryPanel();
    }
});

document.querySelector('.close-history').addEventListener('click', hideHistoryPanel);
overlay.addEventListener('click', hideHistoryPanel);

// History click
historyList.addEventListener('click', (e) => {
    const item = e.target.closest('.history-item');
    if (!item) return;
    const idx = item.getAttribute('data-history');
    if (state.history[idx]) {
        state.current = state.history[idx].result.toString();
        state.shouldReset = true;
        updateDisplay();
        historyPanel.classList.remove('open');
        overlay.classList.remove('open');
    }
});

// Keyboard support
function handleKey(e) {
    const key = e.key;
    if (/^[0-9]$/.test(key)) appendNumber(key);
    if (key === '.') appendNumber('.');
    if (['+', '-', '*', '/'].includes(key)) setOperator(key);
    if (key === 'Enter' || key === '=') calculate();
    if (key === 'Backspace') deleteLast();
    if (key === 'Escape') clearAll();
    if (key === '%') percent();
    if (key === 'r') reciprocal();
    if (key === 's') squareRoot();
    if (key === 't') toggleSign();
    if (key === 'm') memoryClear();
    if (key === 'n') memoryRecall();
    if (key === 'a') memoryAdd();
    if (key === 'u') memorySubtract();
    if (key === 'h') {
        historyPanel.classList.add('open');
        overlay.classList.add('open');
    }
}
document.addEventListener('keydown', handleKey);

document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    updateHistoryDisplay();
});

// Theme Toggle Logic
const themeToggle = document.getElementById('themeToggle');
const themeToggleIcon = themeToggle.querySelector('.theme-toggle-icon');

function setTheme(mode) {
    if (mode === 'light') {
        document.body.classList.add('light-mode');
        themeToggleIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('light-mode');
        themeToggleIcon.textContent = '🌙';
    }
}

// Load theme from localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    setTheme('light');
} else {
    setTheme('dark');
}

themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-mode');
    if (isLight) {
        setTheme('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        setTheme('light');
        localStorage.setItem('theme', 'light');
    }
});