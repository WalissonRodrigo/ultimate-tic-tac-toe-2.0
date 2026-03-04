/**
 * Ultimate Tic-Tac-Toe 2.0 — Game Logic
 * - SVG symbols for X (cross) and O (circle)
 * - Sidebar panel updates (Game Status, Scoreboard, Active Board mini-grid)
 * - AI click-lock fix
 * - Improved AI: win → block → center → corners → random
 */

// ============================================================
// SVG Templates
// ============================================================
function svgX() {
    return `<svg viewBox="0 0 40 40"><line x1="8" y1="8" x2="32" y2="32" stroke="#00e5ff" stroke-width="4" stroke-linecap="round"/><line x1="32" y1="8" x2="8" y2="32" stroke="#00e5ff" stroke-width="4" stroke-linecap="round"/></svg>`;
}

function svgO() {
    return `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="13" fill="none" stroke="#ff2eea" stroke-width="4"/></svg>`;
}

function svgXBig() {
    return `<svg viewBox="0 0 40 40" style="color:#00e5ff"><line x1="8" y1="8" x2="32" y2="32" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><line x1="32" y1="8" x2="8" y2="32" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>`;
}

function svgOBig() {
    return `<svg viewBox="0 0 40 40" style="color:#ff2eea"><circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" stroke-width="5"/></svg>`;
}

// ============================================================
// DOM References
// ============================================================
const metaBoardEl     = document.getElementById('ultimate-board');
const turnSymbolEl    = document.getElementById('current-turn-symbol');
const turnTimerEl     = document.getElementById('turn-timer');
const statusTurnEl    = document.getElementById('status-turn');
const aiThinkingRow   = document.getElementById('ai-thinking-row');
const scoreXWinsEl    = document.getElementById('score-x-wins');
const scoreOWinsEl    = document.getElementById('score-o-wins');
const activeSectorEl  = document.getElementById('active-sector');
const signalIconEl    = document.getElementById('signal-icon');
const miniGridEl      = document.getElementById('mini-grid');
const resetBtn        = document.getElementById('reset-btn');
const modalResetBtn   = document.getElementById('modal-reset-btn');
const winModal        = document.getElementById('win-modal');
const winnerTextEl    = document.getElementById('winner-text');
const winnerSubEl     = document.getElementById('winner-sub');
const modalIconEl     = document.getElementById('modal-icon');

// ============================================================
// State
// ============================================================
const WIN_PATTERNS = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

const SECTOR_NAMES = ['NW','N','NE','W','C','E','SW','S','SE'];

let state = freshState();
let turnStart = Date.now();
let timerInterval = null;

function freshState() {
    return {
        currentPlayer: 'X',
        metaBoard: Array(9).fill(null),
        subBoards: Array.from({length:9}, () => Array(9).fill(null)),
        activeSubGridIndex: -1,
        gameActive: true,
        isAIThinking: false
    };
}

// ============================================================
// Timer
// ============================================================
function startTimer() {
    clearInterval(timerInterval);
    turnStart = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - turnStart) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        turnTimerEl.textContent = `${m}:${String(s).padStart(2,'0')}`;
    }, 500);
}

// ============================================================
// Board Init
// ============================================================
function initBoard() {
    metaBoardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const sub = document.createElement('div');
        sub.classList.add('sub-grid');
        sub.dataset.index = i;
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.sub = i;
            cell.dataset.cell = j;
            cell.addEventListener('click', onCellClick);
            sub.appendChild(cell);
        }
        metaBoardEl.appendChild(sub);
    }
    initMiniGrid();
    updateUI();
    startTimer();
}

function initMiniGrid() {
    miniGridEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const mc = document.createElement('div');
        mc.classList.add('mini-cell');
        mc.dataset.idx = i;
        miniGridEl.appendChild(mc);
    }
}

// ============================================================
// Click Handler
// ============================================================
function onCellClick(e) {
    if (state.isAIThinking) return;
    if (!state.gameActive) return;
    if (state.currentPlayer !== 'X') return;

    const subIdx  = parseInt(e.target.closest('.cell').dataset.sub);
    const cellIdx = parseInt(e.target.closest('.cell').dataset.cell);
    executeMove(subIdx, cellIdx);
}

