// --- STATE ---
let state = {
    currentTour: 2,
    myId: "player_1", // В будущем ID из авторизации
    tournaments: [
        { id: 1, name: "Padel Riga Open", status: "OPEN", registered: ["player_1", "player_2"] },
        { id: 2, name: "Friday Mix", status: "FINISHED", registered: [] }
    ],
    matches: [
        { id: 101, tour: 1, pair1: "Николай / Юрис", pair2: "Анна / Макс", score1: 6, score2: 4, status: "FINISHED" },
        { id: 102, tour: 2, court: 1, pair1: "Николай / Юрис", pair2: "Олег / Дима", score1: 0, score2: 0, status: "LIVE" },
        { id: 103, tour: 3, court: 2, pair1: "Николай / Юрис", pair2: "Иван / Петр", status: "FUTURE" }
    ]
};

// --- NAVIGATION ---
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(`screen-${screenId}`).classList.remove('hidden');
    
    // Bottom Nav Active State
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if(btn.onclick.toString().includes(screenId)) btn.classList.add('active');
    });

    if(screenId === 'dashboard') renderDashboard();
    if(screenId === 'live') renderLive();
}

// --- DASHBOARD LOGIC ---
function renderDashboard() {
    const myContainer = document.getElementById('my-tournaments');
    const availContainer = document.getElementById('available-tournaments');

    // Мои турниры (где есть мой ID)
    const myEvents = state.tournaments.filter(t => t.registered.includes(state.myId));
    myContainer.innerHTML = myEvents.length ? myEvents.map(t => `
        <div class="tournament-card bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
            <div class="flex justify-between items-center">
                <span class="font-bold">${t.name}</span>
                <span class="text-blue-500 text-xs font-bold">LIVE МОМЕНТ</span>
            </div>
        </div>
    `).join('') : "Нет активных участий";
}

// --- LIVE GRID LOGIC ---
function renderLive() {
    const grid = document.getElementById('match-grid');
    const tabs = document.getElementById('tour-tabs');

    // Генерируем табы туров (1-7)
    tabs.innerHTML = [1,2,3,4,5,6,7].map(t => `
        <button class="tour-tab ${state.currentTour === t ? 'active' : ''}" onclick="state.currentTour = ${t}; renderLive();">
            ТУР ${t}
        </button>
    `).join('');

    // Фильтруем матчи для выбранного тура
    const tourMatches = state.matches.filter(m => m.tour === state.currentTour);

    grid.innerHTML = tourMatches.map(m => {
        if (m.status === "FINISHED") {
            return `
                <div class="match-card finished flex justify-between items-center">
                    <div class="text-sm font-bold ${m.score1 > m.score2 ? 'text-green-500' : ''}">${m.pair1}</div>
                    <div class="bg-slate-800 px-3 py-1 rounded text-lg font-black">${m.score1}:${m.score2}</div>
                    <div class="text-sm font-bold ${m.score2 > m.score1 ? 'text-green-500' : ''}">${m.pair2}</div>
                </div>
            `;
        }
        
        if (m.status === "LIVE") {
            return `
                <div class="match-card live">
                    <div class="flex justify-between text-[10px] text-blue-500 font-bold mb-4 uppercase tracking-tighter">
                        <span>Корт ${m.court}</span>
                        <span>Ввести счет</span>
                    </div>
                    <div class="flex justify-between items-center gap-4">
                        <div class="flex-1 text-center font-bold text-sm leading-tight">${m.pair1}</div>
                        <div class="flex items-center gap-2">
                            <input type="number" class="score-input" value="${m.score1}">
                            <input type="number" class="score-input" value="${m.score2}">
                        </div>
                        <div class="flex-1 text-center font-bold text-sm leading-tight">${m.pair2}</div>
                    </div>
                    <button class="w-full bg-blue-600 mt-4 py-2 rounded-xl text-xs font-black uppercase">Сохранить результат</button>
                </div>
            `;
        }

        return `
            <div class="match-card future flex justify-between items-center border-dashed">
                <div class="text-xs text-slate-500">${m.pair1}</div>
                <div class="text-[10px] bg-slate-800/50 px-2 py-1 rounded text-slate-400 font-bold">VS</div>
                <div class="text-xs text-slate-500">${m.pair2}</div>
            </div>
        `;
    }).join('');
}

// Start
renderDashboard();
