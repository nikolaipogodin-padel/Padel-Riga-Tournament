// --- STORE (Single Source of Truth) ---
const STORE = JSON.parse(localStorage.getItem('PADEL_DATA')) || {
    users: [],
    tournaments: [
        {
            id: 't1',
            title: 'Padel Weekend Riga',
            status: 'OPEN',
            maxPlayers: 16,
            participants: [], // Хранит только userId 
            totalTime: 120, 
            courts: 2,
            buffer: 5,
            rounds: 4
        }
    ],
    currentUser: null
};

const persist = () => localStorage.setItem('PADEL_DATA', JSON.stringify(STORE));

// --- VALIDATION LOGIC ---
const Validator = {
    // Regex для латвийских номеров (начинаются с +371 и далее 8 цифр) 
    phone: (val) => /^\+371\d{8}$/.test(val),
    
    validateForm: () => {
        const form = document.getElementById('reg-form');
        if (!form) return false;

        const data = {
            name: form.name.value.trim(),
            surname: form.surname.value.trim(),
            phone: form.phone.value.trim(),
            password: form.password.value.trim()
        };

        const isPhoneValid = Validator.phone(data.phone);
        const isAllFilled = Object.values(data).every(val => val.length > 0);

        // Показ/скрытие ошибки под полем телефона 
        const phoneError = document.getElementById('phone-error');
        if (data.phone.length > 4 && !isPhoneValid) {
            phoneError.classList.remove('hidden');
        } else {
            phoneError.classList.add('hidden');
        }

        // Кнопка активна только при полной валидности 
        const submitBtn = document.getElementById('submit-reg');
        submitBtn.disabled = !(isPhoneValid && isAllFilled);
    }
};

// --- RENDERING ---
const render = () => {
    const app = document.getElementById('app');
    
    if (router.currentPage === 'registration') {
        app.innerHTML = `
            <div class="flex flex-col items-center pt-10">
                <img src="logo.png" class="w-32 mb-6" alt="Padel Riga">
                <h1 class="text-2xl font-bold mb-8">Регистрация</h1>
                
                <form id="reg-form" class="w-full space-y-4" oninput="Validator.validateForm()">
                    <input name="name" type="text" placeholder="Имя">
                    <input name="surname" type="text" placeholder="Фамилия">
                    
                    <div>
                        <input name="phone" type="text" placeholder="Телефон (+371...)">
                        <p id="phone-error" class="error-msg hidden">Неверный формат телефона</p>
                    </div>

                    <div class="flex gap-4">
                        <select class="bg-[#2a2a2a] rounded-xl p-3 flex-1 border-none text-white">
                            <option>Уровень (1-5)</option>
                        </select>
                        <select class="bg-[#2a2a2a] rounded-xl p-3 flex-1 border-none text-white">
                            <option>Пол</option>
                        </select>
                    </div>

                    <input name="password" type="password" placeholder="Пароль">
                    
                    <button id="submit-reg" type="button" class="btn-primary mt-6" disabled>
                        Зарегистрироваться
                    </button>
                    
                    <p class="text-center text-sm text-gray-500 mt-4">
                        Уже есть аккаунт? <span class="text-[#dfff11] cursor-pointer" onclick="router.navigate('login')">Войти</span>
                    </p>
                </form>
            </div>
        `;
    }
    // ... остальные страницы (tournaments, profile)
};

const router = {
    currentPage: 'registration', // Для теста стартуем с регистрации
    navigate(page) {
        this.currentPage = page;
        render();
    }
};

render();
