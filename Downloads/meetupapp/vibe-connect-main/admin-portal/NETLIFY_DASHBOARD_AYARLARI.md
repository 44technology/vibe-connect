# Netlify Dashboard Ayarları - Admin Portal

## Çözüm: Base Directory Boş, Build Command'da cd Kullan

Netlify Dashboard'da Publish directory'yi düzenleyemiyorsanız, şu ayarları kullanın:

### Netlify Dashboard Ayarları:

1. **Base directory:** BOŞ BIRAKIN (hiçbir şey yazmayın)

2. **Build command:**
   ```
   cd admin-portal && npm install --legacy-peer-deps && npm run build
   ```

3. **Publish directory:**
   ```
   admin-portal/dist
   ```

4. **Functions directory:** (varsa)
   ```
   admin-portal/netlify/functions
   ```

### Neden Bu Yöntem?

- Base directory boş → Netlify repo root'undan başlar
- Build command'da `cd admin-portal` → admin-portal klasörüne gider
- Publish directory `admin-portal/dist` → Root'tan bakıldığında doğru yol

### Alternatif: Base Directory ile (Eğer çalışırsa)

Eğer Base directory yöntemi çalışıyorsa:

1. **Base directory:** `admin-portal`

2. **Build command:**
   ```
   npm install --legacy-peer-deps && npm run build
   ```

3. **Publish directory:** 
   - Netlify'da sadece `dist` yazın
   - Netlify otomatik olarak `admin-portal/dist` gösterebilir ama bu normal
   - Önemli olan build'in başarılı olması

### Kontrol

Deploy sonrası build logs'a bakın:
- Hangi dizinde çalıştığını kontrol edin
- `dist` klasörünün nerede oluştuğunu kontrol edin
- Publish directory'nin doğru olup olmadığını kontrol edin
