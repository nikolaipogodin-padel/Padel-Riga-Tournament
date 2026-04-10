
const STORAGE_KEY = 'padel-riga-tracker-v26';

const DEFAULT_STATE = {
  currentScreen: 'dashboard',
  activeTournamentId: 1,
  activeRound: 1,
  registration: { playerName: '', playerLevel: '3.0', statusMessage: '' },
  user: null,
  userDraft: {
    firstName: '',
    lastName: '',
    phone: '+371',
    level: 'C',
    gender: 'male',
    birthDate: '',
    photo: '',
    password: '',
    passwordRepeat: ''
  },
  profileStatusMessage: '',
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
    const base = structuredClone(DEFAULT_STATE);
    if (!raw) {
      base.currentScreen = 'auth';
      return base;
    }
    const parsed = JSON.parse(raw);
    const merged = {
      ...base,
      ...parsed,
      registration: { ...base.registration, ...(parsed.registration || {}) },
      userDraft: { ...base.userDraft, ...(parsed.userDraft || {}) },
      liveTournament: {
        ...base.liveTournament,
        ...(parsed.liveTournament || {}),
        matchesByRound: {
          ...base.liveTournament.matchesByRound,
          ...((parsed.liveTournament && parsed.liveTournament.matchesByRound) || {})
        }
      }
    };
    if (!merged.user) merged.currentScreen = 'auth';
    return merged;
  } catch (error) {
    console.error('Failed to load state:', error);
    const base = structuredClone(DEFAULT_STATE);
    base.currentScreen = 'auth';
    return base;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STORE));
}

window.router = {
  navigate(screen) {
    if (!STORE.user && !['auth', 'auth_success'].includes(screen)) {
      STORE.currentScreen = 'auth';
    } else {
      STORE.currentScreen = screen;
    }
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

function iconCalendar() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="5.5" width="17" height="15" rx="2"></rect><path d="M7 3.5v4"></path><path d="M17 3.5v4"></path><path d="M3.5 9.5h17"></path></svg>';
}
function iconPin() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11Z"></path><circle cx="12" cy="10" r="2.2"></circle></svg>';
}
function iconClock() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5v5l3.5 2"></path></svg>';
}

function getUserInitials() {
  if (!STORE.user) return 'PR';
  return `${(STORE.user.firstName || 'P')[0] || 'P'}${(STORE.user.lastName || 'R')[0] || 'R'}`.toUpperCase();
}

function getUserFullName() {
  if (!STORE.user) return '';
  return `${STORE.user.firstName} ${STORE.user.lastName}`.trim();
}

function getAuthErrors(draft) {
  const errors = {};
  if (!draft.firstName.trim()) errors.firstName = 'Введите имя';
  if (!draft.lastName.trim()) errors.lastName = 'Введите фамилию';
  if (!draft.phone.trim() || draft.phone.trim() === '+371') errors.phone = 'Введите телефон';
  if (!draft.password.trim()) errors.password = 'Введите пароль';
  if (!draft.passwordRepeat.trim()) errors.passwordRepeat = 'Повторите пароль';
  else if (draft.password !== draft.passwordRepeat) errors.passwordRepeat = 'Пароли не совпадают';
  return errors;
}

function isAuthValid() {
  return Object.keys(getAuthErrors(STORE.userDraft)).length === 0;
}

function renderHeaderAndNav() {
  const header = document.getElementById('main-header');
  const nav = document.querySelector('.bottom-nav');
  const profileBtn = header ? header.querySelector('.ghost-pill') : null;

  if (!header || !nav) return;

  if (!STORE.user) {
    header.style.display = 'none';
    nav.style.display = 'none';
    return;
  }

  header.style.display = 'flex';
  nav.style.display = 'grid';

  if (profileBtn) {
    profileBtn.textContent = 'Profile';
  }

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.screen === STORE.currentScreen);
  });
}

