
const STORAGE_KEY = 'padel-riga-tracker-v26';

const DEFAULT_STATE = {
  currentScreen: 'dashboard',
  activeTournamentId: 1,
  activeRound: 1,
  registration: { playerName: '', playerLevel: '3.0', statusMessage: '' },
  tournaments: [
    { id: 1, type: 'my', title: 'Riga Evening Open', badgeTop: 'RIGA', badgeBottom: 'EVENING OPEN', date: '17 авг. 2023', city: 'Riga', time: '10:00', duration: '20 мин', status: 'LIVE', courts: 4, maxPlayers: 16, confirmedPlayers: 16, waitingPlayers: 0, allowRegistration: false },
    { id: 2, type: 'my', title: 'Tallinn Padel Cup', badgeTop: 'TALLINN', badgeBottom: 'PADEL CUP', date: '25 авг. 2023', city: 'Tallinn', time: '11:30', duration: '30 мин', status: 'PLANNED', courts: 4, maxPlayers: 16, confirmedPlayers: 12, waitingPlayers: 0, allowRegistration: false },
    { id: 3, type: 'available', title: 'Riga Morning Open', badgeTop: 'RIGA', badgeBottom: 'MORNING OPEN', date: '19 авг. 2023', city: 'Riga', time: '09:30', duration: '20 мин', status: 'OPEN', courts: 4, maxPlayers: 16, confirmedPlayers: 12, waitingPlayers: 0, allowRegistration: true },
    { id: 4, type: 'available', title: 'Kaunas Padel Challenge', badgeTop: 'KAUNAS', badgeBottom: 'PADEL CHALLENGE', date: '21 авг. 2023', city: 'Kaunas', time: '12:00', duration: '30 мин', status: 'OPEN', courts: 4, maxPlayers: 16, confirmedPlayers: 8, waitingPlayers: 0, allowRegistration: true },
    { id: 5, type: 'available', title: 'Autumn Slam', badgeTop: 'TARTU', badgeBottom: 'SUMMER CUP', date: '26 авг. 2023', city: 'Tartu', time: '10:00', duration: '20 мин', status: 'CLOSED', courts: 4, maxPlayers: 16, confirmedPlayers: 16, waitingPlayers: 4, allowRegistration: false }
  ],
  liveTournament: {
    rounds: [1, 2, 3, 4, 5, 6],
    matchesByRound: {
      1: [
        { cardType: 'live', players: ['Николай', 'Виктор'], score: [6, 3], time: '10:30', court: 'Корт 1', duration: '21:00' },
        { cardType: 'waiting', players: ['Алексей', 'Сергей'], score: null, time: '11:15', court: 'Корт 2', duration: '27:00' },
        { cardType: 'waiting', players: ['Андрей', 'Марк'], score: null, time: '12:00', court: 'Корт 3', duration: '18:00' }
      ],
      2: [
        { cardType: 'finished', winnerText: 'Победа: Николай / Андрей', setScores: ['6:4', '3:6', '6:2'], players: ['Николай', 'Андрей'] },
        { cardType: 'live', players: ['Николай', 'Виктор'], score: [6, 3], time: '10:30', court: 'Корт 2', duration: '21:00' },
        { cardType: 'waiting', players: ['Алексей', 'Сергей'], score: null, time: '11:15', court: 'Корт 3', duration: '27:00' }
      ],
      3: [], 4: [], 5: [], 6: []
    }
  },
  grid: [
    { court: '1', time: '10:30', title: 'Николай / Виктор vs Алексей / Сергей', state: 'LIVE' },
    { court: '2', time: '11:15', title: 'Андрей / Марк vs Лука / Игорь', state: 'WAITING' },
    { court: '3', time: '12:00', title: 'Роман / Никита vs Дима / Павел', state: 'WAITING' }
  ],
  stats: [
    { rank: 1, name: 'Николай', wins: 3, diff: '+12' },
    { rank: 2, name: 'Виктор', wins: 3, diff: '+9' },
    { rank: 3, name: 'Алексей', wins: 2, diff: '+3' },
    { rank: 4, name: 'Сергей', wins: 1, diff: '-5' }
  ],
  registrations: []
};

let STORE = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STATE), ...parsed };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(STORE)); }

window.router = {
  navigate(screen) {
    STORE.currentScreen = screen;
    persist();
    render();
  }
};

function formatStatus(status) {
  if (status === 'LIVE') return '<span class="status-pill">LIVE</span>';
  if (status === 'OPEN') return '<span class="status-pill">РЕГИСТРАЦИЯ ОТКРЫТА</span>';
  if (status === 'PLANNED') return '<span class="status-pill planned">ЗАПЛАНИРОВАН</span>';
  if (status === 'CLOSED') return '<span class="status-pill closed">CLOSED</span>';
  if (status === 'FINISHED') return '<span class="status-pill finished">Finished</span>';
  return '<span class="status-pill planned">Planned</span>';
}
function iconCalendar() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="5.5" width="17" height="15" rx="2"></rect><path d="M7 3.5v4"></path><path d="M17 3.5v4"></path><path d="M3.5 9.5h17"></path></svg>'; }
function iconPin() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11Z"></path><circle cx="12" cy="10" r="2.2"></circle></svg>'; }
function iconClock() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5v5l3.5 2"></path></svg>'; }

