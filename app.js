const App = {
    data: {
        myGames: [
            { id: 1, p1: "Николай / Андрей", p2: "Виктор / Дмитрий", s1: 6, s2: 4 },
            { id: 2, p1: "Николай / Андрей", p2: "Алексей / Сергей", s1: 0, s2: 0 }
        ],
        liveGames: [
            { id: 3, p1: "Юрис / Гинтс", p2: "Артур / Денис", s1: 5, s2: 5 },
            { id: 4, p1: "Олег / Иван", p2: "Максим / Игорь", s1: 6, s2: 1 }
        ],
        leaderboard: [
            { name: "Виктор М.", xp: 2100 },
            { name: "Андрей П.", xp: 1950 },
            { name: "Николай Р.", xp: 1450 }
        ],
        editingId: null
    },

    init() {
        this.renderAll();
    },

    switchTab(tabId, el) {
        // 1. Переключаем кнопки
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        el.classList.add('active');

        // 2. Переключаем экраны
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-' + tabId).classList.add('active');
    },

    openScore(id, p1, p2, s1, s2) {
        this.data.editingId = id;
        document.getElementById('edit-match-names').innerText = p1 + " vs " + p2;
        document.getElementById('s1').value = s1;
        document.getElementById('s2').value = s2;
        document.getElementById('modal-score').classList.add('active');
    },

    closeScore() {
        document.getElementById('modal-score').classList.remove('active');
    },

    saveScore() {
        const id = this.data.editingId;
        const s1 = document.getElementById('s1').value;
        const s2 = document.getElementById('s2').value;

        // Обновляем в данных (ищем в обоих списках)
        [...this.data.myGames, ...this.data.liveGames].forEach(g => {
            if (g.id === id) { g.s1 = s1; g.s2 = s2; }
        });

        this.closeScore();
        this.renderAll();
    },

    renderAll() {
        // Рендер Моих матчей
        const myContent = this.data.myGames.map(g => `
            <div class="card" onclick="App.openScore(${g.id}, '${g.p1}', '${g.p2}', ${g.s1}, ${g.s2})">
                <div class="p-name">${g.p1}</div>
                <div class="score-box">${g.s1}:${g.s2}</div>
                <div class="p-name" style="text-align:right">${g.p2}</div>
            </div>
        `).join('');
        document.getElementById('my-matches-list').innerHTML = myContent;

        // Рендер Будущих (просто заглушка)
        document.getElementById('future-list').innerHTML = `
            <div class="card" style="opacity:0.5; border-style:dashed;">
                <div class="p-name">🏆 Riga Cup 2026</div>
                <div style="font-size:12px; color:var(--dim)">12 Апреля</div>
            </div>`;

        // Рендер Всех матчей (Live)
        const allContent = this.data.liveGames.map(g => `
            <div class="card" onclick="App.openScore(${g.id}, '${g.p1}', '${g.p2}', ${g.s1}, ${g.s2})">
                <div class="p-name">${g.p1}</div>
                <div class="score-box">${g.s1}:${g.s2}</div>
                <div class="p-name" style="text-align:right">${g.p2}</div>
            </div>
        `).join('');
        document.getElementById('all-matches-list').innerHTML = allContent;

        // Рендер Статистики
        const statsContent = this.data.leaderboard.map((p, i) => `
            <div class="card">
                <div class="p-name"><span style="color:var(--neon)">#${i+1}</span> ${p.name}</div>
                <div style="font-weight:900">${p.xp} XP</div>
            </div>
        `).join('');
        document.getElementById('leaderboard-list').innerHTML = statsContent;
    }
};

App.init();
