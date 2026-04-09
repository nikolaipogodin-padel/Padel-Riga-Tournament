const App = {
    state: {
        currentTab: 'tournaments',
        tournaments: {
            "t1": {
                name: "Вечерний Падел Рига",
                startDate: "2026-04-15 19:00",
                maxPlayers: 2,
                participants: { "p1": { name: "Николай", status: "approved" } }
            },
            "t2": {
                name: "Блиц-Турнир (Заблокирован)",
                startDate: "2026-04-10 10:00", 
                maxPlayers: 16,
                participants: {}
            }
        }
    },

    init() {
        this.render();
        // Запускаем обновление таймеров каждую минуту
        setInterval(() => { if(this.state.currentTab === 'tournaments') this.render(); }, 60000);
    },

    // Расчет времени до начала
    getTimeLeft(dateStr) {
        const diff = new Date(dateStr) - Date.now();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, mins, isLocked: hours < 24 };
    },

    render() {
        const main = document.getElementById('tournament-list');
        const nav = document.getElementById('bottom-nav');

        if (this.state.currentTab === 'tournaments') {
            this.renderTournaments(main);
        } else {
            main.innerHTML = `<div style="text-align:center; padding:100px 20px; color:#555; font-size:18px;">
                Раздел <b style="color:white">${this.state.currentTab.toUpperCase()}</b><br>будет доступен в следующем обновлении
            </div>`;
        }

        nav.innerHTML = `
            <div class="nav-item ${this.state.currentTab === 'tournaments' ? 'active' : ''}" onclick="App.switchTab('tournaments')">🏆</div>
            <div class="nav-item ${this.state.currentTab === 'matches' ? 'active' : ''}" onclick="App.switchTab('matches')">🎾</div>
            <div class="fab-container" onclick="App.addTournament()"><div class="fab">+</div></div>
            <div class="nav-item ${this.state.currentTab === 'stats' ? 'active' : ''}" onclick="App.switchTab('stats')">📊</div>
            <div class="nav-item ${this.state.currentTab === 'profile' ? 'active' : ''}" onclick="App.switchTab('profile')">👥</div>
        `;
    },

    renderTournaments(container) {
        const tours = this.state.tournaments;
        container.innerHTML = Object.keys(tours).map(id => {
            const t = tours[id];
            const parts = Object.values(t.participants);
            const timeInfo = this.getTimeLeft(t.startDate);
            const isFull = parts.length >= t.maxPlayers;

            return `
                <div class="tournament-card ${timeInfo.isLocked ? 'locked' : ''}">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <div style="font-weight:800; font-size:22px; color:var(--neon); max-width:70%;">${t.name}</div>
                        <div style="font-size:12px; background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:8px;">
                            ${timeInfo.isLocked ? '🔒 ЗАКРЫТО' : '⏱ ' + timeInfo.hours + 'ч'}
                        </div>
                    </div>
                    
                    <div style="margin: 15px 0; font-size:15px; color:#BBB;">
                        Игроки: <b style="color:white">${parts.length}/${t.maxPlayers}</b>
                        ${isFull ? `<span style="color:var(--wait); margin-left:10px;">• Очередь: ${parts.filter(p=>p.status==='queue').length}</span>` : ''}
                    </div>

                    <div style="font-size:13px; color:#666; margin-bottom:20px;">📅 Старт: ${t.startDate}</div>

                    ${timeInfo.isLocked 
                        ? `<button class="btn-main" style="background:#222; color:var(--error); border:1px solid var(--error);">Регистрация окончена</button>` 
                        : `<button class="btn-main" onclick="App.join('${id}')">
                            ${isFull ? 'Встать в очередь' : 'Записаться сейчас'}
                           </button>`
                    }
                </div>
            `;
        }).join('');
    },

    switchTab(tab) {
        this.state.currentTab = tab;
        this.render();
    },

    join(id) {
        const name = prompt("Ваше имя:");
        if (!name) return;
        
        const t = this.state.tournaments[id];
        const isFull = Object.values(t.participants).length >= t.maxPlayers;
        
        t.participants[Date.now()] = { name, status: isFull ? 'queue' : 'approved' };
        
        this.showToast(isFull ? "Вы добавлены в список ожидания!" : "Запись подтверждена! Ждем на корте.");
        this.render();
    },

    showToast(text) {
        const toast = document.createElement('div');
        toast.style.cssText = `position:fixed; top:20px; left:50%; transform:translateX(-50%); 
            background:var(--neon); color:black; padding:15px 25px; border-radius:15px; 
            font-weight:bold; z-index:2000; box-shadow:0 10px 30px rgba(0,0,0,0.5); animation: slideDown 0.5s ease;`;
        toast.innerText = text;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    addTournament() {
        const name = prompt("Название турнира:");
        if (name) {
            this.state.tournaments[Date.now()] = {
                name, startDate: "2026-04-25 10:00", maxPlayers: 16, participants: {}
            };
            this.render();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
