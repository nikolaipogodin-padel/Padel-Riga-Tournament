/**
 * Padel Riga Tracker v32 (Engine + Premium UI)
 * Соответствует ТЗ v7.0
 */

const STORAGE_KEY = 'padel-riga-tracker-v32';

// В v32 храним пользователей отдельно, чтобы избежать дублирования (BUG-001)
const DEFAULT_STATE = {
  currentScreen: 'auth',
  user: null, // Текущий залогиненный объект
  users: [],  // Все зарегистрированные профили (п. 10 ТЗ)
  tournaments: [
    {
      id: 'tour_default_1',
      title: 'Padel Weekend Riga',
      status: 'OPEN',
      participants: [], // Хранит только userId 
      waitlist: [],
      maxPlayers: 16,
      courts: 4,
      totalTime: 120,
      buffer: 10
    }
  ]
};

let STORE = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_STATE;

const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(STORE));

// --- Архитектурные исправления (п. 10 ТЗ) ---
const getPlayerById = (id) => STORE.users.find(u => u.id === id);

// --- Живая Валидация (п. 9 ТЗ) ---
window.validateRegistration = () => {
  const form = document.getElementById('reg-form');
  if (!form) return;

  const data = new FormData(form);
  const firstName = data.get('firstName').trim();
  const lastName = data.get('lastName').trim();
  const phone = data.get('phone').trim();
  
  // Проверка по ТЗ [cite: 44, 45]
  const isPhoneValid = /^\+371\d{8}$/.test(phone);
  const isNameValid = firstName.length >= 2 && lastName.length >= 2;
  
  const btn = document.getElementById('reg-btn');
  btn.disabled = !(isNameValid && isPhoneValid);
};

// --- Логика турнира (п. 7, 8 ТЗ) ---
window.joinTournament = (tourId) => {
  if (!STORE.user) return window.router.navigate('auth');
  
  const t = STORE.tournaments.find(x => x.id === tourId);
  const userId = STORE.user.id;

  if (t.participants.includes(userId) || t.waitlist.includes(userId)) return;

  if (t.participants.length < t.maxPlayers) {
    t.participants.push(userId);
    if (t.participants.length === t.maxPlayers) t.status = 'FULL'; [cite: 35]
  } else {
    t.waitlist.push(userId); [cite: 38]
  }

  persist();
  render();
};

// --- Рендеринг экранов ---
function render() {
  const root = document.getElementById('app');
  const nav = document.getElementById('bottom-nav');
  nav.classList.toggle('hidden', STORE.currentScreen === 'auth');

  if (STORE.currentScreen === 'auth') {
    root.innerHTML = `
      <div class="p-8 flex-1 flex flex-col justify-center animate-fade">
        <div class="mb-10 text-center">
          <div class="inline-block p-4 rounded-full bg-lime-400/10 mb-4 neon-glow">🎾</div>
          <h1 class="text-3xl font-black italic tracking-tighter">PADEL <span class="text-lime-400">RIGA</span></h1>
          <p class="text-gray-500 text-[10px] tracking-[0.4em] uppercase">Tracker Edition</p>
        </div>
        
        <form id="reg-form" class="space-y-3" oninput="validateRegistration()">
          <input name="firstName" placeholder="Имя" class="input-field" />
          <input name="lastName" placeholder="Фамилия" class="input-field" />
          <input name="phone" value="+371" class="input-field" />
          <div class="flex gap-2">
            <select name="level" class="input-field grow bg-black">
              <option value="1">Уровень 1 (Новичок)</option>
              <option value="2">Уровень 2</option>
              <option value="3">Уровень 3</option>
              <option value="4">Уровень 4</option>
              <option value="5">Уровень 5 (PRO)</option>
            </select>
          </div>
          <button id="reg-btn" type="button" disabled onclick="handleReg()" 
            class="btn-primary w-full py-4 mt-4 uppercase tracking-widest">Зарегистрироваться</button>
        </form>
      </div>
    `;
  }

  if (STORE.currentScreen === 'dashboard') {
    root.innerHTML = `
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-6">Турниры</h2>
        <div class="space-y-4">
          ${STORE.tournaments.map(t => {
            const isParticipating = t.participants.includes(STORE.user?.id);
            const isWaiting = t.waitlist.includes(STORE.user?.id);
            
            return `
              <div class="glass-card p-5 relative overflow-hidden">
                <div class="flex justify-between items-start mb-4">
                  <span class="px-2 py-1 rounded text-[10px] font-black ${t.status === 'OPEN' ? 'bg-lime-400 text-black' : 'bg-zinc-800 text-zinc-400'}">
                    ${t.status}
                  </span>
                  <span class="text-zinc-500 text-xs font-medium">${t.participants.length}/${t.maxPlayers} игроков</span>
                </div>
                <h3 class="text-lg font-bold mb-1">${t.title}</h3>
                <p class="text-zinc-400 text-xs mb-6 italic">📍 Riga Padel Center</p>
                
                <button onclick="joinTournament('${t.id}')" 
                  class="btn-primary w-full py-3 ${isParticipating || isWaiting ? 'opacity-50' : ''}">
                  ${isParticipating ? 'ВЫ УЧАСТВУЕТЕ' : isWaiting ? 'В ОЧЕРЕДИ' : t.status === 'FULL' ? 'ВСТАТЬ В ОЧЕРЕДЬ' : 'ЗАПИСАТЬСЯ'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  // Обновление активных кнопок в Nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('opacity-100', btn.dataset.screen === STORE.currentScreen);
    btn.classList.toggle('text-lime-400', btn.dataset.screen === STORE.currentScreen);
  });
}

window.handleReg = () => {
  const form = document.getElementById('reg-form');
  const d = Object.fromEntries(new FormData(form));
  const newUser = {
    id: `user_${Date.now()}`,
    ...d,
    joinedDate: new Date().toISOString()
  };
  
  STORE.users.push(newUser);
  STORE.user = newUser;
  window.router.navigate('dashboard');
};

// Инвариант 19.3: Роутинг
window.router = {
  navigate: (screen) => {
    STORE.currentScreen = screen;
    persist();
    render();
  }
};

document.addEventListener('DOMContentLoaded', render);
