// Ses Efektleri Sistemi

const sounds = {
    click: null,
    success: null,
    error: null,
    levelUp: null,
    achievement: null,
    notification: null
};

let soundEnabled = true;

// Ses ayarlarını yükle
function loadSoundSettings() {
    const saved = localStorage.getItem('soundEnabled');
    soundEnabled = saved === null ? true : saved === 'true';
    updateSoundIcon();
}

// Ses aç/kapat
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    updateSoundIcon();
    
    if (soundEnabled) {
        showToast('🔊 Sesler açıldı', 'success');
        playSound('success');
    } else {
        showToast('🔇 Sesler kapatıldı', 'warning');
    }
}

// Ses ikonunu güncelle
function updateSoundIcon() {
    const icons = document.querySelectorAll('.sound-icon');
    icons.forEach(icon => {
        icon.textContent = soundEnabled ? '🔊' : '🔇';
    });
}

// Web Audio API ile ses oluştur
function createBeep(frequency, duration, type = 'sine') {
    if (!soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Ses çalınamadı:', e);
    }
}

// Ses efektlerini çal
function playSound(type) {
    if (!soundEnabled) return;
    
    switch(type) {
        case 'click':
            createBeep(800, 0.1);
            break;
        case 'success':
            createBeep(523.25, 0.1); // C
            setTimeout(() => createBeep(659.25, 0.1), 100); // E
            setTimeout(() => createBeep(783.99, 0.2), 200); // G
            break;
        case 'error':
            createBeep(200, 0.3, 'sawtooth');
            break;
        case 'levelUp':
            createBeep(523.25, 0.1);
            setTimeout(() => createBeep(659.25, 0.1), 100);
            setTimeout(() => createBeep(783.99, 0.1), 200);
            setTimeout(() => createBeep(1046.50, 0.3), 300);
            break;
        case 'achievement':
            createBeep(659.25, 0.15);
            setTimeout(() => createBeep(783.99, 0.15), 150);
            setTimeout(() => createBeep(1046.50, 0.15), 300);
            setTimeout(() => createBeep(1318.51, 0.3), 450);
            break;
        case 'notification':
            createBeep(1000, 0.1);
            setTimeout(() => createBeep(1200, 0.1), 100);
            break;
    }
}

// Buton tıklama sesi ekle
document.addEventListener('DOMContentLoaded', () => {
    loadSoundSettings();
    
    // Tüm butonlara ses ekle
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, .btn-primary, .btn-secondary, .choice-card')) {
            playSound('click');
        }
    });
});

// Toast gösterildiğinde ses çal
const originalShowToast = window.showToast;
if (originalShowToast) {
    window.showToast = function(message, type = 'success') {
        if (type === 'success') playSound('success');
        else if (type === 'error') playSound('error');
        else if (type === 'warning') playSound('notification');
        
        return originalShowToast(message, type);
    };
}
