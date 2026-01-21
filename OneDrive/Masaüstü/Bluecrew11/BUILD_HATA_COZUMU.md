# EAS Build - Windows Sistem Dosyaları Hatası Çözümü

## ❌ Hata
```
Failed to upload the project tarball to EAS Build
Reason: Detected inconsistent filename casing between your local filesystem and git.
Impacted files: AppData/Local/Google/Chrome/...
```

## ✅ Çözüm

### 1. `.easignore` Dosyası Oluşturuldu ✓

`.easignore` dosyası oluşturuldu ve Windows sistem dosyaları ignore edildi:
- Chrome cache dosyaları
- OneDrive log dosyaları
- Windows temp dosyaları
- AppData klasörü

### 2. `.gitignore` Güncellendi ✓

Windows sistem dosyaları `.gitignore`'a eklendi.

### 3. Build'i Tekrar Deneyin

```bash
eas build --profile development --platform android
```

## 🔍 Eğer Hata Devam Ederse

### Adım 1: Git Cache'i Temizle

```bash
git rm -r --cached .
git add .
git commit -m "Clean git cache"
```

### Adım 2: `.easignore` Dosyasını Kontrol Et

`.easignore` dosyasında şu satırlar olmalı:
```
AppData/
**/Chrome/**/Cache/
**/OneDrive/logs/
**/Microsoft/OneDrive/
**/Temp/
```

### Adım 3: Manuel Olarak Dosyaları Kontrol Et

Proje dizininde bu klasörler olmamalı:
- `AppData/`
- `Chrome/`
- `OneDrive/`
- `Microsoft/`

Eğer varsa, silin veya `.easignore`'a ekleyin.

### Adım 4: Build'i Cache Temizleyerek Deneyin

```bash
eas build --profile development --platform android --clear-cache
```

## 📝 Notlar

- `.easignore` dosyası EAS build sırasında kullanılır
- Git case-insensitive olduğu için Windows'ta sorun çıkabilir
- `.easignore` dosyası `.gitignore`'dan farklıdır ve EAS build için özeldir
