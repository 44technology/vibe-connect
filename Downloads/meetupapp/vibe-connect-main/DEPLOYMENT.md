# Deployment Guide

## ⚠️ ÖNEMLİ: Root Directory Sorunu

Hem Vercel hem de Netlify'da `package.json` bulunamama hatası alıyorsanız, bu **Root Directory** ayarından kaynaklanıyor olabilir.

## Vercel Deployment Sorunu Çözümü

### Vercel Dashboard Ayarları:

1. **Vercel Dashboard'a gidin:**
   - https://vercel.com/dashboard
   - Projenizi seçin
   - **Settings** → **General**

2. **Root Directory Ayarını Kontrol Edin:**
   - "Root Directory" alanı **MUTLAKA BOŞ** olmalı
   - Eğer `server` veya başka bir klasör yazıyorsa, **SİLİN ve BOŞALTIN**
   - Bu çok önemli! Root directory boş olmalı

3. **Framework Preset:**
   - Framework Preset: **Vite** olarak seçin
   - Veya "Other" seçip manuel ayarlayın

4. **Build & Output Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install --legacy-peer-deps`

5. **Deploy:**
   - Ayarları kaydedin
   - Yeni bir deployment başlatın

### Alternatif: Vercel CLI ile Deploy

```bash
npm i -g vercel
cd c:\Users\ALI\Downloads\meetupapp\vibe-connect-main
vercel --prod
```

## Netlify Deployment Sorunu Çözümü

### Netlify Dashboard Ayarları:

1. **Netlify Dashboard'a gidin:**
   - https://app.netlify.com
   - Projenizi seçin
   - **Site settings** → **Build & deploy**

2. **Base directory Ayarını Kontrol Edin:**
   - "Base directory" alanı **MUTLAKA BOŞ** olmalı
   - Eğer bir şey yazıyorsa, **SİLİN ve BOŞALTIN**

3. **Build settings:**
   - Build command: `npm install --legacy-peer-deps && npm run build`
   - Publish directory: `dist`
   - Base directory: **BOŞ** (hiçbir şey yazmayın)

4. **Environment variables:**
   - Gerekli environment variable'ları ekleyin (varsa)

5. **Deploy:**
   - Ayarları kaydedin
   - "Trigger deploy" → "Deploy site" butonuna tıklayın

### Netlify CLI ile Deploy

```bash
npm i -g netlify-cli
cd c:\Users\ALI\Downloads\meetupapp\vibe-connect-main
netlify deploy --prod
```

## Sorun Giderme

### Eğer hala `package.json` bulunamıyor hatası alıyorsanız:

1. **GitHub repo yapısını kontrol edin:**
   - GitHub'da repo'nuzu açın
   - `package.json` dosyasının root'ta olduğundan emin olun
   - Eğer bir alt klasördeyse, root'a taşıyın

2. **Yeni bir proje oluşturun:**
   - Vercel/Netlify'da mevcut projeyi silin
   - Yeni bir proje oluşturun
   - GitHub repo'nuzu bağlayın
   - Root directory'yi **BOŞ** bırakın

3. **Manuel deploy deneyin:**
   - CLI ile deploy edin (yukarıdaki komutlar)

## Notlar

- ✅ `package.json` root directory'de mevcut
- ✅ `netlify.toml` ve `vercel.json` yapılandırılmış
- ✅ Build command'lar doğru
- ⚠️ **Root Directory ayarı dashboard'da BOŞ olmalı**
