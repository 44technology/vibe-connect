# Admin Portal Netlify Deployment - Hızlı Başlangıç

## 🚀 Netlify'a Deploy Etme (3 Adım)

### Adım 1: Netlify'da Yeni Site Oluştur

1. https://app.netlify.com adresine gidin
2. "Add new site" → "Import an existing project" tıklayın
3. GitHub'ı seçin ve `vibe-connect-main` repository'nizi seçin

### Adım 2: Build Ayarlarını Yapılandır

Netlify UI'da Site settings → Build & deploy → Build settings bölümüne gidin ve şu ayarları yapın:

```
Base directory: admin-portal
Build command: npm install --legacy-peer-deps && npm run build
Publish directory: admin-portal/dist
```

**ÖNEMLİ:** 
- Base directory: `admin-portal` (sadece klasör adı, sonunda `/` yok)
- Publish directory: `admin-portal/dist` (klasör adı + dist)
- Build command: `npm install --legacy-peer-deps && npm run build`

### Adım 3: Deploy

"Deploy site" butonuna tıklayın. Netlify otomatik olarak:
- Dependencies'leri yükleyecek
- Build edecek
- Deploy edecek

### Sonuç

Admin portal'ınız şu şekilde bir URL'de yayında olacak:
- `https://ulikme-admin-portal.netlify.app` (veya Netlify'ın verdiği otomatik URL)
- Bu URL'i Site settings'ten özelleştirebilirsiniz

## 📝 Notlar

- **Mobil uygulama** ve **Admin portal** **ayrı Netlify siteleri** olacak
- Her ikisi de aynı GitHub repository'den deploy edilebilir
- Netlify otomatik olarak SSL sertifikası sağlar (HTTPS)
- GitHub'a push yaptığınızda otomatik deploy olur

## 🔧 Sorun Giderme

**Build hatası alırsanız:**
- Base directory'nin `admin-portal` olduğundan emin olun
- Publish directory'nin `admin-portal/dist` olduğundan emin olun
- Node version'ın 18 olduğundan emin olun

**404 hatası alırsanız:**
- `netlify.toml` dosyasındaki redirects ayarlarını kontrol edin
- React Router için SPA redirect'i eklenmiş olmalı
