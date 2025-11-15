// KararLab - Novaşehir Simülatörü
// Global State
let currentUser = null;
let gameState = {
    turn: 0,
    decisions: [],
    indicators: {
        air: 'Orta',
        traffic: 'Yüksek',
        green: '%8',
        carbon: 'Yüksek',
        quality: 'Orta',
        economy: 'Büyüyen'
    }
};

// LocalStorage için yardımcı fonksiyonlar
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Sayfa geçişleri
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showLanding() {
    showPage('landing-page');
}

function showLogin() {
    showPage('login-page');
}

function showRegister() {
    showPage('register-page');
}

function toggleTeacherFields() {
    const userType = document.getElementById('reg-type').value;
    const teacherFields = document.getElementById('teacher-fields');
    teacherFields.style.display = userType === 'teacher' ? 'block' : 'none';
}

// Admin kullanıcısı oluştur (ilk çalıştırmada)
function createAdminIfNotExists() {
    const users = getFromStorage('users') || [];
    const adminExists = users.find(u => u.email === 'admin');
    
    if (!adminExists) {
        const admin = {
            id: Date.now(),
            name: 'admin',
            email: 'admin',
            password: '123',
            type: 'admin'
        };
        users.push(admin);
        saveToStorage('users', users);
    }
}

// Giriş işlemi
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const users = getFromStorage('users') || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        saveToStorage('currentUser', user);
        
        if (user.type === 'student') {
            loadStudentPanel();
        } else if (user.type === 'teacher') {
            loadTeacherPanel();
        } else if (user.type === 'admin') {
            loadAdminPanel();
        }
        showToast('Hoş geldiniz, ' + user.name + '!');
    } else {
        showToast('E-posta veya şifre hatalı!', 'error');
    }
}

// Kayıt işlemi
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const username = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const type = document.getElementById('reg-type').value;
    
    // Kullanıcı adı kontrolü
    if (username.length < 3) {
        showToast('Kullanıcı adı en az 3 karakter olmalıdır!', 'error');
        return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showToast('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir!', 'error');
        return;
    }
    
    const users = getFromStorage('users') || [];
    
    if (users.find(u => u.email === username)) {
        showToast('Bu kullanıcı adı zaten alınmış!', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email: username,
        password,
        type,
        scenarios: [],
        badges: []
    };
    
    if (type === 'teacher') {
        newUser.school = document.getElementById('reg-school').value;
        newUser.branch = document.getElementById('reg-branch').value;
        newUser.classes = [];
    }
    
    users.push(newUser);
    saveToStorage('users', users);
    
    currentUser = newUser;
    saveToStorage('currentUser', newUser);
    
    if (type === 'student') {
        loadStudentPanel();
    } else {
        loadTeacherPanel();
    }
}

// Çıkış
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLanding();
}

// Öğrenci panelini yükle
function loadStudentPanel() {
    showPage('student-panel');
    document.getElementById('student-name').textContent = currentUser.name;
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('scenarios-played').textContent = (currentUser.scenarios || []).length;
    
    loadPastReports();
    loadStudentClassInfo();
}

function loadPastReports() {
    const reportsDiv = document.getElementById('past-reports');
    
    if (!currentUser.scenarios || currentUser.scenarios.length === 0) {
        reportsDiv.innerHTML = '<p style="color: var(--text-secondary);">Henüz tamamlanmış senaryo yok.</p>';
        return;
    }
    
    reportsDiv.innerHTML = currentUser.scenarios.slice().reverse().map(scenario => `
        <div class="report-card">
            <h4>${scenario.name}</h4>
            <p>Tarih: ${new Date(scenario.date).toLocaleDateString('tr-TR')}</p>
            <p>Sonuç: <strong>${scenario.finalType}</strong></p>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
                <button class="btn-secondary btn-small" onclick="viewReport(${scenario.id})">👁️ Görüntüle</button>
                <button class="btn-secondary btn-small" onclick="shareResult(${scenario.id})">📤 Paylaş</button>
                <button class="btn-secondary btn-small" onclick="showComments(${scenario.id})">💬 Yorumlar</button>
            </div>
        </div>
    `).join('');
}

// Öğretmen panelini yükle
function loadTeacherPanel() {
    showPage('teacher-panel');
    document.getElementById('teacher-name').textContent = currentUser.name;
    document.getElementById('teacher-profile-name').textContent = currentUser.name;
    
    const classes = currentUser.classes || [];
    document.getElementById('total-classes').textContent = classes.length;
    
    let totalStudents = 0;
    classes.forEach(cls => {
        totalStudents += (cls.students || []).length;
    });
    document.getElementById('total-students').textContent = totalStudents;
    
    loadClassesList();
}

function loadClassesList() {
    const classesDiv = document.getElementById('classes-list');
    const classes = currentUser.classes || [];
    
    if (classes.length === 0) {
        classesDiv.innerHTML = '<p style="color: var(--text-secondary);">Henüz sınıf oluşturulmamış.</p>';
        return;
    }
    
    classesDiv.innerHTML = classes.map(cls => `
        <div class="report-card">
            <h4>${cls.name}</h4>
            <p>Öğrenci Sayısı: ${(cls.students || []).length}</p>
            <p>Sınıf Kodu: ${cls.code}</p>
            <button class="btn-secondary btn-small">Detay</button>
        </div>
    `).join('');
}

function showCreateClass() {
    const className = prompt('Sınıf adını girin (örn: 10A Coğrafya):');
    if (!className) return;
    
    const classCode = 'KRL-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    
    const newClass = {
        id: Date.now(),
        name: className,
        code: classCode,
        students: [],
        createdAt: Date.now()
    };
    
    currentUser.classes = currentUser.classes || [];
    currentUser.classes.push(newClass);
    
    const users = getFromStorage('users') || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex] = currentUser;
    saveToStorage('users', users);
    saveToStorage('currentUser', currentUser);
    
    alert(`Sınıf oluşturuldu! Sınıf Kodu: ${classCode}`);
    loadClassesList();
}

// Demo başlat
function startDemo() {
    alert('Demo modu: Kayıt olmadan kısa bir deneyim yapabilirsiniz.');
    currentUser = { name: 'Demo Kullanıcı', type: 'demo' };
    startScenario('basic');
}

// Senaryo başlat
function startScenario(type) {
    gameState = {
        turn: 0,
        decisions: [],
        indicators: {
            air: 'Orta',
            traffic: 'Yüksek',
            green: '%8',
            carbon: 'Yüksek',
            quality: 'Orta',
            economy: 'Büyüyen'
        }
    };
    
    showPage('game-screen');
    loadTurn0();
}