// ============================================================
// Core Move
// ============================================================
function executeMove(subIdx, cellIdx) {
    if (!state.gameActive) return;
    if (!isValidMove(subIdx, cellIdx)) return;

    // Place piece with SVG
    state.subBoards[subIdx][cellIdx] = state.currentPlayer;
    const cellEl = metaBoardEl.querySelector(`[data-sub="${subIdx}"][data-cell="${cellIdx}"]`);
    cellEl.innerHTML = state.currentPlayer === 'X' ? svgX() : svgO();
    cellEl.classList.add('occupied', state.currentPlayer.toLowerCase());

    // Sub-board check
    resolveSubBoard(subIdx);

    // Meta win check
    const metaWinner = checkWinner(state.metaBoard);
    if (metaWinner && metaWinner !== 'draw') {
        endGame(metaWinner);
        return;
    }
    if (state.metaBoard.every(v => v !== null)) {
        endGame('draw');
        return;
    }

    // Next active grid
    const next = cellIdx;
    state.activeSubGridIndex = (state.metaBoard[next] !== null) ? -1 : next;

    // Switch turn
    state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    startTimer();
    updateUI();

    // AI
    if (state.gameActive && state.currentPlayer === 'O') {
        state.isAIThinking = true;
        metaBoardEl.classList.add('board-locked');
        aiThinkingRow.style.display = 'flex';
        setTimeout(() => {
            aiPlay();
            state.isAIThinking = false;
            metaBoardEl.classList.remove('board-locked');
            aiThinkingRow.style.display = 'none';
        }, 600 + Math.random() * 400);
    }
}

// ============================================================
// Validation
// ============================================================
function isValidMove(subIdx, cellIdx) {
    if (state.subBoards[subIdx][cellIdx] !== null) return false;
    if (state.metaBoard[subIdx] !== null) return false;
    if (state.activeSubGridIndex !== -1 && state.activeSubGridIndex !== subIdx) return false;
    return true;
}

// ============================================================
// Sub-Board Resolution
// ============================================================
function resolveSubBoard(subIdx) {
    if (state.metaBoard[subIdx] !== null) return;
    const board = state.subBoards[subIdx];
    const winner = checkWinner(board);

    if (winner && winner !== 'draw') {
        state.metaBoard[subIdx] = winner;
        const subEl = metaBoardEl.querySelector(`.sub-grid[data-index="${subIdx}"]`);
        subEl.classList.add(`won-${winner.toLowerCase()}`);
        // Add big SVG overlay
        const overlay = document.createElement('div');
        overlay.classList.add('won-overlay');
        overlay.innerHTML = winner === 'X' ? svgXBig() : svgOBig();
        subEl.appendChild(overlay);
    } else if (board.every(c => c !== null)) {
        state.metaBoard[subIdx] = 'draw';
        const subEl = metaBoardEl.querySelector(`.sub-grid[data-index="${subIdx}"]`);
        subEl.classList.add('draw-grid');
    }
}

