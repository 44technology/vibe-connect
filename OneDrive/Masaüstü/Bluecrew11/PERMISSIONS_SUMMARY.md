# Permissions System - Özet

## Yapılan Değişiklikler

### 1. Custom Hook Oluşturuldu
- `hooks/usePagePermission.ts`: Her sayfa için permission kontrolü yapan hook
- `canView`, `canEdit`, `permission` değerlerini döndürür

### 2. Sayfalar Güncellendi
Aşağıdaki sayfalara permission kontrolü eklendi:
- ✅ **Projects** (`app/(tabs)/projects.tsx`)
- ✅ **Proposals** (`app/(tabs)/proposals.tsx`)
- ✅ **Invoices** (`app/(tabs)/invoices.tsx`)
- ✅ **Clients** (`app/(tabs)/clients.tsx`)
- ✅ **Leads** (`app/(tabs)/leads.tsx`)

### 3. Firestore Rules Güncellendi
`firestore.rules` dosyası tüm collection'lar için güncellendi:
- **Projects**: admin, sales, office (create/update)
- **Proposals**: admin, sales, office (create/update)
- **Invoices**: admin, sales, office (create/update)
- **Clients**: admin, sales, office (read/create/update)
- **Leads**: admin, sales, office (read/create/update)
- **Team**: admin (read), sadece admin (write)
- **HR**: sadece admin (read/write)

### 4. Permission Kontrolü Nasıl Çalışıyor?

Her sayfada:
```typescript
const { canEdit } = usePagePermission('pageId', userRole);
```

- `canEdit === true`: Create/Edit butonları görünür
- `canEdit === false`: Sadece view yapılabilir
- Admin her zaman `canEdit === true`

### 5. Permissions Sayfası
`app/(tabs)/permissions.tsx` sayfasında:
- Her role için her sayfa için "View" veya "Edit" seçilebilir
- Değişiklikler Firebase'e kaydedilir
- Cache temizlenir ve değişiklikler hemen etkili olur

## Kullanım

1. **Admin olarak giriş yapın**
2. **Permissions sayfasına gidin**
3. **Office rolünü seçin**
4. **Projects sayfası için "Edit" seçin**
5. **Save butonuna tıklayın**
6. **Office rolü ile giriş yapın**
7. **Projects sayfasında "Create Project" butonu görünecek**

## Önemli Notlar

⚠️ **Firestore Rules'ı manuel olarak deploy etmeniz gerekiyor:**
1. Firebase Console'a gidin
2. Firestore Database > Rules
3. `firestore.rules` dosyasındaki kuralları kopyalayın
4. "Publish" butonuna tıklayın

## Test Edilmesi Gerekenler

- [ ] Office rolü ile Projects sayfasında create butonu görünüyor mu?
- [ ] Office rolü ile Proposals sayfasında create butonu görünüyor mu?
- [ ] Office rolü ile Invoices sayfasında create butonu görünüyor mu?
- [ ] Office rolü ile Clients sayfasında create butonu görünüyor mu?
- [ ] Office rolü ile Leads sayfasında create butonu görünüyor mu?
- [ ] Permission değişiklikleri hemen etkili oluyor mu?
- [ ] Firestore rules doğru çalışıyor mu?











