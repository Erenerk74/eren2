// Sosyal Özellikler ve Liderlik Tablosu

// Liderlik Tablosu
function showLeaderboard() {
    const users = getFromStorage('users') || [];
    const students = users.filter(u => u.type === 'student');
    
    // Sıralama: Senaryo sayısı ve sürdürülebilir şehir sayısı
    const leaderboard = students.map(student => {
        const sustainableCount = (student.scenarios || []).filter(s => 
            s.finalType && s.finalType.includes('Sürdürülebilir')
        ).length;
        
        return {
            name: student.name,
            scenarios: (student.scenarios || []).length,
            sustainable: sustainableCount,
            level: student.level || 1,
            score: sustainableCount * 100 + (student.scenarios || []).length * 10
        };
    }).sort((a, b) => b.score - a.score);
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content leaderboard-modal">
            <h2>🏆 Liderlik Tablosu</h2>
            <div class="leaderboard-filters">
                <button class="filter-btn active" onclick="filterLeaderboard('all')">Tümü</button>
                <button class="filter-btn" onclick="filterLeaderboard('class')">Sınıfım</button>
                <button class="filter-btn" onclick="filterLeaderboard('week')">Bu Hafta</button>
            </div>
            <div class="leaderboard-list">
                ${leaderboard.slice(0, 10).map((player, index) => `
                    <div class="leaderboard-item ${index < 3 ? 'top-' + (index + 1) : ''}">
                        <div class="rank">${getRankIcon(index + 1)}</div>
                        <div class="player-info">
                            <div class="player-name">${player.name}</div>
                            <div class="player-stats">
                                Seviye ${player.level} • ${player.scenarios} Senaryo • ${player.sustainable} Sürdürülebilir
                            </div>
                        </div>
                        <div class="player-score">${player.score}</div>
                    </div>
                `).join('')}
            </div>
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function getRankIcon(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
}

function filterLeaderboard(filter) {
    // Filtreleme mantığı
    showToast(`Filtre: ${filter}`, 'info');
}

// Arkadaş Sistemi
function showFriendsPanel() {
    const friends = currentUser.friends || [];
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content friends-modal">
            <h2>👥 Arkadaşlarım</h2>
            <div class="friends-search">
                <input type="text" id="friend-search" placeholder="Arkadaş ara (kullanıcı adı)..." />
                <button class="btn-primary" onclick="searchFriend()">Ara</button>
            </div>
            <div class="friends-list">
                ${friends.length === 0 ? '<p>Henüz arkadaşın yok. Arkadaş ekle!</p>' : ''}
                ${friends.map(friendId => {
                    const users = getFromStorage('users') || [];
                    const friend = users.find(u => u.id === friendId);
                    if (!friend) return '';
                    
                    const lastScenario = friend.scenarios && friend.scenarios.length > 0
                        ? friend.scenarios[friend.scenarios.length - 1]
                        : null;
                    
                    return `
                        <div class="friend-item">
                            <div class="friend-avatar">👤</div>
                            <div class="friend-info">
                                <div class="friend-name">${friend.name}</div>
                                <div class="friend-status">
                                    ${lastScenario ? `Son: ${lastScenario.finalType}` : 'Henüz oynamadı'}
                                </div>
                            </div>
                            <button class="btn-small btn-secondary" onclick="viewFriendProfile(${friendId})">
                                Profil
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function searchFriend() {
    const username = document.getElementById('friend-search').value.trim();
    if (!username) {
        showToast('Lütfen kullanıcı adı girin!', 'error');
        return;
    }
    
    const users = getFromStorage('users') || [];
    const friend = users.find(u => u.email === username && u.id !== currentUser.id);
    
    if (!friend) {
        showToast('Kullanıcı bulunamadı!', 'error');
        return;
    }
    
    if (currentUser.friends && currentUser.friends.includes(friend.id)) {
        showToast('Bu kullanıcı zaten arkadaşın!', 'warning');
        return;
    }
    
    addFriend(friend.id);
}

function addFriend(friendId) {
    currentUser.friends = currentUser.friends || [];
    currentUser.friends.push(friendId);
    
    const users = getFromStorage('users') || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex] = currentUser;
    saveToStorage('users', users);
    saveToStorage('currentUser', currentUser);
    
    showToast('Arkadaş eklendi!', 'success');
    checkAchievement('social_butterfly', currentUser.friends.length);
    
    // Paneli yenile
    document.querySelector('.friends-modal').closest('.modal').remove();
    showFriendsPanel();
}

function viewFriendProfile(friendId) {
    const users = getFromStorage('users') || [];
    const friend = users.find(u => u.id === friendId);
    if (!friend) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content profile-modal">
            <div class="profile-header">
                <div class="profile-avatar">👤</div>
                <h2>${friend.name}</h2>
                <p>Seviye ${friend.level || 1}</p>
            </div>
            <div class="profile-stats">
                <div class="stat-box">
                    <div class="stat-value">${(friend.scenarios || []).length}</div>
                    <div class="stat-label">Senaryo</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${(friend.badges || []).length}</div>
                    <div class="stat-label">Rozet</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${friend.level || 1}</div>
                    <div class="stat-label">Seviye</div>
                </div>
            </div>
            <div class="profile-achievements">
                <h3>Son Başarılar</h3>
                ${(friend.scenarios || []).slice(-3).map(s => `
                    <div class="achievement-item">
                        <span>${s.finalType}</span>
                        <small>${new Date(s.date).toLocaleDateString('tr-TR')}</small>
                    </div>
                `).join('') || '<p>Henüz başarı yok</p>'}
            </div>
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Paylaşım Özellikleri
function shareResult(scenarioId) {
    const scenario = currentUser.scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    const shareText = `KararLab'da ${scenario.finalType} kurdum! 🏙️\n\nSen de dene: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'KararLab - Novaşehir',
            text: shareText,
            url: window.location.href
        }).then(() => {
            showToast('Paylaşıldı!', 'success');
            checkDailyQuest('share_result');
        }).catch(() => {});
    } else {
        // Fallback: Kopyala
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Metin kopyalandı! Sosyal medyada paylaşabilirsin.', 'success');
            checkDailyQuest('share_result');
        });
    }
}

