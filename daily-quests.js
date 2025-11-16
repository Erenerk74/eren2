// Günlük Görevler Sistemi
console.log('📅 Günlük görevler sistemi yüklendi');

const DAILY_QUESTS = [
    {
        id: 'play_scenario',
        title: '1 Senaryo Oyna',
        description: 'Herhangi bir senaryoyu tamamla',
        icon: '🎮',
        target: 1,
        reward: { xp: 100, coins: 50 },
        type: 'scenario'
    },
    {
        id: 'play_3_scenarios',
        title: '3 Senaryo Oyna',
        description: '3 farklı senaryo tamamla',
        icon: '🎯',
        target: 3,
        reward: { xp: 300, coins: 150 },
        type: 'scenario'
    },
    {
        id: 'earn_500_xp',
        title: '500 XP Kazan',
        description: 'Bugün 500 XP topla',
        icon: '⚡',
        target: 500,
        reward: { xp: 200, coins: 100 },
        type: 'xp'
    },
    {
        id: 'play_mini_games',
        title: 'Tüm Mini Oyunları Oyna',
        description: 'Çark, Kazı Kazan ve Trivia\'yı oyna',
        icon: '🎲',
        target: 3,
        reward: { xp: 150, coins: 75 },
        type: 'minigame'
    },
    {
        id: 'make_5_combo',
        title: '5x Combo Yap',
        description: 'Aynı gün 5 senaryo oyna',
        icon: '💥',
        target: 5,
        reward: { xp: 250, coins: 125 },
        type: 'combo'
    },
    {
        id: 'visit_shop',
        title: 'Mağazayı Ziyaret Et',
        description: 'Mağazaya gir ve incele',
        icon: '🛒',
        target: 1,
        reward: { xp: 50, coins: 25 },
        type: 'shop'
    },
    {
        id: 'check_leaderboard',
        title: 'Liderliği Kontrol Et',
        description: 'Liderlik tablosunu aç',
        icon: '🏆',
        target: 1,
        reward: { xp: 50, coins: 25 },
        type: 'leaderboard'
    }
];

function initDailyQuests() {
    if (!currentUser) return;
    
    const today = new Date().toDateString();
    const lastQuestDate = currentUser.lastQuestDate || '';
    
    // Yeni gün mü?
    if (lastQuestDate !== today) {
        // Rastgele 5 görev seç
        const shuffled = [...DAILY_QUESTS].sort(() => 0.5 - Math.random());
        currentUser.dailyQuests = shuffled.slice(0, 5).map(q => ({
            ...q,
            progress: 0,
            completed: false
        }));
        currentUser.lastQuestDate = today;
        currentUser.dailyQuestsCompleted = 0;
        
        saveToStorage('currentUser', currentUser);
        updateUserInStorage(currentUser);
    }
}

function updateQuestProgress(type, amount = 1) {
    if (!currentUser || !currentUser.dailyQuests) return;
    
    let questCompleted = false;
    
    currentUser.dailyQuests.forEach(quest => {
        if (quest.type === type && !quest.completed) {
            quest.progress = Math.min(quest.progress + amount, quest.target);
            
            if (quest.progress >= quest.target && !quest.completed) {
                quest.completed = true;
                questCompleted = true;
                giveQuestReward(quest);
            }
        }
    });
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    // Tüm görevler tamamlandı mı?
    checkAllQuestsCompleted();
}

function giveQuestReward(quest) {
    if (!currentUser) return;
    
    currentUser.xp = (currentUser.xp || 0) + quest.reward.xp;
    currentUser.coins = (currentUser.coins || 0) + quest.reward.coins;
    currentUser.dailyQuestsCompleted = (currentUser.dailyQuestsCompleted || 0) + 1;
    
    checkLevelUp();
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    showQuestCompletedNotification(quest);
    
    // Başarı kontrolü
    if (currentUser.dailyQuestsCompleted >= 10) {
        checkAchievement('quest_master');
    }
}

