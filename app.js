const supabaseUrl = 'https://isioiadlnphqmjegltpj.supabase.co'
const supabaseKey = 'sb_publishable_QAACxPWom-eMFOql9dNC6Q_2nxbDd65'
const _supabase = supabase.createClient(supabaseUrl, supabaseKey)

const state = {
    user: JSON.parse(localStorage.getItem('padel_user')) || null
}

const auth = {
    async signUp() {
        const firstName = document.getElementById('reg-firstname').value
        const lastName = document.getElementById('reg-lastname').value
        const phone = document.getElementById('reg-phone').value
        const gender = document.getElementById('reg-gender').value
        const level = document.getElementById('reg-level').value
        const password = document.getElementById('reg-password').value
        const btn = document.getElementById('reg-btn')

        if (!firstName || !lastName || !phone || !password) return alert('Заполните все поля')

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
        } else {
            state.user = data[0]
            localStorage.setItem('padel_user', JSON.stringify(state.user))
            this.initApp()
        }
    },

    initApp() {
        if (state.user) {
            document.getElementById('p-name').innerText = state.user.name
            document.getElementById('p-id').innerText = `PRO PLAYER • LEVEL ${state.user.level}`
            document.getElementById('status-badge').classList.remove('hidden')
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

        // Мой активный турнир
        myContainer.innerHTML = `
            <div class="premium-card p-6 border-l-[6px] border-[#BFFF00] pulse-glow">
                <div class="flex justify-between items-center mb-5">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 bg-[#BFFF00] rounded-full"></span>
                        <span class="text-[#BFFF00] text-[9px] font-black uppercase tracking-[0.15em]">Live Match</span>
                    </div>
                    <span class="text-white/30 text-[9px] font-black uppercase">Court 2</span>
                </div>
                <h3 class="text-2xl font-black italic uppercase text-white leading-[0.9]">Evening<br>Padel Cup</h3>
                <div class="mt-6 flex gap-3">
                    <button class="flex-[2.5] py-4 bg-[#BFFF00] text-black text-[11px] font-black rounded-2xl uppercase shadow-[0_10px_20px_rgba(191,255,0,0.2)]">Мой матч</button>
                    <button class="flex-1 py-4 bg-white/5 text-white text-[11px] font-black rounded-2xl uppercase border border-white/10">Сетка</button>
                </div>
            </div>
        `

        // Доступные турниры
        availContainer.innerHTML = `
            <div class="premium-card p-6 opacity-60">
                <div class="flex justify-between items-center mb-5">
                    <span class="text-white/40 text-[9px] font-black uppercase tracking-[0.15em]">Next: Tomorrow</span>
                    <span class="text-white/20 text-[9px] font-black uppercase">0/16 Players</span>
                </div>
                <h3 class="text-xl font-black italic uppercase text-white/50 leading-[0.9]">Morning<br>Session</h3>
                <button disabled class="w-full py-4 bg-white/5 text-white/20 text-[11px] font-black rounded-2xl uppercase mt-5 border border-white/5 font-italic">Регистрация закрыта</button>
            </div>
        `
    }
}

window.onload = () => auth.initApp()
