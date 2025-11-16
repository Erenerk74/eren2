// Başarı Sistemi
console.log('🏆 Başarı sistemi yüklendi');

const ACHIEVEMENTS = {
    first_login: {
        id: 'first_login',
        title: 'İlk Adım',
        description: 'KararLab\'e hoş geldin!',
        icon: '👋',
        xp: 50,
        rarity: 'common'
    },
    first_game: {
        id: 'first_game',
        title: 'İlk Senaryo',
        description: 'İlk senaryonu tamamladın',
        icon: '🎮',
        xp: 100,
        rarity: 'common'
    },
    streak_3: {
        id: 'streak_3',
        title: 'Kararlı',
        description: '3 gün üst üste giriş yap',
        icon: '🔥',
        xp: 150,
        rarity: 'rare'
    },
    streak_7: {
        id: 'streak_7',
        title: 'Bağımlı',
        description: '7 gün üst üste giriş yap',
        icon: '💎',
        xp: 300,
        rarity: 'epic'
    },
    level_5: {
        id: 'level_5',
        title: 'Yükselen Yıldız',
        description: '5. seviyeye ulaş',
        icon: '⭐',
        xp: 200,
        rarity: 'rare'
    },
    level_10: {
        id: 'level_10',
        title: 'Uzman',
        description: '10. seviyeye ulaş',
        icon: '🌟',
        xp: 500,
        rarity: 'epic'
    },
    games_10: {
        id: 'games_10',
        title: 'Deneyimli',
        description: '10 senaryo tamamla',
        icon: '🎯',
        xp: 250,
        rarity: 'rare'
    },
    games_50: {
        id: 'games_50',
        title: 'Usta',
        description: '50 senaryo tamamla',
        icon: '👑',
        xp: 1000,
        rarity: 'legendary'
    },
    perfect_score: {
        id: 'perfect_score',
        title: 'Mükemmeliyetçi',
        description: 'Tüm göstergelerde A+ al',
        icon: '💯',
        xp: 500,
        rarity: 'epic'
    },
    eco_warrior: {
        id: 'eco_warrior',
        title: 'Çevre Savaşçısı',
        description: '5 sürdürülebilir şehir kur',
        icon: '🌱',
        xp: 300,
        rarity: 'rare'
    },
    night_owl: {
        id: 'night_owl',
        title: 'Gece Kuşu',
        description: 'Gece 00:00-05:00 arası oyna',
        icon: '🦉',
        xp: 100,
        rarity: 'rare'
    },
    early_bird: {
        id: 'early_bird',
        title: 'Erken Kuş',
        description: 'Sabah 05:00-08:00 arası oyna',
        icon: '🐦',
        xp: 100,
        rarity: 'rare'
    },
    social_butterfly: {
        id: 'social_butterfly',
        title: 'Sosyal Kelebek',
        description: '10 arkadaş ekle',
        icon: '🦋',
        xp: 200,
        rarity: 'rare'
    },
    quiz_master: {
        id: 'quiz_master',
        title: 'Quiz Ustası',
        description: 'Quiz\'de 10/10 al',
        icon: '🧠',
        xp: 250,
        rarity: 'epic'
    },
    speed_runner: {
        id: 'speed_runner',
        title: 'Hız Canavarı',
        description: 'Senaryoyu 5 dakikada bitir',
        icon: '⚡',
        xp: 150,
        rarity: 'rare'
    },
    streak_master: {
        id: 'streak_master',
        title: 'Seri Ustası',
        description: '30 gün üst üste giriş yap',
        icon: '🔥',
        xp: 1000,
        rarity: 'legendary'
    },
    referral_master: {
        id: 'referral_master',
        title: 'Davet Ustası',
        description: '5 arkadaş davet et',
        icon: '👥',
        xp: 500,
        rarity: 'epic'
    },
    referral_legend: {
        id: 'referral_legend',
        title: 'Davet Efsanesi',
        description: '10 arkadaş davet et',
        icon: '👑',
        xp: 2000,
        rarity: 'legendary'
    },
    lucky_spinner: {
        id: 'lucky_spinner',
        title: 'Şanslı Çarkçı',
        description: 'Çarktan 500 XP kazan',
        icon: '🎡',
        xp: 200,
        rarity: 'rare'
    },
    scratch_winner: {
        id: 'scratch_winner',
        title: 'Kazı Kazan Şampiyonu',
        description: '10 kazı kazan kartı kullan',
        icon: '🎫',
        xp: 300,
        rarity: 'rare'
    },
    combo_king: {
        id: 'combo_king',
        title: 'Combo Kralı',
        description: 'Aynı gün 10 senaryo oyna',
        icon: '💥',
        xp: 500,
        rarity: 'epic'
    },
    millionaire: {
        id: 'millionaire',
        title: 'Milyoner',
        description: '10,000 coin biriktir',
        icon: '💰',
        xp: 1000,
        rarity: 'legendary'
    },
    shopaholic: {
        id: 'shopaholic',
        title: 'Alışveriş Bağımlısı',
        description: 'Mağazadan 10 eşya al',
        icon: '🛍️',
        xp: 300,
        rarity: 'rare'
    },
    vip_member: {
        id: 'vip_member',
        title: 'VIP Üye',
        description: 'VIP statüsüne ulaş',
        icon: '👑',
        xp: 2000,
        rarity: 'legendary'
    },
    quest_master: {
        id: 'quest_master',
        title: 'Görev Ustası',
        description: '10 günlük görev tamamla',
        icon: '📅',
        xp: 500,
        rarity: 'epic'
    },
    daily_hero: {
        id: 'daily_hero',
        title: 'Günlük Kahraman',
        description: 'Bir günde tüm görevleri tamamla',
        icon: '🦸',
        xp: 300,
        rarity: 'rare'
    },
    notification_master: {
        id: 'notification_master',
        title: 'Bildirim Ustası',
        description: '20 bildirimi aç',
        icon: '🔔',
        xp: 200,
        rarity: 'rare'
    },
    challenge_master: {
        id: 'challenge_master',
        title: 'Challenge Ustası',
        description: '10 saatlik challenge tamamla',
        icon: '⏰',
        xp: 500,
        rarity: 'epic'
    },
    five_hour_player: {
        id: 'five_hour_player',
        title: '5 Saatlik Oyuncu',
        description: 'Tek oturumda 5 saat oyna',
        icon: '⏱️',
        xp: 1000,
        rarity: 'legendary'
    },
    activity_king: {
        id: 'activity_king',
        title: 'Aktivite Kralı',
        description: '1000 aktivite yap',
        icon: '👑',
        xp: 750,
        rarity: 'epic'
    }
};

