function flipCoin() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Math.random() gives a number between 0 and 1
            const result = Math.random() > 0.5 ? "heads" : "tails";
            resolve(result);
        }, 1000); // 1000 milliseconds = 1 second
    });
}

// Testing it out:
flipCoin().then(result => console.log("Coin flip result:", result));

async function getUserInfo() {
    try {
        const response = await fetch('/api/user');
        const user = await response.json();
        console.log('User name:', user.name);
        return user;
    } catch (error) {
        console.error("Failed to fetch user info:", error);
    }
}

const fs = require('fs');

function readMyFile(filePath) {
    // utf8 ensures the file reads as text, not raw binary buffer data
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the file:", err);
            return;
        }
        console.log("File Contents:\n", data);
    });
}

// To test this, you'd create a quick 'sample.txt' file and run:
// readMyFile('sample.txt');