// ============================================================
// Winner Check
// ============================================================
function checkWinner(board) {
    for (const [a,b,c] of WIN_PATTERNS) {
        if (board[a] && board[a] !== 'draw' && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

// ============================================================
// AI
// ============================================================
function aiPlay() {
    if (!state.gameActive) return;
    const moves = getAvailableMoves();
    if (moves.length === 0) return;

    // 1. Win
    const win = moves.find(m => simulate(m, 'O'));
    if (win) { executeMove(win.sub, win.cell); return; }

    // 2. Block
    const block = moves.find(m => simulate(m, 'X'));
    if (block) { executeMove(block.sub, block.cell); return; }

    // 3. Strategic: prefer sending opponent to a won/full grid (gives them free choice is bad, but sending to a grid we're strong in is good)
    // Simplified: prefer center → corners → random
    const center = moves.filter(m => m.cell === 4);
    if (center.length) { pick(center); return; }

    const corners = moves.filter(m => [0,2,6,8].includes(m.cell));
    if (corners.length) { pick(corners); return; }

    pick(moves);
}

function getAvailableMoves() {
    const subs = state.activeSubGridIndex === -1
        ? state.metaBoard.reduce((a,v,i) => { if(v===null) a.push(i); return a; }, [])
        : [state.activeSubGridIndex];
    const moves = [];
    for (const s of subs)
        for (let c = 0; c < 9; c++)
            if (state.subBoards[s][c] === null) moves.push({sub:s, cell:c});
    return moves;
}

function simulate(move, player) {
    const temp = [...state.subBoards[move.sub]];
    temp[move.cell] = player;
    return checkWinner(temp) === player;
}

function pick(arr) {
    const m = arr[Math.floor(Math.random() * arr.length)];
    executeMove(m.sub, m.cell);
}

// ============================================================
// UI Update
// ============================================================
function updateUI() {
    const isX = state.currentPlayer === 'X';

    // Turn symbol
    turnSymbolEl.innerHTML = isX ? svgX() : svgO();
    turnSymbolEl.className = 'turn-symbol ' + (isX ? 'cyan' : 'pink');
    turnSymbolEl.style.display = 'inline-flex';
    turnSymbolEl.style.width = '20px';
    turnSymbolEl.style.height = '20px';
    turnSymbolEl.style.verticalAlign = 'middle';

    // Status panel
    statusTurnEl.textContent = isX ? 'PLAYER 1 [X]' : 'IA [O]';
    statusTurnEl.className = 'status-value ' + (isX ? 'cyan' : 'pink');

    // Scoreboard
    const xW = state.metaBoard.filter(v => v === 'X').length;
    const oW = state.metaBoard.filter(v => v === 'O').length;
    scoreXWinsEl.textContent = `${xW} Wins`;
    scoreOWinsEl.textContent = `${oW} Wins`;

    // Active sector
    if (state.activeSubGridIndex === -1) {
        activeSectorEl.textContent = 'ALL';
    } else {
        activeSectorEl.textContent = SECTOR_NAMES[state.activeSubGridIndex];
    }

    // Sub-grid highlighting
    const subs = metaBoardEl.querySelectorAll('.sub-grid');
    subs.forEach((el, idx) => {
        const resolved = state.metaBoard[idx] !== null;
        if (state.activeSubGridIndex === -1) {
            el.classList.toggle('active-target', !resolved);
            el.classList.toggle('dim-grid', resolved);
        } else {
            el.classList.toggle('active-target', idx === state.activeSubGridIndex);
            el.classList.toggle('dim-grid', idx !== state.activeSubGridIndex && !resolved);
        }
    });

    // Mini grid
    const miniCells = miniGridEl.querySelectorAll('.mini-cell');
    miniCells.forEach((mc, idx) => {
        mc.className = 'mini-cell';
        if (state.metaBoard[idx] === 'X') mc.classList.add('mini-won-x');
        else if (state.metaBoard[idx] === 'O') mc.classList.add('mini-won-o');
        else if (state.metaBoard[idx] === 'draw') mc.classList.add('mini-draw');
        else if (state.activeSubGridIndex === -1 || state.activeSubGridIndex === idx) mc.classList.add('mini-active');
    });
}

// ============================================================
// End Game
// ============================================================
function endGame(winner) {
    state.gameActive = false;
    clearInterval(timerInterval);

    if (winner === 'draw') {
        modalIconEl.innerHTML = '<span style="font-size:4rem;color:var(--text-dim)">—</span>';
        winnerTextEl.textContent = 'EMPATE';
        winnerSubEl.textContent = 'Nenhum jogador dominou o meta-grid.';
    } else if (winner === 'X') {
        modalIconEl.innerHTML = `<div style="width:64px;height:64px;margin:0 auto;">${svgXBig()}</div>`;
        winnerTextEl.textContent = 'VITÓRIA';
        winnerTextEl.style.color = 'var(--cyan)';
        winnerSubEl.textContent = 'Jogador X dominou o meta-grid!';
    } else {
        modalIconEl.innerHTML = `<div style="width:64px;height:64px;margin:0 auto;">${svgOBig()}</div>`;
        winnerTextEl.textContent = 'DERROTA';
        winnerTextEl.style.color = 'var(--pink)';
        winnerSubEl.textContent = 'A IA dominou o meta-grid.';
    }

    winModal.classList.add('show');
}

// ============================================================
// Reset
// ============================================================
function resetGame() {
    state = freshState();
    winModal.classList.remove('show');
    metaBoardEl.classList.remove('board-locked');
    aiThinkingRow.style.display = 'none';
    winnerTextEl.style.color = '';
    initBoard();
}

// ============================================================
// Events & Boot
// ============================================================
resetBtn.addEventListener('click', resetGame);
modalResetBtn.addEventListener('click', resetGame);
initBoard();
