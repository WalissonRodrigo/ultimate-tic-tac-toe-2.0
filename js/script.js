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
// Localization (i18n)
// ============================================================
const TRANSLATIONS = {
    'en-GB': {
        mainTitle: 'ULTIMATE TIC-TAC-TOE 2.0',
        metaDescription: 'Advanced Tic-Tac-Toe with strategic sub-grids and AI unit.',
        currentTurn: 'CURRENT TURN',
        gameStatus: 'GAME STATUS',
        turn: 'TURN',
        aiProcessing: 'AI PROCESSING...',
        scoreboard: 'SCOREBOARD',
        player1: 'PLAYER 1',
        aiUnit: 'AI UNIT',
        activeSector: 'ACTIVE SECTOR',
        settings: 'SETTINGS',
        language: 'LANGUAGE',
        restartGame: 'RESTART GAME',
        initializing: 'INITIALIZING...',
        welcomeMsg: 'Incoming User Detected. Please enter your codename.',
        codenamePlaceholder: 'CODENAME',
        accessSystem: 'ACCESS SYSTEM',
        victory: 'VICTORY',
        defeat: 'DEFEAT',
        draw: 'DRAW',
        playAgain: 'PLAY AGAIN',
        winMsg: '{name} dominated the meta-grid.',
        drawMsg: 'Neutral outcome. The meta-grid remains contested.',
        aiDefeatMsg: 'AI Unit dominated the meta-grid.',
        all: 'ALL',
        resetProfile: 'RESET PROFILE',
        resetScore: 'RESET SCORE',
        scoreSubWins: 'Sub-Wins',
        logoHTML: 'ULTIMATE<br>TIC-TAC-TOE <span class="cyan">2.0</span>'
    },
    'pt-BR': {
        mainTitle: 'JOGO DA VELHA 2.0',
        metaDescription: 'Jogo da Velha avançado com sub-tabuleiros estratégicos e unidade IA.',
        currentTurn: 'TURNO ATUAL',
        gameStatus: 'STATUS DO JOGO',
        turn: 'TURNO',
        aiProcessing: 'IA PROCESSANDO...',
        scoreboard: 'PLACAR',
        player1: 'JOGADOR 1',
        aiUnit: 'UNIDADE IA',
        activeSector: 'SETOR ATIVO',
        settings: 'CONFIGURAÇÕES',
        language: 'IDIOMA',
        restartGame: 'REINICIAR JOGO',
        initializing: 'INICIALIZANDO...',
        welcomeMsg: 'Usuário Detectado. Por favor, insira seu codinome.',
        codenamePlaceholder: 'CODINOME',
        accessSystem: 'ACESSAR SISTEMA',
        victory: 'VITÓRIA',
        defeat: 'DERROTA',
        draw: 'EMPATE',
        playAgain: 'JOGAR NOVAMENTE',
        winMsg: '{name} dominou o meta-grid.',
        drawMsg: 'Resultado neutro. O meta-grid permanece contestado.',
        aiDefeatMsg: 'Unidade IA dominou o meta-grid.',
        all: 'TODOS',
        resetProfile: 'ALTERAR PERFIL',
        resetScore: 'RESETE PLACAR',
        scoreSubWins: 'Sub-Vitórias',
        logoHTML: 'JOGO DA<br>VELHA <span class="cyan">2.0</span>'
    },
    'es-ES': {
        mainTitle: 'TRES EN RAYA 2.0',
        metaDescription: 'Tres en Raya avanzado con sub-grids estratégicos y unidad IA.',
        currentTurn: 'TURNO ACTUAL',
        gameStatus: 'ESTADO DEL JUEGO',
        turn: 'TURNO',
        aiProcessing: 'IA PROCESANDO...',
        scoreboard: 'PUNTUACIÓN',
        player1: 'JUGADOR 1',
        aiUnit: 'UNIDAD IA',
        activeSector: 'SECTOR ACTIVO',
        settings: 'AJUSTES',
        language: 'IDIOMA',
        restartGame: 'REINICIAR JUEGO',
        initializing: 'INICIALIZANDO...',
        welcomeMsg: 'Usuario Detectado. Por favor, ingrese su nombre en clave.',
        codenamePlaceholder: 'NOMBRE EN CLAVE',
        accessSystem: 'ACCEDER AL SISTEMA',
        victory: 'VICTORIA',
        defeat: 'DERROTA',
        draw: 'EMPATE',
        playAgain: 'JOGAR DE NUEVO',
        winMsg: '{name} dominó el meta-grid.',
        drawMsg: 'Resultado neutral. El meta-grid sigue en disputa.',
        aiDefeatMsg: 'La Unidad IA dominó el meta-grid.',
        all: 'TODOS',
        resetProfile: 'CAMBIAR PERFIL',
        resetScore: 'RESET MARCADOR',
        scoreSubWins: 'Sub-Victorias',
        logoHTML: 'TRES EN<br>RAYA <span class="cyan">2.0</span>'
    }
};

