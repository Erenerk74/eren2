// Bildirim Merkezi

let notifications = [];

// Bildirim oluştur
function createNotification(title, message, type = 'info', actionUrl = null) {
    const notification = {
        id: Date.now(),
        title: title,
        message: message,
        type: type, // info, success, warning, error
        actionUrl: actionUrl,
        read: false,
        timestamp: Date.now()
    };
    
    notifications.unshift(notification);
    saveNotifications();
    updateNotificationBadge();
    
    return notification;
}

// Bildirimleri kaydet
function saveNotifications() {
    if (currentUser) {
        currentUser.notifications = notifications;
        const users = getFromStorage('users') || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            saveToStorage('users', users);
        }
    }
}

// Bildirimleri yükle
function loadNotifications() {
    if (currentUser && currentUser.notifications) {
        notifications = currentUser.notifications;
        updateNotificationBadge();
    }
}

// Bildirim rozetini güncelle
function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badges = document.querySelectorAll('.notification-badge');
    
    badges.forEach(badge => {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Bildirim merkezini göster
function showNotificationCenter() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const notificationsList = notifications.length > 0 
        ? notifications.map(notif => `
            <div class="notification-item ${notif.read ? 'read' : 'unread'} ${notif.type}" onclick="markAsRead(${notif.id})">
                <div class="notification-icon">
                    ${getNotificationIcon(notif.type)}
                </div>
                <div class="notification-content">
                    <h4>${notif.title}</h4>
                    <p>${notif.message}</p>
                    <small>${getTimeAgo(notif.timestamp)}</small>
                </div>
                ${notif.actionUrl ? `<button class="btn-small btn-primary" onclick="handleNotificationAction('${notif.actionUrl}')">Git</button>` : ''}
            </div>
        `).join('')
        : '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Henüz bildirim yok</p>';
    
    modal.innerHTML = `
        <div class="modal-content notification-center">
            <div class="notification-header">
                <h2>🔔 Bildirimler</h2>
                <button class="btn-small btn-secondary" onclick="markAllAsRead()">Tümünü Okundu İşaretle</button>
            </div>
            <div class="notifications-list">
                ${notificationsList}
            </div>
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Bildirimi okundu işaretle
function markAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        saveNotifications();
        updateNotificationBadge();
    }
}

// Tümünü okundu işaretle
function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    saveNotifications();
    updateNotificationBadge();
    showToast('Tüm bildirimler okundu işaretlendi', 'success');
    
    // Modalı yenile
    document.querySelector('.notification-center').closest('.modal').remove();
    showNotificationCenter();
}

// Bildirim ikonu
function getNotificationIcon(type) {
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        achievement: '🏆',
        friend: '👥',
        level: '⭐'
    };
    return icons[type] || 'ℹ️';
}

// Zaman farkı hesapla
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return new Date(timestamp).toLocaleDateString('tr-TR');
}

// Bildirim aksiyonu
function handleNotificationAction(url) {
    // URL'ye göre aksiyon al
    console.log('Navigating to:', url);
}

// Otomatik bildirimler
function setupAutoNotifications() {
    // Hoş geldin bildirimi
    if (currentUser && (!currentUser.notifications || currentUser.notifications.length === 0)) {
        createNotification(
            'Hoş Geldin! 🎉',
            'KararLab\'a hoş geldin! İlk senaryonu oynamaya hazır mısın?',
            'success'
        );
    }
    
    // Günlük görev hatırlatması
    const lastLogin = localStorage.getItem('lastLogin');
    const today = new Date().toDateString();
    
    if (lastLogin !== today) {
        localStorage.setItem('lastLogin', today);
        
        if (currentUser) {
            createNotification(
                'Günlük Görevler 📅',
                'Yeni günlük görevler seni bekliyor! Tamamla ve XP kazan.',
                'info'
            );
        }
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        loadNotifications();
        setupAutoNotifications();
    }
});
