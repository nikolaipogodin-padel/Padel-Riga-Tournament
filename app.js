const supabaseUrl = 'https://isioiadlnphqmjegltpj.supabase.co'
const supabaseKey = 'sb_publishable_QAACxPWom-eMFOql9dNC6Q_2nxbDd65'
const _supabase = supabase.createClient(supabaseUrl, supabaseKey)

const state = {
    user: JSON.parse(localStorage.getItem('padel_user')) || null
}

// Работа с фото
document.getElementById('avatar-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('avatar-preview').innerHTML = `<img src="${event.target.result}" class="w-full h-full object-cover rounded-full">`;
        };
        reader.readAsDataURL(file);
    }
});

const auth = {
    async signUp() {
        const firstName = document.getElementById('reg-firstname').value
        const lastName = document.getElementById('reg-lastname').value
        const phone = document.getElementById('reg-phone').value
        const gender = document.getElementById('reg-gender').value
        const level = document.getElementById('reg-level').value
        const password = document.getElementById('reg-password').value
        const btn = document.getElementById('reg-btn')

        if (!firstName || !lastName || !phone || !password) return alert('Заполните все данные')

        btn.innerText = "Создание..."
        btn.disabled = true

        const { data, error } = await _supabase
            .from('players')
            .insert([{ 
                name: `${firstName} ${lastName}`, 
                phone: `+371${phone}`, 
                gender, level, 
                created_at: new Date() 
            }])
            .select()

        if (error) {
            alert('Ошибка регистрации')
            btn.disabled = false
            btn.innerText = "Регистрация"
        } else {
            state.user = data[0]
            localStorage.setItem('padel_user', JSON.stringify(state.user))
            this.initApp()
        }
    },

    initApp() {
        if (state.user) {
            document.getElementById('p-name').innerText = state.user.name
            document.getElementById('p-id').innerText = `PRO PLAYER • ${state.user.level}`
            document.getElementById('status-badge').classList.remove('hidden')
            if(document.getElementById('live-my-pair')) document.getElementById('live-my-pair').innerText = state.user.name + " + ?"
            ui.renderTournaments()
            ui.navigate('screen-tournaments')
        } else {
            ui.navigate('screen-registration')
        }
    },

    logout() {
        localStorage.clear()
        location.reload()
    }
}

const ui = {
    navigate(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
        document.getElementById(screenId).classList.add('active')
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'))
        const navId = 'nav-' + screenId.split('-')[1]
        if (document.getElementById(navId)) document.getElementById(navId).classList.add('active')
        window.scrollTo(0,0)
    },

    renderTournaments() {
        const myContainer = document.getElementById('my-tournaments')
        const availContainer = document.getElementById('available-tournaments')

        // Активный турнир с обработчиками
        myContainer.innerHTML = `
            <div class="premium-card p-6 border-l-[6px] border-[#BFFF00] shadow-glow">
                <div class="flex justify-between items-center mb-5">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 bg-[#BFFF00] rounded-full"></span>
                        <span class="text-[#BFFF00] text-[9px] font-black uppercase tracking-[0.15em]">Live Now</span>
                    </div>
                    <span class="text-white/30 text-[9px] font-black uppercase">Court 2</span>
                </div>
                <h3 class="text-2xl font-black italic uppercase text-white leading-[0.9]">Evening<br>Padel Cup</h3>
                <div class="mt-6 flex gap-3">
                    <button onclick="ui.navigate('screen-live-match')" class="flex-[2.5] py-4 bg-[#BFFF00] text-black text-[11px] font-black rounded-2xl uppercase shadow-[0_10px_20px_rgba(191,255,0,0.2)] active:scale-95">Мой матч</button>
                    <button onclick="ui.navigate('screen-bracket')" class="flex-1 py-4 bg-white/5 text-white text-[11px] font-black rounded-2xl uppercase border border-white/10 active:scale-95">Сетка</button>
                </div>
            </div>
        `

        availContainer.innerHTML = `
            <div class="premium-card p-6 opacity-60">
                <div class="flex justify-between items-center mb-5">
                    <span class="text-white/40 text-[9px] font-black uppercase tracking-[0.15em]">Next: Tomorrow</span>
                    <span class="text-white/20 text-[9px] font-black uppercase">0/16 Players</span>
                </div>
                <h3 class="text-xl font-black italic uppercase text-white/50 leading-[0.9]">Morning<br>Session</h3>
                <button disabled class="w-full py-4 bg-white/5 text-white/20 text-[11px] font-black rounded-2xl uppercase mt-5 border border-white/5">Регистрация закрыта</button>
            </div>
        `
    }
}

window.onload = () => auth.initApp()
