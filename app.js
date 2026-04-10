const App = {
    state: {
        tab: 'tournaments',
        editingId: null,
        // Имитация базы данных
        myGames: [
            { id: 1, p1: "Николай / Андрей", p2: "Виктор / Дмитрий", s1: 6, s2: 4, court: 1, status: "finished" },
            { id: 2, p1: "Николай / Андрей", p2: "Алексей / Сергей", s1: 2, s2: 3, court: 2, status: "live" }
        ],
        liveTournament: [
            { id: 10, p1: "Юрис / Гинтс", p2: "Артур / Денис", s1: 5, s2: 5, court: 3, status: "live" },
            { id: 11, p1: "Максим / Игорь", p2: "Олег / Иван", s1: 6, s2: 1, court: 4, status: "finished" }
        ],
        future: [
            { name: "Riga Masters 2026", date: "Воскресенье, 19:00", info: "14/16 игроков" },
            { name: "Padel Night", date: "24 Апреля, 21:00", info: "Свободно 2 места" }
        ]
    },

    init() {
        this.render();
    },

    setTab(t) {
        this.state.tab = t;
        this.state.editingId = null;
        this.render();
    },

    openManage(id) {
        this.state.editingId = id;
        this.render();
    },

    render() {
        const root = document.getElementById('main-content');
        root.innerHTML = ''; 

        if (this.state.editingId) {
            this.renderManage(root);
        } else {
            this.renderHeader(root);
            if (this.state.tab === 'tournaments') {
                this.renderTournamentList(root);
            } else if (this.state.tab === 'matches') {
                this.renderLiveTab(root);
            } else {
                this.renderPlaceholder(root);
            }
        }
        this.renderNav();
    },

    renderHeader(root) {
        const h = document.createElement('div');
        h.className = 'app-header';
        h.innerHTML = `<h1 class="neon-title">Padel Riga</h1>`;
        root.appendChild(h);
    },

    renderTournamentList(root) {
        // Мои игры
        let html = `<div class="section"><div class="section-title">Мои текущие матчи</div>`;
        this.state.myGames.forEach(g => {
            html += this.createMatchCard(g);
        });
        html += `</div>`;

        // Будущие турниры
        html += `<div class="section"><div class="section-title">Предстоящие события</div>`;
        this.state.future.forEach(f => {
            html += `
                <div class="card" style="border-style: dashed; opacity: 0.7;">
                    <div style="font-weight:700; font-size:16px;">${f.name}</div>
                    <div style="font-size:12px; color:var(--text-dim); margin-top:4px;">${f.date} • ${f.info}</div>
                </div>`;
        });
        html += `</div>`;
        root.innerHTML += html;
    },

    renderLiveTab(root) {
        let html = `<div class="section"><div class="section-title">Прямой эфир (Все корты)</div>`;
        this.state.liveTournament.forEach(g => {
            html += this.createMatchCard(g);
        });
        html += `</div>`;
        root.innerHTML += html;
    },

    createMatchCard(g) {
        return `
            <div class="card" onclick="App.openManage(${g.id})">
                <div class="flex-center">
                    <div class="player-box">${g.p1}</div>
                    <div class="score-main">${g.s1}:${g.s2}</div>
                    <div class="player-box" style="text-align:right">${g.p2}</div>
                </div>
                <div class="court-tag">КОРТ ${g.court} • ${g.status.toUpperCase()}</div>
            </div>`;
    },

    renderManage(root) {
        const g = [...this.state.myGames, ...this.state.liveTournament].find(x => x.id === this.state.editingId);
        root.innerHTML = `
            <div class="manage-view">
                <button class="close-btn" onclick="App.setTab('tournaments')">✕</button>
                <h2 style="margin-top:60px; font-weight:900;">Ввод счета</h2>
                <p style="color:var(--text-dim); margin-bottom:40px;">Корт ${g.court} • ${g.p1} vs ${g.p2}</p>
                
                <div class="flex-center" style="justify-content:center">
                    <input type="number" class="big-score-input" value="${g.s1}" onchange="App.saveScore(${g.id}, 1, this.value)">
                    <div style="font-size:30px; font-weight:900; color:#222">:</div>
                    <input type="number" class="big-score-input" value="${g.s2}" onchange="App.saveScore(${g.id}, 2, this.value)">
                </div>

                <button class="save-btn" onclick="App.setTab('tournaments')">СОХРАНИТЬ РЕЗУЛЬТАТ</button>
            </div>
        `;
    },

    saveScore(id, team, val) {
        const g = [...this.state.myGames, ...this.state.liveTournament].find(x => x.id === id);
        if (team === 1) g.s1 = parseInt(val) || 0;
        else g.s2 = parseInt(val) || 0;
    },

    renderPlaceholder(root) {
        root.innerHTML += `
            <div style="text-align:center; padding-top:100px;">
                <div style="font-size:40px; margin-bottom:20px;">🔒</div>
                <div style="color:var(--text-dim); font-weight:700;">Раздел ${this.state.tab.toUpperCase()}<br>будет доступен после авторизации</div>
            </div>`;
    },

    renderNav() {
        const nav = document.getElementById('bottom-nav');
        const items = [{id:'tournaments', i:'🏆'}, {id:'matches', i:'🎾'}, {id:'stats', i:'📊'}, {id:'profile', i:'👥'}];
        nav.innerHTML = items.map(item => `
            <div class="nav-btn ${this.state.tab === item.id ? 'active' : ''}" onclick="App.setTab('${item.id}')">${item.i}</div>
        `).join('');
    }
};

App.init();
