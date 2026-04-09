
/**
 * PADEL CLUB — TEST DRIVE VERSION
 * Работает без внешней базы для проверки дизайна и логики
 */

const App = {
    // Временные данные (вместо Firebase)
    data: {
        tournaments: {
            "t1": {
                name: "Вечерний Падел Рига",
                startDate: "2026-04-15 19:00",
                maxPlayers: 2,
                participants: {
                    "p1": { name: "Николай", status: "approved" }
                }
            },
            "t2": {
                name: "Блиц-Турнир (Заблокирован)",
                startDate: "2026-04-09 20:00", // Менее 24 часов от текущей даты
                maxPlayers: 16,
                participants: {}
            }
        }
    },

    init() {
        console.log("Test Mode Active");
        this.renderNav();
        this.render();
    },

    render() {
        const container = document.getElementById('tournament-list');
        const tournaments = this.data.tournaments;
        
        container.innerHTML = Object.keys(tournaments).map(id => {
            const t = tournaments[id];
            const parts = Object.values(t.participants);
            const max = t.maxPlayers;
            const isFull = parts.length >= max;
            
            // Логика 24 часов
            const start = new Date(t.startDate).getTime();
            const now = new Date("2026-04-09 18:00").getTime(); // Фиксация времени для теста
            const isLocked = (start - now) < (24 * 60 * 60 * 1000);

            return `
                <div class="tournament-card ${isLocked ? 'locked' : ''}">
                    <div style="font-weight:bold; font-size:20px; color:#39FF14">${t.name}</div>
                    <div class="occupancy" style="margin: 10px 0;">
                        Игроки: ${parts.length}/${max}
                        ${isFull ? `<span class="queue-tag" style="color:#00E5FF"> + В очереди: ${parts.filter(p=>p.status==='queue').length}</span>` : ''}
                    </div>
                    <div style="font-size:12px; color:#888; margin-bottom:15px;">📅 ${t.startDate}</div>
                    
                    ${isLocked 
                        ? `<button class="btn-main btn-locked" style="background:#333; color:#FF4B4B; border:1px solid #FF4B4B; width:100%; padding:12px; border-radius:12px;">РЕГИСТРАЦИЯ ЗАКРЫТА</button>` 
                        : `<button class="btn-main" onclick="App.join('${id}')" style="background:#39FF14; color:black; border:none; width:100%; padding:12px; border-radius:12px; font-weight:bold;">
                            ${isFull ? 'ВСТАТЬ В ОЧЕРЕДЬ' : 'ЗАПИСАТЬСЯ'}
                           </button>`
                    }
                </div>
            `;
        }).join('');
    },

    join(id) {
        const t = this.data.tournaments[id];
        const name = prompt("Ваше имя для теста:");
        if (!name) return;

        const isFull = Object.values(t.participants).length >= t.maxPlayers;
        const newId = "p" + Date.now();
        
        t.participants[newId] = {
            name: name,
            status: isFull ? 'queue' : 'approved'
        };

        alert(isFull ? "Мест нет! Вы добавлены в очередь." : "Успешная запись!");
        this.render();
    },

    renderNav() {
        const nav = document.getElementById('bottom-nav');
        nav.innerHTML = `
            <div style="font-size:24px">🏆</div>
            <div style="font-size:24px">🎾</div>
            <div class="fab" style="background:#39FF14; width:50px; height:50px; border-radius:15px; display:flex; align-items:center; justify-content:center; color:black; font-weight:bold; margin-top:-20px;">+</div>
            <div style="font-size:24px">📊</div>
            <div style="font-size:24px">👥</div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

