// --- STATE MANAGEMENT ---
let state = JSON.parse(localStorage.getItem('padelState')) || {
    players: [],
    waitingList: [],
    matches: [],
    settings: {
        maxPlayers: 16,
        startTime: new Date(Date.now() + 86400000 * 2).toISOString(), // +2 дня для теста
        totalDuration: 120, // минут
        transitionTime: 5,
        courts: 4
    }
};

function saveState() {
    localStorage.setItem('padelState', JSON.stringify(state));
}

// --- NAVIGATION ---
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(`screen-${screenId}`).classList.remove('hidden');
    
    // UI Update
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('text-blue-500', 'font-bold');
        btn.classList.add('text-slate-400');
    });
    event.target.classList.add('text-blue-500', 'font-bold');

    if(screenId === 'leaderboard') renderLeaderboard();
    if(screenId === 'registration') renderRegistration();
    if(screenId === 'live') renderLive();
}

// --- REGISTRATION LOGIC ---
function renderRegistration() {
    const isLocked = (new Date(state.settings.startTime) - new Date()) < 86400000;
    const btn = document.getElementById('btn-register');
    const deadlineInfo = document.getElementById('reg-deadline-info');

    if (isLocked) {
        btn.disabled = true;
        btn.innerText = "Регистрация закрыта (24ч до старта)";
        btn.classList.replace('bg-blue-600', 'bg-slate-700');
        deadlineInfo.innerText = "Список участников заморожен.";
    } else {
        deadlineInfo.innerText = `До конца регистрации: ${Math.floor((new Date(state.settings.startTime) - new Date())/3600000)} ч.`;
    }

    document.getElementById('count-main').innerText = state.players.length;
    document.getElementById('count-wait').innerText = state.waitingList.length;

    const mainListUI = document.getElementById('list-main');
    mainListUI.innerHTML = state.players.map(p => `<li>${p.name}</li>`).join('');
    
    const waitListUI = document.getElementById('list-wait');
    waitListUI.innerHTML = state.waitingList.map(p => `<li>${p.name}</li>`).join('');
}

function registerPlayer() {
    const nameInput = document.getElementById('player-name');
    if (!nameInput.value.trim()) return;

    const newPlayer = { id: Date.now(), name: nameInput.value.trim() };

    if (state.players.length < state.settings.maxPlayers) {
        state.players.push(newPlayer);
    } else {
        state.waitingList.push(newPlayer);
    }

    nameInput.value = '';
    saveState();
    renderRegistration();
}

// --- TIMING LOGIC ---
function calculateTiming() {
    const rounds = 7; // Для 16 человек/4 кортов
    const totalBuffer = rounds * state.settings.transitionTime;
    const netTime = state.settings.totalDuration - totalBuffer;
    let roundMin = netTime / rounds;

    // Золотой стандарт округления вниз [cite: 45]
    if (roundMin >= 20) roundMin = 20;
    else if (roundMin >= 15) roundMin = 15;
    else roundMin = Math.floor(roundMin);

    return { roundMin, totalBuffer };
}

// --- LIVE TOURNAMENT ---
function renderLive() {
    const timing = calculateTiming();
    document.getElementById('live-timing').innerHTML = `
        ⚡️ Сетка: 7 туров по <b>${timing.roundMin} мин</b><br>
        <span class="text-[10px] text-slate-400">Резерв на переходы: ${timing.totalBuffer} мин</span>
    `;

    // Если матчей нет - генерируем (только если регистрация закрыта)
    if (state.matches.length === 0 && state.players.length >= 4) {
        generateSchedule();
    }

    const grid = document.getElementById('match-grid');
    grid.innerHTML = state.matches.map((m, idx) => `
        <div class="match-card p-4 rounded-xl ${m.completed ? 'completed border-slate-800' : ''}">
            <div class="flex justify-between items-center mb-3">
                <span class="text-xs text-slate-500">Корт ${m.court}</span>
                ${m.completed ? `<span class="text-[10px] text-green-500 uppercase font-bold">OK: ${m.inputBy}</span>` : ''}
            </div>
            <div class="grid grid-cols-3 items-center gap-2 text-center">
                <div class="font-bold text-sm">${m.pair1}</div>
                <div class="flex gap-1 justify-center">
                    <input type="number" id="s1-${idx}" value="${m.score1}" ${m.completed ? 'disabled' : ''} class="w-8 h-8 bg-slate-800 text-center rounded">
                    <span class="text-slate-600">:</span>
                    <input type="number" id="s2-${idx}" value="${m.score2}" ${m.completed ? 'disabled' : ''} class="w-8 h-8 bg-slate-800 text-center rounded">
                </div>
                <div class="font-bold text-sm">${m.pair2}</div>
            </div>
            ${!m.completed ? `
                <button onclick="saveScore(${idx})" class="w-full mt-3 bg-slate-800 hover:bg-slate-700 py-1 text-xs rounded transition">Сохранить счет</button>
            ` : ''}
        </div>
    `).join('');
}

function generateSchedule() {
    // Временная заглушка генератора (фиксированные пары)
    // В версии 2.1 здесь будет алгоритм Round Robin
    for(let i=1; i<=4; i++) {
        state.matches.push({
            court: i,
            pair1: `Пара ${i}`,
            pair2: `Пара ${i+4}`,
            score1: 0,
            score2: 0,
            completed: false,
            inputBy: ''
        });
    }
    saveState();
}

function saveScore(idx) {
    const s1 = document.getElementById(`s1-${idx}`).value;
    const s2 = document.getElementById(`s2-${idx}`).value;
    
    // Псевдо-авторизация: берем первого из списка (в будущем - ID юзера) [cite: 23]
    state.matches[idx].score1 = parseInt(s1);
    state.matches[idx].score2 = parseInt(s2);
    state.matches[idx].completed = true;
    state.matches[idx].inputBy = "Игрок " + state.players[0].name.split(' ')[0]; 

    saveState();
    renderLive();
}

// Initial render
renderRegistration();
