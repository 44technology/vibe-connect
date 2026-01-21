# EAS Build - AppData Hatası Çözüm Rehberi

## ❌ Sorun
EAS build sırasında Windows sistem dosyaları (Chrome cache, OneDrive logs) tespit ediliyor ve build başarısız oluyor.

## 🔍 Sorunun Nedeni
- Proje dizini kullanıcının home dizininde (`C:\Users\ALI\Downloads\bluecrew1\project`)
- Git, Windows'ta case-insensitive olduğu için tüm AppData klasörünü tarıyor
- EAS build, git status kullanarak dosyaları tespit ediyor
- Bu dosyalar proje dizininde değil, kullanıcının home dizininde

## ✅ Çözüm Seçenekleri

### Çözüm 1: Proje Dizini Taşıma (ÖNERİLEN)

Projeyi kullanıcı home dizininden farklı bir yere taşıyın:

```bash
# Örnek: C:\Projects\bluecrew1\project gibi bir yere taşıyın
# Bu şekilde git sadece proje dizinini tarar
```

### Çözüm 2: Local Build Kullanma

EAS build'in `--local` flag'ini kullanarak local build yapın:

```bash
eas build --profile development --platform android --local
```

**Not**: Bu, cloud build değil, local build yapar ve daha uzun sürebilir.

### Çözüm 3: Git Config Değiştirme

Git'in sadece proje dizinini taramasını sağlayın:

```bash
# Proje dizininde .git/config dosyasını düzenleyin
# Veya git'in tarama alanını sınırlayın
```

### Çözüm 4: Manual Build (Geçici)

EAS build yerine manuel olarak build alın:

```bash
# Android için
npx expo prebuild --clean
cd android
./gradlew assembleDebug
```

## 🚀 Hızlı Çözüm

**En hızlı çözüm**: Projeyi farklı bir dizine taşıyın:

1. Projeyi `C:\Projects\bluecrew1\project` gibi bir yere kopyalayın
2. O dizinde `eas build` komutunu çalıştırın
3. Build başarılı olacaktır

## 📝 Yapılan Değişiklikler

1. ✅ `.easignore` dosyası oluşturuldu
2. ✅ `.gitignore` güncellendi
3. ✅ `.git/info/exclude` dosyası oluşturuldu

Ancak bu dosyalar yeterli olmadı çünkü git hala kullanıcı home dizinindeki AppData'yı tarıyor.

## 💡 Öneri

**En iyi çözüm**: Projeyi kullanıcı home dizininden farklı bir yere taşıyın. Bu şekilde:
- Git sadece proje dizinini tarar
- Windows sistem dosyaları karışmaz
- Build başarılı olur
