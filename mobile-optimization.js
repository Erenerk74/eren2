// MOBİL OPTİMİZASYON VE PERFORMANS
console.log('📱 Mobil optimizasyon yüklendi');

// Cihaz tespiti
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);

// Ekran boyutu
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const isSmallScreen = screenWidth < 480;
const isMediumScreen = screenWidth >= 480 && screenWidth < 768;

console.log('Cihaz:', {
    isMobile,
    isIOS,
    isAndroid,
    isTablet,
    screenWidth,
    screenHeight
});

// Mobil için özel ayarlar
if (isMobile) {
    document.body.classList.add('mobile-device');
    
    if (isIOS) {
        document.body.classList.add('ios-device');
    }
    
    if (isAndroid) {
        document.body.classList.add('android-device');
    }
    
    if (isSmallScreen) {
        document.body.classList.add('small-screen');
    }
}

// Touch event optimizasyonu
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // Passive event listeners (performans için)
    let supportsPassive = false;
    try {
        const opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
            }
        });
        window.addEventListener('testPassive', null, opts);
        window.removeEventListener('testPassive', null, opts);
    } catch (e) {}
    
    if (supportsPassive) {
        // Scroll performansı için passive listeners
        document.addEventListener('touchstart', function() {}, { passive: true });
        document.addEventListener('touchmove', function() {}, { passive: true });
    }
}

// iOS Safari için viewport height düzeltmesi
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

if (isIOS) {
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
}

// Orientation change handler
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        setVH();
        // Modal'ları yeniden konumlandır
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.style.height = window.innerHeight + 'px';
        });
    }, 100);
});

// Mobil için scroll optimizasyonu
if (isMobile) {
    // Momentum scrolling
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Scroll bounce'u engelle (iOS)
    if (isIOS) {
        document.addEventListener('touchmove', function(e) {
            if (e.target.closest('.modal-content') || 
                e.target.closest('.quests-list') ||
                e.target.closest('.indicators-panel')) {
                return; // Bu elementlerde scroll'a izin ver
            }
            
            // Body scroll'u engelle
            const scrollable = e.target.closest('[style*="overflow"]');
            if (!scrollable) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

// Performans modu (düşük performanslı cihazlar için)
const isLowPerformance = isMobile && (isSmallScreen || navigator.hardwareConcurrency <= 2);

if (isLowPerformance) {
    document.body.classList.add('low-performance');
    console.log('⚡ Düşük performans modu aktif');
    
    // Animasyonları azalt
    document.querySelectorAll('.floating, .pulse, .bounce').forEach(el => {
        el.style.animation = 'none';
    });
    
    // Gradient'leri kaldır
    document.querySelectorAll('.gradient-orb').forEach(el => {
        el.style.display = 'none';
    });
}

// Bağlantı hızı kontrolü
if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
        const effectiveType = connection.effectiveType;
        console.log('Bağlantı tipi:', effectiveType);
        
        // Yavaş bağlantı
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            document.body.classList.add('slow-connection');
            console.log('🐌 Yavaş bağlantı tespit edildi');
            
            // Ağır içerikleri kaldır
            document.querySelectorAll('.gradient-orb, .confetti').forEach(el => {
                el.style.display = 'none';
            });
        }
    }
}

// Pil durumu kontrolü
if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        console.log('Pil seviyesi:', Math.round(battery.level * 100) + '%');
        
        // Düşük pil
        if (battery.level < 0.2 && !battery.charging) {
            document.body.classList.add('low-battery');
            console.log('🔋 Düşük pil modu aktif');
            
            // Animasyonları kapat
            document.querySelectorAll('*').forEach(el => {
                el.style.animation = 'none';
                el.style.transition = 'none';
            });
        }
        
        // Pil durumu değişikliklerini izle
        battery.addEventListener('levelchange', () => {
            if (battery.level < 0.2 && !battery.charging) {
                document.body.classList.add('low-battery');
            } else {
                document.body.classList.remove('low-battery');
            }
        });
    });
}

