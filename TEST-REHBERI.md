# 🧪 KararLab v2.0 - Test Rehberi

## 🎮 Nasıl Test Edilir?

### 1. Sunucuyu Başlat
```bash
python -m http.server 8080
```

### 2. Tarayıcıda Aç
```
http://localhost:8080
```

---

## ✅ Test Senaryoları

### Test 1: Halk Mutluluğu Sistemi

#### Adımlar:
1. Giriş yap veya kayıt ol
2. Yeni senaryo başlat
3. Tur 1'de bir seçim yap
4. Sağ panelde "Halk Mutluluğu" göstergesini kontrol et
5. Çubuğun rengini ve yüzdesini gözlemle

#### Beklenen Sonuç:
- ✅ Mutluluk değeri değişmeli
- ✅ Çubuk rengi değişmeli (yeşil/sarı/kırmızı)
- ✅ Yüzde doğru gösterilmeli

---

### Test 2: Başkan Desteği Sistemi

#### Adımlar:
1. Oyuna devam et
2. Farklı kararlar al
3. "Başkan Desteği" göstergesini izle

#### Beklenen Sonuç:
- ✅ Destek değeri değişmeli
- ✅ Çubuk rengi değişmeli
- ✅ Pozitif/negatif etkiler doğru uygulanmalı

---

### Test 3: Dinamik Senaryolar

#### Adımlar:
1. Bir oyun tamamla
2. Tekrar yeni oyun başlat
3. Senaryoların farklı olduğunu kontrol et
4. 3-4 kez tekrar oyna

#### Beklenen Sonuç:
- ✅ Her oyunda farklı senaryolar gelmeli
- ✅ Aynı senaryo tekrar etmemeli
- ✅ Bazen sosyal konular gelmeli (%20 şans)

---

### Test 4: Rastgele Olaylar

#### Adımlar:
1. Oyun oyna
2. Turlar arası rastgele olayları bekle
3. Olay geldiğinde seçenekleri kontrol et
4. Bir seçenek seç ve etkilerini gözlemle

#### Beklenen Sonuç:
- ✅ Olaylar %50 şans ile gelmeli
- ✅ 3 seçenek olmalı
- ✅ Mutluluk ve destek etkilenmeli
- ✅ Göstergeler güncellenmel

---

### Test 5: Halk Yorumları

#### Adımlar:
1. Bir tur tamamla
2. Tur özeti ekranında halk yorumunu oku
3. Mutluluğa göre yorumun değiştiğini kontrol et

#### Beklenen Sonuç:
- ✅ Her turda yorum olmalı
- ✅ Yüksek mutluluk = Pozitif yorum
- ✅ Düşük mutluluk = Negatif yorum
- ✅ İsim ve yaş gösterilmeli

---

### Test 6: Final Raporu

#### Adımlar:
1. Oyunu tamamla
2. Final raporunu incele
3. Politik durum bölümünü kontrol et
4. Halk göstergelerini kontrol et
5. Halkın yorumlarını oku

#### Beklenen Sonuç:
- ✅ Politik durum doğru hesaplanmalı
- ✅ Mutluluk ve destek gösterilmeli
- ✅ Renkli kartlar olmalı
- ✅ 3-5 halk yorumu olmalı
- ✅ Seçim tahmini yapılmalı

---

## 🎯 Özel Test Senaryoları

### Senaryo A: Sürdürülebilir Şehir
**Hedef**: Yüksek mutluluk + Yüksek destek

#### Strategi:
1. Her turda B seçeneğini seç (çevre dostu)
2. Rastgele olaylarda çevre dostu seçenekleri seç
3. Final: "Sürdürülebilir ve Mutlu Şehir" olmalı

#### Beklenen:
- Mutluluk: %70+
- Destek: %70+
- Hava: İyi
- Karbon: Düşük

---

### Senaryo B: Ekonomi Odaklı
**Hedef**: Düşük mutluluk + Yüksek destek

#### Strategi:
1. Her turda A seçeneğini seç (ekonomi)
2. Rastgele olaylarda ekonomik seçenekleri seç
3. Final: "Zorlu Yönetim" veya "Dengeci" olmalı

#### Beklenen:
- Mutluluk: %40-
- Destek: %50+
- Ekonomi: Güçlü
- Hava: Kötü

---

### Senaryo C: Dengeli Yaklaşım
**Hedef**: Orta mutluluk + Orta destek

#### Strategi:
1. Her turda C seçeneğini seç (dengeli)
2. Rastgele olaylarda orta seçenekleri seç
3. Final: "Dengeci Yönetim" olmalı

#### Beklenen:
- Mutluluk: %40-60
- Destek: %40-60
- Tüm göstergeler orta

---

## 🐛 Hata Kontrolü

### Kontrol Listesi:
- [ ] Console'da hata var mı?
- [ ] Göstergeler doğru güncelleniyor mu?
- [ ] Çubuklar doğru renkte mi?
- [ ] Senaryolar tekrar ediyor mu?
- [ ] Rastgele olaylar çalışıyor mu?
- [ ] Final raporu doğru mu?
- [ ] Responsive tasarım çalışıyor mu?
- [ ] Animasyonlar smooth mu?

---

## 📊 Performans Testi

### Kontrol Noktaları:
1. **Sayfa Yükleme**: < 1 saniye
2. **Senaryo Değişimi**: < 500ms
3. **Gösterge Güncelleme**: < 100ms
4. **Animasyonlar**: 60 FPS

