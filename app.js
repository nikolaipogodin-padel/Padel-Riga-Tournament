const App = {
    state: {
        currentTab: 'tournaments',
        activeTournamentId: null,
        user: { name: "Николай Рига", xp: 1450, wins: 12, level: 14 },
        tournaments: {
            "t1": {
                name: "Padel Masters Riga",
                startDate: "2026-04-12 10:00",
                participants: [
                    {name: "Николай", status: "approved"}, 
                    {name: "Андрей П.", status: "approved"},
                    {name: "Виктор М.", status: "approved"},
                    {name: "Дмитрий К.", status: "approved"}
                ],
                matches: []
            }
        },
        leaderboard: [
            { name: "Николай Рига", xp: 1450 },
            { name: "Андрей П.", xp: 1320 },
            { name: "Виктор М.", xp: 1100 }
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

    // Генерация пар для игры (Дополнение)
    generateMatches(tId) {
        const t = this.state.tournaments[tId];
        if (t.participants.length < 2) return alert("Нужно минимум 2 игрока");
        
        t.matches = [];
        for (let i = 0; i < t.participants.length; i += 2) {
            if (t.participants[i+1]) {
                t.matches.push({
                    id: `m${Date.now()}${i}`,
                    court: (i/2) + 1,
                    time: "10:30",
                    t1: t.participants[i].name,
                    t2: t.participants[i+1].name,
                    s1: 0, s2: 0,
                    completed: false
                });
            }
        }
        this.render();
    },

    updateScore(tId, matchId, team, val) {
        const match = this.state.tournaments[tId].matches.find(m => m.id === matchId);
        if (team === 1) match.s1 = parseInt(val) || 0;
        else match.s2 = parseInt(val) || 0;

        // Если матч завершен (до 6 геймов), начисляем XP Николаю
        if ((match.s1 >= 6 || match.s2 >= 6) && !match.completed) {
            if (match.t1 === "Николай" && match.s1 > match.s2) {
                this.state.user.xp += 50;
                this.state.user.wins += 1;
                match.completed = true;
                alert("Победа! Вам начислено 50 XP");
            }
        }
    },

    render() {
        const container = document.getElementById('main-content');
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        if (this.state.activeTournamentId) {
            this.renderDetail();
        } else {
            document.getElementById('screen-' + this.state.currentTab).classList.add('active');
            if (this.state.currentTab === 'tournaments') this.renderTournaments();
            if (this.state.currentTab === 'stats') this.renderStats();
            if (this.state.currentTab === 'profile') this.renderProfile();
            if (this.state.currentTab === 'matches') this.renderAllMatches();
        }
        this.renderNav();
    },

    renderTournaments() {
        const list = document.getElementById('tournament-list');
        list.innerHTML = Object.keys(this.state.tournaments).map(id => {
            const t = this.state.tournaments[id];
            return `
                <div class="tournament-card" onclick="App.openTournament('${id}')">
                    <div style="color:var(--neon); font-weight:800; font-size:20px;">${t.name}</div>
                    <div style="color:#666; font-size:14px; margin-top:5px;">📅 ${t.startDate}</div>
                    <div style="margin-top:15px; font-size:13px;">Участников: ${t.participants.length}</div>
                </div>
            `;
        }).join('');
    },

    openTournament(id) {
        this.state.activeTournamentId = id;
        this.render();
    },

    renderDetail() {
        const screen = document.getElementById('screen-detail');
        const t = this.state.tournaments[this.state.activeTournamentId];
        screen.classList.add('active');
        
        let matchesHtml = t.matches.length > 0 
            ? t.matches.map(m => `
                <div class="match-card">
                    <div style="font-size:11px; color:#555; margin-bottom:10px;">КОРТ ${m.court} • ${m.time}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="flex:1; font-weight:bold;">${m.t1} ${m.t1 === 'Николай' ? '⭐' : ''}</span>
                        <div style="display:flex; gap:8px;">
                            <input type="number" class="score-input" value="${m.s1}" onchange="App.updateScore('${this.state.activeTournamentId}', '${m.id}', 1, this.value)">
                            <input type="number" class="score-input" value="${m.s2}" onchange="App.updateScore('${this.state.activeTournamentId}', '${m.id}', 2, this.value)">
                        </div>
                        <span style="flex:1; text-align:right; font-weight:bold;">${m.t2}</span>
                    </div>
                </div>`).join('')
            : `<div style="text-align:center; padding:30px;">
                <p style="color:#666;">Сетка еще не создана</p>
                <button class="btn-main" onclick="App.generateMatches('${this.state.activeTournamentId}')">СГЕНЕРИРОВАТЬ ПАРЫ</button>
               </div>`;

        document.getElementById('match-container').innerHTML = `
            <h2 class="screen-title" style="margin-bottom:20px;">${t.name}</h2>
            ${matchesHtml}
        `;
    },

    renderStats() {
        const list = document.getElementById('leaderboard');
        // Сортируем по XP
        const sorted = [...this.state.leaderboard].sort((a,b) => b.xp - a.xp);
        list.innerHTML = sorted.map((p, i) => `
            <div class="stat-item ${i === 0 ? 'rank-1' : ''}">
                <div>
                    <span class="medal">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    <span style="font-weight:bold;">${p.name}</span>
                </div>
                <div style="color:var(--neon); font-weight:800;">${p.xp} XP</div>
            </div>
        `).join('');
    },

    renderProfile() {
        const u = this.state.user;
        const nextLevelXp = (u.level + 1) * 100;
        const progress = (u.xp % 100); 

        document.getElementById('user-profile').innerHTML = `
            <div class="profile-card">
                <div style="font-size:64px;">👤</div>
                <h2 style="margin:10px 0;">${u.name}</h2>
                <div style="color:var(--neon); font-size:14px; font-weight:bold;">LEVEL ${u.level} PADEL PRO</div>
                
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12px; color:#666;">
                    <span>${u.xp} XP</span>
                    <span>${nextLevelXp} XP</span>
                </div>

                <div style="display:flex; justify-content:space-around; margin-top:30px; border-top:1px solid #333; padding-top:20px;">
                    <div><span style="color:#666; font-size:12px;">WINRATE</span><br><b style="font-size:18px;">${Math.round((u.wins/16)*100)}%</b></div>
                    <div><span style="color:#666; font-size:12px;">WINS</span><br><b style="font-size:18px; color:var(--neon);">${u.wins}</b></div>
                </div>
            </div>
        `;
    },

    renderNav() {
        const nav = document.getElementById('bottom-nav');
        const icons = { tournaments: '🏆', matches: '🎾', stats: '📊', profile: '👥' };
        nav.innerHTML = Object.keys(icons).map(tab => `
            <div class="nav-item ${this.state.currentTab === tab ? 'active' : ''}" onclick="App.switchTab('${tab}')">${icons[tab]}</div>
        `).join('').replace('🎾', '🎾<div class="fab" onclick="App.addTournament()">+</div>');
    }
};

App.init();
