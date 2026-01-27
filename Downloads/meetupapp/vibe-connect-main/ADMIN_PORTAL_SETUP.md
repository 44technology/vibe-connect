# Admin Portal Setup Guide

Admin portal başarıyla oluşturuldu! 🎉

## Kurulum

### 1. Dependencies Yükle

```bash
cd admin-portal
npm install
```

### 2. Development Server'ı Başlat

```bash
npm run dev
```

Admin portal `http://localhost:3001` adresinde çalışacak.

### 3. İlk Giriş

- Email: `admin@ulikme.com` (şimdilik mock)
- Password: Herhangi bir şey (şimdilik mock)

## Yapılanlar

✅ Admin portal klasör yapısı oluşturuldu
✅ React + Vite + TypeScript kurulumu
✅ Tailwind CSS ve Shadcn/ui entegrasyonu
✅ Login sayfası
✅ Dashboard sayfası
✅ Admin Layout (sidebar navigation)
✅ Auth Context (authentication yönetimi)
✅ Temel UI components (Button, Input, Label, Card)

## Sonraki Adımlar

1. **Backend API Entegrasyonu**
   - `src/lib/api.ts` dosyasını oluştur
   - Backend API endpoint'lerini bağla
   - AuthContext'i gerçek API ile entegre et

2. **Sayfaları Ekle**
   - Users Management (`/users`)
   - Venues Management (`/venues`)
   - Instructors Management (`/instructors`)
   - Content Moderation (`/content`)
   - Settings (`/settings`)

3. **Shared Klasörü**
   - `shared/` klasörünü oluştur
   - Paylaşılan types, components, utilities ekle

4. **Root Package.json Workspaces**
   - Root `package.json`'a workspaces ekle
   - Tüm projeleri tek komutla çalıştır

## Monorepo Yapısı (Gelecek)

Şu an admin portal bağımsız çalışıyor. İleride monorepo yapısına geçmek için:

1. Root `package.json`'a workspaces ekle
2. Mobile app'i `mobile/` klasörüne taşı
3. Shared klasörü oluştur

## Notlar

- Admin portal şu an mock authentication kullanıyor
- Backend API entegrasyonu yapılmalı
- Feature dokümanları: `ADMIN_PORTAL_FEATURES.md`
