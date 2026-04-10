const App = {
    state: {
        currentTab: 'tournaments',
        editingMatchId: null,
        tournaments: {
            my: [
                { id: "m1", court: "1", status: "finished", p1: "Николай / Андрей", p2: "Виктор / Дмитрий", s1: 6, s2: 4, winner: "Николай / Андрей" },
                { id: "m2", court: "2", status: "live", p1: "Алексей / Сергей", p2: "Игорь / Максим", s1: 3, s2: 2 }
            ],
            available: [
                { id: "t_new1", name: "Riga Weekend Cup", date: "15 Апреля", players: "12/16" },
                { id: "t_new2", name: "Padel Night Masters", date: "18 Апреля", players: "4/16" }
            ]
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

    manageMatch(matchId) {
        this.state.editingMatchId = matchId;
        this.render();
    },

    saveResult() {
        const m = this.state.tournaments.my.find(m => m.id === this.state.editingMatchId);
        if (m.s1 > m.s2) m.winner = m.p1;
        else if (m.s2 > m.s1) m.winner = m.p2;
        m.status = "finished";
        this.state.editingMatchId = null;
        this.render();
    },

    render() {
        const container = document.getElementById('main-content');
        
        if (this.state.editingMatchId) {
            this.renderManageScreen(container);
        } else {
            this.renderTabContent(container);
        }
        this.renderNav();
    },

    renderTabContent(container) {
        // Очищаем заголовок
        container.innerHTML = `<div class="header-area"><h1 class="neon-text">PADEL RIGA</h1></div>`;

        if (this.state.currentTab === 'tournaments') {
            let html = `
                <div class="my-tournaments">
                    <div class="section-title">Мои турниры (Live)</div>
                    ${this.state.tournaments.my.map(m => `
                        <div class="match-item" onclick="App.manageMatch('${m.id}')">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div style="flex:1">
                                    <div class="player-name">${m.p1}</div>
                                    ${m.winner === m.p1 ? '<div class="winner-badge">🏆 WINNER</div>' : ''}
                                </div>
                                <div style="font-weight:900; color:var(--neon); font-size:18px; padding:0 15px;">
                                    ${m.s1} : ${m.s2}
                                </div>
                                <div style="flex:1; text-align:right">
                                    <div class="player-name">${m.p2}</div>
                                    ${m.winner === m.p2 ? '<div class="winner-badge">🏆 WINNER</div>' : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="section-title">Доступные турниры</div>
                ${this.state.tournaments.available.map(t => `
                    <div class="match-item available-card">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-weight:bold;">${t.name}</div>
                                <div style="font-size:12px; color:#666; margin-top:4px;">${t.date} • ${t.players} чел.</div>
                            </div>
                            <button style="background:none; border:1px solid var(--neon); color:var(--neon); padding:8px 15px; border-radius:10px; font-size:12px;">Записаться</button>
                        </div>
                    </div>
                `).join('')}
            `;
            container.innerHTML += html;
        } else {
            // Другие экраны теперь реально пустые
            container.innerHTML += `
                <div style="text-align:center; padding-top:100px; color:#444;">
                    <div style="font-size:40px; margin-bottom:10px;">${this.getTabIcon()}</div>
                    Раздел ${this.state.currentTab.toUpperCase()}<br>скоро будет готов
                </div>`;
        }
    },

    getTabIcon() {
        if (this.state.currentTab === 'matches') return '🎾';
        if (this.state.currentTab === 'stats') return '📊';
        return '👥';
    },

    renderManageScreen(container) {
        const m = this.state.tournaments.my.find(m => m.id === this.state.editingMatchId);
        container.innerHTML = `
            <div class="manage-screen">
                <div style="text-align:left; margin-bottom:30px;">
                    <button onclick="App.switchTab('tournaments')" style="background:none; border:none; color:#666; font-size:24px;">✕</button>
                </div>
                <h2 style="font-size:20px; margin-bottom:10px;">Завести результат</h2>
                <p style="color:#666; font-size:14px;">Корт ${m.court}</p>

                <div class="score-big-group">
                    <div>
                        <div class="player-name" style="margin-bottom:15px;">${m.p1.split(' / ')[0]}</div>
                        <input type="number" class="score-input-big" value="${m.s1}" onchange="App.state.tournaments.my.find(x=>x.id==='${m.id}').s1=parseInt(this.value)">
                    </div>
                    <div style="align-self:center; font-size:24px; font-weight:bold; color:#333;">:</div>
                    <div>
                        <div class="player-name" style="margin-bottom:15px;">${m.p2.split(' / ')[0]}</div>
                        <input type="number" class="score-input-big" value="${m.s2}" onchange="App.state.tournaments.my.find(x=>x.id==='${m.id}').s2=parseInt(this.value)">
                    </div>
                </div>

                <button class="btn-save" onclick="App.saveResult()">ПОДТВЕРДИТЬ</button>
            </div>`;
    },

    renderNav() {
        const nav = document.getElementById('bottom-nav');
        const tabs = [{id:'tournaments', i:'🏆'}, {id:'matches', i:'🎾'}, {id:'stats', i:'📊'}, {id:'profile', i:'👥'}];
        nav.innerHTML = tabs.map(t => `
            <div class="nav-item ${this.state.currentTab === t.id ? 'active' : ''}" onclick="App.switchTab('${t.id}')">${t.i}</div>
        `).join('');
    }
};

App.init();
