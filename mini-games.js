// Mini Oyunlar Sistemi
console.log('🎮 Mini oyunlar yüklendi');

// 1. Günlük Spin Wheel (Çark)
function showSpinWheel() {
    if (!currentUser) return;
    
    const today = new Date().toDateString();
    const lastSpin = currentUser.lastSpinDate || '';
    
    if (lastSpin === today) {
        showToast('Bugün zaten çevrildi! Yarın tekrar dene 🎡', 'error');
        return;
    }
    
    // Görev takibi
    if (typeof onMiniGamePlayed === 'function') {
        onMiniGamePlayed('spin');
    }
    
    const prizes = [
        { label: '50 XP', value: 50, type: 'xp', color: '#3b82f6' },
        { label: '100 Coin', value: 100, type: 'coins', color: '#f59e0b' },
        { label: '25 XP', value: 25, type: 'xp', color: '#3b82f6' },
        { label: '200 Coin', value: 200, type: 'coins', color: '#f59e0b' },
        { label: '150 XP', value: 150, type: 'xp', color: '#3b82f6' },
        { label: '50 Coin', value: 50, type: 'coins', color: '#f59e0b' },
        { label: 'Streak Freeze', value: 1, type: 'freeze', color: '#06b6d4' },
        { label: '500 XP', value: 500, type: 'xp', color: '#8b5cf6' }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'modal active spin-wheel-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; text-align: center;">
            <h2>🎡 Şans Çarkı</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                Günde bir kez çevir, ödülünü kazan!
            </p>
            
            <div class="wheel-container" style="position: relative; width: 400px; height: 400px; margin: 2rem auto;">
                <div class="wheel-pointer" style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 3rem; z-index: 10;">
                    ⬇️
                </div>
                <canvas id="wheelCanvas" width="400" height="400" style="border-radius: 50%; box-shadow: 0 10px 40px rgba(0,0,0,0.3);"></canvas>
            </div>
            
            <button class="btn-primary btn-full" onclick="spinTheWheel()" id="spinButton" style="font-size: 1.5rem; padding: 1rem 2rem;">
                ÇEVİR! 🎰
            </button>
            
            <button class="btn-secondary" onclick="this.closest('.modal').remove()" style="margin-top: 1rem;">
                Kapat
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Çarkı çiz
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    drawWheel(ctx, prizes);
    
    window.wheelPrizes = prizes;
}

function drawWheel(ctx, prizes) {
    const centerX = 200;
    const centerY = 200;
    const radius = 200;
    const sliceAngle = (2 * Math.PI) / prizes.length;
    
    prizes.forEach((prize, i) => {
        const startAngle = i * sliceAngle;
        const endAngle = startAngle + sliceAngle;
        
        // Dilim çiz
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = prize.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Yazı
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(prize.label, radius * 0.7, 5);
        ctx.restore();
    });
    
    // Merkez daire
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function spinTheWheel() {
    const button = document.getElementById('spinButton');
    button.disabled = true;
    button.textContent = 'Çevriliyor...';
    
    const canvas = document.getElementById('wheelCanvas');
    const prizes = window.wheelPrizes;
    
    // Rastgele ödül seç
    const winningIndex = Math.floor(Math.random() * prizes.length);
    const winningPrize = prizes[winningIndex];
    
    // Animasyon
    const rotations = 5; // 5 tam tur
    const extraDegrees = (winningIndex * (360 / prizes.length));
    const totalDegrees = (rotations * 360) + extraDegrees;
    
    let currentRotation = 0;
    const duration = 3000; // 3 saniye
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentRotation = totalDegrees * easeOut;
        
        canvas.style.transform = `rotate(${currentRotation}deg)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Ödül ver
            giveSpinPrize(winningPrize);
        }
    }
    
    playSound('spin');
    animate();
}

function giveSpinPrize(prize) {
    if (!currentUser) return;
    
    currentUser.lastSpinDate = new Date().toDateString();
    
    // Ödülü ver
    if (prize.type === 'xp') {
        currentUser.xp = (currentUser.xp || 0) + prize.value;
    } else if (prize.type === 'coins') {
        currentUser.coins = (currentUser.coins || 0) + prize.value;
    } else if (prize.type === 'freeze') {
        currentUser.streakFreezes = (currentUser.streakFreezes || 0) + prize.value;
    }
    
    // Seviye kontrolü
    checkLevelUp();
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    setTimeout(() => {
        // Büyük ödül modalı
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="text-align: center; background: var(--gradient-1); color: white; max-width: 400px;">
                <div style="font-size: 5rem; animation: bounce 1s ease infinite;">${prize.type === 'freeze' ? '🧊' : prize.type === 'xp' ? '⚡' : '🪙'}</div>
                <h2 style="font-size: 2rem; margin: 1rem 0;">Tebrikler!</h2>
                <div style="font-size: 3rem; font-weight: 700; margin: 2rem 0;">
                    ${prize.label}
                </div>
                <p style="font-size: 1.2rem; opacity: 0.9;">
                    Şans çarkından kazandın! 🎡
                </p>
                <button class="btn-primary btn-full" onclick="this.closest('.modal').remove()" style="background: white; color: var(--primary-color); margin-top: 2rem;">
                    Harika! 🎉
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        showToast(`Kazandın: ${prize.label}! 🎉`, 'success');
        playSound('win');
        createConfetti();
        
        // XP/Coin animasyonu
        if (prize.type === 'xp') {
            showFloatingXP(prize.value);
        } else if (prize.type === 'coins') {
            showCoinAnimation(prize.value);
        }
        
        document.getElementById('spinButton').textContent = 'Tamamlandı ✓';
        document.getElementById('spinButton').disabled = true;
    }, 500);
}

// 2. Günlük Scratch Card (Kazı Kazan)
function showScratchCard() {
    if (!currentUser) return;
    
    const today = new Date().toDateString();
    const lastScratch = currentUser.lastScratchDate || '';
    
    if (lastScratch === today) {
        showToast('Bugün zaten kazıdın! Yarın tekrar dene 🎫', 'error');
        return;
    }
    
    // Görev takibi
    if (typeof onMiniGamePlayed === 'function') {
        onMiniGamePlayed('scratch');
    }
    
    const prizes = [
        { amount: 100, type: 'xp', label: '100 XP' },
        { amount: 50, type: 'coins', label: '50 Coin' },
        { amount: 200, type: 'xp', label: '200 XP' },
        { amount: 100, type: 'coins', label: '100 Coin' },
        { amount: 500, type: 'xp', label: '500 XP' }
    ];
    
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    
    const modal = document.createElement('div');
    modal.className = 'modal active scratch-card-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <h2>🎫 Kazı Kazan</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                Kartı kaz ve ödülünü gör!
            </p>
            
            <div style="position: relative; width: 300px; height: 200px; margin: 2rem auto;">
                <canvas id="scratchCanvas" width="300" height="200" style="border-radius: 16px; cursor: pointer; box-shadow: 0 10px 40px rgba(0,0,0,0.3);"></canvas>
                <div id="scratchPrize" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 700; color: var(--primary-color); z-index: -1;">
                    ${prize.label}
                </div>
            </div>
            
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
                Fare ile kaz veya parmağınla sürükle
            </p>
            
            <button class="btn-secondary" onclick="this.closest('.modal').remove()" style="margin-top: 1rem;">
                Kapat
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    initScratchCard(prize);
}

function initScratchCard(prize) {
    const canvas = document.getElementById('scratchCanvas');
    const ctx = canvas.getContext('2d');
    
    // Gri kaplama çiz
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 300, 200);
    
    // "KAZ" yazısı
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('KAZ', 150, 110);
    
    let isScratching = false;
    let scratchedPercent = 0;
    
    function scratch(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        // Kazınan yüzdeyi hesapla
        const imageData = ctx.getImageData(0, 0, 300, 200);
        let transparent = 0;
        for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] === 0) transparent++;
        }
        scratchedPercent = (transparent / (imageData.data.length / 4)) * 100;
        
        // %70 kazındıysa ödül ver
        if (scratchedPercent > 70 && currentUser) {
            giveScratchPrize(prize);
            canvas.style.pointerEvents = 'none';
        }
    }
    
    canvas.addEventListener('mousedown', () => isScratching = true);
    canvas.addEventListener('mouseup', () => isScratching = false);
    canvas.addEventListener('mousemove', (e) => {
        if (isScratching) {
            const rect = canvas.getBoundingClientRect();
            scratch(e.clientX - rect.left, e.clientY - rect.top);
        }
    });
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isScratching = true;
    });
    canvas.addEventListener('touchend', () => isScratching = false);
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isScratching) {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            scratch(touch.clientX - rect.left, touch.clientY - rect.top);
        }
    });
}

function giveScratchPrize(prize) {
    if (!currentUser) return;
    
    currentUser.lastScratchDate = new Date().toDateString();
    
    if (prize.type === 'xp') {
        currentUser.xp = (currentUser.xp || 0) + prize.amount;
    } else if (prize.type === 'coins') {
        currentUser.coins = (currentUser.coins || 0) + prize.amount;
    }
    
    // Seviye kontrolü
    checkLevelUp();
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    // Ödül göster
    const prizeDiv = document.getElementById('scratchPrize');
    if (prizeDiv) {
        prizeDiv.style.zIndex = '10';
        prizeDiv.style.fontSize = '4rem';
        prizeDiv.style.animation = 'scaleIn 0.5s ease';
    }
    
    showToast(`Kazandın: ${prize.label}! 🎉`, 'success');
    playSound('win');
    createConfetti();
    
    // XP animasyonu
    if (prize.type === 'xp') {
        showFloatingXP(prize.amount);
    } else if (prize.type === 'coins') {
        showCoinAnimation(prize.amount);
    }
}

// 3. Günlük Trivia (Bilgi Yarışması)
function showDailyTrivia() {
    // Görev takibi
    if (typeof onMiniGamePlayed === 'function') {
        onMiniGamePlayed('trivia');
    }
    
    const questions = [
        {
            q: 'Hangi enerji kaynağı yenilenebilir değildir?',
            options: ['Güneş', 'Rüzgar', 'Kömür', 'Hidroelektrik'],
            correct: 2
        },
        {
            q: 'Karbon ayak izi nedir?',
            options: ['Ayak izi büyüklüğü', 'CO2 emisyonu', 'Yürüme mesafesi', 'Ayakkabı numarası'],
            correct: 1
        },
        {
            q: 'Hangi ulaşım en çevre dostudur?',
            options: ['Araba', 'Uçak', 'Bisiklet', 'Motosiklet'],
            correct: 2
        },
        {
            q: 'Geri dönüşüm hangi kaynağı korur?',
            options: ['Sadece su', 'Sadece enerji', 'Tüm kaynaklar', 'Hiçbiri'],
            correct: 2
        },
        {
            q: 'Sürdürülebilir şehir için en önemli faktör?',
            options: ['Büyük binalar', 'Çok araba', 'Yeşil alanlar', 'Alışveriş merkezleri'],
            correct: 2
        }
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    
    const modal = document.createElement('div');
    modal.className = 'modal active trivia-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h2>🧠 Günlük Trivia</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                Doğru cevap ver, 50 XP kazan!
            </p>
            
            <div class="trivia-question" style="background: var(--card-bg); padding: 2rem; border-radius: 16px; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 2rem;">${question.q}</h3>
                <div class="trivia-options" style="display: grid; gap: 1rem;">
                    ${question.options.map((opt, i) => `
                        <button class="trivia-option" onclick="checkTriviaAnswer(${i}, ${question.correct})" style="
                            padding: 1rem;
                            background: var(--bg-color);
                            border: 2px solid var(--border-color);
                            border-radius: 12px;
                            color: var(--text-primary);
                            cursor: pointer;
                            transition: all 0.3s;
                            text-align: left;
                            font-size: 1rem;
                        ">
                            ${String.fromCharCode(65 + i)}. ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                Kapat
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function checkTriviaAnswer(selected, correct) {
    const options = document.querySelectorAll('.trivia-option');
    options.forEach(opt => opt.style.pointerEvents = 'none');
    
    if (selected === correct) {
        options[selected].style.background = 'var(--success-color)';
        options[selected].style.borderColor = 'var(--success-color)';
        
        if (currentUser) {
            currentUser.xp = (currentUser.xp || 0) + 50;
            saveToStorage('currentUser', currentUser);
            updateUserInStorage(currentUser);
        }
        
        showToast('Doğru cevap! +50 XP 🎉', 'success');
        playSound('correct');
    } else {
        options[selected].style.background = 'var(--danger-color)';
        options[selected].style.borderColor = 'var(--danger-color)';
        options[correct].style.background = 'var(--success-color)';
        options[correct].style.borderColor = 'var(--success-color)';
        
        showToast('Yanlış cevap! Doğrusu: ' + options[correct].textContent, 'error');
        playSound('wrong');
    }
}


// Floating XP Animasyonu
function showFloatingXP(amount) {
    const xp = document.createElement('div');
    xp.className = 'floating-reward';
    xp.innerHTML = `<span style="color: #6366f1; font-size: 3rem; font-weight: 700;">+${amount} XP ⚡</span>`;
    xp.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10005;
        animation: floatUp 2s ease-out forwards;
        pointer-events: none;
    `;
    document.body.appendChild(xp);
    
    setTimeout(() => xp.remove(), 2000);
}

// Coin Animasyonu (geliştirilmiş)
function showCoinAnimation(amount) {
    const coin = document.createElement('div');
    coin.className = 'floating-reward';
    coin.innerHTML = `<span style="color: #f59e0b; font-size: 3rem; font-weight: 700;">+${amount} 🪙</span>`;
    coin.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10005;
        animation: floatUp 2s ease-out forwards;
        pointer-events: none;
    `;
    document.body.appendChild(coin);
    
    setTimeout(() => coin.remove(), 2000);
}
