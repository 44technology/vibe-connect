# GitHub'a Kod Güncelleme Rehberi

## Durum
- ✅ Lokalde 3 commit var (GitHub'da yok)
- ⚠️ GitHub'a push yapmak için authentication gerekiyor

## Yöntem 1: GitHub Personal Access Token (Önerilen)

### Adım 1: Token Oluşturma
1. GitHub'a giriş yapın: https://github.com
2. Sağ üst köşede profil fotoğrafınıza tıklayın → **Settings**
3. Sol menüden **Developer settings** → **Personal access tokens** → **Tokens (classic)**
4. **Generate new token (classic)** butonuna tıklayın
5. Token adı verin (örn: "vibe-connect-push")
6. **Expiration** seçin (örn: 90 days veya No expiration)
7. **Scopes** bölümünde **repo** checkbox'ını işaretleyin
8. **Generate token** butonuna tıklayın
9. **Token'ı kopyalayın** (bir daha gösterilmeyecek!)

### Adım 2: Git Credentials Ayarlama
Windows PowerShell'de şu komutları çalıştırın:

```powershell
cd "c:\Users\ALI\Downloads\meetupapp\vibe-connect-main"

# Git credential helper'ı ayarla
git config --global credential.helper wincred

# Remote URL'i kontrol et
git remote -v
```

### Adım 3: Push Yapma
```powershell
git push origin main
```

**Username sorduğunda:** GitHub kullanıcı adınızı girin (örn: `44technology` veya organizasyon üyesi olan hesap)
**Password sorduğunda:** Oluşturduğunuz **Personal Access Token**'ı yapıştırın (şifre değil!)

## Yöntem 2: SSH Key Kullanma

### Adım 1: SSH Key Kontrolü
```powershell
# SSH key var mı kontrol et
ls ~/.ssh/id_rsa.pub
```

### Adım 2: SSH Key Oluşturma (yoksa)
```powershell
# SSH key oluştur
ssh-keygen -t ed25519 -C "your_email@example.com"

# Public key'i göster
cat ~/.ssh/id_rsa.pub
```

### Adım 3: GitHub'a SSH Key Ekleme
1. Public key'i kopyalayın
2. GitHub → Settings → SSH and GPG keys → New SSH key
3. Key'i yapıştırın ve kaydedin

### Adım 4: Remote URL'i SSH'a Çevirme
```powershell
git remote set-url origin git@github.com:44technology/vibe-connect.git
git push origin main
```

## Yöntem 3: GitHub Desktop Kullanma

1. GitHub Desktop'ı indirin: https://desktop.github.com
2. File → Clone repository → GitHub.com'dan seçin
3. Repository'yi clone edin
4. Değişiklikleri commit edin
5. Push origin butonuna tıklayın

## Yöntem 4: Netlify'a Manuel Deploy (Hızlı Çözüm)

GitHub push olmadan da Netlify'a deploy yapabilirsiniz:

1. Netlify Dashboard → Site → Deploys
2. "Deploy manually" bölümüne gidin
3. `dist` klasörünü sürükleyip bırakın
4. Deploy otomatik başlayacak

## Sorun Giderme

### "Permission denied" hatası alıyorsanız:
- Token'ın `repo` yetkisi olduğundan emin olun
- Token'ın expire olmadığını kontrol edin
- Doğru GitHub hesabıyla giriş yaptığınızdan emin olun

### "Repository not found" hatası alıyorsanız:
- Repository'nin private olup olmadığını kontrol edin
- Token'ın bu repository'ye erişim yetkisi olduğundan emin olun

## Mevcut Durum

**Lokaldeki commit'ler:**
1. `512440f` - Fix Netlify base directory configuration
2. `fe75dc0` - Merge mentors into classes, add filters
3. `[yeni]` - Update API configuration

**Push yapmak için:**
```powershell
git push origin main
```
