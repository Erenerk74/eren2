// Gelişmiş Oyun Özellikleri

// Seviye ve XP Sistemi
let playerLevel = {
    level: 1,
    xp: 0,
    xpToNextLevel: 100
};

function addXP(amount) {
    playerLevel.xp += amount;
    
    while (playerLevel.xp >= playerLevel.xpToNextLevel) {
        playerLevel.xp -= playerLevel.xpToNextLevel;
        playerLevel.level++;
        playerLevel.xpToNextLevel = Math.floor(playerLevel.xpToNextLevel * 1.5);
        
        showToast(`🎉 Seviye ${playerLevel.level}! Tebrikler!`, 'success');
        unlockNewFeatures(playerLevel.level);
    }
    
    updateLevelDisplay();
    savePlayerProgress();
}

function updateLevelDisplay() {
    const levelDisplay = document.getElementById('player-level');
    const xpBar = document.getElementById('xp-bar');
    
    if (levelDisplay) {
        levelDisplay.textContent = `Seviye ${playerLevel.level}`;
    }
    
    if (xpBar) {
        const percentage = (playerLevel.xp / playerLevel.xpToNextLevel) * 100;
        xpBar.style.width = percentage + '%';
    }
}

function unlockNewFeatures(level) {
    const unlocks = {
        2: 'Rastgele Olaylar',
        3: 'İleri Seviye Senaryo',
        5: 'Quiz Modu',
        7: 'Turnuva Modu',
        10: 'Özel Rozetler'
    };
    
    if (unlocks[level]) {
        showToast(`🔓 Yeni özellik açıldı: ${unlocks[level]}!`, 'success');
    }
}

// Başarı Sistemi
const achievements = {
    first_game: { name: '🎮 İlk Oyun', desc: 'İlk senaryonu tamamla', unlocked: false },
    eco_warrior: { name: '🌱 Eko Savaşçı', desc: '3 sürdürülebilir şehir kur', unlocked: false, count: 0 },
    speed_runner: { name: '⚡ Hızlı Karar', desc: '5 dakikada senaryo tamamla', unlocked: false },
    perfectionist: { name: '💯 Mükemmeliyetçi', desc: 'Tüm göstergeleri maksimuma çıkar', unlocked: false },
    teacher_pet: { name: '👨‍🏫 Öğretmen Dostu', desc: 'Bir sınıfa katıl', unlocked: false },
    social_butterfly: { name: '🦋 Sosyal Kelebek', desc: '5 arkadaş ekle', unlocked: false, count: 0 },
    quiz_master: { name: '🧠 Quiz Ustası', desc: '10 quiz sorusunu doğru cevapla', unlocked: false, count: 0 },
    daily_player: { name: '📅 Günlük Oyuncu', desc: '7 gün üst üste giriş yap', unlocked: false, streak: 0 },
    badge_collector: { name: '🏆 Rozet Koleksiyoncusu', desc: '10 rozet kazan', unlocked: false },
    scenario_master: { name: '🎯 Senaryo Ustası', desc: '20 senaryo tamamla', unlocked: false }
};

function checkAchievement(achievementId, value = null) {
    const achievement = achievements[achievementId];
    if (!achievement || achievement.unlocked) return;
    
    let unlock = false;
    
    switch(achievementId) {
        case 'first_game':
            unlock = true;
            break;
        case 'eco_warrior':
            achievement.count = (achievement.count || 0) + 1;
            unlock = achievement.count >= 3;
            break;
        case 'quiz_master':
            achievement.count = (achievement.count || 0) + 1;
            unlock = achievement.count >= 10;
            break;
        case 'social_butterfly':
            achievement.count = value || 0;
            unlock = achievement.count >= 5;
            break;
        default:
            unlock = value === true;
    }
    
    if (unlock) {
        achievement.unlocked = true;
        showAchievementUnlock(achievement);
        addXP(50);
    }
    
    saveAchievements();
}

function showAchievementUnlock(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-unlock';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.name.split(' ')[0]}</div>
        <div class="achievement-info">
            <h4>Başarı Açıldı!</h4>
            <p>${achievement.name}</p>
            <small>${achievement.desc}</small>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
}

function saveAchievements() {
    saveToStorage('achievements', achievements);
}

function loadAchievements() {
    const saved = getFromStorage('achievements');
    if (saved) {
        Object.assign(achievements, saved);
    }
}

