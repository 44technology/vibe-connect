# Google OAuth "redirect_uri_mismatch" Hatası Çözümü

Bu hata, Google Cloud Console'da yapılandırılan redirect URI'lerin uygulamanızla eşleşmediğini gösterir.

## 🔍 Sorunun Nedeni

Google OAuth2 popup flow kullanırken, Google Cloud Console'da redirect URI tanımlanmış olabilir, ancak popup flow için redirect URI gerekmez. Bu uyumsuzluk hataya neden olur.

## ✅ Çözüm 1: Google Cloud Console'da Redirect URI'leri Düzeltme

### Adımlar:

1. **Google Cloud Console'a gidin:**
   - https://console.cloud.google.com/
   - Projenizi seçin

2. **OAuth 2.0 Credentials sayfasına gidin:**
   - Sol menü: **APIs & Services** > **Credentials**
   - OAuth 2.0 Client ID'nize tıklayın

3. **Authorized redirect URIs bölümünü kontrol edin:**
   - Eğer redirect URI'ler varsa, şunları ekleyin:
     ```
     http://localhost:5173
     http://localhost:5174
     http://localhost:5173/auth/google/callback
     http://localhost:5174/auth/google/callback
     ```
   - **VEYA** tüm redirect URI'leri silin (popup flow için gerekli değil)

4. **Kaydedin:**
   - **SAVE** butonuna tıklayın

5. **Birkaç dakika bekleyin:**
   - Değişikliklerin yayılması için 1-2 dakika bekleyin

## ✅ Çözüm 2: One Tap / Button Flow Kullanma (Önerilen)

Kod zaten güncellendi ve artık One Tap / Button flow kullanıyor. Bu yöntem redirect URI gerektirmez.

### Nasıl Çalışır:

1. Kullanıcı "Continue with Google" butonuna tıklar
2. Google One Tap otomatik olarak gösterilir (eğer kullanıcı daha önce giriş yaptıysa)
3. Veya bir Google Sign-In button'u gösterilir
4. Kullanıcı Google hesabını seçer
5. ID token alınır ve backend'e gönderilir
6. Backend token'ı doğrular ve kullanıcıyı oluşturur/günceller

## 🔧 Google Cloud Console Yapılandırması

### OAuth Consent Screen:

1. **APIs & Services** > **OAuth consent screen**
2. **Authorized domains** bölümüne:
   ```
   localhost
   ```
   ekleyin

### OAuth 2.0 Credentials:

1. **APIs & Services** > **Credentials**
2. OAuth 2.0 Client ID'nize tıklayın
3. **Authorized JavaScript origins** bölümüne:
   ```
   http://localhost:5173
   http://localhost:5174
   ```
   ekleyin

4. **Authorized redirect URIs** bölümü:
   - **Ya boş bırakın** (popup/One Tap için gerekli değil)
   - **Ya da şunları ekleyin:**
     ```
     http://localhost:5173
     http://localhost:5174
     ```

## 🧪 Test Etme

1. **Backend'i yeniden başlatın:**
   ```bash
   cd server
   npm run dev
   ```

2. **Frontend'i yeniden başlatın:**
   ```bash
   npm run dev
   ```

3. **Browser cache'ini temizleyin:**
   - Ctrl+Shift+Delete
   - Veya Hard Refresh: Ctrl+Shift+R

4. **Test edin:**
   - Login/Onboarding sayfasına gidin
   - "Continue with Google" butonuna tıklayın
   - Google One Tap veya button görünmeli
   - Google hesabınızı seçin
   - Başarılı giriş yapılmalı

## ⚠️ Yaygın Hatalar

### Hata 1: "redirect_uri_mismatch"
**Çözüm:** Google Cloud Console'da redirect URI'leri kontrol edin veya silin

### Hata 2: "invalid_client"
**Çözüm:** Client ID'nin doğru olduğundan emin olun

### Hata 3: "access_denied"
**Çözüm:** OAuth Consent Screen'de test kullanıcıları ekleyin

## 📝 Doğru Yapılandırma Özeti

### Google Cloud Console:

**OAuth Consent Screen:**
- Authorized domains: `localhost`

**OAuth 2.0 Credentials:**
- Authorized JavaScript origins:
  ```
  http://localhost:5173
  http://localhost:5174
  ```
- Authorized redirect URIs: **BOŞ BIRAKIN** (One Tap/Button flow için gerekli değil)
  - Veya şunları ekleyin:
    ```
    http://localhost:5173
    http://localhost:5174
    ```

### .env Dosyaları:

**Frontend (.env.local):**
```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

**Backend (server/.env):**
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## ✅ Kontrol Listesi

- [ ] Google Cloud Console'da OAuth 2.0 Client ID oluşturuldu
- [ ] Authorized JavaScript origins'e `http://localhost:5173` eklendi
- [ ] Authorized redirect URIs boş bırakıldı veya doğru URI'ler eklendi
- [ ] OAuth Consent Screen'de `localhost` authorized domain olarak eklendi
- [ ] Frontend `.env.local` dosyasına `VITE_GOOGLE_CLIENT_ID` eklendi
- [ ] Backend `server/.env` dosyasına `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` eklendi
- [ ] Backend ve frontend yeniden başlatıldı
- [ ] Browser cache temizlendi

## 🚀 Hızlı Çözüm

Eğer hala hata alıyorsanız:

1. Google Cloud Console'da OAuth 2.0 Client ID'nizi açın
2. **Authorized redirect URIs** bölümündeki **TÜM** URI'leri silin
3. **SAVE** butonuna tıklayın
4. 1-2 dakika bekleyin
5. Frontend'i yeniden başlatın
6. Browser cache'ini temizleyin
7. Tekrar deneyin

Bu, One Tap/Button flow için yeterli olacaktır çünkü bu yöntem redirect URI gerektirmez.
