# GitHub Push Gerekli - Admin Portal

## Sorun
Netlify build sırasında `admin-portal` klasörünü bulamıyor çünkü değişiklikler GitHub'a push edilmemiş.

## Çözüm: Değişiklikleri GitHub'a Push Edin

### Adım 1: Değişiklikleri Stage'e Ekleyin

```bash
cd c:\Users\ALI\Downloads\meetupapp\vibe-connect-main
git add admin-portal/
```

### Adım 2: Commit Edin

```bash
git commit -m "Fix: Admin portal Netlify configuration and features"
```

### Adım 3: GitHub'a Push Edin

```bash
git push origin main
```

(veya hangi branch kullanıyorsanız: `git push origin <branch-name>`)

### Adım 4: Netlify'da Deploy Kontrolü

1. Netlify Dashboard'a gidin
2. Deploys sekmesine bakın
3. Yeni commit'i görmelisiniz
4. Otomatik deploy başlamalı

## Hızlı Komutlar (Tek Seferde)

```bash
cd c:\Users\ALI\Downloads\meetupapp\vibe-connect-main
git add admin-portal/
git commit -m "Fix: Admin portal Netlify deployment configuration"
git push origin main
```

## Kontrol

Push sonrası GitHub'da kontrol edin:
- https://github.com/<your-username>/<your-repo>
- `admin-portal` klasörünün var olduğunu kontrol edin
- `admin-portal/package.json` dosyasının var olduğunu kontrol edin
- `admin-portal/netlify.toml` dosyasının var olduğunu kontrol edin

## Netlify Ayarları (Push Sonrası)

Push sonrası Netlify Dashboard'da:

1. **Base directory:** BOŞ BIRAKIN
2. **Build command:** `cd admin-portal && npm install --legacy-peer-deps && npm run build`
3. **Publish directory:** `admin-portal/dist`

Deploy edin!
