# 🚀 Netlify Quick Start - 5 Dakikada Deploy!

## ⚡ Hızlı Adımlar

### 1. Backend'i Deploy Edin (Railway - Önerilen)

```bash
# Railway'a gidin: https://railway.app
# 1. GitHub ile giriş yapın
# 2. "New Project" > "Deploy from GitHub repo"
# 3. Repo'nuzu seçin
# 4. "Add Service" > "GitHub Repo" > backend klasörünü seçin
# 5. Environment variables ekleyin:
#    - PORT=3000
#    - GOOGLE_CLOUD_VISION_API_KEY=your-key (varsa)
# 6. Deploy edin ve URL'i kopyalayın (örn: https://scan-good-backend.railway.app)
```

### 2. Netlify'a Deploy Edin

```bash
# 1. https://app.netlify.com adresine gidin
# 2. "Add new site" > "Import an existing project"
# 3. GitHub repo'nuzu seçin
# 4. Build settings:
#    - Build command: npm run build:web
#    - Publish directory: web-build
# 5. Environment variables ekleyin:
#    - BACKEND_URL=https://your-backend.railway.app
#    - NODE_VERSION=18
# 6. "Deploy site" tıklayın!
```

### 3. ✅ Tamamlandı!

Deploy tamamlandıktan sonra:
- Site URL'iniz: `https://your-site.netlify.app`
- API otomatik olarak `/api/*` path'inden çalışacak

---

## 📝 Detaylı Rehber

Detaylı adımlar için `NETLIFY_DEPLOY.md` dosyasına bakın.

---

## 🔧 Sorun mu var?

### Build Hatası?
- `npm install` çalıştırın
- `expo export:web` komutunu manuel test edin

### API Çalışmıyor?
- Backend URL'inin doğru olduğundan emin olun
- Netlify Functions loglarını kontrol edin
- CORS ayarlarını kontrol edin

### Sayfa Açılmıyor?
- Browser console'da hataları kontrol edin
- Netlify deploy loglarını kontrol edin

---

## 🎉 Başarılar!

Deploy tamamlandıktan sonra uygulamanız canlıda olacak! 🚀

