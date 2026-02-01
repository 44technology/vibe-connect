# Mobile App Netlify Deployment Guide

## 🚀 Mobile App Deployment URL

**Production URL:** https://ulikme1.netlify.app/

## Netlify Site Configuration

### Site Settings

1. **Netlify Dashboard'a gidin:**
   - https://app.netlify.com
   - `ulikme1` sitesini seçin
   - **Site settings** → **Build & deploy**

### Build Settings

Mobile app root directory'den deploy edilir. Netlify Dashboard'da şu ayarlar olmalı:

```
Base directory: (BOŞ - hiçbir şey yazmayın)
Build command: npm install --legacy-peer-deps && npm run build
Publish directory: dist
```

**ÖNEMLİ:** 
- Base directory **MUTLAKA BOŞ** olmalı (mobile app root'tan deploy edilir)
- `netlify.toml` dosyası zaten doğru yapılandırılmış
- GitHub'a push yaptığınızda otomatik deploy olur

### Environment Variables

Gerekirse Netlify Dashboard'da environment variables ekleyebilirsiniz:
- Site settings → Environment variables → Add variable

## Build Configuration

`netlify.toml` dosyasındaki yapılandırma:

```toml
[build]
  base = "."
  command = "npm install --legacy-peer-deps && npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"
```

## Continuous Deployment

GitHub'a push yaptığınızda Netlify otomatik olarak:
1. Dependencies'leri yükler (`npm install --legacy-peer-deps`)
2. Build eder (`npm run build`)
3. Deploy eder (`dist` klasörünü publish eder)

## Manual Deploy

Netlify CLI ile manuel deploy:

```bash
npm i -g netlify-cli
cd c:\Users\ALI\Downloads\meetupapp\vibe-connect-main
netlify deploy --prod
```

## Sorun Giderme

### Build hatası alırsanız:
- Base directory'nin **BOŞ** olduğundan emin olun
- Node version'ın 18 olduğundan emin olun
- `npm install --legacy-peer-deps` kullanıldığından emin olun

### 404 hatası alırsanız:
- `netlify.toml` dosyasındaki redirects ayarlarını kontrol edin
- React Router için SPA redirect'i eklenmiş olmalı (`/*` → `/index.html`)

### Routing hatası:
- `netlify.toml` dosyasında redirects bölümü mevcut olmalı
- Tüm route'lar `/index.html`'e yönlendirilmeli

## Notlar

- ✅ Mobile app ve Admin portal **ayrı Netlify siteleri**
- ✅ Mobile app: `https://ulikme1.netlify.app/`
- ✅ Admin portal: Ayrı bir Netlify sitesi (farklı URL)
- ✅ Her ikisi de aynı GitHub repository'den deploy edilebilir
- ✅ Netlify otomatik olarak SSL sertifikası sağlar (HTTPS)
