const App = {
    state: {
        currentTab: 'tournaments',
        editingMatchId: null,
        tournaments: {
            "t1": {
                name: "Padel Riga Open",
                matches: [
                    { id: "m1", court: "1", status: "finished", p1: "Николай / Андрей", p2: "Виктор / Дмитрий", s: [[6,4], [0,0], [0,0]], winner: "Николай / Андрей" },
                    { id: "m2", court: "2", status: "live", p1: "Алексей / Сергей", p2: "Игорь / Максим", s: [[3,2], [0,0], [0,0]] },
                    { id: "m3", court: "3", status: "waiting", p1: "Юрис / Гинтс", p2: "Артур / Денис", s: [[0,0], [0,0], [0,0]] }
                ]
            }
        }
    },

    init() {
        this.render();
    },

    switchTab(tab) {
        this.state.currentTab = tab;
        this.state.editingMatchId = null;
        this.render();
    },

    // Переход на экран управления конкретной игрой
    manageMatch(matchId) {
        this.state.editingMatchId = matchId;
        this.render();
    },

    saveResult() {
        const match = this.getMatch(this.state.editingMatchId);
        // Простая логика определения победителя по первому гейму (сету) для теста
        if (match.s[0][0] > match.s[0][1]) match.winner = match.p1;
        else if (match.s[0][1] > match.s[0][0]) match.winner = match.p2;
        
        match.status = "finished";
        this.state.editingMatchId = null;
        this.render();
    },

    getMatch(id) {
        return this.state.tournaments["t1"].matches.find(m => m.id === id);
    },

    updateScore(setIdx, teamIdx, val) {
        const match = this.getMatch(this.state.editingMatchId);
        match.s[setIdx][teamIdx] = parseInt(val) || 0;
    },

    render() {
        const container = document.getElementById('main-content');
        
        // Если мы в режиме редактирования матча
        if (this.state.editingMatchId) {
            this.renderManageScreen(container);
        } else {
            this.renderTabScreen(container);
        }
        
        this.renderNav();
    },

    renderTabScreen(container) {
        if (this.state.currentTab === 'tournaments') {
            const t = this.state.tournaments["t1"];
            container.innerHTML = `
                <div class="header-area"><h1 class="neon-text">PADEL RIGA</h1></div>
                <div class="screen active">
                    <h2 style="font-size:18px; margin-bottom:20px;">${t.name}</h2>
                    ${t.matches.map(m => `
                        <div class="match-item ${m.status}" onclick="App.manageMatch('${m.id}')">
                            <div class="status-row">
                                <span class="tag ${m.status === 'live' ? 'tag-live' : ''}">${m.status.toUpperCase()}</span>
                                <span>КОРТ ${m.court}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div style="flex:1">
                                    <span class="player-name">${m.p1}</span>
                                    ${m.winner === m.p1 ? '<span class="winner-label">🏆 ПОБЕДИТЕЛЬ</span>' : ''}
                                </div>
                                <div style="padding: 0 15px; font-weight:bold; color:var(--neon)">
                                    ${m.status === 'waiting' ? 'VS' : m.s[0][0] + ' : ' + m.s[0][1]}
                                </div>
                                <div style="flex:1; text-align:right">
                                    <span class="player-name">${m.p2}</span>
                                    ${m.winner === m.p2 ? '<span class="winner-label">🏆 ПОБЕДИТЕЛЬ</span>' : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
        } else {
            container.innerHTML = `
                <div class="header-area"><h1 class="neon-text">PADEL RIGA</h1></div>
                <div class="screen active" style="text-align:center; padding-top:100px; color:#444;">
                    Раздел <b>${this.state.currentTab.toUpperCase()}</b><br>в разработке
                </div>`;
        }
    },

    renderManageScreen(container) {
        const m = this.getMatch(this.state.editingMatchId);
        container.innerHTML = `
            <div class="screen active manage-screen">
                <button class="btn-back" onclick="App.switchTab('tournaments')">← К СПИСКУ ИГР</button>
                <h2 style="color:var(--neon)">УПРАВЛЕНИЕ ИГРОЙ</h2>
                <p style="color:#666; font-size:12px;">КОРТ ${m.court}</p>

                <div class="score-entry-row">
                    <div class="team-block">
                        <span class="player-name">${m.p1}</span>
                        <div class="input-group">
                            <input type="number" class="score-input-big" value="${m.s[0][0]}" onchange="App.updateScore(0, 0, this.value)">
                        </div>
                    </div>
                    <div style="font-size:24px; font-weight:bold; color:#333;">VS</div>
                    <div class="team-block">
                        <span class="player-name">${m.p2}</span>
                        <div class="input-group">
                            <input type="number" class="score-input-big" value="${m.s[0][1]}" onchange="App.updateScore(0, 1, this.value)">
                        </div>
                    </div>
                </div>

                <button class="btn-save" onclick="App.saveResult()">ПОДТВЕРДИТЬ И СОХРАНИТЬ</button>
            </div>`;
    },

    renderNav() {
        const nav = document.getElementById('bottom-nav');
        const tabs = [
            {id: 'tournaments', ico: '🏆'},
            {id: 'matches', ico: '🎾'},
            {id: 'stats', ico: '📊'},
            {id: 'profile', ico: '👥'}
        ];
        nav.innerHTML = tabs.map(t => `
            <div class="nav-item ${this.state.currentTab === t.id ? 'active' : ''}" onclick="App.switchTab('${t.id}')">${t.ico}</div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
