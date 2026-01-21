# Firebase Storage CORS Ayarları - Detaylı Rehber

## Yöntem 1: Firebase Console (En Kolay - Önerilen)

### Adım 1: Firebase Console'a Giriş
1. Tarayıcınızda şu adrese gidin: https://console.firebase.google.com/
2. Google hesabınızla giriş yapın
3. **bluecrew-app** projenizi seçin

### Adım 2: Storage Bölümüne Gitme
1. Sol menüden **Storage** (Depolama) seçeneğine tıklayın
2. Eğer Storage henüz aktif değilse, "Get Started" butonuna tıklayın ve kurulumu tamamlayın

### Adım 3: CORS Ayarlarını Yapılandırma
1. Storage sayfasında üst kısımdaki **Settings** (Ayarlar) ikonuna tıklayın (⚙️)
2. Açılan menüden **CORS** sekmesine tıklayın
3. Eğer CORS sekmesi görünmüyorsa, **Rules** sekmesinde de olabilir veya **gsutil** yöntemini kullanmanız gerekebilir

### Adım 4: CORS JSON'unu Ekleme
Aşağıdaki JSON'u kopyalayıp CORS ayarlarına yapıştırın:

```json
[
  {
    "origin": [
      "https://bluecrew-app.netlify.app",
      "http://localhost:8081",
      "http://localhost:19006",
      "http://localhost:3000"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length"]
  }
]
```

4. **Save** (Kaydet) butonuna tıklayın

---

## Yöntem 2: gsutil ile (Terminal/Command Prompt)

### Adım 1: Google Cloud SDK Kurulumu
1. Google Cloud SDK'yı indirin: https://cloud.google.com/sdk/docs/install
2. Kurulumu tamamlayın
3. Terminal/Command Prompt'u açın

### Adım 2: Firebase'e Giriş
Terminal'de şu komutu çalıştırın:
```bash
gcloud auth login
```
Tarayıcı açılacak, Google hesabınızla giriş yapın.

### Adım 3: Projeyi Seçme
```bash
gcloud config set project bluecrew-app
```

### Adım 4: CORS JSON Dosyası Oluşturma
Proje klasörünüzde `cors.json` adında bir dosya oluşturun ve şu içeriği ekleyin:

```json
[
  {
    "origin": [
      "https://bluecrew-app.netlify.app",
      "http://localhost:8081",
      "http://localhost:19006",
      "http://localhost:3000"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length"]
  }
]
```

### Adım 5: CORS Ayarlarını Uygulama
Terminal'de şu komutu çalıştırın:
```bash
gsutil cors set cors.json gs://bluecrew-app.firebasestorage.app
```

Başarılı olursa şu mesajı göreceksiniz:
```
Setting CORS on gs://bluecrew-app.firebasestorage.app/...
```

---

## Yöntem 3: Firebase CLI ile

### Adım 1: Firebase CLI Kurulumu
Terminal'de şu komutu çalıştırın:
```bash
npm install -g firebase-tools
```

### Adım 2: Firebase'e Giriş
```bash
firebase login
```

### Adım 3: Projeyi Seçme
```bash
firebase use bluecrew-app
```

### Adım 4: CORS JSON Dosyası Oluşturma
Yukarıdaki gibi `cors.json` dosyası oluşturun.

### Adım 5: CORS Ayarlarını Uygulama
```bash
gsutil cors set cors.json gs://bluecrew-app.firebasestorage.app
```

---

## Kontrol Etme

CORS ayarlarının doğru uygulandığını kontrol etmek için:

```bash
gsutil cors get gs://bluecrew-app.firebasestorage.app
```

Bu komut mevcut CORS ayarlarını gösterecektir.

---

## Sorun Giderme

### CORS sekmesi görünmüyor
- Firebase Console'da Storage → Settings'te CORS sekmesi yoksa, gsutil yöntemini kullanın
- Veya Firebase Support'a başvurun

### Hata: "Permission denied"
- Google Cloud Console'da Storage Admin rolünüz olduğundan emin olun
- Firebase Console → Project Settings → Users and permissions'dan kontrol edin

### Hala CORS hatası alıyorum
1. Tarayıcı cache'ini temizleyin (Ctrl+Shift+Delete)
2. Sayfayı hard refresh yapın (Ctrl+F5)
3. Birkaç dakika bekleyin (CORS ayarları biraz zaman alabilir)
4. CORS ayarlarını tekrar kontrol edin

---

## Önemli Notlar

- CORS ayarları değişikliği 1-5 dakika sürebilir
- Tüm origin'leri (domain'leri) eklediğinizden emin olun
- Production ve development ortamları için farklı origin'ler ekleyebilirsiniz
- `maxAgeSeconds` değeri cache süresini belirler (3600 = 1 saat)















