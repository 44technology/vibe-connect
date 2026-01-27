# Web Portal Architecture - Öneriler ve Seçenekler

## Mevcut Durum
- **Mobile App**: React + Vite (mobile-first, `src/` klasöründe)
- **Backend**: Node.js + Express + Prisma (`server/` klasöründe)
- **Feature Docs**: `ADMIN_PORTAL_FEATURES.md` ve `VENUE_INSTRUCTOR_PORTAL_FEATURES.md` mevcut

---

## Seçenek 1: Monorepo Yaklaşımı (ÖNERİLEN) ✅

### Yapı:
```
vibe-connect-main/
├── mobile/              # Mevcut mobile app (şu anki src/)
├── admin-portal/        # Yeni admin web portal
├── venue-portal/        # Yeni venue/instructor web portal
├── server/              # Paylaşılan backend (mevcut)
├── shared/              # Paylaşılan utilities, types, components
│   ├── components/      # Ortak UI components
│   ├── lib/             # Ortak utilities
│   └── types/           # TypeScript types
└── package.json         # Root package.json (workspaces)
```

### Avantajlar:
✅ **Aynı backend'i paylaşır** - Kod tekrarı yok
✅ **Shared components** - UI component'leri tekrar kullanılabilir
✅ **Tek git repo** - Kolay yönetim ve versiyonlama
✅ **Type safety** - Paylaşılan TypeScript types
✅ **Kolay refactoring** - Değişiklikler tüm projeleri etkiler
✅ **Tek deployment** - İsterseniz aynı sunucuda çalıştırabilirsiniz

### Dezavantajlar:
❌ Daha büyük repo boyutu
❌ Bağımsız deployment biraz daha karmaşık (ama yine de mümkün)

### Kurulum:
```bash
# Root package.json'a workspaces ekle
{
  "workspaces": [
    "mobile",
    "admin-portal",
    "venue-portal",
    "server"
  ]
}

# Her portal için ayrı vite.config.ts
# Her portal için ayrı package.json
```

---

## Seçenek 2: Ayrı Projeler

### Yapı:
```
vibe-connect-main/          # Mobile app (mevcut)
├── src/
└── server/

vibe-connect-admin/          # Yeni repo
├── src/
└── package.json

vibe-connect-venue-portal/  # Yeni repo
├── src/
└── package.json
```

### Avantajlar:
✅ **Tam bağımsızlık** - Her proje kendi repo'sunda
✅ **Bağımsız deployment** - Her biri farklı sunucuda olabilir
✅ **Farklı teknolojiler** - İsterseniz admin portal için Next.js kullanabilirsiniz
✅ **Daha küçük repo'lar** - Her proje daha hafif

### Dezavantajlar:
❌ **Kod tekrarı** - Backend API'leri, types, utilities tekrarlanır
❌ **Senkronizasyon** - Backend değişikliklerinde tüm projeleri güncellemek gerekir
❌ **Daha fazla yönetim** - 3 ayrı repo, 3 ayrı CI/CD pipeline

---

## Seçenek 3: Mevcut Projeye Ekleme (Subfolder)

### Yapı:
```
vibe-connect-main/
├── src/                   # Mobile app (mevcut)
├── admin/                 # Admin portal
│   └── src/
├── venue-portal/          # Venue portal
│   └── src/
└── server/                # Backend
```

### Avantajlar:
✅ Tek repo
✅ Hızlı başlangıç

### Dezavantajlar:
❌ Karmaşık yapı
❌ Build konfigürasyonu zor
❌ Ölçeklenebilir değil

---

## ÖNERİ: Monorepo Yaklaşımı

### Neden?
1. **Backend paylaşımı**: Zaten `server/` klasörü var ve her iki portal da aynı API'leri kullanacak
2. **Type safety**: Prisma schema'dan generate edilen types paylaşılabilir
3. **Shared components**: Shadcn/ui components zaten var, tekrar kullanılabilir
4. **Kolay geliştirme**: Tek `npm install` ile tüm projeler hazır

### Teknoloji Önerileri:

#### Admin Portal:
- **Framework**: React + Vite (mevcut stack ile tutarlı)
- **UI Library**: Shadcn/ui (zaten kullanılıyor)
- **Routing**: React Router (mevcut)
- **State**: React Query (zaten kullanılıyor)
- **Styling**: Tailwind CSS (zaten kullanılıyor)

#### Venue/Instructor Portal:
- **Framework**: React + Vite (aynı)
- **UI Library**: Shadcn/ui (aynı)
- **Routing**: React Router (aynı)
- **State**: React Query (aynı)
- **Styling**: Tailwind CSS (aynı)

---

## Kurulum Adımları (Monorepo)

### 1. Mevcut yapıyı yeniden düzenle:
```bash
# Mobile app'i mobile/ klasörüne taşı
mkdir mobile
mv src mobile/
mv index.html mobile/
mv vite.config.ts mobile/
# ... diğer mobile-specific dosyalar
```

### 2. Yeni portal'ları oluştur:
```bash
# Admin portal
npm create vite@latest admin-portal -- --template react-ts
cd admin-portal
npm install

# Venue portal
npm create vite@latest venue-portal -- --template react-ts
cd venue-portal
npm install
```

### 3. Shared klasörü oluştur:
```bash
mkdir shared
# Shared components, types, utilities buraya
```

### 4. Root package.json'ı güncelle:
```json
{
  "name": "ulikme-monorepo",
  "private": true,
  "workspaces": [
    "mobile",
    "admin-portal",
    "venue-portal",
    "server",
    "shared"
  ],
  "scripts": {
    "dev:mobile": "cd mobile && npm run dev",
    "dev:admin": "cd admin-portal && npm run dev",
    "dev:venue": "cd venue-portal && npm run dev",
    "dev:server": "cd server && npm run dev",
    "dev:all": "concurrently \"npm run dev:mobile\" \"npm run dev:admin\" \"npm run dev:venue\" \"npm run dev:server\""
  }
}
```

---

## Deployment Stratejisi

### Seçenek A: Aynı Domain, Farklı Paths
```
https://ulikme.com/          → Mobile app
https://ulikme.com/admin     → Admin portal
https://ulikme.com/venue     → Venue portal
```

### Seçenek B: Subdomain'ler
```
https://app.ulikme.com       → Mobile app
https://admin.ulikme.com     → Admin portal
https://venue.ulikme.com     → Venue portal
```

### Seçenek C: Tamamen Ayrı Domain'ler
```
https://ulikme.com           → Mobile app
https://admin.ulikme.com     → Admin portal
https://partners.ulikme.com  → Venue portal
```

---

## Sonuç ve Öneri

**ÖNERİLEN YAKLAŞIM: Monorepo**

Nedenler:
1. Backend zaten paylaşılıyor
2. Feature dokümanları hazır
3. Teknoloji stack'i tutarlı
4. Geliştirme ve bakım daha kolay
5. Type safety ve kod tekrarından kaçınma

**Başlangıç için:**
1. Önce admin portal'ı monorepo içinde oluşturun
2. Sonra venue portal'ı ekleyin
3. Shared klasörünü zamanla genişletin

**İleride gerekirse:**
- Monorepo'dan ayrı projelere geçiş yapılabilir
- Ama başlangıçta monorepo daha mantıklı

---

## Sorularınız için:
- Hangi yaklaşımı tercih edersiniz?
- Admin portal mı venue portal mı önce başlayalım?
- Deployment stratejisi nasıl olsun?
