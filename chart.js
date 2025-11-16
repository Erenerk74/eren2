// Basit Grafik Sistemi
class SimpleChart {
    constructor(canvasId, data, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.data = data;
        this.options = {
            width: options.width || 300,
            height: options.height || 150,
            padding: options.padding || 20,
            lineColor: options.lineColor || '#6366f1',
            fillColor: options.fillColor || 'rgba(99, 102, 241, 0.1)',
            gridColor: options.gridColor || '#e5e7eb',
            textColor: options.textColor || '#6b7280',
            ...options
        };
        
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
    }
    
    draw() {
        if (!this.ctx) return;
        
        const { width, height, padding } = this.options;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Temizle
        this.ctx.clearRect(0, 0, width, height);
        
        // Grid çiz
        this.drawGrid(chartWidth, chartHeight, padding);
        
        // Veri çiz
        this.drawLine(chartWidth, chartHeight, padding);
        
        // Noktalar çiz
        this.drawPoints(chartWidth, chartHeight, padding);
    }
    
    drawGrid(chartWidth, chartHeight, padding) {
        this.ctx.strokeStyle = this.options.gridColor;
        this.ctx.lineWidth = 1;
        
        // Yatay çizgiler
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(padding + chartWidth, y);
            this.ctx.stroke();
            
            // Değer yazısı
            const value = 100 - (i * 25);
            this.ctx.fillStyle = this.options.textColor;
            this.ctx.font = '10px sans-serif';
            this.ctx.fillText(value + '%', 5, y + 3);
        }
    }
    
    drawLine(chartWidth, chartHeight, padding) {
        if (this.data.length < 2) return;
        
        const stepX = chartWidth / (this.data.length - 1);
        
        // Alan doldur
        this.ctx.fillStyle = this.options.fillColor;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding + chartHeight);
        
        this.data.forEach((value, index) => {
            const x = padding + stepX * index;
            const y = padding + chartHeight - (value / 100) * chartHeight;
            this.ctx.lineTo(x, y);
        });
        
        this.ctx.lineTo(padding + chartWidth, padding + chartHeight);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Çizgi çiz
        this.ctx.strokeStyle = this.options.lineColor;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        this.data.forEach((value, index) => {
            const x = padding + stepX * index;
            const y = padding + chartHeight - (value / 100) * chartHeight;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.stroke();
    }
    
    drawPoints(chartWidth, chartHeight, padding) {
        const stepX = chartWidth / (this.data.length - 1);
        
        this.data.forEach((value, index) => {
            const x = padding + stepX * index;
            const y = padding + chartHeight - (value / 100) * chartHeight;
            
            // Nokta
            this.ctx.fillStyle = this.options.lineColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Beyaz kenarlık
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Etiket
            this.ctx.fillStyle = this.options.textColor;
            this.ctx.font = '10px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('T' + index, x, padding + chartHeight + 15);
        });
    }
}

// Grafik göster
function showHappinessChart() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content chart-modal">
            <h2>📊 Mutluluk Grafiği</h2>
            <canvas id="happiness-chart"></canvas>
            <p style="text-align: center; color: var(--text-secondary); margin-top: 1rem;">
                Turlar boyunca halk mutluluğunun değişimi
            </p>
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Grafik verisi
    const happinessHistory = gameState.happinessHistory || [50];
    
    setTimeout(() => {
        const chart = new SimpleChart('happiness-chart', happinessHistory, {
            width: 400,
            height: 200,
            lineColor: '#10b981',
            fillColor: 'rgba(16, 185, 129, 0.1)'
        });
        chart.draw();
    }, 100);
}

function showSupportChart() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content chart-modal">
            <h2>📊 Destek Grafiği</h2>
            <canvas id="support-chart"></canvas>
            <p style="text-align: center; color: var(--text-secondary); margin-top: 1rem;">
                Turlar boyunca başkan desteğinin değişimi
            </p>
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Grafik verisi
    const supportHistory = gameState.supportHistory || [50];
    
    setTimeout(() => {
        const chart = new SimpleChart('support-chart', supportHistory, {
            width: 400,
            height: 200,
            lineColor: '#6366f1',
            fillColor: 'rgba(99, 102, 241, 0.1)'
        });
        chart.draw();
    }, 100);
}

// Modal kapatma
function closeModal(event) {
    const modal = event.target.closest('.modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Hızlı istatistik
function showQuickStats() {
    const avgHappiness = gameState.happinessHistory ? 
        (gameState.happinessHistory.reduce((a, b) => a + b, 0) / gameState.happinessHistory.length).toFixed(1) : 50;
    
    const avgSupport = gameState.supportHistory ? 
        (gameState.supportHistory.reduce((a, b) => a + b, 0) / gameState.supportHistory.length).toFixed(1) : 50;
    
    const happinessChange = gameState.happinessHistory && gameState.happinessHistory.length > 1 ?
        (gameState.happinessHistory[gameState.happinessHistory.length - 1] - gameState.happinessHistory[0]).toFixed(1) : 0;
    
    const supportChange = gameState.supportHistory && gameState.supportHistory.length > 1 ?
        (gameState.supportHistory[gameState.supportHistory.length - 1] - gameState.supportHistory[0]).toFixed(1) : 0;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content stats-modal">
            <h2>📈 Hızlı İstatistikler</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">😊</div>
                    <div class="stat-value">${avgHappiness}%</div>
                    <div class="stat-label">Ortalama Mutluluk</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">👔</div>
                    <div class="stat-value">${avgSupport}%</div>
                    <div class="stat-label">Ortalama Destek</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">${happinessChange >= 0 ? '📈' : '📉'}</div>
                    <div class="stat-value" style="color: ${happinessChange >= 0 ? '#10b981' : '#ef4444'}">
                        ${happinessChange >= 0 ? '+' : ''}${happinessChange}%
                    </div>
                    <div class="stat-label">Mutluluk Değişimi</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">${supportChange >= 0 ? '📈' : '📉'}</div>
                    <div class="stat-value" style="color: ${supportChange >= 0 ? '#10b981' : '#ef4444'}">
                        ${supportChange >= 0 ? '+' : ''}${supportChange}%
                    </div>
                    <div class="stat-label">Destek Değişimi</div>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(30, 41, 59, 0.8); border-radius: 8px; border: 2px solid rgba(99, 102, 241, 0.3);">
                <h3 style="margin-top: 0; color: var(--text-primary);">💡 Analiz</h3>
                <p style="margin: 0;">
                    ${avgHappiness >= 70 ? '✅ Halk genel olarak mutlu!' : 
                      avgHappiness >= 50 ? '⚠️ Halk orta düzeyde memnun.' : 
                      '❌ Halk memnuniyetsiz, iyileştirme gerekli.'}
                </p>
                <p style="margin: 0.5rem 0 0 0;">
                    ${avgSupport >= 70 ? '✅ Güçlü politik destek!' : 
                      avgSupport >= 50 ? '⚠️ Destek dengede.' : 
                      '❌ Destek düşük, güven kazanmalısınız.'}
                </p>
            </div>
            
            <button class="btn-secondary" onclick="closeModal(event)" style="margin-top: 1rem;">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}
