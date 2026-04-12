/**
 * Padel Riga Tracker v33 - СТАБИЛЬНАЯ ВЕРСИЯ
 * Исправлены ошибки инициализации и глобальные вызовы.
 */

const STORAGE_KEY = 'padel-riga-tracker-v31';

const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const DEFAULT_STATE = {
  currentScreen: 'auth',
  user: null,
  tournaments: [
    {
      id: generateId('tour'),
      title: 'Padel Weekend Riga',
      status: 'OPEN',
      participants: [],
      waitlist: [],
      maxPlayers: 16,
      startDate: '2026-04-20T10:00:00',
      courts: 4,
      totalTime: 120,
      matches: []
    }
  ]
};

let STORE = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_STATE;

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STORE));
};

// Экспортируем роутер в window, чтобы onclick="router.navigate(...)" в HTML работал
window.router = {
  navigate: (screen) => {
    STORE.currentScreen = screen;
    persist();
    render();
  }
};

const getUserFullName = (u) => u ? `${u.firstName} ${u.lastName}` : 'Гость';

// Функция регистрации (вынесена в window для доступа из HTML)
window.handleReg = () => {
  const form = document.getElementById('reg-form');
  if (!form) return;
  
  const d = Object.fromEntries(new FormData(form));
  STORE.user = {
    id: generateId('user'),
    ...d,
    status: 'active'
  };
  window.router.navigate('dashboard');
};

window.logout = () => {
  STORE.user = null;
  window.router.navigate('auth');
};

window.joinTournament = (id) => {
  if (!STORE.user) return window.router.navigate('auth');
  const t = STORE.tournaments.find(x => x.id === id);
  if (!t) return;

  if (t.participants.length < t.maxPlayers) {
    if (!t.participants.includes(STORE.user.id)) t.participants.push(STORE.user.id);
  } else {
    if (!t.waitlist.includes(STORE.user.id)) t.waitlist.push(STORE.user.id);
  }
  persist();
  render();
};

// Главная функция рендеринга
function render() {
  const root = document.getElementById('app');
  const nav = document.getElementById('bottom-nav');
  
  if (!root) return;

  // Показываем/скрываем навигацию
  if (nav) {
    nav.classList.toggle('hidden', STORE.currentScreen === 'auth' || !STORE.user);
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === STORE.currentScreen);
    });
  }

  // Если юзер не залогинен, всегда принудительно на auth
  if (!STORE.user && STORE.currentScreen !== 'auth') {
    STORE.currentScreen = 'auth';
  }

  switch (STORE.currentScreen) {
    case 'auth':
      root.innerHTML = `
        <div class="p-8 flex-1 flex flex-col justify-center animate-fade">
          <div class="mb-12 text-center">
            <h1 class="text-4xl font-black italic tracking-tighter mb-2">PADEL <span class="text-lime-400">RIGA</span></h1>
            <p class="text-gray-500 uppercase text-[10px] tracking-[0.3em]">Tracker Edition</p>
          </div>
          <form id="reg-form" class="space-y-4">
            <input name="firstName" placeholder="Имя" class="input-field" required />
            <input name="lastName" placeholder="Фамилия" class="input-field" required />
            <input name="phone" value="+371" class="input-field" type="tel" required />
            <select name="level" class="input-field bg-gray-900 text-white">
               <option value="C">Уровень C (Средний)</option>
               <option value="B">Уровень B (Продвинутый)</option>
               <option value="A">Уровень A (Профи)</option>
            </select>
            <button type="button" onclick="window.handleReg()" class="btn-primary w-full py-4 mt-6">ВОЙТИ</button>
          </form>
        </div>
      `;
      break;

    case 'dashboard':
      root.innerHTML = `
        <div class="p-6 animate-fade">
          <h2 class="text-2xl font-bold mb-6">Турниры</h2>
          <div class="space-y-4">
            ${STORE.tournaments.map(t => `
              <div class="glass-card p-5 border border-white/5">
                <div class="flex justify-between items-start mb-4">
                  <span class="bg-lime-400 text-black text-[10px] font-black px-2 py-1 rounded">${t.status}</span>
                  <span class="text-gray-500 text-xs">${t.participants.length}/${t.maxPlayers}</span>
                </div>
                <h3 class="text-xl font-bold mb-1">${t.title}</h3>
                <p class="text-gray-400 text-sm mb-6">📍 Riga • 📅 20.04</p>
                <button onclick="window.joinTournament('${t.id}')" class="btn-primary w-full py-3">
                  ${t.participants.includes(STORE.user?.id) ? 'ВЫ УЧАСТВУЕТЕ' : 'ЗАПИСАТЬСЯ'}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      break;

    case 'profile':
      root.innerHTML = `
        <div class="p-6 animate-fade">
          <div class="flex flex-col items-center mt-8 mb-10">
            <div class="w-24 h-24 bg-gray-800 rounded-full border-2 border-lime-400 mb-4 flex items-center justify-center text-3xl">👤</div>
            <h2 class="text-2xl font-bold">${getUserFullName(STORE.user)}</h2>
            <p class="text-lime-400 text-sm font-bold uppercase tracking-widest">Level ${STORE.user?.level}</p>
          </div>
          <button onclick="window.logout()" class="w-full text-red-500 mt-12 text-sm font-bold uppercase">Выйти</button>
        </div>
      `;
      break;

    default:
      root.innerHTML = `<div class="p-6">Screen ${STORE.currentScreen} not found</div>`;
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  render();
});
