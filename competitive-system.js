// REKABET SİSTEMİ - Diğer oyuncularla yarış
console.log('🏆 Rekabet Sistemi Yüklendi');

// Global rekabet durumu
window.competitiveState = {
    rivals: [],
    challenges: [],
    tournaments: [],
    rank: 0,
    rating: 1000,
    wins: 0,
    losses: 0
};

// Yapay rakipler oluştur
function generateRivals() {
    const names = [
        'Ahmet Yılmaz', 'Ayşe Demir', 'Mehmet Kaya', 'Fatma Şahin',
        'Can Öztürk', 'Zeynep Aydın', 'Burak Çelik', 'Elif Yıldız',
        'Emre Arslan', 'Selin Koç', 'Murat Şen', 'Deniz Aktaş'
    ];
    
    competitiveState.rivals = names.map((name, i) => ({
        id: i + 1,
        name: name,
        level: Math.floor(Math.random() * 20) + 1,
        xp: Math.floor(Math.random() * 10000),
        rating: 800 + Math.floor(Math.random() * 400),
        avatar: ['🧑', '👨', '👩', '🧔', '👱'][Math.floor(Math.random() * 5)],
        status: Math.random() > 0.5 ? 'online' : 'offline',
        lastSeen: Date.now() - Math.floor(Math.random() * 3600000)
    }));
    
    saveCompetitiveState();
}

// Kaydet
function saveCompetitiveState() {
    try {
        localStorage.setItem('competitiveState', JSON.stringify(competitiveState));
    } catch (e) {
        console.warn('Rekabet durumu kaydedilemedi:', e);
    }
}

// Yükle
function loadCompetitiveState() {
    const saved = localStorage.getItem('competitiveState');
    if (saved) {
        try {
            Object.assign(competitiveState, JSON.parse(saved));
        } catch (e) {
            console.warn('Rekabet durumu yüklenemedi:', e);
        }
    }
    
    if (competitiveState.rivals.length === 0) {
        generateRivals();
    }
}

