# Ledger — a simple to-do list
A small to-do list built with plain HTML, CSS, and JavaScript. Items are saved in the browser via localStorage, so your list stays there when you reload or close the page.

## Features
- Add, complete, and delete items
- Open/closed count at the top
- Each item stamped with the date it was added

## Getting started
Clone the repo, then open "ledger.html" in your browser.

git clone https://github.com/darlington05/ledger.git

## Project structure
ledger/
├── ledger.html   
├── ledger.css   
└── ledger.js    

## How it works
Items are kept in an array in "ledger.js". Every add/toggle/delete updates that array, redraws the list, and saves it to localStorage as JSON. On load, that JSON is read back and parsed into the array again.
