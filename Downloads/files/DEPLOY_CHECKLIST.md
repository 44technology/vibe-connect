# 🚀 Netlify Deploy Checklist

## ✅ Ön Hazırlık (Yapıldı)
- [x] netlify.toml oluşturuldu
- [x] Build script'leri eklendi
- [x] API URL yapılandırması güncellendi
- [x] CORS ayarları yapıldı
- [x] Netlify Functions proxy hazır

## 📋 Deploy Adımları

### 1. GitHub Repository Hazırlığı
- [ ] Git repository kontrolü
- [ ] Tüm değişiklikler commit edildi mi?
- [ ] GitHub'a push edildi mi?

### 2. Backend Deploy (Railway/Render)
- [ ] Railway hesabı oluşturuldu (https://railway.app)
- [ ] GitHub repo bağlandı
- [ ] Backend servisi oluşturuldu
- [ ] Environment variables eklendi:
  - [ ] PORT=3000
  - [ ] GOOGLE_CLOUD_VISION_API_KEY (varsa)
- [ ] Deploy edildi
- [ ] Backend URL kopyalandı (örn: https://xxx.railway.app)

### 3. Netlify Deploy
- [ ] Netlify hesabı oluşturuldu (https://app.netlify.com)
- [ ] GitHub repo bağlandı
- [ ] Build settings yapılandırıldı:
  - [ ] Build command: `npm run build:web`
  - [ ] Publish directory: `web-build`
- [ ] Environment variables eklendi:
  - [ ] BACKEND_URL=https://your-backend.railway.app
  - [ ] NODE_VERSION=18
- [ ] Deploy başlatıldı
- [ ] Deploy başarılı mı kontrol edildi

### 4. Post-Deploy Kontrolleri
- [ ] Site açılıyor mu? (https://your-site.netlify.app)
- [ ] API istekleri çalışıyor mu?
- [ ] Console'da hata var mı?
- [ ] Mobile responsive çalışıyor mu?

## 🔧 Sorun Giderme

### Build Hatası
```bash
# Local'de test edin
npm run build:web
```

### API Çalışmıyor
- Backend URL doğru mu?
- Netlify Functions loglarını kontrol edin
- CORS ayarlarını kontrol edin

### Sayfa Açılmıyor
- Browser console'u kontrol edin
- Netlify deploy loglarını kontrol edin

## 📝 Notlar
- İlk deploy 5-10 dakika sürebilir
- Backend URL'i Netlify environment variables'a eklemeyi unutmayın
- Custom domain eklemek isterseniz Netlify dashboard'dan ekleyebilirsiniz

