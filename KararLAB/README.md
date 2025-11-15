# 🏙️ KararLab - Novaşehir Sürdürülebilir Şehir Simülatörü

Modern, etkileşimli bir şehir planlama simülasyon oyunu. Öğrenciler ve öğretmenler için tasarlanmış, sürdürülebilirlik ve karar verme becerilerini geliştiren web tabanlı bir eğitim aracı.

## ✨ Özellikler

### 🎮 Oyun Mekanikleri
- **3 Karar Turu**: Ulaşım, Yeşil Alan & İmar, Enerji & Atık
- **6 Gösterge**: Hava kalitesi, trafik, yeşil alan, karbon emisyonu, yaşam kalitesi, ekonomi
- **3 Final Senaryosu**: Ekonomi Odaklı, Dengeci, Sürdürülebilir Şehir
- **Gerçek Zamanlı Geri Bildirim**: Her kararın etkilerini anında gör

### 👥 Kullanıcı Rolleri

#### 🎓 Öğrenci
- Senaryo oynama ve farklı stratejiler deneme
- Geçmiş raporları görüntüleme
- Sınıfa katılma (sınıf kodu ile)
- Rozet kazanma sistemi

#### 👨‍🏫 Öğretmen
- Sınıf oluşturma ve yönetme
- Öğrenci raporlarını görüntüleme
- Sınıf bazlı istatistikler ve grafikler
- PDF rapor indirme
- Tartışma soruları ve öneriler

#### 🔧 Admin
- Tüm kullanıcı yönetimi
- Sistem istatistikleri
- Kullanıcı silme/düzenleme

## 🚀 Kurulum

### Gereksinimler
- Modern bir web tarayıcısı (Chrome, Firefox, Safari, Edge)
- Yerel sunucu (opsiyonel)

### Hızlı Başlangıç

1. Dosyaları indirin
2. `index.html` dosyasını tarayıcınızda açın
3. Hemen oynamaya başlayın!

```bash
# Veya yerel sunucu ile
python -m http.server 8000
# Tarayıcıda: http://localhost:8000
```

## 🎯 Kullanım

### Demo Modu
Ana sayfadan "Demo Oyna" butonuna tıklayarak kayıt olmadan deneyebilirsiniz.

### Öğrenci Olarak
1. "Kayıt Ol" → "Öğrenci" seçin
2. Bilgilerinizi girin
3. "Yeni Senaryo Başlat" ile oyuna başlayın
4. Öğretmeninizden aldığınız sınıf kodu ile sınıfa katılın

### Öğretmen Olarak
1. "Kayıt Ol" → "Öğretmen" seçin
2. Okul ve branş bilgilerinizi girin
3. "Yeni Sınıf" oluşturun
4. Sınıf kodunu öğrencilerinizle paylaşın
5. Sınıf raporlarını görüntüleyin

### Admin Girişi
```
Kullanıcı: admin
Şifre: 123
```

## 🎨 Özellikler Detayı

### Karar Turları

#### Tur 1: Ulaşım Politikası
- **A**: Otopark ve yol genişletme (ekonomi odaklı)
- **B**: Toplu taşıma devrimi (sürdürülebilir)
- **C**: Karma geçiş planı (dengeli)

#### Tur 2: Yeşil Alan & İmar
- **A**: Yeşil alan feda edilir (konut odaklı)
- **B**: Dikey mimari ve yeşil alan koruma (çevre odaklı)
- **C**: Kentsel dönüşüm (güvenlik odaklı)

#### Tur 3: Enerji & Atık
- **A**: Fosil yakıt ağırlıklı (ucuz enerji)
- **B**: Yenilenebilir enerji devrimi (sürdürülebilir)
- **C**: Geçiş planı (aşamalı)

### Final Senaryoları

🏆 **Sürdürülebilir Şehir** (BBB kombinasyonu)
- Yüksek yaşam kalitesi
- Düşük karbon emisyonu
- Çevre dostu politikalar

⚖️ **Dengeci Şehir** (Karma kombinasyonlar)
- Orta düzey göstergeler
- Dengeli yaklaşım
- Risk minimizasyonu

💰 **Ekonomi Odaklı Şehir** (AAA kombinasyonu)
- Kısa vadeli kazanımlar
- Yüksek çevre maliyeti
- Ekonomik büyüme odaklı

## 🎓 Eğitim Kullanımı

### Sınıf İçi Aktiviteler
1. **Grup Çalışması**: Öğrencileri gruplara ayırın, farklı stratejiler deneyin
2. **Tartışma**: Final raporlarını karşılaştırın
3. **Sunum**: Her grup kararlarını ve sonuçlarını paylaşsın
4. **Analiz**: Öğretmen panelinden sınıf eğilimlerini inceleyin

