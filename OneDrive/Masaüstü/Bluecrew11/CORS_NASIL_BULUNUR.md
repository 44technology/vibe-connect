# Google Cloud Storage'da CORS Ayarlarını Bulma

## Şu An Gördüğünüz Ekran
Bu ekran **Permissions** (İzinler) ekranı. Burada kullanıcı rolleri ve erişim izinleri yönetiliyor.

## CORS Ayarları Nerede?

### Yöntem 1: Bucket Detay Sayfasından
1. Şu anki ekranda üstteki **"Permissions"** yazısının yanında veya üst menüde **"Configuration"** veya **"Settings"** sekmesine tıklayın
2. Orada **"CORS"** sekmesini arayın

### Yöntem 2: Doğrudan CORS URL'i
1. Tarayıcıda şu URL'e gidin (bucket adınızı kullanarak):
   ```
   https://console.cloud.google.com/storage/browser/bluecrew-app.firebasestorage.app?project=bluecrew-app
   ```
2. Bucket'ı seçin
3. Üst menüden **"Configuration"** veya **"Settings"** sekmesine tıklayın
4. **"CORS"** sekmesini bulun

### Yöntem 3: gsutil ile (Terminal)
Eğer CORS sekmesi görünmüyorsa, terminal'den yapabilirsiniz:

```bash
gsutil cors set cors.json gs://bluecrew-app.firebasestorage.app
```

## CORS JSON İçeriği
`cors.json` dosyası proje klasörünüzde hazır. İçeriği:

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
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "x-goog-resumable"]
  }
]
```

## Önemli Not
- **Permissions** = Kullanıcı erişim izinleri (kimler okuyabilir/yazabilir)
- **CORS** = Tarayıcı güvenliği (hangi domain'lerden istek yapılabilir)

Bunlar farklı şeyler!















