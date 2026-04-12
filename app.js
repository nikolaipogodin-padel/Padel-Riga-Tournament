// --- Tournament Engine (v7.0) ---

// Функция расчета времени
const calculateTournament = (tour) => {
    const rounds = Math.ceil(tour.maxPlayers / 4); // Базовая логика: 4 игрока на корт за тур
    const totalBuffer = tour.buffer * (rounds - 1);
    const tourDuration = Math.floor((tour.totalTime - totalBuffer) / rounds);
    return { rounds, tourDuration };
};

// Балансировка и создание пар
const generatePairs = (participants) => {
    // Сортируем по уровню (условно: A=4, B=3, C=2, D=1)
    const levelMap = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
    const sorted = [...participants].sort((a, b) => levelMap[b.level] - levelMap[a.level]);
    
    const pairs = [];
    // Стратегия: Сильный + Слабый (для баланса) или по порядку (для честной игры)
    // В v7.0 реализуем баланс "Змейкой" для среднего уровня
    while(sorted.length >= 2) {
        const p1 = sorted.shift();
        const p2 = sorted.pop();
        pairs.push({
            pairId: generateId('pair'),
            players: [p1.id, p2.id],
            avgLevel: (levelMap[p1.level] + levelMap[p2.level]) / 2
        });
    }
    return pairs;
};

// Живая валидация для регистрации
window.validateRegForm = () => {
    const form = document.getElementById('reg-form');
    const btn = document.getElementById('reg-btn');
    if (!form || !btn) return;

    const data = Object.fromEntries(new FormData(form));
    const isValid = data.firstName?.length > 1 && 
                    data.lastName?.length > 1 && 
                    /^\+?[0-9]{8,15}$/.test(data.phone) &&
                    data.password === data.passwordRepeat &&
                    data.password?.length > 5;

    btn.disabled = !isValid;
};
