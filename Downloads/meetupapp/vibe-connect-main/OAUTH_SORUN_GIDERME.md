# OAuth "Missing required parameter client_id" Hatası Çözümü

Bu hata, Google Client ID'nin frontend'de okunamadığı anlamına gelir.

## 🔍 Sorunun Nedenleri

1. `.env` dosyası doğru yerde değil
2. Environment variable adı yanlış
3. Frontend yeniden başlatılmamış
4. `.env` dosyası formatı yanlış

## ✅ Çözüm Adımları

### 1. .env Dosyasının Yeri

Frontend için `.env` dosyası **proje root klasöründe** (package.json'un olduğu yerde) olmalı:

```
vibe-connect-main/
├── package.json
├── .env.local          ← BURAYA
├── .env                ← VEYA BURAYA
├── src/
└── server/
```

**NOT:** `server/.env` dosyası backend için, frontend için ayrı bir `.env` dosyası gerekir!

### 2. .env Dosyası İçeriği

Proje root klasöründe `.env.local` veya `.env` dosyası oluşturun:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
VITE_APPLE_CLIENT_ID=com.vibeconnect.web
VITE_API_URL=http://localhost:5000/api
```

**ÖNEMLİ:**
- `VITE_` prefix'i **mutlaka** olmalı (Vite için gerekli)
- Tırnak işareti **olmamalı**
- Boşluk olmamalı: `VITE_GOOGLE_CLIENT_ID=value` (doğru)
- Yanlış: `VITE_GOOGLE_CLIENT_ID = "value"` (yanlış)

### 3. Frontend'i Yeniden Başlatın

Environment variable'lar sadece uygulama başlangıcında yüklenir. Değişiklikten sonra **mutlaka** yeniden başlatın:

```bash
# Terminal'de Ctrl+C ile durdurun
# Sonra tekrar başlatın:
npm run dev
```

### 4. Doğrulama

Browser console'da kontrol edin:

```javascript
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
```

Eğer `undefined` görüyorsanız:
- `.env` dosyası doğru yerde mi?
- Dosya adı `.env` veya `.env.local` mi?
- `VITE_` prefix'i var mı?
- Frontend yeniden başlatıldı mı?

## 📝 Örnek .env Dosyası

### Frontend (root klasöründe `.env.local`):

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com

# Apple OAuth (opsiyonel)
VITE_APPLE_CLIENT_ID=com.vibeconnect.web

# API URL
VITE_API_URL=http://localhost:5000/api
```

### Backend (`server/.env`):

```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# Apple OAuth (opsiyonel)
APPLE_CLIENT_ID=com.vibeconnect.web
APPLE_TEAM_ID=ABCD1234EF
APPLE_KEY_ID=XYZ123ABC
APPLE_PRIVATE_KEY_PATH=./apple-auth-key.p8

# Diğer ayarlar
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/ulikme?schema=public"
JWT_SECRET=your-jwt-secret
```

## 🔧 Hızlı Test

1. Root klasöründe `.env.local` dosyası oluşturun
2. İçine `VITE_GOOGLE_CLIENT_ID=test-id` yazın
3. Frontend'i durdurun (Ctrl+C)
4. Frontend'i yeniden başlatın: `npm run dev`
5. Browser console'da: `console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)` çalıştırın
6. `test-id` görünmeli

## ⚠️ Yaygın Hatalar

### Hata 1: "client_id is undefined"
**Çözüm:** `.env` dosyası root klasöründe değil veya `VITE_` prefix'i eksik

### Hata 2: "client_id is empty string"
**Çözüm:** `.env` dosyasında değer yanlış yazılmış veya tırnak içinde

### Hata 3: Değişiklikler yansımıyor
**Çözüm:** Frontend yeniden başlatılmamış

## 📞 Hala Çalışmıyorsa

1. `.env.local` dosyasını silin, `.env` olarak yeniden oluşturun
2. Vite cache'ini temizleyin:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```
3. Browser cache'ini temizleyin (Ctrl+Shift+Delete)
4. Hard refresh yapın (Ctrl+Shift+R)

## ✅ Doğru Kurulum Kontrol Listesi

- [ ] `.env.local` veya `.env` dosyası **root klasöründe** (package.json'un yanında)
- [ ] `VITE_GOOGLE_CLIENT_ID=...` formatında yazılmış
- [ ] Tırnak işareti yok
- [ ] Boşluk yok (`=` işaretinin etrafında)
- [ ] Frontend yeniden başlatıldı
- [ ] Browser console'da `import.meta.env.VITE_GOOGLE_CLIENT_ID` değeri görünüyor
