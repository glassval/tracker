// Timer Variables
let timerInterval = null;
let totalSeconds = 0;
let isRunning = false;
let isWorkSession = true;
let workDuration = 25 * 60; // 25 minutes in seconds
let breakDuration = 5 * 60; // 5 minutes in seconds
let currentSessionSeconds = 0;
let totalWorkSeconds = 0;
let totalBreakSeconds = 0;
let sessionsCompleted = 0;

// Audio Variables
let currentAudioChunk = null;
const totalAudioChunks = 7; // lofimusic_part0.mp3 through lofimusic_part6.mp3
const excludedTrack = 6; // Track 6 is excluded

// Checklist Variables
let items = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeTimer();
    initializeChecklist();
    initializeAudio();
});

// ==================== AUDIO FUNCTIONALITY ====================
function getRandomTrack() {
    let randomTrack;
    do {
        randomTrack = Math.floor(Math.random() * totalAudioChunks);
    } while (randomTrack === excludedTrack);
    return randomTrack;
}

function initializeAudio() {
    const audio = document.getElementById('lofiAudio');
    // When a chunk finishes, load a random one
    audio.addEventListener('ended', () => {
        if (isRunning && isWorkSession) {
            // Load a new random track (excluding track 6)
            const newTrack = getRandomTrack();
            currentAudioChunk = newTrack;
            loadAudioChunk(currentAudioChunk);
            audio.play().catch(err => console.log('Note: autoplay may be restricted'));
        }
    });
}

function loadAudioChunk(chunkIndex) {
    const audio = document.getElementById('lofiAudio');
    const source = audio.querySelector('source');
    source.src = `lofimusic_part${chunkIndex}.mp3`;
    audio.load();
}

// ==================== TIMER FUNCTIONALITY ====================
function initializeTimer() {
    const startBtn = document.getElementById('start');
    const pauseBtn = document.getElementById('pause');
    const resetBtn = document.getElementById('reset');
    const workInput = document.getElementById('workInput');
    const breakInput = document.getElementById('breakInput');

    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    workInput.addEventListener('change', (e) => {
        workDuration = parseInt(e.target.value) * 60;
        if (!isRunning) {
            resetTimer();
        }
    });
    
    breakInput.addEventListener('change', (e) => {
        breakDuration = parseInt(e.target.value) * 60;
        if (!isRunning) {
            resetTimer();
        }
    });
    
    updateTimerDisplay();
    updateTimeStats();
}

function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    
    // Play lofi music when starting work session
    if (isWorkSession) {
        const audio = document.getElementById('lofiAudio');
        // Load a random track and play
        currentAudioChunk = getRandomTrack();
        loadAudioChunk(currentAudioChunk);
        audio.play().catch(err => console.log('Note: autoplay may be restricted'));
    }
    
    timerInterval = setInterval(() => {
        currentSessionSeconds++;
        
        // Track total time
        if (isWorkSession) {
            totalWorkSeconds++;
        } else {
            totalBreakSeconds++;
        }
        
        const sessionDuration = isWorkSession ? workDuration : breakDuration;
        
        if (currentSessionSeconds >= sessionDuration) {
            // Switch sessions
            const wasWork = isWorkSession;
            isWorkSession = !isWorkSession;
            currentSessionSeconds = 0;
            
            if (wasWork) {
                sessionsCompleted++;
                // Pause music when work session ends
                const audio = document.getElementById('lofiAudio');
                audio.pause();
            } else {
                // Resume music when break ends and work starts
                const audio = document.getElementById('lofiAudio');
                currentAudioChunk = getRandomTrack();
                loadAudioChunk(currentAudioChunk);
                audio.play().catch(err => console.log('Note: autoplay may be restricted'));
            }
            
            updateSessionDisplay();
        }
        
        updateTimerDisplay();
        updateTimeStats();
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    // Pause music as well
    const audio = document.getElementById('lofiAudio');
    audio.pause();
}

function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    currentSessionSeconds = 0;
    isWorkSession = true;
    currentAudioChunk = null;
    // Stop and reset music
    const audio = document.getElementById('lofiAudio');
    audio.pause();
    audio.currentTime = 0;
    loadAudioChunk(1);
    updateSessionDisplay();
    updateTimerDisplay();
    updateTimeStats();
}

