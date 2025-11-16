// KararLab - Novaşehir Simülatörü
console.log('app.js yuklendi');

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
    },
    happiness: 50, // Halk mutluluğu (0-100)
    support: 50, // Belediye başkanı desteği (0-100)
    usedScenarios: [] // Kullanılan senaryolar
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
    console.log('showPage cagrildi:', pageId);
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showLanding() {
    console.log('showLanding cagrildi');
    showPage('landing-page');
}

function showLogin() {
    console.log('showLogin cagrildi');
    showPage('login-page');
}

function showRegister() {
    console.log('showRegister cagrildi');
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
    
    const name = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const type = document.getElementById('reg-type').value;
    
    // Validasyon
    if (name.length < 3) {
        showToast('Ad Soyad en az 3 karakter olmalıdır!', 'error');
        return;
    }
    
    if (username.length < 3) {
        showToast('Kullanıcı adı en az 3 karakter olmalıdır!', 'error');
        return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showToast('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Şifre en az 6 karakter olmalıdır!', 'error');
        return;
    }
    
    if (!type) {
        showToast('Lütfen kullanıcı tipi seçin!', 'error');
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
        badges: [],
        createdAt: new Date().toISOString(),
        level: 1,
        xp: 0
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
    
    showToast('Hoş geldiniz, ' + name + '! 🎉', 'success');
    
    setTimeout(() => {
        if (type === 'student') {
            loadStudentPanel();
        } else {
            loadTeacherPanel();
        }
    }, 1000);
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
    
    // XP ve seviye gösterimini güncelle
    if (typeof updateLevelDisplay === 'function') {
        updateLevelDisplay();
    }
    
    // Günlük görevleri başlat
    if (typeof initDailyQuests === 'function') {
        initDailyQuests();
        if (typeof updateQuestsDisplay === 'function') {
            updateQuestsDisplay();
        }
        // Günlük bonusu göster
        if (typeof showDailyBonus === 'function') {
            showDailyBonus();
        }
    }
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

// Dinamik Senaryolar
const scenarioPool = {
    transport: [
        {
            id: 'transport_1',
            title: 'Ulaşım Krizi',
            desc: 'Şehirde trafik felç noktasında. Vatandaşlar işe geç kalıyor, stres artıyor.',
            choices: [
                {
                    id: 'A',
                    title: 'Otopark ve Yol Genişletme',
                    desc: 'Daha fazla köprü, kavşak ve otopark. Kısa vadede trafik rahatlar.',
                    effects: { traffic: 'Orta', air: 'Orta-', happiness: +5, support: +10 }
                },
                {
                    id: 'B',
                    title: 'Toplu Taşıma Devrimi',
                    desc: 'Metro, tramvay, bisiklet yolları. İlk yıllar şantiye var.',
                    effects: { traffic: 'Orta', air: 'Orta+', quality: 'Orta+', happiness: -5, support: -5 }
                },
                {
                    id: 'C',
                    title: 'Karma Geçiş Planı',
                    desc: 'Hem yol iyileştirme hem toplu taşıma. Dengeli yaklaşım.',
                    effects: { traffic: 'Orta-Yüksek', air: 'Orta', happiness: +2, support: +5 }
                }
            ]
        },
        {
            id: 'transport_2',
            title: 'Bisiklet Yolu Tartışması',
            desc: 'Merkez caddelerde bisiklet yolu yapılması öneriliyor. Esnaflar karşı çıkıyor.',
            choices: [
                {
                    id: 'A',
                    title: 'Bisiklet Yollarını Yap',
                    desc: 'Çevre dostu ulaşım desteklenir. Esnaf rahatsız olur.',
                    effects: { traffic: 'Orta', air: 'İyi', happiness: +10, support: -5 }
                },
                {
                    id: 'B',
                    title: 'Sadece Yan Sokaklarda',
                    desc: 'Ana caddelere dokunma, yan sokaklarda bisiklet yolu.',
                    effects: { traffic: 'Yüksek', air: 'Orta', happiness: +3, support: +5 }
                },
                {
                    id: 'C',
                    title: 'Projeyi İptal Et',
                    desc: 'Esnafı dinle, bisiklet yolu yapma.',
                    effects: { traffic: 'Yüksek', air: 'Orta-', happiness: -10, support: +10 }
                }
            ]
        },
        {
            id: 'transport_3',
            title: 'Elektrikli Otobüs Yatırımı',
            desc: 'Şehir otobüsleri eskidi. Elektrikli mi, dizel mi alınmalı?',
            choices: [
                {
                    id: 'A',
                    title: 'Elektrikli Otobüs Filosu',
                    desc: 'Pahalı ama çevre dostu. Uzun vadede tasarruf.',
                    effects: { air: 'İyi', carbon: 'Düşük', happiness: +15, support: +5 }
                },
                {
                    id: 'B',
                    title: 'Dizel Otobüsler',
                    desc: 'Ucuz ve hızlı çözüm. Hava kirliliği devam eder.',
                    effects: { air: 'Orta-', carbon: 'Yüksek', happiness: -5, support: +10 }
                },
                {
                    id: 'C',
                    title: 'Hibrit Çözüm',
                    desc: 'Yarısı elektrikli, yarısı dizel. Dengeli maliyet.',
                    effects: { air: 'Orta', carbon: 'Orta', happiness: +5, support: +8 }
                }
            ]
        },
        {
            id: 'transport_4',
            title: 'Otopark Sorunu',
            desc: 'Merkez mahallede otopark yok. Vatandaşlar park yeri bulamıyor.',
            choices: [
                {
                    id: 'A',
                    title: 'Katlı Otopark Yap',
                    desc: 'Modern katlı otopark. Pahalı ama etkili.',
                    effects: { traffic: 'Orta', happiness: +12, support: +10 }
                },
                {
                    id: 'B',
                    title: 'Toplu Taşımayı Teşvik Et',
                    desc: 'Otopark yerine metro ve otobüs yatırımı.',
                    effects: { traffic: 'Orta', air: 'İyi', happiness: +8, support: +5 }
                },
                {
                    id: 'C',
                    title: 'Ücretli Park Sistemi',
                    desc: 'Sokak parkları ücretli olsun. Gelir sağlar.',
                    effects: { economy: 'Güçlü', happiness: -8, support: -5 }
                }
            ]
        },
        {
            id: 'transport_5',
            title: 'Hız Limiti Tartışması',
            desc: 'Ana caddelerde hız limiti 50\'den 30\'a düşürülsün mü?',
            choices: [
                {
                    id: 'A',
                    title: 'Hız Limitini Düşür',
                    desc: 'Güvenlik artar, trafik kazaları azalır.',
                    effects: { quality: 'İyi', happiness: +10, support: +8 }
                },
                {
                    id: 'B',
                    title: 'Sadece Okul Bölgelerinde',
                    desc: 'Çocukların olduğu yerlerde düşür.',
                    effects: { quality: 'Orta+', happiness: +5, support: +5 }
                },
                {
                    id: 'C',
                    title: 'Değiştirme',
                    desc: 'Mevcut sistem yeterli.',
                    effects: { happiness: -5, support: +3 }
                }
            ]
        }
    ],
    environment: [
        {
            id: 'env_1',
            title: 'Yeşil Alan Krizi',
            desc: 'Artan nüfus için konut gerekli. Ama yeşil alanlar çok az.',
            choices: [
                {
                    id: 'A',
                    title: 'Parkları İmara Aç',
                    desc: 'Konut sıkıntısı çözülür, yeşil alan azalır.',
                    effects: { green: '%5', air: 'Düşük', quality: 'Orta-', happiness: -15, support: +5 }
                },
                {
                    id: 'B',
                    title: 'Dikey Mimari',
                    desc: 'Yüksek binalar, yeşil alanlar korunur.',
                    effects: { green: '%12', air: 'İyi', quality: 'Orta+', happiness: +10, support: +5 }
                },
                {
                    id: 'C',
                    title: 'Kentsel Dönüşüm',
                    desc: 'Eski binalar yenilenir, alan verimli kullanılır.',
                    effects: { green: '%9', quality: 'Orta', happiness: +5, support: +8 }
                }
            ]
        },
        {
            id: 'env_2',
            title: 'Ağaç Kesimi Protestosu',
            desc: 'Yeni yol için 500 ağaç kesilecek. Çevre grupları protesto ediyor.',
            choices: [
                {
                    id: 'A',
                    title: 'Projeyi İptal Et',
                    desc: 'Ağaçları kurtar, yolu yapma. Halk mutlu, trafik devam.',
                    effects: { green: '%10', air: 'İyi', traffic: 'Yüksek', happiness: +20, support: -10 }
                },
                {
                    id: 'B',
                    title: 'Yolu Yap, Ağaç Dik',
                    desc: 'Yolu yap ama başka yere 1000 ağaç dik.',
                    effects: { green: '%8', air: 'Orta', traffic: 'Orta', happiness: +5, support: +10 }
                },
                {
                    id: 'C',
                    title: 'Alternatif Güzergah',
                    desc: 'Daha uzun ama ağaçsız güzergah. Maliyet artar.',
                    effects: { green: '%10', air: 'Orta+', traffic: 'Orta', happiness: +10, support: +5 }
                }
            ]
        },
        {
            id: 'env_3',
            title: 'Çöp Krizi',
            desc: 'Şehir çöpte boğuluyor. Geri dönüşüm oranı %5. Ne yapmalı?',
            choices: [
                {
                    id: 'A',
                    title: 'Geri Dönüşüm Devrimi',
                    desc: 'Kapsamlı geri dönüşüm sistemi. Pahalı ama etkili.',
                    effects: { quality: 'İyi', carbon: 'Düşük', happiness: +15, support: +10 }
                },
                {
                    id: 'B',
                    title: 'Çöp Yakma Tesisi',
                    desc: 'Çöpten enerji üret. Hava kirliliği riski var.',
                    effects: { quality: 'Orta', carbon: 'Orta', air: 'Orta-', happiness: -5, support: +5 }
                },
                {
                    id: 'C',
                    title: 'Sadece Bilinçlendirme',
                    desc: 'Kampanyalar düzenle, büyük yatırım yapma.',
                    effects: { quality: 'Orta-', happiness: +2, support: +8 }
                }
            ]
        },
        {
            id: 'env_4',
            title: 'Nehir Kirliliği',
            desc: 'Şehir nehri kirli ve kokmuş durumda. Temizlik gerekli.',
            choices: [
                {
                    id: 'A',
                    title: 'Kapsamlı Temizlik',
                    desc: 'Nehir tamamen temizlensin, fabrikalar denetlensin.',
                    effects: { quality: 'İyi', air: 'İyi', happiness: +20, support: +15 }
                },
                {
                    id: 'B',
                    title: 'Kısmi Temizlik',
                    desc: 'Sadece merkez bölge temizlensin.',
                    effects: { quality: 'Orta+', happiness: +10, support: +8 }
                },
                {
                    id: 'C',
                    title: 'Erteleme',
                    desc: 'Bütçe yok, sonra hallederiz.',
                    effects: { economy: 'Güçlü', happiness: -15, support: -12 }
                }
            ]
        },
        {
            id: 'env_5',
            title: 'Plastik Poşet Yasağı',
            desc: 'Marketlerde plastik poşet yasaklansın mı?',
            choices: [
                {
                    id: 'A',
                    title: 'Tam Yasak',
                    desc: 'Tüm plastik poşetler yasaklansın.',
                    effects: { carbon: 'Düşük', quality: 'İyi', happiness: +15, support: +10 }
                },
                {
                    id: 'B',
                    title: 'Ücretli Poşet',
                    desc: 'Plastik poşet ücretli olsun.',
                    effects: { carbon: 'Orta', happiness: +8, support: +8 }
                },
                {
                    id: 'C',
                    title: 'Yasak Yok',
                    desc: 'Serbest piyasa, müdahale etme.',
                    effects: { economy: 'Güçlü', happiness: -10, support: +5 }
                }
            ]
        }
    ],
    energy: [
        {
            id: 'energy_1',
            title: 'Enerji Tercihi',
            desc: 'Şehrin enerji ihtiyacı artıyor. Hangi kaynağı seçersin?',
            choices: [
                {
                    id: 'A',
                    title: 'Fosil Yakıt',
                    desc: 'Ucuz ve hızlı. Karbon emisyonu yüksek.',
                    effects: { carbon: 'Çok Yüksek', air: 'Düşük', economy: 'Güçlü', happiness: -10, support: +15 }
                },
                {
                    id: 'B',
                    title: 'Yenilenebilir Enerji',
                    desc: 'Güneş ve rüzgar. Pahalı ama temiz.',
                    effects: { carbon: 'Düşük', air: 'İyi', economy: 'Orta', happiness: +20, support: +5 }
                },
                {
                    id: 'C',
                    title: 'Karma Enerji',
                    desc: 'Yarı fosil, yarı yenilenebilir. Dengeli.',
                    effects: { carbon: 'Orta', air: 'Orta+', economy: 'Büyüyen', happiness: +8, support: +10 }
                }
            ]
        },
        {
            id: 'energy_2',
            title: 'Nükleer Enerji Tartışması',
            desc: 'Komşu şehir nükleer santral kuruyor. Sizin şehriniz de katılsın mı?',
            choices: [
                {
                    id: 'A',
                    title: 'Nükleer Santrala Evet',
                    desc: 'Temiz ve güçlü enerji. Risk var ama verimli.',
                    effects: { carbon: 'Çok Düşük', economy: 'Güçlü', happiness: -15, support: -10 }
                },
                {
                    id: 'B',
                    title: 'Kesinlikle Hayır',
                    desc: 'Güvenlik riski çok yüksek. Alternatif ara.',
                    effects: { happiness: +10, support: +15 }
                },
                {
                    id: 'C',
                    title: 'Referanduma Sun',
                    desc: 'Halkın kararına bırak. Demokratik ama yavaş.',
                    effects: { happiness: +15, support: +20 }
                }
            ]
        },
        {
            id: 'energy_3',
            title: 'Güneş Paneli Teşviki',
            desc: 'Evlere güneş paneli kurulması için teşvik verilsin mi?',
            choices: [
                {
                    id: 'A',
                    title: 'Yüksek Teşvik Ver',
                    desc: 'Maliyetin %70\'ini karşıla. Hızlı yaygınlaşır.',
                    effects: { carbon: 'Düşük', air: 'İyi', economy: 'Orta', happiness: +20, support: +10 }
                },
                {
                    id: 'B',
                    title: 'Düşük Teşvik',
                    desc: 'Sadece %30 destek. Yavaş ama dengeli.',
                    effects: { carbon: 'Orta', happiness: +8, support: +8 }
                },
                {
                    id: 'C',
                    title: 'Teşvik Yok',
                    desc: 'Bütçeyi koru, vatandaş kendi yapsın.',
                    effects: { economy: 'Güçlü', happiness: -10, support: +5 }
                }
            ]
        },
        {
            id: 'energy_4',
            title: 'Rüzgar Türbinleri',
            desc: 'Şehir dışına rüzgar türbinleri kurulsun mu?',
            choices: [
                {
                    id: 'A',
                    title: 'Büyük Rüzgar Çiftliği',
                    desc: '50 türbin. Temiz enerji ama pahalı.',
                    effects: { carbon: 'Çok Düşük', air: 'İyi', happiness: +18, support: +12 }
                },
                {
                    id: 'B',
                    title: 'Küçük Tesis',
                    desc: '10 türbin. Dengeli yatırım.',
                    effects: { carbon: 'Düşük', happiness: +10, support: +8 }
                },
                {
                    id: 'C',
                    title: 'Kurma',
                    desc: 'Görüntü kirliliği yaratır, istemiyoruz.',
                    effects: { happiness: -12, support: -8 }
                }
            ]
        },
        {
            id: 'energy_5',
            title: 'Enerji Tasarrufu Kampanyası',
            desc: 'Vatandaşları enerji tasarrufuna teşvik edelim mi?',
            choices: [
                {
                    id: 'A',
                    title: 'Büyük Kampanya',
                    desc: 'TV, billboard, sosyal medya. Kapsamlı.',
                    effects: { carbon: 'Düşük', happiness: +15, support: +12 }
                },
                {
                    id: 'B',
                    title: 'Basit Bilgilendirme',
                    desc: 'Broşür ve internet. Ekonomik.',
                    effects: { carbon: 'Orta', happiness: +8, support: +5 }
                },
                {
                    id: 'C',
                    title: 'Kampanya Yok',
                    desc: 'Herkes kendi bilir.',
                    effects: { economy: 'Güçlü', happiness: -5, support: +3 }
                }
            ]
        }
    ],
    social: [
        {
            id: 'social_1',
            title: 'Gençlik Merkezi',
            desc: 'Gençler için spor ve kültür merkezi yapılsın mı?',
            choices: [
                {
                    id: 'A',
                    title: 'Büyük Merkez Yap',
                    desc: 'Modern tesis, her şey dahil. Pahalı ama etkili.',
                    effects: { quality: 'İyi', happiness: +25, support: +15 }
                },
                {
                    id: 'B',
                    title: 'Küçük Merkez',
                    desc: 'Temel ihtiyaçları karşılar. Ekonomik.',
                    effects: { quality: 'Orta+', happiness: +10, support: +8 }
                },
                {
                    id: 'C',
                    title: 'Yapma',
                    desc: 'Bütçeyi başka yere harca.',
                    effects: { economy: 'Güçlü', happiness: -15, support: -10 }
                }
            ]
        },
        {
            id: 'social_2',
            title: 'Ücretsiz Toplu Taşıma',
            desc: 'Öğrenciler ve yaşlılar için ücretsiz toplu taşıma?',
            choices: [
                {
                    id: 'A',
                    title: 'Herkese Ücretsiz',
                    desc: 'Tüm vatandaşlara ücretsiz. Çok pahalı.',
                    effects: { traffic: 'Düşük', happiness: +30, support: +20, economy: 'Orta' }
                },
                {
                    id: 'B',
                    title: 'Sadece Öğrenci ve Yaşlı',
                    desc: 'Hedef kitleye özel. Dengeli maliyet.',
                    effects: { happiness: +15, support: +12 }
                },
                {
                    id: 'C',
                    title: 'İndirimli Fiyat',
                    desc: '%50 indirim. Hem gelir hem destek.',
                    effects: { happiness: +8, support: +8, economy: 'Büyüyen' }
                }
            ]
        },
        {
            id: 'social_3',
            title: 'Hayvan Barınağı',
            desc: 'Sokak hayvanları için modern barınak kurulsun mu?',
            choices: [
                {
                    id: 'A',
                    title: 'Modern Barınak',
                    desc: 'Veteriner, bakım, sahiplendirme merkezi.',
                    effects: { quality: 'İyi', happiness: +20, support: +15 }
                },
                {
                    id: 'B',
                    title: 'Temel Barınak',
                    desc: 'Sadece barınma ve aşı. Ekonomik.',
                    effects: { happiness: +10, support: +8 }
                },
                {
                    id: 'C',
                    title: 'Öncelik Değil',
                    desc: 'Bütçeyi insanlara harca.',
                    effects: { economy: 'Güçlü', happiness: -12, support: -8 }
                }
            ]
        }
    ]
};

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
        },
        happiness: 50,
        support: 50,
        usedScenarios: [],
        happinessHistory: [50],
        supportHistory: [50]
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
        
        <div style="background: rgba(251, 191, 36, 0.2); padding: 1.5rem; border-radius: 12px; margin: 2rem 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: var(--text-primary);">💡 İpuçları</h3>
            <ul style="margin: 0; padding-left: 1.5rem;">
                <li><strong>Halk Mutluluğu:</strong> Kararlarınız halkı etkiler. Mutlu halk = Başarılı yönetim</li>
                <li><strong>Başkan Desteği:</strong> %70+ destek ile seçimi kazanırsınız</li>
                <li><strong>Dengeli Yaklaşım:</strong> Hem çevreyi hem ekonomiyi düşünün</li>
                <li><strong>Rastgele Olaylar:</strong> Beklenmedik olaylara hazır olun</li>
            </ul>
        </div>
        
        <button class="btn-primary btn-large" onclick="loadTurn1()">Devam Et - Tur 1'e Geç</button>
    `;
    
    setTimeout(() => {
        panel.style.transition = 'opacity 0.5s ease';
        panel.style.opacity = '1';
    }, 100);
}

// Rastgele senaryo seç
function getRandomScenario(category) {
    // Bazen farklı kategoriden de senaryo seçebilir
    let selectedCategory = category;
    if (Math.random() < 0.2 && scenarioPool.social) { // %20 şans sosyal konu
        selectedCategory = 'social';
    }
    
    const available = scenarioPool[selectedCategory].filter(s => !gameState.usedScenarios.includes(s.id));
    if (available.length === 0) {
        gameState.usedScenarios = [];
        return scenarioPool[selectedCategory][Math.floor(Math.random() * scenarioPool[selectedCategory].length)];
    }
    const scenario = available[Math.floor(Math.random() * available.length)];
    gameState.usedScenarios.push(scenario.id);
    return scenario;
}

// Tur 1 - Ulaşım
function loadTurn1() {
    gameState.turn = 1;
    const scenario = getRandomScenario('transport');
    document.getElementById('current-turn').textContent = 'Tur 1 - ' + scenario.title;
    
    const panel = document.getElementById('game-panel');
    panel.style.opacity = '0';
    
    // Yükleme animasyonu
    panel.innerHTML = '<div style="text-align: center; padding: 4rem;"><div class="loading-spinner"></div><p style="margin-top: 1rem; color: var(--text-secondary);">Senaryo yükleniyor...</p></div>';
    
    setTimeout(() => {
        panel.innerHTML = `
        <h2>Tur 1 - ${scenario.title}</h2>
        <p style="font-size: 1.1rem; margin: 1.5rem 0;">
            ${scenario.desc}
        </p>
        
        <div class="choice-container">
            ${scenario.choices.map(choice => `
                <div class="choice-card" onclick="selectChoice(1, '${choice.id}', ${JSON.stringify(choice.effects).replace(/"/g, '&quot;')})">
                    <h4>${choice.id} - ${choice.title}</h4>
                    <p>${choice.desc}</p>
                    <div class="impact-preview">
                        <strong>Tahmini Etki:</strong><br>
                        ${choice.effects.traffic ? `Trafik: ${choice.effects.traffic}<br>` : ''}
                        ${choice.effects.air ? `Hava: ${choice.effects.air}<br>` : ''}
                        ${choice.effects.quality ? `Yaşam: ${choice.effects.quality}<br>` : ''}
                        ${choice.effects.happiness ? `Mutluluk: ${choice.effects.happiness > 0 ? '+' : ''}${choice.effects.happiness}%<br>` : ''}
                        ${choice.effects.support ? `Destek: ${choice.effects.support > 0 ? '+' : ''}${choice.effects.support}%` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
        
        panel.style.transition = 'opacity 0.5s ease';
        panel.style.opacity = '1';
    }, 300);
}

// Seçim yapma
let selectedChoice = null;
let selectedEffects = null;

function selectChoice(turn, choice, effects) {
    selectedChoice = choice;
    selectedEffects = effects;
    
    // Ses çal
    playSound('click');
    
    document.querySelectorAll('.choice-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.choice-card').classList.add('selected');
    
    // Seçim animasyonu
    event.target.closest('.choice-card').style.transform = 'scale(0.98)';
    setTimeout(() => {
        event.target.closest('.choice-card').style.transform = 'scale(1)';
    }, 100);
    
    setTimeout(() => {
        confirmChoice(turn, choice, effects);
    }, 500);
}

function confirmChoice(turn, choice, effects) {
    // Önceki mutluluğu kaydet
    gameState.prevHappiness = gameState.happiness;
    gameState.prevSupport = gameState.support;
    
    gameState.decisions.push({ turn, choice, effects });
    
    // Etkileri uygula
    if (effects) {
        if (effects.traffic) gameState.indicators.traffic = effects.traffic;
        if (effects.air) gameState.indicators.air = effects.air;
        if (effects.green) gameState.indicators.green = effects.green;
        if (effects.carbon) gameState.indicators.carbon = effects.carbon;
        if (effects.quality) gameState.indicators.quality = effects.quality;
        if (effects.economy) gameState.indicators.economy = effects.economy;
        
        // Mutluluk ve destek güncelle
        if (effects.happiness) {
            gameState.happiness = Math.max(0, Math.min(100, gameState.happiness + effects.happiness));
        }
        if (effects.support) {
            gameState.support = Math.max(0, Math.min(100, gameState.support + effects.support));
        }
    }
    
    // Geçmişe ekle
    if (!gameState.happinessHistory) gameState.happinessHistory = [50];
    if (!gameState.supportHistory) gameState.supportHistory = [50];
    
    gameState.happinessHistory.push(gameState.happiness);
    gameState.supportHistory.push(gameState.support);
    
    // Grafik butonlarını göster
    const chartButtons = document.getElementById('chart-buttons');
    if (chartButtons && gameState.turn > 0) {
        chartButtons.style.display = 'block';
    }
    
    updateIndicators();
    
    // XP kazan
    if (typeof addXP === 'function') {
        addXP(30);
    }
    
    // Başarımları kontrol et
    checkGameAchievements();
    
    // Ses çal
    playSound('click');
    
    if (turn === 1) {
        showTurnSummary(1, choice, () => {
            if (typeof triggerRandomEvent === 'function') {
                triggerRandomEvent();
            }
            loadTurn2();
        });
    } else if (turn === 2) {
        showTurnSummary(2, choice, () => {
            if (typeof triggerRandomEvent === 'function') {
                triggerRandomEvent();
            }
            loadTurn3();
        });
    } else if (turn === 3) {
        showFinalReport();
    }
}

// Oyun içi başarımları kontrol et
function checkGameAchievements() {
    // Yüksek mutluluk
    if (gameState.happiness >= 80 && !gameState.achievementShown_happiness80) {
        showAchievementNotification('Mutlu Şehir!', 'Halk mutluluğu %80\'e ulaştı!', '😊');
        gameState.achievementShown_happiness80 = true;
    }
    
    // Yüksek destek
    if (gameState.support >= 80 && !gameState.achievementShown_support80) {
        showAchievementNotification('Güçlü Lider!', 'Halk desteği %80\'e ulaştı!', '👔');
        gameState.achievementShown_support80 = true;
    }
    
    // Düşük mutluluk uyarısı
    if (gameState.happiness <= 30 && !gameState.achievementShown_happinessLow) {
        showAchievementNotification('Dikkat!', 'Halk mutluluğu çok düşük!', '⚠️');
        gameState.achievementShown_happinessLow = true;
    }
    
    // Tüm B seçenekleri
    if (gameState.decisions.length === 3) {
        const allB = gameState.decisions.every(d => d.choice === 'B');
        if (allB && !gameState.achievementShown_allB) {
            showAchievementNotification('Çevre Kahramanı!', 'Tüm sürdürülebilir seçenekleri seçtiniz!', '🌱');
            gameState.achievementShown_allB = true;
        }
        
        // Tüm A seçenekleri
        const allA = gameState.decisions.every(d => d.choice === 'A');
        if (allA && !gameState.achievementShown_allA) {
            showAchievementNotification('Ekonomi Uzmanı!', 'Tüm ekonomik seçenekleri seçtiniz!', '💰');
            gameState.achievementShown_allA = true;
        }
        
        // Tüm C seçenekleri
        const allC = gameState.decisions.every(d => d.choice === 'C');
        if (allC && !gameState.achievementShown_allC) {
            showAchievementNotification('Dengeci!', 'Tüm dengeli seçenekleri seçtiniz!', '⚖️');
            gameState.achievementShown_allC = true;
        }
        
        // Karma seçenekler
        const hasA = gameState.decisions.some(d => d.choice === 'A');
        const hasB = gameState.decisions.some(d => d.choice === 'B');
        const hasC = gameState.decisions.some(d => d.choice === 'C');
        if (hasA && hasB && hasC && !gameState.achievementShown_mixed) {
            showAchievementNotification('Stratejist!', 'Her seçenek türünden kullandınız!', '🎯');
            gameState.achievementShown_mixed = true;
        }
    }
    
    // Mutluluk artışı
    if (gameState.prevHappiness && gameState.happiness > gameState.prevHappiness + 15 && !gameState.achievementShown_happinessBoost) {
        showAchievementNotification('Popüler Karar!', 'Mutluluk +15 arttı!', '📈');
        gameState.achievementShown_happinessBoost = true;
    }
    
    // Destek artışı
    if (gameState.prevSupport && gameState.support > gameState.prevSupport + 15 && !gameState.achievementShown_supportBoost) {
        showAchievementNotification('Güven Tazelendi!', 'Destek +15 arttı!', '📈');
        gameState.achievementShown_supportBoost = true;
    }
    
    // Otomatik kaydet
    autoSaveGame();
}

// Otomatik kayıt
function autoSaveGame() {
    if (!currentUser || currentUser.type === 'demo') return;
    
    try {
        const saveData = {
            gameState: gameState,
            timestamp: Date.now(),
            userId: currentUser.id
        };
        
        localStorage.setItem('autoSave_' + currentUser.id, JSON.stringify(saveData));
    } catch (e) {
        console.warn('Otomatik kayıt başarısız:', e);
    }
}

// Otomatik kaydı yükle
function loadAutoSave() {
    if (!currentUser || currentUser.type === 'demo') return null;
    
    try {
        const saveData = localStorage.getItem('autoSave_' + currentUser.id);
        if (saveData) {
            return JSON.parse(saveData);
        }
    } catch (e) {
        console.warn('Otomatik kayıt yüklenemedi:', e);
    }
    
    return null;
}

// Otomatik kaydı temizle
function clearAutoSave() {
    if (!currentUser || currentUser.type === 'demo') return;
    
    try {
        localStorage.removeItem('autoSave_' + currentUser.id);
    } catch (e) {
        console.warn('Otomatik kayıt temizlenemedi:', e);
    }
}

// Eski fonksiyonlar kaldırıldı - Artık dinamik sistem kullanılıyor

function updateIndicators() {
    document.getElementById('ind-air').textContent = gameState.indicators.air;
    document.getElementById('ind-traffic').textContent = gameState.indicators.traffic;
    document.getElementById('ind-green').textContent = gameState.indicators.green;
    document.getElementById('ind-carbon').textContent = gameState.indicators.carbon;
    document.getElementById('ind-quality').textContent = gameState.indicators.quality;
    document.getElementById('ind-economy').textContent = gameState.indicators.economy;
    
    // Yeni göstergeler
    if (document.getElementById('ind-happiness')) {
        const prevHappiness = gameState.prevHappiness || 50;
        const currentHappiness = gameState.happiness;
        const change = currentHappiness - prevHappiness;
        
        document.getElementById('ind-happiness').textContent = '%' + Math.round(currentHappiness);
        const happinessBar = document.getElementById('happiness-bar');
        if (happinessBar) {
            happinessBar.style.width = currentHappiness + '%';
            happinessBar.style.background = currentHappiness > 70 ? '#10b981' : 
                                           currentHappiness > 40 ? '#f59e0b' : '#ef4444';
        }
        
        // Trend göster
        const trendEl = document.getElementById('happiness-trend');
        if (trendEl && gameState.turn > 0) {
            if (change > 0) {
                trendEl.textContent = `↗️ +${Math.round(change)}% (Artış)`;
                trendEl.style.color = '#10b981';
            } else if (change < 0) {
                trendEl.textContent = `↘️ ${Math.round(change)}% (Düşüş)`;
                trendEl.style.color = '#ef4444';
            } else {
                trendEl.textContent = '→ Değişim yok';
                trendEl.style.color = '#6b7280';
            }
        }
    }
    
    if (document.getElementById('ind-support')) {
        document.getElementById('ind-support').textContent = '%' + Math.round(gameState.support);
        const supportBar = document.getElementById('support-bar');
        if (supportBar) {
            supportBar.style.width = gameState.support + '%';
            supportBar.style.background = gameState.support > 70 ? '#10b981' : 
                                         gameState.support > 40 ? '#f59e0b' : '#ef4444';
        }
    }
    
    // Karar geçmişini güncelle
    updateDecisionHistory();
}

// Karar geçmişini göster
function updateDecisionHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (gameState.decisions.length === 0) {
        historyList.innerHTML = '<p style="color: #9ca3af; font-style: italic;">Henüz karar yok</p>';
        return;
    }
    
    const turNames = ['Ulaşım', 'Çevre', 'Enerji'];
    historyList.innerHTML = gameState.decisions.map((decision, index) => {
        const effects = decision.effects || {};
        const happinessChange = effects.happiness || 0;
        const icon = happinessChange > 0 ? '😊' : happinessChange < 0 ? '😔' : '😐';
        
        return `
            <div style="padding: 0.5rem; background: #f9fafb; border-radius: 6px; margin-bottom: 0.5rem;">
                <div style="font-weight: 600; color: var(--primary-color);">
                    ${icon} Tur ${index + 1}: ${turNames[index] || 'Karar'}
                </div>
                <div style="font-size: 0.75rem; color: #6b7280;">
                    Seçim: ${decision.choice} | 
                    ${happinessChange > 0 ? '+' : ''}${happinessChange}% mutluluk
                </div>
            </div>
        `;
    }).join('');
}

function showTurnSummary(turn, choice, nextCallback) {
    const decision = gameState.decisions[turn - 1];
    const effects = decision.effects || {};
    
    // Rastgele halk tepkileri
    const positiveReactions = [
        '"Sonunda doğru bir karar! Teşekkürler başkanım." - Ahmet, 45',
        '"Çocuklarımın geleceği için güzel bir adım." - Ayşe, 38',
        '"Bu kararı destekliyorum, devam edin!" - Mehmet, 52',
        '"Şehrimiz için iyi olacak, umutluyum." - Zeynep, 29'
    ];
    
    const negativeReactions = [
        '"Bu karar bizi düşünmüyor, hayal kırıklığı." - Fatma, 41',
        '"Vaatleriniz nerede? Beklentilerimiz karşılanmadı." - Can, 35',
        '"Daha iyi yapabilirdiniz, üzgünüm." - Elif, 33',
        '"Bu şehir için yanlış karar oldu." - Hasan, 48'
    ];
    
    const neutralReactions = [
        '"Göreceğiz, zaman gösterecek." - Ali, 39',
        '"Henüz bir şey söylemek erken." - Selin, 31',
        '"Umarım işe yarar." - Burak, 44',
        '"Dengeli bir yaklaşım gibi görünüyor." - Deniz, 36'
    ];
    
    let reaction;
    const happinessChange = effects.happiness || 0;
    
    if (happinessChange > 5) {
        reaction = positiveReactions[Math.floor(Math.random() * positiveReactions.length)];
    } else if (happinessChange < -5) {
        reaction = negativeReactions[Math.floor(Math.random() * negativeReactions.length)];
    } else {
        reaction = neutralReactions[Math.floor(Math.random() * neutralReactions.length)];
    }
    
    const panel = document.getElementById('game-panel');
    panel.innerHTML = `
        <div style="text-align: center;">
            <h2>Tur ${turn} Özeti</h2>
            
            <!-- Değişimler -->
            <div style="background: #dbeafe; padding: 2rem; border-radius: 12px; margin: 2rem 0; text-align: left;">
                <h3>Kararınızın Etkileri:</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                    ${effects.happiness ? `
                        <div style="padding: 0.75rem; background: ${effects.happiness > 0 ? '#d1fae5' : '#fee2e2'}; border-radius: 8px;">
                            <strong>Mutluluk:</strong> ${effects.happiness > 0 ? '+' : ''}${effects.happiness}%
                        </div>
                    ` : ''}
                    ${effects.support ? `
                        <div style="padding: 0.75rem; background: ${effects.support > 0 ? '#dbeafe' : '#fee2e2'}; border-radius: 8px;">
                            <strong>Destek:</strong> ${effects.support > 0 ? '+' : ''}${effects.support}%
                        </div>
                    ` : ''}
                </div>
                
                <h3 style="margin-top: 1.5rem;">Halktan Bir Ses:</h3>
                <p style="font-style: italic; background: #f9fafb; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                    ${reaction}
                </p>
                
                <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(251, 191, 36, 0.2); border-radius: 8px; border: 2px solid rgba(251, 191, 36, 0.3);">
                    <strong style="color: var(--text-primary);">📊 Güncel Durum:</strong><br>
                    Halk Mutluluğu: %${Math.round(gameState.happiness)} | 
                    Başkan Desteği: %${Math.round(gameState.support)}
                </div>
            </div>
            
            <button class="btn-primary btn-large" onclick="nextTurn()">
                ${turn < 3 ? `Tur ${turn + 1}'e Geç` : 'Final Raporunu Gör'}
            </button>
        </div>
    `;
    
    window.nextTurn = nextCallback;
}

// Tur 2 - Çevre
function loadTurn2() {
    gameState.turn = 2;
    const scenario = getRandomScenario('environment');
    document.getElementById('current-turn').textContent = 'Tur 2 - ' + scenario.title;
    
    const panel = document.getElementById('game-panel');
    panel.style.opacity = '0';
    
    // Yükleme animasyonu
    panel.innerHTML = '<div style="text-align: center; padding: 4rem;"><div class="loading-spinner"></div><p style="margin-top: 1rem; color: var(--text-secondary);">Senaryo yükleniyor...</p></div>';
    panel.style.opacity = '1';
    
    setTimeout(() => {
        panel.innerHTML = `
        <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <strong>Mevcut Durum:</strong> Mutluluk: %${Math.round(gameState.happiness)} | Destek: %${Math.round(gameState.support)}
        </div>
        
        <h2>Tur 2 - ${scenario.title}</h2>
        <p style="font-size: 1.1rem; margin: 1.5rem 0;">
            ${scenario.desc}
        </p>
        
        <div class="choice-container">
            ${scenario.choices.map(choice => `
                <div class="choice-card" onclick="selectChoice(2, '${choice.id}', ${JSON.stringify(choice.effects).replace(/"/g, '&quot;')})">
                    <h4>${choice.id} - ${choice.title}</h4>
                    <p>${choice.desc}</p>
                    <div class="impact-preview">
                        <strong>Tahmini Etki:</strong><br>
                        ${choice.effects.green ? `Yeşil Alan: ${choice.effects.green}<br>` : ''}
                        ${choice.effects.air ? `Hava: ${choice.effects.air}<br>` : ''}
                        ${choice.effects.quality ? `Yaşam: ${choice.effects.quality}<br>` : ''}
                        ${choice.effects.carbon ? `Karbon: ${choice.effects.carbon}<br>` : ''}
                        ${choice.effects.happiness ? `Mutluluk: ${choice.effects.happiness > 0 ? '+' : ''}${choice.effects.happiness}%<br>` : ''}
                        ${choice.effects.support ? `Destek: ${choice.effects.support > 0 ? '+' : ''}${choice.effects.support}%` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
        
        panel.style.transition = 'opacity 0.5s ease';
        panel.style.opacity = '1';
    }, 300);
}

// Tur 3 - Enerji
function loadTurn3() {
    gameState.turn = 3;
    const scenario = getRandomScenario('energy');
    document.getElementById('current-turn').textContent = 'Tur 3 - ' + scenario.title;
    
    const panel = document.getElementById('game-panel');
    panel.style.opacity = '0';
    
    // Yükleme animasyonu
    panel.innerHTML = '<div style="text-align: center; padding: 4rem;"><div class="loading-spinner"></div><p style="margin-top: 1rem; color: var(--text-secondary);">Senaryo yükleniyor...</p></div>';
    panel.style.opacity = '1';
    
    setTimeout(() => {
        panel.innerHTML = `
        <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <strong>Mevcut Durum:</strong> Mutluluk: %${Math.round(gameState.happiness)} | Destek: %${Math.round(gameState.support)}
        </div>
        
        <h2>Tur 3 - ${scenario.title}</h2>
        <p style="font-size: 1.1rem; margin: 1.5rem 0;">
            ${scenario.desc}
        </p>
        
        <div class="choice-container">
            ${scenario.choices.map(choice => `
                <div class="choice-card" onclick="selectChoice(3, '${choice.id}', ${JSON.stringify(choice.effects).replace(/"/g, '&quot;')})">
                    <h4>${choice.id} - ${choice.title}</h4>
                    <p>${choice.desc}</p>
                    <div class="impact-preview">
                        <strong>Tahmini Etki:</strong><br>
                        ${choice.effects.carbon ? `Karbon: ${choice.effects.carbon}<br>` : ''}
                        ${choice.effects.air ? `Hava: ${choice.effects.air}<br>` : ''}
                        ${choice.effects.economy ? `Ekonomi: ${choice.effects.economy}<br>` : ''}
                        ${choice.effects.happiness ? `Mutluluk: ${choice.effects.happiness > 0 ? '+' : ''}${choice.effects.happiness}%<br>` : ''}
                        ${choice.effects.support ? `Destek: ${choice.effects.support > 0 ? '+' : ''}${choice.effects.support}%` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
        
        panel.style.transition = 'opacity 0.5s ease';
        panel.style.opacity = '1';
    }, 300);
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
    const happiness = gameState.happiness;
    const support = gameState.support;
    
    let finalType, icon, reportText, suggestions;
    let politicalStatus = '';
    
    // Destek oranına göre politik durum
    if (support >= 70) {
        politicalStatus = '🎉 Halk sizi destekliyor! Bir sonraki seçimi kazanma şansınız yüksek.';
    } else if (support >= 50) {
        politicalStatus = '⚖️ Destek oranınız dengede. Bir sonraki seçim çekişmeli geçecek.';
    } else if (support >= 30) {
        politicalStatus = '⚠️ Destek oranınız düşük. Halkın güvenini yeniden kazanmalısınız.';
    } else {
        politicalStatus = '❌ Halk sizden memnun değil. Seçimi kaybetme riskiniz çok yüksek!';
    }
    
    // Mutluluk ve sürdürülebilirlik dengesi
    if (happiness >= 70 && (gameState.indicators.air === 'İyi' || gameState.indicators.carbon === 'Düşük')) {
        finalType = 'Sürdürülebilir ve Mutlu Şehir';
        icon = '🌱';
        reportText = `
            Tebrikler! Hem çevreyi korudunuz hem de halkı mutlu ettiniz. Şehriniz sürdürülebilir 
            bir geleceğe doğru ilerliyor ve vatandaşlar kararlarınızdan memnun. Bu dengeli yaklaşım 
            uzun vadede şehrinizi örnek bir model haline getirecek.
        `;
        suggestions = `
            <li>🎉 Mükemmel! Hem çevre hem de halk mutluluğunu dengeleyebildiniz.</li>
            <li>💚 Hava kalitesi ve karbon emisyonu hedeflerinize ulaştınız.</li>
            <li>👏 Halk desteğiniz: %${Math.round(support)} - Başarılı bir yönetim!</li>
        `;
    } else if (happiness >= 60) {
        finalType = 'Halk Dostu Şehir';
        icon = '😊';
        reportText = `
            Halkın mutluluğunu ön planda tuttunuz. Vatandaşlar kararlarınızdan genel olarak memnun. 
            Ancak bazı çevresel hedeflerde daha iddialı olabilirdiniz. Kısa vadede başarılı bir 
            yönetim sergiledini ama uzun vadeli sürdürülebilirlik için daha fazla çaba gerekli.
        `;
        suggestions = `
            <li>👍 Halk mutluluğu yüksek (%${Math.round(happiness)}) - İyi iş çıkardınız!</li>
            <li>🌍 Çevresel göstergelerde daha cesur adımlar atabilirdiniz.</li>
            <li>⚖️ Destek oranınız: %${Math.round(support)}</li>
        `;
    } else if (happiness < 40) {
        finalType = 'Zorlu Yönetim';
        icon = '😔';
        reportText = `
            Aldığınız kararlar halkı mutlu edemedi. Vatandaşlar yaşam kalitesinden şikayetçi. 
            Belki çok radikal değişiklikler yaptınız ya da halkın beklentilerini göz ardı ettiniz. 
            Bir belediye başkanı olarak halkın sesini dinlemek çok önemli.
        `;
        suggestions = `
            <li>⚠️ Halk mutluluğu düşük (%${Math.round(happiness)}) - Vatandaşları dinleyin.</li>
            <li>📢 Kararlarınızı halka daha iyi anlatmalısınız.</li>
            <li>🔄 Destek oranınız: %${Math.round(support)} - İyileştirme gerekli.</li>
        `;
    } else {
        finalType = 'Dengeci Yönetim';
        icon = '⚖️';
        reportText = `
            Orta yolu buldunuz. Ne çok radikal ne de çok pasif kararlar aldınız. Halk genel olarak 
            kararlarınızı kabul ediyor ama kimse tam olarak heyecanlanmıyor. Güvenli bir yönetim 
            sergiledini ama bazen cesur adımlar atmak gerekebilir.
        `;
        suggestions = `
            <li>⚖️ Dengeli bir yaklaşım sergiledini.</li>
            <li>📊 Halk mutluluğu: %${Math.round(happiness)} - Orta seviye.</li>
            <li>🎯 Destek oranınız: %${Math.round(support)}</li>
        `;
    }
    
    document.getElementById('current-turn').textContent = 'Final Raporu';
    
    // Başarım göster
    if (happiness >= 70 && support >= 70) {
        showAchievementNotification('Mükemmel Yönetim!', 'Hem halk mutlu hem de destek yüksek!', '🏆');
        // Konfeti
        if (typeof createConfetti === 'function') {
            setTimeout(() => createConfetti(), 2000);
        }
    }
    
    // Ses çal
    playSound('success');
    
    const panel = document.getElementById('game-panel');
    panel.style.opacity = '0';
    
    // Yükleme
    panel.innerHTML = '<div style="text-align: center; padding: 4rem;"><div class="loading-spinner"></div><p style="margin-top: 1rem; color: var(--text-secondary);">Rapor hazırlanıyor...</p></div>';
    panel.style.opacity = '1';
    
    setTimeout(() => {
        panel.style.opacity = '0';
        setTimeout(() => {
            panel.innerHTML = `
        <div class="final-report">
            <div class="final-icon">${icon}</div>
            <h2>${finalType}</h2>
            
            <!-- Politik Durum -->
            <div style="background: ${support >= 50 ? '#d1fae5' : '#fee2e2'}; padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0;">
                <h3 style="margin: 0 0 0.5rem 0;">Politik Durum</h3>
                <p style="margin: 0; font-size: 1.1rem;">${politicalStatus}</p>
            </div>
            
            <!-- Halk Göstergeleri -->
            <div class="indicators-table">
                <h3>Halk Göstergeleri</h3>
                <div class="indicator" style="background: ${happiness >= 70 ? '#d1fae5' : happiness >= 40 ? '#fef3c7' : '#fee2e2'};">
                    <span>😊 Halk Mutluluğu</span>
                    <span class="indicator-value">%${Math.round(happiness)}</span>
                </div>
                <div class="indicator" style="background: ${support >= 70 ? '#d1fae5' : support >= 40 ? '#fef3c7' : '#fee2e2'};">
                    <span>👔 Başkan Desteği</span>
                    <span class="indicator-value">%${Math.round(support)}</span>
                </div>
            </div>
            
            <!-- Çevresel Göstergeler -->
            <div class="indicators-table">
                <h3>Çevresel Göstergeler</h3>
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
                
                <h3 style="margin-top: 1.5rem;">Halkın Yorumları</h3>
                <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; font-style: italic;">
                    ${getPublicComments(happiness, support)}
                </div>
            </div>
            
            <div class="report-actions">
                <button class="btn-primary" onclick="saveScenario('${finalType}')">💾 Raporu Kaydet</button>
                <button class="btn-secondary" onclick="showFinalStats()">📊 Detaylı İstatistik</button>
                <button class="btn-secondary" onclick="startScenario('basic')">🔄 Tekrar Oyna</button>
                <button class="btn-secondary" onclick="backToPanel()">🏠 Panele Dön</button>
            </div>
        </div>
    `;
            
            panel.style.transition = 'opacity 0.5s ease';
            panel.style.opacity = '1';
        }, 500);
    }, 1500);
}

// Halkın yorumlarını oluştur
function getPublicComments(happiness, support) {
    const comments = [];
    
    if (happiness >= 70) {
        comments.push('"Şehrimiz çok güzel oldu, çocuklarım parklarda oynuyor!" - Ayşe, 35');
        comments.push('"Hava temiz, trafik azaldı. Başkanımıza teşekkürler!" - Mehmet, 42');
    } else if (happiness >= 50) {
        comments.push('"Bazı şeyler iyi ama daha fazlası yapılabilirdi." - Zeynep, 28');
        comments.push('"Henüz tam memnun değilim ama umutluyum." - Ali, 51');
    } else {
        comments.push('"Vaatler tutulmadı, hayal kırıklığına uğradım." - Fatma, 38');
        comments.push('"Şehir daha kötüye gidiyor gibi..." - Can, 29');
    }
    
    if (support >= 70) {
        comments.push('"Bir sonraki seçimde yine bu başkana oy vereceğim!" - Hasan, 45');
    } else if (support < 40) {
        comments.push('"Artık değişiklik zamanı, yeni bir başkan lazım." - Elif, 33');
    }
    
    return comments.map(c => `<p style="margin: 0.5rem 0;">${c}</p>`).join('');
}

// Final istatistikleri göster
function showFinalStats() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const decisions = gameState.decisions.map((d, i) => {
        const turNames = ['Ulaşım', 'Çevre', 'Enerji'];
        return `
            <div style="padding: 1rem; background: #f9fafb; border-radius: 8px; margin-bottom: 0.5rem;">
                <strong>Tur ${i + 1} (${turNames[i]}):</strong> Seçim ${d.choice}
                ${d.effects && d.effects.happiness ? `<br><small>Mutluluk: ${d.effects.happiness > 0 ? '+' : ''}${d.effects.happiness}%</small>` : ''}
                ${d.effects && d.effects.support ? `<br><small>Destek: ${d.effects.support > 0 ? '+' : ''}${d.effects.support}%</small>` : ''}
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="modal-content stats-modal">
            <h2>📊 Detaylı Oyun İstatistikleri</h2>
            
            <div style="margin: 1.5rem 0;">
                <h3>Kararlarınız</h3>
                ${decisions}
            </div>
            
            <div style="margin: 1.5rem 0;">
                <h3>Mutluluk Grafiği</h3>
                <canvas id="final-happiness-chart"></canvas>
            </div>
            
            <div style="margin: 1.5rem 0;">
                <h3>Destek Grafiği</h3>
                <canvas id="final-support-chart"></canvas>
            </div>
            
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Grafikleri çiz
    setTimeout(() => {
        const happinessChart = new SimpleChart('final-happiness-chart', gameState.happinessHistory || [50], {
            width: 500,
            height: 150,
            lineColor: '#10b981',
            fillColor: 'rgba(16, 185, 129, 0.1)'
        });
        happinessChart.draw();
        
        const supportChart = new SimpleChart('final-support-chart', gameState.supportHistory || [50], {
            width: 500,
            height: 150,
            lineColor: '#6366f1',
            fillColor: 'rgba(99, 102, 241, 0.1)'
        });
        supportChart.draw();
    }, 100);
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
    
    // Görevleri kontrol et
    if (typeof checkQuests === 'function') {
        checkQuests();
    }
    
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
    
    // İlerleme takibi
    if (typeof onScenarioComplete === 'function') {
        onScenarioComplete(gameState.happiness, gameState.support);
    }
    
    // Rekabetçi maç kontrolü
    if (window.competitiveMatch && window.competitiveMatch.active) {
        const playerScore = (gameState.happiness + gameState.support) / 2;
        if (typeof endCompetitiveMatch === 'function') {
            endCompetitiveMatch(playerScore);
        }
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
    
    // Animasyonlu sayaçlar
    setTimeout(() => {
        if (typeof animateNumber === 'function') {
            animateNumber(document.getElementById('admin-total-users'), 0, users.length, 1000);
            animateNumber(document.getElementById('admin-total-students'), 0, students.length, 1200);
            animateNumber(document.getElementById('admin-total-teachers'), 0, teachers.length, 1400);
            animateNumber(document.getElementById('admin-total-scenarios'), 0, totalScenarios, 1600);
        } else {
            document.getElementById('admin-total-users').textContent = users.length;
            document.getElementById('admin-total-students').textContent = students.length;
            document.getElementById('admin-total-teachers').textContent = teachers.length;
            document.getElementById('admin-total-scenarios').textContent = totalScenarios;
        }
    }, 100);
    
    loadAdminUsersList(users);
}

function loadAdminUsersList(users) {
    const usersDiv = document.getElementById('admin-users-list');
    
    usersDiv.innerHTML = `
        <div style="overflow-x: auto;">
            <table class="user-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" onchange="toggleAllUsers(this)"></th>
                        <th>Ad Soyad</th>
                        <th>Kullanıcı Adı</th>
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
                        <tr class="${selectedUsers.includes(user.id) ? 'selected-row' : ''}">
                            <td><input type="checkbox" ${selectedUsers.includes(user.id) ? 'checked' : ''} onchange="toggleUserSelection(${user.id})"></td>
                            <td><strong>${user.name}</strong></td>
                            <td>${user.email}</td>
                            <td><code>${user.password}</code></td>
                            <td>${user.type === 'student' ? '🎓 Öğrenci' : user.type === 'teacher' ? '👨‍🏫 Öğretmen' : '🔧 Admin'}</td>
                            <td><span class="badge-pill">${(user.scenarios || []).length}</span></td>
                            <td><span class="level-badge">Lvl ${user.level || 1}</span></td>
                            <td>${new Date(user.id).toLocaleDateString('tr-TR')}</td>
                            <td>
                                <button class="btn-small btn-secondary" onclick="viewUserDetails(${user.id})">👁️</button>
                                <button class="btn-small btn-secondary" onclick="editUser(${user.id})">✏️</button>
                                <button class="btn-small btn-secondary" onclick="deleteUser(${user.id})">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function toggleAllUsers(checkbox) {
    const users = getFromStorage('users') || [];
    if (checkbox.checked) {
        selectedUsers = users.map(u => u.id);
    } else {
        selectedUsers = [];
    }
    updateBulkActionsBar();
    loadAdminUsersList(users);
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
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Başarım Bildirimi
function showAchievementNotification(title, description, icon = '🏆') {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${icon}</div>
        <div class="achievement-content">
            <div class="achievement-title">${title}</div>
            <div class="achievement-desc">${description}</div>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Ses çal
    playSound('achievement');
    
    setTimeout(() => {
        notification.classList.add('slide-out');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Basit ses sistemi
function playSound(type) {
    if (!window.soundEnabled) return;
    
    const sounds = {
        'click': 1000,
        'achievement': 1200,
        'success': 800,
        'error': 400
    };
    
    const freq = sounds[type] || 800;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Ses çalmazsa sessizce devam et
    }
}

// Ses açma/kapama
window.soundEnabled = true;
function toggleGameSound() {
    window.soundEnabled = !window.soundEnabled;
    const icon = document.getElementById('sound-icon');
    if (icon) {
        icon.textContent = window.soundEnabled ? '🔊' : '🔇';
    }
    showToast(window.soundEnabled ? '🔊 Ses açıldı' : '🔇 Ses kapatıldı', 'info');
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


// Veri Export/Import Sistemi
function exportAllData() {
    const data = {
        users: getFromStorage('users') || [],
        activities: getFromStorage('activities') || [],
        comments: getFromStorage('comments') || {},
        exportDate: new Date().toISOString(),
        version: '2.5'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `kararlab_data_${Date.now()}.json`;
    link.click();
    
    showToast('Tüm veriler indirildi!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (confirm('Mevcut veriler silinecek ve yeni veriler yüklenecek. Emin misiniz?')) {
                    saveToStorage('users', data.users || []);
                    saveToStorage('activities', data.activities || []);
                    saveToStorage('comments', data.comments || {});
                    
                    showToast('Veriler başarıyla yüklendi! Sayfa yenileniyor...', 'success');
                    
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                }
            } catch (error) {
                showToast('Dosya okunamadı! Geçerli bir JSON dosyası seçin.', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Veri senkronizasyon kodu oluştur
function generateSyncCode() {
    const data = {
        users: getFromStorage('users') || [],
        timestamp: Date.now()
    };
    
    const code = btoa(JSON.stringify(data));
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🔄 Senkronizasyon Kodu</h2>
            <p>Bu kodu diğer cihazda kullanarak verileri senkronize edebilirsin:</p>
            <textarea id="sync-code" readonly style="width: 100%; height: 150px; padding: 1rem; border-radius: 8px; margin: 1rem 0;">${code}</textarea>
            <button class="btn-primary" onclick="copySyncCode()">📋 Kopyala</button>
            <button class="btn-secondary" onclick="closeModal(event)">Kapat</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function copySyncCode() {
    const textarea = document.getElementById('sync-code');
    textarea.select();
    document.execCommand('copy');
    showToast('Kod kopyalandı!', 'success');
}

function applySyncCode() {
    const code = prompt('Senkronizasyon kodunu yapıştır:');
    if (!code) return;
    
    try {
        const data = JSON.parse(atob(code));
        
        if (confirm('Mevcut veriler güncellenecek. Emin misiniz?')) {
            const existingUsers = getFromStorage('users') || [];
            const newUsers = data.users || [];
            
            // Kullanıcıları birleştir (ID'ye göre)
            const mergedUsers = [...existingUsers];
            newUsers.forEach(newUser => {
                const existingIndex = mergedUsers.findIndex(u => u.id === newUser.id);
                if (existingIndex >= 0) {
                    mergedUsers[existingIndex] = newUser;
                } else {
                    mergedUsers.push(newUser);
                }
            });
            
            saveToStorage('users', mergedUsers);
            showToast('Veriler senkronize edildi! Sayfa yenileniyor...', 'success');
            
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    } catch (error) {
        showToast('Geçersiz kod!', 'error');
    }
}


// Şifre Görünürlüğü Toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

// Gizlilik Politikası Modal
function showPrivacyPolicy() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h3>Gizlilik Politikası ve KVKK</h3>
            <div style="max-height: 400px; overflow-y: auto; padding: 1rem; text-align: left;">
                <h4>1. Veri Toplama</h4>
                <p>KararLab, eğitim amaçlı bir simülasyon platformudur. Topladığımız veriler:</p>
                <ul>
                    <li>Ad Soyad</li>
                    <li>Kullanıcı adı</li>
                    <li>Şifre (şifrelenmiş)</li>
                    <li>Kullanıcı tipi (Öğrenci/Öğretmen)</li>
                    <li>Oyun istatistikleri</li>
                </ul>
                
                <h4>2. Veri Kullanımı</h4>
                <p>Verileriniz sadece:</p>
                <ul>
                    <li>Hesap yönetimi</li>
                    <li>Oyun ilerlemesi takibi</li>
                    <li>Eğitim raporları oluşturma</li>
                </ul>
                <p>amaçlarıyla kullanılır.</p>
                
                <h4>3. Veri Güvenliği</h4>
                <p>Verileriniz tarayıcınızın yerel depolama alanında (LocalStorage) saklanır. Üçüncü taraflarla paylaşılmaz.</p>
                
                <h4>4. Haklarınız</h4>
                <p>KVKK kapsamında:</p>
                <ul>
                    <li>Verilerinize erişim hakkı</li>
                    <li>Verilerin silinmesini talep etme hakkı</li>
                    <li>Verilerin düzeltilmesini talep etme hakkı</li>
                </ul>
                
                <h4>5. İletişim</h4>
                <p>Sorularınız için: info@kararlab.com</p>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" onclick="closePrivacyModal()">Anladım</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closePrivacyModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Form Validation İyileştirmeleri
function validateRegisterForm() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const type = document.getElementById('reg-type').value;
    
    if (name.length < 3) {
        showToast('Ad Soyad en az 3 karakter olmalıdır', 'error');
        return false;
    }
    
    if (email.length < 3) {
        showToast('Kullanıcı adı en az 3 karakter olmalıdır', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showToast('Şifre en az 6 karakter olmalıdır', 'error');
        return false;
    }
    
    if (!type) {
        showToast('Lütfen kullanıcı tipi seçin', 'error');
        return false;
    }
    
    // Kullanıcı adı benzersizliği kontrolü
    const users = getFromStorage('users') || [];
    if (users.find(u => u.email === email)) {
        showToast('Bu kullanıcı adı zaten kullanılıyor', 'error');
        return false;
    }
    
    return true;
}

// Toast Notification Sistemi İyileştirmesi
function showToast(message, type = 'success') {
    // Eski toast'ları temizle
    const oldToasts = document.querySelectorAll('.toast');
    oldToasts.forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animasyon
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Otomatik kaldır
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Sayfa Geçiş Animasyonları
function showPageWithAnimation(pageId) {
    const currentPage = document.querySelector('.page.active');
    const nextPage = document.getElementById(pageId);
    
    if (currentPage) {
        currentPage.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            currentPage.classList.remove('active');
            currentPage.style.animation = '';
            nextPage.classList.add('active');
            nextPage.style.animation = 'fadeIn 0.3s ease';
            window.scrollTo(0, 0);
        }, 300);
    } else {
        nextPage.classList.add('active');
        nextPage.style.animation = 'fadeIn 0.3s ease';
    }
}

// Klavye Kısayolları
document.addEventListener('keydown', function(e) {
    // ESC tuşu ile modal kapatma
    if (e.key === 'Escape') {
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // Enter tuşu ile form gönderme (sadece input'ta iken)
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        const form = e.target.closest('form');
        if (form) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    }
});

console.log('✅ Gelişmiş özellikler yüklendi');


// ============================================
// BAĞIMLILIK ÖZELLİKLERİ ENTEGRASYONU
// ============================================

// Başarılar Paneli
function showAchievementsPanel() {
    const progress = getAchievementProgress();
    const userAchievements = currentUser?.achievements || [];
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <h2>🏆 Başarılar</h2>
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="font-size: 3rem; font-weight: 700; color: var(--primary-color);">
                    ${progress.unlocked}/${progress.total}
                </div>
                <div style="color: var(--text-secondary);">
                    %${progress.percentage} Tamamlandı
                </div>
                <div style="background: var(--border-color); height: 10px; border-radius: 10px; margin-top: 1rem; overflow: hidden;">
                    <div style="background: var(--gradient-1); height: 100%; width: ${progress.percentage}%; transition: width 1s;"></div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; max-height: 500px; overflow-y: auto;">
                ${Object.values(ACHIEVEMENTS).map(ach => {
                    const unlocked = userAchievements.includes(ach.id);
                    return `
                        <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}" style="
                            padding: 1.5rem;
                            background: ${unlocked ? 'var(--card-bg)' : 'rgba(30, 41, 59, 0.3)'};
                            border: 2px solid ${unlocked ? 'var(--primary-color)' : 'var(--border-color)'};
                            border-radius: 12px;
                            text-align: center;
                            ${unlocked ? '' : 'filter: grayscale(1); opacity: 0.5;'}
                        ">
                            <div style="font-size: 3rem; margin-bottom: 0.5rem;">${ach.icon}</div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">${ach.title}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${ach.description}</div>
                            <div style="color: var(--success-color); font-weight: 600;">+${ach.xp} XP</div>
                            <div style="font-size: 0.75rem; color: var(--warning-color); text-transform: uppercase; margin-top: 0.5rem;">${ach.rarity}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="modal-actions" style="margin-top: 2rem;">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Kapat</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Oyun başladığında kontroller
function initGameFeatures() {
    if (!currentUser) return;
    
    // İlk giriş başarısı
    checkAchievement('first_login');
    
    // Günlük ödül kontrolü
    checkDailyReward();
    
    // Zaman bazlı başarılar
    checkTimeBasedAchievements();
    
    // Seviye bazlı başarılar
    const level = currentUser.level || 1;
    if (level >= 5) checkAchievement('level_5');
    if (level >= 10) checkAchievement('level_10');
    
    // Giriş serisi başarıları
    const streak = currentUser.loginStreak || 0;
    if (streak >= 3) checkAchievement('streak_3');
    if (streak >= 7) checkAchievement('streak_7');
    
    // Oyun sayısı başarıları
    const gamesPlayed = currentUser.scenarios?.length || 0;
    if (gamesPlayed >= 10) checkAchievement('games_10');
    if (gamesPlayed >= 50) checkAchievement('games_50');
}

// Senaryo tamamlandığında
function onScenarioComplete(scenarioData) {
    if (!currentUser) return;
    
    // İlk oyun başarısı
    if ((currentUser.scenarios?.length || 0) === 1) {
        checkAchievement('first_game');
    }
    
    // Coin kazan
    const baseCoins = 50;
    earnCoins(baseCoins);
    
    // XP kazan (booster kontrolü ile)
    let xpEarned = 100;
    if (currentUser.activeBooster && currentUser.activeBooster.expiresAt > Date.now()) {
        if (currentUser.activeBooster.id === 'xp_boost_2x') {
            xpEarned *= 2;
        } else if (currentUser.activeBooster.id === 'xp_boost_3x') {
            xpEarned *= 3;
        }
    }
    
    currentUser.xp = (currentUser.xp || 0) + xpEarned;
    
    // Seviye kontrolü
    checkLevelUp();
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
}

// Seviye atlama kontrolü
function checkLevelUp() {
    if (!currentUser) return;
    
    const currentXP = currentUser.xp || 0;
    const currentLevel = currentUser.level || 1;
    const xpForNextLevel = currentLevel * 100;
    
    if (currentXP >= xpForNextLevel) {
        currentUser.level = currentLevel + 1;
        currentUser.xp = currentXP - xpForNextLevel;
        
        showLevelUpModal(currentUser.level);
        
        // Seviye başarıları
        if (currentUser.level === 5) checkAchievement('level_5');
        if (currentUser.level === 10) checkAchievement('level_10');
        
        playSound('levelup');
        createConfetti();
    }
}

function showLevelUpModal(newLevel) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; background: var(--gradient-1); color: white;">
            <div style="font-size: 5rem; animation: bounce 1s ease infinite;">🎉</div>
            <h2 style="font-size: 3rem; margin: 1rem 0;">Seviye Atladın!</h2>
            <div style="font-size: 4rem; font-weight: 700; margin: 2rem 0;">
                Seviye ${newLevel}
            </div>
            <p style="font-size: 1.2rem; opacity: 0.9;">Tebrikler! Yeni seviyeye ulaştın! 🚀</p>
            <button class="btn-primary btn-full" onclick="this.closest('.modal').remove()" style="margin-top: 2rem; background: white; color: var(--primary-color);">
                Harika! 🎊
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Mevcut kullanıcı varsa özellikleri başlat
    const savedUser = getFromStorage('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        initGameFeatures();
    }
});

console.log('✅ Bağımlılık özellikleri entegre edildi');


// ============================================
// GÜNLÜK GÖREVLER VE BİLDİRİMLER ENTEGRASYONU
// ============================================

// Oyun başladığında görevleri başlat
function initGameWithQuests() {
    if (!currentUser) return;
    
    // Günlük görevleri başlat
    initDailyQuests();
    
    // Görev ilerlemelerini güncelle
    updateQuestProgress('shop', 0); // Mağaza ziyareti için hazır
    updateQuestProgress('leaderboard', 0); // Liderlik için hazır
}

// Senaryo tamamlandığında görevleri güncelle
function onScenarioCompleteWithQuests(scenarioData) {
    if (!currentUser) return;
    
    // Senaryo görevini güncelle
    updateQuestProgress('scenario', 1);
    
    // Combo görevini güncelle
    const combo = currentUser.dailyCombo || 0;
    if (combo >= 5) {
        updateQuestProgress('combo', combo);
    }
    
    // XP görevini güncelle
    const dailyXP = currentUser.dailyXPEarned || 0;
    updateQuestProgress('xp', dailyXP);
    
    // Coin kazan
    const baseCoins = 50;
    earnCoins(baseCoins);
    
    // XP kazan (booster kontrolü ile)
    let xpEarned = 100;
    if (currentUser.activeBooster && currentUser.activeBooster.expiresAt > Date.now()) {
        if (currentUser.activeBooster.id === 'xp_boost_2x') {
            xpEarned *= 2;
        } else if (currentUser.activeBooster.id === 'xp_boost_3x') {
            xpEarned *= 3;
        }
    }
    
    currentUser.xp = (currentUser.xp || 0) + xpEarned;
    currentUser.dailyXPEarned = (currentUser.dailyXPEarned || 0) + xpEarned;
    
    // Seviye kontrolü
    checkLevelUp();
    
    // Combo kontrolü
    checkComboBonus();
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
}

// Mini oyun oynandığında
function onMiniGamePlayed(gameType) {
    if (!currentUser) return;
    
    currentUser.miniGamesPlayed = currentUser.miniGamesPlayed || [];
    
    const today = new Date().toDateString();
    const todayGames = currentUser.miniGamesPlayed.filter(g => g.date === today);
    
    if (!todayGames.find(g => g.type === gameType)) {
        currentUser.miniGamesPlayed.push({
            type: gameType,
            date: today
        });
        
        // Görev ilerlemesi
        const uniqueGamesToday = new Set(currentUser.miniGamesPlayed.filter(g => g.date === today).map(g => g.type)).size;
        updateQuestProgress('minigame', uniqueGamesToday);
    }
    
    saveToStorage('currentUser', currentUser);
    updateUserInStorage(currentUser);
}

// Mağaza ziyareti
function onShopVisited() {
    if (!currentUser) return;
    updateQuestProgress('shop', 1);
}

// Liderlik ziyareti
function onLeaderboardVisited() {
    if (!currentUser) return;
    updateQuestProgress('leaderboard', 1);
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    const savedUser = getFromStorage('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        initGameFeatures();
        initGameWithQuests();
    }
});

console.log('✅ Günlük görevler ve bildirimler entegre edildi');