// Rastgele Olaylar Sistemi
const randomEvents = [
    {
        id: 'earthquake',
        name: '🌍 Deprem',
        desc: 'Şehirde 5.5 büyüklüğünde deprem! Eski binalar hasar gördü.',
        effects: { quality: -1, economy: -1 },
        choices: [
            { text: 'Acil yardım ve onarım', cost: 'Yüksek', effect: { quality: +1 } },
            { text: 'Sadece kritik onarımlar', cost: 'Orta', effect: {} },
            { text: 'Vatandaşlar kendi halletsin', cost: 'Yok', effect: { quality: -1 } }
        ]
    },
    {
        id: 'heatwave',
        name: '🌡️ Sıcak Hava Dalgası',
        desc: 'Rekor sıcaklıklar! Elektrik talebi arttı, yaşlılar risk altında.',
        effects: { quality: -1 },
        choices: [
            { text: 'Ücretsiz klima dağıt', cost: 'Yüksek', effect: { quality: +2 } },
            { text: 'Soğutma merkezleri aç', cost: 'Orta', effect: { quality: +1 } },
            { text: 'Uyarı yap, geçer', cost: 'Yok', effect: { quality: -1 } }
        ]
    },
    {
        id: 'pandemic',
        name: '🦠 Salgın',
        desc: 'Yeni bir grip salgını başladı. Hastaneler dolmaya başladı.',
        effects: { quality: -2, economy: -1 },
        choices: [
            { text: 'Tam kapanma', cost: 'Çok Yüksek', effect: { quality: +1, economy: -2 } },
            { text: 'Kısmi önlemler', cost: 'Orta', effect: { quality: 0, economy: -1 } },
            { text: 'Hayat normale devam', cost: 'Yok', effect: { quality: -2 } }
        ]
    },
    {
        id: 'investment',
        name: '💼 Yatırım Teklifi',
        desc: 'Büyük bir şirket şehrinize fabrika açmak istiyor.',
        effects: { economy: +2 },
        choices: [
            { text: 'Kabul et, teşvik ver', effect: { economy: +3, air: -1 } },
            { text: 'Çevre koşullarıyla kabul', effect: { economy: +2 } },
            { text: 'Reddet', effect: { economy: 0 } }
        ]
    },
    {
        id: 'protest',
        name: '📢 Protesto',
        desc: 'Vatandaşlar yeşil alanların korunması için sokağa çıktı.',
        effects: { quality: -1 },
        choices: [
            { text: 'Talepleri kabul et', effect: { quality: +2, green: +2 } },
            { text: 'Müzakere et', effect: { quality: +1 } },
            { text: 'Görmezden gel', effect: { quality: -2 } }
        ]
    }
];

function triggerRandomEvent() {
    if (Math.random() > 0.3) return; // %30 şans
    
    const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    showRandomEventModal(event);
}

function showRandomEventModal(event) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content event-modal">
            <div class="event-icon">${event.name.split(' ')[0]}</div>
            <h2>${event.name}</h2>
            <p>${event.desc}</p>
            <div class="event-choices">
                ${event.choices.map((choice, i) => `
                    <button class="btn-primary event-choice" onclick="handleEventChoice(${i}, '${event.id}')">
                        ${choice.text}
                        ${choice.cost ? `<small>Maliyet: ${choice.cost}</small>` : ''}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    window.currentEvent = event;
}

function handleEventChoice(choiceIndex, eventId) {
    const event = window.currentEvent;
    const choice = event.choices[choiceIndex];
    
    // Etkileri uygula
    if (choice.effect.quality) {
        gameState.indicators.quality = adjustIndicator(gameState.indicators.quality, choice.effect.quality);
    }
    if (choice.effect.economy) {
        gameState.indicators.economy = adjustIndicator(gameState.indicators.economy, choice.effect.economy);
    }
    if (choice.effect.air) {
        gameState.indicators.air = adjustIndicator(gameState.indicators.air, choice.effect.air);
    }
    if (choice.effect.green) {
        const current = parseInt(gameState.indicators.green);
        gameState.indicators.green = `%${Math.max(0, Math.min(100, current + choice.effect.green * 2))}`;
    }
    
    updateIndicators();
    document.querySelector('.event-modal').closest('.modal').remove();
    
    showToast(`Olay yönetildi: ${choice.text}`, 'success');
    addXP(30);
}

function adjustIndicator(current, change) {
    const levels = ['Çok Düşük', 'Düşük', 'Orta-', 'Orta', 'Orta+', 'İyi', 'Çok İyi'];
    const index = levels.indexOf(current) || 3;
    const newIndex = Math.max(0, Math.min(levels.length - 1, index + change));
    return levels[newIndex];
}

// Günlük Görevler
const dailyQuests = [
    { id: 'play_scenario', name: 'Bir senaryo tamamla', xp: 50, completed: false },
    { id: 'join_class', name: 'Bir sınıfa katıl', xp: 30, completed: false },
    { id: 'answer_quiz', name: '3 quiz sorusunu doğru cevapla', xp: 40, progress: 0, target: 3, completed: false },
    { id: 'share_result', name: 'Sonucunu paylaş', xp: 20, completed: false }
];

function checkDailyQuest(questId, progress = 1) {
    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest || quest.completed) return;
    
    if (quest.target) {
        quest.progress = (quest.progress || 0) + progress;
        if (quest.progress >= quest.target) {
            completeQuest(quest);
        }
    } else {
        completeQuest(quest);
    }
    
    saveDailyQuests();
}

function completeQuest(quest) {
    quest.completed = true;
    showToast(`✅ Görev tamamlandı: ${quest.name} (+${quest.xp} XP)`, 'success');
    addXP(quest.xp);
}

function saveDailyQuests() {
    saveToStorage('dailyQuests', dailyQuests);
}

function savePlayerProgress() {
    saveToStorage('playerLevel', playerLevel);
}
