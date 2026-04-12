
const STORAGE_KEY = 'padel-riga-tracker-v61';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function unique(list) {
  return [...new Set((list || []).filter(Boolean))];
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
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

function formatStatus(status) {
  if (status === 'LIVE') return '<span class="status-pill">LIVE</span>';
  if (status === 'OPEN') return '<span class="status-pill">РЕГИСТРАЦИЯ ОТКРЫТА</span>';
  if (status === 'FULL') return '<span class="status-pill planned">FULL</span>';
  if (status === 'PLANNED') return '<span class="status-pill planned">ЗАПЛАНИРОВАН</span>';
  if (status === 'CLOSED') return '<span class="status-pill closed">CLOSED</span>';
  if (status === 'FINISHED') return '<span class="status-pill finished">Finished</span>';
  return '<span class="status-pill planned">Planned</span>';
}

function formatMinutes(totalMinutes) {
  const total = Math.max(0, Math.round(Number(totalMinutes || 0)));
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours && minutes) return `${hours} ч ${minutes} мин`;
  if (hours) return `${hours} ч`;
  return `${minutes} мин`;
}

function buildBirthDate({ birthDay = '', birthMonth = '', birthYear = '' }) {
  const dd = String(birthDay || '').padStart(2, '0');
  const mm = String(birthMonth || '').padStart(2, '0');
  const yyyy = String(birthYear || '');
  if (!dd || !mm || !yyyy || yyyy.length !== 4) return '';
  return `${yyyy}-${mm}-${dd}`;
}

function formatBirthDate(source) {
  const dd = String(source.birthDay || '').padStart(2, '0');
  const mm = String(source.birthMonth || '').padStart(2, '0');
  const yyyy = String(source.birthYear || '');
  if (!dd || !mm || !yyyy) return 'Не указана';
  return `${dd}.${mm}.${yyyy}`;
}

function getDaysLeftFromIso(startDate) {
  if (!startDate) return 0;
  const now = new Date();
  const start = new Date(startDate);
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diff = Math.round((start - now) / 86400000);
  return Math.max(0, diff);
}

