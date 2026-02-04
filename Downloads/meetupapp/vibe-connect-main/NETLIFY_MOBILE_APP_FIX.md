# Netlify Mobil Uygulama - Hızlı Düzeltme

## Sorun
```
npm error path /opt/build/repo/package.json
npm error errno -2
npm error enoent Could not read package.json
```

Netlify root dizinde `package.json` bulamıyor. Bu, mobil uygulama Netlify site'ında Base directory ayarının yanlış olduğunu gösterir.

## Çözüm: Netlify Dashboard Ayarları (Mobil Uygulama)

### Adım 1: Netlify Dashboard'a Gidin
1. https://app.netlify.com
2. **Mobil uygulama site'ınızı seçin** (ulikme1 veya mobil app için oluşturduğunuz site)

### Adım 2: Build Settings'i Düzeltin
**Site settings → Build & deploy → Build settings:**

#### Base directory:
```
(BOŞ BIRAKIN - hiçbir şey yazmayın)
```
**ÖNEMLİ:** Mobil uygulama root'tan deploy edilir, Base directory BOŞ olmalı!

#### Build command:
```
npm install --legacy-peer-deps && npm run build
```

#### Publish directory:
```
dist
```

### Adım 3: Environment Variables (Gerekirse)
**Site settings → Environment variables:**
- `NODE_VERSION` = `18` (eğer yoksa ekleyin)

### Adım 4: Save ve Deploy
1. **Save changes** butonuna tıklayın
2. **Deploys** sekmesine gidin
3. **Trigger deploy** → **Clear cache and deploy site**

## Kontrol Listesi

- [ ] Base directory: **BOŞ** (hiçbir şey yazılmamalı)
- [ ] Build command: `npm install --legacy-peer-deps && npm run build`
- [ ] Publish directory: `dist`
- [ ] Node version: 18
- [ ] GitHub repository: `44technology/vibe-connect`
- [ ] Branch: `main`
- [ ] Cache temizlendi
- [ ] Yeni deploy başlatıldı

## Özet

**Mobil uygulama için:**
- Base directory: **BOŞ** (root'tan deploy)
- Build command: `npm install --legacy-peer-deps && npm run build`
- Publish directory: `dist`

**Admin portal için (ayrı site):**
- Base directory: `admin-portal`
- Build command: `npm install --legacy-peer-deps && npm run build`
- Publish directory: `dist`

## Not

İki ayrı Netlify site'ınız var:
1. **Mobil uygulama** - Base directory BOŞ
2. **Admin portal** - Base directory `admin-portal`

Her ikisi de aynı GitHub repository'den deploy edilir ama farklı ayarlarla.
