// Otomatik Bildirim Sistemi
console.log('🔔 Otomatik bildirim sistemi yüklendi');

let notificationInterval;
let reminderInterval;

const NOTIFICATIONS = [
    {
        title: '🎁 Günlük Ödülün Bekliyor!',
        message: 'Bugünün ödülünü almayı unutma!',
        action: () => checkDailyReward(),
        delay: 300000 // 5 dakika
    },
    {
        title: '🎮 Yeni Senaryo Oyna!',
        message: 'Combo yaparak daha fazla XP kazan!',
        action: () => showToast('Senaryo oynamaya başla! 🎮', 'info'),
        delay: 600000 // 10 dakika
    },
    {
        title: '🎡 Mini Oyunları Denedin mi?',
        message: 'Şans çarkı, kazı kazan ve daha fazlası!',
        action: () => showToast('Mini oyunlara göz at! 🎲', 'info'),
        delay: 900000 // 15 dakika
    },
    {
        title: '🏆 Liderlikte Yüksel!',
        message: 'Sıralamanda ilerle, ödüller kazan!',
        action: () => showLeaderboard(),
        delay: 1200000 // 20 dakika
    },
    {
        title: '👥 Arkadaşlarını Davet Et!',
        message: 'Her arkadaş için 200 XP kazan!',
        action: () => showReferralPanel(),
        delay: 1500000 // 25 dakika
    }
];

function startAutoNotifications() {
    if (!currentUser) return;
    
    // Her 5 dakikada bir bildirim göster
    notificationInterval = setInterval(() => {
        const randomNotif = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
        showAutoNotification(randomNotif);
    }, 300000); // 5 dakika
    
    // İlk bildirimi 2 dakika sonra göster
    setTimeout(() => {
        const firstNotif = NOTIFICATIONS[0];
        showAutoNotification(firstNotif);
    }, 120000); // 2 dakika
}

function showAutoNotification(notif) {
    const notification = document.createElement('div');
    notification.className = 'auto-notification';
    notification.innerHTML = `
        <div class="notif-content">
            <div class="notif-title">${notif.title}</div>
            <div class="notif-message">${notif.message}</div>
        </div>
        <button class="notif-action" onclick="handleNotificationAction(this)">
            Aç →
        </button>
        <button class="notif-close" onclick="this.closest('.auto-notification').remove()">
            ✕
        </button>
    `;
    
    notification.dataset.action = NOTIFICATIONS.indexOf(notif);
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    playSound('notification');
    
    // 10 saniye sonra otomatik kapat
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }
    }, 10000);
}

function handleNotificationAction(button) {
    const notification = button.closest('.auto-notification');
    const actionIndex = parseInt(notification.dataset.action);
    const notif = NOTIFICATIONS[actionIndex];
    
    if (notif && notif.action) {
        notif.action();
    }
    
    notification.remove();
}

// Aktivite Takibi
let lastActivityTime = Date.now();
let inactivityWarningShown = false;

function trackActivity() {
    lastActivityTime = Date.now();
    inactivityWarningShown = false;
}

// Mouse ve keyboard aktivitelerini takip et
document.addEventListener('mousemove', trackActivity);
document.addEventListener('keydown', trackActivity);
document.addEventListener('click', trackActivity);
document.addEventListener('scroll', trackActivity);

// İnaktivite kontrolü
setInterval(() => {
    const inactiveTime = Date.now() - lastActivityTime;
    
    // 3 dakika inaktif
    if (inactiveTime > 180000 && !inactivityWarningShown) {
        inactivityWarningShown = true;
        showInactivityWarning();
    }
}, 60000); // Her dakika kontrol et

function showInactivityWarning() {
    const warning = document.createElement('div');
    warning.className = 'inactivity-warning';
    warning.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">😴</div>
            <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">
                Hala burada mısın?
            </div>
            <div style="font-size: 1rem; opacity: 0.9; margin-bottom: 1.5rem; color: var(--text-secondary);">
                Görevlerin seni bekliyor! Devam et ve ödüller kazan!
            </div>
            <button class="btn-primary" onclick="this.closest('.inactivity-warning').remove(); showDailyQuestsPanel();">
                Görevlere Dön! 🎯
            </button>
        </div>
    `;
    
    document.body.appendChild(warning);
    
    setTimeout(() => warning.classList.add('show'), 100);
    playSound('alert');
    
    setTimeout(() => {
        if (warning.parentElement) {
            warning.classList.remove('show');
            setTimeout(() => warning.remove(), 500);
        }
    }, 15000);
}

// Sayfa kapatma uyarısı
window.addEventListener('beforeunload', (e) => {
    if (currentUser) {
        const quests = currentUser.dailyQuests || [];
        const incompletequests = quests.filter(q => !q.completed).length;
        
        if (incompletequests > 0) {
            e.preventDefault();
            e.returnValue = `${incompletequests} görevin henüz tamamlanmadı! Çıkmak istediğinden emin misin?`;
            return e.returnValue;
        }
    }
});

// Geri dönüş mesajı
let returningUserMessageShown = false;

function checkReturningUser() {
    if (!currentUser || returningUserMessageShown) return;
    
    const lastVisit = currentUser.lastVisit || Date.now();
    const timeSinceLastVisit = Date.now() - lastVisit;
    
    // 1 saatten fazla geçmişse
    if (timeSinceLastVisit > 3600000) {
        returningUserMessageShown = true;
        showWelcomeBackMessage();
    }
    
    currentUser.lastVisit = Date.now();
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
}

function showWelcomeBackMessage() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; max-width: 400px; background: rgba(30, 41, 59, 0.98); backdrop-filter: blur(20px);">
            <div style="font-size: 5rem; animation: bounce 1s ease infinite;">👋</div>
            <h2 style="font-size: 2rem; margin: 1rem 0; color: var(--text-primary);">Tekrar Hoş Geldin!</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                Seni özledik! İşte seni bekleyen şeyler:
            </p>
            <div style="background: rgba(15, 23, 42, 0.8); padding: 1.5rem; border-radius: 12px; text-align: left; margin-bottom: 2rem; border: 2px solid rgba(99, 102, 241, 0.3);">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <span style="font-size: 2rem;">🎁</span>
                    <span style="color: var(--text-primary);">Günlük ödülün hazır</span>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <span style="font-size: 2rem;">📅</span>
                    <span style="color: var(--text-primary);">Yeni görevler eklendi</span>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <span style="font-size: 2rem;">🎮</span>
                    <span style="color: var(--text-primary);">Mini oyunlar seni bekliyor</span>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 2rem;">🏆</span>
                    <span style="color: var(--text-primary);">Liderlikte yükselme zamanı</span>
                </div>
            </div>
            <button class="btn-primary btn-full" onclick="this.closest('.modal').remove(); showDailyQuestsPanel();">
                Hadi Başlayalım! 🚀
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    playSound('welcome');
}

// Sayfa yüklendiğinde başlat
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (currentUser) {
                startAutoNotifications();
                checkReturningUser();
            }
        }, 5000); // 5 saniye sonra başlat
    });
}
