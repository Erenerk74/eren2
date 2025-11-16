// 10 SAAT BAĞIMLILIK SİSTEMİ - ULTRA AGRESIF
console.log('🔥 10 Saat Bağımlılık Sistemi Yüklendi');

// Global bağımlılık durumu
window.addictionState = {
    sessionStart: Date.now(),
    totalClicks: 0,
    totalScrolls: 0,
    totalHovers: 0,
    consecutiveActions: 0,
    lastActionTime: Date.now(),
    comboMultiplier: 1,
    streakActive: false,
    pulseInterval: null,
    shakeInterval: null,
    glowInterval: null,
    soundInterval: null,
    popupInterval: null,
    urgencyLevel: 0,
    sessionMinutes: 0
};

// Oturum süresini takip et
setInterval(() => {
    addictionState.sessionMinutes = Math.floor((Date.now() - addictionState.sessionStart) / 60000);
    updateUrgencyLevel();
    
    // Her 5 dakikada bir bonus
    if (addictionState.sessionMinutes % 5 === 0 && addictionState.sessionMinutes > 0) {
        showTimeBonus(addictionState.sessionMinutes);
    }
}, 60000);

// Aciliyet seviyesini güncelle
function updateUrgencyLevel() {
    const minutes = addictionState.sessionMinutes;
    
    if (minutes < 30) addictionState.urgencyLevel = 1;
    else if (minutes < 60) addictionState.urgencyLevel = 2;
    else if (minutes < 120) addictionState.urgencyLevel = 3;
    else if (minutes < 240) addictionState.urgencyLevel = 4;
    else addictionState.urgencyLevel = 5;
    
    applyUrgencyEffects();
}

// Aciliyet efektlerini uygula
function applyUrgencyEffects() {
    const level = addictionState.urgencyLevel;
    
    // Seviye 2+: Daha sık bildirim
    if (level >= 2 && !addictionState.popupInterval) {
        addictionState.popupInterval = setInterval(() => {
            showRandomUrgentPopup();
        }, 120000 / level); // Seviye arttıkça daha sık
    }
    
    // Seviye 3+: Butonlar titresin
    if (level >= 3 && !addictionState.shakeInterval) {
        addictionState.shakeInterval = setInterval(() => {
            shakeAllButtons();
        }, 15000);
    }
    
    // Seviye 4+: Ses efektleri
    if (level >= 4 && !addictionState.soundInterval) {
        addictionState.soundInterval = setInterval(() => {
            playSound('notification');
        }, 30000);
    }
    
    // Seviye 5: ULTRA MOD
    if (level >= 5) {
        activateUltraMode();
    }
}

