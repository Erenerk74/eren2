// Bulut Senkronizasyon Sistemi
// LocalStorage yerine merkezi veri yönetimi

const STORAGE_KEY = 'kararlab_cloud_data';
const SYNC_INTERVAL = 5000; // 5 saniye

// Merkezi veri deposu
let cloudData = {
    users: [],
    activities: [],
    comments: {},
    lastSync: Date.now()
};

// Veriyi yükle
function loadCloudData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            cloudData = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Veri yükleme hatası:', e);
    }
}

// Veriyi kaydet
function saveCloudData() {
    try {
        cloudData.lastSync = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
    } catch (e) {
        console.error('Veri kaydetme hatası:', e);
    }
}

// Kullanıcıları al
function getUsers() {
    return cloudData.users || [];
}

// Kullanıcıları kaydet
function saveUsers(users) {
    cloudData.users = users;
    saveCloudData();
}

// Eski storage'ı yeni sisteme taşı
function migrateOldData() {
    const oldUsers = localStorage.getItem('users');
    const oldActivities = localStorage.getItem('activities');
    const oldComments = localStorage.getItem('comments');
    
    if (oldUsers && !cloudData.users.length) {
        try {
            cloudData.users = JSON.parse(oldUsers);
            console.log('Kullanıcılar taşındı:', cloudData.users.length);
        } catch (e) {}
    }
    
    if (oldActivities && !cloudData.activities.length) {
        try {
            cloudData.activities = JSON.parse(oldActivities);
        } catch (e) {}
    }
    
    if (oldComments && !Object.keys(cloudData.comments).length) {
        try {
            cloudData.comments = JSON.parse(oldComments);
        } catch (e) {}
    }
    
    saveCloudData();
}

// Storage fonksiyonlarını override et
const originalGetFromStorage = window.getFromStorage;
const originalSaveToStorage = window.saveToStorage;

window.getFromStorage = function(key) {
    loadCloudData();
    
    switch(key) {
        case 'users':
            return cloudData.users || [];
        case 'activities':
            return cloudData.activities || [];
        case 'comments':
            return cloudData.comments || {};
        case 'currentUser':
            return localStorage.getItem('currentUser') 
                ? JSON.parse(localStorage.getItem('currentUser')) 
                : null;
        default:
            return originalGetFromStorage ? originalGetFromStorage(key) : null;
    }
};

window.saveToStorage = function(key, data) {
    switch(key) {
        case 'users':
            cloudData.users = data;
            saveCloudData();
            break;
        case 'activities':
            cloudData.activities = data;
            saveCloudData();
            break;
        case 'comments':
            cloudData.comments = data;
            saveCloudData();
            break;
        case 'currentUser':
            localStorage.setItem('currentUser', JSON.stringify(data));
            break;
        default:
            if (originalSaveToStorage) {
                originalSaveToStorage(key, data);
            }
    }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadCloudData();
    migrateOldData();
    
    // Periyodik senkronizasyon
    setInterval(() => {
        loadCloudData();
    }, SYNC_INTERVAL);
});

// Sayfa kapanmadan önce kaydet
window.addEventListener('beforeunload', () => {
    saveCloudData();
});

console.log('☁️ Bulut senkronizasyon aktif');
