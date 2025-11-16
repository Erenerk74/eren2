// Klavye Kısayolları - DEVRE DIŞI
// Mobil uyumluluk için klavye kısayolları kaldırıldı

console.log('⌨️ Klavye kısayolları devre dışı (mobil optimizasyon)');

// Sadece ESC tuşu ile modal kapatma aktif (temel işlevsellik)
document.addEventListener('keydown', function(e) {
    // ESC - Modal kapat
    if (e.key === 'Escape') {
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }
});
