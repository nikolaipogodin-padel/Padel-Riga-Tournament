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

        if (!firstName || !lastName || !phone || !password) return alert('Заполните все данные')

        btn.innerText = "Создание аккаунта..."
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
            alert('Ошибка. Возможно, номер уже зарегистрирован.')
            btn.disabled = false; btn.innerText = "Регистрация"
        } else {
            state.user = data[0]
            localStorage.setItem('padel_user', JSON.stringify(state.user))
            this.initApp()
        }
    },

    initApp() {
        if (state.user) {
            document.getElementById('p-name').innerText = state.user.name
            document.getElementById('p-id').innerText = `ID: ${state.user.id} • ${state.user.level}`
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
    },

    renderTournaments() {
        const list = document.getElementById('tournament-list')
        list.innerHTML = `
            <div class="premium-card p-6 border-l-4 border-[#BFFF00] pulse-neon">
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 bg-[#BFFF00] rounded-full"></span>
                        <span class="text-[#BFFF00] text-[10px] font-black uppercase tracking-widest">Live Now</span>
                    </div>
                    <span class="text-gray-500 text-[10px] font-bold">16/16 PLAYERS</span>
                </div>
                <h3 class="text-2xl font-black italic uppercase text-white leading-tight">Evening<br>Padel Cup</h3>
                <p class="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Round Robin • Court 1-4</p>
                <div class="mt-6 flex gap-3">
                    <button class="flex-[2] py-4 bg-[#BFFF00] text-black text-[11px] font-black rounded-2xl uppercase shadow-[0_10px_20px_rgba(191,255,0,0.15)]">Мой матч</button>
                    <button class="flex-1 py-4 bg-white/5 text-white text-[11px] font-black rounded-2xl uppercase border border-white/10">Сетка</button>
                </div>
            </div>
        `
    }
}

window.onload = () => auth.initApp()
