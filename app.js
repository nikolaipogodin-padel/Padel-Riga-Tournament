/**
 * Padel Riga Tracker v34 - СТАБИЛЬНЫЙ ВОЗВРАТ
 * Исправлены пути к router и render.
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
      maxPlayers: 16,
      date: '20.04',
      time: '10:00'
    }
  ]
};

let STORE = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_STATE;

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STORE));
};

// Исправляем объект роутера, чтобы onclick="window.router.navigate" работал
window.router = {
  navigate: (screen) => {
    STORE.currentScreen = screen;
    persist();
    render();
  }
};

window.handleReg = () => {
  const form = document.getElementById('reg-form');
  if (!form) return;
  const formData = new FormData(form);
  const user = Object.fromEntries(formData);
  
  STORE.user = {
    id: generateId('user'),
    ...user
  };
  window.router.navigate('dashboard');
};

window.logout = () => {
  STORE.user = null;
  window.router.navigate('auth');
};

window.joinTournament = (id) => {
  const t = STORE.tournaments.find(x => x.id === id);
  if (t && STORE.user && !t.participants.includes(STORE.user.id)) {
    t.participants.push(STORE.user.id);
  }
  persist();
  render();
};

function render() {
  const root = document.getElementById('app');
  const nav = document.getElementById('bottom-nav');
  if (!root) return;

  // Авто-редирект на логин
  if (!STORE.user && STORE.currentScreen !== 'auth') {
    STORE.currentScreen = 'auth';
  }

  // Показ навигации
  if (nav) {
    nav.classList.toggle('hidden', STORE.currentScreen === 'auth' || !STORE.user);
  }

  if (STORE.currentScreen === 'auth') {
    root.innerHTML = `
      <div class="p-8 flex flex-col justify-center min-h-screen">
        <h1 class="text-3xl font-black mb-8 italic">PADEL RIGA</h1>
        <form id="reg-form" class="space-y-4">
          <input name="firstName" placeholder="Имя" class="input-field" />
          <input name="lastName" placeholder="Фамилия" class="input-field" />
          <input name="phone" placeholder="Телефон" class="input-field" />
          <button type="button" onclick="window.handleReg()" class="btn-primary w-full py-4 mt-4">ВОЙТИ</button>
        </form>
      </div>
    `;
  } else if (STORE.currentScreen === 'dashboard') {
    root.innerHTML = `
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-6">Турниры</h2>
        ${STORE.tournaments.map(t => `
          <div class="glass-card p-5 mb-4">
            <h3 class="text-xl font-bold">${t.title}</h3>
            <p class="text-gray-400 mb-4">${t.date} в ${t.time}</p>
            <button onclick="window.joinTournament('${t.id}')" class="btn-primary w-full py-3">
              ${t.participants.includes(STORE.user?.id) ? 'ВЫ УЧАСТВУЕТЕ' : 'ЗАПИСАТЬСЯ'}
            </button>
          </div>
        `).join('')}
      </div>
    `;
  } else if (STORE.currentScreen === 'profile') {
    root.innerHTML = `
      <div class="p-6 text-center">
        <div class="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">👤</div>
        <h2 class="text-2xl font-bold">${STORE.user?.firstName} ${STORE.user?.lastName}</h2>
        <button onclick="window.logout()" class="text-red-500 mt-10">ВЫЙТИ</button>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', render);