// Tur 0 - Şehri Tanı
function loadTurn0() {
    document.getElementById('current-turn').textContent = 'Tur 0 - Şehri Tanı';
    updateIndicators();
    
    const panel = document.getElementById('game-panel');
    panel.style.opacity = '0';
    panel.innerHTML = `
        <h2>Novaşehir'e Hoş Geldin</h2>
        <p style="font-size: 1.1rem; line-height: 1.8; margin: 2rem 0;">
            Sen Novaşehir'in yeni belediye başkanısın. Seçim kampanyanda:
        </p>
        <ul style="font-size: 1.05rem; line-height: 2; margin-left: 2rem;">
            <li>Trafiği azaltacağım</li>
            <li>Hava kirliliğiyle mücadele edeceğim</li>
            <li>Yeşil alanları artıracağım</li>
            <li>Gençler için yaşam kalitesini yükselteceğim</li>
        </ul>
        <p style="font-size: 1.1rem; line-height: 1.8; margin: 2rem 0;">
            diye söz verdin. Şimdi bu sözleri tutup tutamayacağını zaman gösterecek.
        </p>
        <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 12px; margin: 2rem 0;">
            <h3>Şehir Profili</h3>
            <p><strong>Nüfus:</strong> 1 milyon</p>
            <p><strong>Ekonomi:</strong> Büyüyen, sanayi + hizmet sektörü</p>
            <p><strong>Ulaşım:</strong> Ağırlıklı özel araç kullanımı</p>
        </div>
        <button class="btn-primary btn-large" onclick="loadTurn1()">Devam Et - Tur 1'e Geç</button>
    `;
    
    setTimeout(() => {
        panel.style.transition = 'opacity 0.5s ease';
        panel.style.opacity = '1';
    }, 100);
}

// Tur 1 - Ulaşım
function loadTurn1() {
    gameState.turn = 1;
    document.getElementById('current-turn').textContent = 'Tur 1 - Ulaşım Politikası';
    
    const panel = document.getElementById('game-panel');
    panel.style.opacity = '0';
    
    setTimeout(() => {
        panel.innerHTML = `
        <h2>Tur 1 - Ulaşım Kararın</h2>
        <p style="font-size: 1.1rem; margin: 1.5rem 0;">
            Novaşehir'in ulaşımını geleceğe hazırlarken hangi yolu seçersin?
        </p>
        
        <div class="choice-container">
            <div class="choice-card" onclick="selectChoice(1, 'A')">
                <h4>A - Otopark ve Yol Genişletme Odaklı Politika</h4>
                <p>Daha fazla köprü, kavşak ve otopark. Kısa vadede trafik biraz rahatlar. İnsanlar daha çok araba kullanır.</p>
                <div class="impact-preview">
                    <strong>Tahmini Kısa Vadeli Etki:</strong><br>
                    Trafik: Yüksek → Orta<br>
                    Hava Kalitesi: Orta → Orta- (biraz kötü)<br>
                    Yaşam Kalitesi: Değişim az
                </div>
            </div>
            
            <div class="choice-card" onclick="selectChoice(1, 'B')">
                <h4>B - Toplu Taşıma Devrimi</h4>
                <p>Metro, tramvay, otobüs ve bisiklet yollarına büyük yatırım. Özel araçlara merkezde sınırlama. İlk yıllar şantiyeler ve şikâyetler olacak.</p>
                <div class="impact-preview">
                    <strong>Tahmini Etki:</strong><br>
                    Trafik: Yüksek → Orta (kısa) → Düşük (uzun vadeli)<br>
                    Hava Kalitesi: Orta → İyi<br>
                    Yaşam Kalitesi: Kısa vadede dalgalı, sonra yüksek
                </div>
            </div>
            
            <div class="choice-card" onclick="selectChoice(1, 'C')">
                <h4>C - Karma, Yumuşak Geçiş Planı</h4>
                <p>Hem bazı yollar iyileştirilir, hem toplu taşıma desteklenir. Ne çok radikal, ne çok pasif. Ekonomik ve politik olarak daha az riskli.</p>
                <div class="impact-preview">
                    <strong>Tahmini Etki:</strong><br>
                    Trafik: Yüksek → Orta-Yüksek<br>
                    Hava Kalitesi: Orta → Biraz iyileşmiş<br>
                    Yaşam Kalitesi: Dengeli, radikal sıçrama yok
                </div>
            </div>
        </div>
    `;
        
        panel.style.transition = 'opacity 0.5s ease';
        panel.style.opacity = '1';
    }, 300);
}

// Seçim yapma
let selectedChoice = null;

function selectChoice(turn, choice) {
    selectedChoice = choice;
    
    document.querySelectorAll('.choice-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.choice-card').classList.add('selected');
    
    setTimeout(() => {
        confirmChoice(turn, choice);
    }, 500);
}

function confirmChoice(turn, choice) {
    gameState.decisions.push({ turn, choice });
    
    // XP kazan
    if (typeof addXP === 'function') {
        addXP(30);
    }
    
    if (turn === 1) {
        updateIndicatorsAfterTurn1(choice);
        showTurnSummary(1, choice, () => {
            // Rastgele olay tetikle
            if (typeof triggerRandomEvent === 'function') {
                triggerRandomEvent();
            }
            loadTurn2();
        });
    } else if (turn === 2) {
        updateIndicatorsAfterTurn2(choice);
        showTurnSummary(2, choice, () => {
            if (typeof triggerRandomEvent === 'function') {
                triggerRandomEvent();
            }
            loadTurn3();
        });
    } else if (turn === 3) {
        updateIndicatorsAfterTurn3(choice);
        showFinalReport();
    }
}

function updateIndicatorsAfterTurn1(choice) {
    if (choice === 'A') {
        gameState.indicators.traffic = 'Orta';
        gameState.indicators.air = 'Orta-';
    } else if (choice === 'B') {
        gameState.indicators.traffic = 'Orta';
        gameState.indicators.air = 'Orta+';
        gameState.indicators.quality = 'Orta+';
    } else {
        gameState.indicators.traffic = 'Orta-Yüksek';
        gameState.indicators.air = 'Orta';
    }
    updateIndicators();
}

function updateIndicatorsAfterTurn2(choice) {
    if (choice === 'A') {
        gameState.indicators.green = '%5';
        gameState.indicators.air = gameState.indicators.air === 'Orta+' ? 'Orta' : 'Düşük';
        gameState.indicators.quality = 'Orta-';
    } else if (choice === 'B') {
        gameState.indicators.green = '%12';
        gameState.indicators.air = gameState.indicators.air === 'Orta+' ? 'İyi' : 'Orta+';
        gameState.indicators.quality = 'Orta+';
    } else {
        gameState.indicators.green = '%9';
        gameState.indicators.quality = 'Orta';
    }
    updateIndicators();
}

