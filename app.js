const App = {
    state: {
        tab: 'tournaments',
        editingId: null,
        myGames: [
            { id: 1, p1: "Николай / Андрей", p2: "Виктор / Дмитрий", s1: 6, s2: 4, live: true },
            { id: 2, p1: "Алексей / Сергей", p2: "Игорь / Максим", s1: 0, s2: 0, live: false }
        ],
        others: [
            { id: 101, name: "Riga Spring Open", date: "12.04", players: "14/16" },
            { id: 102, name: "Padel Battle", date: "15.04", players: "8/16" }
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
        root.innerHTML = ''; // Полная очистка перед рендером

        if (this.state.editingId) {
            this.renderManage(root);
        } else {
            this.renderHeader(root);
            if (this.state.tab === 'tournaments') this.renderTournaments(root);
            else this.renderPlaceholder(root);
        }
        this.renderNav();
    },

    renderHeader(root) {
        const h = document.createElement('div');
        h.className = 'app-header';
        h.innerHTML = `<h1 class="neon-title">Padel Riga</h1>`;
        root.appendChild(h);
    },

    renderTournaments(root) {
        // Зона "Мои турниры"
        const myZone = document.createElement('div');
        myZone.className = 'section-container my-section';
        myZone.innerHTML = `<div class="label-text">Мои турниры / Live</div>`;
        
        this.state.myGames.forEach(g => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.onclick = () => this.openManage(g.id);
            card.innerHTML = `
                <div class="flex-row">
                    <div class="p-name">${g.p1}</div>
                    <div class="score-badge">${g.s1}:${g.s2}</div>
                    <div class="p-name" style="text-align:right">${g.p2}</div>
                </div>
            `;
            myZone.appendChild(card);
        });
        root.appendChild(myZone);

        // Зона "Доступные"
        const otherZone = document.createElement('div');
        otherZone.className = 'section-container';
        otherZone.innerHTML = `<div class="label-text">Доступные турниры</div>`;
        
        this.state.others.forEach(t => {
            const card = document.createElement('div');
            card.className = 'item-card available-card';
            card.innerHTML = `
                <div class="flex-row">
                    <div>
                        <div style="font-weight:700">${t.name}</div>
                        <div style="font-size:11px; color:#555; margin-top:4px;">${t.date} • ${t.players} игроков</div>
                    </div>
                    <button style="background:var(--neon); border:none; border-radius:8px; padding:6px 12px; font-weight:700; font-size:11px;">Join</button>
                </div>
            `;
            otherZone.appendChild(card);
        });
        root.appendChild(otherZone);
    },

    renderManage(root) {
        const g = this.state.myGames.find(x => x.id === this.state.editingId);
        root.innerHTML = `
            <div class="full-manage">
                <div style="text-align:left"><button onclick="App.setTab('tournaments')" style="background:none; border:none; color:#555; font-size:30px;">✕</button></div>
                <h2 style="margin-top:40px">Результат игры</h2>
                <div class="flex-row" style="margin-top:50px">
                    <div style="flex:1">
                        <div class="p-name" style="margin-bottom:15px">${g.p1.split(' / ')[0]}</div>
                        <input type="number" class="big-input" value="${g.s1}" onchange="App.saveScore(${g.id}, 1, this.value)">
                    </div>
                    <div style="font-size:30px; font-weight:900; color:#222; align-self:flex-end; padding-bottom:20px">:</div>
                    <div style="flex:1">
                        <div class="p-name" style="margin-bottom:15px">${g.p2.split(' / ')[0]}</div>
                        <input type="number" class="big-input" value="${g.s2}" onchange="App.saveScore(${g.id}, 2, this.value)">
                    </div>
                </div>
                <button onclick="App.setTab('tournaments')" style="background:var(--neon); color:black; border:none; width:100%; padding:20px; border-radius:15px; font-weight:800; margin-top:60px">СОХРАНИТЬ</button>
            </div>
        `;
    },

    saveScore(id, team, val) {
        const g = this.state.myGames.find(x => x.id === id);
        if (team === 1) g.s1 = parseInt(val); else g.s2 = parseInt(val);
    },

    renderPlaceholder(root) {
        root.innerHTML += `<div style="text-align:center; padding-top:100px; color:#333; font-weight:700;">Раздел ${this.state.tab.toUpperCase()}<br>скоро будет наполнен</div>`;
    },

    renderNav() {
        const nav = document.getElementById('bottom-nav');
        const items = [
            {id:'tournaments', i:'🏆'}, {id:'matches', i:'🎾'}, 
            {id:'stats', i:'📊'}, {id:'profile', i:'👥'}
        ];
        nav.innerHTML = items.map(item => `
            <div class="nav-btn ${this.state.tab === item.id ? 'active' : ''}" onclick="App.setTab('${item.id}')">${item.i}</div>
        `).join('');
    }
};

App.init();
