// Saatlik Challenge Sistemi
console.log('⏰ Saatlik challenge sistemi yüklendi');

const HOURLY_CHALLENGES = [
    { id: 'play_3', title: '3 Senaryo Oyna', target: 3, reward: { xp: 200, coins: 100 }, icon: '🎮' },
    { id: 'earn_500xp', title: '500 XP Kazan', target: 500, reward: { xp: 150, coins: 75 }, icon: '⚡' },
    { id: 'click_100', title: '100 Tıklama Yap', target: 100, reward: { xp: 100, coins: 50 }, icon: '👆' },
    { id: 'combo_10', title: '10x Combo Yap', target: 10, reward: { xp: 300, coins: 150 }, icon: '💥' },
    { id: 'visit_all', title: 'Tüm Bölümleri Ziyaret Et', target: 5, reward: { xp: 250, coins: 125 }, icon: '🗺️' }
];

function initHourlyChallenge() {
    if (!currentUser) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    const lastChallengeHour = currentUser.lastChallengeHour || -1;
    
    // Yeni saat başladı mı?
    if (currentHour !== lastChallengeHour) {
        // Rastgele challenge seç
        const challenge = HOURLY_CHALLENGES[Math.floor(Math.random() * HOURLY_CHALLENGES.length)];
        
        currentUser.hourlyChallenge = {
            ...challenge,
            progress: 0,
            completed: false,
            startTime: now.getTime(),
            endTime: now.getTime() + 3600000 // 1 saat
        };
        currentUser.lastChallengeHour = currentHour;
        
        saveToStorage('currentUser', currentUser);
        updateUserInStorage(currentUser);
        
        // Challenge başladı bildirimi
        setTimeout(() => showHourlyChallengeStart(), 2000);
    }
    
    // Challenge süresi doldu mu kontrol et
    if (currentUser.hourlyChallenge && !currentUser.hourlyChallenge.completed) {
        if (now.getTime() > currentUser.hourlyChallenge.endTime) {
            // Challenge başarısız
            showChallengeExpired();
            currentUser.hourlyChallenge = null;
            saveToStorage('currentUser', currentUser);
            updateUserInStorage(currentUser);
        }
    }
}

function showHourlyChallengeStart() {
    if (!currentUser || !currentUser.hourlyChallenge) return;
    
    const challenge = currentUser.hourlyChallenge;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; max-width: 500px;">
            <div style="font-size: 5rem; animation: bounce 1s ease infinite;">⏰</div>
            <h2 style="font-size: 2rem; margin: 1rem 0;">Saatlik Challenge!</h2>
            <div style="font-size: 3rem; margin: 2rem 0;">${challenge.icon}</div>
            <h3 style="font-size: 1.5rem; margin: 1rem 0;">${challenge.title}</h3>
            <p style="font-size: 1.1rem; opacity: 0.9; margin: 1rem 0;">
                1 saat içinde tamamla!
            </p>
            <div style="background: rgba(255,255,255,0.2); padding: 1.5rem; border-radius: 12px; margin: 2rem 0;">
                <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.5rem;">Ödül</div>
                <div style="display: flex; justify-content: center; gap: 2rem;">
                    <div>
                        <div style="font-size: 2rem; font-weight: 700;">+${challenge.reward.xp}</div>
                        <div style="font-size: 0.9rem;">XP</div>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: 700;">+${challenge.reward.coins}</div>
                        <div style="font-size: 0.9rem;">Coin</div>
                    </div>
                </div>
            </div>
            <div style="font-size: 0.9rem; opacity: 0.8;">
                ⏱️ Kalan süre: <span id="challenge-timer">60:00</span>
            </div>
            <button class="btn-primary btn-full" onclick="this.closest('.modal').remove(); startChallengeTracking();" style="background: white; color: #f5576c; margin-top: 2rem;">
                Hadi Başlayalım! 🚀
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    playSound('challenge_start');
    
    // Timer başlat
    startChallengeTimer();
}