const UI = {
  section(title, cardsHtml, sectionClass = '', dots = 3) {
    return `
      <section class="section-shell ${sectionClass}">
        <div class="section-head">
          <h2 class="section-title">${title} <span class="section-meta"><i></i><i></i></span></h2>
          <button class="ghost-link" type="button">Все
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 6 6 6-6 6"></path></svg>
          </button>
        </div>
        <div class="cards-track">${cardsHtml}</div>
        <div class="card-dots">${Array.from({ length: dots }).map((_, index) => `<span class="${index === 1 ? 'active' : ''}"></span>`).join('')}</div>
      </section>
    `;
  },

  tournamentCard(t) {
    const cardClass =
      t.status === 'LIVE' ? 'is-green' :
      t.status === 'CLOSED' ? 'is-closed' :
      t.status === 'OPEN' ? 'is-green' : '';

    return `
      <article class="tournament-card ${cardClass}" onclick="openTournamentRegistration(${t.id})">
        <div class="card-shell">
          <div class="card-topline">${formatStatus(t.status)}</div>

          <div class="card-topline" style="margin-top: 14px;">
            <div class="event-badge">
              <div>
                <strong>${t.badgeTop}</strong>
                <strong>${t.badgeBottom}</strong>
                <span>2023</span>
              </div>
            </div>
          </div>

          <h3 class="card-title">${t.title}</h3>

          <div class="card-foot">
            <div class="meta-item">${iconCalendar()}<span>${t.date}</span></div>
            <div class="meta-item">${iconPin()}<span>${t.city}</span></div>
            <div class="meta-item">${iconClock()}<span>${t.time}</span></div>
            <div class="meta-item">${iconClock()}<span>${t.duration}</span></div>
          </div>
        </div>
      </article>
    `;
  },

  liveTab(round) {
    return `<button class="live-tab ${STORE.activeRound === round ? 'active' : ''}" onclick="setActiveRound(${round})">ТУР ${round}</button>`;
  },

  liveCard(match) {
    if (match.cardType === 'finished') {
      return `
        <article class="match-card">
          <div class="card-shell">
            <div class="card-topline">${formatStatus('FINISHED')}</div>
            <div class="match-overlay-icon" style="border-color: rgba(255,255,255,0.18); color: rgba(255,255,255,0.92); box-shadow:none;">Finished</div>
            <div class="finished-panel"><strong>${match.winnerText}</strong></div>
            <div class="finished-scoreline">${match.setScores.map((score) => `<span>${score}</span>`).join('')}</div>
            <div class="players-row">
              <div class="player-name">${match.players[0]}</div>
              <div class="player-name" style="text-align:right;">${match.players[1]}</div>
            </div>
          </div>
        </article>
      `;
    }

    if (match.cardType === 'waiting') {
      return `
        <article class="match-card is-waiting">
          <div class="card-shell">
            <div class="card-topline">${formatStatus('PLANNED')}</div>
            <div class="match-overlay-icon" style="border-color: rgba(255,255,255,0.14); color: rgba(255,255,255,0.82); box-shadow:none;">Waiting<br>VS</div>
            <div class="players-row">
              <div class="player-name">${match.players[0]}</div>
              <div class="player-name" style="text-align:right;">${match.players[1]}</div>
            </div>
            <div class="card-bottom-meta">
              <div>VS</div>
              <div>${match.time}</div>
              <div>${match.court}, ${match.duration}</div>
            </div>
          </div>
        </article>
      `;
    }

    return `
      <article class="match-card is-live">
        <div class="card-shell">
          <div class="card-topline">
            ${formatStatus('LIVE')}
            <div class="match-preview"></div>
          </div>
          <div class="match-overlay-icon">LIVE</div>

          <div class="players-row">
            <div class="player-name">${match.players[0]}</div>
            <div class="player-name" style="text-align:right;">${match.players[1]}</div>
          </div>

          <div class="score-row">
            <div class="score-box">${match.score[0]}</div>
            <div class="score-box">${match.score[1]}</div>
          </div>

          <div class="card-bottom-meta">
            <div>${match.time}</div>
            <div>${match.court}, ${match.duration}</div>
          </div>
        </div>
      </article>
    `;
  }
};

