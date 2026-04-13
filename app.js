/**
 * Padel Riga Tracker v35 (Engine Update)
 * Глубокая стабилизация + Математический движок
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
      status: 'OPEN', // OPEN, FULL, LIVE, FINISHED
      participants: [], // Храним только ID (ТЗ v7.0 п.10)
      waitlist: [],
      maxPlayers: 16,
      courts: 4,
      totalTime: 120, // в минутах
      buffer: 5,      // буфер между турами
      matches: []
    }
  ]
};

let STORE = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_STATE;

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STORE));
};

// --- СИСТЕМНЫЙ РОУТИНГ (Инвариант) ---
window.router = {
  navigate: (screen) => {
    STORE.currentScreen = screen;
    persist();
    render();
  }
};

// --- ENGINE: РАСЧЕТЫ (ТЗ v7.0 п.5) ---
const calculateEngine = (tour) => {
  const rounds = Math.ceil(tour.maxPlayers / 4);
  const tourDuration = Math.floor((tour.totalTime - (tour.buffer * (rounds - 1))) / rounds);
  return { rounds, tourDuration };
};

// --- ЛОГИКА РЕГИСТРАЦИИ ---
window.handleReg = () => {
  const form = document.getElementById('reg-form');
  if (!form) return;
  const d = Object.fromEntries(new FormData(form));
  
  // Создаем пользователя
  STORE.user = {
    id: generateId('user'),
    firstName: d.firstName,
    lastName: d.lastName,
    phone: d.phone,
    level: d.level || 'C',
    status: 'active'
  };
  
  window.router.navigate('dashboard');
};

window.joinTournament = (id) => {
  const t = STORE.tournaments.find(x => x.id === id);
  if (!t || !STORE.user) return;

  if (t.participants.includes(STORE.user.id)) return;

  if (t.participants.length < t.maxPlayers) {
    t.participants.push(STORE.user.id);
    if (t.participants.length === t.maxPlayers) t.status = 'FULL';
  } else {
    if (!t.waitlist.includes(STORE.user.id)) t.waitlist.push(STORE.user.id);
  }
  
  persist();
  render();
};

window.logout = () => {
  STORE.user = null;
  STORE.currentScreen = 'auth';
  persist();
  location.reload(); // Полная очистка для стабильности
};

// --- РЕНДЕРИНГ (SPA) ---
function render() {
  const root = document.getElementById('app');
  const nav = document.getElementById('bottom-nav');
  if (!root) return;

  // Безопасная проверка авторизации
  if (!STORE.user && STORE.currentScreen !== 'auth') {
    STORE.currentScreen = 'auth';
  }

  // Навигация (Инвариант 19.3)
  if (nav) {
    nav.classList.toggle('hidden', !STORE.user || STORE.currentScreen === 'auth');
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === STORE.currentScreen);
    });
  }

  switch (STORE.currentScreen) {
    case 'auth':
      root.innerHTML = `
        <div class="p-8 flex-1 flex flex-col justify-center animate-fade">
          <h1 class="text-4xl font-black italic mb-8">PADEL <span class="text-lime-400">RIGA</span></h1>
          <form id="reg-form" class="space-y-4">
            <input name="firstName" placeholder="Имя" class="input-field" required />
            <input name="lastName" placeholder="Фамилия" class="input-field" required />
            <input name="phone" value="+371" class="input-field" type="tel" required />
            <select name="level" class="input-field bg-gray-900">
               <option value="C">Уровень C</option>
               <option value="B">Уровень B</option>
               <option value="A">Уровень A</option>
            </select>
            <button type="button" onclick="window.handleReg()" class="btn-primary w-full py-4 mt-6">ВОЙТИ</button>
          </form>
        </div>`;
      break;

    case 'dashboard':
      root.innerHTML = `
        <div class="p-6 animate-fade">
          <h2 class="text-2xl font-bold mb-6">Турниры</h2>
          <div class="space-y-4">
            ${STORE.tournaments.map(t => {
              const { tourDuration } = calculateEngine(t);
              const isJoined = t.participants.includes(STORE.user?.id);
              return `
                <div class="glass-card p-5 neon-border">
                  <div class="flex justify-between items-center mb-4">
                    <span class="${t.status === 'OPEN' ? 'bg-lime-400 text-black' : 'bg-red-500'} text-[10px] font-bold px-2 py-1 rounded">
                      ${t.status}
                    </span>
                    <span class="text-xs text-gray-400">${t.participants.length}/${t.maxPlayers} чел.</span>
                  </div>
                  <h3 class="text-xl font-bold">${t.title}</h3>
                  <p class="text-sm text-gray-500 mb-4">⏱ Тур: ${tourDuration} мин. | Буфер: ${t.buffer} мин.</p>
                  <button onclick="window.joinTournament('${t.id}')" class="btn-primary w-full py-3">
                    ${isJoined ? 'ВЫ ЗАПИСАНЫ' : (t.status === 'FULL' ? 'В ОЧЕРЕДЬ' : 'ЗАПИСАТЬСЯ')}
                  </button>
                </div>`;
            }).join('')}
          </div>
        </div>`;
      break;

    case 'profile':
      root.innerHTML = `
        <div class="p-6 text-center animate-fade">
          <div class="w-24 h-24 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl border-2 border-lime-400">👤</div>
          <h2 class="text-2xl font-bold">${STORE.user?.firstName} ${STORE.user?.lastName}</h2>
          <p class="text-lime-400 mb-10">Level ${STORE.user?.level}</p>
          <button onclick="window.logout()" class="text-red-500 font-bold uppercase text-sm">Выйти</button>
        </div>`;
      break;
  }
}

document.addEventListener('DOMContentLoaded', render);