function updateIndicatorsAfterTurn3(choice) {
    if (choice === 'A') {
        gameState.indicators.carbon = 'Çok Yüksek';
        gameState.indicators.air = 'Düşük';
        gameState.indicators.economy = 'Güçlü';
    } else if (choice === 'B') {
        gameState.indicators.carbon = 'Düşük';
        gameState.indicators.air = 'İyi';
        gameState.indicators.economy = 'Orta';
    } else {
        gameState.indicators.carbon = 'Orta';
        gameState.indicators.air = gameState.indicators.air === 'İyi' ? 'İyi' : 'Orta+';
        gameState.indicators.economy = 'Büyüyen';
    }
    updateIndicators();
}

function updateIndicators() {
    document.getElementById('ind-air').textContent = gameState.indicators.air;
    document.getElementById('ind-traffic').textContent = gameState.indicators.traffic;
    document.getElementById('ind-green').textContent = gameState.indicators.green;
    document.getElementById('ind-carbon').textContent = gameState.indicators.carbon;
    document.getElementById('ind-quality').textContent = gameState.indicators.quality;
    document.getElementById('ind-economy').textContent = gameState.indicators.economy;
}

function showTurnSummary(turn, choice, nextCallback) {
    const choiceNames = {
        1: {
            'A': 'Otopark ve Yol Genişletme',
            'B': 'Toplu Taşıma Devrimi',
            'C': 'Karma Geçiş Planı'
        },
        2: {
            'A': 'Yeşil Alan Feda Edilir',
            'B': 'Dikey Mimari ve Yeşil Alan Koruma',
            'C': 'Kentsel Dönüşüm Odaklı Plan'
        },
        3: {
            'A': 'Fosil Yakıt Ağırlıklı',
            'B': 'Yenilenebilir Enerji Devrimi',
            'C': 'Geçiş Planı (Karma)'
        }
    };
    
    const reactions = {
        1: {
            'A': 'Araç sahipleri memnun, ancak çevre grupları endişeli.',
            'B': 'Trafikteki şantiyeler bazı vatandaşların şikayet etmesine neden oldu. Gençler ve öğrenciler bisiklet ve metro yatırımlarını olumlu karşıladı.',
            'C': 'Dengeli yaklaşım genel olarak kabul gördü.'
        },
        2: {
            'A': 'Evin olması güzel ama çocuklarımın oynayacağı park neredeyse kalmadı.',
            'B': 'Mahallemizde gökdelenler yükseliyor, kimisi mutlu, kimisi rahatsız.',
            'C': 'Deprem güvenliği arttı, ancak inşaat gürültüsü rahatsız ediyor.'
        },
        3: {
            'A': 'Enerji ucuz ama hava kirliliği artıyor.',
            'B': 'Yenilenebilir enerji yatırımları uzun vadede faydalı olacak.',
            'C': 'Aşamalı geçiş dengeli bir yaklaşım.'
        }
    };
    
    const panel = document.getElementById('game-panel');
    panel.innerHTML = `
        <div style="text-align: center;">
            <h2>Tur ${turn} Özeti</h2>
            <div style="background: #dbeafe; padding: 2rem; border-radius: 12px; margin: 2rem 0; text-align: left;">
                <h3>Aldığın Karar:</h3>
                <p style="font-size: 1.2rem; color: var(--primary-color); font-weight: bold;">
                    ${choiceNames[turn][choice]}
                </p>
                
                <h3 style="margin-top: 1.5rem;">Halkın Tepkisi:</h3>
                <p style="font-style: italic;">"${reactions[turn][choice]}"</p>
            </div>
            
            <button class="btn-primary btn-large" onclick="nextTurn()">Tur ${turn + 1}'e Geç</button>
        </div>
    `;
    
    window.nextTurn = nextCallback;
}

// Tur 2 - Yeşil Alan
function loadTurn2() {
    gameState.turn = 2;
    document.getElementById('current-turn').textContent = 'Tur 2 - Yeşil Alan & İmar';
    
    const turn1Choice = gameState.decisions[0].choice;
    const choiceText = turn1Choice === 'A' ? 'Otopark ve Yol Genişletme' : 
                       turn1Choice === 'B' ? 'Toplu Taşıma Devrimi' : 'Karma Geçiş Planı';
    
    const panel = document.getElementById('game-panel');
    panel.innerHTML = `
        <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <strong>Ulaşım Turunda:</strong> ${choiceText} seçeneğini tercih ettin.
        </div>
        
        <h2>Tur 2 - Yeşil Alan & İmar Kararı</h2>
        <p style="font-size: 1.1rem; margin: 1.5rem 0;">
            Artan nüfus için konut ihtiyacı var. Aynı zamanda yeşil alanlar çok az. Hangi planı uygularsın?
        </p>
        
        <div class="choice-container">
            <div class="choice-card" onclick="selectChoice(2, 'A')">
                <h4>A - Yeni Konutlar İçin Yeşil Alan Feda Edilir</h4>
                <p>Parkların bir kısmı imara açılır. Kira fiyatları biraz düşer, konut sıkıntısı hafifler.</p>
                <div class="impact-preview">
                    <strong>Tahmini Etki:</strong><br>
                    Yeşil Alan: %8 → %5<br>
                    Hava Kalitesi: Olumsuz etkilenir<br>
                    Konut: Artış
                </div>
            </div>
            
            <div class="choice-card" onclick="selectChoice(2, 'B')">
                <h4>B - Dikey Mimari ve Yeşil Alan Koruma</h4>
                <p>Yatay yayılma yerine çok katlı binalar. Mevcut yeşil alanlar korunur, bazı boş alanlar parka çevrilir.</p>
                <div class="impact-preview">
                    <strong>Tahmini Etki:</strong><br>
                    Yeşil Alan: %8 → %12<br>
                    Hava Kalitesi: İyileşir<br>
                    Yaşam Kalitesi: Artar
                </div>
            </div>
            
            <div class="choice-card" onclick="selectChoice(2, 'C')">
                <h4>C - Kentsel Dönüşüm Odaklı Plan</h4>
                <p>Eski, riskli binalar yıkılır, aynı alanda daha verimli yerleşim. Deprem güvenliği artar.</p>
                <div class="impact-preview">
                    <strong>Tahmini Etki:</strong><br>
                    Yeşil Alan: %8 → %9<br>
                    Güvenlik: Artar<br>
                    Süreç: Uzun ve meşakkatli
                </div>
            </div>
        </div>
    `;
}

