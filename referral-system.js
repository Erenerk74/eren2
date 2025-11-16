// Referral (Arkadaş Davet) Sistemi
console.log('👥 Referral sistemi yüklendi');

function generateReferralCode() {
    if (!currentUser) return;
    
    if (!currentUser.referralCode) {
        currentUser.referralCode = 'KL' + Math.random().toString(36).substr(2, 6).toUpperCase();
        saveToStorage('currentUser', currentUser);
        updateUserInStorage(currentUser);
    }
    
    return currentUser.referralCode;
}

function showReferralPanel() {
    if (!currentUser) return;
    
    const code = generateReferralCode();
    const referrals = currentUser.referrals || [];
    const referralRewards = currentUser.referralRewards || 0;
    
    const modal = document.createElement('div');
    modal.className = 'modal active referral-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h2>👥 Arkadaşını Davet Et</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                Her arkadaşın için 200 XP + 100 Coin kazan!
            </p>
            
            <div class="referral-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${referrals.length}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Davet Edilen</div>
                </div>
                <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--success-color);">${referralRewards}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Toplam Ödül</div>
                </div>
                <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--warning-color);">${referrals.length * 100}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Coin Kazanıldı</div>
                </div>
            </div>
            
            <div class="referral-code-box" style="background: var(--gradient-1); padding: 2rem; border-radius: 16px; text-align: center; margin-bottom: 2rem;">
                <div style="color: white; font-size: 0.9rem; margin-bottom: 0.5rem; opacity: 0.9;">Senin Davet Kodun</div>
                <div style="font-size: 3rem; font-weight: 700; color: white; letter-spacing: 5px; margin: 1rem 0;">
                    ${code}
                </div>
                <button class="btn-secondary" onclick="copyReferralCode('${code}')" style="background: white; color: var(--primary-color);">
                    📋 Kodu Kopyala
                </button>
            </div>
            
            <div class="referral-benefits" style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">🎁 Ödüller</h3>
                <div style="display: grid; gap: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span style="font-size: 1.5rem;">⚡</span>
                        <span>Her arkadaş için <strong>200 XP</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span style="font-size: 1.5rem;">🪙</span>
                        <span>Her arkadaş için <strong>100 Coin</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span style="font-size: 1.5rem;">🏆</span>
                        <span>5 arkadaş davet et, <strong>özel rozet</strong> kazan</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span style="font-size: 1.5rem;">👑</span>
                        <span>10 arkadaş davet et, <strong>VIP statüsü</strong> kazan</span>
                    </div>
                </div>
            </div>
            
            ${referrals.length > 0 ? `
                <div class="referral-list" style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem;">Davet Ettiklerin</h3>
                    <div style="display: grid; gap: 0.5rem; max-height: 200px; overflow-y: auto;">
                        ${referrals.map(ref => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-color); border-radius: 8px;">
                                <span>👤 ${ref.name}</span>
                                <span style="color: var(--success-color); font-size: 0.9rem;">✓ Katıldı</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="modal-actions">
                <button class="btn-primary" onclick="shareReferralCode('${code}')">
                    📤 Paylaş
                </button>
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                    Kapat
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function copyReferralCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showToast('Davet kodu kopyalandı! 📋', 'success');
    }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = code;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('Davet kodu kopyalandı! 📋', 'success');
    });
}

function shareReferralCode(code) {
    const text = `KararLab'e katıl ve sürdürülebilir şehirler kur! 🏙️\n\nDavet kodum: ${code}\n\nKayıt olurken bu kodu kullan ve bonus kazan! 🎁`;
    
    if (navigator.share) {
        navigator.share({
            title: 'KararLab\'e Katıl!',
            text: text,
            url: window.location.href
        }).catch(() => {});
    } else {
        copyReferralCode(code);
        showToast('Davet mesajı kopyalandı! Arkadaşlarınla paylaş 📤', 'success');
    }
}

function applyReferralCode(code) {
    if (!currentUser || !code) return false;
    
    // Kendi kodunu kullanamaz
    if (code === currentUser.referralCode) {
        showToast('Kendi davet kodunu kullanamazsın! 😅', 'error');
        return false;
    }
    
    // Zaten kullanılmış mı?
    if (currentUser.usedReferralCode) {
        showToast('Zaten bir davet kodu kullandın! 🎫', 'error');
        return false;
    }
    
    const users = getFromStorage('users') || [];
    const referrer = users.find(u => u.referralCode === code);
    
    if (!referrer) {
        showToast('Geçersiz davet kodu! 😕', 'error');
        return false;
    }
    
    // Referrer'a ödül ver
    referrer.referrals = referrer.referrals || [];
    referrer.referrals.push({
        id: currentUser.id,
        name: currentUser.name,
        date: new Date().toISOString()
    });
    referrer.xp = (referrer.xp || 0) + 200;
    referrer.coins = (referrer.coins || 0) + 100;
    referrer.referralRewards = (referrer.referralRewards || 0) + 1;
    
    // Başarı kontrolü
    if (referrer.referrals.length >= 5) {
        checkAchievement('referral_master');
    }
    if (referrer.referrals.length >= 10) {
        checkAchievement('referral_legend');
        referrer.vipStatus = true;
    }
    
    // Kullanıcıya bonus ver
    currentUser.usedReferralCode = code;
    currentUser.xp = (currentUser.xp || 0) + 100;
    currentUser.coins = (currentUser.coins || 0) + 50;
    
    // Kaydet
    const userIndex = users.findIndex(u => u.id === referrer.id);
    if (userIndex !== -1) {
        users[userIndex] = referrer;
    }
    
    saveToStorage('users', users);
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    showToast('Davet kodu uygulandı! +100 XP, +50 Coin 🎉', 'success');
    playSound('reward');
    createConfetti();
    
    return true;
}

// Kayıt sırasında davet kodu girişi
function showReferralCodeInput() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center;">
            <h2>🎁 Davet Kodun Var mı?</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                Arkadaşından davet kodu aldıysan gir, bonus kazan!
            </p>
            
            <input type="text" id="referral-code-input" placeholder="Davet Kodu (örn: KLABC123)" style="
                width: 100%;
                padding: 1rem;
                border: 2px solid var(--border-color);
                border-radius: 12px;
                background: var(--bg-color);
                color: var(--text-primary);
                font-size: 1.2rem;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 1rem;
            ">
            
            <div style="background: var(--card-bg); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; text-align: left;">
                <div style="font-size: 0.9rem; color: var(--text-secondary);">Bonus:</div>
                <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                    <span>⚡ +100 XP</span>
                    <span>🪙 +50 Coin</span>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-primary" onclick="submitReferralCode()">
                    Uygula
                </button>
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                    Atla
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function submitReferralCode() {
    const input = document.getElementById('referral-code-input');
    const code = input.value.trim().toUpperCase();
    
    if (code) {
        applyReferralCode(code);
    }
    
    document.querySelector('.modal').remove();
}
