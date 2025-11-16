// Mağaza ve Coin Sistemi
console.log('🛒 Mağaza sistemi yüklendi');

const SHOP_ITEMS = {
    themes: [
        { id: 'theme_ocean', name: 'Okyanus Teması', price: 500, icon: '🌊', type: 'theme' },
        { id: 'theme_forest', name: 'Orman Teması', price: 500, icon: '🌲', type: 'theme' },
        { id: 'theme_sunset', name: 'Gün Batımı Teması', price: 750, icon: '🌅', type: 'theme' },
        { id: 'theme_neon', name: 'Neon Teması', price: 1000, icon: '🌃', type: 'theme' }
    ],
    avatars: [
        { id: 'avatar_cat', name: 'Kedi Avatar', price: 300, icon: '🐱', type: 'avatar' },
        { id: 'avatar_dog', name: 'Köpek Avatar', price: 300, icon: '🐶', type: 'avatar' },
        { id: 'avatar_panda', name: 'Panda Avatar', price: 400, icon: '🐼', type: 'avatar' },
        { id: 'avatar_lion', name: 'Aslan Avatar', price: 500, icon: '🦁', type: 'avatar' },
        { id: 'avatar_unicorn', name: 'Unicorn Avatar', price: 1000, icon: '🦄', type: 'avatar' }
    ],
    badges: [
        { id: 'badge_vip', name: 'VIP Rozeti', price: 2000, icon: '👑', type: 'badge' },
        { id: 'badge_pro', name: 'Pro Rozeti', price: 1500, icon: '⭐', type: 'badge' },
        { id: 'badge_legend', name: 'Efsane Rozeti', price: 3000, icon: '🏆', type: 'badge' }
    ],
    boosters: [
        { id: 'xp_boost_2x', name: '2x XP Boost (1 saat)', price: 200, icon: '⚡', type: 'booster', duration: 3600 },
        { id: 'xp_boost_3x', name: '3x XP Boost (1 saat)', price: 500, icon: '💫', type: 'booster', duration: 3600 },
        { id: 'coin_boost_2x', name: '2x Coin Boost (1 saat)', price: 300, icon: '🪙', type: 'booster', duration: 3600 }
    ],
    special: [
        { id: 'name_change', name: 'İsim Değiştirme', price: 1000, icon: '✏️', type: 'special' },
        { id: 'level_skip', name: 'Seviye Atlama', price: 5000, icon: '🚀', type: 'special' }
    ]
};

