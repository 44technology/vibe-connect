# Mobil Uygulama Kurulum Rehberi

Bu rehber, BlueCrew uygulamasını Android ve iOS için native mobil uygulamaya çevirme adımlarını içerir.

## 📋 Gereksinimler

1. **Firebase Console Erişimi**: Firebase projenize erişim
2. **EAS CLI**: Expo Application Services için CLI
3. **Apple Developer Account** (iOS için)
4. **Google Play Console Account** (Android için - opsiyonel)

## 🔥 Adım 1: Firebase Console'da Android ve iOS App'leri Oluşturma

### Android App Oluşturma:

1. Firebase Console'a gidin: https://console.firebase.google.com
2. Projenizi seçin: **bluecrew-app**
3. Sol menüden **Project Settings** (⚙️) tıklayın
4. Aşağı kaydırın ve **Your apps** bölümüne gidin
5. **Add app** butonuna tıklayın ve **Android** seçin
6. **Android package name** girin: `com.bluecrew.app`
7. **App nickname** (opsiyonel): `BlueCrew Android`
8. **Register app** butonuna tıklayın
9. **google-services.json** dosyasını indirin
10. İndirilen dosyayı proje root dizinine kopyalayın: `./google-services.json`

### iOS App Oluşturma:

1. Firebase Console'da aynı **Project Settings** sayfasında
2. **Add app** butonuna tıklayın ve **iOS** seçin
3. **iOS bundle ID** girin: `com.bluecrew.app`
4. **App nickname** (opsiyonel): `BlueCrew iOS`
5. **Register app** butonuna tıklayın
6. **GoogleService-Info.plist** dosyasını indirin
7. İndirilen dosyayı proje root dizinine kopyalayın: `./GoogleService-Info.plist`

## 📱 Adım 2: Firebase Config Dosyalarından App ID'leri Alma

### Android App ID:

1. İndirdiğiniz `google-services.json` dosyasını açın
2. `client[0].client_info.android_client_info.package_name` kontrol edin (com.bluecrew.app olmalı)
3. `client[0].client_info.mobilesdk_app_id` değerini kopyalayın
4. Bu değer şu formatta olacak: `1:822347973979:android:xxxxxxxxxx`
5. `lib/firebase.ts` dosyasındaki `androidConfig.appId` değerini güncelleyin

### iOS App ID:

1. İndirdiğiniz `GoogleService-Info.plist` dosyasını açın
2. `<key>CLIENT_ID</key>` altındaki değeri bulun
3. Veya `<key>GOOGLE_APP_ID</key>` altındaki değeri kopyalayın
4. Bu değer şu formatta olacak: `1:822347973979:ios:xxxxxxxxxx`
5. `lib/firebase.ts` dosyasındaki `iosConfig.appId` değerini güncelleyin

## 🔧 Adım 3: EAS Build Yapılandırması

### EAS CLI Kurulumu:

```bash
npm install -g eas-cli
```

### EAS Login:

```bash
eas login
```

### EAS Project Oluşturma:

```bash
eas init
```

Bu komut `app.json` dosyasındaki `extra.eas.projectId` değerini otomatik olarak güncelleyecektir.

## 📦 Adım 4: Build Komutları

### Development Build (Test için):

```bash
# Android
eas build --profile development --platform android

# iOS
eas build --profile development --platform ios
```

### Preview Build (Internal Testing):

```bash
# Android
eas build --profile preview --platform android

# iOS
eas build --profile preview --platform ios
```

### Production Build:

```bash
# Android
eas build --profile production --platform android

# iOS
eas build --profile production --platform ios
```

## 🚀 Adım 5: Local Development (Expo Go ile Test)

Expo Go ile hızlı test için:

```bash
# Development server başlat
npm run dev

# QR kodu tarayarak Expo Go uygulamasında aç
```

**Not**: Bazı native modüller Expo Go'da çalışmayabilir. Bu durumda development build kullanın.

## 📝 Adım 6: Config Dosyalarını Güncelleme

`lib/firebase.ts` dosyasında Android ve iOS config'lerini güncelleyin:

```typescript
const androidConfig = {
  apiKey: "YOUR_ANDROID_API_KEY",
  authDomain: "bluecrew-app.firebaseapp.com",
  projectId: "bluecrew-app",
  storageBucket: "bluecrew-app.firebasestorage.app",
  messagingSenderId: "822347973979",
  appId: "1:822347973979:android:YOUR_ANDROID_APP_ID", // google-services.json'dan
};

const iosConfig = {
  apiKey: "YOUR_IOS_API_KEY",
  authDomain: "bluecrew-app.firebaseapp.com",
  projectId: "bluecrew-app",
  storageBucket: "bluecrew-app.firebasestorage.app",
  messagingSenderId: "822347973979",
  appId: "1:822347973979:ios:YOUR_IOS_APP_ID", // GoogleService-Info.plist'ten
};
```

## ✅ Kontrol Listesi

- [ ] Firebase Console'da Android app oluşturuldu
- [ ] Firebase Console'da iOS app oluşturuldu
- [ ] `google-services.json` dosyası proje root'unda
- [ ] `GoogleService-Info.plist` dosyası proje root'unda
- [ ] `lib/firebase.ts` dosyasında Android config güncellendi
- [ ] `lib/firebase.ts` dosyasında iOS config güncellendi
- [ ] `app.json` dosyasında config dosya path'leri eklendi
- [ ] EAS CLI kuruldu ve login yapıldı
- [ ] EAS project oluşturuldu

## 🐛 Sorun Giderme

### Build Hataları:

1. **"google-services.json not found"**: Dosyanın proje root'unda olduğundan emin olun
2. **"Invalid app ID"**: Firebase Console'dan doğru app ID'yi kopyaladığınızdan emin olun
3. **"Package name mismatch"**: `app.json` ve Firebase Console'daki package name'lerin aynı olduğundan emin olun

### Firebase Bağlantı Sorunları:

1. **"Firebase connection failed"**: Config dosyalarının doğru olduğundan emin olun
2. **"Permission denied"**: Firestore ve Storage security rules'ları kontrol edin

## 📚 Ek Kaynaklar

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Firebase Console](https://console.firebase.google.com)
- [Expo Firebase Setup](https://docs.expo.dev/guides/using-firebase/)
