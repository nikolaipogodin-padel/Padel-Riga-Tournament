const STORAGE_KEY = 'padel-riga-tracker-v30';

function uuid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatMinutes(totalMinutes) {
  const total = Math.max(0, Number(totalMinutes || 0));
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours && minutes) return `${hours} ч ${minutes} мин`;
  if (hours) return `${hours} ч`;
  return `${minutes} мин`;
}

function formatStatus(status) {
  if (status === 'LIVE') return '<span class="status-pill">LIVE</span>';
  if (status === 'OPEN') return '<span class="status-pill">OPEN</span>';
  if (status === 'FULL') return '<span class="status-pill planned">FULL</span>';
  if (status === 'PLANNED') return '<span class="status-pill planned">PLANNED</span>';
  if (status === 'FINISHED') return '<span class="status-pill finished">FINISHED</span>';
  return '<span class="status-pill closed">CLOSED</span>';
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

function getDaysLeft(startDate) {
  if (!startDate) return '—';
  const now = new Date();
  const start = new Date(startDate);
  now.setHours(0,0,0,0);
  start.setHours(0,0,0,0);
  const diff = Math.round((start - now) / 86400000);
  return diff < 0 ? 0 : diff;
}

const demoUsers = [
  { id: 'u_1', fullName: 'Николай Погодин' },
  { id: 'u_2', fullName: 'Виктор Берг' },
  { id: 'u_3', fullName: 'Алексей Смирнов' },
  { id: 'u_4', fullName: 'Сергей Орлов' },
  { id: 'u_5', fullName: 'Андрей Козлов' },
  { id: 'u_6', fullName: 'Марк Петров' },
  { id: 'u_7', fullName: 'Лука Иванов' },
  { id: 'u_8', fullName: 'Игорь Соколов' },
  { id: 'u_9', fullName: 'Роман Ефимов' },
  { id: 'u_10', fullName: 'Никита Лебедев' },
  { id: 'u_11', fullName: 'Павел Миронов' },
  { id: 'u_12', fullName: 'Дмитрий Новиков' },
  { id: 'u_13', fullName: 'Егор Шевченко' },
  { id: 'u_14', fullName: 'Артур Калниньш' },
  { id: 'u_15', fullName: 'Янис Озолс' },
  { id: 'u_16', fullName: 'Максим Волков' },
  { id: 'u_17', fullName: 'Артем Соловьев' },
  { id: 'u_18', fullName: 'Денис Белов' }
];

function playerNameById(id, state) {
  if (state.user && state.user.id === id) return `${state.user.firstName} ${state.user.lastName}`.trim();
  const demo = demoUsers.find((item) => item.id === id);
  return demo ? demo.fullName : id;
}

function ensureUnique(list) {
  return [...new Set(list)];
}

function pairPlayers(participantIds) {
  const ids = ensureUnique(participantIds.slice());
  const pairs = [];
  for (let i = 0; i < ids.length; i += 2) {
    if (!ids[i + 1]) break;
    pairs.push({
      pairId: `pair_${Math.floor(i / 2) + 1}`,
      players: [ids[i], ids[i + 1]]
    });
  }
  return pairs;
}

function roundRobinPairMatches(pairs, roundsLimit) {
  if (pairs.length < 2) return [];
  const source = pairs.slice();
  if (source.length % 2 !== 0) source.push({ pairId: 'BYE', players: [] });

  const rounds = [];
  let rotation = source.slice();

  for (let roundIndex = 0; roundIndex < rotation.length - 1; roundIndex += 1) {
    const matches = [];
    for (let i = 0; i < rotation.length / 2; i += 1) {
      const left = rotation[i];
      const right = rotation[rotation.length - 1 - i];
      if (left.pairId !== 'BYE' && right.pairId !== 'BYE') {
        matches.push({ left, right });
      }
    }
    rounds.push(matches);

    const first = rotation[0];
    const rest = rotation.slice(1);
    rest.unshift(rest.pop());
    rotation = [first, ...rest];
  }

  if (!roundsLimit || roundsLimit >= rounds.length) return rounds;
  return rounds.slice(0, roundsLimit);
}

function generateFixedPairsEngine(tournament, state) {
  const participants = ensureUnique(tournament.participants || []);
  if (participants.length < 4 || participants.length % 4 !== 0) {
    return { pairs: [], rounds: [], grid: [] };
  }

  const pairs = pairPlayers(participants);
  const maxRounds = Math.min((pairs.length - 1) || 1, Number(tournament.roundsTarget || 1));
  const pairRounds = roundRobinPairMatches(pairs, maxRounds);
  const totalBuffer = Math.max(0, maxRounds - 1) * Number(tournament.buffer || 0);
  const tourDuration = Math.max(10, Math.floor((Number(tournament.totalTime || 0) - totalBuffer) / Math.max(1, maxRounds)));

  const rounds = pairRounds.map((matches, roundIndex) => {
    const start = new Date(tournament.startDate);
    start.setMinutes(start.getMinutes() + roundIndex * (tourDuration + Number(tournament.buffer || 0)));
    return {
      round: roundIndex + 1,
      startsAt: start.toISOString(),
      durationMinutes: tourDuration,
      matches: matches.map((match, idx) => {
        const startTime = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        return {
          id: `${tournament.id}_r${roundIndex + 1}_m${idx + 1}`,
          cardType: roundIndex === 0 && idx === 0 ? 'live' : (roundIndex === 0 ? 'waiting' : 'waiting'),
          time: startTime,
          court: `Корт ${idx + 1}`,
          duration: `${tourDuration} мин`,
          players: [
            playerNameById(match.left.players[0], state),
            playerNameById(match.left.players[1], state)
          ],
          opponents: [
            playerNameById(match.right.players[0], state),
            playerNameById(match.right.players[1], state)
          ],
          score: roundIndex === 0 && idx === 0 ? [6, 4] : null
        };
      })
    };
  });

  const grid = rounds[0]
    ? rounds[0].matches.map((item, idx) => ({
        court: String(idx + 1),
        time: item.time,
        title: `${item.players.join(' / ')} vs ${item.opponents.join(' / ')}`,
        state: item.cardType === 'live' ? 'LIVE' : 'WAITING'
      }))
    : [];

  return { pairs, rounds, grid, tourDuration };
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const DEFAULT_STATE = {
  currentScreen: 'auth',
  activeTournamentId: 1,
  activeRound: 1,
  registration: { statusMessage: '' },
  profileEditMode: false,
  profileStatusMessage: '',
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
  tournaments: [
    {
      id: 1,
      clubId: 'club_riga',
      type: 'my',
      title: 'Riga Evening Open',
      badgeTop: 'RIGA',
      badgeBottom: 'EVENING OPEN',
      city: 'Riga',
      time: '18:00',
      startDate: '2026-08-17T18:00:00',
      totalTime: 180,
      roundsTarget: 7,
      courts: 4,
      maxPlayers: 16,
      buffer: 5,
      status: 'LIVE',
      allowRegistration: false,
      participants: ['u_1','u_2','u_3','u_4','u_5','u_6','u_7','u_8','u_9','u_10','u_11','u_12','u_13','u_14','u_15','u_16'],
      waitlist: [],
      pairing: [],
      rounds: [],
      grid: [],
      countdownLabel: ''
    },
    {
      id: 2,
      clubId: 'club_tallinn',
      type: 'my',
      title: 'Tallinn Padel Cup',
      badgeTop: 'TALLINN',
      badgeBottom: 'PADEL CUP',
      city: 'Tallinn',
      time: '11:30',
      startDate: '2026-08-25T11:30:00',
      totalTime: 150,
      roundsTarget: 5,
      courts: 3,
      maxPlayers: 12,
      buffer: 5,
      status: 'PLANNED',
      allowRegistration: false,
      participants: ['u_1','u_2','u_3','u_4','u_5','u_6','u_7','u_8'],
      waitlist: [],
      pairing: [],
      rounds: [],
      grid: [],
      countdownLabel: ''
    },
    {
      id: 3,
      clubId: 'club_riga',
      type: 'available',
      title: 'Riga Morning Open',
      badgeTop: 'RIGA',
      badgeBottom: 'MORNING OPEN',
      city: 'Riga',
      time: '09:30',
      startDate: '2026-08-19T09:30:00',
      totalTime: 165,
      roundsTarget: 5,
      courts: 2,
      maxPlayers: 8,
      buffer: 5,
      status: 'OPEN',
      allowRegistration: true,
      participants: ['u_1','u_2','u_3','u_4','u_5','u_6'],
      waitlist: [],
      pairing: [],
      rounds: [],
      grid: [],
      countdownLabel: ''
    },
    {
      id: 4,
      clubId: 'club_kaunas',
      type: 'available',
      title: 'Kaunas Padel Challenge',
      badgeTop: 'KAUNAS',
      badgeBottom: 'PADEL CHALLENGE',
      city: 'Kaunas',
      time: '12:00',
      startDate: '2026-08-21T12:00:00',
      totalTime: 180,
      roundsTarget: 7,
      courts: 4,
      maxPlayers: 16,
      buffer: 5,
      status: 'OPEN',
      allowRegistration: true,
      participants: ['u_1','u_2','u_3','u_4','u_5','u_6','u_7','u_8'],
      waitlist: [],
      pairing: [],
      rounds: [],
      grid: [],
      countdownLabel: ''
    },
    {
      id: 5,
      clubId: 'club_riga',
      type: 'available',
      title: 'Autumn Slam',
      badgeTop: 'RIGA',
      badgeBottom: 'AUTUMN SLAM',
      city: 'Riga, Skunste',
      time: '10:00',
      startDate: '2026-08-26T10:00:00',
      totalTime: 180,
      roundsTarget: 7,
      courts: 4,
      maxPlayers: 16,
      buffer: 5,
      status: 'OPEN',
      allowRegistration: true,
      participants: [],
      waitlist: [],
      pairing: [],
      rounds: [],
      grid: [],
      countdownLabel: ''
    }
  ],
  stats: [
    { rank: 1, name: 'Николай', wins: 3, diff: '+12' },
    { rank: 2, name: 'Виктор', wins: 3, diff: '+9' },
    { rank: 3, name: 'Алексей', wins: 2, diff: '+3' },
    { rank: 4, name: 'Сергей', wins: 1, diff: '-5' }
  ],
  registrations: []
};

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

function isAuthValid(state) {
  return Object.keys(getAuthErrors(state.userDraft)).length === 0;
}

function getUserFullName(state) {
  if (!state.user) return '';
  return `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim();
}

function getUserInitials(state) {
  const fullName = getUserFullName(state);
  return fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'NP';
}

function profileDraftFromUser(user) {
  if (!user) return clone(DEFAULT_STATE.userDraft);
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '+371',
    level: user.level || 'C',
    gender: user.gender || 'male',
    birthDay: user.birthDay || '',
    birthMonth: user.birthMonth || '',
    birthYear: user.birthYear || '',
    photo: user.photo || '',
    password: '',
    passwordRepeat: ''
  };
}

function migrateState(state) {
  if (!state.userDraft) state.userDraft = clone(DEFAULT_STATE.userDraft);
  state.tournaments = (state.tournaments || []).map((tournament, index) => ({
    ...clone(DEFAULT_STATE.tournaments[index] || DEFAULT_STATE.tournaments[0]),
    ...tournament,
    participants: ensureUnique(tournament.participants || (DEFAULT_STATE.tournaments[index] || DEFAULT_STATE.tournaments[0]).participants || []),
    waitlist: ensureUnique(tournament.waitlist || [])
  }));
  return state;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('padel-riga-tracker-v27') || localStorage.getItem('padel-riga-tracker-v26');
    const state = raw ? migrateState({ ...clone(DEFAULT_STATE), ...JSON.parse(raw) }) : clone(DEFAULT_STATE);
    if (state.user) {
      state.currentScreen = state.currentScreen === 'auth' ? 'dashboard' : state.currentScreen;
      state.userDraft = profileDraftFromUser(state.user);
    } else {
      state.currentScreen = 'auth';
    }
    return deriveState(state);
  } catch (error) {
    console.error(error);
    return deriveState(clone(DEFAULT_STATE));
  }
}

let STORE = loadState();

function deriveTournament(tournament, state) {
  const item = { ...tournament };
  item.confirmedPlayers = item.participants.length;
  item.waitingPlayers = item.waitlist.length;
  item.date = new Date(item.startDate).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  item.daysLeft = getDaysLeft(item.startDate);
  item.countdownLabel = `${item.daysLeft} дней`;
  item.duration = formatMinutes(item.totalTime);

  if (item.status !== 'LIVE' && item.status !== 'FINISHED') {
    if (item.confirmedPlayers >= item.maxPlayers) item.status = 'FULL';
    else item.status = 'OPEN';
  }

  const engine = generateFixedPairsEngine(item, state);
  item.pairing = engine.pairs;
  item.rounds = engine.rounds;
  item.grid = engine.grid;
  item.tourDuration = engine.tourDuration || 0;
  item.roundsTarget = engine.rounds.length || item.roundsTarget;
  item.allowRegistration = item.status === 'OPEN' || item.status === 'FULL';

  return item;
}

function deriveState(state) {
  state.tournaments = state.tournaments.map((tournament) => deriveTournament(tournament, state));
  const liveTournament = state.tournaments.find((item) => item.status === 'LIVE') || state.tournaments[0];
  state.activeTournamentId = state.activeTournamentId || liveTournament.id;
  const active = state.tournaments.find((item) => item.id === state.activeTournamentId) || state.tournaments[0];
  state.activeRound = Math.min(Math.max(1, Number(state.activeRound || 1)), Math.max(1, active.rounds.length || 1));
  return state;
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
      if (screen !== 'profile') {
        STORE.profileEditMode = false;
        STORE.profileStatusMessage = '';
      }
    }
    persist();
    render();
  }
};

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

  tournamentCard(tournament) {
    const cardClass = tournament.status === 'LIVE' ? 'is-green' : tournament.status === 'OPEN' ? 'is-green' : tournament.status === 'FULL' ? '' : 'is-closed';
    return `
      <article class="tournament-card ${cardClass}" onclick="openTournamentRegistration(${tournament.id})">
        <div class="card-shell">
          <div class="card-topline">${formatStatus(tournament.status)}</div>
          <div class="card-topline" style="margin-top: 14px;">
            <div class="event-badge"><div><strong>${tournament.badgeTop}</strong><strong>${tournament.badgeBottom}</strong><span>2026</span></div></div>
          </div>
          <h3 class="card-title">${escapeHtml(tournament.title)}</h3>
          <div class="tournament-extra-line">Турнир: ${formatMinutes(tournament.totalTime)} · Тур: ${tournament.tourDuration ? formatMinutes(tournament.tourDuration) : '—'}</div>
          <div class="card-foot">
            <div class="meta-item">${iconCalendar()}<span>${tournament.date}</span></div>
            <div class="meta-item">${iconPin()}<span>${escapeHtml(tournament.city)}</span></div>
            <div class="meta-item">${iconClock()}<span>${escapeHtml(tournament.time)}</span></div>
            <div class="meta-item">${iconClock()}<span>${tournament.confirmedPlayers}/${tournament.maxPlayers}</span></div>
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
            <div class="match-overlay-icon match-overlay-neutral">Finished</div>
            <div class="finished-panel"><strong>${match.winnerText || 'Матч завершён'}</strong></div>
            <div class="finished-scoreline">${(match.setScores || ['6:4']).map((score) => `<span>${score}</span>`).join('')}</div>
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
          <button id="auth-submit" type="submit" class="primary-btn" ${isAuthValid(STORE) ? '' : 'disabled'}>Создать профиль</button>
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
    const myIds = new Set((STORE.user && STORE.user.tournaments) || []);
    const my = STORE.tournaments.filter((item) => item.type === 'my' || myIds.has(item.id));
    const available = STORE.tournaments.filter((item) => !myIds.has(item.id) && item.type !== 'my');
    return `
      ${UI.section('Мои турниры', my.length ? my.map(UI.tournamentCard).join('') : '<div class="empty-state">У вас пока нет своих турниров</div>', '', Math.max(my.length, 1))}
      ${UI.section('Доступные турниры', available.length ? available.map(UI.tournamentCard).join('') : '<div class="empty-state">Новых турниров пока нет</div>', 'section-green', Math.max(available.length, 1))}
    `;
  },

  live() {
    const liveTournament = STORE.tournaments.find((item) => item.status === 'LIVE') || STORE.tournaments[0];
    const rounds = liveTournament.rounds || [];
    const currentRound = rounds[STORE.activeRound - 1] || rounds[0];

    let cards = '<div class="empty-state">У вас нет активных матчей</div>';
    if (currentRound && currentRound.matches.length) {
      const myName = getUserFullName(STORE);
      const mine = STORE.user
        ? currentRound.matches.filter((match) => [...match.players, ...match.opponents].includes(myName))
        : currentRound.matches;
      const visible = mine.length ? mine : currentRound.matches;
      cards = visible.map(UI.liveCard).join('');
    }

    return `
      <section class="section-shell">
        <div class="live-tabs">${(rounds.length ? rounds : [{ round: 1 }]).map((item) => UI.liveTab(item.round)).join('')}</div>
        <div class="cards-track" style="margin-top:16px;">${cards}</div>
        <div class="card-dots">${(rounds.length ? rounds : [{ round: 1 }]).map((item) => `<span class="${item.round === STORE.activeRound ? 'active' : ''}"></span>`).join('')}</div>
      </section>
    `;
  },

  grid() {
    const active = STORE.tournaments.find((item) => item.id === STORE.activeTournamentId) || STORE.tournaments[0];
    const gridItems = active.grid || [];
    return `
      <section class="grid-board">
        <h2 class="board-title">Все корты / текущий тур</h2>
        <div class="grid-list">
          ${gridItems.length ? gridItems.map((item) => `
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
          `).join('') : '<div class="empty-state">Сетка появится после формирования пар</div>'}
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
    const tournament = STORE.tournaments.find((item) => item.id === STORE.activeTournamentId) || STORE.tournaments[0];
    const userName = STORE.user ? getUserFullName(STORE) : '';
    const profileLevel = STORE.user ? STORE.user.level : '—';
    const joined = STORE.user && (STORE.user.tournaments || []).includes(tournament.id);
    const inWaitlist = STORE.user && tournament.waitlist.includes(STORE.user.id);
    const buttonLabel = joined ? 'ВЫ УЖЕ В ТУРНИРЕ' : inWaitlist ? 'ВЫ В ОЧЕРЕДИ' : (tournament.status === 'FULL' ? 'ВСТАТЬ В ОЧЕРЕДЬ' : 'ПОДТВЕРДИТЬ УЧАСТИЕ');

    return `
      <section class="section-shell">
        <div class="registration-concept-card">
          <div class="registration-concept-logo">${escapeHtml(tournament.badgeTop)}<br>${escapeHtml(tournament.badgeBottom)}</div>
          <h2 class="registration-concept-title">РЕГИСТРАЦИЯ:<br>${escapeHtml(tournament.title)} 💎💎💎</h2>

          <div class="registration-tabs">
            <button class="registration-tab active" type="button">ДАННЫЕ</button>
            <button class="registration-tab muted" type="button">СТАТУС</button>
            <button class="registration-tab muted" type="button">ПРОФИЛЬ</button>
          </div>

          <div class="registration-copy">
            ${joined
              ? 'Вы уже добавлены в турнир. При переходе в LIVE система покажет только ваши матчи.'
              : (tournament.status === 'FULL'
                ? 'Основной состав уже заполнен. Можно встать в waitlist, и система переведет вас автоматически при освобождении места.'
                : 'Используем ваш профиль автоматически. Одна кнопка — и вы попадаете в турнир.' )}
          </div>

          <form id="registration-form" class="registration-concept-form">
            <div class="profile-linked-card">
              <div class="profile-linked-label">Профиль участника</div>
              <div class="profile-linked-name">${escapeHtml(userName || 'Профиль не создан')}</div>
              <div class="profile-linked-sub">Уровень ${escapeHtml(profileLevel)} · ${STORE.user && STORE.user.gender === 'female' ? 'Женщина' : 'Мужчина'}</div>
            </div>

            <button type="submit" class="primary-btn" ${joined || inWaitlist ? 'disabled' : ''}>${buttonLabel}</button>
          </form>

          ${STORE.registration.statusMessage ? `<div class="inline-success">${STORE.registration.statusMessage}</div>` : ''}

          <div class="registration-facts">
            <div>
              <div class="registration-fact-label">До старта:</div>
              <div class="registration-fact-value">${tournament.countdownLabel}</div>
            </div>
            <div>
              <div class="registration-fact-label">Локация:</div>
              <div class="registration-fact-value">📍 ${escapeHtml(tournament.city)}</div>
            </div>
            <div>
              <div class="registration-fact-label">Участники:</div>
              <div class="registration-fact-value">${tournament.confirmedPlayers}/${tournament.maxPlayers}</div>
            </div>
          </div>

          <div class="profile-mini-card">
            <div class="profile-mini-avatar">${STORE.user && STORE.user.photo ? `<img src="${STORE.user.photo}" alt="avatar" />` : getUserInitials(STORE)}</div>
            <div>
              <div class="profile-mini-name">${escapeHtml(userName || 'Профиль не создан')}</div>
              <div class="profile-mini-sub">${escapeHtml(profileLevel)}</div>
            </div>
            <div class="profile-mini-badge">${joined ? 'Joined' : (inWaitlist ? 'Waitlist' : 'Ready')}</div>
          </div>
        </div>
      </section>
    `;
  },

  profile() {
    if (!STORE.user) return Screens.auth();

    const user = STORE.user;
    const initials = getUserInitials(STORE);
    const isEdit = STORE.profileEditMode;
    const draft = { ...profileDraftFromUser(user), ...STORE.userDraft };

    return `
      <section class="profile-shell">
        <div class="profile-head-row">
          <div class="profile-top">
            <div class="avatar-ring">${user.photo ? `<img src="${user.photo}" alt="avatar">` : initials}</div>
            <div>
              <h2 class="profile-name">${escapeHtml(getUserFullName(STORE))}</h2>
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

function renderHeaderAndNav() {
  const header = document.getElementById('main-header');
  const nav = document.querySelector('.bottom-nav');
  if (!header || !nav) return;

  if (!STORE.user || ['auth', 'auth_success'].includes(STORE.currentScreen)) {
    header.style.display = 'none';
    nav.style.display = 'none';
    return;
  }

  header.style.display = 'flex';
  nav.style.display = 'grid';

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.screen === STORE.currentScreen);
  });
}