const Screens = {
  dashboard() {
    const my = STORE.tournaments.filter((item) => item.type === 'my');
    const available = STORE.tournaments.filter((item) => item.type === 'available');
    return `
      ${UI.section('Мои турниры', my.map(UI.tournamentCard).join(''), '', my.length)}
      ${UI.section('Доступные турниры', available.map(UI.tournamentCard).join(''), 'section-green', available.length)}
    `;
  },

  live() {
    const currentMatches = STORE.liveTournament.matchesByRound[STORE.activeRound] || [];
    const cards = currentMatches.length
      ? currentMatches.map(UI.liveCard).join('')
      : `<div class="empty-state">Для этого тура матчи еще не опубликованы</div>`;

    return `
      <section class="section-shell">
        <div class="live-tabs">${STORE.liveTournament.rounds.map(UI.liveTab).join('')}</div>
        <div class="cards-track" style="margin-top:16px;">${cards}</div>
        <div class="card-dots">
          ${STORE.liveTournament.rounds.map((round) => `<span class="${round === STORE.activeRound ? 'active' : ''}"></span>`).join('')}
        </div>
      </section>
    `;
  },

  grid() {
    return `
      <section class="grid-board">
        <h2 class="board-title">Все корты / текущий тур</h2>
        <div class="grid-list">
          ${STORE.grid.map((item) => `
            <article class="grid-item">
              <div class="grid-item-top">
                <div class="court-pill">${item.court}</div>
                <div>
                  <div style="font-weight:700;">${item.title}</div>
                  <div class="grid-time">${item.time}</div>
                </div>
                <div class="status-pill ${item.state === 'LIVE' ? '' : 'planned'}" style="min-width:88px; justify-content:center;">
                  ${item.state}
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  },

  stats() {
    return `
      <section class="stats-board">
        <h2 class="board-title">Текущий рейтинг</h2>
        <div class="rank-list">
          ${STORE.stats.map((item) => `
            <article class="rank-item">
              <div class="rank-no">${item.rank}</div>
              <div>
                <div style="font-weight:700;">${item.name}</div>
                <div class="rank-sub">Победы: ${item.wins} · Разница: ${item.diff}</div>
              </div>
              <div class="status-pill planned" style="min-width:70px; justify-content:center;">TOP</div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  },

  registration() {
    const selectedTournament =
      STORE.tournaments.find((item) => item.id === STORE.activeTournamentId) ||
      STORE.tournaments.find((item) => item.allowRegistration) ||
      STORE.tournaments[2];

    const confirmed = selectedTournament.confirmedPlayers;
    const freeSlots = Math.max(0, selectedTournament.maxPlayers - confirmed);
    const waiting = selectedTournament.waitingPlayers;
    const successClass = STORE.registration.statusMessage ? 'show' : '';

    return `
      <section class="registration-hero">
        ${formatStatus(selectedTournament.status === 'OPEN' ? 'OPEN' : 'PLANNED')}
        <h2>${selectedTournament.title}</h2>
        <p>${selectedTournament.date} · ${selectedTournament.time} · ${selectedTournament.courts} корта</p>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Свободно</div>
            <div class="kpi-value">${freeSlots}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Waiting List</div>
            <div class="kpi-value">${waiting}</div>
          </div>
        </div>
      </section>

      <section class="form-card">
        <h2 class="board-title">Регистрация в турнир</h2>
        <form id="registration-form" class="form-stack">
          <div>
            <label class="form-label" for="player-name">Имя и фамилия</label>
            <input class="form-control" id="player-name" name="playerName" type="text" placeholder="Nikolajs Pogodins" value="${STORE.registration.playerName || getUserFullName() || ''}" required />
          </div>

          <div>
            <label class="form-label" for="player-level">Уровень</label>
            <select class="form-control" id="player-level" name="playerLevel">
              <option value="A" ${STORE.registration.playerLevel === 'A' ? 'selected' : ''}>A — Высокий</option>
              <option value="B" ${STORE.registration.playerLevel === 'B' ? 'selected' : ''}>B — Сильный</option>
              <option value="C" ${STORE.registration.playerLevel === 'C' || STORE.registration.playerLevel === '3.0' ? 'selected' : ''}>C — Средний</option>
              <option value="D" ${STORE.registration.playerLevel === 'D' ? 'selected' : ''}>D — Начинающий</option>
            </select>
          </div>

          <p class="form-note">
            Вход в клуб подтверждает админ. Снятие с турнира доступно до дедлайна — базово 24 часа до старта.
          </p>

          <button type="submit" class="primary-btn">Подать заявку</button>
        </form>

        <div class="success-card ${successClass}" id="success-card">
          <div class="status-pill" style="margin:0 auto;">OK</div>
          <h3>${STORE.registration.statusMessage || ''}</h3>
          <p>${STORE.registration.statusMessage ? 'Статус сохранен локально. Дальше подтверждение и модерация — по этапам разработки.' : ''}</p>
        </div>
      </section>
    `;
  },

  auth() {
    const draft = STORE.userDraft;
    const errors = getAuthErrors(draft);
    return `
      <section class="auth-hero">
        ${formatStatus('OPEN')}
        <h2>Create profile</h2>
        <p>Создай профиль один раз. После этого приложение будет входить автоматически и сразу открывать список турниров.</p>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Статус</div>
            <div class="kpi-value" style="font-size:22px;">ACTIVE</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Доступ</div>
            <div class="kpi-value" style="font-size:22px;">MULTI CLUB</div>
          </div>
        </div>
      </section>

      <section class="auth-shell">
        <h2 class="board-title">Регистрация пользователя</h2>
        <form id="auth-form" class="auth-form">
          <div class="form-grid-2">
            <div>
              <label class="form-label" for="auth-first-name">Имя</label>
              <input class="form-control" id="auth-first-name" name="firstName" type="text" placeholder="Nikolajs" value="${escapeHtml(draft.firstName)}" />
              <div class="field-error">${errors.firstName || ''}</div>
            </div>
            <div>
              <label class="form-label" for="auth-last-name">Фамилия</label>
              <input class="form-control" id="auth-last-name" name="lastName" type="text" placeholder="Pogodins" value="${escapeHtml(draft.lastName)}" />
              <div class="field-error">${errors.lastName || ''}</div>
            </div>
          </div>

          <div>
            <label class="form-label" for="auth-phone">Телефон</label>
            <input class="form-control" id="auth-phone" name="phone" type="tel" placeholder="+371 2xxxxxxx" value="${escapeHtml(draft.phone)}" />
            <div class="field-error">${errors.phone || ''}</div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="auth-level">Уровень</label>
              <select class="form-control" id="auth-level" name="level">
                <option value="A" ${draft.level === 'A' ? 'selected' : ''}>A</option>
                <option value="B" ${draft.level === 'B' ? 'selected' : ''}>B</option>
                <option value="C" ${draft.level === 'C' ? 'selected' : ''}>C</option>
                <option value="D" ${draft.level === 'D' ? 'selected' : ''}>D</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="auth-gender">Пол</label>
              <select class="form-control" id="auth-gender" name="gender">
                <option value="male" ${draft.gender === 'male' ? 'selected' : ''}>Мужчина</option>
                <option value="female" ${draft.gender === 'female' ? 'selected' : ''}>Женщина</option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="auth-birth-date">Дата рождения</label>
              <input class="form-control" id="auth-birth-date" name="birthDate" type="date" value="${escapeHtml(draft.birthDate)}" />
              <div class="field-error"></div>
            </div>
            <div>
              <label class="form-label" for="auth-photo">Фото</label>
              <input class="form-control" id="auth-photo" name="photo" type="file" accept="image/*" />
              <div class="field-error"></div>
            </div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="auth-password">Пароль</label>
              <input class="form-control" id="auth-password" name="password" type="password" placeholder="••••••••" value="${escapeHtml(draft.password)}" />
              <div class="field-error">${errors.password || ''}</div>
            </div>
            <div>
              <label class="form-label" for="auth-password-repeat">Повтор пароля</label>
              <input class="form-control" id="auth-password-repeat" name="passwordRepeat" type="password" placeholder="••••••••" value="${escapeHtml(draft.passwordRepeat)}" />
              <div class="field-error">${errors.passwordRepeat || ''}</div>
            </div>
          </div>

          <p class="form-note">Кнопка активна только когда обязательные поля заполнены и пароли совпадают. Фото можно добавить позже.</p>

          <button id="auth-submit" type="submit" class="primary-btn" ${isAuthValid() ? '' : 'disabled'}>Создать профиль</button>
        </form>
      </section>
    `;
  },

  auth_success() {
    const name = getUserFullName();
    return `
      <section class="auth-shell">
        <div class="auth-success">
          <div class="auth-success-icon">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="board-title" style="font-size:28px; margin-bottom:10px;">Аккаунт создан</h2>
          <p class="muted-copy" style="margin:0 0 18px;">${name}, профиль сохранён. Перенаправляем на список турниров.</p>
          <button class="primary-btn" type="button" onclick="router.navigate('dashboard')">Перейти сейчас</button>
        </div>
      </section>
    `;
  },

  profile() {
    if (!STORE.user) return Screens.auth();

    const user = STORE.user;
    const initials = getUserInitials();
    const draft = STORE.userDraft;
    const errors = getAuthErrors({ ...draft, password: 'placeholder', passwordRepeat: 'placeholder' });
    return `
      <section class="profile-shell">
        <div class="profile-top">
          <div class="avatar-ring">${user.photo ? `<img src="${user.photo}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:999px;">` : initials}</div>
          <div>
            <h2 class="profile-name">${escapeHtml(getUserFullName())}</h2>
            <div class="profile-sub">${escapeHtml(user.phone)} · статус ${user.status}</div>
          </div>
        </div>

        <div class="profile-meta-grid">
          <div class="profile-meta-card">
            <div class="label">Уровень</div>
            <div class="value">${escapeHtml(user.level)}</div>
          </div>
          <div class="profile-meta-card">
            <div class="label">Пол</div>
            <div class="value">${user.gender === 'female' ? 'Женщина' : 'Мужчина'}</div>
          </div>
          <div class="profile-meta-card">
            <div class="label">Дата рождения</div>
            <div class="value">${escapeHtml(user.birthDate || 'Не указана')}</div>
          </div>
          <div class="profile-meta-card">
            <div class="label">Клубы</div>
            <div class="value">0 / можно несколько</div>
          </div>
        </div>

        <form id="profile-form" class="profile-form">
          <div class="form-grid-2">
            <div>
              <label class="form-label" for="profile-first-name">Имя</label>
              <input class="form-control" id="profile-first-name" name="firstName" type="text" value="${escapeHtml(draft.firstName || user.firstName)}" />
              <div class="field-error">${errors.firstName || ''}</div>
            </div>
            <div>
              <label class="form-label" for="profile-last-name">Фамилия</label>
              <input class="form-control" id="profile-last-name" name="lastName" type="text" value="${escapeHtml(draft.lastName || user.lastName)}" />
              <div class="field-error">${errors.lastName || ''}</div>
            </div>
          </div>

          <div>
            <label class="form-label" for="profile-phone">Телефон</label>
            <input class="form-control" id="profile-phone" name="phone" type="tel" value="${escapeHtml(draft.phone || user.phone)}" />
            <div class="field-error">${errors.phone || ''}</div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="profile-level">Уровень</label>
              <select class="form-control" id="profile-level" name="level">
                <option value="A" ${(draft.level || user.level) === 'A' ? 'selected' : ''}>A</option>
                <option value="B" ${(draft.level || user.level) === 'B' ? 'selected' : ''}>B</option>
                <option value="C" ${(draft.level || user.level) === 'C' ? 'selected' : ''}>C</option>
                <option value="D" ${(draft.level || user.level) === 'D' ? 'selected' : ''}>D</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="profile-gender">Пол</label>
              <select class="form-control" id="profile-gender" name="gender">
                <option value="male" ${(draft.gender || user.gender) === 'male' ? 'selected' : ''}>Мужчина</option>
                <option value="female" ${(draft.gender || user.gender) === 'female' ? 'selected' : ''}>Женщина</option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="profile-birth-date">Дата рождения</label>
              <input class="form-control" id="profile-birth-date" name="birthDate" type="date" value="${escapeHtml(draft.birthDate || user.birthDate || '')}" />
              <div class="field-error"></div>
            </div>
            <div>
              <label class="form-label" for="profile-photo">Фото</label>
              <input class="form-control" id="profile-photo" name="photo" type="file" accept="image/*" />
              <div class="field-error"></div>
            </div>
          </div>

          <button id="profile-save" type="submit" class="primary-btn">Сохранить профиль</button>
          ${STORE.profileStatusMessage ? `<button type="button" class="secondary-btn">${STORE.profileStatusMessage}</button>` : ''}
        </form>
      </section>
    `;
  }
};

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function render() {
  const content = document.getElementById('screen-content');
  if (!content) return;

  if (!STORE.user && !['auth', 'auth_success'].includes(STORE.currentScreen)) {
    STORE.currentScreen = 'auth';
  }

  const screen = STORE.currentScreen;
  const view = Screens[screen] ? Screens[screen]() : Screens.dashboard();
  content.innerHTML = view;
  renderHeaderAndNav();
  bindScreenEvents();

  if (screen === 'auth_success' && STORE.user) {
    window.clearTimeout(window.__padelAuthSuccessTimeout);
    window.__padelAuthSuccessTimeout = window.setTimeout(() => {
      router.navigate('dashboard');
    }, 1300);
  }
}