const UI = {
  section(title, cardsHtml, sectionClass = '', dots = 3) {
    return `<section class="section-shell ${sectionClass}">
      <div class="section-head">
        <h2 class="section-title">${title} <span class="section-meta"><i></i><i></i></span></h2>
        <button class="ghost-link" type="button">Все <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 6 6 6-6 6"></path></svg></button>
      </div>
      <div class="cards-track">${cardsHtml}</div>
      <div class="card-dots">${Array.from({length: dots}).map((_, i) => `<span class="${i === 1 ? 'active' : ''}"></span>`).join('')}</div>
    </section>`;
  },
  tournamentCard(t) {
    const cardClass = t.status === 'LIVE' || t.status === 'OPEN' ? 'is-green' : t.status === 'CLOSED' ? 'is-closed' : '';
    return `<article class="tournament-card ${cardClass}" onclick="openTournamentRegistration(${t.id})">
      <div class="card-shell">
        <div class="card-topline">${formatStatus(t.status)}</div>
        <div class="card-topline" style="margin-top:14px;">
          <div class="event-badge"><div><strong>${t.badgeTop}</strong><strong>${t.badgeBottom}</strong><span>2023</span></div></div>
        </div>
        <h3 class="card-title">${t.title}</h3>
        <div class="card-foot">
          <div class="meta-item">${iconCalendar()}<span>${t.date}</span></div>
          <div class="meta-item">${iconPin()}<span>${t.city}</span></div>
          <div class="meta-item">${iconClock()}<span>${t.time}</span></div>
          <div class="meta-item">${iconClock()}<span>${t.duration}</span></div>
        </div>
      </div>
    </article>`;
  },
  liveTab(round) { return `<button class="live-tab ${STORE.activeRound === round ? 'active' : ''}" onclick="setActiveRound(${round})">ТУР ${round}</button>`; },
  liveCard(match) {
    if (match.cardType === 'finished') {
      return `<article class="match-card"><div class="card-shell">
        <div class="card-topline">${formatStatus('FINISHED')}</div>
        <div class="match-overlay-icon" style="border-color: rgba(255,255,255,0.18); color: rgba(255,255,255,0.92); box-shadow:none;">Finished</div>
        <div class="finished-panel"><strong>${match.winnerText}</strong></div>
        <div class="finished-scoreline">${match.setScores.map(s => `<span>${s}</span>`).join('')}</div>
        <div class="players-row"><div class="player-name">${match.players[0]}</div><div class="player-name" style="text-align:right;">${match.players[1]}</div></div>
      </div></article>`;
    }
    if (match.cardType === 'waiting') {
      return `<article class="match-card is-waiting"><div class="card-shell">
        <div class="card-topline">${formatStatus('PLANNED')}</div>
        <div class="match-overlay-icon" style="border-color: rgba(255,255,255,0.14); color: rgba(255,255,255,0.82); box-shadow:none;">Waiting<br>VS</div>
        <div class="players-row"><div class="player-name">${match.players[0]}</div><div class="player-name" style="text-align:right;">${match.players[1]}</div></div>
        <div class="card-bottom-meta"><div>VS</div><div>${match.time}</div><div>${match.court}, ${match.duration}</div></div>
      </div></article>`;
    }
    return `<article class="match-card is-live"><div class="card-shell">
      <div class="card-topline">${formatStatus('LIVE')}<div class="match-preview"></div></div>
      <div class="match-overlay-icon">LIVE</div>
      <div class="players-row"><div class="player-name">${match.players[0]}</div><div class="player-name" style="text-align:right;">${match.players[1]}</div></div>
      <div class="score-row"><div class="score-box">${match.score[0]}</div><div class="score-box">${match.score[1]}</div></div>
      <div class="card-bottom-meta"><div>${match.time}</div><div>${match.court}, ${match.duration}</div></div>
    </div></article>`;
  }
};

