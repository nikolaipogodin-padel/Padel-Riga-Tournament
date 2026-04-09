/**
 * PADEL CLUB CORE v20.1
 * Основной файл приложения: Логика + Интерфейс
 */

// 1. Инициализация Firebase (проверь свои ключи в index.html, они должны быть выше этого файла)
const db = firebase.database();

const App = {
    state: {
        userRole: 'viewer', // 'admin', 'operator', 'viewer'
        currentUser: null
    },

    init: function() {
        this.renderMenu();
        this.loadTournaments();
    },

    // --- ЛОГИКА АВТОМАТИЗАЦИИ ---

    // Регистрация с учетом очереди
    joinTournament: function(tId, user) {
        const ref = db.ref(`tournaments/${tId}`);
        ref.once('value').then(snap => {
            const t = snap.val();
            const players = t.participants ? Object.values(t.participants) : [];
            const max = t.maxPlayers || 16;

            if (players.length < max) {
                // В основной состав
                this.saveParticipant(tId, user, 'approved');
            } else {
                // В очередь
                const queuePos = players.filter(p => p.status === 'queue').length + 1;
                this.saveParticipant(tId, user, 'queue', queuePos);
            }
        });
    },

    // Авто-проверка времени (24 часа до старта)
    checkTimeLock: function(t) {
        const start = new Date(t.startDate).getTime();
        const now = Date.now();
        const hoursLeft = (start - now) / (1000 * 60 * 60);

        if (hoursLeft <= 24 && !t.isLocked) {
            db.ref(`tournaments/${t.id}`).update({ isLocked: true, status: 'Closed' });
            return true;
        }
        return t.isLocked;
    },

    // Коррекция счета админом (мгновенно)
    adminSetScore: function(matchId, sA, sB) {
        db.ref(`matches/${matchId}`).update({
            scoreA: sA,
            scoreB: sB,
            lastUpdate: Date.now(),
            status: 'Finished'
        });
    },

    // --- ИНТЕРФЕЙС (DARK NEON) ---

    renderMenu: function() {
        // Отрисовка нижнего меню с FAB
        const menu = document.querySelector('.bottom-nav');
        if (menu) {
            menu.innerHTML = `
                <div class="nav-item active">🏆<span>Турниры</span></div>
                <div class="nav-item">🎾<span>Матчи</span></div>
                <div class="fab-container">
                    <button class="fab" onclick="App.handleFab()">+</button>
                </div>
                <div class="nav-item">📊<span>Таблицы</span></div>
                <div class="nav-item">👥<span>Профиль</span></div>
            `;
        }
    },

    loadTournaments: function() {
        const container = document.getElementById('tournament-list');
        db.ref('tournaments').on('value', snap => {
            const tournaments = snap.val();
            container.innerHTML = '';
            for (let id in tournaments) {
                const t = tournaments[id];
                const isLocked = this.checkTimeLock(t);
                container.innerHTML += this.drawTournamentCard(id, t, isLocked);
            }
        });
    },

    drawTournamentCard: function(id, t, isLocked) {
        // Карточка в стиле Dark Neon
        const participants = t.participants ? Object.values(t.participants) : [];
        const isFull = participants.length >= t.maxPlayers;
        
        return `
            <div class="card ${isLocked ? 'locked' : ''}" style="border: 1px solid #39FF14; margin: 10px; padding: 15px; border-radius: 16px; background: #1A1D21;">
                <h3>${t.name}</h3>
                <p>Старт: ${t.startDate}</p>
                <div class="stats">
                    Игроков: ${participants.length} / ${t.maxPlayers}
                    ${isFull ? `<span style="color: #00E5FF;"> (В очереди: ${participants.filter(p => p.status === 'queue').length})</span>` : ''}
                </div>
                ${!isLocked ? `
                    <button class="btn-neon" onclick="App.joinTournament('${id}', App.state.currentUser)">
                        ${isFull ? 'Встать в очередь' : 'Записаться'}
                    </button>
                ` : '<p style="color: #ff4b4b;">Регистрация закрыта (24ч до старта)</p>'}
            </div>
        `;
    }
};

// Запуск
App.init();
