# OAuth Hızlı Başlangıç Rehberi

Bu rehber, Google ve Apple OAuth'u hızlıca çalıştırmanız için adım adım talimatlar içerir.

## 🚀 Hızlı Başlangıç (5 Dakika)

### 1. Google OAuth (En Kolay)

#### Adımlar:

1. **Google Cloud Console'a gidin:**
   - https://console.cloud.google.com/
   - Yeni proje oluşturun veya mevcut projeyi seçin

2. **OAuth Consent Screen:**
   - Sol menü: **APIs & Services** > **OAuth consent screen**
   - **External** seçin > **Create**
   - **App name**: Vibe Connect
   - **User support email**: E-posta adresiniz
   - **Developer contact**: E-posta adresiniz
   - **Save and Continue** (3 kez tıklayın)

3. **Credentials Oluştur:**
   - Sol menü: **APIs & Services** > **Credentials**
   - **+ CREATE CREDENTIALS** > **OAuth client ID**
   - **Application type**: Web application
   - **Name**: Vibe Connect
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:5173
     ```
   - **Authorized redirect URIs**: 
     ```
     http://localhost:5173
     ```
   - **CREATE** > **Client ID** ve **Client Secret**'ı kopyalayın

4. **.env Dosyasına Ekleyin:**

   `server/.env` dosyasına:
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

   `src/.env` veya `.env.local` dosyasına (frontend için):
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

5. **Backend'i Yeniden Başlatın:**
   ```bash
   cd server
   npm run dev
   ```

6. **Frontend'i Başlatın:**
   ```bash
   npm run dev
   ```

7. **Test Edin:**
   - Login/Onboarding sayfasına gidin
   - "Continue with Google" butonuna tıklayın
   - Google hesabınızı seçin
   - Başarılı giriş yapılmalı! ✅

---

### 2. Apple OAuth (Daha Karmaşık)

**⚠️ Not:** Apple OAuth için ücretli Apple Developer hesabı ($99/yıl) gereklidir.

#### Adımlar:

1. **Apple Developer Portal:**
   - https://developer.apple.com/account/
   - Giriş yapın

2. **Service ID Oluştur:**
   - **Certificates, Identifiers & Profiles** > **Identifiers**
   - **+** > **Services IDs** > **Continue**
   - **Description**: Vibe Connect Web
   - **Identifier**: `com.vibeconnect.web`
   - **Continue** > **Register**
   - **Sign In with Apple** seçin > **Configure**
   - **Primary App ID**: (varsa seçin, yoksa oluşturun)
   - **Website URLs**:
     - **Domains and Subdomains**: `localhost`
     - **Return URLs**: `http://localhost:5173`
   - **Save** > **Continue** > **Register**

3. **Key Oluştur:**
   - **Keys** > **+**
   - **Key Name**: Vibe Connect Key
   - **Sign In with Apple** seçin > **Configure**
   - **Primary App ID**: App ID'nizi seçin
   - **Save** > **Continue** > **Register**
   - **Download** (.p8 dosyası - sadece bir kez indirilebilir!)
   - **Key ID**'yi not edin

4. **.env Dosyasına Ekleyin:**

   `server/.env` dosyasına:
   ```env
   APPLE_CLIENT_ID=com.vibeconnect.web
   APPLE_TEAM_ID=your-team-id-here
   APPLE_KEY_ID=your-key-id-here
   APPLE_PRIVATE_KEY_PATH=./apple-auth-key.p8
   ```

   `src/.env` veya `.env.local` dosyasına:
   ```env
   VITE_APPLE_CLIENT_ID=com.vibeconnect.web
   ```

5. **.p8 Dosyasını Kopyalayın:**
   - İndirdiğiniz `.p8` dosyasını `server` klasörüne kopyalayın
   - Dosya adını `apple-auth-key.p8` olarak değiştirin

6. **Backend'i Yeniden Başlatın**

7. **Test Edin:**
   - Login/Onboarding sayfasına gidin
   - "Continue with Apple" butonuna tıklayın
   - Apple ID ile giriş yapın
   - Başarılı giriş yapılmalı! ✅

---

## 📝 .env Dosyası Örneği

### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/ulikme?schema=public"
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# Apple OAuth (Opsiyonel)
APPLE_CLIENT_ID=com.vibeconnect.web
APPLE_TEAM_ID=ABCD1234EF
APPLE_KEY_ID=XYZ123ABC
APPLE_PRIVATE_KEY_PATH=./apple-auth-key.p8
```

### Frontend (`.env.local` veya `src/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
VITE_APPLE_CLIENT_ID=com.vibeconnect.web
```

---

## 🔧 Sorun Giderme

### Google OAuth Hataları:

**"redirect_uri_mismatch":**
- Google Cloud Console'da **Authorized redirect URIs** listesini kontrol edin
- `http://localhost:5173` ekli olmalı

**"invalid_client":**
- `GOOGLE_CLIENT_ID` ve `VITE_GOOGLE_CLIENT_ID` aynı olmalı
- Tırnak işareti olmadan yazın

**"access_denied":**
- OAuth Consent Screen'de test kullanıcıları ekleyin
- App "Testing" modunda olmalı

### Apple OAuth Hataları:

**"invalid_client":**
- `APPLE_CLIENT_ID` (Service ID) doğru mu kontrol edin
- Frontend ve backend'de aynı olmalı

**"invalid_grant":**
- `.p8` dosyasının path'i doğru mu kontrol edin
- Key ID ve Team ID doğru mu kontrol edin

---

## ✅ Test Checklist

- [ ] Google Cloud Console'da OAuth credentials oluşturuldu
- [ ] `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` `.env` dosyasına eklendi
- [ ] `VITE_GOOGLE_CLIENT_ID` frontend `.env` dosyasına eklendi
- [ ] Backend yeniden başlatıldı
- [ ] Frontend yeniden başlatıldı
- [ ] Google butonu çalışıyor
- [ ] Apple credentials eklendi (opsiyonel)
- [ ] Apple butonu çalışıyor (opsiyonel)

---

## 📚 Detaylı Rehber

Daha detaylı bilgi için `OAUTH_KURULUM.md` dosyasına bakın.

---

**Sorularınız için:** GitHub Issues veya dokümantasyonu kontrol edin.
