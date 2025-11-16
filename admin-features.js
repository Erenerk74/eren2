// Admin Panel Gelişmiş Özellikler

// Kullanıcı Arama
function searchUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const filterType = document.getElementById('user-filter').value;
    
    const users = getFromStorage('users') || [];
    let filteredUsers = users;
    
    // Tip filtreleme
    if (filterType !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.type === filterType);
    }
    
    // Arama
    if (searchTerm) {
        filteredUsers = filteredUsers.filter(u => 
            u.name.toLowerCase().includes(searchTerm) ||
            u.email.toLowerCase().includes(searchTerm)
        );
    }
    
    loadAdminUsersList(filteredUsers);
    
    // Sonuç sayısını göster
    document.getElementById('search-results').textContent = 
        `${filteredUsers.length} kullanıcı bulundu`;
}

// Toplu İşlemler
let selectedUsers = [];

function toggleUserSelection(userId) {
    const index = selectedUsers.indexOf(userId);
    if (index > -1) {
        selectedUsers.splice(index, 1);
    } else {
        selectedUsers.push(userId);
    }
    updateBulkActionsBar();
}

function selectAllUsers() {
    const users = getFromStorage('users') || [];
    selectedUsers = users.map(u => u.id);
    updateBulkActionsBar();
    loadAdminUsersList(users);
}

function deselectAllUsers() {
    selectedUsers = [];
    updateBulkActionsBar();
    const users = getFromStorage('users') || [];
    loadAdminUsersList(users);
}

function updateBulkActionsBar() {
    const bar = document.getElementById('bulk-actions-bar');
    const count = document.getElementById('selected-count');
    
    if (selectedUsers.length > 0) {
        bar.style.display = 'flex';
        count.textContent = selectedUsers.length;
    } else {
        bar.style.display = 'none';
    }
}

function bulkDeleteUsers() {
    if (!confirm(`${selectedUsers.length} kullanıcıyı silmek istediğinizden emin misiniz?`)) return;
    
    let users = getFromStorage('users') || [];
    users = users.filter(u => !selectedUsers.includes(u.id));
    saveToStorage('users', users);
    
    selectedUsers = [];
    showToast(`Kullanıcılar silindi!`, 'success');
    loadAdminPanel();
}

