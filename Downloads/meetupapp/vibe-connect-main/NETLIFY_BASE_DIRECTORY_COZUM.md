# Netlify Base Directory Sorunu Çözümü

## Sorun
```
npm error path /opt/build/repo/package.json
npm error errno -2
npm error enoent Could not read package.json
```

Netlify `package.json` dosyasını bulamıyor çünkü yanlış dizinde arıyor.

## Çözüm: Netlify Dashboard Ayarları

### Adım 1: Netlify Dashboard'a Gidin
1. https://app.netlify.com
2. Site'inizi seçin
3. **Site settings** → **Build & deploy** → **Build settings**

### Adım 2: Base Directory Ayarını Kontrol Edin

**ÖNEMLİ:** Base directory ayarını kontrol edin:

**Eğer GitHub repo root'unda `package.json` varsa:**
- **Base directory:** BOŞ bırakın (hiçbir şey yazmayın)

**Eğer GitHub repo'da proje bir alt klasördeyse (örn: `Downloads/meetupapp/vibe-connect-main`):**
- **Base directory:** `Downloads/meetupapp/vibe-connect-main` yazın

### Adım 3: Build Settings'i Kontrol Edin

**Build command:**
```
npm install --legacy-peer-deps && npm run build
```

**Publish directory:**
```
dist
```

**Base directory:**
- GitHub repo root'unda `package.json` varsa: **BOŞ**
- Alt klasördeyse: Klasör yolunu yazın

### Adım 4: Ayarları Kaydedin ve Deploy Edin

1. Ayarları kaydedin
2. **Deploys** sekmesine gidin
3. **Trigger deploy** → **Deploy site** butonuna tıklayın

## GitHub Repo Yapısını Kontrol Etme

GitHub'da repo'nuzu açın ve kontrol edin:

1. https://github.com/44technology/vibe-connect
2. Repo root'unda `package.json` var mı?
3. Eğer yoksa, hangi klasörde?

## Alternatif Çözüm: netlify.toml Güncelleme

Eğer proje GitHub'da bir alt klasördeyse, `netlify.toml` dosyasını güncelleyin:

```toml
[build]
  base = "Downloads/meetupapp/vibe-connect-main"  # GitHub'daki klasör yolu
  command = "npm install --legacy-peer-deps && npm run build"
  publish = "dist"
```

**NOT:** Base directory GitHub repo içindeki yol olmalı, lokal yol değil!

## Hızlı Test

GitHub'da repo'nuzu açın:
- https://github.com/44technology/vibe-connect

Eğer root'ta `package.json` görüyorsanız:
- Netlify Base directory: **BOŞ**

Eğer `package.json` bir alt klasördeyse:
- Netlify Base directory: O klasörün yolunu yazın
