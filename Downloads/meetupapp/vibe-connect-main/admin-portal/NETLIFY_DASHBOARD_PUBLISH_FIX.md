# Netlify Dashboard Publish Directory Sorunu - Çözüm

## Sorun

Netlify Dashboard'da:
- **Base directory:** `admin-portal` yazdığınızda
- **Publish directory:** Otomatik olarak `admin-portal/dist` oluyor
- Ve bunu değiştiremiyorsunuz

## Çözüm: netlify.toml Kullanın

`admin-portal/netlify.toml` dosyasında `publish = "dist"` yazıyor. Bu doğru!

### Netlify Dashboard Ayarları:

1. **Base directory:** `admin-portal` yazın

2. **Build command:** 
   - BOŞ BIRAKIN (netlify.toml'dan otomatik alınır)
   - VEYA: `npm install --legacy-peer-deps && npm run build` yazın

3. **Publish directory:**
   - BOŞ BIRAKIN (netlify.toml'dan otomatik alınır)
   - VEYA: `dist` yazın (admin-portal/dist değil!)

4. **Save Changes**

### Neden Bu Çalışır?

- Base directory `admin-portal` → Netlify `/opt/build/repo/admin-portal` dizinine gider
- netlify.toml'da `publish = "dist"` → Netlify `/opt/build/repo/admin-portal/dist` bulur
- Dashboard'da `admin-portal/dist` görünse bile, netlify.toml'daki `dist` kullanılır

### Kontrol

Deploy sonrası build logs'da şunları kontrol edin:

```
Changing to base directory 'admin-portal'
Installing dependencies...
Building site...
Publishing to directory: dist
```

"Publishing to directory: dist" satırını görmelisiniz.

## Alternatif: Dashboard'da Manuel Override

Eğer netlify.toml çalışmazsa:

1. **Base directory:** `admin-portal`

2. **Build command:** `npm install --legacy-peer-deps && npm run build`

3. **Publish directory:** 
   - Dashboard'da `admin-portal/dist` görünüyor olabilir
   - Ama siz `dist` yazmayı deneyin
   - Eğer yazamıyorsanız, `admin-portal/dist` bırakın - Netlify otomatik olarak Base directory'yi hesaba katar

4. **Save Changes**

5. **Deploy** edin ve build logs'a bakın - hangi dizini publish ediyor?

## En Son Çare: Base Directory Boş

Eğer hiçbiri çalışmazsa:

1. **Base directory:** BOŞ BIRAKIN

2. **Build command:** `cd admin-portal && npm install --legacy-peer-deps && npm run build`

3. **Publish directory:** `admin-portal/dist`

4. **Save Changes**

5. **Clear cache and deploy**

Bu yöntem kesinlikle çalışmalı çünkü tüm yolları manuel olarak belirtiyoruz.