// Mobil klavye açılınca viewport düzeltmesi
if (isMobile) {
    const originalHeight = window.innerHeight;
    
    window.addEventListener('resize', () => {
        const currentHeight = window.innerHeight;
        
        // Klavye açıldı
        if (currentHeight < originalHeight * 0.75) {
            document.body.classList.add('keyboard-open');
            
            // Modal'ı yukarı kaydır
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.scrollTop = 0;
            }
        } else {
            document.body.classList.remove('keyboard-open');
        }
    });
}

// Input zoom'u engelle (iOS)
if (isIOS) {
    document.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            e.target.style.fontSize = '16px';
        }
    });
}

// Mobil için özel toast pozisyonu
if (isMobile) {
    const originalShowToast = window.showToast;
    if (originalShowToast) {
        window.showToast = function(message, type) {
            originalShowToast(message, type);
            
            // Toast'ı daha yukarı taşı (klavye ile çakışmasın)
            setTimeout(() => {
                const toasts = document.querySelectorAll('.toast');
                toasts.forEach(toast => {
                    if (document.body.classList.contains('keyboard-open')) {
                        toast.style.bottom = '60%';
                    }
                });
            }, 10);
        };
    }
}

// Mobil için modal scroll lock
function lockScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
}

function unlockScroll() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
}

// Modal açılınca scroll'u kilitle
const originalShowPage = window.showPage;
if (originalShowPage && isMobile) {
    window.showPage = function(pageId) {
        originalShowPage(pageId);
        
        // Modal açıldıysa scroll'u kilitle
        setTimeout(() => {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                lockScroll();
            }
        }, 100);
    };
}

// Performans izleme
if (isMobile) {
    let lastFrameTime = performance.now();
    let fps = 60;
    
    function measureFPS() {
        const now = performance.now();
        fps = 1000 / (now - lastFrameTime);
        lastFrameTime = now;
        
        // Düşük FPS
        if (fps < 30) {
            if (!document.body.classList.contains('low-fps')) {
                document.body.classList.add('low-fps');
                console.log('⚠️ Düşük FPS tespit edildi:', Math.round(fps));
                
                // Animasyonları kapat
                document.querySelectorAll('.floating, .pulse').forEach(el => {
                    el.style.animation = 'none';
                });
            }
        }
        
        requestAnimationFrame(measureFPS);
    }
    
    // FPS ölçümünü başlat (sadece ilk 10 saniye)
    setTimeout(() => {
        requestAnimationFrame(measureFPS);
    }, 2000);
    
    setTimeout(() => {
        lastFrameTime = null; // Ölçümü durdur
    }, 12000);
}

// Mobil için hızlı tıklama (300ms gecikmeyi kaldır)
if (isMobile) {
    let lastTouchEnd = 0;
    
    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Vibration API desteği
function vibrate(pattern) {
    if ('vibrate' in navigator && isMobile) {
        navigator.vibrate(pattern);
    }
}

// Butonlara dokunma feedback'i ekle
if (isMobile) {
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('button') || e.target.closest('.btn-primary') || e.target.closest('.btn-secondary')) {
            vibrate(10); // Hafif titreşim
        }
    });
}

// Mobil için özel log
console.log('✅ Mobil optimizasyon tamamlandı', {
    performansModu: isLowPerformance ? 'Düşük' : 'Normal',
    cihaz: isMobile ? (isTablet ? 'Tablet' : 'Telefon') : 'Masaüstü',
    ekran: `${screenWidth}x${screenHeight}`,
    dokunmatik: 'ontouchstart' in window
});

// Global olarak erişilebilir yap
window.mobileOptimization = {
    isMobile,
    isIOS,
    isAndroid,
    isTablet,
    isSmallScreen,
    isLowPerformance,
    vibrate,
    lockScroll,
    unlockScroll
};