function bulkExportUsers() {
    const users = getFromStorage('users') || [];
    const selectedData = users.filter(u => selectedUsers.includes(u.id));
    
    const dataStr = JSON.stringify(selectedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `secili_kullanicilar_${Date.now()}.json`;
    link.click();
    
    showToast('Seçili kullanıcılar indirildi!', 'success');
}

// Aktivite Logu
function showActivityLog() {
    const activities = getFromStorage('activities') || [];
    const recentActivities = activities.slice(-50).reverse();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content activity-log-modal">
            <h2>📋 Aktivite Logu</h2>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                Son 50 aktivite
            </p>
            <div class="activity-list">
                ${recentActivities.length > 0 ? recentActivities.map(activity => {
                    const user = getFromStorage('users').find(u => u.id === activity.userId);
                    return `
                        <div class="activity-item">
                            <div class="activity-icon">${getActivityIcon(activity.action)}</div>
                            <div class="activity-details">
                                <strong>${user ? user.name : 'Bilinmeyen'}</strong>
                                <p>${getActivityText(activity.action)}</p>
                                <small>${new Date(activity.timestamp).toLocaleString('tr-TR')}</small>
                            </div>
                        </div>
                    `;
                }).join('') : '<p style="text-align: center; color: var(--text-secondary);">Henüz aktivite yok</p>'}
            </div>
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function getActivityIcon(action) {
    const icons = {
        'page_load': '👁️',
        'scenario_start': '🎮',
        'scenario_complete': '✅',
        'login': '🔐',
        'register': '📝'
    };
    return icons[action] || '📌';
}

function getActivityText(action) {
    const texts = {
        'page_load': 'Sayfayı görüntüledi',
        'scenario_start': 'Senaryo başlattı',
        'scenario_complete': 'Senaryo tamamladı',
        'login': 'Giriş yaptı',
        'register': 'Kayıt oldu'
    };
    return texts[action] || action;
}

// Sistem Sağlığı
function showSystemHealth() {
    const users = getFromStorage('users') || [];
    const activities = getFromStorage('activities') || [];
    const comments = getFromStorage('comments') || {};
    
    // LocalStorage boyutu
    let totalSize = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length;
        }
    }
    const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);
    
    // Son aktivite
    const lastActivity = activities.length > 0 
        ? new Date(activities[activities.length - 1].timestamp)
        : new Date();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content system-health-modal">
            <h2>🏥 Sistem Sağlığı</h2>
            
            <div class="health-grid">
                <div class="health-card">
                    <div class="health-icon">💾</div>
                    <h4>Depolama</h4>
                    <p class="health-value">${sizeInMB} MB</p>
                    <small>LocalStorage kullanımı</small>
                </div>
                
                <div class="health-card">
                    <div class="health-icon">👥</div>
                    <h4>Kullanıcılar</h4>
                    <p class="health-value">${users.length}</p>
                    <small>Toplam kayıtlı</small>
                </div>
                
                <div class="health-card">
                    <div class="health-icon">📊</div>
                    <h4>Aktiviteler</h4>
                    <p class="health-value">${activities.length}</p>
                    <small>Toplam kayıt</small>
                </div>
                
                <div class="health-card">
                    <div class="health-icon">💬</div>
                    <h4>Yorumlar</h4>
                    <p class="health-value">${Object.keys(comments).length}</p>
                    <small>Toplam senaryo</small>
                </div>
            </div>
            
            <div class="health-info">
                <h4>📅 Son Aktivite</h4>
                <p>${lastActivity.toLocaleString('tr-TR')}</p>
                
                <h4 style="margin-top: 1.5rem;">⚠️ Öneriler</h4>
                <ul>
                    ${sizeInMB > 5 ? '<li>Depolama 5MB üzerinde. Eski verileri temizlemeyi düşünün.</li>' : ''}
                    ${users.length > 100 ? '<li>100+ kullanıcı var. Performans için veritabanı kullanmayı düşünün.</li>' : ''}
                    ${activities.length > 1000 ? '<li>1000+ aktivite kaydı. Eski kayıtları arşivleyin.</li>' : ''}
                    ${sizeInMB < 1 && users.length < 10 ? '<li>✅ Sistem sağlıklı görünüyor!</li>' : ''}
                </ul>
            </div>
            
            <div class="health-actions">
                <button class="btn-secondary" onclick="clearOldActivities()">Eski Aktiviteleri Temizle</button>
                <button class="btn-secondary" onclick="optimizeStorage()">Depolamayı Optimize Et</button>
            </div>
            
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function clearOldActivities() {
    const activities = getFromStorage('activities') || [];
    const recent = activities.slice(-100); // Son 100'ü tut
    saveToStorage('activities', recent);
    showToast(`${activities.length - recent.length} eski aktivite temizlendi!`, 'success');
    document.querySelector('.system-health-modal').closest('.modal').remove();
    showSystemHealth();
}

function optimizeStorage() {
    // Gereksiz verileri temizle
    const users = getFromStorage('users') || [];
    
    // Boş scenario'ları temizle
    users.forEach(user => {
        if (user.scenarios) {
            user.scenarios = user.scenarios.filter(s => s && s.id);
        }
    });
    
    saveToStorage('users', users);
    showToast('Depolama optimize edildi!', 'success');
}

// Hızlı İstatistikler Widget
function createQuickStatsWidget() {
    const users = getFromStorage('users') || [];
    const activities = getFromStorage('activities') || [];
    
    const today = new Date().toDateString();
    const todayActivities = activities.filter(a => 
        new Date(a.timestamp).toDateString() === today
    );
    
    const activeUsers = new Set(todayActivities.map(a => a.userId)).size;
    
    return `
        <div class="quick-stats-widget">
            <div class="quick-stat">
                <span class="stat-label">Bugün Aktif:</span>
                <span class="stat-value">${activeUsers}</span>
            </div>
            <div class="quick-stat">
                <span class="stat-label">Bugün Aktivite:</span>
                <span class="stat-value">${todayActivities.length}</span>
            </div>
        </div>
    `;
}
