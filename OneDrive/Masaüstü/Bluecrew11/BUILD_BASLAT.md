# Mobil Build Başlatma ve Hata Çözüm Rehberi

## 🚀 Build Başlatma

### Android Build (İlk Build - Development)

```bash
eas build --profile development --platform android
```

Bu komut:
- Eğer EAS project yoksa otomatik oluşturur
- Android için development build başlatır
- Build tamamlandığında APK indirme linki verir

### Build Süreci

1. **Build başlatıldıktan sonra:**
   - Build ID alacaksınız
   - Build durumunu takip edebilirsiniz: `eas build:list`
   - Build tamamlandığında bildirim gelecek

2. **Build tamamlandığında:**
   - APK dosyasını indirebilirsiniz
   - QR kod ile cihazınıza yükleyebilirsiniz

## 🐛 Hata Çıkarsa - Adım Adım Çözüm

### Adım 1: Build Loglarını İncele

```bash
# Son build'in ID'sini al
eas build:list

# Build detaylarını görüntüle
eas build:view [BUILD_ID]
```

### Adım 2: Yaygın Hatalar

#### Hata: "Invalid project ID" veya "Project not found"
**Çözüm:**
```bash
# app.json'dan projectId'yi kaldır (zaten yaptık)
# Sonra manuel olarak project oluştur
eas project:create
```

#### Hata: "google-services.json not found"
**Kontrol:**
- Dosya proje root'unda mı? (`./google-services.json`)
- `app.json`'da path doğru mu?

**Çözüm:**
```bash
# Dosyanın varlığını kontrol et
ls google-services.json

# Eğer yoksa Firebase Console'dan yeniden indir
```

#### Hata: "Firebase config error" veya "Invalid app ID"
**Kontrol:**
- `lib/firebase.ts` dosyasındaki appId'ler doğru mu?
- Config dosyalarından appId'leri kontrol et

**Çözüm:**
1. `google-services.json` dosyasını aç
2. `mobilesdk_app_id` değerini bul
3. `lib/firebase.ts` dosyasındaki `androidConfig.appId` ile karşılaştır
4. Aynı işlemi iOS için de yap

#### Hata: "Package name mismatch"
**Kontrol:**
- `app.json` → `android.package`: `com.bluecrew.app`
- `app.json` → `ios.bundleIdentifier`: `com.bluecrew.app`
- Firebase Console'daki package name'ler aynı mı?

#### Hata: "Build timeout" veya "Build failed"
**Çözüm:**
```bash
# Cache'i temizle ve yeniden dene
eas build --profile development --platform android --clear-cache
```

### Adım 3: Runtime Hataları (Uygulama Çalışırken)

Uygulama build oldu ama çalışırken hata veriyorsa:

1. **Logları kontrol et:**
```bash
# Android
adb logcat | grep ReactNativeJS

# iOS (Xcode Console'dan)
```

2. **Firebase bağlantısını test et:**
   - Uygulama açıldığında Firebase'e bağlanıyor mu?
   - `lib/firebase.ts` dosyasındaki `testFirebaseConnection()` fonksiyonunu kullan

3. **Network hataları:**
   - Internet bağlantısı var mı?
   - Firebase Console'da servisler aktif mi?

### Adım 4: Debug Build ile Test

Development build ile test etmek için:

```bash
# Development build oluştur
eas build --profile development --platform android

# Build tamamlandıktan sonra
# APK'yı cihazınıza yükleyin
# Metro bundler'ı başlatın
npm run dev

# Uygulamayı açın ve debug yapın
```

## 📱 Build Sonrası Test

1. **APK'yı cihazınıza yükleyin**
2. **Uygulamayı açın**
3. **Login yapmayı deneyin**
4. **Firebase bağlantısını test edin**
5. **Temel özellikleri test edin**

## 🔄 Hızlı Fix Komutları

```bash
# Her şeyi temizle
rm -rf node_modules .expo
npm install

# EAS cache temizle
eas build --clear-cache

# Build'i yeniden başlat
eas build --profile development --platform android
```

## 📞 Yardım

Hata çıkarsa:
1. Build loglarını paylaşın
2. Hata mesajını paylaşın
3. `MOBIL_BUILD_HATA_COZUM.md` dosyasına bakın