const Screens = {
  dashboard() {
    const my = STORE.tournaments.filter(t => t.type === 'my');
    const available = STORE.tournaments.filter(t => t.type === 'available');
    return UI.section('Мои турниры', my.map(UI.tournamentCard).join(''), '', my.length) +
           UI.section('Доступные турниры', available.map(UI.tournamentCard).join(''), 'section-green', available.length);
  },
  live() {
    const matches = STORE.liveTournament.matchesByRound[STORE.activeRound] || [];
    return `<section class="section-shell">
      <div class="live-tabs">${STORE.liveTournament.rounds.map(UI.liveTab).join('')}</div>
      <div class="cards-track" style="margin-top:16px;">${matches.length ? matches.map(UI.liveCard).join('') : '<div class="empty-state">Для этого тура матчи еще не опубликованы</div>'}</div>
      <div class="card-dots">${STORE.liveTournament.rounds.map(r => `<span class="${r === STORE.activeRound ? 'active' : ''}"></span>`).join('')}</div>
    </section>`;
  },
  grid() {
    return `<section class="grid-board"><h2 class="board-title">Все корты / текущий тур</h2><div class="grid-list">
      ${STORE.grid.map(item => `<article class="grid-item"><div class="grid-item-top">
        <div class="court-pill">${item.court}</div>
        <div><div style="font-weight:700;">${item.title}</div><div class="grid-time">${item.time}</div></div>
        <div class="status-pill ${item.state === 'LIVE' ? '' : 'planned'}" style="min-width:88px; justify-content:center;">${item.state}</div>
      </div></article>`).join('')}
    </div></section>`;
  },
  stats() {
    return `<section class="stats-board"><h2 class="board-title">Текущий рейтинг</h2><div class="rank-list">
      ${STORE.stats.map(item => `<article class="rank-item">
        <div class="rank-no">${item.rank}</div>
        <div><div style="font-weight:700;">${item.name}</div><div class="rank-sub">Победы: ${item.wins} · Разница: ${item.diff}</div></div>
        <div class="status-pill planned" style="min-width:70px; justify-content:center;">TOP</div>
      </article>`).join('')}
    </div></section>`;
  },
  registration() {
    const t = STORE.tournaments.find(item => item.id === STORE.activeTournamentId) || STORE.tournaments[2];
    const free = Math.max(0, t.maxPlayers - t.confirmedPlayers);
    const waiting = t.waitingPlayers;
    return `<section class="registration-hero">
      ${formatStatus(t.status === 'OPEN' ? 'OPEN' : 'PLANNED')}
      <h2>${t.title}</h2>
      <p>${t.date} · ${t.time} · ${t.courts} корта</p>
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-label">Свободно</div><div class="kpi-value">${free}</div></div>
        <div class="kpi-card"><div class="kpi-label">Waiting List</div><div class="kpi-value">${waiting}</div></div>
      </div>
    </section>
    <section class="form-card">
      <h2 class="board-title">Регистрация</h2>
      <form id="registration-form" class="form-stack">
        <div><label class="form-label" for="player-name">Имя и фамилия</label><input class="form-control" id="player-name" name="playerName" type="text" placeholder="Nikolajs Pogodins" required></div>
        <div><label class="form-label" for="player-level">Уровень</label>
          <select class="form-control" id="player-level" name="playerLevel">
            <option value="2.0">2.0 — Новичок</option><option value="3.0" selected>3.0 — Средний</option><option value="4.0">4.0 — Продвинутый</option><option value="5.0">5.0 — Турнирный</option>
          </select>
        </div>
        <p class="form-note">Вход в клуб подтверждает админ. Снятие с турнира доступно до дедлайна — базово 24 часа до старта.</p>
        <button type="submit" class="primary-btn">Подать заявку</button>
      </form>
      <div class="success-card ${STORE.registration.statusMessage ? 'show' : ''}">
        <div class="status-pill" style="margin:0 auto;">OK</div>
        <h3>${STORE.registration.statusMessage || ''}</h3>
        <p>${STORE.registration.statusMessage ? 'Статус сохранен локально. Дальше подтверждение и модерация — по этапам разработки.' : ''}</p>
      </div>
    </section>`;
  }
};

function render() {
  document.getElementById('screen-content').innerHTML = Screens[STORE.currentScreen] ? Screens[STORE.currentScreen]() : Screens.dashboard();
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.screen === STORE.currentScreen));
  const form = document.getElementById('registration-form');
  if (form) form.addEventListener('submit', handleRegistrationSubmit);
}

function handleRegistrationSubmit(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const playerName = String(data.get('playerName') || '').trim();
  const playerLevel = String(data.get('playerLevel') || '3.0');
  if (!playerName) return;
  const t = STORE.tournaments.find(item => item.id === STORE.activeTournamentId) || STORE.tournaments[2];
  const waiting = t.confirmedPlayers >= t.maxPlayers;
  STORE.registrations.push({ id: Date.now(), tournamentId: t.id, playerName, playerLevel, status: waiting ? 'waiting' : 'pending' });
  if (waiting) { t.waitingPlayers += 1; STORE.registration.statusMessage = 'Вы в waiting list'; }
  else { t.confirmedPlayers += 1; STORE.registration.statusMessage = 'Заявка отправлена'; }
  persist(); render();
}
window.openTournamentRegistration = function(tournamentId) {
  STORE.activeTournamentId = tournamentId;
  const t = STORE.tournaments.find(item => item.id === tournamentId);
  STORE.currentScreen = t && t.status === 'LIVE' ? 'live' : 'registration';
  STORE.registration.statusMessage = '';
  persist(); render();
};
window.setActiveRound = function(round) { STORE.activeRound = round; persist(); render(); };

document.addEventListener('DOMContentLoaded', render);
