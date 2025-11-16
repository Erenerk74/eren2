// Streak Freeze ve Combo Sistemi
console.log('🔥 Streak sistemi yüklendi');

const STREAK_REWARDS = {
    3: { xp: 50, coins: 20, badge: '🔥', title: '3 Günlük Ateş!' },
    7: { xp: 150, coins: 50, badge: '💥', title: '1 Haftalık Şampiyon!' },
    14: { xp: 300, coins: 100, badge: '⚡', title: '2 Haftalık Efsane!' },
    30: { xp: 1000, coins: 500, badge: '👑', title: '1 Aylık Kral!' },
    100: { xp: 5000, coins: 2000, badge: '🏆', title: '100 Günlük Tanrı!' }
};

function checkStreakMilestone() {
    if (!currentUser) return;
    
    const streak = currentUser.loginStreak || 0;
    const milestones = currentUser.streakMilestones || [];
    
    // Milestone kontrolü
    for (const [days, reward] of Object.entries(STREAK_REWARDS)) {
        if (streak >= parseInt(days) && !milestones.includes(days)) {
            milestones.push(days);
            currentUser.streakMilestones = milestones;
            
            // Ödül ver
            currentUser.xp = (currentUser.xp || 0) + reward.xp;
            currentUser.coins = (currentUser.coins || 0) + reward.coins;
            
            saveToStorage('currentUser', currentUser);
            updateUserInStorage(currentUser);
            
            showStreakMilestoneModal(reward, streak);
            checkAchievement('streak_master');
        }
    }
}

function showStreakMilestoneModal(reward, streak) {
    const modal = document.createElement('div');
    modal.className = 'modal active streak-milestone-modal';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
            <div style="font-size: 6rem; animation: bounce 1s ease infinite;">${reward.badge}</div>
            <h2 style="font-size: 2.5rem; margin: 1rem 0;">${reward.title}</h2>
            <div style="font-size: 5rem; font-weight: 700; margin: 2rem 0;">
                ${streak} GÜN! 🔥
            </div>
            <div class="reward-items" style="display: flex; justify-content: center; gap: 2rem; margin: 2rem 0;">
                <div style="background: rgba(255,255,255,0.2); padding: 1.5rem; border-radius: 16px;">
                    <div style="font-size: 2rem;">⚡</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">+${reward.xp} XP</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 1.5rem; border-radius: 16px;">
                    <div style="font-size: 2rem;">🪙</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">+${reward.coins} Coin</div>
                </div>
            </div>
            <p style="font-size: 1.2rem; opacity: 0.9; margin: 2rem 0;">
                İnanılmaz! ${streak} gün üst üste giriş yaptın! 🎉
            </p>
            <button class="btn-primary btn-full" onclick="this.closest('.modal').remove()" style="background: white; color: #f5576c; font-size: 1.2rem;">
                Muhteşem! 🚀
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    playSound('mega_reward');
    createConfetti();
    
    // Ekstra confetti
    setTimeout(() => createConfetti(), 500);
    setTimeout(() => createConfetti(), 1000);
}

// Streak Freeze (Seri Dondurma)
function buyStreakFreeze() {
    if (!currentUser) return;
    
    const cost = 500;
    if ((currentUser.coins || 0) < cost) {
        showToast('Yeterli coin yok! 500 coin gerekli', 'error');
        return;
    }
    
    currentUser.coins -= cost;
    currentUser.streakFreezes = (currentUser.streakFreezes || 0) + 1;
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    showToast('Streak Freeze satın alındı! 🧊', 'success');
    playSound('purchase');
}

function useStreakFreeze() {
    if (!currentUser) return;
    
    const freezes = currentUser.streakFreezes || 0;
    if (freezes <= 0) {
        showToast('Streak Freeze yok! Mağazadan satın al', 'error');
        return;
    }
    
    currentUser.streakFreezes = freezes - 1;
    currentUser.streakFreezeActive = true;
    currentUser.streakFreezeDate = new Date().toDateString();
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    showToast('Streak Freeze aktif! Bugün girmesen de serin devam eder 🧊', 'success');
}

// Combo Sistemi (Aynı gün içinde birden fazla senaryo)
function checkComboBonus() {
    if (!currentUser) return;
    
    const today = new Date().toDateString();
    const lastComboDate = currentUser.lastComboDate || '';
    
    if (lastComboDate !== today) {
        currentUser.dailyCombo = 1;
        currentUser.lastComboDate = today;
    } else {
        currentUser.dailyCombo = (currentUser.dailyCombo || 1) + 1;
    }
    
    const combo = currentUser.dailyCombo;
    
    // Combo bonusu (sessizce ver, bildirim gösterme)
    if (combo >= 3) {
        const bonusXP = combo * 10;
        const bonusCoins = combo * 2;
        
        currentUser.xp = (currentUser.xp || 0) + bonusXP;
        currentUser.coins = (currentUser.coins || 0) + bonusCoins;
        
        // Bildirim gösterme, sadece XP ver
        // showComboNotification(combo, bonusXP, bonusCoins);
    }
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
}

function showComboNotification(combo, xp, coins) {
    const notification = document.createElement('div');
    notification.className = 'combo-notification';
    notification.innerHTML = `
        <div class="combo-badge">
            <div class="combo-number">${combo}x</div>
            <div class="combo-text">COMBO!</div>
        </div>
        <div class="combo-rewards">
            +${xp} XP | +${coins} 🪙
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    playSound('combo');
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}
