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
let timeLeft = 120;
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

    if (clickCount >= 12) {
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
    timeLeft = 120;
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
    timeLeft = 240;
    document.getElementById('timer').textContent = timeLeft;
    countdown = setInterval(updateTimer, 1000);
}

function savePlayerData() {
    const playerInfo = {
        playerName,
        selections: playerData,
        totalReward
    };

    saveDataToCSV(playerInfo);

    // Clear the player data for the next game
    playerData = [];
}

function saveDataToCSV(playerInfo) {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Player Name,Chest,Reward,Total Reward\n";

    playerInfo.selections.forEach(selection => {
        csvContent += `${playerInfo.playerName},${selection.chestId},${selection.reward},${playerInfo.totalReward}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `player_data_${playerInfo.playerName}.csv`);
    document.body.appendChild(link);

    link.click();
}

document.getElementById('enterGame').addEventListener('click', function () {
    playerName = document.getElementById('playerName').value;
    if (playerName) {
        startTrials();
    } else {
        alert('Please enter your name to start the game.');
    }
});
