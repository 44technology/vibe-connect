# Netlify Admin Portal - Hızlı Düzeltme

## Sorun
```
npm error path /opt/build/repo/package.json
npm error errno -2
npm error enoent Could not read package.json
```

Netlify root dizinde `package.json` arıyor ama admin-portal için base directory ayarı yapılmamış.

## Çözüm: Netlify Dashboard Ayarları

### Adım 1: Netlify Dashboard'a Gidin
1. https://app.netlify.com
2. Admin portal site'ınızı seçin

### Adım 2: Build Settings'i Düzeltin
**Site settings → Build & deploy → Build settings:**

#### Base directory:
```
admin-portal
```

#### Build command:
```
npm install --legacy-peer-deps && npm run build
```
**ÖNEMLİ:** `cd admin-portal` EKLEMEYİN! Base directory zaten admin-portal'a gidiyor.

#### Publish directory:
```
dist
```
**ÖNEMLİ:** `admin-portal/dist` DEĞİL, sadece `dist` yazın!

### Adım 3: Save ve Deploy
1. **Save changes** butonuna tıklayın
2. **Deploys** sekmesine gidin
3. **Trigger deploy** → **Clear cache and deploy site**

## Alternatif Çözüm (Eğer Base Directory Çalışmazsa)

Eğer yukarıdaki çözüm çalışmazsa:

### Base directory: BOŞ BIRAKIN

### Build command:
```
cd admin-portal && npm install --legacy-peer-deps && npm run build
```

### Publish directory:
```
admin-portal/dist
```

## Kontrol Listesi

- [ ] Base directory: `admin-portal` (veya boş)
- [ ] Build command: Base directory varsa `npm install...`, yoksa `cd admin-portal && npm install...`
- [ ] Publish directory: Base directory varsa `dist`, yoksa `admin-portal/dist`
- [ ] Cache temizlendi
- [ ] Yeni deploy başlatıldı

## Özet

**Kural:** 
- Base directory `admin-portal` ise → Tüm path'ler admin-portal içinden başlar
- Base directory BOŞ ise → Tüm path'ler root'tan başlar, `cd admin-portal` kullanın
