// ГЕНЕРАЦИЯ ДАННЫХ ПРИ СТАРТЕ
const mockData = {
    myTournaments: [
        { id: 1, title: 'Autumn Slam 2026', date: '19 Апр', time: '10:00', loc: 'Riga, Skunste', status: 'LIVE', icon: '🎾', players: '16/16' },
        { id: 2, title: 'Riga Evening Open', date: '21 Апр', time: '19:00', loc: 'Enri Padel', status: 'OPEN', icon: '🌙', players: '8/16' }
    ],
    availableTournaments: [
        { id: 3, title: 'Tallinn Padel Cup', date: '05 Май', time: '11:30', loc: 'Tallinn Center', status: 'OPEN', icon: '🇪🇪', players: '4/32' },
        { id: 4, title: 'Kaunas Challenge', date: '12 Май', time: '12:00', loc: 'Kaunas Arena', status: 'OPEN', icon: '🇱🇹', players: '12/24' },
        { id: 5, title: 'Vilnius Masters', date: '20 Май', time: '10:00', loc: 'Vilnius Padel', status: 'CLOSED', icon: '🏆', players: '32/32' }
    ]
};

const state = {
    currentScreen: 'dashboard',
    activeTournament: null
};

// РОУТИНГ
window.switchScreen = (screenId, params = null) => {
    state.currentScreen = screenId;
    if (params) state.activeTournament = params;
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenId);
    });
    render();
    window.scrollTo(0,0);
};

// РЕНДЕР КОМПОНЕНТОВ
const renderTournamentCard = (t) => `
    <div onclick="switchScreen('tournament_details', ${t.id})" class="scroll-item glass-card p-6 card-gradient-border flex flex-col justify-between min-h-[220px]">
        <div>
            <div class="flex justify-between items-start mb-4">
                <span class="text-3xl">${t.icon}</span>
                <span class="${t.status === 'LIVE' ? 'bg-green-500 text-black' : 'bg-blue-500/20 text-blue-400'} text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                    ${t.status}
                </span>
            </div>
            <h3 class="text-xl font-bold leading-tight mb-1">${t.title}</h3>
            <p class="text-slate-400 text-xs flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                ${t.loc}
            </p>
        </div>
        <div class="mt-6 flex justify-between items-center border-t border-white/5 pt-4">
            <div class="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                ${t.date} • ${t.time}
            </div>
            <div class="text-[10px] text-slate-300 font-bold">${t.players}</div>
        </div>
    </div>
`;

const render = () => {
    const container = document.getElementById('screen-content');
    
    if (state.currentScreen === 'dashboard' || state.currentScreen === 'tournaments') {
        container.innerHTML = `
            <div class="p-6">
                <h1 class="text-3xl font-black mb-8 italic uppercase tracking-tighter">Padel <span class="text-green-500">Riga</span></h1>
                
                <section class="mb-10">
                    <div class="flex justify-between items-end mb-4 px-2">
                        <h2 class="text-lg font-extrabold uppercase tracking-tight text-white/90">Мои Турниры</h2>
                        <span class="text-blue-500 text-xs font-bold uppercase cursor-pointer">Все</span>
                    </div>
                    <div class="horizontal-scroll">
                        ${mockData.myTournaments.map(t => renderTournamentCard(t)).join('')}
                    </div>
                </section>

                <section>
                    <div class="flex justify-between items-end mb-4 px-2">
                        <h2 class="text-lg font-extrabold uppercase tracking-tight text-white/90">Доступные</h2>
                        <span class="text-blue-500 text-xs font-bold uppercase cursor-pointer">Все</span>
                    </div>
                    <div class="horizontal-scroll">
                        ${mockData.availableTournaments.map(t => renderTournamentCard(t)).join('')}
                    </div>
                </section>
            </div>
        `;
    }

    if (state.currentScreen === 'tournament_details') {
        const t = [...mockData.myTournaments, ...mockData.availableTournaments].find(x => x.id == state.activeTournament);
        container.innerHTML = `
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div class="relative h-48 w-full overflow-hidden mb-6">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#05070a] to-transparent z-10"></div>
                    <img src="https://images.unsplash.com/photo-1626224484214-4051d4bc61ae?auto=format&fit=crop&w=800&q=80" class="w-full h-full object-cover opacity-40">
                    <button onclick="switchScreen('dashboard')" class="absolute top-6 left-6 z-20 bg-black/50 p-3 rounded-2xl border border-white/10">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                </div>
                
                <div class="px-6">
                    <div class="mb-8">
                        <h2 class="text-3xl font-black mb-2">${t.title}</h2>
                        <div class="flex gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <span>📅 ${t.date}</span>
                            <span>⏰ ${t.time}</span>
                            <span>📍 ${t.loc}</span>
                        </div>
                    </div>

                    <div class="glass-card p-6 mb-6 card-gradient-border">
                        <h4 class="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 italic">Статус участника</h4>
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 font-bold text-xl">NP</div>
                            <div>
                                <div class="font-bold">Николай Погодин</div>
                                <div class="text-[10px] text-slate-500 uppercase tracking-widest">Platinum Member</div>
                            </div>
                        </div>
                        <button class="w-full bg-green-500 text-black font-black py-4 rounded-2xl uppercase shadow-[0_0_30px_rgba(34,197,94,0.3)] active:scale-95 transition-all">
                            Зарегистрироваться
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    if (state.currentScreen === 'live') {
        container.innerHTML = `
            <div class="p-6">
                <h2 class="text-2xl font-black mb-6 italic uppercase tracking-tighter">Live Flow</h2>
                <div class="glass-card p-6 border-green-500/30 border">
                    <div class="flex justify-between items-center mb-6">
                        <span class="text-[10px] font-black text-green-500 tracking-[0.2em] uppercase">Матч в эфире</span>
                        <span class="text-xs text-slate-500 font-bold tracking-tighter">Корт 1</span>
                    </div>
                    <div class="flex justify-between items-center mb-8">
                        <div class="text-center flex-1 font-bold">Николай / Андрей</div>
                        <div class="text-3xl font-black px-4 text-green-500">6:3</div>
                        <div class="text-center flex-1 font-bold opacity-40 italic">Виктор / Ghost</div>
                    </div>
                    <button class="w-full border border-white/10 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                        Внести счет
                    </button>
                </div>
            </div>
        `;
    }
};

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    switchScreen('dashboard');
});