function formatShortRuDate(iso) {
  const d = new Date(iso);
  const months = ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}`;
}

const DEMO_PLAYERS = [
  { id: 'u_1', name: 'Николай' }, { id: 'u_2', name: 'Виктор' }, { id: 'u_3', name: 'Алексей' }, { id: 'u_4', name: 'Сергей' },
  { id: 'u_5', name: 'Андрей' }, { id: 'u_6', name: 'Марк' }, { id: 'u_7', name: 'Лука' }, { id: 'u_8', name: 'Игорь' },
  { id: 'u_9', name: 'Роман' }, { id: 'u_10', name: 'Никита' }, { id: 'u_11', name: 'Дима' }, { id: 'u_12', name: 'Павел' },
  { id: 'u_13', name: 'Артур' }, { id: 'u_14', name: 'Янис' }, { id: 'u_15', name: 'Егор' }, { id: 'u_16', name: 'Максим' },
  { id: 'u_17', name: 'Денис' }, { id: 'u_18', name: 'Олег' }
];

function getPlayerNameById(id, user) {
  if (!id) return '';
  if (user && user.id === id) return `${user.firstName || ''}`.trim() || id;
  const found = DEMO_PLAYERS.find((item) => item.id === id);
  return found ? found.name : id;
}

function getUserFullName() {
  if (!STORE.user) return '';
  return `${STORE.user.firstName || ''} ${STORE.user.lastName || ''}`.trim();
}

function getUserInitials() {
  const fullName = getUserFullName();
  return fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'NP';
}

function getAuthErrors(draft) {
  const errors = {};
  if (!String(draft.firstName || '').trim()) errors.firstName = 'Введите имя';
  if (!String(draft.lastName || '').trim()) errors.lastName = 'Введите фамилию';
  if (!String(draft.phone || '').trim() || String(draft.phone || '').trim() === '+371') errors.phone = 'Введите телефон';
  if (!String(draft.password || '')) errors.password = 'Введите пароль';
  if (!String(draft.passwordRepeat || '')) errors.passwordRepeat = 'Повторите пароль';
  else if (String(draft.password || '') !== String(draft.passwordRepeat || '')) errors.passwordRepeat = 'Пароли не совпадают';
  return errors;
}

function isAuthValid() {
  return Object.keys(getAuthErrors(STORE.userDraft)).length === 0;
}

function profileDraftFromUser() {
  if (!STORE.user) return clone(DEFAULT_STATE.userDraft);
  return {
    firstName: STORE.user.firstName || '',
    lastName: STORE.user.lastName || '',
    phone: STORE.user.phone || '+371',
    level: STORE.user.level || 'C',
    gender: STORE.user.gender || 'male',
    birthDay: STORE.user.birthDay || '',
    birthMonth: STORE.user.birthMonth || '',
    birthYear: STORE.user.birthYear || '',
    photo: STORE.user.photo || '',
    password: '',
    passwordRepeat: ''
  };
}

function makePairs(participants) {
  const ids = unique(participants);
  const pairs = [];
  for (let i = 0; i + 1 < ids.length; i += 2) {
    pairs.push({ pairId: `pair_${(i / 2) + 1}`, players: [ids[i], ids[i + 1]] });
  }
  return pairs;
}

function roundRobinPairings(pairs, limitRounds) {
  if (pairs.length < 2) return [];
  const items = pairs.slice();
  if (items.length % 2 !== 0) items.push({ pairId: 'bye', players: [] });

  const rounds = [];
  let arr = items.slice();

  for (let round = 0; round < arr.length - 1; round += 1) {
    const matches = [];
    for (let i = 0; i < arr.length / 2; i += 1) {
      const a = arr[i];
      const b = arr[arr.length - 1 - i];
      if (a.pairId !== 'bye' && b.pairId !== 'bye') matches.push({ left: a, right: b });
    }
    rounds.push(matches);
    const fixed = arr[0];
    const rotating = arr.slice(1);
    rotating.unshift(rotating.pop());
    arr = [fixed, ...rotating];
  }

  return Number(limitRounds) > 0 ? rounds.slice(0, limitRounds) : rounds;
}

function deriveTournamentEngine(tournament) {
  const t = { ...tournament };
  t.participants = unique(t.participants || []);
  t.waitlist = unique(t.waitlist || []);
  t.confirmedPlayers = t.participants.length;
  t.waitingPlayers = t.waitlist.length;
  t.daysLeft = getDaysLeftFromIso(t.startDate);
  t.date = formatShortRuDate(t.startDate);
  t.duration = formatMinutes(t.totalTime);
  t.countdownLabel = `${t.daysLeft} дней`;

  if (t.status !== 'LIVE' && t.status !== 'FINISHED') {
    t.status = t.confirmedPlayers >= t.maxPlayers ? 'FULL' : 'OPEN';
  }

  const pairableCount = t.participants.length - (t.participants.length % 2);
  const pairParticipants = t.participants.slice(0, pairableCount);
  const pairs = makePairs(pairParticipants);

  const roundsCount = Math.max(1, Math.min(Number(t.roundsTarget || 1), Math.max(1, (pairs.length - 1) || 1)));
  const totalBuffer = Math.max(0, roundsCount - 1) * Number(t.buffer || 0);
  const tourDuration = Math.max(10, Math.floor((Number(t.totalTime || 0) - totalBuffer) / Math.max(1, roundsCount)));
  const schedule = roundRobinPairings(pairs, roundsCount);

  t.pairing = pairs;
  t.tourDuration = tourDuration;
  t.rounds = schedule.map((matches, roundIndex) => {
    const roundStart = new Date(t.startDate);
    roundStart.setMinutes(roundStart.getMinutes() + roundIndex * (tourDuration + Number(t.buffer || 0)));
    const timeLabel = roundStart.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    return {
      round: roundIndex + 1,
      startsAt: roundStart.toISOString(),
      durationMinutes: tourDuration,
      matches: matches.slice(0, Number(t.courts || matches.length)).map((match, matchIndex) => ({
        id: `${t.id}_${roundIndex + 1}_${matchIndex + 1}`,
        cardType: roundIndex === 0 ? (matchIndex === 0 ? 'live' : 'waiting') : 'waiting',
        players: match.left.players.map((id) => getPlayerNameById(id, STORE.user)),
        opponents: match.right.players.map((id) => getPlayerNameById(id, STORE.user)),
        score: roundIndex === 0 && matchIndex === 0 ? [6, 3] : null,
        time: timeLabel,
        court: `Корт ${matchIndex + 1}`,
        duration: `${tourDuration} мин`
      }))
    };
  });

  t.grid = (t.rounds[0]?.matches || []).map((match, idx) => ({
    court: String(idx + 1),
    time: match.time,
    title: `${match.players.join(' / ')} vs ${match.opponents.join(' / ')}`,
    state: match.cardType === 'live' ? 'LIVE' : 'WAITING'
  }));

  return t;
}

const DEFAULT_STATE = {
  currentScreen: 'dashboard',
  activeTournamentId: 1,
  activeRound: 1,
  registration: { playerName: '', partnerName: '', statusMessage: '' },
  user: null,
  userDraft: {
    firstName: '',
    lastName: '',
    phone: '+371',
    level: 'C',
    gender: 'male',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    photo: '',
    password: '',
    passwordRepeat: ''
  },
  profileEditMode: false,
  profileStatusMessage: '',
  tournaments: [
    { id: 1, type: 'my', title: 'Riga Evening Open', badgeTop: 'RIGA', badgeBottom: 'EVENING OPEN', city: 'Riga', time: '10:00', startDate: '2026-08-17T10:00:00', totalTime: 180, roundsTarget: 7, buffer: 5, courts: 4, maxPlayers: 16, status: 'LIVE', allowRegistration: false, participants: ['u_1','u_2','u_3','u_4','u_5','u_6','u_7','u_8','u_9','u_10','u_11','u_12','u_13','u_14','u_15','u_16'], waitlist: [], pairing: [], rounds: [], grid: [] },
    { id: 2, type: 'my', title: 'Tallinn Padel Cup', badgeTop: 'TALLINN', badgeBottom: 'PADEL CUP', city: 'Tallinn', time: '11:30', startDate: '2026-08-25T11:30:00', totalTime: 150, roundsTarget: 5, buffer: 5, courts: 3, maxPlayers: 12, status: 'PLANNED', allowRegistration: false, participants: ['u_1','u_2','u_3','u_4','u_5','u_6','u_7','u_8'], waitlist: [], pairing: [], rounds: [], grid: [] },
    { id: 3, type: 'available', title: 'Riga Morning Open', badgeTop: 'RIGA', badgeBottom: 'MORNING OPEN', city: 'Riga', time: '09:30', startDate: '2026-08-19T09:30:00', totalTime: 165, roundsTarget: 5, buffer: 5, courts: 2, maxPlayers: 8, status: 'OPEN', allowRegistration: true, participants: ['u_1','u_2','u_3','u_4','u_5','u_6'], waitlist: [], pairing: [], rounds: [], grid: [] },
    { id: 4, type: 'available', title: 'Kaunas Padel Challenge', badgeTop: 'KAUNAS', badgeBottom: 'PADEL CHALLENGE', city: 'Kaunas', time: '12:00', startDate: '2026-08-21T12:00:00', totalTime: 180, roundsTarget: 7, buffer: 5, courts: 4, maxPlayers: 16, status: 'OPEN', allowRegistration: true, participants: ['u_1','u_2','u_3','u_4','u_5','u_6','u_7','u_8'], waitlist: [], pairing: [], rounds: [], grid: [] },
    { id: 5, type: 'available', title: 'Autumn Slam', badgeTop: 'RIGA', badgeBottom: 'AUTUMN SLAM', city: 'Рига, Skunste', time: '10:00', startDate: '2026-08-26T10:00:00', totalTime: 180, roundsTarget: 7, buffer: 5, courts: 4, maxPlayers: 16, status: 'OPEN', allowRegistration: true, participants: [], waitlist: [], pairing: [], rounds: [], grid: [] }
  ],
  stats: [
    { rank: 1, name: 'Николай', wins: 3, diff: '+12' },
    { rank: 2, name: 'Виктор', wins: 3, diff: '+9' },
    { rank: 3, name: 'Алексей', wins: 2, diff: '+3' },
    { rank: 4, name: 'Сергей', wins: 1, diff: '-5' }
  ],
  registrations: []
};

function migrateState(state) {
  state.tournaments = (state.tournaments || []).map((tournament, index) => {
    const base = clone(DEFAULT_STATE.tournaments[index] || DEFAULT_STATE.tournaments[0]);
    return {
      ...base,
      ...tournament,
      participants: unique(tournament.participants || base.participants || []),
      waitlist: unique(tournament.waitlist || []),
      pairing: tournament.pairing || [],
      rounds: tournament.rounds || [],
      grid: tournament.grid || []
    };
  });
  return state;
}

function deriveState(state) {
  state.tournaments = state.tournaments.map(deriveTournamentEngine);
  const active = state.tournaments.find((item) => item.id === state.activeTournamentId) || state.tournaments[0];
  if (active) {
    state.activeRound = Math.min(Math.max(1, Number(state.activeRound || 1)), Math.max(1, active.rounds.length || 1));
  }
  return state;
}

function loadState() {
  const base = clone(DEFAULT_STATE);
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('padel-riga-tracker-v27') || localStorage.getItem('padel-riga-tracker-v26');
    if (!raw) {
      base.currentScreen = 'auth';
      return deriveState(base);
    }
    const parsed = JSON.parse(raw);
    const merged = migrateState({
      ...base,
      ...parsed,
      registration: { ...base.registration, ...(parsed.registration || {}) },
      userDraft: { ...base.userDraft, ...(parsed.userDraft || {}) }
    });
    if (!merged.user) merged.currentScreen = 'auth';
    return deriveState(merged);
  } catch (error) {
    console.error('Failed to load state:', error);
    base.currentScreen = 'auth';
    return deriveState(base);
  }
}

let STORE = loadState();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STORE));
}

window.router = {
  navigate(screen) {
    if (!STORE.user && !['auth', 'auth_success'].includes(screen)) {
      STORE.currentScreen = 'auth';
    } else {
      STORE.currentScreen = screen;
      if (screen !== 'profile') {
        STORE.profileEditMode = false;
        STORE.profileStatusMessage = '';
      }
    }
    persist();
    render();
  }
};

function renderHeaderAndNav() {
  const header = document.getElementById('main-header');
  const nav = document.querySelector('.bottom-nav');
  const profileBtn = header ? header.querySelector('.ghost-pill') : null;

  if (!header || !nav) return;

  if (!STORE.user || ['auth', 'auth_success'].includes(STORE.currentScreen)) {
    header.style.display = 'none';
    nav.style.display = 'none';
    return;
  }

  header.style.display = 'flex';
  nav.style.display = 'grid';
  if (profileBtn) profileBtn.textContent = 'Profile';

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
        <div class="card-dots">${Array.from({ length: Math.max(dots, 1) }).map((_, index) => `<span class="${index === 0 ? 'active' : ''}"></span>`).join('')}</div>
      </section>
    `;
  },

  tournamentCard(t) {
    const cardClass = t.status === 'LIVE' || t.status === 'OPEN' ? 'is-green' : t.status === 'CLOSED' ? 'is-closed' : '';
    return `
      <article class="tournament-card ${cardClass}" onclick="openTournamentRegistration(${t.id})">
        <div class="card-shell">
          <div class="card-topline">${formatStatus(t.status)}</div>
          <div class="card-topline" style="margin-top:14px;">
            <div class="event-badge"><div><strong>${t.badgeTop}</strong><strong>${t.badgeBottom}</strong><span>2026</span></div></div>
          </div>
          <h3 class="card-title">${escapeHtml(t.title)}</h3>
          <div class="tournament-extra-line">Турнир: ${t.duration} · Тур: ${formatMinutes(t.tourDuration)}</div>
          <div class="card-foot">
            <div class="meta-item">${iconCalendar()}<span>${t.date}</span></div>
            <div class="meta-item">${iconPin()}<span>${escapeHtml(t.city)}</span></div>
            <div class="meta-item">${iconClock()}<span>${t.time}</span></div>
            <div class="meta-item">${iconClock()}<span>${t.confirmedPlayers}/${t.maxPlayers}</span></div>
          </div>
        </div>
      </article>
    `;
  },

  liveTab(round) {
    return `<button class="live-tab ${STORE.activeRound === round ? 'active' : ''}" onclick="setActiveRound(${round})">ТУР ${round}</button>`;
  },

  liveCard(match) {
    if (match.cardType === 'waiting') {
      return `
        <article class="match-card is-waiting">
          <div class="card-shell">
            <div class="card-topline">${formatStatus('PLANNED')}</div>
            <div class="match-overlay-icon match-overlay-neutral">Waiting<br>VS</div>
            <div class="players-row">
              <div class="player-name">${match.players.join(' / ')}</div>
              <div class="player-name" style="text-align:right;">${match.opponents.join(' / ')}</div>
            </div>
            <div class="card-bottom-meta">
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
            <div class="player-name">${match.players.join(' / ')}</div>
            <div class="player-name" style="text-align:right;">${match.opponents.join(' / ')}</div>
          </div>
          <div class="score-row">
            <div class="score-box">${match.score ? match.score[0] : '—'}</div>
            <div class="score-box">${match.score ? match.score[1] : '—'}</div>
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
            <div class="kpi-value" style="font-size:22px;">MULTICLUB</div>
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
              <div class="field-error" data-error-for="firstName">${errors.firstName || ''}</div>
            </div>
            <div>
              <label class="form-label" for="auth-last-name">Фамилия</label>
              <input class="form-control" id="auth-last-name" name="lastName" type="text" placeholder="Pogodins" value="${escapeHtml(draft.lastName)}" />
              <div class="field-error" data-error-for="lastName">${errors.lastName || ''}</div>
            </div>
          </div>

          <div>
            <label class="form-label" for="auth-phone">Телефон</label>
            <input class="form-control" id="auth-phone" name="phone" type="tel" placeholder="+371 2xxxxxxx" value="${escapeHtml(draft.phone)}" />
            <div class="field-error" data-error-for="phone">${errors.phone || ''}</div>
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="auth-level">Уровень</label>
              <select class="form-control" id="auth-level" name="level">
                ${['A','B','C','D'].map((level) => `<option value="${level}" ${draft.level === level ? 'selected' : ''}>${level}</option>`).join('')}
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

          <div>
            <label class="form-label">Дата рождения</label>
            <div class="birth-grid">
              <input class="form-control" name="birthDay" inputmode="numeric" maxlength="2" placeholder="ДД" value="${escapeHtml(draft.birthDay)}" />
              <input class="form-control" name="birthMonth" inputmode="numeric" maxlength="2" placeholder="ММ" value="${escapeHtml(draft.birthMonth)}" />
              <input class="form-control" name="birthYear" inputmode="numeric" maxlength="4" placeholder="ГГГГ" value="${escapeHtml(draft.birthYear)}" />
            </div>
          </div>

          <div>
            <label class="form-label" for="auth-photo">Фото</label>
            <input class="form-control form-file" id="auth-photo" name="photo" type="file" accept="image/*" />
          </div>

          <div class="form-grid-2">
            <div>
              <label class="form-label" for="auth-password">Пароль</label>
              <input class="form-control" id="auth-password" name="password" type="password" placeholder="••••••••" value="${escapeHtml(draft.password)}" />
              <div class="field-error" data-error-for="password">${errors.password || ''}</div>
            </div>
            <div>
              <label class="form-label" for="auth-password-repeat">Повтор пароля</label>
              <input class="form-control" id="auth-password-repeat" name="passwordRepeat" type="password" placeholder="••••••••" value="${escapeHtml(draft.passwordRepeat)}" />
              <div class="field-error" data-error-for="passwordRepeat">${errors.passwordRepeat || ''}</div>
            </div>
          </div>

          <p class="form-note">Кнопка активна только когда обязательные поля заполнены и пароли совпадают. Фото можно добавить позже.</p>
          <button id="auth-submit" type="submit" class="primary-btn" ${isAuthValid() ? '' : 'disabled'}>Создать профиль</button>
        </form>
      </section>
    `;
  },

  auth_success() {
    return `
      <section class="auth-shell">
        <div class="auth-success">
          <div class="auth-success-icon">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2>Аккаунт создан</h2>
          <p>Переходим к списку турниров…</p>
        </div>
      </section>
    `;
  },

  dashboard() {
    const my = STORE.tournaments.filter((item) => item.type === 'my' || ((STORE.user?.tournaments || []).includes(item.id)));
    const available = STORE.tournaments.filter((item) => !((STORE.user?.tournaments || []).includes(item.id)) && item.type !== 'my');
    return `
      ${UI.section('Мои турниры', my.map(UI.tournamentCard).join(''), '', Math.max(my.length, 1))}
      ${UI.section('Доступные турниры', available.map(UI.tournamentCard).join(''), 'section-green', Math.max(available.length, 1))}
    `;
  },

  live() {
    const activeTournament = STORE.tournaments.find((item) => item.status === 'LIVE') || STORE.tournaments[0];
    const rounds = activeTournament.rounds || [];
    const currentRound = rounds[STORE.activeRound - 1] || rounds[0];
    const userFirstName = STORE.user ? STORE.user.firstName : '';
    const visible = currentRound
      ? (currentRound.matches.filter((match) => [...match.players, ...match.opponents].includes(userFirstName)).length
          ? currentRound.matches.filter((match) => [...match.players, ...match.opponents].includes(userFirstName))
          : currentRound.matches)
      : [];
    const cards = visible.length ? visible.map(UI.liveCard).join('') : '<div class="empty-state">Для этого тура матчи еще не опубликованы</div>';

    return `
      <section class="section-shell">
        <div class="live-tabs">${(rounds.length ? rounds : [{ round: 1 }]).map((item) => UI.liveTab(item.round)).join('')}</div>
        <div class="cards-track" style="margin-top:16px;">${cards}</div>
        <div class="card-dots">${(rounds.length ? rounds : [{ round: 1 }]).map((item) => `<span class="${item.round === STORE.activeRound ? 'active' : ''}"></span>`).join('')}</div>
      </section>
    `;
  },

  grid() {
    const activeTournament = STORE.tournaments.find((item) => item.id === STORE.activeTournamentId) || STORE.tournaments[0];
    const rows = activeTournament.grid || [];
    return `
      <section class="grid-board">
        <h2 class="board-title">Все корты / текущий тур</h2>
        <div class="grid-list">
          ${rows.length ? rows.map((item) => `
            <article class="grid-item">
              <div class="grid-item-top">
                <div class="court-pill">${item.court}</div>
                <div>
                  <div style="font-weight:700;">${item.title}</div>
                  <div class="grid-time">${item.time}</div>
                </div>
                <div class="status-pill ${item.state === 'LIVE' ? '' : 'planned'}" style="min-width:88px; justify-content:center;">${item.state}</div>
              </div>
            </article>
          `).join('') : '<div class="empty-block-note">Сетка появится после формирования fixed pairs</div>'}
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
    const selectedTournament = STORE.tournaments.find((item) => item.id === STORE.activeTournamentId) || STORE.tournaments[2];
    const userName = STORE.user ? getUserFullName() : '';
    const profileLevel = STORE.user ? STORE.user.level : '—';
    const alreadyJoined = !!(STORE.user && (STORE.user.tournaments || []).includes(selectedTournament.id));
    const inWaitlist = !!(STORE.user && (STORE.user.waitlists || []).includes(selectedTournament.id));
    const isFull = selectedTournament.status === 'FULL';
    const primaryLabel = alreadyJoined ? 'ВЫ УЖЕ В ТУРНИРЕ' : inWaitlist ? 'ВЫ В ОЧЕРЕДИ' : isFull ? 'ВСТАТЬ В ОЧЕРЕДЬ' : 'ПОДТВЕРДИТЬ УЧАСТИЕ';

    return `
      <section class="section-shell">
        <div class="registration-concept-card">
          <div class="registration-concept-logo">${escapeHtml(selectedTournament.badgeTop)}<br>${escapeHtml(selectedTournament.badgeBottom)}</div>
          <h2 class="registration-concept-title">РЕГИСТРАЦИЯ:<br>${escapeHtml(selectedTournament.title)} 💎💎💎</h2>

          <div class="registration-tabs">
            <button class="registration-tab active" type="button">ДАННЫЕ</button>
            <button class="registration-tab muted" type="button">СТАТУС</button>
            <button class="registration-tab muted" type="button">ПРОФИЛЬ</button>
          </div>

          <div class="registration-copy">
            ${alreadyJoined
              ? 'Вы уже в турнире. Профиль автоматически привязан, место сохранено за вами.'
              : inWaitlist
                ? 'Вы уже в waitlist. При освобождении места система переведёт вас автоматически.'
                : isFull
                  ? 'Основной состав заполнен. Можно встать в waitlist.'
                  : 'Используем ваш профиль автоматически. Одна кнопка — и вы сразу попадаете в турнир.'}
          </div>

          <form id="registration-form" class="registration-concept-form">
            <div class="profile-linked-card">
              <div class="profile-linked-label">Профиль участника</div>
              <div class="profile-linked-name">${escapeHtml(userName || 'Профиль не создан')}</div>
              <div class="profile-linked-sub">Уровень ${escapeHtml(profileLevel)} · ${STORE.user && STORE.user.gender === 'female' ? 'Женщина' : 'Мужчина'}</div>
            </div>

            <button type="submit" class="primary-btn" ${alreadyJoined || inWaitlist ? 'disabled' : ''}>${primaryLabel}</button>
          </form>

          ${STORE.registration.statusMessage ? `<div class="inline-success">${STORE.registration.statusMessage}</div>` : ''}

          <div class="registration-facts">
            <div>
              <div class="registration-fact-label">До старта:</div>
              <div class="registration-fact-value">${selectedTournament.countdownLabel}</div>
            </div>
            <div>
              <div class="registration-fact-label">Локация:</div>
              <div class="registration-fact-value">📍 ${escapeHtml(selectedTournament.city)}</div>
            </div>
            <div>
              <div class="registration-fact-label">Участники:</div>
              <div class="registration-fact-value">${selectedTournament.confirmedPlayers}/${selectedTournament.maxPlayers}</div>
            </div>
          </div>

          <div class="profile-mini-card">
            <div class="profile-mini-avatar">${STORE.user && STORE.user.photo ? `<img src="${STORE.user.photo}" alt="avatar" />` : getUserInitials()}</div>
            <div>
              <div class="profile-mini-name">${escapeHtml(userName || 'Профиль не создан')}</div>
              <div class="profile-mini-sub">${escapeHtml(profileLevel)}</div>
            </div>
            <div class="profile-mini-badge">${alreadyJoined ? 'Joined' : inWaitlist ? 'Waitlist' : 'Ready'}</div>
          </div>
        </div>
      </section>
    `;
  },

  profile() {
    if (!STORE.user) return Screens.auth();

    const user = STORE.user;
    const initials = getUserInitials();
    const isEdit = STORE.profileEditMode;
    const draft = {
      firstName: STORE.userDraft.firstName || user.firstName || '',
      lastName: STORE.userDraft.lastName || user.lastName || '',
      phone: STORE.userDraft.phone || user.phone || '+371',
      level: STORE.userDraft.level || user.level || 'C',
      gender: STORE.userDraft.gender || user.gender || 'male',
      birthDay: STORE.userDraft.birthDay || user.birthDay || '',
      birthMonth: STORE.userDraft.birthMonth || user.birthMonth || '',
      birthYear: STORE.userDraft.birthYear || user.birthYear || '',
      photo: STORE.userDraft.photo || user.photo || ''
    };

    return `
      <section class="profile-shell">
        <div class="profile-head-row">
          <div class="profile-top">
            <div class="avatar-ring">${user.photo ? `<img src="${user.photo}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:999px;">` : initials}</div>
            <div>
              <h2 class="profile-name">${escapeHtml(getUserFullName())}</h2>
              <div class="profile-sub">${escapeHtml(user.phone)} · статус ${user.status}</div>
            </div>
          </div>
          <button class="ghost-pill" type="button" onclick="toggleProfileEdit()">${isEdit ? 'Отмена' : 'Редактировать'}</button>
        </div>

        ${!isEdit ? `
          <div class="profile-meta-grid">
            <div class="profile-meta-card"><div class="label">Уровень</div><div class="value">${escapeHtml(user.level)}</div></div>
            <div class="profile-meta-card"><div class="label">Пол</div><div class="value">${user.gender === 'female' ? 'Женщина' : 'Мужчина'}</div></div>
            <div class="profile-meta-card"><div class="label">Дата рождения</div><div class="value">${escapeHtml(formatBirthDate(user))}</div></div>
            <div class="profile-meta-card"><div class="label">Клубы</div><div class="value">0 / можно несколько</div></div>
          </div>

          <div class="profile-detail-card">
            <div class="profile-detail-row"><span>Имя</span><strong>${escapeHtml(user.firstName)}</strong></div>
            <div class="profile-detail-row"><span>Фамилия</span><strong>${escapeHtml(user.lastName)}</strong></div>
            <div class="profile-detail-row"><span>Телефон</span><strong>${escapeHtml(user.phone)}</strong></div>
          </div>
        ` : `
          <form id="profile-form" class="profile-form profile-form-tight">
            <div class="form-grid-2">
              <div>
                <label class="form-label" for="profile-first-name">Имя</label>
                <input class="form-control" id="profile-first-name" name="firstName" type="text" value="${escapeHtml(draft.firstName)}" />
              </div>
              <div>
                <label class="form-label" for="profile-last-name">Фамилия</label>
                <input class="form-control" id="profile-last-name" name="lastName" type="text" value="${escapeHtml(draft.lastName)}" />
              </div>
            </div>

            <div>
              <label class="form-label" for="profile-phone">Телефон</label>
              <input class="form-control" id="profile-phone" name="phone" type="tel" value="${escapeHtml(draft.phone)}" />
            </div>

            <div class="form-grid-2">
              <div>
                <label class="form-label" for="profile-level">Уровень</label>
                <select class="form-control" id="profile-level" name="level">
                  ${['A','B','C','D'].map((level) => `<option value="${level}" ${draft.level === level ? 'selected' : ''}>${level}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="form-label" for="profile-gender">Пол</label>
                <select class="form-control" id="profile-gender" name="gender">
                  <option value="male" ${draft.gender === 'male' ? 'selected' : ''}>Мужчина</option>
                  <option value="female" ${draft.gender === 'female' ? 'selected' : ''}>Женщина</option>
                </select>
              </div>
            </div>

            <div>
              <label class="form-label">Дата рождения</label>
              <div class="birth-grid">
                <input class="form-control" name="birthDay" inputmode="numeric" maxlength="2" placeholder="ДД" value="${escapeHtml(draft.birthDay)}" />
                <input class="form-control" name="birthMonth" inputmode="numeric" maxlength="2" placeholder="ММ" value="${escapeHtml(draft.birthMonth)}" />
                <input class="form-control" name="birthYear" inputmode="numeric" maxlength="4" placeholder="ГГГГ" value="${escapeHtml(draft.birthYear)}" />
              </div>
            </div>

            <div>
              <label class="form-label" for="profile-photo">Фото</label>
              <input class="form-control form-file" id="profile-photo" name="photo" type="file" accept="image/*" />
            </div>

            <button id="profile-save" type="submit" class="primary-btn">Сохранить профиль</button>
            ${STORE.profileStatusMessage ? `<div class="inline-success">${STORE.profileStatusMessage}</div>` : ''}
          </form>
        `}
      </section>
    `;
  }
};

function bindScreenEvents() {
  const registrationForm = document.getElementById('registration-form');
  if (registrationForm) registrationForm.addEventListener('submit', handleTournamentRegistrationSubmit);

  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', handleAuthSubmit);
    authForm.addEventListener('input', handleAuthInput);
    const photoInput = document.getElementById('auth-photo');
    if (photoInput) photoInput.addEventListener('change', handleAuthPhotoChange);
    syncAuthUi();
  }

  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSubmit);
    profileForm.addEventListener('input', handleProfileInput);
    const photoInput = document.getElementById('profile-photo');
    if (photoInput) photoInput.addEventListener('change', handleProfilePhotoChange);
  }
}

