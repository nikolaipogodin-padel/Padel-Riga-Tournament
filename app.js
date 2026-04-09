const App = {
    state: {
        currentTab: 'tournaments',
        activeTournamentId: null,
        tournaments: {
            "t1": {
                name: "Вечерний Падел Рига",
                startDate: "2026-04-15 19:00",
                maxPlayers: 4,
                participants: { "p1": {name: "Николай", status: "approved"}, "p2": {name: "Андрей", status: "approved"} },
                matches: [
                    { id: "m1", court: "1", time: "19:00", t1: "Николай", t2: "Андрей", s1: 0, s2: 0 }
                ]
            }
        }
    },

    init() {
        this.render();
    },

    switchScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        if (screen === 'list') {
            document.getElementById('screen-list').classList.add('active');
        } else {
            document.getElementById('screen-detail').classList.add('active');
        }
    },

    // Вход в турнир для управления результатами
    openTournament(id) {
        this.state.activeTournamentId = id;
        this.switchScreen('detail');
        this.renderMatches();
    },

    renderMatches() {
        const t = this.state.tournaments[this.state.activeTournamentId];
        const container = document.getElementById('match-container');
        
        container.innerHTML = `
            <h2 style="margin:20px; color:var(--neon)">${t.name}</h2>
            ${t.matches.map(m => `
                <div class="match-card">
                    <div style="font-size:12px; color:#666; margin-bottom:10px;">Корт ${m.court} • ${m.time}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="flex:1">${m.t1}</div>
                        <div style="display:flex; gap:5px; align-items:center;">
                            <input type="number" class="score-input" value="${m.s1}" onchange="App.updateScore('${m.id}', 1, this.value)">
                            <span>:</span>
                            <input type="number" class="score-input" value="${m.s2}" onchange="App.updateScore('${m.id}', 2, this.value)">
                        </div>
                        <div style="flex:1; text-align:right;">${m.t2}</div>
                    </div>
                </div>
            `).join('')}
            <p style="text-align:center; color:#444; font-size:12px; margin-top:20px;">Результаты сохраняются автоматически</p>
        `;
    },

    updateScore(matchId, teamNum, val) {
        const t = this.state.tournaments[this.state.activeTournamentId];
        const match = t.matches.find(m => m.id === matchId);
        if (teamNum === 1) match.s1 = val;
        else match.s2 = val;
        console.log("Счет обновлен:", match);
    },

    render() {
        const list = document.getElementById('tournament-list');
        const nav = document.getElementById('bottom-nav');

        // Рендер карточек на главном экране
        list.innerHTML = Object.keys(this.state.tournaments).map(id => {
            const t = this.state.tournaments[id];
            const parts = Object.values(t.participants);
            return `
                <div class="tournament-card" onclick="App.openTournament('${id}')">
                    <div style="font-weight:800; font-size:20px; color:var(--neon); margin-bottom:10px;">${t.name}</div>
                    <div style="font-size:14px; color:#888;">Игроков: ${parts.length} • Нажми для управления 🎾</div>
                </div>
            `;
        }).join('');

        // Нижнее меню
        nav.innerHTML = `
            <div class="nav-item active">🏆</div>
            <div class="nav-item">🎾</div>
            <div class="fab">+</div>
            <div class="nav-item">📊</div>
            <div class="nav-item">👥</div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
