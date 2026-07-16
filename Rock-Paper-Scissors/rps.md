# Rock Paper Scissors

A simple Rock Paper Scissors game built with plain HTML, CSS, and JavaScript. Play against the computer — your score is saved in the browser via localStorage, so it sticks around between visits.

## Features

- Play rock, paper, or scissors against a random CPU pick
- Win/loss/tie score tracked and saved locally
- Reset button to clear the score

## Getting started

Clone the repo, then open rps.html in your browser.

git clone https://github.com/darlington05/rock-paper-scissors.git

## Project structure

rock-paper-scissors/
├── rps.html   
├── rps.css    
└── rps.js    

## How it works

Clicking a choice button triggers playRound() in rps.js', which picks a random move for the CPU, compares it against a win/lose lookup table, updates the score, and saves it to localStorage as JSON. On page load, that saved score is read back in.