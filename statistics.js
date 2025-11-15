// Gelişmiş İstatistik Sistemi

// Kullanıcı aktivite takibi
function trackActivity(action, data = {}) {
    const activities = getFromStorage('activities') || [];
    
    activities.push({
        userId: currentUser?.id,
        action: action,
        data: data,
        timestamp: Date.now()
    });
    
    // Son 1000 aktiviteyi tut
    if (activities.length > 1000) {
        activities.shift();
    }
    
    saveToStorage('activities', activities);
}

// Kullanıcı istatistikleri
function getUserStats(userId) {
    const users = getFromStorage('users') || [];
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    
    const scenarios = user.scenarios || [];
    const activities = getFromStorage('activities') || [];
    const userActivities = activities.filter(a => a.userId === userId);
    
    // Oyun süresi hesapla (yaklaşık)
    const playTime = scenarios.length * 15; // Her senaryo ~15 dakika
    
    // En çok tercih edilen kararlar
    const decisions = {};
    scenarios.forEach(scenario => {
        (scenario.decisions || []).forEach(decision => {
            const key = `Tur${decision.turn}-${decision.choice}`;
            decisions[key] = (decisions[key] || 0) + 1;
        });
    });
    
    // Başarı oranı
    const sustainableCount = scenarios.filter(s => 
        s.finalType && s.finalType.includes('Sürdürülebilir')
    ).length;
    const successRate = scenarios.length > 0 
        ? (sustainableCount / scenarios.length * 100).toFixed(1) 
        : 0;
    
    // Aktif günler
    const activeDays = new Set();
    userActivities.forEach(activity => {
        const date = new Date(activity.timestamp).toDateString();
        activeDays.add(date);
    });
    
    return {
        totalScenarios: scenarios.length,
        playTime: playTime,
        successRate: successRate,
        activeDays: activeDays.size,
        level: user.level || 1,
        xp: user.xp || 0,
        badges: (user.badges || []).length,
        friends: (user.friends || []).length,
        decisions: decisions,
        lastActive: userActivities.length > 0 
            ? userActivities[userActivities.length - 1].timestamp 
            : user.id
    };
}

// Kişisel istatistik paneli
function showPersonalStats() {
    if (!currentUser) return;
    
    const stats = getUserStats(currentUser.id);
    if (!stats) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content stats-dashboard">
            <h2>📊 Kişisel İstatistiklerim</h2>
            
            <div class="stats-overview">
                <div class="stat-box-large hover-lift">
                    <div class="stat-icon-large">🎮</div>
                    <h3 data-count="${stats.totalScenarios}">${stats.totalScenarios}</h3>
                    <p>Toplam Senaryo</p>
                </div>
                
                <div class="stat-box-large hover-lift">
                    <div class="stat-icon-large">⏱️</div>
                    <h3 data-count="${stats.playTime}">${stats.playTime}</h3>
                    <p>Dakika Oynadın</p>
                </div>
                
                <div class="stat-box-large hover-lift">
                    <div class="stat-icon-large">🌱</div>
                    <h3>${stats.successRate}%</h3>
                    <p>Sürdürülebilirlik Oranı</p>
                </div>
                
                <div class="stat-box-large hover-lift">
                    <div class="stat-icon-large">📅</div>
                    <h3 data-count="${stats.activeDays}">${stats.activeDays}</h3>
                    <p>Aktif Gün</p>
                </div>
            </div>
            
            <div class="stats-details">
                <div class="detail-section">
                    <h4>🏆 Başarılarım</h4>
                    <div class="progress-item">
                        <span>Seviye</span>
                        <div class="progress-bar-container">
                            <div class="progress-bar progress-animated" style="width: ${(stats.level / 20) * 100}%"></div>
                        </div>
                        <span>Lvl ${stats.level}</span>
                    </div>
                    <div class="progress-item">
                        <span>Rozetler</span>
                        <div class="progress-bar-container">
                            <div class="progress-bar progress-animated" style="width: ${(stats.badges / 10) * 100}%; background: var(--warning-color);"></div>
                        </div>
                        <span>${stats.badges}/10</span>
                    </div>
                    <div class="progress-item">
                        <span>Arkadaşlar</span>
                        <div class="progress-bar-container">
                            <div class="progress-bar progress-animated" style="width: ${(stats.friends / 10) * 100}%; background: var(--success-color);"></div>
                        </div>
                        <span>${stats.friends}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>📈 Karar Analizi</h4>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                        En çok tercih ettiğin kararlar:
                    </p>
                    ${Object.entries(stats.decisions)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([key, count]) => `
                            <div class="decision-stat">
                                <span>${key}</span>
                                <span class="decision-count">${count}x</span>
                            </div>
                        `).join('') || '<p>Henüz karar vermedin</p>'}
                </div>
            </div>
            
            <div class="stats-footer">
                <p>Son Aktivite: ${new Date(stats.lastActive).toLocaleString('tr-TR')}</p>
            </div>
            
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Sayı animasyonlarını başlat
    setTimeout(() => {
        modal.querySelectorAll('[data-count]').forEach(el => {
            const target = parseInt(el.getAttribute('data-count'));
            animateNumber(el, 0, target, 1500);
        });
    }, 100);
}