// Rastgele acil popup göster
function showRandomUrgentPopup() {
    const messages = [
        { title: '⚡ Hızlı Bonus!', text: 'Şimdi oyna, 2x XP kazan!', action: 'startScenario("basic")' },
        { title: '🎁 Sürpriz Hediye!', text: 'Günlük görevini tamamla!', action: 'showDailyQuestsPanel()' },
        { title: '🏆 Liderlikte Yüksel!', text: 'Bir senaryo daha oyna!', action: 'startScenario("basic")' },
        { title: '💎 Özel Fırsat!', text: 'Şans çarkını çevir!', action: 'showSpinWheel()' },
        { title: '🔥 Streak Kaybetme!', text: 'Günlük bonusunu al!', action: 'showDailyBonus()' },
        { title: '⏰ Son Şans!', text: 'Saatlik görev bitiyor!', action: 'showHourlyChallenges()' }
    ];
    
    const msg = messages[Math.floor(Math.random() * messages.length)];
    
    const popup = document.createElement('div');
    popup.className = 'urgent-popup';
    popup.innerHTML = `
        <div class="urgent-popup-content">
            <h3>${msg.title}</h3>
            <p>${msg.text}</p>
            <button class="btn-primary" onclick="${msg.action}; this.closest('.urgent-popup').remove();">
                Hemen Git! →
            </button>
            <button class="btn-text" onclick="this.closest('.urgent-popup').remove();">
                Sonra
            </button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Otomatik kapat
    setTimeout(() => {
        if (popup.parentNode) popup.remove();
    }, 8000);
    
    // Ses çal
    playSound('notification');
}

// Tüm butonları titret
function shakeAllButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .mini-game-card');
    buttons.forEach(btn => {
        btn.style.animation = 'shake 0.5s';
        setTimeout(() => {
            btn.style.animation = '';
        }, 500);
    });
}

// ULTRA MOD (4+ saat)
function activateUltraMode() {
    if (window.ultraModeActive) return;
    window.ultraModeActive = true;
    
    console.log('🔥🔥🔥 ULTRA MOD AKTİF! 🔥🔥🔥');
    
    // Ekran efektleri
    document.body.style.animation = 'rainbow-bg 10s infinite';
    
    // Sürekli konfeti
    setInterval(() => {
        if (typeof createConfetti === 'function') {
            createConfetti();
        }
    }, 30000);
    
    // Mega bildirim
    showToast('🔥 ULTRA MOD AKTİF! Her şey 3x hızlı!', 'success');
    
    // XP çarpanı
    if (window.gameState) {
        window.gameState.xpMultiplier = 3;
    }
}

// Zaman bonusu göster
function showTimeBonus(minutes) {
    const bonusXP = minutes * 10;
    
    if (typeof addXP === 'function') {
        addXP(bonusXP);
    }
    
    showToast(`⏰ ${minutes} Dakika Bonusu: +${bonusXP} XP!`, 'success');
    
    // Konfeti
    if (typeof createConfetti === 'function') {
        createConfetti();
    }
}

// Fare hareketi takibi
let mouseIdleTimer = null;
document.addEventListener('mousemove', () => {
    clearTimeout(mouseIdleTimer);
    
    // 30 saniye hareketsizlik
    mouseIdleTimer = setTimeout(() => {
        showIdleWarning();
    }, 30000);
});

// Hareketsizlik uyarısı
function showIdleWarning() {
    const warnings = [
        '👀 Hala orada mısın?',
        '⏰ Görevlerin seni bekliyor!',
        '🎮 Oyuna devam et!',
        '💎 Bonusları kaçırma!',
        '🔥 Streak\'in kopmasın!'
    ];
    
    const warning = warnings[Math.floor(Math.random() * warnings.length)];
    showToast(warning, 'warning');
    
    // Ekranı titret
    document.body.style.animation = 'shake 0.5s';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);
}

// Tıklama takibi
document.addEventListener('click', (e) => {
    addictionState.totalClicks++;
    addictionState.lastActionTime = Date.now();
    addictionState.consecutiveActions++;
    
    // Combo sistemi
    if (addictionState.consecutiveActions > 10) {
        addictionState.comboMultiplier = Math.min(5, 1 + Math.floor(addictionState.consecutiveActions / 10));
        showComboIndicator();
    }
    
    // Her 100 tıklamada bonus
    if (addictionState.totalClicks % 100 === 0) {
        showClickMilestone(addictionState.totalClicks);
    }
    
    // Rastgele mini ödül
    if (Math.random() < 0.05) { // %5 şans
        showRandomMicroReward();
    }
});

// Combo göstergesi
function showComboIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'combo-indicator';
    indicator.textContent = `🔥 ${addictionState.comboMultiplier}x COMBO!`;
    document.body.appendChild(indicator);
    
    setTimeout(() => indicator.remove(), 2000);
}

// Tıklama kilometre taşı
function showClickMilestone(clicks) {
    showToast(`🎯 ${clicks} Tıklama! +${clicks / 10} XP`, 'success');
    
    if (typeof addXP === 'function') {
        addXP(clicks / 10);
    }
}

// Rastgele mikro ödül
function showRandomMicroReward() {
    const rewards = [
        { text: '+5 XP', xp: 5 },
        { text: '+10 XP', xp: 10 },
        { text: '+15 XP', xp: 15 },
        { text: '🎁 Sürpriz!', xp: 20 }
    ];
    
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    if (typeof addXP === 'function') {
        addXP(reward.xp);
    }
    
    showFloatingReward(reward.text);
}

// Yüzen ödül göster
function showFloatingReward(text) {
    const reward = document.createElement('div');
    reward.className = 'floating-reward';
    reward.textContent = text;
    reward.style.left = Math.random() * window.innerWidth + 'px';
    reward.style.top = Math.random() * window.innerHeight + 'px';
    document.body.appendChild(reward);
    
    setTimeout(() => reward.remove(), 2000);
}

// Scroll takibi
let scrollCount = 0;
document.addEventListener('scroll', () => {
    scrollCount++;
    addictionState.totalScrolls++;
    
    if (scrollCount % 50 === 0) {
        showToast('📜 Aktif kullanıcı! +5 XP', 'info');
        if (typeof addXP === 'function') {
            addXP(5);
        }
    }
});

// Sayfa kapatma engelleme
window.addEventListener('beforeunload', (e) => {
    if (addictionState.sessionMinutes < 600) { // 10 saatten az
        e.preventDefault();
        e.returnValue = '⚠️ Emin misin? Tüm ilerlemen kaybolacak!';
        return e.returnValue;
    }
});

// Görünürlük değişimi
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Sekme gizlendi
        setTimeout(() => {
            if (document.hidden) {
                showNotification('🔔 Seni özledik!', 'Geri dön, ödüller seni bekliyor!');
            }
        }, 60000); // 1 dakika sonra
    } else {
        // Sekme göründü
        showToast('👋 Hoş geldin! +10 XP', 'success');
        if (typeof addXP === 'function') {
            addXP(10);
        }
    }
});

// Bildirim göster (tarayıcı bildirimi)
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🏙️</text></svg>'
        });
    }
}

// Bildirim izni iste
if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => {
        Notification.requestPermission();
    }, 30000); // 30 saniye sonra sor
}

// CSS ekle
const style = document.createElement('style');
style.textContent = `
    .urgent-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 100000;
        animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    .urgent-popup-content {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        text-align: center;
        min-width: 300px;
        animation: pulse 2s infinite;
    }
    
    .urgent-popup-content h3 {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
    }
    
    .urgent-popup-content p {
        margin: 0 0 1.5rem 0;
        font-size: 1.1rem;
    }
    
    .urgent-popup-content button {
        margin: 0.5rem;
    }
    
    .combo-indicator {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3rem;
        font-weight: bold;
        color: #f59e0b;
        text-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
        z-index: 99999;
        animation: comboAnim 2s ease-out;
        pointer-events: none;
    }
    
    .floating-reward {
        position: fixed;
        font-size: 1.5rem;
        font-weight: bold;
        color: #10b981;
        text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        z-index: 99999;
        animation: floatUp 2s ease-out;
        pointer-events: none;
    }
    
    @keyframes popIn {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes comboAnim {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
        }
    }
    
    @keyframes floatUp {
        0% {
            transform: translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px);
            opacity: 0;
        }
    }
    
    @keyframes rainbow-bg {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

console.log('✅ Bağımlılık sistemi hazır!');
