# Firebase Storage CORS Ayarları

PDF ve Image yükleme hatası için Firebase Storage CORS ayarlarını yapılandırmanız gerekiyor.

## Yöntem 1: Firebase Console (Önerilen)

1. Firebase Console'a gidin: https://console.firebase.google.com/
2. Projenizi seçin: `bluecrew-app`
3. Sol menüden **Storage** → **Settings** → **CORS** sekmesine gidin
4. Şu JSON'u ekleyin:

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

5. **Save** butonuna tıklayın

## Yöntem 2: gsutil ile (Firebase CLI gerekli)

1. `cors.json` dosyası oluşturun:

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

2. Terminal'de şu komutu çalıştırın:

```bash
gsutil cors set cors.json gs://bluecrew-app.firebasestorage.app
```

## Yöntem 3: Firebase CLI ile

```bash
firebase storage:rules:set --rules storage.rules
```

## Notlar

- CORS ayarları değişikliği birkaç dakika sürebilir
- Değişikliklerden sonra sayfayı yenileyin
- Hala hata alıyorsanız, tarayıcı cache'ini temizleyin