### Önerilen Tartışma Soruları
- Neden kısa vadeli ekonomik kararlar daha cazip görünüyor?
- Sürdürülebilirlik için hangi fedakarlıklar gerekli?
- Gerçek hayatta şehir yöneticileri hangi baskılarla karşılaşır?
- Hangi gösterge sizin için en önemliydi?

## 🛠️ Teknik Detaylar

### Teknolojiler
- **HTML5**: Yapı
- **CSS3**: Modern, gradient'li, animasyonlu tasarım
- **Vanilla JavaScript**: Tüm oyun mantığı
- **LocalStorage**: Veri saklama

### Dosya Yapısı
```
kararlab/
├── index.html          # Ana HTML dosyası
├── styles.css          # Tüm stiller ve animasyonlar
├── app.js             # Oyun mantığı ve fonksiyonlar
└── README.md          # Bu dosya
```

### Veri Yapısı
```javascript
// Kullanıcı
{
  id: timestamp,
  name: string,
  email: string,
  password: string,
  type: 'student' | 'teacher' | 'admin',
  scenarios: [],
  badges: [],
  classId: number (öğrenci için)
}

// Senaryo
{
  id: timestamp,
  name: string,
  date: timestamp,
  finalType: string,
  decisions: [{turn, choice}],
  indicators: {}
}
```

## 🎨 Tasarım Özellikleri

- **Dark Mode**: Modern koyu tema
- **Gradient Efektler**: Canlı renk geçişleri
- **Animasyonlar**: Yumuşak geçişler ve hover efektleri
- **Responsive**: Mobil uyumlu tasarım
- **Glassmorphism**: Bulanık arka plan efektleri
- **Floating Orbs**: Arka plan animasyonları

## 📊 Göstergeler

| Gösterge | Açıklama |
|----------|----------|
| 🌫️ Hava Kalitesi | Şehrin hava kirliliği seviyesi |
| 🚗 Trafik Yoğunluğu | Yol ve ulaşım durumu |
| 🌳 Yeşil Alan | Park ve yeşil alan oranı |
| 💨 Karbon Emisyonu | Sera gazı salınımı |
| 😊 Yaşam Kalitesi | Vatandaş memnuniyeti |
| 💼 Ekonomi | Ekonomik göstergeler |

## 🏆 Rozet Sistemi

- 🌱 **Yeşil Şehir Savunucusu**: Sürdürülebilir şehir finale ulaş
- ⚖️ **Dengeci Planlamacı**: Dengeli şehir finale ulaş
- 💰 **Ekonomi Uzmanı**: Ekonomi odaklı şehir finale ulaş

## ✨ YENİ EKLENEN ÖZELLİKLER

### 🎮 Oyun Geliştirmeleri
- ✅ **Seviye ve XP Sistemi** - Oyna, XP kazan, seviye atla!
- ✅ **Başarı Sistemi** - 10+ farklı başarı rozeti
- ✅ **Rastgele Olaylar** - Deprem, salgın, yatırım teklifleri
- ✅ **Günlük Görevler** - Her gün yeni görevler
- ✅ **Quiz Modu** - 10 sürdürülebilirlik sorusu

### 👥 Sosyal Özellikler
- ✅ **Liderlik Tablosu** - En iyi oyuncular
- ✅ **Arkadaş Sistemi** - Arkadaş ekle, profillerini gör
- ✅ **Paylaşım** - Sonuçlarını paylaş
- ✅ **Yorum Sistemi** - Senaryolar hakkında yorum yap

### 📊 Gelişmiş Raporlama
- ✅ **Detaylı İstatistikler** - Grafik ve tablolar
- ✅ **Karşılaştırma** - Arkadaşlarınla karşılaştır
- ✅ **İlerleme Takibi** - Seviye ve başarı takibi

## 🔮 Gelecek Özellikler

- [ ] 3D Şehir Görünümü (Three.js)
- [ ] Ses Efektleri
- [ ] Çoklu Dil Desteği
- [ ] Gerçek PDF Rapor (jsPDF)
- [ ] Turnuva Modu
- [ ] Senaryo Editörü
- [ ] Mobil Uygulama
- [ ] Backend + Database

## 📝 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## 👨‍💻 Geliştirici Notları

### LocalStorage Kullanımı
Tüm veriler tarayıcının LocalStorage'ında saklanır. Gerçek bir üretim ortamında backend ve veritabanı kullanılmalıdır.

### Güvenlik
Şifreler düz metin olarak saklanır. Üretim ortamında mutlaka hash'lenmelidir (bcrypt vb.).

### Performans
Büyük kullanıcı sayılarında LocalStorage yetersiz kalabilir. Backend gereklidir.

## 🤝 Katkıda Bulunma

Önerileriniz ve katkılarınız için teşekkürler!

## 📧 İletişim

Sorularınız için: info@kararlab.com

---

**KararLab** - Sürdürülebilir gelecek için bugünden karar ver! 🌍
