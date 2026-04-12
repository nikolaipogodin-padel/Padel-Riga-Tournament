/**
 * Padel Riga Tracker - Premium v7.0
 * Full Application Logic
 */

// 1. Состояние приложения (Store)
let STORE = {
    currentPage: 'home',
    currentUser: JSON.parse(localStorage.getItem('pr_user')) || null,
    players: JSON.parse(localStorage.getItem('pr_players')) || [],
    settings: {
        maxPlayers: 12,
        courtCount: 3
    }
};

// 2. Инициализация при загрузке
window.onload = () => {
    render();
    setupValidationListeners();
};

// 3. Навигация
function navigate(page) {
    STORE.currentPage = page;
    render();
    if (page === 'register') setupValidationListeners();
}

// 4. Основной Рендеринг
function render() {
    const app = document.getElementById('app');
    const navInfo = document.getElementById('nav-info');
    
    // Обновляем статус в навигации
    navInfo.innerHTML = STORE.currentUser 
        ? `Игрок: <span class="text-cyan font-bold">${STORE.currentUser.name}</span>` 
        : '<span class="badge bg-secondary">Guest Mode</span>';

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

// --- Компоненты страниц ---

function renderHome() {
    const registeredCount = STORE.players.length;
    return `
        <div class="glass-panel p-5 text-center animate-fade-in">
            <h1 class="display-4 font-bold mb-3" style="font-family: 'Rajdhani'; letter-spacing: 3px;">
                WELCOME TO <span class="text-cyan">LIVE</span>
            </h1>
            <p class="text-secondary mb-5">Зарегистрировано участников: ${registeredCount} / ${STORE.settings.maxPlayers}</p>
            
            <div class="d-grid gap-3">
                <button onclick="navigate('register')" class="btn-premium">
                    ${STORE.currentUser ? 'Изменить регистрацию' : 'Записаться на турнир'}
                </button>
                <button onclick="navigate('profile')" class="btn glass-panel text-white border-secondary">
                    Личный кабинет
                </button>
            </div>
            
            ${registeredCount > 0 ? `
                <div class="mt-5 pt-4 border-top border-secondary">
                    <p class="small text-uppercase text-dim">Список участников</p>
                    <div class="d-flex flex-wrap justify-content-center gap-2">
                        ${STORE.players.map(p => `<span class="badge rounded-pill border border-info text-cyan">${p.name}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderRegister() {
    return `
        <div class="glass-panel p-4 animate-fade-in">
            <h2 class="text-cyan mb-4" style="font-family: 'Rajdhani';">РЕГИСТРАЦИЯ ТУРНИРА</h2>
            
            <div class="mb-3">
                <label class="form-label small text-secondary text-uppercase">Ваше Имя / Никнейм</label>
                <input type="text" id="reg-name" 
                    class="form-control bg-transparent text-white border-secondary" 
                    placeholder="Напр: Николай" 
                    value="${STORE.currentUser ? STORE.currentUser.name : ''}">
            </div>
            
            <div class="mb-4">
                <label class="form-label small text-secondary text-uppercase">Уровень Игры (1.0 - 7.0)</label>
                <input type="number" id="reg-level" step="0.1" min="1" max="7" 
                    class="form-control bg-transparent text-white border-secondary" 
                    placeholder="Ваш уровень..." 
                    value="${STORE.currentUser ? STORE.currentUser.level : ''}">
                <div id="level-hint" class="form-text text-dim small">4.0 - средний, 5.0+ - продвинутый</div>
            </div>

            <div id="validation-msg" class="text-pink small mb-3" style="display:none;">Пожалуйста, заполните все поля корректно</div>

            <button id="btn-submit-reg" onclick="handleRegister()" class="btn-premium w-100" disabled>
                Подтвердить участие
            </button>
            <button onclick="navigate('home')" class="btn btn-link text-dim w-100 mt-2 text-decoration-none">Отмена</button>
        </div>
    `;
}

function renderProfile() {
    if (!STORE.currentUser) {
        return `
            <div class="glass-panel p-5 text-center">
                <h3 class="text-white">Вход не выполнен</h3>
                <button onclick="navigate('register')" class="btn-premium mt-3">Зарегистрироваться</button>
            </div>
        `;
    }
    return `
        <div class="glass-panel p-4 animate-fade-in text-center">
            <div class="mb-4">
                <div class="display-1 text-cyan mb-2">👤</div>
                <h2 class="text-white">${STORE.currentUser.name}</h2>
                <span class="badge bg-info text-dark">Уровень: ${STORE.currentUser.level}</span>
            </div>
            <button onclick="logout()" class="btn btn-outline-danger btn-sm mt-4">Выйти из профиля</button>
            <button onclick="navigate('home')" class="btn btn-link text-dim w-100 mt-2">Назад</button>
        </div>
    `;
}

// --- Логика обработки ---

function setupValidationListeners() {
    const nameInput = document.getElementById('reg-name');
    const levelInput = document.getElementById('reg-level');
    const btn = document.getElementById('btn-submit-reg');

    if (!nameInput || !levelInput) return;

    const validate = () => {
        const isNameValid = nameInput.value.trim().length >= 2;
        const levelVal = parseFloat(levelInput.value);
        const isLevelValid = !isNaN(levelVal) && levelVal >= 1 && levelVal <= 7;
        
        btn.disabled = !(isNameValid && isLevelValid);
        document.getElementById('validation-msg').style.display = (btn.disabled && (nameInput.value || levelInput.value)) ? 'block' : 'none';
    };

    nameInput.addEventListener('input', validate);
    levelInput.addEventListener('input', validate);
}

function handleRegister() {
    const name = document.getElementById('reg-name').value;
    const level = document.getElementById('reg-level').value;

    const userData = { id: Date.now(), name, level };
    
    STORE.currentUser = userData;
    localStorage.setItem('pr_user', JSON.stringify(userData));

    // Добавляем в список игроков, если еще нет
    if (!STORE.players.find(p => p.name === name)) {
        STORE.players.push(userData);
        localStorage.setItem('pr_players', JSON.stringify(STORE.players));
    }

    navigate('home');
}

function logout() {
    localStorage.removeItem('pr_user');
    STORE.currentUser = null;
    navigate('home');
}