// Yorum Sistemi
function showComments(scenarioId) {
    const comments = getFromStorage('comments') || {};
    const scenarioComments = comments[scenarioId] || [];
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content comments-modal">
            <h2>💬 Yorumlar</h2>
            <div class="comment-input">
                <textarea id="new-comment" placeholder="Yorumunuzu yazın..."></textarea>
                <button class="btn-primary" onclick="addComment(${scenarioId})">Gönder</button>
            </div>
            <div class="comments-list">
                ${scenarioComments.length === 0 ? '<p>Henüz yorum yok. İlk yorumu sen yap!</p>' : ''}
                ${scenarioComments.map(comment => `
                    <div class="comment-item">
                        <div class="comment-header">
                            <strong>${comment.userName}</strong>
                            <small>${new Date(comment.date).toLocaleDateString('tr-TR')}</small>
                        </div>
                        <p>${comment.text}</p>
                    </div>
                `).join('')}
            </div>
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function addComment(scenarioId) {
    const text = document.getElementById('new-comment').value.trim();
    if (!text) {
        showToast('Lütfen bir yorum yazın!', 'error');
        return;
    }
    
    const comments = getFromStorage('comments') || {};
    comments[scenarioId] = comments[scenarioId] || [];
    
    comments[scenarioId].push({
        userId: currentUser.id,
        userName: currentUser.name,
        text: text,
        date: Date.now()
    });
    
    saveToStorage('comments', comments);
    showToast('Yorum eklendi!', 'success');
    
    // Yorumları yenile
    document.querySelector('.comments-modal').closest('.modal').remove();
    showComments(scenarioId);
}

// Modal kapatma
function closeModal(event) {
    const modal = event.target.closest('.modal');
    if (modal) modal.remove();
}


// Başarılar Paneli
function showAchievements() {
    loadAchievements();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const achievementsList = Object.entries(achievements).map(([id, achievement]) => `
        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon-large">${achievement.name.split(' ')[0]}</div>
            <div class="achievement-details">
                <h4>${achievement.name}</h4>
                <p>${achievement.desc}</p>
                ${achievement.count !== undefined ? `<small>İlerleme: ${achievement.count}/${achievement.target || 3}</small>` : ''}
            </div>
            <div class="achievement-status">
                ${achievement.unlocked ? '✅' : '🔒'}
            </div>
        </div>
    `).join('');
    
    const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
    const totalCount = Object.keys(achievements).length;
    
    modal.innerHTML = `
        <div class="modal-content achievements-modal">
            <h2>🎯 Başarılarım</h2>
            <div class="achievements-progress">
                <p>${unlockedCount} / ${totalCount} Başarı Açıldı</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${(unlockedCount / totalCount) * 100}%"></div>
                </div>
            </div>
            <div class="achievements-list">
                ${achievementsList}
            </div>
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Günlük Görevler Paneli
function showDailyQuests() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const questsList = dailyQuests.map(quest => `
        <div class="quest-card ${quest.completed ? 'completed' : ''}">
            <div class="quest-icon">${quest.completed ? '✅' : '📋'}</div>
            <div class="quest-details">
                <h4>${quest.name}</h4>
                ${quest.progress !== undefined ? `
                    <div class="quest-progress">
                        <div class="quest-progress-bar" style="width: ${(quest.progress / quest.target) * 100}%"></div>
                    </div>
                    <small>${quest.progress} / ${quest.target}</small>
                ` : ''}
            </div>
            <div class="quest-reward">+${quest.xp} XP</div>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class="modal-content quests-modal">
            <h2>📅 Günlük Görevler</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                Her gün yeni görevler! Tamamla ve XP kazan.
            </p>
            <div class="quests-list">
                ${questsList}
            </div>
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}
