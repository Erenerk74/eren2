// Animasyon Sistemi

// Sayı animasyonu
function animateNumber(element, start, end, duration = 1000) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Sayfa görünür olduğunda animasyonları başlat
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Sayı animasyonu
                if (entry.target.hasAttribute('data-count')) {
                    const target = parseInt(entry.target.getAttribute('data-count'));
                    animateNumber(entry.target, 0, target);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Animasyonlu elementleri gözlemle
    document.querySelectorAll('.stat-card, .feature-card, .scenario-card').forEach(el => {
        observer.observe(el);
    });
};

// Konfeti efekti
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Parıltı efekti
function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 1000);
}

// Hover efekti için parıltı
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('mousemove', (e) => {
        if (e.target.matches('.scenario-card, .achievement-card')) {
            if (Math.random() > 0.95) {
                createSparkle(e.clientX, e.clientY);
            }
        }
    });
    
    // Sayfa yüklendiğinde animasyonları başlat
    setTimeout(observeElements, 100);
});

// Başarı açıldığında konfeti
const originalCheckAchievement = window.checkAchievement;
if (originalCheckAchievement) {
    window.checkAchievement = function(achievementId, value) {
        const result = originalCheckAchievement(achievementId, value);
        const achievement = achievements[achievementId];
        
        if (achievement && achievement.unlocked) {
            createConfetti();
            playSound('achievement');
        }
        
        return result;
    };
}

// Seviye atladığında konfeti
const originalAddXP = window.addXP;
if (originalAddXP) {
    window.addXP = function(amount) {
        const oldLevel = playerLevel.level;
        originalAddXP(amount);
        
        if (playerLevel.level > oldLevel) {
            createConfetti();
            playSound('levelUp');
        }
    };
}

// Kart flip animasyonu
function flipCard(element) {
    element.style.transform = 'rotateY(180deg)';
    setTimeout(() => {
        element.style.transform = 'rotateY(0deg)';
    }, 600);
}

// Shake animasyonu
function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

// Pulse animasyonu
function pulseElement(element) {
    element.classList.add('pulse');
    setTimeout(() => {
        element.classList.remove('pulse');
    }, 1000);
}
