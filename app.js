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

        if (!name || !phone) return alert('Заполни все поля!')

        // Сохраняем в Supabase
        const { data, error } = await _supabase
            .from('players')
            .insert([{ name, phone }])
            .select()

        if (error) {
            console.error(error)
            alert('Ошибка БД. Проверь, создал ли ты таблицу players!')
        } else {
            state.user = data[0]
            localStorage.setItem('padel_user', JSON.stringify(state.user))
            ui.navigate('screen-tournaments')
        }
    }
}

// 4. Модуль UI
const ui = {
    navigate(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
        document.getElementById(screenId).classList.add('active')
        
        // Обновляем иконки навигации
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'))
        // Логика подсветки кнопок...
    }
}

// Запуск приложения
window.onload = () => {
    if (state.user) {
        ui.navigate('screen-tournaments')
        document.getElementById('status-badge').classList.remove('hidden')
    }
}