// Rakipler panelini göster
function showRivalsPanel() {
    const panel = document.createElement('div');
    panel.className = 'modal';
    panel.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <h2>🏆 Rakipler ve Meydan Okumalar</h2>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                <h3 style="margin: 0 0 1rem 0;">Senin İstatistiklerin</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                    <div>
                        <div style="font-size: 2rem; font-weight: bold;">${competitiveState.rating}</div>
                        <div style="opacity: 0.9;">Rating</div>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: bold;">${competitiveState.wins}</div>
                        <div style="opacity: 0.9;">Galibiyet</div>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: bold;">${competitiveState.losses}</div>
                        <div style="opacity: 0.9;">Mağlubiyet</div>
                    </div>
                </div>
            </div>
            
            <h3>👥 Aktif Rakipler</h3>
            <div class="rivals-list">
                ${competitiveState.rivals.slice(0, 8).map(rival => `
                    <div class="rival-card">
                        <div class="rival-info">
                            <div class="rival-avatar">${rival.avatar}</div>
                            <div>
                                <div class="rival-name">${rival.name}</div>
                                <div class="rival-stats">
                                    Seviye ${rival.level} • Rating: ${rival.rating}
                                </div>
                                <div class="rival-status ${rival.status}">
                                    ${rival.status === 'online' ? '🟢 Çevrimiçi' : '⚪ Çevrimdışı'}
                                </div>
                            </div>
                        </div>
                        <button class="btn-primary btn-small" onclick="challengeRival(${rival.id})">
                            ⚔️ Meydan Oku
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 2rem;">
                <button class="btn-secondary" onclick="showTournaments()">
                    🏆 Turnuvalar
                </button>
                <button class="btn-secondary" onclick="showGlobalLeaderboard()">
                    🌍 Global Sıralama
                </button>
            </div>
            
            <button class="btn-primary" onclick="this.closest('.modal').remove();">
                Kapat
            </button>
        </div>
    `;
    
    document.body.appendChild(panel);
}

// Rakibe meydan oku
function challengeRival(rivalId) {
    const rival = competitiveState.rivals.find(r => r.id === rivalId);
    if (!rival) return;
    
    const challenge = document.createElement('div');
    challenge.className = 'modal';
    challenge.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <h2>⚔️ Meydan Okuma</h2>
            
            <div style="display: flex; justify-content: space-around; align-items: center; margin: 2rem 0;">
                <div>
                    <div style="font-size: 3rem;">👤</div>
                    <div style="font-weight: bold; margin-top: 0.5rem;">Sen</div>
                    <div style="color: #6b7280;">Rating: ${competitiveState.rating}</div>
                </div>
                
                <div style="font-size: 3rem;">⚡</div>
                
                <div>
                    <div style="font-size: 3rem;">${rival.avatar}</div>
                    <div style="font-weight: bold; margin-top: 0.5rem;">${rival.name}</div>
                    <div style="color: #6b7280;">Rating: ${rival.rating}</div>
                </div>
            </div>
            
            <p style="font-size: 1.1rem; margin: 2rem 0;">
                ${rival.name} ile kim daha iyi şehir yöneticisi?<br>
                Aynı senaryoyu oynayın, skorlarınız karşılaştırılsın!
            </p>
            
            <div style="background: #fef3c7; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <strong>Ödül:</strong> +${Math.floor(Math.abs(rival.rating - competitiveState.rating) / 10)} Rating
            </div>
            
            <button class="btn-primary btn-large" onclick="startCompetitiveMatch(${rivalId})">
                Başla! 🚀
            </button>
            <button class="btn-secondary" onclick="this.closest('.modal').remove();">
                İptal
            </button>
        </div>
    `;
    
    document.body.appendChild(challenge);
}

// Rekabetçi maç başlat
function startCompetitiveMatch(rivalId) {
    const rival = competitiveState.rivals.find(r => r.id === rivalId);
    
    // Modal'ı kapat
    document.querySelectorAll('.modal').forEach(m => m.remove());
    
    // Özel rekabetçi mod
    window.competitiveMatch = {
        active: true,
        rivalId: rivalId,
        rivalName: rival.name,
        rivalRating: rival.rating,
        rivalScore: Math.floor(Math.random() * 100) + 50 // Yapay skor
    };
    
    showToast(`⚔️ ${rival.name} ile yarışıyorsun!`, 'info');
    
    // Senaryoyu başlat
    if (typeof startScenario === 'function') {
        startScenario('basic');
    }
}

// Maç sonucu
function endCompetitiveMatch(playerScore) {
    if (!window.competitiveMatch || !window.competitiveMatch.active) return;
    
    const match = window.competitiveMatch;
    const won = playerScore > match.rivalScore;
    const ratingChange = Math.floor(Math.abs(match.rivalRating - competitiveState.rating) / 10);
    
    if (won) {
        competitiveState.wins++;
        competitiveState.rating += ratingChange;
    } else {
        competitiveState.losses++;
        competitiveState.rating = Math.max(0, competitiveState.rating - ratingChange);
    }
    
    saveCompetitiveState();
    
    const result = document.createElement('div');
    result.className = 'modal';
    result.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <div style="font-size: 5rem; margin-bottom: 1rem;">
                ${won ? '🏆' : '😔'}
            </div>
            
            <h2>${won ? 'Kazandın!' : 'Kaybettin'}</h2>
            
            <div style="display: flex; justify-content: space-around; margin: 2rem 0;">
                <div>
                    <div style="font-weight: bold;">Sen</div>
                    <div style="font-size: 2rem; color: ${won ? '#10b981' : '#ef4444'};">
                        ${Math.round(playerScore)}
                    </div>
                </div>
                
                <div style="font-size: 2rem;">-</div>
                
                <div>
                    <div style="font-weight: bold;">${match.rivalName}</div>
                    <div style="font-size: 2rem; color: ${!won ? '#10b981' : '#ef4444'};">
                        ${Math.round(match.rivalScore)}
                    </div>
                </div>
            </div>
            
            <div style="background: ${won ? '#d1fae5' : '#fee2e2'}; padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0;">
                <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">
                    ${won ? '+' : '-'}${ratingChange} Rating
                </div>
                <div>Yeni Rating: ${competitiveState.rating}</div>
            </div>
            
            <button class="btn-primary" onclick="this.closest('.modal').remove(); showRivalsPanel();">
                Tamam
            </button>
        </div>
    `;
    
    document.body.appendChild(result);
    
    if (won && typeof createConfetti === 'function') {
        createConfetti();
    }
    
    window.competitiveMatch = null;
}

// Turnuvalar
function showTournaments() {
    const tournaments = [
        { name: 'Haftalık Turnuva', prize: '1000 XP', players: 128, timeLeft: '2g 5s' },
        { name: 'Aylık Şampiyonluk', prize: '5000 XP', players: 512, timeLeft: '15g 3s' },
        { name: 'Hızlı Turnuva', prize: '500 XP', players: 32, timeLeft: '4s 12d' }
    ];
    
    const panel = document.createElement('div');
    panel.className = 'modal';
    panel.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h2>🏆 Turnuvalar</h2>
            
            <div class="tournaments-list">
                ${tournaments.map(t => `
                    <div class="tournament-card">
                        <h3>${t.name}</h3>
                        <div class="tournament-info">
                            <div>🎁 Ödül: ${t.prize}</div>
                            <div>👥 Katılımcı: ${t.players}</div>
                            <div>⏰ Kalan: ${t.timeLeft}</div>
                        </div>
                        <button class="btn-primary btn-small" onclick="joinTournament('${t.name}')">
                            Katıl
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <button class="btn-secondary" onclick="this.closest('.modal').remove(); showRivalsPanel();">
                ← Geri
            </button>
        </div>
    `;
    
    document.body.appendChild(panel);
}

// Turnuvaya katıl
function joinTournament(name) {
    showToast(`🏆 ${name} turnuvasına katıldın!`, 'success');
    document.querySelectorAll('.modal').forEach(m => m.remove());
}

// Global sıralama
function showGlobalLeaderboard() {
    const topPlayers = [
        { rank: 1, name: 'ProGamer123', rating: 2500, avatar: '👑' },
        { rank: 2, name: 'CityMaster', rating: 2350, avatar: '🏆' },
        { rank: 3, name: 'EcoWarrior', rating: 2200, avatar: '🌱' },
        { rank: 4, name: 'UrbanPlanner', rating: 2100, avatar: '🏙️' },
        { rank: 5, name: 'GreenHero', rating: 2050, avatar: '♻️' }
    ];
    
    const panel = document.createElement('div');
    panel.className = 'modal';
    panel.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h2>🌍 Global Sıralama</h2>
            
            <div class="leaderboard-list">
                ${topPlayers.map(p => `
                    <div class="leaderboard-item ${p.rank <= 3 ? 'top-three' : ''}">
                        <div class="rank">#${p.rank}</div>
                        <div class="player-avatar">${p.avatar}</div>
                        <div class="player-info">
                            <div class="player-name">${p.name}</div>
                            <div class="player-rating">${p.rating} Rating</div>
                        </div>
                    </div>
                `).join('')}
                
                <div class="leaderboard-item your-rank">
                    <div class="rank">#${Math.floor(Math.random() * 1000) + 100}</div>
                    <div class="player-avatar">👤</div>
                    <div class="player-info">
                        <div class="player-name">Sen</div>
                        <div class="player-rating">${competitiveState.rating} Rating</div>
                    </div>
                </div>
            </div>
            
            <button class="btn-secondary" onclick="this.closest('.modal').remove(); showRivalsPanel();">
                ← Geri
            </button>
        </div>
    `;
    
    document.body.appendChild(panel);
}

// CSS ekle
const style = document.createElement('style');
style.textContent = `
    .rivals-list {
        display: grid;
        gap: 1rem;
        max-height: 400px;
        overflow-y: auto;
    }
    
    .rival-card {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s;
    }
    
    .rival-card:hover {
        background: #f3f4f6;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .rival-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .rival-avatar {
        font-size: 2.5rem;
    }
    
    .rival-name {
        font-weight: bold;
        font-size: 1.1rem;
    }
    
    .rival-stats {
        color: #6b7280;
        font-size: 0.9rem;
    }
    
    .rival-status {
        font-size: 0.8rem;
        margin-top: 0.25rem;
    }
    
    .rival-status.online {
        color: #10b981;
    }
    
    .rival-status.offline {
        color: #9ca3af;
    }
    
    .tournaments-list {
        display: grid;
        gap: 1rem;
    }
    
    .tournament-card {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
    }
    
    .tournament-card h3 {
        margin: 0 0 1rem 0;
    }
    
    .tournament-info {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }
    
    .leaderboard-list {
        display: grid;
        gap: 0.5rem;
    }
    
    .leaderboard-item {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .leaderboard-item.top-three {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
    }
    
    .leaderboard-item.your-rank {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: 3px solid #fbbf24;
    }
    
    .rank {
        font-size: 1.5rem;
        font-weight: bold;
        min-width: 50px;
    }
    
    .player-avatar {
        font-size: 2rem;
    }
    
    .player-name {
        font-weight: bold;
    }
    
    .player-rating {
        font-size: 0.9rem;
        opacity: 0.9;
    }
`;
document.head.appendChild(style);

// Sayfa yüklendiğinde
loadCompetitiveState();

console.log('✅ Rekabet sistemi hazır!');
