# Netlify Admin Portal Deployment Fix

## Sorun
```
Base directory does not exist: /opt/build/repo/admin-portal
```

Bu hata, Netlify Dashboard'da Base directory ayarı ile netlify.toml dosyasındaki `base` ayarının çakışmasından kaynaklanır.

## Çözüm

### Adım 1: Netlify Dashboard Ayarları

1. **Netlify Dashboard'a gidin:**
   - https://app.netlify.com
   - Admin portal site'ınızı seçin

2. **Site settings → Build & deploy → Build settings:**

   **Base directory:** `admin-portal` (bu ayar zaten yapılmış)
   
   **Build command:** 
   ```
   npm install --legacy-peer-deps && npm run build
   ```
   (netlify.toml'dan otomatik alınır, manuel değiştirmeyin)
   
   **Publish directory:** 
   ```
   dist
   ```

### Adım 2: netlify.toml Kontrolü

`admin-portal/netlify.toml` dosyasında **`base`** alanı OLMAMALI.

✅ **DOĞRU:**
```toml
[build]
  command = "npm install --legacy-peer-deps && npm run build"
  publish = "dist"
```

❌ **YANLIŞ:**
```toml
[build]
  base = "."  # Bu satır çakışma yaratır!
  command = "npm install --legacy-peer-deps && npm run build"
  publish = "dist"
```

### Adım 3: GitHub Repo Kontrolü

GitHub'da repo'nuzu kontrol edin:
- `admin-portal` klasörü root seviyesinde olmalı
- `admin-portal/package.json` dosyası olmalı
- `admin-portal/netlify.toml` dosyası olmalı

### Adım 4: Deploy

1. Değişiklikleri GitHub'a push edin
2. Netlify Dashboard'da **Deploys** sekmesine gidin
3. **Trigger deploy** → **Deploy site** butonuna tıklayın

## Neden Bu Hata Oluşuyor?

Netlify şu sırayla çalışır:

1. **Dashboard Base directory ayarı:** Netlify repo'yu clone eder ve `/opt/build/repo/admin-portal` dizinine gider
2. **netlify.toml base ayarı:** Eğer netlify.toml'da `base = "."` varsa, Netlify tekrar dizin değiştirmeye çalışır
3. **Çakışma:** Netlify `/opt/build/repo/admin-portal/admin-portal` gibi yanlış bir yol arar

## Çözüm Özeti

**Netlify Dashboard'da Base directory ayarlandıysa:**
- ✅ netlify.toml'da `base` alanını KALDIRIN
- ✅ Build command ve publish directory netlify.toml'da kalabilir
- ✅ Netlify otomatik olarak admin-portal klasörüne gider

**Netlify Dashboard'da Base directory BOŞSA:**
- ✅ netlify.toml'da `base = "admin-portal"` kullanın
- ✅ Build command'da `cd admin-portal &&` ekleyin

## Hızlı Kontrol Listesi

- [ ] Netlify Dashboard → Base directory: `admin-portal`
- [ ] netlify.toml'da `base` alanı YOK
- [ ] GitHub'da `admin-portal/package.json` var
- [ ] GitHub'da `admin-portal/netlify.toml` var
- [ ] Değişiklikler GitHub'a push edildi
- [ ] Netlify'da yeni deploy başlatıldı

## Hala Hata Alıyorsanız

1. **Netlify Build Logs'u kontrol edin:**
   - Deploys → En son deploy → Build logs
   - Hangi dizinde çalıştığını kontrol edin

2. **GitHub Repo Yapısını Kontrol Edin:**
   - Repo root'unda `admin-portal` klasörü var mı?
   - `admin-portal` klasörü içinde `package.json` var mı?

3. **Netlify Site Ayarlarını Sıfırlayın:**
   - Base directory'yi boşaltın
   - Deploy edin
   - Tekrar `admin-portal` olarak ayarlayın
   - Deploy edin
