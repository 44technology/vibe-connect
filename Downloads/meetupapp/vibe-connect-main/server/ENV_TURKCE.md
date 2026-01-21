# .env Dosyası Kurulum Rehberi (Türkçe)

## Hızlı Başlangıç

1. `server` klasöründe `.env` dosyası oluşturun
2. Aşağıdaki değerleri doldurun
3. Minimum gerekli alanlar: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`

## Minimum Çalışma İçin Gerekli Değerler

Sadece temel özellikleri test etmek için şunlar yeterli:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/ulikme?schema=public"
JWT_SECRET=gecici-secret-key-en-az-32-karakter-uzunlugunda-olmalı
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## Tüm Özellikler İçin Gerekli Değerler

### 1. Server Ayarları ✅ ZORUNLU
```env
PORT=5000
NODE_ENV=development
```

### 2. Veritabanı ✅ ZORUNLU
```env
DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/ulikme?schema=public"
```

**PostgreSQL Kurulumu:**
- Windows: https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

**Veritabanı Oluşturma:**
```sql
CREATE DATABASE ulikme;
```

### 3. JWT Secret ✅ ZORUNLU
```env
JWT_SECRET=rastgele-güçlü-string-en-az-32-karakter
JWT_EXPIRES_IN=7d
```

**Güçlü Secret Oluşturma:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Cloudinary (Resim Yükleme) ⚠️ OPSIYONEL
Resim yükleme özelliği için gerekli, yoksa resim yükleme çalışmaz.

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Kurulum:**
1. https://cloudinary.com adresine gidin
2. Ücretsiz hesap oluşturun
3. Dashboard'dan değerleri kopyalayın

### 5. Google OAuth ⚠️ OPSIYONEL
Google ile giriş için gerekli, yoksa sadece email/phone girişi çalışır.

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Kurulum:**
1. https://console.cloud.google.com
2. Proje oluşturun
3. OAuth 2.0 credentials oluşturun

### 6. Apple Sign-In ⚠️ OPSIYONEL
Apple ile giriş için gerekli, Apple Developer hesabı gerektirir ($99/yıl).

```env
APPLE_CLIENT_ID=your-client-id
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 7. CORS ✅ ZORUNLU
Frontend'in backend'e erişebilmesi için gerekli.

```env
CORS_ORIGIN=http://localhost:5173
```

## Örnek .env Dosyası (Minimum)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:123456@localhost:5432/ulikme?schema=public"

# JWT
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890123456
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Test Etme

`.env` dosyasını oluşturduktan sonra:

```bash
# Bağımlılıkları yükleyin
npm install

# Veritabanını hazırlayın
npm run prisma:generate
npm run prisma:migrate

# Sunucuyu başlatın
npm run dev
```

Sunucu `http://localhost:5000` adresinde çalışıyor olmalı.

## Sorun Giderme

### Veritabanı Bağlantı Hatası
- PostgreSQL'in çalıştığından emin olun
- `DATABASE_URL` formatını kontrol edin
- Veritabanının oluşturulduğundan emin olun

### JWT Secret Hatası
- Secret'ın en az 32 karakter olduğundan emin olun
- Özel karakterler kullanabilirsiniz

### CORS Hatası
- Frontend URL'inin doğru olduğundan emin olun
- Port numarasını kontrol edin
