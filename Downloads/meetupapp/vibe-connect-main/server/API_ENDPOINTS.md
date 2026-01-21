# API Endpoints Listesi

## Base URL
```
http://localhost:5000
```

## Tüm Endpoint'ler

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Açıklama | Auth Gerekli |
|--------|----------|----------|--------------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı | ❌ |
| POST | `/api/auth/login` | Email/Phone ile giriş | ❌ |
| POST | `/api/auth/google` | Google ile giriş | ❌ |
| POST | `/api/auth/apple` | Apple ile giriş | ❌ |
| GET | `/api/auth/me` | Mevcut kullanıcı bilgisi | ✅ |

### 👤 Users (`/api/users`)

| Method | Endpoint | Açıklama | Auth Gerekli |
|--------|----------|----------|--------------|
| GET | `/api/users` | Kullanıcı ara (query: query, limit, offset) | ✅ |
| GET | `/api/users/:userId` | Kullanıcı profili | ✅ |
| PUT | `/api/users` | Kendi profilini güncelle | ✅ |
| POST | `/api/users/avatar` | Avatar yükle (multipart/form-data) | ✅ |

### 🎉 Meetups (`/api/meetups`)

| Method | Endpoint | Açıklama | Auth Gerekli |
|--------|----------|----------|--------------|
| GET | `/api/meetups` | Tüm meetup'ları listele | ❌ |
| GET | `/api/meetups/nearby` | Yakındaki meetup'lar (query: latitude, longitude, radius, limit) | ❌ |
| GET | `/api/meetups/:id` | Meetup detayları | ❌ |
| POST | `/api/meetups` | Yeni meetup oluştur | ✅ |
| PUT | `/api/meetups/:id` | Meetup güncelle (sadece oluşturan) | ✅ |
| DELETE | `/api/meetups/:id` | Meetup sil (sadece oluşturan) | ✅ |
| POST | `/api/meetups/:id/join` | Meetup'a katıl | ✅ |
| DELETE | `/api/meetups/:id/leave` | Meetup'tan ayrıl | ✅ |

### 📍 Venues (`/api/venues`)

| Method | Endpoint | Açıklama | Auth Gerekli |
|--------|----------|----------|--------------|
| GET | `/api/venues` | Tüm venue'ları listele | ❌ |
| GET | `/api/venues/nearby` | Yakındaki venue'lar (query: latitude, longitude, radius, limit) | ❌ |
| GET | `/api/venues/:id` | Venue detayları | ❌ |
| POST | `/api/venues` | Yeni venue oluştur | ✅ |
| PUT | `/api/venues/:id` | Venue güncelle | ✅ |
| DELETE | `/api/venues/:id` | Venue sil | ✅ |

### 💬 Chats (`/api/chats`)

| Method | Endpoint | Açıklama | Auth Gerekli |
|--------|----------|----------|--------------|
| GET | `/api/chats` | Tüm chat'leri listele | ✅ |
| GET | `/api/chats/:id` | Chat detayları ve mesajlar | ✅ |
| GET | `/api/chats/:id/messages` | Chat mesajları (query: limit, offset) | ✅ |
| POST | `/api/chats/direct` | Direkt chat oluştur | ✅ |
| POST | `/api/chats/group` | Grup chat oluştur | ✅ |
| POST | `/api/chats/:id/messages` | Mesaj gönder (multipart/form-data) | ✅ |

### ❤️ Matches (`/api/matches`)

| Method | Endpoint | Açıklama | Auth Gerekli |
|--------|----------|----------|--------------|
| GET | `/api/matches` | Tüm match'leri listele (query: status) | ✅ |
| GET | `/api/matches/:id` | Match detayları | ✅ |
| POST | `/api/matches` | Match isteği gönder | ✅ |
| PUT | `/api/matches/:id` | Match durumunu güncelle (accept/reject) | ✅ |

## Örnek Kullanımlar

### 1. Health Check
```bash
GET http://localhost:5000/health
```

### 2. API Bilgisi
```bash
GET http://localhost:5000/api
```

### 3. Kullanıcı Kaydı
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

### 4. Giriş Yap
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 5. Meetup Listele (Auth gerekmez)
```bash
GET http://localhost:5000/api/meetups
```

### 6. Yakındaki Meetup'lar
```bash
GET http://localhost:5000/api/meetups/nearby?latitude=40.7128&longitude=-74.0060&radius=10&limit=20
```

### 7. Profil Güncelle (Auth gerekli)
```bash
PUT http://localhost:5000/api/users
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "firstName": "Updated",
  "bio": "New bio"
}
```

## Hata Mesajları

### Route Not Found
Eğer "Route not found" hatası alıyorsanız:

1. ✅ URL'in `/api/` ile başladığından emin olun
2. ✅ HTTP method'un doğru olduğundan emin olun (GET, POST, PUT, DELETE)
3. ✅ Sunucunun çalıştığından emin olun (`npm run dev`)
4. ✅ Port'un doğru olduğundan emin olun (varsayılan: 5000)

### Örnek Hatalı Kullanımlar ❌

```
❌ POST /auth/register          (eksik: /api/)
❌ GET /meetups                  (eksik: /api/)
❌ POST /api/meetup              (yanlış: meetup yerine meetups)
```

### Doğru Kullanımlar ✅

```
✅ POST /api/auth/register
✅ GET /api/meetups
✅ POST /api/meetups
```

## Authentication

Çoğu endpoint için JWT token gerekir. Token'ı header'da gönderin:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Token'ı login veya register işleminden alırsınız.