// Tur 3 - Enerji
function loadTurn3() {
    gameState.turn = 3;
    document.getElementById('current-turn').textContent = 'Tur 3 - Enerji & Atık';
    
    const panel = document.getElementById('game-panel');
    panel.innerHTML = `
        <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <strong>Önceki Kararların:</strong><br>
            Ulaşım: ${getChoiceName(1, gameState.decisions[0].choice)}<br>
            İmar: ${getChoiceName(2, gameState.decisions[1].choice)}
        </div>
        
        <h2>Tur 3 - Enerji ve Atık Yönetimi</h2>
        <p style="font-size: 1.1rem; margin: 1.5rem 0;">
            Novaşehir'in enerji ihtiyacı artıyor, çöp miktarı da büyüyor. Nasıl bir yol izlersin?
        </p>
        
        <div class="choice-container">
            <div class="choice-card" onclick="selectChoice(3, 'A')">
                <h4>A - Fosil Yakıt Ağırlıklı, Ucuz Enerji</h4>
                <p>Kömür/doğalgaz ağırlıklı enerji üretimi. Kısa vadede enerji maliyeti düşük.</p>
                <div class="impact-preview">
                    <strong>Tahmini Etki:</strong><br>
                    Karbon Emisyonu: Yüksek → Çok Yüksek<br>
                    Hava Kalitesi: Kötüleşir<br>
                    Ekonomi: Güçlü
                </div>
            </div>
            
            <div class="choice-card" onclick="selectChoice(3, 'B')">
                <h4>B - Yenilenebilir Enerji ve Geri Dönüşüm Atağı</h4>
                <p>Güneş ve rüzgâr yatırımları. Geri dönüşüm tesisleri, atık ayrıştırma kampanyaları.</p>
                <div class="impact-preview">
                    <strong>Tahmini Etki:</strong><br>
                    Karbon Emisyonu: Yüksek → Düşük<br>
                    Hava Kalitesi: İyi<br>
                    Maliyet: Başta yüksek
                </div>
            </div>
            
            <div class="choice-card" onclick="selectChoice(3, 'C')">
                <h4>C - Geçiş Planı (Yarı Fosil – Yarı Yenilenebilir)</h4>
                <p>Mevcut santraller aşamalı olarak azaltılır. Yenilenebilir payı her yıl artar.</p>
                <div class="impact-preview">
                    <strong>Tahmini Etki:</strong><br>
                    Karbon Emisyonu: Yavaşça düşer<br>
                    Ekonomik Şok: Az<br>
                    Dengeli yaklaşım
                </div>
            </div>
        </div>
    `;
}

function getChoiceName(turn, choice) {
    const names = {
        1: { 'A': 'Otopark ve Yol', 'B': 'Toplu Taşıma', 'C': 'Karma Plan' },
        2: { 'A': 'Yeşil Alan Feda', 'B': 'Dikey Mimari', 'C': 'Kentsel Dönüşüm' },
        3: { 'A': 'Fosil Yakıt', 'B': 'Yenilenebilir', 'C': 'Geçiş Planı' }
    };
    return names[turn][choice];
}

// Final Rapor
function showFinalReport() {
    const decisions = gameState.decisions.map(d => d.choice).join('');
    let finalType, icon, reportText, suggestions;
    
    // Ekonomi Odaklı: A ağırlıklı
    if (decisions.includes('AAA') || decisions.match(/A.*A/)) {
        finalType = 'Ekonomi Odaklı Şehir';
        icon = '💰';
        reportText = `
            Kısa vadede konut ve enerji maliyetlerini düşürdünüz. Ancak hava kirliliği, 
            gürültü ve yeşil alan eksikliği uzun vadede sağlık harcamalarını ve sosyal 
            memnuniyetsizliği artıracak. Şehriniz ekonomik olarak cazip görünse de 
            sürdürülebilirlik açısından kırmızı alarm veriyor.
        `;
        suggestions = `
            <li>Ulaşım kararınızı B (Toplu Taşıma Devrimi) seçseydiniz, trafik ve hava kalitesi daha dengeli olabilirdi.</li>
            <li>Yeşil alan kararı olarak B veya C'yi seçseydiniz, ısı adası etkisini azaltıp yaşam kalitesini yükseltebilirdiniz.</li>
            <li>Yenilenebilir enerji yatırımları uzun vadede hem çevreye hem ekonomiye faydalı olacaktı.</li>
        `;
    }
    // Sürdürülebilir: B ağırlıklı
    else if (decisions.includes('BBB') || decisions.match(/B.*B.*B/)) {
        finalType = 'Sürdürülebilir Şehir';
        icon = '🌱';
        reportText = `
            Uzun vadede daha sağlıklı, çevre dostu ve yaşam kalitesi yüksek bir şehir kurdunuz. 
            Kısa vadede bazı ekonomik zorluklar ve şantiye süreçleri yaşandı; ancak gelecek 
            nesiller için güçlü bir temel attınız. Novaşehir, sürdürülebilir şehirler arasında 
            örnek gösterilmeye aday.
        `;
        suggestions = `
            <li>Tebrikler! Cesur ve uzun vadeli kararlar aldınız.</li>
            <li>Ulaşım, yeşil alan ve enerji kararlarınız birlikte çalışarak ısı adası etkisini önemli ölçüde azalttı.</li>
            <li>Vatandaş memnuniyeti başlangıçta dalgalı olsa da, 5-10 yıl sonra şehriniz yaşanabilir bir örnek olacak.</li>
        `;
    }
    // Dengeci: Karma
    else {
        finalType = 'Dengeci Şehir';
        icon = '⚖️';
        reportText = `
            Her alanda orta düzey kararlar aldınız. Krizleri büyütmeden yönetmeyi seçtiniz, 
            radikal dönüşümlere çok girmediniz. Bu sayede şehrinizde büyük bir çöküş yaşanmadı; 
            ancak sürdürülebilirlik açısından atılması gereken bazı cesur adımları ertelemiş 
            görünüyorsunuz.
        `;
        suggestions = `
            <li>Dengeli yaklaşımınız riskleri azalttı ama potansiyel kazanımları da sınırladı.</li>
            <li>Bazı alanlarda daha cesur kararlar alsaydınız, şehriniz daha sürdürülebilir olabilirdi.</li>
            <li>Ekonomik istikrar sağladınız ancak çevre hedeflerine tam ulaşamadınız.</li>
        `;
    }
    
    document.getElementById('current-turn').textContent = 'Final Raporu';
    
    const panel = document.getElementById('game-panel');
    panel.innerHTML = `
        <div class="final-report">
            <div class="final-icon">${icon}</div>
            <h2>${finalType}</h2>
            
            <div class="indicators-table">
                <h3>Final Göstergeler</h3>
                <div class="indicator">
                    <span>Hava Kalitesi</span>
                    <span class="indicator-value">${gameState.indicators.air}</span>
                </div>
                <div class="indicator">
                    <span>Trafik Yoğunluğu</span>
                    <span class="indicator-value">${gameState.indicators.traffic}</span>
                </div>
                <div class="indicator">
                    <span>Yeşil Alan Oranı</span>
                    <span class="indicator-value">${gameState.indicators.green}</span>
                </div>
                <div class="indicator">
                    <span>Karbon Emisyonu</span>
                    <span class="indicator-value">${gameState.indicators.carbon}</span>
                </div>
                <div class="indicator">
                    <span>Yaşam Kalitesi</span>
                    <span class="indicator-value">${gameState.indicators.quality}</span>
                </div>
                <div class="indicator">
                    <span>Ekonomi</span>
                    <span class="indicator-value">${gameState.indicators.economy}</span>
                </div>
            </div>
            
            <div class="report-text">
                <h3>Değerlendirme</h3>
                <p>${reportText}</p>
                
                <h3 style="margin-top: 1.5rem;">Öneriler ve Yorumlar</h3>
                <ul style="line-height: 2;">
                    ${suggestions}
                </ul>
            </div>
            
            <div class="report-actions">
                <button class="btn-primary" onclick="saveScenario('${finalType}')">Raporu Kaydet</button>
                <button class="btn-secondary" onclick="startScenario('basic')">Tekrar Oyna</button>
                <button class="btn-secondary" onclick="backToPanel()">Panele Dön</button>
            </div>
        </div>
    `;
}

