// Padel Riga Tracker - Premium v7.0
// Состояние приложения
let STORE = JSON.parse(localStorage.getItem('padel_riga_store')) || {
    currentPage: 'home',
    currentUser: null,
    players: [],
    tournament: {
        status: 'registration', // registration, live, finished
        maxPlayers: 12
    }
};

function persist() {
    localStorage.setItem('padel_riga_store', JSON.stringify(STORE));
}

function navigate(page) {
    STORE.currentPage = page;
    persist();
    render();
}

// Рендеринг приложения
function render() {
    const app = document.getElementById('app');
    const navInfo = document.getElementById('nav-info');
    
    if (!app) return;

    // Обновляем статус в навигации
    navInfo.innerHTML = STORE.currentUser 
        ? `Игрок: <span class="text-cyan">${STORE.currentUser.name}</span>` 
        : '<span class="text-dim">Вход не выполнен</span>';

    switch(STORE.currentPage) {
        case 'home':
            app.innerHTML = renderHome();
            break;
        case 'register':
            app.innerHTML = renderRegister();
            break;
        case 'profile':
            app.innerHTML = renderProfile();
            break;
        default:
            app.innerHTML = renderHome();
    }
}

function renderHome() {
    return `
        <div class="glass-panel p-5 text-center fade-in">
            <h1 class="display-5 font-bold mb-4" style="font-family: 'Rajdhani';">PADEL RIGA TRACKER</h1>
            <p class="text-secondary mb-5">Управляйте своими турнирами на новом технологическом уровне.</p>
            <div class="d-grid gap-3">
                <button onclick="navigate('register')" class="btn-premium">Участвовать в турнире</button>
                <button onclick="navigate('profile')" class="btn glass-panel text-white border-1">Профиль игрока</button>
            </div>
            <div class="mt-4 pt-4 border-top border-secondary opacity-50">
                <small class="text-dim">Участников: ${STORE.players.length} / ${STORE.tournament.maxPlayers}</small>
            </div>
        </div>
    `;
}

function renderRegister() {
    return `
        <div class="glass-panel p-4 fade-in">
            <h2 class="text-cyan mb-4" style="font-family: 'Rajdhani';">РЕГИСТРАЦИЯ</h2>
            <div class="mb-3 text-start">
                <label class="form-label small text-secondary">Ваше имя (Никнейм)</label>
                <input type="text" id="reg-name" class="form-control bg-transparent text-white border-secondary" placeholder="Введите имя...">
            </div>
            <div class="mb-4 text-start">
                <label class="form-label small text-secondary">Уровень мастерства (1.0 - 7.0)</label>
                <input type="number" id="reg-level" step="0.1" min="1" max="7" class="form-control bg-transparent text-white border-secondary" placeholder="4.5">
            </div>
            <button onclick="handleRegister()" class="btn-premium w-100 mb-2">Зарегистрироваться</button>
            <button onclick="navigate('home')" class="btn btn-link text-dim w-100">Отмена</button>
        </div>
    `;
}

function renderProfile() {
    if (!STORE.currentUser) {
        return `
            <div class="glass-panel p-4 text-center fade-in">
                <p class="mb-4">Сначала необходимо зарегистрироваться</p>
                <button onclick="navigate('register')" class="btn-premium">К регистрации</button>
            </div>
        `;
    }
    return `
        <div class="glass-panel p-4 fade-in">
            <h2 class="text-cyan mb-3" style="font-family: 'Rajdhani';">ПРОФИЛЬ</h2>
            <div class="mb-4 p-3 border border-secondary rounded">
                <div class="small text-secondary">Имя игрока:</div>
                <div class="h4">${STORE.currentUser.name}</div>
                <div class="small text-secondary mt-2">Ваш уровень:</div>
                <div class="h5">${STORE.currentUser.level}</div>
            </div>
            <button onclick="logout()" class="btn btn-outline-danger w-100">Выйти из профиля</button>
            <button onclick="navigate('home')" class="btn btn-link text-dim w-100 mt-2">Назад</button>
        </div>
    `;
}

// Логика действий
window.handleRegister = function() {
    const name = document.getElementById('reg-name').value;
    const level = document.getElementById('reg-level').value;

    if (!name || !level) {
        alert('Заполните все поля для регистрации!');
        return;
    }

    const newUser = { id: Date.now(), name, level: parseFloat(level) };
    STORE.players.push(newUser);
    STORE.currentUser = newUser;
    STORE.currentPage = 'profile';
    persist();
    render();
};

window.logout = function() {
    STORE.currentUser = null;
    STORE.currentPage = 'home';
    persist();
    render();
};

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', render);
