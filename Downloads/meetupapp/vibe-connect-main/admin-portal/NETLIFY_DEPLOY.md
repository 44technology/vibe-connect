# Admin Portal Netlify Deployment Guide

## Admin Portal'ı Netlify'a Deploy Etme

Admin portal'ı mobil uygulamadan **ayrı bir Netlify sitesi** olarak deploy edebilirsiniz.

### Yöntem 1: Netlify UI ile (Önerilen)

1. **Netlify'a Git**
   - https://app.netlify.com adresine gidin
   - Login olun

2. **Yeni Site Oluştur**
   - "Add new site" → "Import an existing project" tıklayın
   - GitHub'ı seçin ve repository'nizi bağlayın

3. **Build Ayarları**
   - **Base directory:** `admin-portal`
   - **Build command:** `npm install --legacy-peer-deps && npm run build`
   - **Publish directory:** `admin-portal/dist`
   - **Node version:** `18`

4. **Deploy**
   - "Deploy site" butonuna tıklayın
   - Netlify otomatik olarak build edip deploy edecek

5. **Site URL**
   - Netlify size otomatik bir URL verecek (örn: `ulikme-admin-portal.netlify.app`)
   - Bu URL'i özelleştirebilirsiniz (Site settings → Change site name)

### Yöntem 2: Netlify CLI ile

```bash
# Netlify CLI'yi yükleyin (eğer yoksa)
npm install -g netlify-cli

# Admin portal klasörüne gidin
cd admin-portal

# Netlify'a login olun
netlify login

# Site oluştur ve deploy et
netlify init
# Sorulara cevap verin:
# - Create & configure a new site
# - Team seçin
# - Site name: ulikme-admin-portal (veya istediğiniz isim)
# - Build command: npm install --legacy-peer-deps && npm run build
# - Directory to deploy: dist
# - Netlify functions folder: (boş bırakın)

# Deploy et
netlify deploy --prod
```

### Yöntem 3: GitHub Actions ile Otomatik Deploy

`.github/workflows/deploy-admin-portal.yml` dosyası oluşturun:

```yaml
name: Deploy Admin Portal to Netlify

on:
  push:
    branches:
      - main
    paths:
      - 'admin-portal/**'
      - '.github/workflows/deploy-admin-portal.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        working-directory: ./admin-portal
        run: npm install --legacy-peer-deps
        
      - name: Build
        working-directory: ./admin-portal
        run: npm run build
        
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=admin-portal/dist --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_ADMIN_PORTAL_SITE_ID }}
```

### Önemli Notlar

1. **Ayrı Netlify Sitesi**: Admin portal mobil uygulamadan **tamamen ayrı** bir Netlify sitesi olacak
2. **Farklı URL**: Mobil uygulama: `ulikme.netlify.app`, Admin portal: `ulikme-admin.netlify.app` (veya istediğiniz isim)
3. **Base Directory**: Netlify'da build ayarlarında `admin-portal` klasörünü belirtmeyi unutmayın
4. **Environment Variables**: Gerekirse Netlify'da environment variables ekleyebilirsiniz (Site settings → Environment variables)

### İlk Deploy Sonrası

1. **Custom Domain** (Opsiyonel): Netlify'da custom domain ekleyebilirsiniz
2. **HTTPS**: Netlify otomatik olarak SSL sertifikası sağlar
3. **Continuous Deployment**: GitHub'a push yaptığınızda otomatik deploy olur

### Sorun Giderme

- **Build hatası**: `npm install --legacy-peer-deps` kullanın
- **404 hatası**: `netlify.toml` dosyasındaki redirects ayarlarını kontrol edin
- **Routing hatası**: React Router için SPA redirect'i eklenmiş olmalı