function bindScreenEvents() {
  const registrationForm = document.getElementById('registration-form');
  if (registrationForm) {
    registrationForm.addEventListener('submit', handleTournamentRegistrationSubmit);
  }

  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', handleAuthSubmit);
    authForm.addEventListener('input', handleAuthInput);
    const photoInput = document.getElementById('auth-photo');
    if (photoInput) photoInput.addEventListener('change', handleAuthPhotoChange);
  }

  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSubmit);
    profileForm.addEventListener('input', handleProfileInput);
    const photoInput = document.getElementById('profile-photo');
    if (photoInput) photoInput.addEventListener('change', handleProfilePhotoChange);
  }
}

function updateUserDraftFromForm(form) {
  const formData = new FormData(form);
  STORE.userDraft = {
    ...STORE.userDraft,
    firstName: String(formData.get('firstName') || '').trim(),
    lastName: String(formData.get('lastName') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    level: String(formData.get('level') || 'C'),
    gender: String(formData.get('gender') || 'male'),
    birthDate: String(formData.get('birthDate') || ''),
    password: String(formData.get('password') || STORE.userDraft.password || ''),
    passwordRepeat: String(formData.get('passwordRepeat') || STORE.userDraft.passwordRepeat || '')
  };
}

function handleAuthInput(event) {
  updateUserDraftFromForm(event.currentTarget);
  persist();
  render();
}

function handleProfileInput(event) {
  const formData = new FormData(event.currentTarget);
  STORE.userDraft = {
    ...STORE.userDraft,
    firstName: String(formData.get('firstName') || '').trim(),
    lastName: String(formData.get('lastName') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    level: String(formData.get('level') || 'C'),
    gender: String(formData.get('gender') || 'male'),
    birthDate: String(formData.get('birthDate') || '')
  };
  persist();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleAuthPhotoChange(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  STORE.userDraft.photo = await fileToDataUrl(file);
  persist();
}

async function handleProfilePhotoChange(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const dataUrl = await fileToDataUrl(file);
  STORE.userDraft.photo = dataUrl;
  persist();
}

function createUserFromDraft() {
  return {
    id: Date.now(),
    firstName: STORE.userDraft.firstName.trim(),
    lastName: STORE.userDraft.lastName.trim(),
    phone: STORE.userDraft.phone.trim(),
    level: STORE.userDraft.level,
    gender: STORE.userDraft.gender,
    birthDate: STORE.userDraft.birthDate,
    photo: STORE.userDraft.photo || '',
    status: 'active',
    createdAt: new Date().toISOString()
  };
}

function handleAuthSubmit(event) {
  event.preventDefault();
  updateUserDraftFromForm(event.currentTarget);
  const errors = getAuthErrors(STORE.userDraft);
  if (Object.keys(errors).length) {
    persist();
    render();
    return;
  }

  STORE.user = createUserFromDraft();
  STORE.profileStatusMessage = '';
  STORE.currentScreen = 'auth_success';
  persist();
  render();
}

function handleProfileSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const nextData = {
    ...STORE.user,
    firstName: String(formData.get('firstName') || '').trim(),
    lastName: String(formData.get('lastName') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    level: String(formData.get('level') || 'C'),
    gender: String(formData.get('gender') || 'male'),
    birthDate: String(formData.get('birthDate') || ''),
    photo: STORE.userDraft.photo || STORE.user.photo || ''
  };

  if (!nextData.firstName || !nextData.lastName || !nextData.phone) {
    STORE.profileStatusMessage = 'Проверь обязательные поля';
    persist();
    render();
    return;
  }

  STORE.user = nextData;
  STORE.userDraft = {
    ...STORE.userDraft,
    firstName: nextData.firstName,
    lastName: nextData.lastName,
    phone: nextData.phone,
    level: nextData.level,
    gender: nextData.gender,
    birthDate: nextData.birthDate,
    photo: nextData.photo
  };
  STORE.profileStatusMessage = 'Профиль сохранён';
  persist();
  render();
}

function handleTournamentRegistrationSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const playerName = String(formData.get('playerName') || '').trim();
  const playerLevel = String(formData.get('playerLevel') || 'C');

  if (!playerName) return;

  STORE.registration.playerName = playerName;
  STORE.registration.playerLevel = playerLevel;

  const tournament = STORE.tournaments.find((item) => item.id === STORE.activeTournamentId) || STORE.tournaments[2];
  const isWaiting = tournament.confirmedPlayers >= tournament.maxPlayers;
  const savedStatus = isWaiting ? 'waiting' : 'pending';

  STORE.registrations.push({
    id: Date.now(),
    tournamentId: tournament.id,
    playerName,
    playerLevel,
    status: savedStatus,
    createdAt: new Date().toISOString()
  });

  if (isWaiting) {
    tournament.waitingPlayers += 1;
    STORE.registration.statusMessage = 'Вы в waiting list';
  } else {
    tournament.confirmedPlayers += 1;
    STORE.registration.statusMessage = 'Заявка отправлена';
  }

  persist();
  render();
}

window.openTournamentRegistration = function openTournamentRegistration(tournamentId) {
  STORE.activeTournamentId = tournamentId;
  const tournament = STORE.tournaments.find((item) => item.id === tournamentId);
  if (tournament && tournament.status === 'LIVE') {
    STORE.currentScreen = 'live';
  } else {
    STORE.currentScreen = 'registration';
    STORE.registration.statusMessage = '';
  }
  persist();
  render();
};

window.setActiveRound = function setActiveRound(round) {
  STORE.activeRound = round;
  persist();
  render();
};

document.addEventListener('DOMContentLoaded', () => {
  render();
});
