# 🚀 Hemen Deploy Et!

## ⚡ Hızlı Adımlar

### 1️⃣ Backend'i Deploy Edin (Railway - 5 dakika)

1. **Railway'a gidin**: https://railway.app
2. **"Start a New Project"** tıklayın
3. **"Deploy from GitHub repo"** seçin
4. GitHub hesabınızı bağlayın ve repo'nuzu seçin
5. **"Add Service"** > **"GitHub Repo"** tıklayın
6. **Root Directory**: `backend` yazın
7. **Environment Variables** ekleyin:
   ```
   PORT=3000
   GOOGLE_CLOUD_VISION_API_KEY=your-key-here (varsa)
   ```
8. **Deploy** butonuna tıklayın
9. Deploy tamamlandığında **URL'i kopyalayın** (örn: `https://scan-good-backend.railway.app`)

### 2️⃣ Netlify'a Deploy Edin (5 dakika)

1. **Netlify'a gidin**: https://app.netlify.com
2. **"Add new site"** > **"Import an existing project"** tıklayın
3. **GitHub** seçin ve repo'nuzu seçin
4. **Build settings** yapılandırın:
   - **Build command**: `npm run build:web`
   - **Publish directory**: `web-build`
   - **Base directory**: (boş bırakın)
5. **"Show advanced"** tıklayın
6. **Environment variables** ekleyin:
   ```
   BACKEND_URL=https://your-backend.railway.app
   NODE_VERSION=18
   ```
   ⚠️ **ÖNEMLİ**: `BACKEND_URL` değişkenini Railway'dan aldığınız backend URL'i ile değiştirin!
7. **"Deploy site"** tıklayın
8. ⏳ 5-10 dakika bekleyin (ilk build biraz uzun sürebilir)

### 3️⃣ ✅ Tamamlandı!

Deploy tamamlandığında:
- Site URL'iniz: `https://your-site-name.netlify.app`
- API otomatik olarak çalışacak
- Her GitHub push'unda otomatik deploy olacak

---

## 🔍 Kontrol Listesi

Deploy sonrası kontrol edin:
- [ ] Site açılıyor mu?
- [ ] API istekleri çalışıyor mu? (Browser console'da kontrol edin)
- [ ] Hata var mı? (Browser console'da kontrol edin)

---

## 🐛 Sorun mu var?

### Build Hatası?
- Netlify deploy loglarını kontrol edin
- `npm run build:web` komutunu local'de test edin

### API Çalışmıyor?
- Backend URL'inin doğru olduğundan emin olun
- Netlify environment variables'ı kontrol edin
- Backend'in çalıştığından emin olun (Railway dashboard'dan kontrol edin)

### CORS Hatası?
- Backend CORS ayarları zaten yapıldı
- Backend'i yeniden deploy edin

---

## 📝 Notlar

- **İlk deploy**: 5-10 dakika sürebilir
- **Sonraki deploy'lar**: 2-3 dakika (sadece değişiklikler)
- **Otomatik deploy**: Her GitHub push'unda otomatik deploy olur
- **Preview URL**: Her pull request için preview URL oluşturulur

---

## 🎉 Başarılar!

Deploy tamamlandıktan sonra uygulamanız canlıda olacak! 🚀

**Sorularınız mı var?** `NETLIFY_DEPLOY.md` dosyasına bakın.