function updateDraftFromForm(form, includePasswords = true) {
  const formData = new FormData(form);
  STORE.userDraft = {
    ...STORE.userDraft,
    firstName: String(formData.get('firstName') || '').trim(),
    lastName: String(formData.get('lastName') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    level: String(formData.get('level') || 'C'),
    gender: String(formData.get('gender') || 'male'),
    birthDay: String(formData.get('birthDay') || '').replace(/\D/g, '').slice(0,2),
    birthMonth: String(formData.get('birthMonth') || '').replace(/\D/g, '').slice(0,2),
    birthYear: String(formData.get('birthYear') || '').replace(/\D/g, '').slice(0,4),
    photo: STORE.userDraft.photo || ''
  };
  if (includePasswords) {
    STORE.userDraft.password = String(formData.get('password') || '');
    STORE.userDraft.passwordRepeat = String(formData.get('passwordRepeat') || '');
  }
}

function syncAuthUi() {
  const errors = getAuthErrors(STORE.userDraft);
  document.querySelectorAll('[data-error-for]').forEach((node) => {
    const key = node.getAttribute('data-error-for');
    node.textContent = errors[key] || '';
  });
  const submit = document.getElementById('auth-submit');
  if (submit) submit.disabled = Object.keys(errors).length > 0;
}

function handleAuthInput(event) {
  updateDraftFromForm(event.currentTarget, true);
  persist();
  syncAuthUi();
}

function handleProfileInput(event) {
  updateDraftFromForm(event.currentTarget, false);
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
  STORE.userDraft.photo = await fileToDataUrl(file);
  persist();
}

function createUserFromDraft() {
  const birthDate = buildBirthDate(STORE.userDraft);
  return {
    id: `user_${Date.now()}`,
    firstName: STORE.userDraft.firstName.trim(),
    lastName: STORE.userDraft.lastName.trim(),
    phone: STORE.userDraft.phone.trim(),
    level: STORE.userDraft.level,
    gender: STORE.userDraft.gender,
    birthDay: STORE.userDraft.birthDay,
    birthMonth: STORE.userDraft.birthMonth,
    birthYear: STORE.userDraft.birthYear,
    birthDate,
    photo: STORE.userDraft.photo || '',
    status: 'active',
    tournaments: [],
    waitlists: []
  };
}

function handleAuthSubmit(event) {
  event.preventDefault();
  updateDraftFromForm(event.currentTarget, true);
  const errors = getAuthErrors(STORE.userDraft);
  if (Object.keys(errors).length) {
    syncAuthUi();
    return;
  }

  STORE.user = createUserFromDraft();
  STORE.currentScreen = 'auth_success';
  STORE.registration.playerName = getUserFullName();
  STORE.profileEditMode = false;
  STORE.profileStatusMessage = '';
  STORE.userDraft = profileDraftFromUser();
  persist();
  render();
}

function handleProfileSubmit(event) {
  event.preventDefault();
  updateDraftFromForm(event.currentTarget, false);
  if (!STORE.user) return;

  STORE.user = {
    ...STORE.user,
    firstName: STORE.userDraft.firstName.trim(),
    lastName: STORE.userDraft.lastName.trim(),
    phone: STORE.userDraft.phone.trim(),
    level: STORE.userDraft.level,
    gender: STORE.userDraft.gender,
    birthDay: STORE.userDraft.birthDay,
    birthMonth: STORE.userDraft.birthMonth,
    birthYear: STORE.userDraft.birthYear,
    birthDate: buildBirthDate(STORE.userDraft),
    photo: STORE.userDraft.photo || STORE.user.photo || ''
  };

  STORE.profileEditMode = false;
  STORE.profileStatusMessage = 'Профиль обновлен';
  STORE.userDraft = profileDraftFromUser();
  persist();
  render();
}

function handleTournamentRegistrationSubmit(event) {
  event.preventDefault();
  if (!STORE.user) return;

  const tournament = STORE.tournaments.find((item) => item.id === STORE.activeTournamentId) || STORE.tournaments[2];
  const alreadyJoined = !!(STORE.user.tournaments || []).includes(tournament.id);
  const alreadyWaitlisted = !!(STORE.user.waitlists || []).includes(tournament.id);

  if (alreadyJoined) {
    STORE.registration.statusMessage = 'Вы уже в турнире';
    persist();
    render();
    return;
  }
  if (alreadyWaitlisted) {
    STORE.registration.statusMessage = 'Вы уже в очереди';
    persist();
    render();
    return;
  }

  if ((tournament.participants || []).length >= tournament.maxPlayers) {
    tournament.waitlist = unique([...(tournament.waitlist || []), STORE.user.id]);
    STORE.user.waitlists = unique([...(STORE.user.waitlists || []), tournament.id]);
    STORE.registration.statusMessage = 'Основной состав заполнен. Вы добавлены в waitlist';
  } else {
    tournament.participants = unique([...(tournament.participants || []), STORE.user.id]);
    STORE.user.tournaments = unique([...(STORE.user.tournaments || []), tournament.id]);
    tournament.type = 'my';
    STORE.registration.statusMessage = 'Вы автоматически добавлены в турнир';
  }

  STORE = deriveState(STORE);
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

window.toggleProfileEdit = function toggleProfileEdit() {
  STORE.profileEditMode = !STORE.profileEditMode;
  STORE.profileStatusMessage = '';
  STORE.userDraft = profileDraftFromUser();
  persist();
  render();
};

function render() {
  STORE = deriveState(STORE);
  const content = document.getElementById('screen-content');
  if (!content) return;

  if (!STORE.user && !['auth', 'auth_success'].includes(STORE.currentScreen)) {
    STORE.currentScreen = 'auth';
  }

  const screen = STORE.currentScreen;
  content.innerHTML = (Screens[screen] || Screens.dashboard)();
  renderHeaderAndNav();
  bindScreenEvents();

  if (screen === 'auth_success' && STORE.user) {
    window.clearTimeout(window.__padelAuthSuccessTimeout);
    window.__padelAuthSuccessTimeout = window.setTimeout(() => {
      router.navigate('dashboard');
    }, 1300);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (STORE.user) STORE.userDraft = profileDraftFromUser();
  render();
});
