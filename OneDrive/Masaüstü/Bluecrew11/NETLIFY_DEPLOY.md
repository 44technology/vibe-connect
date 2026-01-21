# Netlify Deployment Guide

## Otomatik Deployment (GitHub/GitLab/Bitbucket ile)

1. **Netlify hesabınıza giriş yapın**: https://app.netlify.com
2. **"New site from Git"** butonuna tıklayın
3. Repository'nizi seçin ve bağlayın
4. Netlify otomatik olarak `netlify.toml` dosyasındaki ayarları kullanacaktır

## Manuel Deployment

### Netlify CLI ile:

```bash
# Netlify CLI'yi global olarak yükleyin
npm install -g netlify-cli

# Netlify'a giriş yapın
netlify login

# Site oluşturun ve deploy edin
netlify deploy --prod
```

### Netlify Dashboard ile:

1. **Netlify Dashboard**'a gidin: https://app.netlify.com
2. **"Add new site"** > **"Deploy manually"** seçin
3. `dist` klasörünü sıkıştırın (zip)
4. Zip dosyasını Netlify'a yükleyin

## Build Ayarları

- **Build command**: `npm run build:web`
- **Publish directory**: `dist`
- **Node version**: 18

Bu ayarlar `netlify.toml` dosyasında zaten tanımlıdır.

## Environment Variables

Eğer Firebase veya diğer servisler için environment variables kullanıyorsanız:

1. Netlify Dashboard > Site settings > Environment variables
2. Gerekli değişkenleri ekleyin:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - vb.

## Notlar

- Build işlemi `dist` klasörüne export eder
- Tüm route'lar `index.html`'e yönlendirilir (SPA için gerekli)
- Node.js 18 kullanılır

