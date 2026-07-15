// Key used to store/retrieve the to-do list inside the browser's localStorage. Namespacing it with "ledger:" avoids clashing with other keys if this page ever shares a domain with other tools.
const STORAGE_KEY = 'ledger:items';

// In-memory copy of the list. This is the "source of truth" while the page is open — every add/toggle/delete updates this array first, then render() redraws the DOM from it, then save() writes it to localStorage.
let items = [];

// Cache references to the DOM elements we touch repeatedly, so we don't call document.getElementById() over and over inside functions.
const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const statusEl = document.getElementById('status');
const form = document.getElementById('entry-form');
const input = document.getElementById('entry-input');

// Set the date in the header once, on page load. Doesn't need to update live since a to-do list page isn't usually left open across midnight.
document.getElementById('today').textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric'
});

// Formats a timestamp (milliseconds since epoch) into a short date label, e.g. "Jul 15", used next to each item to show when it was added.
function fmtTime(ts) {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Runs once when the page loads. localStorage only stores strings, so the array was saved as a JSON string — we have to JSON.parse() it back into a real array before using it. Wrapped in try/catch because localStorage can throw (e.g. private/incognito mode, or corrupted data that isn't valid JSON) and we don't want that to crash the whole page.
function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        items = raw ? JSON.parse(raw) : [];
        statusEl.textContent = 'saved in this browser';
    } catch (e) {
        items = [];
        statusEl.textContent = 'could not load saved items';
    }
    render();
}

// Writes the current items array back to localStorage as a JSON string. Called after every change (add, toggle, delete) so the saved copy never falls out of sync with what's on screen. try/catch guards against storage being full or disabled by the browser.
function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        statusEl.textContent = 'saved in this browser';
    } catch (e) {
        statusEl.textContent = 'could not save — storage may be full or disabled';
    }
}

// Rebuilds the entire visible list from the items array. This is a "full re-render" approach rather than surgically patching individual DOM nodes — simpler to reason about and plenty fast for a list this size, at the cost of being less efficient than a framework's diffing (not something to worry about here, but worth knowing why frameworks like React exist).
function render() {
    // Wipe the list and start fresh each time render() is called.
    listEl.innerHTML = '';
    emptyEl.style.display = items.length === 0 ? 'block' : 'none';

    // Recalculate the open/closed counts shown at the top every render, rather than tracking them as separate variables that could drift out of sync with the actual array contents.
    const openCount = items.filter(i => !i.done).length;
    const doneCount = items.length - openCount;
    document.getElementById('tally-open').textContent = openCount + ' open';
    document.getElementById('tally-done').textContent = doneCount + ' closed';

    items
        // .slice() copies the array before sorting, so we don't mutate the original `items` order — that order still reflects insertion order.
        .slice()
        // Sort open items (done === false) before done items. Since false is 0 and true is 1, `a.done - b.done` pushes false (open) first. Within the same group, sort by creation time so items appear in the order they were added.
        .sort((a, b) => a.done - b.done || a.created - b.created)
        .forEach(item => {
            // Build one <li> row per item, entirely in JS (no HTML templating library) — each piece (checkbox, label, date stamp, delete button) is created and assembled by hand.
            const li = document.createElement('li');
            li.className = 'row' + (item.done ? ' done' : '');

            const check = document.createElement('button');
            check.className = 'check' + (item.done ? ' done' : '');
            check.setAttribute('aria-label', item.done ? 'Mark as open' : 'Mark as done');
            check.innerHTML = '<svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="currentColor" stroke-width="1.6"/></svg>';
            // Each button's click handler captures this specific item's id via closure, so clicking it only affects this row, not the whole list.
            check.onclick = () => toggle(item.id);

            const label = document.createElement('span');
            label.className = 'label';
            // textContent (not innerHTML) is used deliberately here — it treats the item text as plain text rather than HTML, which avoids accidentally running any HTML/script a user might type in.
            label.textContent = item.text;

            const stamp = document.createElement('span');
            stamp.className = 'stamp';
            stamp.textContent = fmtTime(item.created);

            const remove = document.createElement('button');
            remove.className = 'remove';
            remove.setAttribute('aria-label', 'Delete item');
            remove.textContent = '×';
            remove.onclick = () => removeItem(item.id);

            li.appendChild(check);
            li.appendChild(label);
            li.appendChild(stamp);
            li.appendChild(remove);
            listEl.appendChild(li);
        });
}

// Flips one item's done state by id. Uses .map() to build a brand new array rather than mutating the existing item object in place — this keeps the update predictable (no item is changed unless its id matches) and is a common pattern once you move to frameworks like React, wheremutating state directly can cause bugs.
function toggle(id) {
    items = items.map(i => i.id === id ? { ...i, done: !i.done } : i);
    render();
    save();
}

// Removes one item by id using .filter() — keeps every item except the one whose id matches, producing a new array without that item.
function removeItem(id) {
    items = items.filter(i => i.id !== id);
    render();
    save();
}

// Handles the "add item" form submission.
form.addEventListener('submit', (e) => {
    // Prevent the browser's default form behavior, which would reload the page (forms submit to a server by default unless you stop that).
    e.preventDefault();

    const text = input.value.trim();
    // Guard clause: don't add empty/whitespace-only entries.
    if (!text) return;

    items.push({
        // A simple unique id: current timestamp plus a short random string, so two items added in the same millisecond still get different ids. (Good enough for a local single-user list; a real multi-user backend would generate ids server-side instead.)
        id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        text,
        done: false,
        created: Date.now()
    });

    input.value = '';
    render();
    save();
});

load();