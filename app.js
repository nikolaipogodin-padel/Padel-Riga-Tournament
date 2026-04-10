const App = {
    state: {
        currentTab: 'tournaments',
        activeTournamentId: null,
        // Имитация турнира на 16 игроков (8 матчей)
        tournaments: {
            "t1": {
                name: "Padel Riga Open (16 players)",
                matches: [
                    { id: "m1", court: "1", status: "finished", t1: "Николай", t2: "Андрей", s: [[6,4], [3,6], [6,2]] },
                    { id: "m2", court: "2", status: "live", t1: "Виктор", t2: "Дмитрий", s: [[2,1], [0,0], [0,0]] },
                    { id: "m3", court: "3", status: "waiting", t1: "Алексей", t2: "Сергей", s: [[0,0], [0,0], [0,0]] },
                    { id: "m4", court: "4", status: "waiting", t1: "Игорь", t2: "Максим", s: [[0,0], [0,0], [0,0]] },
                    { id: "m5", court: "1", status: "waiting", t1: "Юрис", t2: "Гинтс", s: [[0,0], [0,0], [0,0]] }
                ]
            }
        }
    },

    init() {
        this.render();
    },

    // Авто-переход между ячейками
    nextInput(current) {
        if (current.value.length >= 1) {
            const inputs = Array.from(document.querySelectorAll('.score-input'));
            const index = inputs.indexOf(current);
            if (index > -1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
                inputs[index + 1].select();
            }
        }
    },

    updateScore(matchId, setIdx, teamIdx, val) {
        const t = this.state.tournaments[this.state.activeTournamentId];
        const match = t.matches.find(m => m.id === matchId);
        match.s[setIdx][teamIdx] = parseInt(val) || 0;
        
        // Если начали вводить счет, статус меняется на LIVE
        if (match.status === 'waiting') match.status = 'live';
        
        console.log("Score updated:", match.s);
    },

    switchTab(tab) {
        this.state.currentTab = tab;
        this.state.activeTournamentId = null;
        this.render();
    },

    openTournament(id) {
        this.state.activeTournamentId = id;
        this.render();
    },

    render() {
        const container = document.getElementById('main-content');
        if (this.state.activeTournamentId) {
            this.renderDetail();
        } else {
            this.renderList();
        }
        this.renderNav();
    },

    renderList() {
        const main = document.getElementById('main-content');
        main.innerHTML = `<h1 class="neon-text">PADEL RIGA</h1><div id="screen-tournaments" class="screen active">` + 
            Object.keys(this.state.tournaments).map(id => `
                <div class="match-card" onclick="App.openTournament('${id}')" style="cursor:pointer">
                    <div style="color:var(--neon); font-weight:800;">${this.state.tournaments[id].name}</div>
                    <div style="font-size:12px; color:#666; margin-top:5px;">16 Игроков • 4 Корта • Нажми для входа</div>
                </div>
            `).join('') + `</div>`;
    },

    renderDetail() {
        const t = this.state.tournaments[this.state.activeTournamentId];
        const main = document.getElementById('main-content');
        
        const matchesHtml = t.matches.map(m => `
            <div class="match-card ${m.status === 'live' ? 'live' : ''}">
                <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:center;">
                    <span class="status-tag status-${m.status}">${m.status}</span>
                    <span style="font-size:11px; color:#555;">КОРТ ${m.court}</span>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="player-name">${m.t1}</div>
                    
                    <div class="score-box">
                        ${m.s.map((set, setIdx) => `
                            <div class="set">
                                <input type="number" class="score-input" value="${set[0]}" 
                                    oninput="App.nextInput(this)" 
                                    onchange="App.updateScore('${m.id}', ${setIdx}, 0, this.value)">
                                <input type="number" class="score-input" value="${set[1]}" 
                                    oninput="App.nextInput(this)" 
                                    onchange="App.updateScore('${m.id}', ${setIdx}, 1, this.value)">
                            </div>
                        `).join('')}
                    </div>

                    <div class="player-name" style="text-align:right;">${m.t2}</div>
                </div>
            </div>
        `).join('');

        main.innerHTML = `
            <div class="screen active">
                <button class="btn-back" onclick="App.switchTab('tournaments')">← ТУРНИРЫ</button>
                <h2 style="margin:15px; font-size:18px;">${t.name}</h2>
                ${matchesHtml}
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
        nav.innerHTML = tabs.map(t => `
            <div class="${t.id === 'fab' ? 'fab' : 'nav-item'} ${this.state.currentTab === t.id ? 'active' : ''}" 
                 onclick="${t.id === 'fab' ? '' : `App.switchTab('${t.id}')`}">
                ${t.ico}
            </div>
        `).join('');
    }
};

App.init();
