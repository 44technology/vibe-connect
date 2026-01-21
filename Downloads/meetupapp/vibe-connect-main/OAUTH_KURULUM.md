# Google ve Apple OAuth Kurulum Rehberi

Bu rehber, Google ve Apple OAuth credentials'larını nasıl alacağınızı ve uygulamaya nasıl entegre edeceğinizi açıklar.

## 📋 İçindekiler

1. [Google OAuth Kurulumu](#google-oauth-kurulumu)
2. [Apple OAuth Kurulumu](#apple-oauth-kurulumu)
3. [Backend Yapılandırması](#backend-yapılandırması)
4. [Frontend Yapılandırması](#frontend-yapılandırması)
5. [Test Etme](#test-etme)

---

## 🔵 Google OAuth Kurulumu

### Adım 1: Google Cloud Console'a Giriş

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Google hesabınızla giriş yapın
3. Yeni bir proje oluşturun veya mevcut bir projeyi seçin

### Adım 2: OAuth Consent Screen Yapılandırması

1. Sol menüden **APIs & Services** > **OAuth consent screen** seçin
2. **User Type** seçin:
   - **External** (genel kullanım için)
   - **Internal** (sadece Google Workspace kullanıcıları için)
3. **App information** doldurun:
   - **App name**: Vibe Connect (veya istediğiniz isim)
   - **User support email**: E-posta adresiniz
   - **App logo**: (opsiyonel) Logo yükleyin
   - **Application home page**: `http://localhost:5173`
   - **Application privacy policy link**: (opsiyonel)
   - **Application terms of service link**: (opsiyonel)
   - **Authorized domains**: `localhost` ekleyin
4. **Scopes** ekleyin:
   - `email`
   - `profile`
   - `openid`
5. **Test users** ekleyin (Test modunda ise):
   - Test için kullanacağınız Google hesaplarını ekleyin
6. **Save and Continue** butonuna tıklayın

### Adım 3: OAuth 2.0 Credentials Oluşturma

1. Sol menüden **APIs & Services** > **Credentials** seçin
2. **+ CREATE CREDENTIALS** > **OAuth client ID** seçin
3. **Application type** seçin:
   - **Web application** (backend için)
4. **Name**: Vibe Connect Backend (veya istediğiniz isim)
5. **Authorized JavaScript origins** ekleyin:
   ```
   http://localhost:5173
   http://localhost:5000
   ```
6. **Authorized redirect URIs** ekleyin:
   ```
   http://localhost:5000/api/auth/google/callback
   http://localhost:5173/auth/google/callback
   ```
7. **CREATE** butonuna tıklayın
8. **Client ID** ve **Client Secret** değerlerini kopyalayın (sadece bir kez gösterilir!)

### Adım 4: Client ID ve Secret'ı Kaydetme

Kopyaladığınız değerleri `.env` dosyanıza ekleyin:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

**⚠️ ÖNEMLİ:** Client Secret'ı asla public repository'ye commit etmeyin!

---

## 🍎 Apple OAuth Kurulumu

### Adım 1: Apple Developer Account

1. [Apple Developer](https://developer.apple.com/) hesabınız olmalı
2. Yıllık $99 ücretli üyelik gereklidir

### Adım 2: App ID Oluşturma

1. [Apple Developer Portal](https://developer.apple.com/account/) > **Certificates, Identifiers & Profiles** gidin
2. **Identifiers** > **+** butonuna tıklayın
3. **App IDs** seçin ve **Continue**
4. **App** seçin ve **Continue**
5. **Description**: Vibe Connect
6. **Bundle ID**: `com.vibeconnect.app` (kendi bundle ID'nizi kullanın)
7. **Capabilities** altında **Sign In with Apple** seçin
8. **Continue** > **Register**

### Adım 3: Service ID Oluşturma (Web için)

1. **Identifiers** > **+** > **Services IDs** seçin
2. **Description**: Vibe Connect Web
3. **Identifier**: `com.vibeconnect.web` (kendi identifier'ınızı kullanın)
4. **Continue** > **Register**
5. **Sign In with Apple** seçin ve **Configure**
6. **Primary App ID**: Az önce oluşturduğunuz App ID'yi seçin
7. **Website URLs**:
   - **Domains and Subdomains**: `localhost`
   - **Return URLs**: 
     ```
     http://localhost:5000/api/auth/apple/callback
     http://localhost:5173/auth/apple/callback
     ```
8. **Save** > **Continue** > **Register**

### Adım 4: Key Oluşturma

1. **Keys** > **+** butonuna tıklayın
2. **Key Name**: Vibe Connect Sign In Key
3. **Sign In with Apple** seçin ve **Configure**
4. **Primary App ID**: App ID'nizi seçin
5. **Save** > **Continue** > **Register**
6. **Download** butonuna tıklayın (`.p8` dosyası - sadece bir kez indirilebilir!)
7. **Key ID**'yi not edin

### Adım 5: Credentials'ları Kaydetme

`.env` dosyanıza ekleyin:

```env
APPLE_CLIENT_ID=com.vibeconnect.web
APPLE_TEAM_ID=your-team-id-here
APPLE_KEY_ID=your-key-id-here
APPLE_PRIVATE_KEY_PATH=./apple-auth-key.p8
```

**Not:** `.p8` dosyasını `server` klasörüne koyun ve path'i doğru belirtin.

---

## ⚙️ Backend Yapılandırması

### 1. .env Dosyasını Güncelleme

`server/.env` dosyanıza şu satırları ekleyin:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Apple OAuth
APPLE_CLIENT_ID=com.vibeconnect.web
APPLE_TEAM_ID=your-team-id-here
APPLE_KEY_ID=your-key-id-here
APPLE_PRIVATE_KEY_PATH=./apple-auth-key.p8
```

### 2. Gerekli Paketleri Kontrol Etme

Backend'de `google-auth-library` zaten yüklü. Apple için ek paket gerekebilir:

```bash
cd server
npm install jsonwebtoken
```

### 3. Backend'i Yeniden Başlatma

```bash
npm run dev
```

---

## 🎨 Frontend Yapılandırması

### 1. Google Sign-In SDK

`index.html` veya `App.tsx`'e Google Sign-In script'ini ekleyin:

```html
<!-- index.html içine -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### 2. React Google Login (Opsiyonel)

Alternatif olarak `@react-oauth/google` paketini kullanabilirsiniz:

```bash
npm install @react-oauth/google
```

### 3. Frontend'de Kullanım

`OnboardingPage.tsx` ve `LoginPage.tsx`'te Google/Apple butonları zaten var. Sadece credentials'ları eklemeniz yeterli.

---

## 🧪 Test Etme

### Google OAuth Test

1. Frontend'i başlatın: `npm run dev`
2. Login/Onboarding sayfasına gidin
3. "Continue with Google" butonuna tıklayın
4. Google hesabınızı seçin
5. İzinleri onaylayın
6. Başarılı giriş yapılmalı

### Apple OAuth Test

1. Frontend'i başlatın
2. Login/Onboarding sayfasına gidin
3. "Continue with Apple" butonuna tıklayın
4. Apple ID ile giriş yapın
5. İzinleri onaylayın
6. Başarılı giriş yapılmalı

---

## 🔧 Sorun Giderme

### Google OAuth Hataları

**"redirect_uri_mismatch" hatası:**
- Google Cloud Console'da **Authorized redirect URIs** listesini kontrol edin
- Tam URL'yi (protokol, domain, path) doğru eklediğinizden emin olun

**"invalid_client" hatası:**
- `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` değerlerini kontrol edin
- `.env` dosyasında tırnak işareti olmadan yazın

**"access_denied" hatası:**
- OAuth Consent Screen'de test kullanıcıları eklediğinizden emin olun
- App'in "Testing" modunda olduğunu kontrol edin

### Apple OAuth Hataları

**"invalid_client" hatası:**
- `APPLE_CLIENT_ID` (Service ID) doğru mu kontrol edin
- Bundle ID ile Service ID farklı olabilir

**"invalid_grant" hatası:**
- `.p8` dosyasının path'i doğru mu kontrol edin
- Key ID ve Team ID doğru mu kontrol edin

**"unauthorized_client" hatası:**
- Return URL'lerin Apple Developer Portal'da doğru yapılandırıldığından emin olun

---

## 📝 Önemli Notlar

1. **Development vs Production:**
   - Development için `localhost` URL'leri kullanın
   - Production için gerçek domain'lerinizi ekleyin

2. **Güvenlik:**
   - `.env` dosyasını asla commit etmeyin
   - `.gitignore` dosyasında `.env` olduğundan emin olun
   - Client Secret'ları frontend'de kullanmayın

3. **Apple Developer Account:**
   - Apple OAuth için ücretli developer account gereklidir
   - Test için Apple ID ile giriş yapabilirsiniz

4. **Google OAuth:**
   - İlk 100 kullanıcı için ücretsiz
   - Sonrası için quota limitleri olabilir

---

## 🚀 Hızlı Başlangıç

1. Google Cloud Console'da OAuth credentials oluşturun
2. `.env` dosyasına `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` ekleyin
3. Backend'i yeniden başlatın
4. Frontend'de Google butonunu test edin

Apple için:
1. Apple Developer Portal'da Service ID ve Key oluşturun
2. `.env` dosyasına Apple credentials'ları ekleyin
3. `.p8` dosyasını `server` klasörüne koyun
4. Backend'i yeniden başlatın
5. Frontend'de Apple butonunu test edin

---

## 📚 Ek Kaynaklar

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [React Google Login](https://www.npmjs.com/package/@react-oauth/google)

---

**Sorularınız için:** GitHub Issues veya dokümantasyonu kontrol edin.
