// Padel Riga Tracker v2.4 - Core Logic
const state = {
    currentScreen: 'dashboard',
    tournaments: JSON.parse(localStorage.getItem('pr_tournaments')) || [],
    activeTournamentId: null,
    user: JSON.parse(localStorage.getItem('pr_user')) || null
};

// 1. ПРИНЦИПЫ ТАЙМИНГА [cite: 25, 26, 27]
const calculateTiming = (totalMinutes, rounds, buffer = 10) => {
    const netTime = totalMinutes - buffer;
    const timePerRound = netTime / rounds;
    // Округление вниз до 15 или 20 [cite: 26]
    return timePerRound >= 20 ? 20 : 15;
};

// 2. МИКСЕР (ФОРМИРОВАНИЕ ПАР) [cite: 20, 21]
const createPairs = (players) => {
    let shuffled = [...players].sort(() => Math.random() - 0.5);
    if (shuffled.length % 2 !== 0) {
        shuffled.push({ id: 'ghost', name: 'Ghost Player', isGhost: true });
    }
    const pairs = [];
    for (let i = 0; i < shuffled.length; i += 2) {
        pairs.push({
            id: `p-${i}`,
            player1: shuffled[i],
            player2: shuffled[i+1],
            wins: 0,
            setsDiff: 0
        });
    }
    return pairs;
};

// 3. РОУТИНГ ЭКРАНОВ
window.switchScreen = (screenId) => {
    state.currentScreen = screenId;
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenId);
    });
    render();
};

// 4. РЕНДЕРИНГ
const render = () => {
    const container = document.getElementById('screen-content');
    
    if (state.currentScreen === 'dashboard') {
        container.innerHTML = `
            <h1 class="text-3xl font-extrabold mb-6 tracking-tight">ПАДЕЛЬ <span class="text-green-500">РИГА</span></h1>
            <div class="space-y-4">
                <div class="glass-card p-6 border-l-4 border-green-500">
                    <div class="flex justify-between items-start mb-4">
                        <span class="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded">OPEN</span>
                        <span class="text-slate-500 text-xs">19 Авг, 10:00</span>
                    </div>
                    <h2 class="text-xl font-bold mb-2">Autumn Slam</h2>
                    <p class="text-slate-400 text-sm mb-4">Рига, Skunste • 0/16 участников</p>
                    <button onclick="registerView()" class="w-full bg-green-500 hover:bg-green-400 text-black font-extrabold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]">РЕГИСТРАЦИЯ</button>
                </div>
            </div>
        `;
    }

    if (state.currentScreen === 'live') {
        container.innerHTML = `
            <div class="flex gap-2 overflow-x-auto mb-6 pb-2">
                <button class="tab-active px-4 py-2 rounded-full text-xs font-bold uppercase">Тур 1</button>
                <button class="bg-slate-800 px-4 py-2 rounded-full text-xs font-bold uppercase opacity-50">Тур 2</button>
                <button class="bg-slate-800 px-4 py-2 rounded-full text-xs font-bold uppercase opacity-50">Тур 3</button>
            </div>

            <div class="space-y-4">
                <div class="glass-card p-5 relative overflow-hidden border-green-500/30">
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span class="text-[10px] font-bold tracking-widest text-green-500 uppercase">Live Match</span>
                        </div>
                        <span class="text-xs text-slate-500">Корт 1</span>
                    </div>
                    
                    <div class="flex justify-between items-center gap-4">
                        <div class="text-center flex-1">
                            <div class="text-lg font-bold">Николай / Андрей</div>
                        </div>
                        <div class="flex gap-2 items-center">
                            <div class="text-3xl font-black text-green-500">6</div>
                            <div class="text-slate-600 font-bold">:</div>
                            <div class="text-3xl font-black">3</div>
                        </div>
                        <div class="text-center flex-1">
                            <div class="text-lg font-bold opacity-60">Виктор / Ghost</div>
                        </div>
                    </div>

                    <div class="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                        <div class="text-[10px] text-slate-500 uppercase tracking-tighter">Осталось: <span class="text-white">12:40</span></div>
                        <button class="text-[10px] font-bold text-blue-500 uppercase tracking-widest border border-blue-500/30 px-3 py-1 rounded-lg">Внести счет</button>
                    </div>
                </div>
            </div>
        `;
    }

    if (state.currentScreen === 'stats') {
        container.innerHTML = `
            <h2 class="text-2xl font-black mb-6 uppercase italic">Leaderboard</h2>
            <div class="glass-card overflow-hidden">
                <table class="w-full text-left">
                    <thead>
                        <tr class="bg-white/5 text-[10px] uppercase tracking-widest text-slate-400">
                            <th class="p-4">Пара</th>
                            <th class="p-4 text-center">П</th>
                            <th class="p-4 text-center">+/-</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr>
                            <td class="p-4 font-bold text-sm">Николай / Андрей</td>
                            <td class="p-4 text-center font-black text-green-500">3</td>
                            <td class="p-4 text-center text-slate-400">+12</td>
                        </tr>
                        <tr>
                            <td class="p-4 font-bold text-sm opacity-80">Игорь / Олег</td>
                            <td class="p-4 text-center font-black">2</td>
                            <td class="p-4 text-center text-slate-400">+4</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    switchScreen('dashboard');
});