function saveScenario(finalType) {
    if (!currentUser || currentUser.type === 'demo') {
        showToast('Raporu kaydetmek için giriş yapmalısınız!', 'warning');
        return;
    }
    
    const scenario = {
        id: Date.now(),
        name: 'Novaşehir - Temel Senaryo',
        date: Date.now(),
        finalType: finalType,
        decisions: gameState.decisions,
        indicators: gameState.indicators
    };
    
    currentUser.scenarios = currentUser.scenarios || [];
    currentUser.scenarios.push(scenario);
    
    const users = getFromStorage('users') || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex] = currentUser;
    saveToStorage('users', users);
    saveToStorage('currentUser', currentUser);
    
    // XP ve Başarılar
    addXP(100);
    checkAchievement('first_game');
    checkDailyQuest('play_scenario');
    
    if (finalType === 'Sürdürülebilir Şehir') {
        checkAchievement('eco_warrior');
        if (!currentUser.badges.includes('green-city')) {
            currentUser.badges.push('green-city');
        }
    }
    
    // Senaryo sayısı kontrolü
    if (currentUser.scenarios.length >= 20) {
        checkAchievement('scenario_master');
    }
    
    showToast('Rapor kaydedildi! +100 XP', 'success');
}

function backToPanel() {
    if (!currentUser || currentUser.type === 'demo') {
        showLanding();
    } else if (currentUser.type === 'student') {
        loadStudentPanel();
    } else {
        loadTeacherPanel();
    }
}

function viewReport(scenarioId) {
    const scenario = currentUser.scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    alert(`Senaryo: ${scenario.name}\nSonuç: ${scenario.finalType}\nTarih: ${new Date(scenario.date).toLocaleDateString('tr-TR')}`);
}

// Sayfa yüklendiğinde
window.addEventListener('DOMContentLoaded', () => {
    createAdminIfNotExists();
    
    const savedUser = getFromStorage('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        if (currentUser.type === 'student') {
            loadStudentPanel();
        } else if (currentUser.type === 'teacher') {
            loadTeacherPanel();
        } else if (currentUser.type === 'admin') {
            loadAdminPanel();
        }
    }
});


// Sınıf Detay Sayfası
let currentClassId = null;

function viewClassDetail(classId) {
    currentClassId = classId;
    const classData = currentUser.classes.find(c => c.id === classId);
    if (!classData) return;
    
    showPage('class-detail-page');
    document.getElementById('class-detail-name').textContent = classData.name;
    document.getElementById('class-detail-code').textContent = classData.code;
    document.getElementById('class-detail-student-count').textContent = (classData.students || []).length;
    
    loadClassStudents(classData);
    loadClassReports(classData);
}

function loadClassStudents(classData) {
    const studentsDiv = document.getElementById('class-students-list');
    const students = classData.students || [];
    
    if (students.length === 0) {
        studentsDiv.innerHTML = '<p style="color: var(--text-secondary);">Henüz öğrenci yok. Sınıf kodunu öğrencilerinizle paylaşın.</p>';
        return;
    }
    
    const users = getFromStorage('users') || [];
    studentsDiv.innerHTML = `
        <table class="user-table">
            <thead>
                <tr>
                    <th>Ad Soyad</th>
                    <th>E-posta</th>
                    <th>Senaryo Sayısı</th>
                    <th>Son Sonuç</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(studentId => {
                    const student = users.find(u => u.id === studentId);
                    if (!student) return '';
                    const lastScenario = student.scenarios && student.scenarios.length > 0 
                        ? student.scenarios[student.scenarios.length - 1] 
                        : null;
                    return `
                        <tr>
                            <td>${student.name}</td>
                            <td>${student.email}</td>
                            <td>${(student.scenarios || []).length}</td>
                            <td>${lastScenario ? lastScenario.finalType : '-'}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function loadClassReports(classData) {
    const reportsDiv = document.getElementById('class-reports');
    const students = classData.students || [];
    const users = getFromStorage('users') || [];
    
    let economyCount = 0;
    let balancedCount = 0;
    let sustainableCount = 0;
    let totalScenarios = 0;
    
    students.forEach(studentId => {
        const student = users.find(u => u.id === studentId);
        if (!student || !student.scenarios) return;
        
        student.scenarios.forEach(scenario => {
            totalScenarios++;
            if (scenario.finalType.includes('Ekonomi')) economyCount++;
            else if (scenario.finalType.includes('Dengeci')) balancedCount++;
            else if (scenario.finalType.includes('Sürdürülebilir')) sustainableCount++;
        });
    });
    
    if (totalScenarios === 0) {
        reportsDiv.innerHTML = '<p style="color: var(--text-secondary);">Henüz tamamlanmış senaryo yok.</p>';
        return;
    }
    
    const economyPercent = (economyCount / totalScenarios * 100).toFixed(0);
    const balancedPercent = (balancedCount / totalScenarios * 100).toFixed(0);
    const sustainablePercent = (sustainableCount / totalScenarios * 100).toFixed(0);
    
    reportsDiv.innerHTML = `
        <div class="chart-container">
            <h4>Sınıf Sonuç Dağılımı</h4>
            <div class="chart-bar">
                <div class="chart-label">💰 Ekonomi Odaklı</div>
                <div class="chart-bar-fill" style="width: ${economyPercent}%; max-width: 100%;"></div>
                <div class="chart-value">${economyCount} (%${economyPercent})</div>
            </div>
            <div class="chart-bar">
                <div class="chart-label">⚖️ Dengeci</div>
                <div class="chart-bar-fill" style="width: ${balancedPercent}%; max-width: 100%;"></div>
                <div class="chart-value">${balancedCount} (%${balancedPercent})</div>
            </div>
            <div class="chart-bar">
                <div class="chart-label">🌱 Sürdürülebilir</div>
                <div class="chart-bar-fill" style="width: ${sustainablePercent}%; max-width: 100%;"></div>
                <div class="chart-value">${sustainableCount} (%${sustainablePercent})</div>
            </div>
        </div>
        
        <div class="report-text">
            <h4>Değerlendirme ve Öneriler</h4>
            <p>Sınıfınızın %${economyPercent}'i ekonomi odaklı kararlar verdi.</p>
            <p>Yalnızca %${sustainablePercent}'i tam sürdürülebilir finale ulaştı.</p>
            <br>
            <h4>Tartışma Soruları</h4>
            <ul>
                <li>Neden öğrenciler kısa vadeli ekonomik avantajlara yönelmiş olabilir?</li>
                <li>Hangi kararlar değiştirilseydi daha sürdürülebilir sonuçlar çıkardı?</li>
                <li>Gerçek hayatta şehir yöneticileri hangi baskılarla karşılaşır?</li>
            </ul>
        </div>
    `;
}

function backToTeacherPanel() {
    loadTeacherPanel();
}

function copyClassCode() {
    const code = document.getElementById('class-detail-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showToast('Sınıf kodu kopyalandı!');
    });
}

