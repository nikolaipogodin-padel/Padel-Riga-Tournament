// 1. Инициализация Supabase
const supabaseUrl = 'https://isioiadlnphqmjegltpj.supabase.co'
const supabaseKey = 'sb_publishable_QAACxPWom-eMFOql9dNC6Q_2nxbDd65'
const _supabase = supabase.createClient(supabaseUrl, supabaseKey)

// 2. Управление состоянием (State)
const state = {
    user: JSON.parse(localStorage.getItem('padel_user')) || null
}

// 3. Модуль Аутентификации
const auth = {
    async signUp() {
        const name = document.getElementById('reg-name').value
        const phone = document.getElementById('reg-phone').value
        const btn = document.getElementById('reg-btn')

        if (!name || !phone) return alert('Заполни все поля!')

        btn.disabled = true
        btn.innerText = "Загрузка..."

        const { data, error } = await _supabase
            .from('players')
            .insert([{ name, phone }])
            .select()

        if (error) {
            console.error(error)
            alert('Ошибка БД. Таблица players существует?')
            btn.disabled = false
            btn.innerText = "Начать играть"
        } else {
            state.user = data[0]
            localStorage.setItem('padel_user', JSON.stringify(state.user))
            this.initProfile()
            ui.navigate('screen-tournaments')
        }
    },

    initProfile() {
        if (state.user) {
            document.getElementById('p-name').innerText = state.user.name
            document.getElementById('p-id').innerText = `ID: ${state.user.id}`
            document.getElementById('status-badge').classList.remove('hidden')
        }
    },

    logout() {
        localStorage.clear()
        location.reload()
    }
}

// 4. Модуль UI
const ui = {
    navigate(screenId) {
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
        // Показываем нужный
        document.getElementById(screenId).classList.add('active')
        
        // Обновляем иконки навигации
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'))
        const activeNav = document.getElementById('nav-' + screenId.split('-')[1])
        if (activeNav) activeNav.classList.add('active')
    }
}

// Запуск приложения
window.onload = () => {
    if (state.user) {
        auth.initProfile()
        ui.navigate('screen-tournaments')
    }
}
