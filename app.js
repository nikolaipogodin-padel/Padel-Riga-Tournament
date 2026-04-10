const STORE = {
    tournaments: [
        { id: 1, title: "Autumn Slam 2026", date: "19 Апр", time: "10:00", loc: "Skunste Riga", players: "16/16", status: "LIVE", type: "my" },
        { id: 2, title: "Evening Mix-Up", date: "21 Апр", time: "19:00", loc: "Enri Padel", players: "8/16", status: "OPEN", type: "my" },
        { id: 3, title: "Tallinn Masters", date: "05 Май", time: "11:30", loc: "Tallinn Center", players: "4/32", status: "OPEN", type: "available" },
        { id: 4, title: "Kaunas Cup", date: "12 Май", time: "12:00", loc: "Padel Hub", players: "12/24", status: "OPEN", type: "available" },
        { id: 5, title: "Riga Morning", date: "15 Май", time: "09:00", loc: "Skunste Riga", players: "0/16", status: "CLOSED", type: "available" }
    ],
    currentScreen: 'dashboard',
    activeId: null
};

window.router = {
    navigate(screen, id = null) {
        STORE.currentScreen = screen;
        STORE.activeId = id;
        
        // Скрываем заголовок на экране деталей
        const header = document.getElementById('main-header');
        if (header) header.style.display = (screen === 'details') ? 'none' : 'flex';
        
        this.updateNavUI();
        render();
    },
    updateNavUI() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === STORE.currentScreen);
        });
    }
};

const UI = {
    Card(t) {
        const isLive = t.status === 'LIVE';
        return `
            <div onclick="router.navigate('details', ${t.id})" class="scroll-item glass-card p-6 ${isLive ? 'border-green-500/30' : 'border-white/10'}">
                <div class="flex justify-between items-start mb-6">
                    <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl">🎾</div>
                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isLive ? 'bg-green-500 text-black' : 'bg-white/10 text-slate-400'}">
                        ${t.status}
                    </span>
                </div>
                <h3 class="text-xl font-black mb-1 tracking-tight">${t.title}</h3>
                <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">📍 ${t.loc}</p>
                <div class="flex justify-between border-t border-white/5 pt-4">
                    <div><p class="text-[9px] text-slate-600 uppercase font-black tracking-tighter">Когда</p><p class="text-xs font-bold">${t.date}</p></div>
                    <div class="text-right"><p class="text-[9px] text-slate-600 uppercase font-black tracking-tighter">Слоты</p><p class="text-xs font-bold">${t.players}</p></div>
                </div>
            </div>
        `;
    }
};

const Screens = {
    dashboard() {
        const my = STORE.tournaments.filter(t => t.type === 'my');
        const available = STORE.tournaments.filter(t => t.type === 'available');
        return `
            <div class="fade-in">
                <div class="mb-8">
                    <h2 class="px-6 text-xs font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Мои события</h2>
                    <div class="horizontal-scroll">${my.map(t => UI.Card(t)).join('')}</div>
                </div>
                <div>
                    <h2 class="px-6 text-xs font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Доступные турниры</h2>
                    <div class="horizontal-scroll">${available.map(t => UI.Card(t)).join('')}</div>
                </div>
            </div>
        `;
    },
    details(id) {
        const t = STORE.tournaments.find(x => x.id === id);
        return `
            <div class="fade-in relative">
                <div class="h-72 w-full relative">
                    <img src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000" class="w-full h-full object-cover opacity-40">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#05070a] to-transparent"></div>
                    <button onclick="router.navigate('dashboard')" class="absolute top-10 left-6 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="3"></path></svg>
                    </button>
                </div>
                <div class="px-6 -mt-10 relative">
                    <h2 class="text-3xl font-black mb-4 tracking-tighter">${t.title}</h2>
                    <div class="flex gap-2 mb-8">
                        <span class="bg-blue-500/20 text-blue-400 text-[10px] px-3 py-1 rounded-lg border border-blue-500/20 font-black uppercase tracking-widest">${t.loc}</span>
                        <span class="bg-white/5 text-white/50 text-[10px] px-3 py-1 rounded-lg border border-white/10 font-black uppercase tracking-widest">${t.date}</span>
                    </div>
                    <div class="glass-card p-6 mb-6">
                        <p class="text-slate-400 text-sm leading-relaxed mb-6 italic">Турнир формата Mix-Up. Одиночная регистрация, случайная смена напарников каждый круг. Победитель определяется по личному зачету.</p>
                        <button class="w-full bg-green-500 text-black font-black py-4 rounded-2xl uppercase shadow-lg shadow-green-500/20">Регистрация</button>
                    </div>
                </div>
            </div>
        `;
    },
    live() { return `<div class="p-20 text-center opacity-30 font-black uppercase tracking-widest fade-in">Здесь будет сетка матчей</div>`; },
    stats() { return `<div class="p-20 text-center opacity-30 font-black uppercase tracking-widest fade-in">Рейтинг игроков</div>`; },
    tournaments() { return this.dashboard(); }
};

function render() {
    const content = document.getElementById('screen-content');
    const screen = STORE.currentScreen;
    content.innerHTML = (screen === 'details') ? Screens.details(STORE.activeId) : Screens[screen]();
}

document.addEventListener('DOMContentLoaded', () => router.navigate('dashboard'));