function downloadClassReport() {
    showToast('PDF rapor indiriliyor...', 'warning');
    
    setTimeout(() => {
        const classData = currentUser.classes.find(c => c.id === currentClassId);
        const reportContent = `
KararLab - Sınıf Raporu
========================

Sınıf: ${classData.name}
Sınıf Kodu: ${classData.code}
Öğrenci Sayısı: ${(classData.students || []).length}
Tarih: ${new Date().toLocaleDateString('tr-TR')}

Bu rapor tarayıcı konsolunda görüntülenmektedir.
Gerçek PDF oluşturma için jsPDF kütüphanesi eklenebilir.
        `;
        
        console.log(reportContent);
        showToast('Rapor konsola yazdırıldı. Gerçek PDF için jsPDF kütüphanesi gerekli.', 'warning');
    }, 1000);
}

// Sınıfa Katılma
function showJoinClassModal() {
    document.getElementById('join-class-modal').classList.add('active');
}

function closeJoinClassModal() {
    document.getElementById('join-class-modal').classList.remove('active');
}

function joinClass() {
    const code = document.getElementById('join-class-code').value.trim();
    if (!code) {
        showToast('Lütfen sınıf kodunu girin!', 'error');
        return;
    }
    
    const users = getFromStorage('users') || [];
    let foundClass = null;
    let teacherUser = null;
    
    users.forEach(user => {
        if (user.type === 'teacher' && user.classes) {
            const cls = user.classes.find(c => c.code === code);
            if (cls) {
                foundClass = cls;
                teacherUser = user;
            }
        }
    });
    
    if (!foundClass) {
        showToast('Sınıf kodu bulunamadı!', 'error');
        return;
    }
    
    if (foundClass.students && foundClass.students.includes(currentUser.id)) {
        showToast('Zaten bu sınıfa kayıtlısınız!', 'warning');
        closeJoinClassModal();
        return;
    }
    
    foundClass.students = foundClass.students || [];
    foundClass.students.push(currentUser.id);
    
    const teacherIndex = users.findIndex(u => u.id === teacherUser.id);
    users[teacherIndex] = teacherUser;
    saveToStorage('users', users);
    
    currentUser.classId = foundClass.id;
    currentUser.className = foundClass.name;
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex] = currentUser;
    saveToStorage('users', users);
    saveToStorage('currentUser', currentUser);
    
    showToast('Sınıfa başarıyla katıldınız!');
    closeJoinClassModal();
    loadStudentClassInfo();
}

function loadStudentClassInfo() {
    const infoDiv = document.getElementById('student-class-info');
    
    if (!currentUser.classId) {
        infoDiv.innerHTML = '<p style="color: var(--text-secondary);">Henüz bir sınıfa katılmadınız.</p>';
        return;
    }
    
    infoDiv.innerHTML = `
        <div class="student-info-card">
            <h4>${currentUser.className}</h4>
            <p>Öğretmeniniz tarafından oluşturulan sınıfa kayıtlısınız.</p>
        </div>
    `;
}

// Admin Paneli
function loadAdminPanel() {
    showPage('admin-panel');
    
    const users = getFromStorage('users') || [];
    const students = users.filter(u => u.type === 'student');
    const teachers = users.filter(u => u.type === 'teacher');
    
    let totalScenarios = 0;
    users.forEach(user => {
        if (user.scenarios) {
            totalScenarios += user.scenarios.length;
        }
    });
    
    document.getElementById('admin-total-users').textContent = users.length;
    document.getElementById('admin-total-students').textContent = students.length;
    document.getElementById('admin-total-teachers').textContent = teachers.length;
    document.getElementById('admin-total-scenarios').textContent = totalScenarios;
    
    loadAdminUsersList(users);
}

