# Deployment ve Veri Koruma Rehberi

## ⚠️ ÖNEMLİ: Veri Kaybını Önleme

### Sorun
Her deployment'da (migration veya seed çalıştırınca) kullanıcı verileri, arkadaşlıklar ve diğer kayıtlar siliniyor.

### Çözüm

#### 1. Seed'i Güvenli Hale Getirme

Seed dosyası artık **production'da otomatik çalışmıyor**. 

**Seed'i çalıştırmak için:**
```bash
# Development'ta seed çalıştır
npm run prisma:seed

# Production'da seed çalıştırmak için (DİKKATLİ!)
SKIP_SEED=false npm run prisma:seed
```

**Seed'i atlamak için:**
```bash
# .env dosyasına ekle:
SKIP_SEED=true
```

#### 2. Migration Güvenliği

**ASLA `prisma migrate reset` kullanmayın!** Bu komut tüm verileri siler.

**Güvenli migration:**
```bash
# Sadece yeni migration'ları uygula (verileri silmez)
npm run prisma:migrate

# Veya
npx prisma migrate deploy
```

#### 3. Production Deployment Checklist

✅ **Yapılacaklar:**
- [ ] `.env` dosyasında `SKIP_SEED=true` olduğundan emin ol
- [ ] `prisma migrate reset` komutunu **ASLA** kullanma
- [ ] Sadece `prisma migrate deploy` veya `prisma migrate dev` kullan
- [ ] Database backup al (önemli veriler için)

❌ **Yapılmayacaklar:**
- [ ] `prisma migrate reset` - TÜM VERİLERİ SİLER!
- [ ] `prisma db push --force-reset` - TÜM VERİLERİ SİLER!
- [ ] Production'da seed çalıştırma (test verileri için)

#### 4. Veri Yedekleme

**PostgreSQL Backup:**
```bash
# Backup al
pg_dump -U postgres -d ulikme > backup_$(date +%Y%m%d).sql

# Restore et
psql -U postgres -d ulikme < backup_20240120.sql
```

**Prisma Studio ile Export:**
```bash
# Prisma Studio'yu aç
npm run prisma:studio

# Manuel olarak verileri export edebilirsiniz
```

#### 5. Environment Variables

**Development (.env):**
```env
SKIP_SEED=false  # Development'ta seed çalışabilir
NODE_ENV=development
```

**Production (.env):**
```env
SKIP_SEED=true   # Production'da seed çalışmasın
NODE_ENV=production
```

## 🔧 Resim Yükleme Sorunları

### Cloudinary Konfigürasyonu

**Gerekli Environment Variables:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Kontrol:**
```bash
# Backend loglarında şu mesajı görmemelisiniz:
# "⚠️  Cloudinary configuration is missing!"
```

### Hata Ayıklama

1. **Cloudinary credentials kontrol:**
   - `.env` dosyasında tüm 3 değişken var mı?
   - Backend'i yeniden başlattınız mı?

2. **File upload kontrol:**
   - Resim dosyası 5MB'dan küçük mü?
   - Desteklenen format: jpeg, jpg, png, gif, webp

3. **Backend logları:**
   ```bash
   # Backend console'da hata mesajlarını kontrol edin
   # "Cloudinary upload error:" ile başlayan mesajlar
   ```

## 📝 Özet

✅ **Güvenli Deployment:**
- `SKIP_SEED=true` kullan
- Sadece `prisma migrate deploy` kullan
- Backup al

❌ **Tehlikeli Komutlar:**
- `prisma migrate reset` - SİLER!
- `prisma db push --force-reset` - SİLER!
- Production'da seed çalıştırma