// Karşılaştırma modu
function showComparison() {
    if (!currentUser || !currentUser.scenarios || currentUser.scenarios.length < 2) {
        showToast('Karşılaştırma için en az 2 senaryo gerekli!', 'warning');
        return;
    }
    
    const scenarios = currentUser.scenarios.slice(-2);
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content comparison-modal">
            <h2>⚖️ Senaryo Karşılaştırma</h2>
            
            <div class="comparison-grid">
                ${scenarios.map((scenario, index) => `
                    <div class="comparison-card">
                        <h3>Senaryo ${index + 1}</h3>
                        <p class="comparison-date">${new Date(scenario.date).toLocaleDateString('tr-TR')}</p>
                        <div class="comparison-result ${scenario.finalType.includes('Sürdürülebilir') ? 'success' : scenario.finalType.includes('Ekonomi') ? 'danger' : 'warning'}">
                            ${scenario.finalType}
                        </div>
                        <div class="comparison-indicators">
                            <div class="indicator-item">
                                <span>Hava Kalitesi</span>
                                <span class="indicator-badge">${scenario.indicators.air}</span>
                            </div>
                            <div class="indicator-item">
                                <span>Trafik</span>
                                <span class="indicator-badge">${scenario.indicators.traffic}</span>
                            </div>
                            <div class="indicator-item">
                                <span>Yeşil Alan</span>
                                <span class="indicator-badge">${scenario.indicators.green}</span>
                            </div>
                            <div class="indicator-item">
                                <span>Karbon</span>
                                <span class="indicator-badge">${scenario.indicators.carbon}</span>
                            </div>
                            <div class="indicator-item">
                                <span>Yaşam Kalitesi</span>
                                <span class="indicator-badge">${scenario.indicators.quality}</span>
                            </div>
                        </div>
                        <div class="comparison-decisions">
                            <h4>Kararlar:</h4>
                            ${(scenario.decisions || []).map(d => `
                                <span class="decision-badge">Tur ${d.turn}: ${d.choice}</span>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Aktivite takibi başlat
if (typeof window !== 'undefined') {
    // Sayfa yüklendiğinde
    window.addEventListener('load', () => {
        if (currentUser) {
            trackActivity('page_load', { page: 'dashboard' });
        }
    });
    
    // Senaryo başlatıldığında
    const originalStartScenario = window.startScenario;
    if (originalStartScenario) {
        window.startScenario = function(type) {
            trackActivity('scenario_start', { type });
            return originalStartScenario(type);
        };
    }
    
    // Senaryo tamamlandığında
    const originalSaveScenario = window.saveScenario;
    if (originalSaveScenario) {
        window.saveScenario = function(finalType) {
            trackActivity('scenario_complete', { finalType });
            return originalSaveScenario(finalType);
        };
    }
}
