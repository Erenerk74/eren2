// İLERLEME TAKİP SİSTEMİ - Her şeyi kaydet ve göster
console.log('📊 İlerleme Takip Sistemi Yüklendi');

// Global ilerleme durumu
window.progressState = {
    totalPlayTime: 0,
    totalScenarios: 0,
    totalDecisions: 0,
    totalXPEarned: 0,
    totalAchievements: 0,
    totalQuests: 0,
    totalMiniGames: 0,
    totalReferrals: 0,
    bestHappiness: 0,
    bestSupport: 0,
    perfectRuns: 0,
    dailyStreak: 0,
    lastVisit: Date.now(),
    milestones: []
};

// LocalStorage'dan yükle
function loadProgress() {
    const saved = localStorage.getItem('progressState');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.assign(progressState, data);
        } catch (e) {
            console.warn('İlerleme yüklenemedi:', e);
        }
    }
}

// Kaydet
function saveProgress() {
    try {
        localStorage.setItem('progressState', JSON.stringify(progressState));
    } catch (e) {
        console.warn('İlerleme kaydedilemedi:', e);
    }
}

// Otomatik kayıt
setInterval(saveProgress, 30000); // 30 saniyede bir

// Oyun süresi takibi
setInterval(() => {
    progressState.totalPlayTime++;
    
    // Her 10 dakikada bir milestone
    if (progressState.totalPlayTime % 10 === 0) {
        checkTimeMilestone(progressState.totalPlayTime);
    }
    
    saveProgress();
}, 60000); // Her dakika

// Zaman milestone kontrolü
function checkTimeMilestone(minutes) {
    const milestones = [10, 30, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600];
    
    if (milestones.includes(minutes)) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        showMilestoneAchievement(
            `⏰ ${hours}s ${mins}d Oynadın!`,
            `İnanılmaz! ${minutes} dakika oyun süresi!`,
            minutes * 5
        );
        
        progressState.milestones.push({
            type: 'time',
            value: minutes,
            date: Date.now()
        });
        
        // Konfeti
        if (typeof createConfetti === 'function') {
            createConfetti();
        }
    }
}

