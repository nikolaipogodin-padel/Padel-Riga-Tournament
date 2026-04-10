// [cite: 13, 20]
let state = {
    currentScreen: 'dashboard',
    players: JSON.parse(localStorage.getItem('padel_players')) || [],
    waitingList: JSON.parse(localStorage.getItem('padel_waiting')) || [],
    currentTour: 1,
    matches: []
};

// Функция переключения экранов [cite: 15]
function switchScreen(screenId) {
    state.currentScreen = screenId;
    
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    
    // Показываем нужный
    const target = document.getElementById(`screen-${screenId}`);
    if(target) target.classList.remove('hidden');

    // Обновляем навигацию
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('onclick').includes(screenId)) btn.classList.add('active');
    });

    // Вызываем рендер специфичный для экрана
    if(screenId === 'registration') renderRegistration();
    if(screenId === 'dashboard') renderDashboard();
    if(screenId === 'live') renderLive();
    if(screenId === 'leaderboard') renderLeaderboard();
}

// Логика регистрации [cite: 17, 36, 41]
function handleRegister() {
    const input = document.getElementById('player-name-input');
    const name = input.value.trim();
    
    if(!name) return;

    if(state.players.length < 16) {
        state.players.push(name);
    } else {
        state.waitingList.push(name);
    }

    input.value = '';
    localStorage.setItem('padel_players', JSON.stringify(state.players));
    localStorage.setItem('padel_waiting', JSON.stringify(state.waitingList));
    
    renderRegistration();
    renderDashboard(); // Обновляем счетчик на главном
}

function renderRegistration() {
    const mainList = document.getElementById('list-main');
    const waitList = document.getElementById('list-wait');
    
    mainList.innerHTML = state.players.map(p => `
        <li class="bg-[#161b22] p-3 rounded-lg flex justify-between border border-white/5">${p}</li>
    `).join('');
    
    waitList.innerHTML = state.waitingList.map(p => `
        <li>${p}</li>
    `).join('');

    document.getElementById('count-main').innerText = state.players.length;
    document.getElementById('count-wait').innerText = state.waitingList.length;
}

function renderDashboard() {
    document.getElementById('reg-count-display').innerText = state.players.length;
    const myCont = document.getElementById('my-tournaments');
    // Временно для теста: если игрок есть в списке, показываем "Вы участвуете"
    if(state.players.length > 0) {
        myCont.innerHTML = `<div class="bg-blue-600/10 border border-blue-500/30 p-4 rounded-2xl text-xs font-bold text-blue-400">Padel Riga Open: Вы в списке!</div>`;
    }
}

function renderLive() {
    const tabs = document.getElementById('tour-tabs');
    tabs.innerHTML = [1,2,3,4,5,6,7].map(t => `
        <button class="tour-tab ${state.currentTour === t ? 'active' : ''}" onclick="state.currentTour=${t}; renderLive();">ТУР ${t}</button>
    `).join('');
    
    document.getElementById('current-tour-label').innerText = `Тур ${state.currentTour}`;
    
    const grid = document.getElementById('match-grid');
    grid.innerHTML = `<div class="text-center py-10 text-slate-600 text-xs italic">Сетка будет сформирована за 24 часа до старта [cite: 41, 55]</div>`;
}

function renderLeaderboard() {
    const body = document.getElementById('leaderboard-body');
    body.innerHTML = state.players.map(p => `
        <tr class="border-b border-white/5">
            <td class="p-4 font-bold">${p}</td>
            <td class="p-4 text-center text-slate-400">0</td>
            <td class="p-4 text-right text-blue-500 font-black">0</td>
        </tr>
    `).join('');
}

// Инициализация
window.onload = () => {
    switchScreen('dashboard');
};