function updateDraftFromForm(form, includePasswords = true) {
  const data = new FormData(form);
  STORE.userDraft = {
    ...STORE.userDraft,
    firstName: String(data.get('firstName') || '').trim(),
    lastName: String(data.get('lastName') || '').trim(),
    phone: String(data.get('phone') || '').trim(),
    level: String(data.get('level') || 'C'),
    gender: String(data.get('gender') || 'male'),
    birthDay: String(data.get('birthDay') || '').replace(/\D/g, '').slice(0, 2),
    birthMonth: String(data.get('birthMonth') || '').replace(/\D/g, '').slice(0, 2),
    birthYear: String(data.get('birthYear') || '').replace(/\D/g, '').slice(0, 4),
    photo: STORE.userDraft.photo || ''
  };
  if (includePasswords) {
    STORE.userDraft.password = String(data.get('password') || '');
    STORE.userDraft.passwordRepeat = String(data.get('passwordRepeat') || '');
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
  return {
    id: uuid('user'),
    firstName: STORE.userDraft.firstName.trim(),
    lastName: STORE.userDraft.lastName.trim(),
    phone: STORE.userDraft.phone.trim(),
    level: STORE.userDraft.level,
    gender: STORE.userDraft.gender,
    birthDay: STORE.userDraft.birthDay,
    birthMonth: STORE.userDraft.birthMonth,
    birthYear: STORE.userDraft.birthYear,
    birthDate: buildBirthDate(STORE.userDraft),
    photo: STORE.userDraft.photo || '',
    status: 'active',
    clubs: [],
    tournaments: [],
    waitlists: []
  };
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

function handleAuthSubmit(event) {
  event.preventDefault();
  updateDraftFromForm(event.currentTarget, true);
  if (!isAuthValid(STORE)) {
    syncAuthUi();
    return;
  }
  STORE.user = createUserFromDraft();
  STORE.userDraft = profileDraftFromUser(STORE.user);
  STORE.currentScreen = 'auth_success';
  STORE.registration.statusMessage = '';
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
  STORE.userDraft = profileDraftFromUser(STORE.user);
  STORE.profileEditMode = false;
  STORE.profileStatusMessage = 'Профиль обновлен';
  STORE = deriveState(STORE);
  persist();
  render();
}

function handleTournamentRegistrationSubmit(event) {
  event.preventDefault();
  if (!STORE.user) return;

  const tournament = STORE.tournaments.find((item) => item.id === STORE.activeTournamentId);
  if (!tournament) return;
  if ((STORE.user.tournaments || []).includes(tournament.id)) {
    STORE.registration.statusMessage = 'Вы уже в турнире';
    persist();
    render();
    return;
  }
  if ((STORE.user.waitlists || []).includes(tournament.id)) {
    STORE.registration.statusMessage = 'Вы уже в очереди';
    persist();
    render();
    return;
  }

  if (tournament.participants.length >= tournament.maxPlayers) {
    tournament.waitlist = ensureUnique([...(tournament.waitlist || []), STORE.user.id]);
    STORE.user.waitlists = ensureUnique([...(STORE.user.waitlists || []), tournament.id]);
    STORE.registration.statusMessage = 'Основной состав заполнен. Вы добавлены в waitlist';
  } else {
    tournament.participants = ensureUnique([...(tournament.participants || []), STORE.user.id]);
    tournament.type = 'my';
    STORE.user.tournaments = ensureUnique([...(STORE.user.tournaments || []), tournament.id]);
    STORE.registration.statusMessage = 'Вы автоматически добавлены в турнир';
  }

  STORE = deriveState(STORE);
  persist();
  render();
}

function bindScreenEvents() {
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

  const registrationForm = document.getElementById('registration-form');
  if (registrationForm) registrationForm.addEventListener('submit', handleTournamentRegistrationSubmit);
}

function render() {
  STORE = deriveState(STORE);
  const content = document.getElementById('screen-content');
  if (!content) return;

  if (!STORE.user && !['auth', 'auth_success'].includes(STORE.currentScreen)) {
    STORE.currentScreen = 'auth';
  }

  const view = Screens[STORE.currentScreen] || Screens.dashboard;
  content.innerHTML = view();
  renderHeaderAndNav();
  bindScreenEvents();

  if (STORE.currentScreen === 'auth_success' && STORE.user) {
    window.clearTimeout(window.__padelSuccessTimeout);
    window.__padelSuccessTimeout = window.setTimeout(() => {
      router.navigate('dashboard');
    }, 1200);
  }
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
  STORE.userDraft = profileDraftFromUser(STORE.user);
  persist();
  render();
};

document.addEventListener('DOMContentLoaded', () => {
  if (STORE.user) STORE.userDraft = profileDraftFromUser(STORE.user);
  render();
});
