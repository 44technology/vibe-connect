# Netlify Deployment Rehberi - Scan Good App

Bu rehber, Scan Good uygulamasını Netlify'a deploy etmek için adım adım talimatlar içerir.

## 🎯 Deployment Stratejisi

Bu hybrid proje için iki seçenek var:

### Seçenek 1: Frontend Netlify + Backend Ayrı (Önerilen)
- **Frontend**: Netlify'a deploy edilir (Expo Web)
- **Backend**: Railway, Render veya Heroku'ya deploy edilir
- **Avantaj**: Daha esnek, backend'i ayrı yönetebilirsiniz

### Seçenek 2: Frontend + Backend Proxy Netlify
- **Frontend**: Netlify'a deploy edilir
- **Backend**: Netlify Functions ile proxy edilir (veya backend'i de Netlify'a deploy edersiniz)
- **Avantaj**: Tek platform, daha basit yönetim

---

## 📋 Ön Hazırlık

### 1. GitHub Repository Hazırlayın

```bash
# Git repository oluşturun (eğer yoksa)
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/scan-good-app.git
git push -u origin main
```

### 2. Backend'i Deploy Edin (Seçenek 1 için)

Backend'i Railway, Render veya Heroku'ya deploy edin:

#### Railway ile (Önerilen):
1. https://railway.app adresine gidin
2. GitHub repo'nuzu bağlayın
3. `backend` klasörünü seçin
4. Environment variables ekleyin:
   - `PORT=3000`
   - `GOOGLE_CLOUD_VISION_API_KEY=your-key` (varsa)
5. Deploy edin
6. Backend URL'inizi kopyalayın (örn: `https://scan-good-backend.railway.app`)

#### Render ile:
1. https://render.com adresine gidin
2. "New Web Service" seçin
3. GitHub repo'nuzu bağlayın
4. Root Directory: `backend`
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Environment variables ekleyin
8. Deploy edin

---

## 🚀 Netlify Deployment

### Adım 1: Netlify Hesabı Oluşturun

1. https://app.netlify.com adresine gidin
2. "Sign up" ile GitHub hesabınızla giriş yapın

### Adım 2: Yeni Site Oluşturun

1. Netlify dashboard'da "Add new site" > "Import an existing project" tıklayın
2. GitHub'ı seçin ve repository'nizi seçin
3. Build settings'i yapılandırın:
   - **Build command**: `npm run build:web`
   - **Publish directory**: `web-build`
   - **Base directory**: (boş bırakın, root'tan build alacak)

### Adım 3: Environment Variables Ekleyin

Netlify dashboard'da:
1. Site Settings > Environment variables
2. Şu değişkenleri ekleyin:

```
BACKEND_URL=https://your-backend-url.railway.app
NODE_VERSION=18
EXPO_USE_METRO=true
```

**Önemli**: `BACKEND_URL` değişkenini backend'inizin gerçek URL'i ile değiştirin!

### Adım 4: API URL'ini Güncelleyin

`src/services/apiService.js` dosyasını güncelleyin:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'https://diagenetic-berry-pompously.ngrok-free.dev/api' 
  : process.env.REACT_APP_API_URL || 'https://your-backend-url.railway.app/api';
```

Veya Netlify environment variable kullanın:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'https://diagenetic-berry-pompously.ngrok-free.dev/api' 
  : (typeof window !== 'undefined' && window.location.origin.includes('netlify.app'))
    ? '/api'  // Netlify Functions proxy kullan
    : 'https://your-backend-url.railway.app/api';
```

### Adım 5: Deploy!

1. "Deploy site" butonuna tıklayın
2. Netlify otomatik olarak build yapacak
3. Deploy tamamlandığında size bir URL verecek (örn: `https://scan-good-app.netlify.app`)

---

## 🔧 Netlify Functions ile Backend Proxy (Opsiyonel)

Eğer backend'i Netlify Functions ile proxy etmek isterseniz:

### 1. Netlify Functions'ı Aktif Edin

`netlify.toml` dosyasında zaten yapılandırılmış. Sadece `BACKEND_URL` environment variable'ını ekleyin.

### 2. API Service'i Güncelleyin

`src/services/apiService.js`:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'https://diagenetic-berry-pompously.ngrok-free.dev/api' 
  : '/api';  // Netlify Functions proxy kullan
```

### 3. Redirect Ekle

`netlify.toml` dosyasında redirect zaten var, sadece uncomment edin:

```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true
```

---

## 📱 Mobil Uygulama için

Netlify sadece web versiyonu için. Mobil uygulama için:

### Expo EAS Build:
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios
```

---

## ✅ Deploy Sonrası Kontroller

1. **Site URL'i test edin**: `https://your-site.netlify.app`
2. **API bağlantısını test edin**: Network tab'ında API isteklerini kontrol edin
3. **Console hatalarını kontrol edin**: Browser console'da hata var mı bakın
4. **Mobile responsive**: Farklı ekran boyutlarında test edin

---

## 🔒 Güvenlik

### CORS Ayarları

Backend'de (`backend/server.js`) CORS ayarlarını güncelleyin:

```javascript
app.use(cors({
  origin: [
    'http://localhost:8081',
    'https://your-site.netlify.app',
    'https://*.netlify.app'
  ],
  credentials: true
}));
```

### Environment Variables

- **Asla** API key'leri kod içine yazmayın
- Netlify environment variables kullanın
- `.env` dosyalarını `.gitignore`'a ekleyin

---

## 🐛 Sorun Giderme

### Build Hatası

1. **"Command failed"**: `package.json`'da build script'inin doğru olduğundan emin olun
2. **"Module not found"**: Dependencies'leri kontrol edin: `npm install`
3. **"Expo not found"**: `npm install expo` çalıştırın

### API Bağlantı Hatası

1. **CORS hatası**: Backend CORS ayarlarını kontrol edin
2. **404 Not Found**: API URL'inin doğru olduğundan emin olun
3. **Network error**: Backend'in çalıştığından emin olun

### Deploy Sonrası Sayfa Açılmıyor

1. **404 hatası**: `netlify.toml`'daki redirect ayarlarını kontrol edin
2. **Beyaz sayfa**: Browser console'da JavaScript hatalarını kontrol edin
3. **Assets yüklenmiyor**: Build output'u kontrol edin

---

## 📊 Monitoring

Netlify dashboard'da:
- **Deploy logs**: Her deploy'ın loglarını görebilirsiniz
- **Analytics**: Site trafiğini izleyebilirsiniz
- **Functions logs**: Netlify Functions kullanıyorsanız logları görebilirsiniz

---

## 🔄 Continuous Deployment

Netlify otomatik olarak:
- GitHub'a push yaptığınızda yeni deploy başlatır
- Her commit için preview URL oluşturur
- Production branch (genellikle `main`) için otomatik deploy yapar

---

## 📝 Notlar

- **Build süresi**: İlk build 5-10 dakika sürebilir
- **Free tier**: Netlify free tier'da 100GB bandwidth ve 300 build minutes/ay
- **Custom domain**: Netlify'da custom domain ekleyebilirsiniz
- **HTTPS**: Netlify otomatik olarak HTTPS sağlar

---

## 🎉 Başarılı Deploy!

Deploy tamamlandıktan sonra:
1. Site URL'inizi paylaşın
2. QR kod oluşturun (mobil test için)
3. Analytics'i aktif edin
4. Custom domain ekleyin (opsiyonel)

**Deploy URL'iniz**: `https://your-site.netlify.app`

Başarılar! 🚀

