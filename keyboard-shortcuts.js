// Klavye Kısayolları
document.addEventListener('keydown', function(e) {
    // ESC - Modal kapat
    if (e.key === 'Escape') {
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }
    
    // S - Ses aç/kapat
    if (e.key === 's' || e.key === 'S') {
        if (typeof toggleGameSound === 'function') {
            toggleGameSound();
        }
    }
    
    // T - Tema değiştir
    if (e.key === 't' || e.key === 'T') {
        if (typeof toggleTheme === 'function') {
            toggleTheme();
        }
    }
    
    // H - Yardım
    if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        showKeyboardHelp();
    }
    
    // 1, 2, 3 - Seçim yap (oyun ekranında)
    if (document.getElementById('game-screen').classList.contains('active')) {
        if (e.key === '1' || e.key === 'a' || e.key === 'A') {
            const choiceA = document.querySelector('.choice-card:nth-child(1)');
            if (choiceA) choiceA.click();
        } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
            const choiceB = document.querySelector('.choice-card:nth-child(2)');
            if (choiceB) choiceB.click();
        } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
            const choiceC = document.querySelector('.choice-card:nth-child(3)');
            if (choiceC) choiceC.click();
        }
    }
});

// Yardım modalı
function showKeyboardHelp() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content help-modal">
            <h2>⌨️ Klavye Kısayolları</h2>
            
            <div class="shortcuts-grid">
                <div class="shortcut-item">
                    <kbd>ESC</kbd>
                    <span>Modal kapat</span>
                </div>
                
                <div class="shortcut-item">
                    <kbd>S</kbd>
                    <span>Ses aç/kapat</span>
                </div>
                
                <div class="shortcut-item">
                    <kbd>T</kbd>
                    <span>Tema değiştir</span>
                </div>
                
                <div class="shortcut-item">
                    <kbd>H</kbd> veya <kbd>?</kbd>
                    <span>Yardım</span>
                </div>
                
                <div class="shortcut-item">
                    <kbd>1</kbd> veya <kbd>A</kbd>
                    <span>Seçenek A</span>
                </div>
                
                <div class="shortcut-item">
                    <kbd>2</kbd> veya <kbd>B</kbd>
                    <span>Seçenek B</span>
                </div>
                
                <div class="shortcut-item">
                    <kbd>3</kbd> veya <kbd>C</kbd>
                    <span>Seçenek C</span>
                </div>
            </div>
            
            <p style="text-align: center; color: var(--text-secondary); margin-top: 1.5rem;">
                💡 İpucu: Klavye kısayolları ile daha hızlı oynayabilirsiniz!
            </p>
            
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}