### Test Araçları:
- Chrome DevTools
- Performance tab
- Network tab
- Console

---

## 🎨 Görsel Test

### Kontrol Listesi:
- [ ] Renkler doğru mu?
- [ ] Çubuklar düzgün mü?
- [ ] Kartlar hizalı mı?
- [ ] Yazılar okunabilir mi?
- [ ] Mobilde düzgün görünüyor mu?

---

## 📱 Mobil Test

### Cihazlar:
1. iPhone (Safari)
2. Android (Chrome)
3. Tablet

### Kontrol:
- [ ] Responsive tasarım
- [ ] Dokunmatik kontroller
- [ ] Göstergeler görünüyor
- [ ] Butonlar tıklanabilir

---

## 🔍 Detaylı Test Adımları

### 1. İlk Giriş Testi
```
1. Ana sayfayı aç
2. "Kayıt Ol" butonuna tıkla
3. Bilgileri doldur
4. Kayıt ol
5. Öğrenci paneline yönlendirildiğini kontrol et
```

### 2. Oyun Başlatma Testi
```
1. "Yeni Senaryo Başlat" butonuna tıkla
2. Tur 0 ekranını kontrol et
3. "Devam Et" butonuna tıkla
4. Tur 1 senaryosunun yüklendiğini kontrol et
```

### 3. Karar Verme Testi
```
1. Bir seçeneğe tıkla
2. Seçeneğin seçildiğini kontrol et (mavi border)
3. 500ms sonra otomatik devam etmeli
4. Tur özeti ekranı gelmeli
```

### 4. Gösterge Testi
```
1. Sağ paneldeki göstergeleri kontrol et
2. Mutluluk çubuğunu kontrol et
3. Destek çubuğunu kontrol et
4. Renklerin doğru olduğunu kontrol et
```

### 5. Rastgele Olay Testi
```
1. Tur özeti ekranında "Devam Et" butonuna tıkla
2. %50 şans ile olay gelmeli
3. Olay gelirse modal açılmalı
4. Bir seçenek seç
5. Göstergelerin güncellendiğini kontrol et
```

### 6. Final Raporu Testi
```
1. Tur 3'ü tamamla
2. Final raporu ekranını kontrol et
3. Politik durum bölümünü oku
4. Halk göstergelerini kontrol et
5. Halkın yorumlarını oku
6. Renkli kartları kontrol et
```

---

## 🎯 Başarı Kriterleri

### Minimum Gereksinimler:
- ✅ Tüm senaryolar çalışmalı
- ✅ Mutluluk ve destek güncellenmel
- ✅ Rastgele olaylar tetiklenmeli
- ✅ Final raporu doğru hesaplanmalı
- ✅ Hata olmamalı

### İdeal Durum:
- ✅ Smooth animasyonlar
- ✅ Hızlı yükleme
- ✅ Responsive tasarım
- ✅ Kullanıcı dostu arayüz
- ✅ Eğlenceli oynanış

---

## 📝 Test Raporu Şablonu

```markdown
# Test Raporu

**Tarih**: [Tarih]
**Tester**: [İsim]
**Versiyon**: 2.0

## Test Sonuçları

### Fonksiyonel Testler
- [ ] Halk Mutluluğu: ✅ / ❌
- [ ] Başkan Desteği: ✅ / ❌
- [ ] Dinamik Senaryolar: ✅ / ❌
- [ ] Rastgele Olaylar: ✅ / ❌
- [ ] Halk Yorumları: ✅ / ❌
- [ ] Final Raporu: ✅ / ❌

### Görsel Testler
- [ ] Renkli Çubuklar: ✅ / ❌
- [ ] Animasyonlar: ✅ / ❌
- [ ] Responsive: ✅ / ❌

### Performans
- [ ] Yükleme Hızı: ✅ / ❌
- [ ] Animasyon FPS: ✅ / ❌

## Bulunan Hatalar
1. [Hata açıklaması]
2. [Hata açıklaması]

## Öneriler
1. [Öneri]
2. [Öneri]

## Genel Değerlendirme
[Genel yorum]

**Sonuç**: ✅ Başarılı / ❌ Başarısız
```

---

## 🚀 Hızlı Test

### 5 Dakikalık Test:
1. ✅ Giriş yap
2. ✅ Oyun başlat
3. ✅ 1 tur oyna
4. ✅ Göstergeleri kontrol et
5. ✅ Rastgele olay bekle

### 15 Dakikalık Test:
1. ✅ Tam oyun oyna
2. ✅ Final raporunu incele
3. ✅ Tekrar oyna (farklı senaryolar)
4. ✅ Tüm özellikleri test et

### 30 Dakikalık Test:
1. ✅ 3-4 farklı oyun oyna
2. ✅ Tüm senaryoları gör
3. ✅ Tüm olayları test et
4. ✅ Farklı stratejiler dene
5. ✅ Performans ölç

---

## 📞 Sorun Bildirimi

### Hata Bulduysanız:
1. Console'u açın (F12)
2. Hatayı kopyalayın
3. Adımları not edin
4. Ekran görüntüsü alın
5. Rapor edin

### İletişim:
- GitHub Issues
- E-posta
- Discord

---

**Test Başarılar!** 🧪✨
