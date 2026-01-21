# Proje Taşıma Rehberi

## 📦 Proje Taşıma Adımları

### Adım 1: Yeni Klasör Oluştur

Yeni bir klasör oluşturun (kullanıcı home dizininden farklı bir yere):

**Örnek:**
- `C:\Projects\bluecrew1\project`
- `D:\Development\bluecrew1\project`
- `C:\Dev\bluecrew1\project`

### Adım 2: Projeyi Kopyala

**Seçenek A: Windows Explorer ile**
1. Mevcut proje klasörünü bulun: `C:\Users\ALI\Downloads\bluecrew1\project`
2. Tüm klasörü seçin (Ctrl+A)
3. Kopyalayın (Ctrl+C)
4. Yeni klasöre yapıştırın (Ctrl+V)

**Seçenek B: Terminal ile**
```powershell
# Yeni klasör oluştur
New-Item -ItemType Directory -Path "C:\Projects\bluecrew1" -Force

# Projeyi kopyala
Copy-Item -Path "C:\Users\ALI\Downloads\bluecrew1\project" -Destination "C:\Projects\bluecrew1\project" -Recurse
```

### Adım 3: Yeni Klasöre Git

```powershell
cd C:\Projects\bluecrew1\project
```

### Adım 4: Dependencies'leri Yeniden Kur (Opsiyonel)

```bash
# node_modules'ı temizle (opsiyonel, ama önerilir)
Remove-Item -Recurse -Force node_modules

# Dependencies'leri yeniden kur
npm install
```

### Adım 5: Git Bağlantısını Kontrol Et

```bash
# Git durumunu kontrol et
git status

# Eğer git repo'su taşındıysa, her şey hazır!
```

### Adım 6: Build'i Dene

```bash
# iOS build
eas build --profile development --platform ios

# veya Android build
eas build --profile development --platform android
```

## ✅ Taşıma Sonrası Kontrol Listesi

- [ ] Proje dosyaları yeni klasörde
- [ ] `package.json` dosyası var
- [ ] `app.json` dosyası var
- [ ] `google-services.json` ve `GoogleService-Info.plist` dosyaları var
- [ ] `.git` klasörü var (eğer git kullanıyorsanız)
- [ ] `node_modules` klasörü var veya `npm install` çalıştırıldı

## ⚠️ Dikkat Edilmesi Gerekenler

1. **node_modules**: Taşıma sırasında `node_modules` klasörü çok büyük olabilir. Taşıdıktan sonra `npm install` ile yeniden kurabilirsiniz.

2. **.expo cache**: `.expo` klasörü cache içerir, taşıdıktan sonra temizlenebilir:
   ```bash
   Remove-Item -Recurse -Force .expo
   ```

3. **Git**: Git repo'su taşınır, herhangi bir sorun olmaz.

4. **Firebase Config**: `google-services.json` ve `GoogleService-Info.plist` dosyaları taşınır.

5. **Environment Variables**: Eğer `.env` dosyaları varsa, onlar da taşınır.

## 🚀 Hızlı Taşıma Komutu

Tek komutla taşıyabilirsiniz:

```powershell
# Yeni klasör oluştur ve projeyi kopyala
New-Item -ItemType Directory -Path "C:\Projects\bluecrew1" -Force
Copy-Item -Path "C:\Users\ALI\Downloads\bluecrew1\project" -Destination "C:\Projects\bluecrew1\project" -Recurse -Exclude "node_modules",".expo"

# Yeni klasöre git
cd C:\Projects\bluecrew1\project

# Dependencies'leri kur
npm install
```

## 📝 Notlar

- Proje taşındıktan sonra **tüm dosyalar aynı kalır**
- Git history korunur
- Firebase config dosyaları korunur
- Sadece **yeni klasörde** build almanız yeterli

## 🎯 Sonuç

Proje taşıma işlemi **çok kolay** ve **güvenli**. Sadece klasörü kopyalayıp yeni klasörde `npm install` yapmanız yeterli!
