const App = {
    state: {
        currentTab: 'tournaments',
        activeTournamentId: null,
        user: { name: "Николай Рига", rating: 1450, wins: 12, losses: 4 },
        tournaments: {
            "t1": {
                name: "Вечерний Падел Рига",
                startDate: "2026-04-15 19:00",
                maxPlayers: 4,
                participants: { "p1": {name: "Николай", status: "approved"}, "p2": {name: "Андрей", status: "approved"} },
                matches: [{ id: "m1", court: "1", time: "19:00", t1: "Николай", t2: "Андрей", s1: 6, s2: 4 }]
            }
        },
        leaderboard: [
            { name: "Николай Рига", xp: 1450 },
            { name: "Андрей П.", xp: 1320 },
            { name: "Виктор М.", xp: 1100 },
            { name: "Дмитрий К.", xp: 950 }
        ]
    },

    init() {
        this.render();
    },

    switchTab(tab) {
        this.state.currentTab = tab;
        this.state.activeTournamentId = null;
        this.render();
    },

    render() {
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        // Показываем нужный экран
        if (this.state.activeTournamentId) {
            document.getElementById('screen-detail').classList.add('active');
            this.renderMatchDetail();
        } else {
            document.getElementById('screen-' + this.state.currentTab).classList.add('active');
        }

        // Рендер контента в зависимости от вкладки
        if (this.state.currentTab === 'tournaments') this.renderTournaments();
        if (this.state.currentTab === 'matches') this.renderAllMatches();
        if (this.state.currentTab === 'stats') this.renderStats();
        if (this.state.currentTab === 'profile') this.renderProfile();

        this.renderNav();
    },

    renderTournaments() {
        const list = document.getElementById('tournament-list');
        list.innerHTML = Object.keys(this.state.tournaments).map(id => {
            const t = this.state.tournaments[id];
            return `
                <div class="tournament-card" onclick="App.openTournament('${id}')">
                    <div style="font-weight:bold; font-size:20px; color:var(--neon); margin-bottom:10px;">${t.name}</div>
                    <div style="font-size:14px; color:#888;">📊 Игроков: ${Object.keys(t.participants).length} • Нажми для управления</div>
                </div>
            `;
        }).join('');
    },

    openTournament(id) {
        this.state.activeTournamentId = id;
        this.render();
    },

    renderMatchDetail() {
        const t = this.state.tournaments[this.state.activeTournamentId];
        const container = document.getElementById('match-container');
        container.innerHTML = `<h2 style="margin:15px; color:var(--neon)">${t.name}</h2>` + 
            t.matches.map(m => this.createMatchCard(m)).join('');
    },

    renderAllMatches() {
        const container = document.getElementById('all-matches-list');
        let html = '';
        Object.values(this.state.tournaments).forEach(t => {
            t.matches.forEach(m => { html += this.createMatchCard(m, t.name); });
        });
        container.innerHTML = html;
    },

    createMatchCard(m, tName = '') {
        return `
            <div class="match-card">
                ${tName ? `<div style="font-size:10px; color:#555; text-transform:uppercase;">${tName}</div>` : ''}
                <div style="font-size:12px; color:#666; margin-bottom:10px;">Корт ${m.court} • ${m.time}</div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="flex:1">${m.t1}</span>
                    <div style="display:flex; gap:5px; align-items:center;">
                        <input type="number" class="score-input" value="${m.s1}">
                        <span>:</span>
                        <input type="number" class="score-input" value="${m.s2}">
                    </div>
                    <span style="flex:1; text-align:right;">${m.t2}</span>
                </div>
            </div>
        `;
    },

    renderStats() {
        const list = document.getElementById('leaderboard');
        list.innerHTML = this.state.leaderboard.map((player, i) => `
            <div class="stat-item">
                <div><span class="rank">#${i+1}</span> ${player.name}</div>
                <div style="color:var(--neon)">${player.xp} XP</div>
            </div>
        `).join('');
    },

    renderProfile() {
        const container = document.getElementById('user-profile');
        const u = this.state.user;
        container.innerHTML = `
            <div class="profile-card">
                <div class="avatar-big">👤</div>
                <h2 style="margin:10px 0">${u.name}</h2>
                <div style="color:var(--neon); font-weight:bold; margin-bottom:20px;">Platinum Player</div>
                <div class="user-info-row">
                    <div><span style="color:#666">Рейтинг</span><br><b>${u.rating}</b></div>
                    <div><span style="color:#666">Побед</span><br><b style="color:var(--neon)">${u.wins}</b></div>
                    <div><span style="color:#666">Игр</span><br><b>${u.wins + u.losses}</b></div>
                </div>
                <button class="btn-main" style="margin-top:30px; background:#222; color:white; border:1px solid #444;">Редактировать профиль</button>
            </div>
        `;
    },

    renderNav() {
        const nav = document.getElementById('bottom-nav');
        const tabs = [
            {id: 'tournaments', ico: '🏆'},
            {id: 'matches', ico: '🎾'},
            {id: 'fab', ico: '+'},
            {id: 'stats', ico: '📊'},
            {id: 'profile', ico: '👥'}
        ];
        
        nav.innerHTML = tabs.map(t => {
            if (t.id === 'fab') return `<div class="fab" onclick="App.addTournament()">+</div>`;
            return `<div class="nav-item ${this.state.currentTab === t.id ? 'active' : ''}" onclick="App.switchTab('${t.id}')">${t.ico}</div>`;
        }).join('');
    },

    addTournament() {
        const name = prompt("Название турнира:");
        if (name) {
            this.state.tournaments[Date.now()] = { name, startDate: "2026-04-20 10:00", maxPlayers: 16, participants: {}, matches: [] };
            this.render();
        }
    }
};

App.init();
