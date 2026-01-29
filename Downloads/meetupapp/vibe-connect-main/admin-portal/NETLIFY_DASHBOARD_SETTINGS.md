# Netlify Dashboard Ayarları - Admin Portal

## ✅ Doğru Ayarlar

Netlify Dashboard → Build settings → Admin Portal için:

### Base directory
```
admin-portal
```

### Build command
```
npm install --legacy-peer-deps && npm run build
```

### Publish directory
```
dist
```
**ÖNEMLİ:** `admin-portal/dist` DEĞİL, sadece `dist` yazın!

### Functions directory (eğer varsa)
```
netlify/functions
```
**ÖNEMLİ:** `admin-portal/netlify/functions` DEĞİL, sadece `netlify/functions` yazın!

## ❌ Yanlış Ayarlar

### Publish directory
```
admin-portal/dist  ❌ YANLIŞ!
```

### Functions directory
```
admin-portal/netlify/functions  ❌ YANLIŞ!
```

## Neden?

**Base directory `admin-portal` olarak ayarlandığında:**

1. Netlify repo'yu clone eder: `/opt/build/repo`
2. Base directory'ye gider: `/opt/build/repo/admin-portal`
3. Build command'ı çalıştırır: `/opt/build/repo/admin-portal` içinde
4. Publish directory'yi arar: `/opt/build/repo/admin-portal/dist`

Eğer Publish directory'yi `admin-portal/dist` olarak ayarlarsanız:
- Netlify şunu arar: `/opt/build/repo/admin-portal/admin-portal/dist`
- Bu klasör yok! ❌

## Hızlı Düzeltme

1. Netlify Dashboard'a gidin
2. Site settings → Build & deploy → Build settings
3. **Publish directory** alanını şu şekilde değiştirin:
   - ❌ `admin-portal/dist` 
   - ✅ `dist`
4. **Functions directory** varsa:
   - ❌ `admin-portal/netlify/functions`
   - ✅ `netlify/functions`
5. **Save** butonuna tıklayın
6. Yeni deploy başlatın

## Kontrol Listesi

- [ ] Base directory: `admin-portal`
- [ ] Build command: `npm install --legacy-peer-deps && npm run build`
- [ ] Publish directory: `dist` (admin-portal/dist DEĞİL!)
- [ ] Functions directory: `netlify/functions` veya boş (admin-portal/netlify/functions DEĞİL!)
- [ ] Deploy başlatıldı

## Özet

**Kural:** Base directory ayarlandığında, tüm path'ler admin-portal klasörüne göre relative olmalı!

- ✅ `dist` → `/opt/build/repo/admin-portal/dist`
- ❌ `admin-portal/dist` → `/opt/build/repo/admin-portal/admin-portal/dist` (YOK!)
