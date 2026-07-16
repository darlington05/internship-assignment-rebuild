// The three valid moves. Used both to generate the CPU's random pick and to look up win/lose relationships below.
const CHOICES = ['rock', 'paper', 'scissors'];

// Emoji shown in the "hand" circles for each choice.
const ICONS = { rock: '🪨', paper: '📄', scissors: '✂️' };

// Defines what each move beats. Read as: "rock BEATS scissors", "paper BEATS rock", "scissors BEATS paper". This one lookup table replaces what would otherwise be a long if/else chain of every possible matchup.
const BEATS = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
};

const STORAGE_KEY = 'rps:score';

// Running score for the session. Loaded from localStorage on start so it survives a page refresh, same idea as the to-do list's persistence.
let score = { player: 0, cpu: 0, ties: 0 };

const playerScoreEl = document.getElementById('player-score');
const cpuScoreEl = document.getElementById('cpu-score');
const tieScoreEl = document.getElementById('tie-score');
const playerHandEl = document.getElementById('player-hand');
const cpuHandEl = document.getElementById('cpu-hand');
const resultEl = document.getElementById('result');
const resetBtn = document.getElementById('reset-btn');

// Restores the saved score, if any, when the page loads.
function loadScore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) score = JSON.parse(raw);
    } catch (e) {
        // If saved data is missing or corrupted, just start fresh at 0-0-0 rather than breaking the page.
        score = { player: 0, cpu: 0, ties: 0 };
    }
    renderScore();
}

function saveScore() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
    } catch (e) {
        // Non-critical if this fails — the game still works for the current session, it just won't persist across a reload.
    }
}

function renderScore() {
    playerScoreEl.textContent = score.player;
    cpuScoreEl.textContent = score.cpu;
    tieScoreEl.textContent = score.ties;
}

// Decides the outcome of one round from the player's perspective. Returns 'win', 'lose', or 'tie'.
function decideOutcome(player, cpu) {
    if (player === cpu) return 'tie';
    // BEATS[player] gives the move that `player` beats. If that matches the CPU's move, the player wins; otherwise the CPU wins.
    return BEATS[player] === cpu ? 'win' : 'lose';
}

// Runs one full round: called when the player clicks a choice button.
function playRound(playerChoice) {
    // Pick a random index into CHOICES for the CPU's move.
    const cpuChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    const outcome = decideOutcome(playerChoice, cpuChoice);

    // Show both hands, and retrigger the "pop" animation by removing then re-adding the class (browsers won't replay a CSS animation on an element that already has the class applied).
    playerHandEl.textContent = ICONS[playerChoice];
    cpuHandEl.textContent = ICONS[cpuChoice];
    [playerHandEl, cpuHandEl].forEach(el => {
        el.classList.remove('played');
        void el.offsetWidth; // forces the browser to acknowledge the removal
        el.classList.add('played');
    });

    // Update the running score based on the outcome.
    if (outcome === 'win') score.player++;
    else if (outcome === 'lose') score.cpu++;
    else score.ties++;

    renderScore();
    saveScore();
    showResult(outcome, playerChoice, cpuChoice);
}

// Updates the result message and its color (win/lose/tie) below the arena.
function showResult(outcome, playerChoice, cpuChoice) {
    resultEl.classList.remove('win', 'lose', 'tie');
    resultEl.classList.add(outcome);

    if (outcome === 'tie') {
        resultEl.textContent = `Tie — you both chose ${playerChoice}`;
    } else if (outcome === 'win') {
        resultEl.textContent = `You win — ${playerChoice} beats ${cpuChoice}`;
    } else {
        resultEl.textContent = `You lose — ${cpuChoice} beats ${playerChoice}`;
    }
}

// Wire up each of the three choice buttons. data-choice on each button (set in index.html) tells us which move was clicked.
document.querySelectorAll('.choice').forEach(btn => {
    btn.addEventListener('click', () => playRound(btn.dataset.choice));
});

resetBtn.addEventListener('click', () => {
    score = { player: 0, cpu: 0, ties: 0 };
    renderScore();
    saveScore();
    playerHandEl.textContent = '?';
    cpuHandEl.textContent = '?';
    resultEl.classList.remove('win', 'lose', 'tie');
    resultEl.textContent = 'Choose a hand to start';
});

loadScore();