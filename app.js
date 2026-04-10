const App = {
    data: {
        my: [
            { id: 1, p1: "Николай / Андрей", p2: "Виктор / Дмитрий", s1: 6, s2: 4 },
            { id: 2, p1: "Николай / Андрей", p2: "Алексей / Сергей", s1: 0, s2: 0 }
        ],
        live: [
            { id: 3, p1: "Юрис / Гинтс", p2: "Артур / Денис", s1: 5, s2: 5 },
            { id: 4, p1: "Олег / Иван", p2: "Максим / Игорь", s1: 6, s2: 2 }
        ],
        ranking: [
            { name: "Виктор М.", val: "2100 XP" },
            { name: "Андрей П.", val: "1950 XP" },
            { name: "Николай Р.", val: "1450 XP" }
        ],
        editingId: null
    },

    init() {
        this.renderLists();
    },

    switchTab(tabId, el) {
        // Убираем активные классы
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        // Включаем нужные
        el.classList.add('active');
        document.getElementById('screen-' + tabId).classList.add('active');
    },

    openScore(id) {
        const game = [...this.data.my, ...this.data.live].find(g => g.id === id);
        this.data.editingId = id;
        document.getElementById('m-names').innerText = game.p1 + " VS " + game.p2;
        document.getElementById('s1').value = game.s1;
        document.getElementById('s2').value = game.s2;
        document.getElementById('modal-score').classList.add('active');
    },

    closeScore() {
        document.getElementById('modal-score').classList.remove('active');
    },

    saveScore() {
        const id = this.data.editingId;
        const s1 = document.getElementById('s1').value || 0;
        const s2 = document.getElementById('s2').value || 0;

        [...this.data.my, ...this.data.live].forEach(g => {
            if (g.id === id) { g.s1 = s1; g.s2 = s2; }
        });

        this.closeScore();
        this.renderLists();
    },

    renderLists() {
        // Список моих игр
        document.getElementById('my-list').innerHTML = this.data.my.map(g => `
            <div class="match-card" onclick="App.openScore(${g.id})">
                <div class="p-name">${g.p1}</div>
                <div class="score-display">${g.s1}:${g.s2}</div>
                <div class="p-name" style="text-align:right">${g.p2}</div>
            </div>
        `).join('');

        // Список Live
        document.getElementById('live-list').innerHTML = this.data.live.map(g => `
            <div class="match-card" onclick="App.openScore(${g.id})">
                <div class="p-name">${g.p1}</div>
                <div class="score-display">${g.s1}:${g.s2}</div>
                <div class="p-name" style="text-align:right">${g.p2}</div>
            </div>
        `).join('');

        // Рейтинг
        document.getElementById('stats-list').innerHTML = this.data.ranking.map((r, i) => `
            <div class="match-card">
                <div class="p-name"><span style="color:var(--neon); margin-right:10px;">#${i+1}</span> ${r.name}</div>
                <div style="font-weight:900">${r.val}</div>
            </div>
        `).join('');

        // Будущие
        document.getElementById('future-list').innerHTML = `
            <div class="match-card" style="opacity:0.4; border-style:dashed;">
                <div class="p-name">🏆 Riga Open Cup</div>
                <div style="font-size:12px;">12 Апреля</div>
            </div>`;
    }
};

App.init();
