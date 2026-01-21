# .env Dosyası Nasıl Oluşturulur?

## Yöntem 1: Windows Explorer (En Kolay) ✅

1. `server` klasörüne gidin
2. Sağ tıklayın > **Yeni** > **Metin Belgesi**
3. Dosya adını `.env` olarak değiştirin (nokta ile başlamalı!)
4. Windows uyarı verirse "Evet" deyin
5. Dosyayı Notepad veya herhangi bir metin editörü ile açın
6. İçine gerekli değerleri yazın ve kaydedin

**Not:** Windows'ta dosya adı `.env.` olarak görünebilir, bu normaldir.

## Yöntem 2: Visual Studio Code / Cursor

1. `server` klasörünü VS Code/Cursor'da açın
2. Sol panelde `server` klasörüne sağ tıklayın
3. **New File** seçin
4. Dosya adını `.env` yazın
5. İçine değerleri yazın ve kaydedin

## Yöntem 3: Terminal/Command Prompt

### Windows PowerShell:
```powershell
cd server
New-Item -Path .env -ItemType File
notepad .env
```

### Windows CMD:
```cmd
cd server
type nul > .env
notepad .env
```

### Git Bash (Windows'ta):
```bash
cd server
touch .env
notepad .env
```

## Yöntem 4: .env.example'dan Kopyalama

Eğer `.env.example` dosyası varsa:

### Windows PowerShell:
```powershell
cd server
Copy-Item .env.example .env
notepad .env
```

### Windows CMD:
```cmd
cd server
copy .env.example .env
notepad .env
```

## .env Dosyası İçeriği (Minimum)

Dosyayı oluşturduktan sonra şu içeriği ekleyin:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/ulikme?schema=public"
JWT_SECRET=gecici-secret-key-en-az-32-karakter-uzunlugunda-olmalı
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## Önemli Notlar ⚠️

1. **Dosya adı tam olarak `.env` olmalı** (başında nokta var, uzantı yok)
2. **Dosya `server` klasörünün içinde olmalı** (root'ta değil)
3. **Tırnak işaretleri:** `DATABASE_URL` değeri tırnak içinde olmalı
4. **Boşluklar:** `KEY=value` formatında, eşittir işaretinin etrafında boşluk olmamalı
5. **Yorumlar:** `#` ile başlayan satırlar yorum olarak kabul edilir

## Doğrulama

Dosyayı oluşturduktan sonra kontrol edin:

### PowerShell:
```powershell
cd server
Get-Content .env
```

### CMD:
```cmd
cd server
type .env
```

## Sorun Giderme

### "Dosya adı geçersiz" hatası
- Windows'ta `.env` dosyası oluşturmak bazen sorun çıkarabilir
- Çözüm: Önce `env.txt` oluşturun, sonra adını `.env` olarak değiştirin
- Veya VS Code/Cursor kullanın

### Dosya görünmüyor
- Windows Explorer'da gizli dosyaları göster:
  - Görünüm > Gizli öğeler (✓ işaretleyin)
- Veya terminal'de: `dir /a` (CMD) veya `ls -a` (PowerShell)

### Dosya kaydedilmiyor
- Dosyanın `server` klasöründe olduğundan emin olun
- Yazma izniniz olduğundan emin olun
- Başka bir program dosyayı açık tutuyor olabilir

## Hızlı Başlangıç Komutu

Tüm işlemi tek seferde yapmak için (PowerShell):

```powershell
cd server
@"
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/ulikme?schema=public"
JWT_SECRET=gecici-secret-key-en-az-32-karakter-uzunlugunda-olmalı
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
"@ | Out-File -FilePath .env -Encoding utf8
```

**Sonra:** `DATABASE_URL` ve `JWT_SECRET` değerlerini kendi değerlerinizle değiştirin!
