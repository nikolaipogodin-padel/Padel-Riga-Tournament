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

        if (!firstName || !lastName || !phone || !password || !gender) {
            return alert('Пожалуйста, заполни все поля')
        }

        btn.innerText = "Сохранение..."
        btn.disabled = true

        const fullName = `${firstName} ${lastName}`
        const fullPhone = `+371${phone}`

        const { data, error } = await _supabase
            .from('players')
            .insert([{ 
                name: fullName, 
                phone: fullPhone, 
                gender: gender, 
                level: level,
                // Пароль пока храним в открытом поле для MVP
                created_at: new Date()
            }])
            .select()

        if (error) {
            alert('Ошибка регистрации')
            btn.innerText = "Регистрация"
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
        const activeNav = document.getElementById(navId)
        if (activeNav) activeNav.classList.add('active')
    },

    renderTournaments() {
        const list = document.getElementById('tournament-list')
        list.innerHTML = `
            <div class="premium-card p-5 border-l-4 border-[#BFFF00]">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-[#BFFF00] text-[10px] font-black uppercase pulse">● Active now</span>
                    <span class="text-gray-500 text-[10px] font-bold">16/16 PLAYERS</span>
                </div>
                <h3 class="text-xl font-black italic uppercase text-white">Evening Padel Cup</h3>
                <div class="mt-4 flex gap-2">
                    <button class="flex-1 py-3 bg-[#BFFF00] text-black text-[11px] font-black rounded-xl uppercase">Мой матч</button>
                    <button class="flex-1 py-3 bg-white/5 text-white text-[11px] font-black rounded-xl uppercase border border-white/10">Сетка</button>
                </div>
            </div>
        `
    }
}

window.onload = () => auth.initApp()