function startChallengeTimer() {
    const timerEl = document.getElementById('challenge-timer');
    if (!timerEl || !currentUser || !currentUser.hourlyChallenge) return;
    
    const interval = setInterval(() => {
        if (!currentUser || !currentUser.hourlyChallenge) {
            clearInterval(interval);
            return;
        }
        
        const remaining = currentUser.hourlyChallenge.endTime - Date.now();
        if (remaining <= 0) {
            clearInterval(interval);
            if (timerEl) timerEl.textContent = '00:00';
            return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        if (timerEl) timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function startChallengeTracking() {
    // Challenge takibini başlat
    showChallengeProgress();
}

function updateChallengeProgress(type, amount = 1) {
    if (!currentUser || !currentUser.hourlyChallenge || currentUser.hourlyChallenge.completed) return;
    
    const challenge = currentUser.hourlyChallenge;
    
    // Challenge tipine göre ilerleme
    if ((challenge.id === 'play_3' && type === 'scenario') ||
        (challenge.id === 'earn_500xp' && type === 'xp') ||
        (challenge.id === 'click_100' && type === 'click') ||
        (challenge.id === 'combo_10' && type === 'combo') ||
        (challenge.id === 'visit_all' && type === 'visit')) {
        
        challenge.progress += amount;
        
        // Tamamlandı mı?
        if (challenge.progress >= challenge.target) {
            challenge.completed = true;
            completeChallengeReward();
        }
        
        saveToStorage('currentUser', currentUser);
        updateUserInStorage(currentUser);
        
        // Progress güncelle
        updateChallengeProgressUI();
    }
}

function completeChallengeReward() {
    if (!currentUser || !currentUser.hourlyChallenge) return;
    
    const challenge = currentUser.hourlyChallenge;
    
    currentUser.xp = (currentUser.xp || 0) + challenge.reward.xp;
    currentUser.coins = (currentUser.coins || 0) + challenge.reward.coins;
    
    checkLevelUp();
    checkAchievement('challenge_master');
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    showChallengeCompleted(challenge);
}

function showChallengeCompleted(challenge) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; max-width: 500px;">
            <div style="font-size: 6rem; animation: bounce 1s ease infinite;">🏆</div>
            <h2 style="font-size: 2.5rem; margin: 1rem 0;">Challenge Tamamlandı!</h2>
            <div style="font-size: 3rem; margin: 1rem 0;">${challenge.icon}</div>
            <h3 style="font-size: 1.5rem; margin: 1rem 0;">${challenge.title}</h3>
            <div style="background: rgba(255,255,255,0.2); padding: 2rem; border-radius: 12px; margin: 2rem 0;">
                <div style="display: flex; justify-content: center; gap: 2rem;">
                    <div>
                        <div style="font-size: 3rem; font-weight: 700;">+${challenge.reward.xp}</div>
                        <div style="font-size: 1rem;">XP</div>
                    </div>
                    <div>
                        <div style="font-size: 3rem; font-weight: 700;">+${challenge.reward.coins}</div>
                        <div style="font-size: 1rem;">Coin</div>
                    </div>
                </div>
            </div>
            <p style="font-size: 1.2rem; opacity: 0.9;">
                Muhteşem! Bir sonraki challenge 1 saat sonra! ⏰
            </p>
            <button class="btn-primary btn-full" onclick="this.closest('.modal').remove()" style="background: white; color: #43e97b; margin-top: 2rem; font-size: 1.2rem;">
                Harika! 🎉
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    playSound('mega_reward');
    createConfetti();
    setTimeout(() => createConfetti(), 500);
    setTimeout(() => createConfetti(), 1000);
}

function showChallengeProgress() {
    if (!currentUser || !currentUser.hourlyChallenge) return;
    
    const challenge = currentUser.hourlyChallenge;
    const progress = Math.min((challenge.progress / challenge.target) * 100, 100);
    const remaining = challenge.endTime - Date.now();
    const minutes = Math.floor(remaining / 60000);
    
    const widget = document.createElement('div');
    widget.id = 'challenge-widget';
    widget.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 2rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        z-index: 9999;
        min-width: 250px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        cursor: pointer;
    `;
    
    widget.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
            <span style="font-size: 2rem;">${challenge.icon}</span>
            <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 0.9rem;">${challenge.title}</div>
                <div style="font-size: 0.8rem; opacity: 0.9;">⏱️ ${minutes} dakika kaldı</div>
            </div>
        </div>
        <div style="background: rgba(255,255,255,0.3); height: 8px; border-radius: 8px; overflow: hidden;">
            <div style="background: white; height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
        </div>
        <div style="font-size: 0.8rem; margin-top: 0.5rem; text-align: center;">
            ${challenge.progress} / ${challenge.target}
        </div>
    `;
    
    widget.onclick = () => showChallengeDetails();
    
    // Eski widget'ı kaldır
    const oldWidget = document.getElementById('challenge-widget');
    if (oldWidget) oldWidget.remove();
    
    document.body.appendChild(widget);
}

function updateChallengeProgressUI() {
    const widget = document.getElementById('challenge-widget');
    if (widget) {
        widget.remove();
        showChallengeProgress();
    }
}

function showChallengeDetails() {
    if (!currentUser || !currentUser.hourlyChallenge) return;
    
    const challenge = currentUser.hourlyChallenge;
    const progress = Math.min((challenge.progress / challenge.target) * 100, 100);
    const remaining = challenge.endTime - Date.now();
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <h2>⏰ Saatlik Challenge</h2>
            <div style="font-size: 4rem; margin: 1rem 0;">${challenge.icon}</div>
            <h3 style="font-size: 1.5rem; margin: 1rem 0; color: var(--text-primary);">${challenge.title}</h3>
            
            <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; margin: 2rem 0;">
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">İlerleme</div>
                <div style="font-size: 3rem; font-weight: 700; color: var(--primary-color); margin-bottom: 1rem;">
                    ${challenge.progress} / ${challenge.target}
                </div>
                <div style="background: var(--border-color); height: 12px; border-radius: 12px; overflow: hidden;">
                    <div style="background: var(--gradient-1); height: 100%; width: ${progress}%; transition: width 0.5s;"></div>
                </div>
            </div>
            
            <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Kalan Süre</div>
                <div style="font-size: 2.5rem; font-weight: 700; color: var(--warning-color);">
                    ${minutes}:${seconds.toString().padStart(2, '0')}
                </div>
            </div>
            
            <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">Ödül</div>
                <div style="display: flex; justify-content: center; gap: 2rem;">
                    <div>
                        <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">+${challenge.reward.xp}</div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">XP</div>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: 700; color: var(--warning-color);">+${challenge.reward.coins}</div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">Coin</div>
                    </div>
                </div>
            </div>
            
            <button class="btn-primary btn-full" onclick="this.closest('.modal').remove()">
                Devam Et! 💪
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showChallengeExpired() {
    const notification = document.createElement('div');
    notification.className = 'challenge-expired';
    notification.innerHTML = `
        <div style="font-size: 2rem;">⏰</div>
        <div>
            <div style="font-weight: 700;">Challenge Süresi Doldu!</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">Yeni challenge 1 saat sonra</div>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: rgba(239, 68, 68, 0.95);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 10004;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: slideInRight 0.5s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Sayfa yüklendiğinde başlat
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (currentUser) {
                initHourlyChallenge();
            }
        }, 3000);
    });
}

console.log('✅ Saatlik challenge sistemi hazır!');