function showShop() {
    // Görev ilerlemesi
    if (typeof onShopVisited === 'function') {
        onShopVisited();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active shop-modal';
    
    const userCoins = currentUser?.coins || 0;
    const userItems = currentUser?.shopItems || [];
    
    let shopHTML = `
        <div class="modal-content shop-content">
            <div class="shop-header">
                <h2>🛒 Mağaza</h2>
                <div class="user-coins">
                    <span class="coin-icon">🪙</span>
                    <span class="coin-amount">${userCoins}</span>
                </div>
            </div>
            
            <div class="shop-tabs">
                <button class="shop-tab active" onclick="switchShopTab('themes')">🎨 Temalar</button>
                <button class="shop-tab" onclick="switchShopTab('avatars')">😀 Avatarlar</button>
                <button class="shop-tab" onclick="switchShopTab('badges')">🏅 Rozetler</button>
                <button class="shop-tab" onclick="switchShopTab('boosters')">⚡ Güçlendiriciler</button>
                <button class="shop-tab" onclick="switchShopTab('special')">✨ Özel</button>
            </div>
            
            <div class="shop-items" id="shop-items-container">
    `;
    
    // Temalar
    shopHTML += '<div class="shop-category" data-category="themes">';
    SHOP_ITEMS.themes.forEach(item => {
        const owned = userItems.includes(item.id);
        shopHTML += `
            <div class="shop-item ${owned ? 'owned' : ''}">
                <div class="item-icon">${item.icon}</div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">
                        ${owned ? '<span class="owned-badge">✓ Sahip</span>' : 
                                 `<span class="price-tag">🪙 ${item.price}</span>`}
                    </div>
                </div>
                ${!owned ? `<button class="btn-small btn-primary" onclick="buyItem('${item.id}', ${item.price})">Satın Al</button>` : 
                          `<button class="btn-small btn-secondary" onclick="useItem('${item.id}', '${item.type}')">Kullan</button>`}
            </div>
        `;
    });
    shopHTML += '</div>';
    
    // Diğer kategoriler için benzer şekilde
    ['avatars', 'badges', 'boosters', 'special'].forEach(category => {
        shopHTML += `<div class="shop-category" data-category="${category}" style="display:none;">`;
        SHOP_ITEMS[category].forEach(item => {
            const owned = userItems.includes(item.id);
            shopHTML += `
                <div class="shop-item ${owned ? 'owned' : ''}">
                    <div class="item-icon">${item.icon}</div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">
                            ${owned ? '<span class="owned-badge">✓ Sahip</span>' : 
                                     `<span class="price-tag">🪙 ${item.price}</span>`}
                        </div>
                    </div>
                    ${!owned ? `<button class="btn-small btn-primary" onclick="buyItem('${item.id}', ${item.price})">Satın Al</button>` : 
                              item.type === 'booster' ? `<button class="btn-small btn-secondary" onclick="useBooster('${item.id}')">Kullan</button>` :
                              `<button class="btn-small btn-secondary" onclick="useItem('${item.id}', '${item.type}')">Kullan</button>`}
                </div>
            `;
        });
        shopHTML += '</div>';
    });
    
    shopHTML += `
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeShop()">Kapat</button>
            </div>
        </div>
    `;
    
    modal.innerHTML = shopHTML;
    document.body.appendChild(modal);
}

function switchShopTab(category) {
    document.querySelectorAll('.shop-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.shop-category').forEach(cat => cat.style.display = 'none');
    document.querySelector(`[data-category="${category}"]`).style.display = 'block';
}

function buyItem(itemId, price) {
    if (!currentUser) return;
    
    const userCoins = currentUser.coins || 0;
    
    if (userCoins < price) {
        showToast('Yeterli coin yok! 🪙', 'error');
        return;
    }
    
    currentUser.coins = userCoins - price;
    currentUser.shopItems = currentUser.shopItems || [];
    currentUser.shopItems.push(itemId);
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    showToast('Satın alma başarılı! 🎉', 'success');
    playSound('purchase');
    
    closeShop();
    setTimeout(() => showShop(), 300);
}

function useItem(itemId, type) {
    if (!currentUser) return;
    
    currentUser.activeTheme = itemId;
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    showToast('Öğe aktif edildi! ✨', 'success');
}

function useBooster(itemId) {
    if (!currentUser) return;
    
    const booster = Object.values(SHOP_ITEMS.boosters).flat().find(b => b.id === itemId);
    if (!booster) return;
    
    currentUser.activeBooster = {
        id: itemId,
        expiresAt: Date.now() + (booster.duration * 1000)
    };
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    showToast(`${booster.name} aktif! ⚡`, 'success');
    closeShop();
}

function closeShop() {
    const modal = document.querySelector('.shop-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function earnCoins(amount) {
    if (!currentUser) return;
    
    // Booster kontrolü
    if (currentUser.activeBooster && currentUser.activeBooster.expiresAt > Date.now()) {
        if (currentUser.activeBooster.id.includes('coin_boost_2x')) {
            amount *= 2;
        }
    }
    
    currentUser.coins = (currentUser.coins || 0) + amount;
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
    
    showCoinAnimation(amount);
}

function showCoinAnimation(amount) {
    const coinEl = document.createElement('div');
    coinEl.className = 'coin-earned-animation';
    coinEl.innerHTML = `+${amount} 🪙`;
    document.body.appendChild(coinEl);
    
    setTimeout(() => coinEl.remove(), 2000);
}