function loadAdminUsersList(users) {
    const usersDiv = document.getElementById('admin-users-list');
    
    usersDiv.innerHTML = `
        <table class="user-table">
            <thead>
                <tr>
                    <th>Ad Soyad</th>
                    <th>E-posta</th>
                    <th>Şifre</th>
                    <th>Tip</th>
                    <th>Senaryo</th>
                    <th>Seviye</th>
                    <th>Kayıt Tarihi</th>
                    <th>İşlem</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td><code>${user.password}</code></td>
                        <td>${user.type === 'student' ? '🎓 Öğrenci' : user.type === 'teacher' ? '👨‍🏫 Öğretmen' : '🔧 Admin'}</td>
                        <td>${(user.scenarios || []).length}</td>
                        <td>Lvl ${user.level || 1}</td>
                        <td>${new Date(user.id).toLocaleDateString('tr-TR')}</td>
                        <td>
                            <button class="btn-small btn-secondary" onclick="viewUserDetails(${user.id})">Detay</button>
                            <button class="btn-small btn-secondary" onclick="deleteUser(${user.id})">Sil</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function deleteUser(userId) {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    
    let users = getFromStorage('users') || [];
    users = users.filter(u => u.id !== userId);
    saveToStorage('users', users);
    
    showToast('Kullanıcı silindi!');
    loadAdminUsersList(users);
}

// Toast Bildirimleri
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Sınıf listesini güncelle
function loadClassesList() {
    const classesDiv = document.getElementById('classes-list');
    const classes = currentUser.classes || [];
    
    if (classes.length === 0) {
        classesDiv.innerHTML = '<p style="color: var(--text-secondary);">Henüz sınıf oluşturulmamış.</p>';
        return;
    }
    
    classesDiv.innerHTML = classes.map(cls => `
        <div class="report-card">
            <h4>${cls.name}</h4>
            <p>Öğrenci Sayısı: ${(cls.students || []).length}</p>
            <p>Sınıf Kodu: <strong>${cls.code}</strong></p>
            <button class="btn-secondary btn-small" onclick="viewClassDetail(${cls.id})">Detay Gör</button>
        </div>
    `).join('');
}


// Şifre Sıfırlama
function showPasswordReset() {
    showPage('password-reset-page');
}

function handlePasswordReset(event) {
    event.preventDefault();
    
    const username = document.getElementById('reset-email').value;
    const newPassword = document.getElementById('reset-new-password').value;
    const confirmPassword = document.getElementById('reset-confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        showToast('Şifreler eşleşmiyor!', 'error');
        return;
    }
    
    if (newPassword.length < 3) {
        showToast('Şifre en az 3 karakter olmalıdır!', 'error');
        return;
    }
    
    const users = getFromStorage('users') || [];
    const userIndex = users.findIndex(u => u.email === username);
    
    if (userIndex === -1) {
        showToast('Bu kullanıcı adı kayıtlı değil!', 'error');
        return;
    }
    
    users[userIndex].password = newPassword;
    saveToStorage('users', users);
    
    showToast('Şifreniz başarıyla sıfırlandı!');
    setTimeout(() => {
        showLogin();
    }, 1500);
}

// Gelişmiş Senaryo Kilidi Açma
function unlockAdvancedScenario() {
    if (!currentUser.scenarios || currentUser.scenarios.length < 3) {
        showToast('Gelişmiş senaryoyu açmak için en az 3 senaryo tamamlamalısınız!', 'warning');
        return;
    }
    
    showToast('Gelişmiş senaryo yakında eklenecek!', 'warning');
}


// Admin - Kullanıcı Detayları
function viewUserDetails(userId) {
    const users = getFromStorage('users') || [];
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const scenarios = user.scenarios || [];
    const badges = user.badges || [];
    const friends = user.friends || [];
    
    // Başarı istatistikleri
    const sustainableCount = scenarios.filter(s => s.finalType && s.finalType.includes('Sürdürülebilir')).length;
    const balancedCount = scenarios.filter(s => s.finalType && s.finalType.includes('Dengeci')).length;
    const economyCount = scenarios.filter(s => s.finalType && s.finalType.includes('Ekonomi')).length;
    
    // Sınıf bilgisi
    let classInfo = 'Sınıfa kayıtlı değil';
    if (user.classId) {
        const teachers = users.filter(u => u.type === 'teacher');
        teachers.forEach(teacher => {
            if (teacher.classes) {
                const userClass = teacher.classes.find(c => c.id === user.classId);
                if (userClass) {
                    classInfo = `${userClass.name} (Öğretmen: ${teacher.name})`;
                }
            }
        });
    }
    
    // Öğretmen ise sınıf bilgileri
    let teacherInfo = '';
    if (user.type === 'teacher' && user.classes) {
        teacherInfo = `
            <div class="detail-section">
                <h4>Sınıflar</h4>
                ${user.classes.map(cls => `
                    <div class="class-info">
                        <strong>${cls.name}</strong>
                        <p>Kod: ${cls.code}</p>
                        <p>Öğrenci: ${(cls.students || []).length}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content user-detail-modal">
            <h2>👤 Kullanıcı Detayları</h2>
            
            <div class="detail-grid">
                <div class="detail-section">
                    <h4>Temel Bilgiler</h4>
                    <p><strong>Ad Soyad:</strong> ${user.name}</p>
                    <p><strong>E-posta:</strong> ${user.email}</p>
                    <p><strong>Şifre:</strong> <code>${user.password}</code></p>
                    <p><strong>Tip:</strong> ${user.type === 'student' ? '🎓 Öğrenci' : user.type === 'teacher' ? '👨‍🏫 Öğretmen' : '🔧 Admin'}</p>
                    <p><strong>Kayıt Tarihi:</strong> ${new Date(user.id).toLocaleDateString('tr-TR')} ${new Date(user.id).toLocaleTimeString('tr-TR')}</p>
                    ${user.type === 'student' ? `<p><strong>Sınıf:</strong> ${classInfo}</p>` : ''}
                    ${user.school ? `<p><strong>Okul:</strong> ${user.school}</p>` : ''}
                    ${user.branch ? `<p><strong>Branş:</strong> ${user.branch}</p>` : ''}
                </div>
                
                ${user.type === 'student' ? `
                <div class="detail-section">
                    <h4>Oyun İstatistikleri</h4>
                    <p><strong>Seviye:</strong> ${user.level || 1}</p>
                    <p><strong>XP:</strong> ${user.xp || 0}</p>
                    <p><strong>Toplam Senaryo:</strong> ${scenarios.length}</p>
                    <p><strong>🌱 Sürdürülebilir:</strong> ${sustainableCount}</p>
                    <p><strong>⚖️ Dengeci:</strong> ${balancedCount}</p>
                    <p><strong>💰 Ekonomi Odaklı:</strong> ${economyCount}</p>
                    <p><strong>Rozet Sayısı:</strong> ${badges.length}</p>
                    <p><strong>Arkadaş Sayısı:</strong> ${friends.length}</p>
                </div>
                ` : ''}
                
                ${teacherInfo}
            </div>
            
            ${scenarios.length > 0 ? `
            <div class="detail-section">
                <h4>Son Senaryolar</h4>
                <div class="scenarios-list">
                    ${scenarios.slice(-5).reverse().map(scenario => `
                        <div class="scenario-item">
                            <div>
                                <strong>${scenario.name}</strong>
                                <p>Sonuç: ${scenario.finalType}</p>
                            </div>
                            <small>${new Date(scenario.date).toLocaleDateString('tr-TR')}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${badges.length > 0 ? `
            <div class="detail-section">
                <h4>Rozetler</h4>
                <div class="badges-display">
                    ${badges.map(badge => `<span class="badge-icon">${badge}</span>`).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
                <button class="btn-primary" onclick="editUser(${userId})">Düzenle</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Admin - Kullanıcı Düzenleme
function editUser(userId) {
    const users = getFromStorage('users') || [];
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newName = prompt('Yeni Ad Soyad:', user.name);
    if (newName && newName.trim()) {
        user.name = newName.trim();
    }
    
    const newEmail = prompt('Yeni E-posta:', user.email);
    if (newEmail && newEmail.trim()) {
        user.email = newEmail.trim();
    }
    
    const newPassword = prompt('Yeni Şifre:', user.password);
    if (newPassword && newPassword.trim()) {
        user.password = newPassword.trim();
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    users[userIndex] = user;
    saveToStorage('users', users);
    
    showToast('Kullanıcı güncellendi!', 'success');
    
    // Modalı kapat ve listeyi yenile
    document.querySelector('.user-detail-modal').closest('.modal').remove();
    loadAdminUsersList(users);
}


// Admin - Detaylı İstatistikler
function showAdminStats() {
    const users = getFromStorage('users') || [];
    const students = users.filter(u => u.type === 'student');
    const teachers = users.filter(u => u.type === 'teacher');
    
    let totalScenarios = 0;
    let totalSustainable = 0;
    let totalBalanced = 0;
    let totalEconomy = 0;
    let totalXP = 0;
    let totalLevel = 0;
    
    students.forEach(student => {
        totalScenarios += (student.scenarios || []).length;
        totalXP += student.xp || 0;
        totalLevel += student.level || 1;
        
        (student.scenarios || []).forEach(scenario => {
            if (scenario.finalType) {
                if (scenario.finalType.includes('Sürdürülebilir')) totalSustainable++;
                else if (scenario.finalType.includes('Dengeci')) totalBalanced++;
                else if (scenario.finalType.includes('Ekonomi')) totalEconomy++;
            }
        });
    });
    
    const avgLevel = students.length > 0 ? (totalLevel / students.length).toFixed(1) : 0;
    const avgScenarios = students.length > 0 ? (totalScenarios / students.length).toFixed(1) : 0;
    
    let totalClasses = 0;
    let totalClassStudents = 0;
    teachers.forEach(teacher => {
        totalClasses += (teacher.classes || []).length;
        (teacher.classes || []).forEach(cls => {
            totalClassStudents += (cls.students || []).length;
        });
    });
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content stats-modal">
            <h2>📊 Detaylı İstatistikler</h2>
            
            <div class="stats-grid">
                <div class="stat-box-large">
                    <div class="stat-icon-large">👥</div>
                    <h3>${users.length}</h3>
                    <p>Toplam Kullanıcı</p>
                    <small>${students.length} Öğrenci, ${teachers.length} Öğretmen</small>
                </div>
                
                <div class="stat-box-large">
                    <div class="stat-icon-large">🎮</div>
                    <h3>${totalScenarios}</h3>
                    <p>Toplam Senaryo</p>
                    <small>Ortalama: ${avgScenarios} / öğrenci</small>
                </div>
                
                <div class="stat-box-large">
                    <div class="stat-icon-large">⭐</div>
                    <h3>${avgLevel}</h3>
                    <p>Ortalama Seviye</p>
                    <small>Toplam XP: ${totalXP.toLocaleString()}</small>
                </div>
                
                <div class="stat-box-large">
                    <div class="stat-icon-large">🏫</div>
                    <h3>${totalClasses}</h3>
                    <p>Toplam Sınıf</p>
                    <small>${totalClassStudents} öğrenci kayıtlı</small>
                </div>
            </div>
            
            <div class="chart-section">
                <h3>Senaryo Sonuç Dağılımı</h3>
                <div class="chart-container">
                    <div class="chart-bar">
                        <div class="chart-label">🌱 Sürdürülebilir</div>
                        <div class="chart-bar-fill" style="width: ${totalScenarios > 0 ? (totalSustainable / totalScenarios * 100) : 0}%; background: var(--success-color);"></div>
                        <div class="chart-value">${totalSustainable} (${totalScenarios > 0 ? ((totalSustainable / totalScenarios * 100).toFixed(1)) : 0}%)</div>
                    </div>
                    <div class="chart-bar">
                        <div class="chart-label">⚖️ Dengeci</div>
                        <div class="chart-bar-fill" style="width: ${totalScenarios > 0 ? (totalBalanced / totalScenarios * 100) : 0}%; background: var(--warning-color);"></div>
                        <div class="chart-value">${totalBalanced} (${totalScenarios > 0 ? ((totalBalanced / totalScenarios * 100).toFixed(1)) : 0}%)</div>
                    </div>
                    <div class="chart-bar">
                        <div class="chart-label">💰 Ekonomi Odaklı</div>
                        <div class="chart-bar-fill" style="width: ${totalScenarios > 0 ? (totalEconomy / totalScenarios * 100) : 0}%; background: var(--danger-color);"></div>
                        <div class="chart-value">${totalEconomy} (${totalScenarios > 0 ? ((totalEconomy / totalScenarios * 100).toFixed(1)) : 0}%)</div>
                    </div>
                </div>
            </div>
            
            <div class="insights-section">
                <h3>💡 Öneriler</h3>
                <ul>
                    ${totalSustainable < totalEconomy ? '<li>⚠️ Öğrenciler ekonomi odaklı kararlar veriyor. Sürdürülebilirlik eğitimi artırılabilir.</li>' : ''}
                    ${avgScenarios < 2 ? '<li>📢 Öğrencilerin katılımı düşük. Motivasyon artırıcı etkinlikler düzenlenebilir.</li>' : ''}
                    ${totalClasses === 0 ? '<li>🏫 Henüz sınıf oluşturulmamış. Öğretmenleri teşvik edin.</li>' : ''}
                    ${students.length > 50 ? '<li>🎉 Harika! 50+ öğrenci kullanıyor. Sistem başarılı!</li>' : ''}
                    ${totalScenarios > 100 ? '<li>🏆 100+ senaryo tamamlandı! Mükemmel bir başlangıç!</li>' : ''}
                </ul>
            </div>
            
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Admin - Verileri Dışa Aktar
function exportUsersData() {
    const users = getFromStorage('users') || [];
    
    let csvContent = "Ad Soyad,E-posta,Şifre,Tip,Senaryo Sayısı,Seviye,Kayıt Tarihi\n";
    
    users.forEach(user => {
        csvContent += `"${user.name}","${user.email}","${user.password}","${user.type}",${(user.scenarios || []).length},${user.level || 1},"${new Date(user.id).toLocaleDateString('tr-TR')}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `kararlab_kullanicilar_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Kullanıcı verileri CSV olarak indirildi!', 'success');
}
