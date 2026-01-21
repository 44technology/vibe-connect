# PostgreSQL Veritabanı Kullanım Rehberi

## 📍 Veriler Nerede Kaydediliyor?

PostgreSQL veritabanı **yerel bilgisayarınızda** çalışıyor. Veriler şu konumda saklanıyor:

### Windows'ta PostgreSQL Veri Konumu:
```
C:\Program Files\PostgreSQL\[VERSIYON]\data\
```

Örnek: `C:\Program Files\PostgreSQL\15\data\`

**Not:** Bu dosyalar binary format'ta olduğu için doğrudan okunamaz. Veritabanına bağlanarak görüntülemeniz gerekir.

---

## 🔍 Veritabanını Görüntüleme Yöntemleri

### 1. Prisma Studio (EN KOLAY YÖNTEM) ⭐

Prisma Studio, veritabanınızı web arayüzünde görüntülemenizi sağlar.

#### Adımlar:

1. **Terminal'i açın ve server klasörüne gidin:**
```bash
cd server
```

2. **Prisma Studio'yu başlatın:**
```bash
npm run prisma:studio
```

veya

```bash
npx prisma studio
```

3. **Tarayıcıda açılacak:**
   - Otomatik olarak `http://localhost:5555` adresinde açılır
   - Tüm tabloları (User, Meetup, Venue, vb.) görebilirsiniz
   - Verileri görüntüleyebilir, düzenleyebilir ve silebilirsiniz

#### Prisma Studio Özellikleri:
- ✅ Tüm tabloları görüntüleme
- ✅ Veri ekleme/düzenleme/silme
- ✅ İlişkili verileri görüntüleme
- ✅ Arama ve filtreleme
- ✅ Kullanıcı dostu arayüz

---

### 2. pgAdmin (PostgreSQL GUI Aracı)

pgAdmin, PostgreSQL için resmi grafik arayüzüdür.

#### Kurulum:

1. **pgAdmin'i indirin:**
   - https://www.pgadmin.org/download/
   - Windows için installer'ı indirin ve kurun

2. **pgAdmin'i açın ve bağlanın:**
   - Sol panelde "Servers" > "Create" > "Server"
   - **General** sekmesi:
     - Name: `ULIKME Local`
   - **Connection** sekmesi:
     - Host: `localhost`
     - Port: `5432`
     - Database: `ulikme`
     - Username: `postgres` (veya .env dosyanızdaki kullanıcı adı)
     - Password: .env dosyanızdaki şifre
   - "Save" butonuna tıklayın

3. **Veritabanını görüntüleyin:**
   - Sol panelde: `ULIKME Local` > `Databases` > `ulikme` > `Schemas` > `public` > `Tables`
   - Tabloları görebilir ve verileri görüntüleyebilirsiniz

---

### 3. psql (Komut Satırı)

PostgreSQL'in komut satırı aracı.

#### Kullanım:

1. **psql'i açın:**
```bash
psql -U postgres -d ulikme
```

2. **Temel komutlar:**

```sql
-- Tüm tabloları listele
\dt

-- Users tablosundaki tüm verileri görüntüle
SELECT * FROM users;

-- Belirli bir kullanıcıyı bul
SELECT * FROM users WHERE email = 'user@example.com';

-- Toplam kullanıcı sayısı
SELECT COUNT(*) FROM users;

-- Çıkış
\q
```

---

### 4. VS Code Extension (DBeaver veya PostgreSQL Extension)

VS Code'da PostgreSQL extension'ı kullanabilirsiniz.

#### Kurulum:

1. VS Code'da "PostgreSQL" extension'ını yükleyin
2. `.env` dosyanızdan `DATABASE_URL`'i kopyalayın
3. Extension'da bağlantı bilgilerini girin

---

## 📊 Veritabanı Bağlantı Bilgileri

Bağlantı bilgileriniz `server/.env` dosyasında:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ulikme?schema=public"
```

Bu URL'den şu bilgileri çıkarabilirsiniz:
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `ulikme`
- **Username:** URL'deki kullanıcı adı
- **Password:** URL'deki şifre

---

## 🗂️ Veritabanı Tabloları

Projenizdeki tüm tablolar:

1. **users** - Kullanıcı bilgileri
2. **meetups** - Vibe'lar (etkinlikler)
3. **venues** - Mekanlar
4. **chats** - Sohbetler
5. **messages** - Mesajlar
6. **matches** - Bağlantılar (connections)
7. **classes** - Sınıflar
8. **posts** - Postlar
9. **stories** - Hikayeler
10. **notifications** - Bildirimler
11. Ve diğer ilişkili tablolar...

---

## 🚀 Hızlı Başlangıç

### Prisma Studio ile Başlamak İçin:

```bash
# 1. Server klasörüne git
cd server

# 2. Prisma Studio'yu başlat
npm run prisma:studio

# 3. Tarayıcıda http://localhost:5555 açılacak
```

### Veritabanı Durumunu Kontrol Etmek:

```bash
# Server klasöründe
cd server

# Migration durumunu kontrol et
npx prisma migrate status

# Veritabanı şemasını görüntüle
npx prisma db pull
```

---

## 🔧 Sorun Giderme

### Veritabanına Bağlanamıyorum:

1. **PostgreSQL servisinin çalıştığından emin olun:**
   - Windows Services'te "postgresql-x64-15" (veya versiyonunuz) servisinin çalıştığını kontrol edin

2. **.env dosyasındaki DATABASE_URL'i kontrol edin:**
   - Kullanıcı adı ve şifrenin doğru olduğundan emin olun

3. **Port 5432'nin açık olduğundan emin olun:**
   ```bash
   netstat -an | findstr 5432
   ```

### Prisma Studio Açılmıyor:

1. **Port 5555'in kullanılabilir olduğundan emin olun:**
   ```bash
   netstat -an | findstr 5555
   ```

2. **Farklı bir port kullanın:**
   ```bash
   npx prisma studio --port 5556
   ```

---

## 📝 Örnek Sorgular

### Kullanıcıları Görüntüleme:
```sql
SELECT id, "firstName", "lastName", email, phone, "createdAt" 
FROM users 
ORDER BY "createdAt" DESC;
```

### Son Oluşturulan Vibe'ları Görüntüleme:
```sql
SELECT m.id, m.title, m."startTime", u."displayName" as creator
FROM meetups m
JOIN users u ON m."creatorId" = u.id
ORDER BY m."createdAt" DESC
LIMIT 10;
```

### Toplam İstatistikler:
```sql
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM meetups) as total_meetups,
  (SELECT COUNT(*) FROM venues) as total_venues,
  (SELECT COUNT(*) FROM posts) as total_posts;
```

---

## 💡 İpuçları

1. **Prisma Studio'yu sürekli açık tutun** - Geliştirme sırasında verileri kolayca görmek için
2. **Backup alın** - Önemli veriler için düzenli backup alın
3. **Migration'ları takip edin** - `prisma/migrations` klasöründe tüm değişiklikler kayıtlı
4. **Seed data kullanın** - Test için `npm run prisma:seed` komutunu kullanın

---

## 🎯 Sonuç

**En kolay yöntem:** Prisma Studio kullanın!
```bash
cd server
npm run prisma:studio
```

Bu komutla veritabanınızı web arayüzünde görüntüleyebilir ve yönetebilirsiniz.