function showQuestCompletedNotification(quest) {
    const notification = document.createElement('div');
    notification.className = 'quest-notification';
    notification.innerHTML = `
        <div class="quest-icon">${quest.icon}</div>
        <div class="quest-info">
            <div class="quest-title">Görev Tamamlandı!</div>
            <div class="quest-name">${quest.title}</div>
            <div class="quest-reward">+${quest.reward.xp} XP | +${quest.reward.coins} 🪙</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    playSound('quest_complete');
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

function checkAllQuestsCompleted() {
    if (!currentUser || !currentUser.dailyQuests) return;
    
    const allCompleted = currentUser.dailyQuests.every(q => q.completed);
    
    if (allCompleted && !currentUser.allQuestsCompletedToday) {
        currentUser.allQuestsCompletedToday = true;
        
        // Bonus ödül
        const bonusXP = 500;
        const bonusCoins = 250;
        
        currentUser.xp = (currentUser.xp || 0) + bonusXP;
        currentUser.coins = (currentUser.coins || 0) + bonusCoins;
        
        checkLevelUp();
        
        saveToStorage('currentUser', currentUser);
        updateUserInStorage(currentUser);
        
        showAllQuestsCompletedModal(bonusXP, bonusCoins);
        checkAchievement('daily_hero');
    }
}

function showAllQuestsCompletedModal(xp, coins) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; max-width: 500px;">
            <div style="font-size: 6rem; animation: bounce 1s ease infinite;">🎉</div>
            <h2 style="font-size: 2.5rem; margin: 1rem 0;">Tüm Görevler Tamamlandı!</h2>
            <p style="font-size: 1.2rem; opacity: 0.9; margin: 1rem 0;">
                Bugünün tüm görevlerini tamamladın!
            </p>
            <div style="background: rgba(255,255,255,0.2); padding: 2rem; border-radius: 16px; margin: 2rem 0;">
                <div style="font-size: 1rem; opacity: 0.9; margin-bottom: 0.5rem;">BONUS ÖDÜL</div>
                <div style="display: flex; justify-content: center; gap: 2rem;">
                    <div>
                        <div style="font-size: 2.5rem; font-weight: 700;">+${xp}</div>
                        <div style="font-size: 1rem;">XP</div>
                    </div>
                    <div>
                        <div style="font-size: 2.5rem; font-weight: 700;">+${coins}</div>
                        <div style="font-size: 1rem;">Coin</div>
                    </div>
                </div>
            </div>
            <p style="font-size: 1rem; opacity: 0.9;">
                Yarın yeni görevler seni bekliyor! 🚀
            </p>
            <button class="btn-primary btn-full" onclick="this.closest('.modal').remove()" style="background: white; color: #43e97b; margin-top: 2rem; font-size: 1.2rem;">
                Muhteşem! 🎊
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    playSound('mega_reward');
    createConfetti();
    setTimeout(() => createConfetti(), 500);
    setTimeout(() => createConfetti(), 1000);
}

function showDailyQuestsPanel() {
    if (!currentUser) return;
    
    initDailyQuests();
    
    const quests = currentUser.dailyQuests || [];
    const completedCount = quests.filter(q => q.completed).length;
    const totalCount = quests.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    const modal = document.createElement('div');
    modal.className = 'modal active quests-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%); backdrop-filter: blur(20px); color: white;">
            <h2 style="color: white;">📅 Günlük Görevler</h2>
            <p style="color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem;">
                Görevleri tamamla, ödül kazan! Tümünü bitir, bonus al!
            </p>
            
            <div class="quest-progress-box" style="background: rgba(255, 255, 255, 0.2); padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; border: 2px solid rgba(255, 255, 255, 0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <span style="font-weight: 600; color: white;">İlerleme</span>
                    <span style="font-weight: 700; color: white;">${completedCount}/${totalCount}</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.3); height: 12px; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%); height: 100%; width: ${progress}%; transition: width 0.5s; box-shadow: 0 0 10px rgba(67, 233, 123, 0.5);"></div>
                </div>
                ${completedCount === totalCount ? `
                    <div style="margin-top: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.3); border-radius: 12px; text-align: center; color: white; font-weight: 600; box-shadow: 0 0 20px rgba(67, 233, 123, 0.5);">
                        ✓ Tüm görevler tamamlandı! Bonus aldın! 🎉
                    </div>
                ` : ''}
            </div>
            
            <div class="quests-list" style="display: grid; gap: 1rem; max-height: 400px; overflow-y: auto;">
                ${quests.map(quest => `
                    <div class="quest-card ${quest.completed ? 'completed' : ''}" style="
                        background: rgba(255, 255, 255, 0.15);
                        backdrop-filter: blur(10px);
                        padding: 1.5rem;
                        border-radius: 12px;
                        border: 2px solid ${quest.completed ? 'rgba(67, 233, 123, 0.8)' : 'rgba(255, 255, 255, 0.3)'};
                        ${quest.completed ? 'box-shadow: 0 0 20px rgba(67, 233, 123, 0.3);' : ''}
                    ">
                        <div style="display: flex; gap: 1rem; align-items: start;">
                            <div style="font-size: 3rem;">${quest.icon}</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; margin-bottom: 0.25rem; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: white;">${quest.title}</span>
                                    ${quest.completed ? '<span style="color: #43e97b; font-size: 1.5rem;">✓</span>' : ''}
                                </div>
                                <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.8); margin-bottom: 0.75rem;">
                                    ${quest.description}
                                </div>
                                <div style="background: rgba(255, 255, 255, 0.1); padding: 0.5rem; border-radius: 8px; margin-bottom: 0.75rem;">
                                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem; color: white;">
                                        <span>İlerleme</span>
                                        <span style="font-weight: 600;">${quest.progress}/${quest.target}</span>
                                    </div>
                                    <div style="background: rgba(255, 255, 255, 0.2); height: 6px; border-radius: 6px; overflow: hidden;">
                                        <div style="background: ${quest.completed ? '#43e97b' : '#38f9d7'}; height: 100%; width: ${(quest.progress / quest.target) * 100}%; transition: width 0.3s; box-shadow: 0 0 10px ${quest.completed ? 'rgba(67, 233, 123, 0.5)' : 'rgba(56, 249, 215, 0.5)'};"></div>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 1rem; font-size: 0.9rem; font-weight: 600;">
                                    <span style="color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);">⚡ +${quest.reward.xp} XP</span>
                                    <span style="color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);">🪙 +${quest.reward.coins}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="modal-actions" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                <button class="btn-primary" style="background: white; color: #667eea; font-weight: bold; padding: 1rem 3rem; font-size: 1.1rem;" onclick="this.closest('.modal').remove()">
                    ✓ Kapat
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}