function updateTimerDisplay() {
    const sessionDuration = isWorkSession ? workDuration : breakDuration;
    const secondsRemaining = sessionDuration - currentSessionSeconds;
    
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    const timeString = 
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');

    document.getElementById('timerdisplay').textContent = timeString;
}

function updateSessionDisplay() {
    const sessionType = document.getElementById('sessionType');
    sessionType.textContent = isWorkSession ? 'Work' : 'Break';
    
    // Change styling based on session type
    const timerDiv = document.getElementById('timer');
    if (isWorkSession) {
        timerDiv.style.background = 'linear-gradient(45deg, #ff6b35, #ff8c42, #ffa500, #ffb84d, #ffc666)';
        sessionType.style.color = '#d9350a';
    } else {
        timerDiv.style.background = 'linear-gradient(45deg, #4facfe, #00f2fe, #43e97b, #5ce1e6)';
        sessionType.style.color = '#0277bd';
    }
}

// ==================== CHECKLIST FUNCTIONALITY ====================
function initializeChecklist() {
    const input = document.getElementById('itemInput');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });
    
    renderChecklist();
}

function addItem() {
    const input = document.getElementById('itemInput');
    const itemText = input.value.trim();

    if (itemText === '') {
        alert('Please enter an item');
        return;
    }

    const item = {
        id: Date.now(),
        text: itemText,
        completed: false
    };

    items.push(item);
    input.value = '';
    renderChecklist();
    updateStats();
}

function toggleItem(id) {
    const item = items.find(i => i.id === id);
    if (item) {
        item.completed = !item.completed;
        renderChecklist();
        updateStats();
    }
}

function deleteItem(id) {
    items = items.filter(i => i.id !== id);
    renderChecklist();
    updateStats();
}

function renderChecklist() {
    const checklistItems = document.getElementById('checklistItems');
    
    if (items.length === 0) {
        checklistItems.innerHTML = '<li class="empty-message">No items yet. Add one to get started!</li>';
        return;
    }

    checklistItems.innerHTML = items.map(item => `
        <li class="checklist-item ${item.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                ${item.completed ? 'checked' : ''} 
                onchange="toggleItem(${item.id})"
                class="item-checkbox"
            >
            <span class="item-text">${escapeHtml(item.text)}</span>
            <button class="delete-btn" onclick="deleteItem(${item.id})">×</button>
        </li>
    `).join('');
}

// ==================== STATS FUNCTIONALITY ====================
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
}

function updateTimeStats() {
    const statsDiv = document.getElementById('stats');
    const total = items.length;
    const completed = items.filter(i => i.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    const totalTime = totalWorkSeconds + totalBreakSeconds;

    statsDiv.innerHTML = `
        <div class="stats-content">
            <div class="stats-section">
                <h3>Task Progress</h3>
                <p class="stat-item">Total Items: <span class="stat-value">${total}</span></p>
                <p class="stat-item">Completed: <span class="stat-value">${completed}</span></p>
                <p class="stat-item">Progress: <span class="stat-value">${percentage}%</span></p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
            <div class="stats-section">
                <h3>Time Stats</h3>
                <p class="stat-item">Work Time: <span class="stat-value">${formatTime(totalWorkSeconds)}</span></p>
                <p class="stat-item">Break Time: <span class="stat-value">${formatTime(totalBreakSeconds)}</span></p>
                <p class="stat-item">Total Time: <span class="stat-value">${formatTime(totalTime)}</span></p>
                <p class="stat-item">Sessions: <span class="stat-value">${sessionsCompleted}</span></p>
            </div>
        </div>
    `;
}

function updateStats() {
    updateTimeStats();
}

// ==================== UTILITY FUNCTIONS ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
