// ПРОВЕРКА ПОДКЛЮЧЕНИЯ
console.log("App.js запущен успешно");

// Твои настройки Firebase (ВСТАВЬ СВОИ ДАННЫЕ ТУТ)
const firebaseConfig = {
    apiKey: "ТВОЙ_КЛЮЧ",
    authDomain: "padel-riga.firebaseapp.com",
    databaseURL: "https://padel-riga-default-rtdb.firebaseio.com",
    projectId: "padel-riga",
    storageBucket: "padel-riga.appspot.com",
    messagingSenderId: "123",
    appId: "123"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

const App = {
    init: function() {
        this.renderBottomNav();
        this.listenTournaments();
    },

    listenTournaments: function() {
        db.ref('tournaments').on('value', (snap) => {
            const list = document.getElementById('tournament-list');
            const data = snap.val();
            if(!data) { list.innerHTML = "Турниров пока нет"; return; }
            
            list.innerHTML = Object.keys(data).map(id => {
                const t = data[id];
                const parts = t.participants ? Object.values(t.participants) : [];
                const max = t.maxPlayers || 16;
                const isFull = parts.length >= max;
                
                return `
                <div class="tournament-card">
                    <h3>${t.name}</h3>
                    <p>Игроков: ${parts.length}/${max}</p>
                    ${isFull ? `<p style="color:#00E5FF">В очереди: ${parts.filter(p=>p.status==='queue').length}</p>` : ''}
                    <button class="btn-manage" onclick="App.join('${id}')">
                        ${isFull ? 'ВСТАТЬ В ОЧЕРЕДЬ' : 'ЗАПИСАТЬСЯ'}
                    </button>
                </div>`;
            }).join('');
        });
    },

    renderBottomNav: function() {
        document.getElementById('bottom-nav').innerHTML = `
            <div class="nav-item">🏆</div>
            <div class="nav-item">🎾</div>
            <div class="fab-container"><div class="fab">+</div></div>
            <div class="nav-item">📊</div>
            <div class="nav-item">👥</div>
        `;
    },

    join: function(id) {
        alert("Заглушка: Запись на турнир " + id);
        // Здесь будет логика записи, которую мы обсуждали
    }
};

App.init();
