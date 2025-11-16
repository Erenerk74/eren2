// Anlık Geri Bildirim Sistemi
console.log('⚡ Anlık geri bildirim sistemi yüklendi');

// Kullanıcı aktivitelerini takip et ve anında ödüllendir
let activityStreak = 0;
let lastActivityTime = Date.now();

// Mikro ödüller
const MICRO_REWARDS = {
    click: { xp: 1, message: '+1 XP! 🎯' },
    hover: { xp: 0, message: 'Keşfediyorsun! 👀' },
    scroll: { xp: 1, message: '+1 XP! 📜' },
    read: { xp: 2, message: '+2 XP! 📖' },
    complete: { xp: 5, message: '+5 XP! ✅' }
};

// Aktivite sayacı
let activityCount = {
    clicks: 0,
    hovers: 0,
    scrolls: 0,
    total: 0
};

// Her tıklamada mikro ödül
document.addEventListener('click', (e) => {
    if (!currentUser) return;
    
    activityCount.clicks++;
    activityCount.total++;
    
    // Her 10 tıklamada bir ödül
    if (activityCount.clicks % 10 === 0) {
        giveMicroReward('click');
    }
    
    // Aktivite streak'i artır
    updateActivityStreak();
});

// Scroll'da mikro ödül
let scrollTimeout;
document.addEventListener('scroll', () => {
    if (!currentUser) return;
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        activityCount.scrolls++;
        activityCount.total++;
        
        if (activityCount.scrolls % 20 === 0) {
            giveMicroReward('scroll');
        }
    }, 500);
});

// Mikro ödül ver
function giveMicroReward(type) {
    const reward = MICRO_REWARDS[type];
    if (!reward || !currentUser) return;
    
    if (reward.xp > 0) {
        currentUser.xp = (currentUser.xp || 0) + reward.xp;
        saveToStorage('currentUser', currentUser);
        updateUserInStorage(currentUser);
    }
    
    showMicroReward(reward.message);
}

// Mikro ödül göster
function showMicroReward(message) {
    const reward = document.createElement('div');
    reward.className = 'micro-reward';
    reward.textContent = message;
    reward.style.cssText = `
        position: fixed;
        top: 20%;
        right: 2rem;
        background: rgba(99, 102, 241, 0.9);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 10004;
        animation: microRewardAnim 2s ease-out forwards;
        pointer-events: none;
    `;
    
    document.body.appendChild(reward);
    setTimeout(() => reward.remove(), 2000);
}

// Aktivite streak güncelle
function updateActivityStreak() {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTime;
    
    // 5 saniye içinde aktivite varsa streak devam
    if (timeSinceLastActivity < 5000) {
        activityStreak++;
        
        // Her 50 aktivitede bonus
        if (activityStreak % 50 === 0) {
            showStreakBonus(activityStreak);
        }
    } else {
        activityStreak = 1;
    }
    
    lastActivityTime = now;
}

// Streak bonusu göster
function showStreakBonus(streak) {
    if (!currentUser) return;
    
    const bonusXP = Math.floor(streak / 10);
    currentUser.xp = (currentUser.xp || 0) + bonusXP;
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    const bonus = document.createElement('div');
    bonus.className = 'streak-bonus';
    bonus.innerHTML = `
        <div style="font-size: 2rem;">🔥</div>
        <div style="font-weight: 700;">${streak} Aktivite Streak!</div>
        <div style="font-size: 0.9rem;">+${bonusXP} Bonus XP</div>
    `;
    bonus.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 2rem;
        border-radius: 16px;
        text-align: center;
        z-index: 10005;
        animation: scaleIn 0.5s ease;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    `;
    
    document.body.appendChild(bonus);
    playSound('streak');
    
    setTimeout(() => {
        bonus.style.animation = 'scaleOut 0.5s ease';
        setTimeout(() => bonus.remove(), 500);
    }, 3000);
}

// Sayfa görünürlüğü değiştiğinde
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Sayfa gizlendi
        if (currentUser) {
            currentUser.lastHiddenTime = Date.now();
            saveToStorage('currentUser', currentUser);
        }
    } else {
        // Sayfa tekrar görünür oldu
        if (currentUser && currentUser.lastHiddenTime) {
            const hiddenDuration = Date.now() - currentUser.lastHiddenTime;
            
            // 1 dakikadan az gizli kaldıysa hoş geldin mesajı
            if (hiddenDuration < 60000) {
                showQuickWelcomeBack();
            }
        }
    }
});

// Hızlı hoş geldin mesajı
function showQuickWelcomeBack() {
    const message = document.createElement('div');
    message.className = 'quick-welcome';
    message.innerHTML = `
        <span style="font-size: 1.5rem;">👋</span>
        <span style="margin-left: 0.5rem;">Tekrar hoş geldin!</span>
    `;
    message.style.cssText = `
        position: fixed;
        top: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(99, 102, 241, 0.95);
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10004;
        animation: slideDown 0.5s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideUp 0.5s ease';
        setTimeout(() => message.remove(), 500);
    }, 2000);
}

// CSS animasyonları
const style = document.createElement('style');
style.textContent = `
    @keyframes microRewardAnim {
        0% {
            opacity: 0;
            transform: translateY(20px);
        }
        20% {
            opacity: 1;
            transform: translateY(0);
        }
        80% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
    
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes scaleOut {
        from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%);
        }
    }
`;
document.head.appendChild(style);

// Aktivite istatistikleri göster
function showActivityStats() {
    if (!currentUser) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <h2>📊 Aktivite İstatistikleri</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                Bu oturumda ne kadar aktifsin!
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary-color);">${activityCount.clicks}</div>
                    <div style="color: var(--text-secondary);">Tıklama</div>
                </div>
                <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 2.5rem; font-weight: 700; color: var(--success-color);">${activityCount.scrolls}</div>
                    <div style="color: var(--text-secondary);">Scroll</div>
                </div>
                <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 2.5rem; font-weight: 700; color: var(--warning-color);">${activityStreak}</div>
                    <div style="color: var(--text-secondary);">Streak</div>
                </div>
                <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 2.5rem; font-weight: 700; color: var(--danger-color);">${activityCount.total}</div>
                    <div style="color: var(--text-secondary);">Toplam</div>
                </div>
            </div>
            
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
                Aktif kalarak daha fazla XP kazan! 🚀
            </p>
            
            <button class="btn-primary btn-full" onclick="this.closest('.modal').remove()">
                Harika! 🎉
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

console.log('✅ Anlık geri bildirim aktif - Her aktivite ödüllendirilecek!');
