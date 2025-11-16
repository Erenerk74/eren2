// Liderlik Tablosu ve Rekabet Sistemi
console.log('🏆 Liderlik tablosu yüklendi');

function showLeaderboard() {
    // Görev ilerlemesi
    if (typeof onLeaderboardVisited === 'function') {
        onLeaderboardVisited();
    }
    
    const users = getFromStorage('users') || [];
    
    // Sıralama seçenekleri
    const sortOptions = {
        xp: users.filter(u => u.type !== 'admin').sort((a, b) => (b.xp || 0) - (a.xp || 0)),
        level: users.filter(u => u.type !== 'admin').sort((a, b) => (b.level || 1) - (a.level || 1)),
        games: users.filter(u => u.type !== 'admin').sort((a, b) => (b.scenarios?.length || 0) - (a.scenarios?.length || 0)),
        streak: users.filter(u => u.type !== 'admin').sort((a, b) => (b.loginStreak || 0) - (a.loginStreak || 0)),
        coins: users.filter(u => u.type !== 'admin').sort((a, b) => (b.coins || 0) - (a.coins || 0))
    };
    
    const modal = document.createElement('div');
    modal.className = 'modal active leaderboard-modal';
    modal.innerHTML = `
        <div class="modal-content leaderboard-content">
            <h2>🏆 Liderlik Tablosu</h2>
            
            <div class="leaderboard-tabs">
                <button class="lb-tab active" onclick="switchLeaderboard('xp')">⚡ XP</button>
                <button class="lb-tab" onclick="switchLeaderboard('level')">📊 Seviye</button>
                <button class="lb-tab" onclick="switchLeaderboard('games')">🎮 Oyun</button>
                <button class="lb-tab" onclick="switchLeaderboard('streak')">🔥 Seri</button>
                <button class="lb-tab" onclick="switchLeaderboard('coins')">🪙 Coin</button>
            </div>
            
            <div class="leaderboard-container" id="leaderboard-container">
                ${generateLeaderboardHTML(sortOptions.xp, 'xp')}
            </div>
            
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeLeaderboard()">Kapat</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    window.leaderboardData = sortOptions;
}

function generateLeaderboardHTML(users, type) {
    const currentUserId = currentUser?.id;
    const topUsers = users.slice(0, 100);
    
    let html = '<div class="leaderboard-list">';
    
    // Top 3 özel gösterim
    if (topUsers.length > 0) {
        html += '<div class="top-three">';
        
        // 2. sıra
        if (topUsers[1]) {
            html += generateTopUserCard(topUsers[1], 2, type, currentUserId);
        }
        
        // 1. sıra (ortada, büyük)
        if (topUsers[0]) {
            html += generateTopUserCard(topUsers[0], 1, type, currentUserId);
        }
        
        // 3. sıra
        if (topUsers[2]) {
            html += generateTopUserCard(topUsers[2], 3, type, currentUserId);
        }
        
        html += '</div>';
    }
    
    // Geri kalan sıralama
    html += '<div class="other-ranks">';
    for (let i = 3; i < topUsers.length; i++) {
        const user = topUsers[i];
        const isCurrentUser = user.id === currentUserId;
        const value = getLeaderboardValue(user, type);
        
        html += `
            <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                <div class="rank">#${i + 1}</div>
                <div class="user-avatar">${user.avatar || '👤'}</div>
                <div class="user-info">
                    <div class="user-name">${user.name} ${isCurrentUser ? '(Sen)' : ''}</div>
                    <div class="user-type">${user.type === 'student' ? '🎓 Öğrenci' : '👨‍🏫 Öğretmen'}</div>
                </div>
                <div class="user-score">${value}</div>
            </div>
        `;
    }
    html += '</div></div>';
    
    return html;
}

function generateTopUserCard(user, rank, type, currentUserId) {
    const isCurrentUser = user.id === currentUserId;
    const value = getLeaderboardValue(user, type);
    const medals = ['', '🥇', '🥈', '🥉'];
    const sizes = ['', 'large', 'medium', 'small'];
    
    return `
        <div class="top-user ${sizes[rank]} ${isCurrentUser ? 'current-user' : ''}">
            <div class="medal">${medals[rank]}</div>
            <div class="user-avatar-large">${user.avatar || '👤'}</div>
            <div class="user-name">${user.name}</div>
            <div class="user-score-large">${value}</div>
            ${isCurrentUser ? '<div class="you-badge">SEN</div>' : ''}
        </div>
    `;
}

function getLeaderboardValue(user, type) {
    switch(type) {
        case 'xp': return `${user.xp || 0} XP`;
        case 'level': return `Seviye ${user.level || 1}`;
        case 'games': return `${user.scenarios?.length || 0} Oyun`;
        case 'streak': return `${user.loginStreak || 0} Gün`;
        case 'coins': return `${user.coins || 0} 🪙`;
        default: return '0';
    }
}

function switchLeaderboard(type) {
    document.querySelectorAll('.lb-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const container = document.getElementById('leaderboard-container');
    container.innerHTML = generateLeaderboardHTML(window.leaderboardData[type], type);
}

function closeLeaderboard() {
    const modal = document.querySelector('.leaderboard-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Haftalık turnuva sistemi
function checkWeeklyTournament() {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekKey = `tournament_${weekStart.toISOString().split('T')[0]}`;
    
    let tournament = getFromStorage(weekKey) || {
        startDate: weekStart.toISOString(),
        participants: [],
        prizes: {
            1: { xp: 1000, coins: 500, badge: '🏆' },
            2: { xp: 500, coins: 250, badge: '🥈' },
            3: { xp: 250, coins: 100, badge: '🥉' }
        }
    };
    
    return tournament;
}

function showWeeklyTournament() {
    const tournament = checkWeeklyTournament();
    const users = getFromStorage('users') || [];
    const weeklyScores = users
        .filter(u => u.type !== 'admin')
        .map(u => ({
            ...u,
            weeklyXP: calculateWeeklyXP(u)
        }))
        .sort((a, b) => b.weeklyXP - a.weeklyXP)
        .slice(0, 10);
    
    const modal = document.createElement('div');
    modal.className = 'modal active tournament-modal';
    modal.innerHTML = `
        <div class="modal-content tournament-content">
            <h2>🏆 Haftalık Turnuva</h2>
            <p class="tournament-desc">Bu hafta en çok XP kazanan ilk 3 kişi ödül kazanacak!</p>
            
            <div class="tournament-prizes">
                <div class="prize-card">
                    <div class="prize-rank">🥇 1.</div>
                    <div class="prize-reward">1000 XP + 500 🪙</div>
                </div>
                <div class="prize-card">
                    <div class="prize-rank">🥈 2.</div>
                    <div class="prize-reward">500 XP + 250 🪙</div>
                </div>
                <div class="prize-card">
                    <div class="prize-rank">🥉 3.</div>
                    <div class="prize-reward">250 XP + 100 🪙</div>
                </div>
            </div>
            
            <div class="tournament-leaderboard">
                ${weeklyScores.map((user, i) => `
                    <div class="tournament-item ${user.id === currentUser?.id ? 'current-user' : ''}">
                        <div class="rank">#${i + 1}</div>
                        <div class="user-name">${user.name}</div>
                        <div class="weekly-xp">${user.weeklyXP} XP</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="tournament-timer">
                <p>Turnuva bitimine: <span id="tournament-countdown"></span></p>
            </div>
            
            <div class="modal-actions">
                <button class="btn-primary" onclick="closeTournament(); startScenario('basic')">Hemen Oyna!</button>
                <button class="btn-secondary" onclick="closeTournament()">Kapat</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    startTournamentCountdown();
}

function calculateWeeklyXP(user) {
    // Bu hafta kazanılan XP'yi hesapla (basitleştirilmiş)
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    
    // Gerçek uygulamada her XP kazanımı tarihle kaydedilmeli
    return Math.floor((user.xp || 0) * 0.3); // Simülasyon için
}

function startTournamentCountdown() {
    const countdownEl = document.getElementById('tournament-countdown');
    if (!countdownEl) return;
    
    function updateCountdown() {
        const now = new Date();
        const nextSunday = new Date(now);
        nextSunday.setDate(now.getDate() + (7 - now.getDay()));
        nextSunday.setHours(23, 59, 59, 999);
        
        const diff = nextSunday - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        countdownEl.textContent = `${days}g ${hours}s ${minutes}d`;
    }
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    
    // Modal kapandığında interval'i temizle
    const modal = document.querySelector('.tournament-modal');
    if (modal) {
        modal.addEventListener('remove', () => clearInterval(interval));
    }
}

function closeTournament() {
    const modal = document.querySelector('.tournament-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}
