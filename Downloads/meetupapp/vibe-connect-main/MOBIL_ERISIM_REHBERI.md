# Mobil Cihazdan Erişim Rehberi

Bu rehber, uygulamayı mobil cihazdan (telefon/tablet) erişilebilir hale getirmek için gerekli adımları açıklar.

## 🔧 Yapılandırma

### 1. Backend'i Network'te Erişilebilir Yapma

Backend'inizi local network'te erişilebilir hale getirmek için:

**Windows PowerShell'de:**
```powershell
# Backend'i 0.0.0.0'da başlat (tüm network interface'lerinde dinle)
cd server
$env:PORT=5000
npm run dev
```

**Veya package.json'da script ekleyin:**
```json
"dev:network": "cross-env PORT=5000 HOST=0.0.0.0 node --loader ts-node/esm src/index.ts"
```

### 2. Frontend'i Network'te Erişilebilir Yapma

**Vite config'i güncelleyin (`vite.config.ts`):**
```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0', // Tüm network interface'lerinde dinle
    port: 8080,
  },
})
```

**Veya komut satırından:**
```bash
npm run dev -- --host 0.0.0.0 --port 8080
```

### 3. IP Adresini Bulma

**Windows PowerShell'de:**
```powershell
ipconfig | findstr IPv4
```

**Linux/Mac'te:**
```bash
ifconfig | grep inet
# veya
ip addr show
```

Örnek çıktı: `192.168.4.117`

### 4. Mobil Cihazdan Erişim

1. **Aynı WiFi ağına bağlı olduğunuzdan emin olun**
2. **Mobil cihazınızın tarayıcısında şu adresi açın:**
   ```
   http://192.168.4.117:8080
   ```
   (IP adresinizi kullanın)

### 5. API URL Yapılandırması

Kod otomatik olarak mobil cihazdan erişildiğinde backend IP'sini tespit eder. Ancak manuel ayarlamak isterseniz:

**Frontend `.env.local` dosyasına:**
```env
VITE_API_URL=http://192.168.4.117:5000/api
VITE_BACKEND_PORT=5000
```

**Backend `server/.env` dosyasına:**
```env
CORS_ORIGIN=http://192.168.4.117:8080
```

## 🚀 Hızlı Başlatma

### Backend (Network'te):
```bash
cd server
npm run dev
# Backend http://192.168.4.117:5000 adresinde çalışacak
```

### Frontend (Network'te):
```bash
npm run dev -- --host 0.0.0.0 --port 8080
# Frontend http://192.168.4.117:8080 adresinde çalışacak
```

## ✅ Test Etme

1. **Bilgisayarınızın IP adresini bulun** (örn: `192.168.4.117`)
2. **Backend'i başlatın** (port 5000)
3. **Frontend'i network modunda başlatın** (port 8080)
4. **Mobil cihazınızda tarayıcıyı açın**
5. **`http://192.168.4.117:8080` adresine gidin**
6. **Sign up/Login yapmayı deneyin**

## 🔍 Sorun Giderme

### "Send Code" Çalışmıyor

**Sorun:** API URL'si localhost'a işaret ediyor

**Çözüm:**
1. Browser console'da `window.location.hostname` değerini kontrol edin
2. `.env.local` dosyasına `VITE_API_URL=http://192.168.4.117:5000/api` ekleyin
3. Frontend'i yeniden başlatın

### CORS Hatası

**Sorun:** Backend mobil cihazdan gelen istekleri reddediyor

**Çözüm:**
1. Backend `server/.env` dosyasına `CORS_ORIGIN=http://192.168.4.117:8080` ekleyin
2. Backend'i yeniden başlatın
3. Kod zaten development modunda tüm local network IP'lerine izin veriyor

### Bağlantı Hatası

**Sorun:** Mobil cihaz backend'e bağlanamıyor

**Çözüm:**
1. Bilgisayar ve mobil cihaz aynı WiFi ağında mı kontrol edin
2. Windows Firewall'da port 5000'in açık olduğundan emin olun
3. Backend'in `0.0.0.0`'da dinlediğinden emin olun (sadece localhost değil)

### Port Erişilemiyor

**Sorun:** Port 8080 veya 5000 erişilemiyor

**Çözüm:**
1. Windows Firewall ayarlarını kontrol edin
2. Antivirus yazılımının portları engellemediğinden emin olun
3. Farklı bir port deneyin

## 📱 Mobil Test İçin Öneriler

1. **Chrome DevTools Remote Debugging:**
   - Chrome'da `chrome://inspect` açın
   - Mobil cihazınızı USB ile bağlayın
   - Console'u görüntüleyin

2. **Network Tab:**
   - Mobil cihazda Network tab'ını açın
   - API isteklerinin hangi URL'ye gittiğini kontrol edin
   - Hata mesajlarını inceleyin

3. **Test OTP Kodları:**
   - OTP gelmezse test kodlarını kullanın: `123456`, `000000`

## 🔒 Güvenlik Notları

⚠️ **ÖNEMLİ:** Bu yapılandırma sadece development/test için uygundur. Production'da:

1. HTTPS kullanın
2. CORS'u sadece güvenilir domain'lere izin verecek şekilde yapılandırın
3. API URL'lerini environment variable'larla yönetin
4. Firewall kurallarını sıkılaştırın

## 📝 Özet

1. ✅ Backend'i `0.0.0.0`'da başlatın
2. ✅ Frontend'i `--host 0.0.0.0` ile başlatın
3. ✅ IP adresinizi bulun
4. ✅ Mobil cihazdan `http://YOUR_IP:8080` adresine gidin
5. ✅ Test edin!
