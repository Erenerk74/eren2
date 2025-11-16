// Günlük Giriş Ödülü Sistemi
console.log('🎁 Günlük ödül sistemi yüklendi');

const DAILY_REWARDS = [
    { day: 1, xp: 50, coins: 10, badge: '🌟', title: '1. Gün' },
    { day: 2, xp: 75, coins: 15, badge: '⭐', title: '2. Gün' },
    { day: 3, xp: 100, coins: 20, badge: '💫', title: '3. Gün' },
    { day: 4, xp: 125, coins: 25, badge: '✨', title: '4. Gün' },
    { day: 5, xp: 150, coins: 30, badge: '🌠', title: '5. Gün' },
    { day: 6, xp: 200, coins: 40, badge: '🎆', title: '6. Gün' },
    { day: 7, xp: 300, coins: 100, badge: '🏆', title: '7. Gün - MEGA ÖDÜL!' }
];

function checkDailyReward() {
    if (!currentUser) return;
    
    const today = new Date().toDateString();
    const lastLogin = currentUser.lastLogin || '';
    const loginStreak = currentUser.loginStreak || 0;
    
    // Bugün zaten giriş yaptı mı?
    if (lastLogin === today) {
        return;
    }
    
    // Streak hesapla
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    let newStreak = 1;
    if (lastLogin === yesterdayStr) {
        newStreak = (loginStreak % 7) + 1;
    }
    
    // Kullanıcı bilgilerini güncelle
    currentUser.lastLogin = today;
    currentUser.loginStreak = newStreak;
    currentUser.coins = (currentUser.coins || 0) + DAILY_REWARDS[newStreak - 1].coins;
    currentUser.xp = (currentUser.xp || 0) + DAILY_REWARDS[newStreak - 1].xp;
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    // Ödül modalını göster
    showDailyRewardModal(newStreak);
}

function showDailyRewardModal(day) {
    const reward = DAILY_REWARDS[day - 1];
    
    const modal = document.createElement('div');
    modal.className = 'modal active daily-reward-modal';
    modal.innerHTML = `
        <div class="modal-content daily-reward-content">
            <div class="reward-animation">
                <div class="reward-badge">${reward.badge}</div>
                <div class="reward-sparkles">✨✨✨</div>
            </div>
            <h2>Günlük Giriş Ödülü!</h2>
            <p class="reward-day">${reward.title}</p>
            <div class="reward-items">
                <div class="reward-item">
                    <span class="reward-icon">⚡</span>
                    <span class="reward-value">+${reward.xp} XP</span>
                </div>
                <div class="reward-item">
                    <span class="reward-icon">🪙</span>
                    <span class="reward-value">+${reward.coins} Coin</span>
                </div>
            </div>
            <div class="streak-progress">
                <p>Giriş Serisi: ${day}/7 Gün</p>
                <div class="streak-bar">
                    ${Array.from({length: 7}, (_, i) => 
                        `<div class="streak-day ${i < day ? 'completed' : ''}">${DAILY_REWARDS[i].badge}</div>`
                    ).join('')}
                </div>
                ${day < 7 ? '<p class="streak-hint">Yarın da giriş yap ve ödülünü kaçırma! 🎯</p>' : 
                           '<p class="streak-hint mega">🎉 7 günlük seriyi tamamladın! Yarın yeni seri başlıyor!</p>'}
            </div>
            <button class="btn-primary btn-full" onclick="closeDailyRewardModal()">
                <span>Harika! 🎉</span>
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    playSound('reward');
    createConfetti();
}

function closeDailyRewardModal() {
    const modal = document.querySelector('.daily-reward-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function updateUserInStorage(user) {
    const users = getFromStorage('users') || [];
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
        users[index] = user;
        saveToStorage('users', users);
    }
}