let currentLang = 'en-GB';

function updateLanguage(lang) {
    currentLang = lang;
    const t = TRANSLATIONS[lang];
    
    // Update Document Title & Meta
    document.title = t.mainTitle;
    document.documentElement.lang = lang; // Lighthouse SEO: dynamic lang attribute
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t.metaDescription);

    // Update Logo Text
    const logoEl = document.querySelector('.logo-text');
    if (logoEl && t.logoHTML) {
        logoEl.innerHTML = t.logoHTML;
    }

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });

    // Save choice
    localStorage.setItem('utt_lang', lang);
    
    // Update dynamic UI elements immediately
    updateUI();
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
const playerXNameEl   = document.getElementById('player-x-name');
const activeSectorEl  = document.getElementById('active-sector');
const signalIconEl    = document.getElementById('signal-icon');
const miniGridEl      = document.getElementById('mini-grid');
const resetBtn        = document.getElementById('reset-btn');
const modalResetBtn   = document.getElementById('modal-reset-btn');
const winModal        = document.getElementById('win-modal');
const winnerTextEl    = document.getElementById('winner-text');
const winnerSubEl     = document.getElementById('winner-sub');
const modalIconEl     = document.getElementById('modal-icon');

const profileModal    = document.getElementById('profile-modal');
const usernameInput   = document.getElementById('username-input');
const saveProfileBtn  = document.getElementById('save-profile-btn');
const langSelect      = document.getElementById('lang-select');

// Management Buttons
const changeProfileBtn = document.getElementById('change-profile-btn');
const resetScoreBtn    = document.getElementById('reset-score-btn');

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
let profile = { name: 'PLAYER 1', wins: 0, aiWins: 0 };

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
// Persistence Logic
// ============================================================
function saveToLocal() {
    localStorage.setItem('utt_state', JSON.stringify(state));
    localStorage.setItem('utt_profile', JSON.stringify(profile));
}

function loadFromLocal() {
    const savedState = localStorage.getItem('utt_state');
    const savedProfile = localStorage.getItem('utt_profile');

    if (savedProfile) {
        profile = JSON.parse(savedProfile);
        playerXNameEl.textContent = profile.name.toUpperCase();
    }

    if (savedState) {
        const parsed = JSON.parse(savedState);
        // Only load if the game was actually active
        if (parsed.gameActive) {
            state = parsed;
            return true;
        }
    }
    return false;
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
function initBoard(isContinuation = false) {
    metaBoardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const sub = document.createElement('div');
        sub.classList.add('sub-grid');
        sub.dataset.index = i;
        
        // Re-apply visual state if continuing
        if (state.metaBoard[i]) {
            sub.classList.add(state.metaBoard[i] === 'draw' ? 'draw-grid' : `won-${state.metaBoard[i].toLowerCase()}`);
        }

        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.sub = i;
            cell.dataset.cell = j;
            cell.addEventListener('click', onCellClick);
            
            // Re-apply piece if continuing
            if (state.subBoards[i][j]) {
                cell.innerHTML = state.subBoards[i][j] === 'X' ? svgX() : svgO();
                cell.classList.add('occupied', state.subBoards[i][j].toLowerCase());
            }

            sub.appendChild(cell);
        }

        // Re-apply big SVG overlay if subgrid is won
        if (state.metaBoard[i] && state.metaBoard[i] !== 'draw') {
            const overlay = document.createElement('div');
            overlay.classList.add('won-overlay');
            overlay.innerHTML = state.metaBoard[i] === 'X' ? svgXBig() : svgOBig();
            sub.appendChild(overlay);
        }

        metaBoardEl.appendChild(sub);
    }
    initMiniGrid();
    updateUI();
    startTimer();

    // If it's AI turn after load, trigger it
    if (state.gameActive && state.currentPlayer === 'O') {
        triggerAI();
    }
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

    const cellTarget = e.target.closest('.cell');
    if (!cellTarget) return;

    const subIdx  = parseInt(cellTarget.dataset.sub);
    const cellIdx = parseInt(cellTarget.dataset.cell);
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
    saveToLocal();

    // AI
    if (state.gameActive && state.currentPlayer === 'O') {
        triggerAI();
    }
}

