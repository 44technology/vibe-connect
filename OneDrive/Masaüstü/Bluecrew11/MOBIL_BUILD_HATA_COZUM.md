# Mobil Build Hata Çözüm Rehberi

Bu rehber, mobil build sırasında karşılaşabileceğiniz hataları ve çözümlerini içerir.

## 🔍 Hata Ayıklama Adımları

### 1. Build Loglarını İnceleme

Build sırasında hata çıkarsa:

```bash
# Build loglarını görüntüle
eas build:list

# Belirli bir build'in detaylarını görüntüle
eas build:view [BUILD_ID]
```

### 2. Yaygın Hatalar ve Çözümleri

#### ❌ Hata: "google-services.json not found"
**Çözüm:**
- Dosyanın proje root dizininde olduğundan emin olun
- `app.json` dosyasındaki path'i kontrol edin: `"googleServicesFile": "./google-services.json"`

#### ❌ Hata: "Invalid app ID" veya "Firebase initialization error"
**Çözüm:**
1. `lib/firebase.ts` dosyasındaki appId'leri kontrol edin
2. Firebase Console'dan doğru appId'leri kopyalayın
3. Config dosyalarını yeniden indirin

#### ❌ Hata: "Package name mismatch"
**Çözüm:**
- `app.json` dosyasındaki package name'i kontrol edin:
  - Android: `"package": "com.bluecrew.app"`
  - iOS: `"bundleIdentifier": "com.bluecrew.app"`
- Firebase Console'daki package name ile aynı olmalı

#### ❌ Hata: "EAS project not found"
**Çözüm:**
```bash
eas init
# Bu komut app.json'daki projectId'yi otomatik güncelleyecek
```

#### ❌ Hata: "Firebase connection failed" (Runtime)
**Çözüm:**
1. `lib/firebase.ts` dosyasındaki config'leri kontrol edin
2. Platform-specific config'lerin doğru olduğundan emin olun
3. Firestore ve Storage security rules'ları kontrol edin

#### ❌ Hata: "Module not found" veya "Cannot resolve module"
**Çözüm:**
```bash
# node_modules'ı temizle ve yeniden kur
rm -rf node_modules
npm install

# Expo cache'i temizle
npx expo start --clear
```

#### ❌ Hata: "Build failed" (Native dependencies)
**Çözüm:**
1. `expo prebuild` komutunu çalıştırın:
```bash
npx expo prebuild --clean
```

2. Native modüller için gerekli plugin'leri `app.json`'a ekleyin

## 🐛 Runtime Hatalarını Debug Etme

### Development Build ile Debug

1. **Development build oluşturun:**
```bash
eas build --profile development --platform android
# veya
eas build --profile development --platform ios
```

2. **Build'i cihazınıza yükleyin**

3. **Metro bundler'ı başlatın:**
```bash
npm run dev
```

4. **React Native Debugger kullanın:**
   - Chrome DevTools: `http://localhost:8081/debugger-ui/`
   - React Native Debugger uygulaması
   - Flipper (Facebook'un debug aracı)

### Logları Görüntüleme

**Android:**
```bash
# Logcat ile logları görüntüle
adb logcat | grep ReactNativeJS

# Veya Android Studio'dan Logcat sekmesini kullanın
```

**iOS:**
```bash
# Xcode Console'dan logları görüntüleyin
# Veya Safari Developer Tools kullanın
```

### Remote Debugging

1. Uygulamayı açın
2. Cihazı sallayın (shake gesture)
3. "Debug" seçeneğini seçin
4. Chrome DevTools açılacak

## 🔧 Firebase Hatalarını Debug Etme

### Firebase Connection Test

`lib/firebase.ts` dosyasında `testFirebaseConnection()` fonksiyonunu kullanın:

```typescript
import { testFirebaseConnection } from '@/lib/firebase';

// Uygulama başlangıcında test et
useEffect(() => {
  testFirebaseConnection().then(success => {
    if (!success) {
      console.error('Firebase connection failed!');
      // Kullanıcıya hata mesajı göster
    }
  });
}, []);
```

### Firestore Rules Kontrolü

Firebase Console > Firestore Database > Rules sekmesinden:
- Read/Write kurallarını kontrol edin
- Test modunu kullanarak test edin

### Storage Rules Kontrolü

Firebase Console > Storage > Rules sekmesinden:
- Upload/Download kurallarını kontrol edin

## 📱 Platform-Specific Hatalar

### Android Hataları

**Gradle Build Hatası:**
```bash
# Android klasörünü temizle
cd android
./gradlew clean
cd ..
```

**ProGuard/R8 Hatası:**
- `android/app/proguard-rules.pro` dosyasına Firebase için kurallar ekleyin

### iOS Hataları

**CocoaPods Hatası:**
```bash
cd ios
pod install
pod update
cd ..
```

**Code Signing Hatası:**
- Xcode'da Signing & Capabilities sekmesinden:
  - Team seçin
  - Bundle Identifier'ı kontrol edin

## 🚨 Acil Durum Çözümleri

### Build Sürekli Başarısız Oluyorsa

1. **Temiz build:**
```bash
eas build --profile development --platform android --clear-cache
```

2. **Config dosyalarını yeniden indirin:**
   - Firebase Console'dan config dosyalarını yeniden indirin
   - Projeye kopyalayın

3. **EAS project'i yeniden oluşturun:**
```bash
eas init --force
```

### Uygulama Crash Oluyorsa

1. **Crash loglarını kontrol edin:**
   - Android: `adb logcat > crash.log`
   - iOS: Xcode > Window > Devices and Simulators > View Device Logs

2. **Firebase Crashlytics ekleyin** (opsiyonel):
```bash
npm install @react-native-firebase/crashlytics
```

### Network Hataları

1. **Firebase config'lerini kontrol edin**
2. **Internet bağlantısını test edin**
3. **Firebase Console'da servislerin aktif olduğunu kontrol edin**

## 📞 Yardım Alma

1. **EAS Build Logları:**
   - Build tamamlandıktan sonra logları inceleyin
   - `eas build:view [BUILD_ID]` ile detaylı logları görüntüleyin

2. **Expo Forums:**
   - https://forums.expo.dev/

3. **Firebase Support:**
   - https://firebase.google.com/support

4. **GitHub Issues:**
   - Projenizin GitHub repo'sunda issue açın

## ✅ Build Öncesi Kontrol Listesi

- [ ] `google-services.json` dosyası proje root'unda
- [ ] `GoogleService-Info.plist` dosyası proje root'unda
- [ ] `lib/firebase.ts` dosyasında config'ler güncel
- [ ] `app.json` dosyasında package name'ler doğru
- [ ] EAS CLI kurulu ve login yapılmış
- [ ] EAS project oluşturulmuş
- [ ] Tüm dependencies kurulu (`npm install`)
- [ ] Build komutları çalışıyor (`npm run build:android` test edildi)

## 🔄 Hızlı Fix Komutları

```bash
# Her şeyi temizle ve yeniden başlat
rm -rf node_modules .expo
npm install
npx expo start --clear

# EAS build cache'i temizle
eas build --clear-cache

# Prebuild yap (native modüller için)
npx expo prebuild --clean
```