function checkAchievement(achievementId) {
    if (!currentUser) return;
    
    const userAchievements = currentUser.achievements || [];
    
    // Zaten kazanılmış mı?
    if (userAchievements.includes(achievementId)) {
        return;
    }
    
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return;
    
    // Başarıyı ekle
    userAchievements.push(achievementId);
    currentUser.achievements = userAchievements;
    currentUser.xp = (currentUser.xp || 0) + achievement.xp;
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    // Başarı bildirimini göster
    showAchievementUnlocked(achievement);
}

function showAchievementUnlocked(achievement) {
    const notification = document.createElement('div');
    notification.className = `achievement-notification ${achievement.rarity}`;
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
            <div class="achievement-title">Başarı Kazanıldı!</div>
            <div class="achievement-name">${achievement.title}</div>
            <div class="achievement-desc">${achievement.description}</div>
            <div class="achievement-xp">+${achievement.xp} XP</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    playSound('achievement');
    createConfetti();
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

function checkTimeBasedAchievements() {
    const hour = new Date().getHours();
    
    if (hour >= 0 && hour < 5) {
        checkAchievement('night_owl');
    } else if (hour >= 5 && hour < 8) {
        checkAchievement('early_bird');
    }
}

function getAchievementProgress() {
    if (!currentUser) return { total: 0, unlocked: 0, percentage: 0 };
    
    const total = Object.keys(ACHIEVEMENTS).length;
    const unlocked = (currentUser.achievements || []).length;
    const percentage = Math.round((unlocked / total) * 100);
    
    return { total, unlocked, percentage };
}