function triggerAI() {
    state.isAIThinking = true;
    metaBoardEl.classList.add('board-locked');
    aiThinkingRow.style.display = 'flex';
    setTimeout(() => {
        aiPlay();
        state.isAIThinking = false;
        metaBoardEl.classList.remove('board-locked');
        aiThinkingRow.style.display = 'none';
        saveToLocal();
    }, 600 + Math.random() * 400);
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
    const t = TRANSLATIONS[currentLang];

    // Turn symbol
    turnSymbolEl.innerHTML = isX ? svgX() : svgO();
    turnSymbolEl.className = 'turn-symbol ' + (isX ? 'cyan' : 'pink');
    turnSymbolEl.style.display = 'inline-flex';
    turnSymbolEl.style.width = '20px';
    turnSymbolEl.style.height = '20px';
    turnSymbolEl.style.verticalAlign = 'middle';

    // Status panel
    const pName = isX ? profile.name.toUpperCase() : t.aiUnit;
    statusTurnEl.textContent = `${pName} [${state.currentPlayer}]`;
    statusTurnEl.className = 'status-value ' + (isX ? 'cyan' : 'pink');

    // Scoreboard
    const xW = state.metaBoard.filter(v => v === 'X').length;
    const oW = state.metaBoard.filter(v => v === 'O').length;
    scoreXWinsEl.textContent = `${profile.wins + xW} Sub-Wins`;
    scoreOWinsEl.textContent = `${profile.aiWins + oW} Sub-Wins`;

    // Active sector
    activeSectorEl.textContent = state.activeSubGridIndex === -1 ? t.all : SECTOR_NAMES[state.activeSubGridIndex];

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
    const t = TRANSLATIONS[currentLang];

    if (winner === 'draw') {
        modalIconEl.innerHTML = '<span style="font-size:4rem;color:var(--text-dim)">—</span>';
        winnerTextEl.textContent = t.draw;
        winnerSubEl.textContent = t.drawMsg;
    } else if (winner === 'X') {
        modalIconEl.innerHTML = `<div style="width:64px;height:64px;margin:0 auto;">${svgXBig()}</div>`;
        winnerTextEl.textContent = t.victory;
        winnerTextEl.style.color = 'var(--cyan)';
        winnerSubEl.textContent = t.winMsg.replace('{name}', profile.name);
        profile.wins++;
    } else {
        modalIconEl.innerHTML = `<div style="width:64px;height:64px;margin:0 auto;">${svgOBig()}</div>`;
        winnerTextEl.textContent = t.defeat;
        winnerTextEl.style.color = 'var(--pink)';
        winnerSubEl.textContent = t.aiDefeatMsg;
        profile.aiWins++;
    }

    saveToLocal();
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
    saveToLocal();
    initBoard();
}

// ============================================================
// Profile & Language Logic
// ============================================================
function handleInit() {
    // 1. Language
    const savedLang = localStorage.getItem('utt_lang');
    if (savedLang && TRANSLATIONS[savedLang]) {
        currentLang = savedLang;
        langSelect.value = savedLang;
    } else {
        // Try browser language
        const browserLang = navigator.language;
        if (browserLang.startsWith('pt')) currentLang = 'pt-BR';
        else if (browserLang.startsWith('es')) currentLang = 'es-ES';
        else currentLang = 'en-GB';
        langSelect.value = currentLang;
    }
    updateLanguage(currentLang);

    // 2. Profile
    const savedProfile = localStorage.getItem('utt_profile');
    if (!savedProfile) {
        profileModal.classList.add('show');
    } else {
        profile = JSON.parse(savedProfile);
        playerXNameEl.textContent = profile.name.toUpperCase();
        bootGame();
    }
}

langSelect.addEventListener('change', (e) => {
    updateLanguage(e.target.value);
});

changeProfileBtn.addEventListener('click', () => {
    profileModal.classList.add('show');
});

resetScoreBtn.addEventListener('click', () => {
    profile.wins = 0;
    profile.aiWins = 0;
    saveToLocal();
    updateUI();
});

saveProfileBtn.addEventListener('click', () => {
    const val = usernameInput.value.trim();
    if (val) {
        profile.name = val;
        localStorage.setItem('utt_profile', JSON.stringify(profile));
        playerXNameEl.textContent = profile.name.toUpperCase();
        profileModal.classList.remove('show');
        bootGame();
    }
});

// ============================================================
// PWA Service Worker Registration
// ============================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW error', err));
    });
}

// ============================================================
// Boot
// ============================================================
function bootGame() {
    const continued = loadFromLocal();
    initBoard(continued);
}

// Events
resetBtn.addEventListener('click', resetGame);
modalResetBtn.addEventListener('click', resetGame);

// Start
handleInit();
