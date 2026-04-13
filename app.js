/**
 * Padel Riga Tracker - Core Engine v7.0
 * Чистый Vanilla JS. Только дополнения, без переписывания.
 */

const STORAGE_KEY = 'padel-riga-tracker-v30';

// --- INITIAL STORE ---
const STORE = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  users: [],
  tournaments: [
    {
      id: 't1',
      title: 'Padel Weekend Riga',
      date: '24 Мая, 10:00',
      status: 'OPEN',
      maxPlayers: 16,
      participants: [], // ТЗ v7.0: Здесь хранятся только ID (строки)
      totalTime: 120,
      courts: 2,
      buffer: 5,
      rounds: 4,
      club: 'Padel Arena'
    }
  ],
  user: null, // Текущий залогиненный объект
  currentScreen: 'dashboard'
};

// --- ENGINE (Раздел 5 ТЗ) ---
const Engine = {
  calculateTourDuration: (t) => {
    // Формула: (totalTime - buffer * (rounds - 1)) / rounds
    return (t.totalTime - t.buffer * (t.rounds - 1)) / t.rounds;
  },
  
  getParticipants: (tournament) => {
    // Получаем полные объекты пользователей по их ID
    return tournament.participants.map(id => STORE.users.find(u => u.id === id)).filter(Boolean);
  }
};

// --- CORE FUNCTIONS ---
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STORE));
}

function uuid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

// --- VALIDATION (BUG-002) ---
window.validateRegForm = function() {
  const name = document.getElementById('reg-name')?.value.trim();
  const phone = document.getElementById('reg-phone')?.value.trim();
  const pass = document.getElementById('reg-pass')?.value.trim();
  const btn = document.getElementById('submit-reg-btn');
  
  if (!btn) return;

  const isPhoneValid = /^\+371\d{8}$/.test(phone);
  const isNameValid = name && name.length >= 2;
  const isPassValid = pass && pass.length >= 4;

  btn.disabled = !(isPhoneValid && isNameValid && isPassValid);
  
  const phoneErr = document.getElementById('phone-error');
  if (phoneErr) {
    phoneErr.style.display = (phone.length > 4 && !isPhoneValid) ? 'block' : 'none';
  }
};

// --- ACTIONS ---
window.handleRegistration = function() {
  const name = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const pass = document.getElementById('reg-pass').value.trim();
  const level = document.getElementById('reg-level').value;

  const newUser = {
    id: uuid('user'),
    name,
    phone,
    password: pass,
    level: parseFloat(level),
    avatar: null
  };

  STORE.users.push(newUser);
  STORE.user = newUser;
  STORE.currentScreen = 'dashboard';
  persist();
  render();
};

window.joinTournament = function(tId) {
  const t = STORE.tournaments.find(i => i.id === tId);
  if (!t || !STORE.user) return;

  // BUG-001 FIX: Проверяем наличие ID, а не объекта
  if (!t.participants.includes(STORE.user.id)) {
    if (t.participants.length < t.maxPlayers) {
      t.participants.push(STORE.user.id);
      if (t.participants.length === t.maxPlayers) t.status = 'FULL';
    } else {
      alert("Турнир заполнен. Логика Waitlist будет в v7.1");
    }
    persist();
    render();
  }
};

// --- ROUTER ---
window.router = {
  navigate: (screen) => {
    STORE.currentScreen = screen;
    persist();
    render();
  }
};

// --- SCREENS ---
const Screens = {
  dashboard: () => `
    <div class="px-6 py-4">
      <h2 class="text-xl font-bold mb-4">Ближайшие турниры</h2>
      ${STORE.tournaments.map(t => `
        <div class="glass-card mb-4">
          <div class="flex justify-between items-start mb-2">
            <span class="status-pill">${t.status}</span>
            <span class="text-xs text-gray-400">👥 ${t.participants.length}/${t.maxPlayers}</span>
          </div>
          <h3 class="text-lg font-black">${t.title}</h3>
          <p class="text-sm text-gray-400 mb-4">${t.date} • ${t.club}</p>
          <div class="flex items-center justify-between">
             <span class="text-[10px] text-gray-500">Duration: ${Engine.calculateTourDuration(t)} min/round</span>
             <button onclick="joinTournament('${t.id}')" class="btn-primary py-2 px-6 text-xs" 
                ${t.status === 'FULL' || t.participants.includes(STORE.user?.id) ? 'disabled' : ''}>
                ${t.participants.includes(STORE.user?.id) ? 'Вы идете' : 'Записаться'}
             </button>
          </div>
        </div>
      `).join('')}
    </div>
  `,

  registration: () => `
    <div class="px-8 pt-12">
      <h2 class="text-3xl font-black mb-2 text-[#dfff11]">JOIN CLUB</h2>
      <p class="text-gray-500 mb-8 text-sm">Создайте профиль для участия</p>
      
      <div class="space-y-4" oninput="validateRegForm()">
        <input id="reg-name" type="text" placeholder="Имя и фамилия">
        <div>
          <input id="reg-phone" type="text" placeholder="+371 ........">
          <p id="phone-error" class="text-red-500 text-[10px] mt-1 pl-2" style="display:none">Формат: +371 и 8 цифр</p>
        </div>
        <input id="reg-pass" type="password" placeholder="Пароль">
        
        <div class="flex gap-4">
          <select id="reg-level" class="flex-1">
            <option value="1">Level 1.0</option>
            <option value="2">Level 2.0</option>
            <option value="3">Level 3.0</option>
            <option value="4">Level 4.0</option>
          </select>
          <select class="flex-1">
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        <button id="submit-reg-btn" class="btn-primary w-full mt-10" onclick="handleRegistration()" disabled>
          Создать аккаунт
        </button>
      </div>
    </div>
  `,

  auth: () => `
    <div class="flex flex-col items-center justify-center h-[80vh] px-8">
        <h1 class="text-4xl font-black mb-8 italic text-[#dfff11]">PADEL RIGA</h1>
        <button onclick="router.navigate('registration')" class="btn-primary w-full mb-4">Начать</button>
        <p class="text-gray-500 text-sm">Уже есть аккаунт? <span class="text-white">Войти</span></p>
    </div>
  `
};

// --- RENDER ENGINE ---
function render() {
  const app = document.getElementById('app-shell');
  if (!app) return;

  // Если юзер не авторизован — всегда на экран Auth
  if (!STORE.user && !['auth', 'registration'].includes(STORE.currentScreen)) {
    STORE.currentScreen = 'auth';
  }

  const screenFn = Screens[STORE.currentScreen] || Screens.dashboard;
  
  // Рендерим только контентную часть
  const content = document.getElementById('screen-content');
  if (content) {
    content.innerHTML = screenFn();
  } else {
    // Начальная загрузка структуры
    app.innerHTML = `
      <main id="screen-content" class="pb-24">${screenFn()}</main>
      ${STORE.user ? `
      <nav class="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/5 flex justify-around py-4">
        <button onclick="router.navigate('dashboard')" class="text-[10px] uppercase font-bold ${STORE.currentScreen === 'dashboard' ? 'text-[#dfff11]' : 'text-gray-500'}">Home</button>
        <button class="text-[10px] uppercase font-bold text-gray-500">Live</button>
        <button onclick="router.navigate('profile')" class="text-[10px] uppercase font-bold ${STORE.currentScreen === 'profile' ? 'text-[#dfff11]' : 'text-gray-500'}">Profile</button>
      </nav>
      ` : ''}
    `;
  }
}

// Запуск
document.addEventListener('DOMContentLoaded', render);