// Milestone başarımı göster
function showMilestoneAchievement(title, desc, xp) {
    const popup = document.createElement('div');
    popup.className = 'milestone-popup';
    popup.innerHTML = `
        <div class="milestone-content">
            <div class="milestone-icon">🏆</div>
            <h2>${title}</h2>
            <p>${desc}</p>
            <div class="milestone-reward">+${xp} XP</div>
            <button class="btn-primary" onclick="this.closest('.milestone-popup').remove();">
                Harika! 🎉
            </button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    if (typeof addXP === 'function') {
        addXP(xp);
    }
    
    playSound('achievement');
    
    // Otomatik kapat
    setTimeout(() => {
        if (popup.parentNode) popup.remove();
    }, 10000);
}

// Senaryo tamamlandı
function onScenarioComplete(happiness, support) {
    progressState.totalScenarios++;
    progressState.totalDecisions += 3;
    
    if (happiness > progressState.bestHappiness) {
        progressState.bestHappiness = happiness;
        showToast(`🎯 Yeni Rekor! En Yüksek Mutluluk: %${Math.round(happiness)}`, 'success');
    }
    
    if (support > progressState.bestSupport) {
        progressState.bestSupport = support;
        showToast(`🎯 Yeni Rekor! En Yüksek Destek: %${Math.round(support)}`, 'success');
    }
    
    if (happiness >= 80 && support >= 80) {
        progressState.perfectRuns++;
        showMilestoneAchievement(
            '⭐ Mükemmel Oyun!',
            'Hem mutluluk hem destek %80+!',
            200
        );
    }
    
    // Senaryo sayısı milestones
    const scenarioMilestones = [1, 5, 10, 25, 50, 100];
    if (scenarioMilestones.includes(progressState.totalScenarios)) {
        showMilestoneAchievement(
            `🎮 ${progressState.totalScenarios} Senaryo!`,
            'Harika bir oyuncu!',
            progressState.totalScenarios * 10
        );
    }
    
    saveProgress();
}

// XP kazanıldı
function onXPGained(amount) {
    progressState.totalXPEarned += amount;
    
    // XP milestones
    const xpMilestones = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000];
    if (xpMilestones.includes(progressState.totalXPEarned)) {
        showMilestoneAchievement(
            `💎 ${progressState.totalXPEarned} XP!`,
            'İnanılmaz ilerleme!',
            progressState.totalXPEarned / 10
        );
    }
    
    saveProgress();
}

// Başarım kazanıldı
function onAchievementUnlocked() {
    progressState.totalAchievements++;
    
    if (progressState.totalAchievements % 5 === 0) {
        showToast(`🏆 ${progressState.totalAchievements} Başarım Açıldı!`, 'success');
    }
    
    saveProgress();
}

// Görev tamamlandı
function onQuestComplete() {
    progressState.totalQuests++;
    
    if (progressState.totalQuests % 10 === 0) {
        showMilestoneAchievement(
            `📋 ${progressState.totalQuests} Görev!`,
            'Görev ustası!',
            progressState.totalQuests * 5
        );
    }
    
    saveProgress();
}

// Mini oyun oynandı
function onMiniGamePlayed() {
    progressState.totalMiniGames++;
    
    if (progressState.totalMiniGames % 20 === 0) {
        showMilestoneAchievement(
            `🎮 ${progressState.totalMiniGames} Mini Oyun!`,
            'Oyun bağımlısı!',
            progressState.totalMiniGames * 3
        );
    }
    
    saveProgress();
}

// İlerleme panelini göster
function showProgressPanel() {
    const hours = Math.floor(progressState.totalPlayTime / 60);
    const minutes = progressState.totalPlayTime % 60;
    
    const panel = document.createElement('div');
    panel.className = 'modal';
    panel.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h2>📊 İlerleme İstatistiklerin</h2>
            
            <div class="progress-stats">
                <div class="stat-item">
                    <div class="stat-icon">⏰</div>
                    <div class="stat-info">
                        <div class="stat-value">${hours}s ${minutes}d</div>
                        <div class="stat-label">Toplam Oyun Süresi</div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">🎮</div>
                    <div class="stat-info">
                        <div class="stat-value">${progressState.totalScenarios}</div>
                        <div class="stat-label">Tamamlanan Senaryo</div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">💎</div>
                    <div class="stat-info">
                        <div class="stat-value">${progressState.totalXPEarned}</div>
                        <div class="stat-label">Toplam XP</div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-info">
                        <div class="stat-value">${progressState.totalAchievements}</div>
                        <div class="stat-label">Başarımlar</div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">📋</div>
                    <div class="stat-info">
                        <div class="stat-value">${progressState.totalQuests}</div>
                        <div class="stat-label">Görevler</div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-info">
                        <div class="stat-value">${progressState.perfectRuns}</div>
                        <div class="stat-label">Mükemmel Oyunlar</div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">😊</div>
                    <div class="stat-info">
                        <div class="stat-value">%${Math.round(progressState.bestHappiness)}</div>
                        <div class="stat-label">En Yüksek Mutluluk</div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">👔</div>
                    <div class="stat-info">
                        <div class="stat-value">%${Math.round(progressState.bestSupport)}</div>
                        <div class="stat-label">En Yüksek Destek</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 2rem;">
                <h3>🏅 Son Kilometre Taşları</h3>
                <div class="milestones-list">
                    ${progressState.milestones.slice(-5).reverse().map(m => `
                        <div class="milestone-item">
                            ${m.type === 'time' ? '⏰' : '🎯'} 
                            ${m.type === 'time' ? `${m.value} dakika oynadın` : m.value}
                            <span style="color: #9ca3af; font-size: 0.8rem;">
                                ${new Date(m.date).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                    `).join('') || '<p style="color: #9ca3af;">Henüz kilometre taşı yok</p>'}
                </div>
            </div>
            
            <button class="btn-primary" onclick="this.closest('.modal').remove();">
                Kapat
            </button>
        </div>
    `;
    
    document.body.appendChild(panel);
}

// CSS ekle
const style = document.createElement('style');
style.textContent = `
    .milestone-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        animation: fadeIn 0.3s;
    }
    
    .milestone-content {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        padding: 3rem;
        border-radius: 20px;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    .milestone-icon {
        font-size: 5rem;
        margin-bottom: 1rem;
        animation: rotate 2s infinite;
    }
    
    .milestone-content h2 {
        margin: 0 0 1rem 0;
        font-size: 2rem;
    }
    
    .milestone-content p {
        margin: 0 0 1.5rem 0;
        font-size: 1.2rem;
        opacity: 0.9;
    }
    
    .milestone-reward {
        font-size: 2rem;
        font-weight: bold;
        margin: 1.5rem 0;
        text-shadow: 0 0 20px rgba(255,255,255,0.5);
    }
    
    .progress-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
    }
    
    .stat-item {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .stat-icon {
        font-size: 2.5rem;
    }
    
    .stat-value {
        font-size: 2rem;
        font-weight: bold;
    }
    
    .stat-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    
    .milestones-list {
        max-height: 200px;
        overflow-y: auto;
    }
    
    .milestone-item {
        background: #f3f4f6;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    @keyframes bounceIn {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    @keyframes rotate {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-10deg); }
        75% { transform: rotate(10deg); }
    }
`;
document.head.appendChild(style);

// Sayfa yüklendiğinde
loadProgress();

console.log('✅ İlerleme takip sistemi hazır!');
