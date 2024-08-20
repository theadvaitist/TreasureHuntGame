const chests = {
    'A1': [2, 4, 6, 8, 10, 12, 14, 16],
    'A2': [3, 6, 9, 12, 15, 18, 21, 24],
    'A3': [1, 1, 1, 1, 0.5, 0.5, 0.5, 50, 50, 50],
    'B1': [4, 8, 12, 16, 20, 24, 28, 32],
    'B2': [5, 10, 15, 20, 25, 30, 35, 40],
    'B3': [0.5, 0.5, 0.5, 0.25, 0.25, 0.25, 75, 75, 75]
};

let clickCount = 0;
let totalReward = 0;
let countdown;
let timeLeft = 30;
let trialsCompleted = 0;
let realGame = false;
let playerName = '';
let playerData = [];

function getRandomReward(chest) {
    const rewards = chests[chest];
    return rewards[Math.floor(Math.random() * rewards.length)];
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
    } else {
        endPhase();
    }
}

function endPhase() {
    clearInterval(countdown);
    document.querySelectorAll('.treasure-chest').forEach(chest => {
        chest.removeEventListener('click', handleChestClick);
    });
    if (realGame) {
        savePlayerData();
        document.getElementById('summary').textContent = `Game over! Total reward: ${totalReward} grams of gold.`;
        document.getElementById('feedback').textContent = '';
        realGame = false;
    } else {
        trialsCompleted++;
        document.getElementById('summary').textContent = `Trial ${trialsCompleted} completed! Reward: ${totalReward} grams of gold.`;
        if (trialsCompleted >= 4) {
            setTimeout(startRealGame, 3000);
        } else {
            setTimeout(startTrials, 3000);
        }
    }
}

function handleChestClick(event) {
    clickCount++;
    const chestId = event.target.id;
    const reward = getRandomReward(chestId);
    totalReward += reward;
    document.getElementById('feedback').textContent = `You chose ${chestId} and received: ${reward} grams of gold.`;
    document.getElementById('summary').textContent = `Total reward so far: ${totalReward} grams of gold.`;

    if (realGame) {
        playerData.push({ chestId, reward });
    }

    if (clickCount >= 4) {
        endPhase();
    }
}

function startTrials() {
    document.querySelectorAll('.treasure-chest').forEach(chest => {
        chest.addEventListener('click', handleChestClick);
    });
    document.getElementById('summary').textContent = `Trial ${trialsCompleted + 1} of 4.`;
    document.getElementById('feedback').textContent = '';
    clickCount = 0;
    totalReward = 0;
    timeLeft = 45;
    document.getElementById('timer').textContent = timeLeft;
    countdown = setInterval(updateTimer, 1000);
}

function startRealGame() {
    realGame = true;
    playerData = [];
    document.querySelectorAll('.treasure-chest').forEach(chest => {
        chest.addEventListener('click', handleChestClick);
    });
    document.getElementById('summary').textContent = `Real game starting now!`;
    document.getElementById('feedback').textContent = '';
    clickCount = 0;
    totalReward = 0;
    timeLeft = 60;
    document.getElementById('timer').textContent = timeLeft;
    countdown = setInterval(updateTimer, 1000);
}

function savePlayerData() {
    const playerInfo = {
        playerName,
        selections: playerData,
        totalReward
    };

    sendDataToGoogleSheet(playerInfo);

    // Clear the player data for the next game
    playerData = [];
}

function sendDataToGoogleSheet(playerInfo) {
    const sheetUrl = "https://script.google.com/macros/s/AKfycbw-wUnqrTJi8zxoCqea3vaVeQLQ_dJxW_31e7DZP2Av5T4ifTNwMoHZ-JOtD375cYQxZw/exec"; // Replace with your Google Sheets Web App URL

    const payload = JSON.stringify(playerInfo);

    fetch(sheetUrl, {
        method: 'POST',
        body: payload,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.text())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
}

document.getElementById('enterGame').addEventListener('click', function () {
    playerName = document.getElementById('playerName').value;
    if (playerName) {
        startTrials();
    } else {
        alert('Please enter your name to start the game.');
    }
});
