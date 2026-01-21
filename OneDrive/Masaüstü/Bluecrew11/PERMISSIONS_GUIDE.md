# Permissions System Guide

## Overview
Bu dokümantasyon, tüm sayfalar için permission sisteminin nasıl çalıştığını açıklar.

## Permission Types
- **view**: Sayfayı görüntüleyebilir, ancak create/edit yapamaz
- **edit**: Sayfayı görüntüleyebilir, create/edit yapabilir
- **none**: Sayfaya erişemez

## Roles
- **admin**: Tüm yetkilere sahip
- **pm**: Project Manager - projeleri yönetebilir
- **sales**: Satış işlemleri yapabilir
- **office**: Ofis işlemleri yapabilir
- **client**: Müşteri - sadece kendi verilerini görebilir

## Pages and Default Permissions

### Projects
- **admin**: edit
- **pm**: edit
- **sales**: view (permission ile edit olabilir)
- **office**: view (permission ile edit olabilir)
- **client**: view (sadece kendi project'lerini görür)

### Proposals
- **admin**: edit
- **pm**: view
- **sales**: edit
- **office**: view (permission ile edit olabilir)
- **client**: view (sadece kendi proposal'larını görür ve approve edebilir)

### Invoices
- **admin**: edit
- **pm**: view
- **sales**: edit
- **office**: view (permission ile edit olabilir)
- **client**: view (sadece kendi invoice'larını görür)

### Clients
- **admin**: edit
- **pm**: view
- **sales**: edit
- **office**: view (permission ile edit olabilir)
- **client**: none

### Leads
- **admin**: edit
- **pm**: view
- **sales**: edit
- **office**: view (permission ile edit olabilir)
- **client**: none

### Team
- **admin**: edit
- **pm**: none
- **sales**: none
- **office**: none
- **client**: none

### HR
- **admin**: edit
- **pm**: none
- **sales**: none
- **office**: none
- **client**: none

### Time Clock
- **admin**: edit
- **pm**: edit
- **sales**: edit
- **office**: edit
- **client**: none

### Project Approval
- **admin**: edit
- **pm**: view
- **sales**: view
- **office**: view
- **client**: none

### Reports
- **admin**: edit
- **pm**: view
- **sales**: view
- **office**: view
- **client**: none

### Schedule
- **admin**: edit
- **pm**: edit
- **sales**: view
- **office**: view
- **client**: none

### Change Order
- **admin**: edit
- **pm**: edit
- **sales**: view
- **office**: view
- **client**: none

### Material Request
- **admin**: edit
- **pm**: edit
- **sales**: view
- **office**: view
- **client**: none

### Settings
- **admin**: edit
- **pm**: view
- **sales**: view
- **office**: view
- **client**: view

## Firestore Rules

### Projects
- **Read**: Tüm authenticated kullanıcılar
- **Create**: admin, sales, office (permission ile)
- **Update**: admin (tüm), sales/office (kendi oluşturdukları)
- **Delete**: sadece admin

### Proposals
- **Read**: Tüm authenticated kullanıcılar
- **Create**: admin, sales
- **Update**: admin (tüm), sales (kendi oluşturdukları)
- **Delete**: sadece admin (approve olmayanlar)

### Invoices
- **Read**: Tüm authenticated kullanıcılar
- **Create**: admin, sales
- **Update**: admin, sales
- **Delete**: sadece admin

### Clients
- **Read**: admin, sales, office (permission ile)
- **Create**: admin, sales
- **Update**: admin, sales
- **Delete**: sadece admin

### Leads
- **Read**: admin, sales, office (permission ile)
- **Create**: admin, sales
- **Update**: admin, sales
- **Delete**: sadece admin

## Implementation

Her sayfada permission kontrolü şu şekilde yapılmalı:

```typescript
import { PermissionService } from '@/services/permissionService';

// State
const [canEdit, setCanEdit] = useState(false);

// Check permission
useEffect(() => {
  const checkPermission = async () => {
    if (userRole === 'admin') {
      setCanEdit(true);
      return;
    }
    
    const permission = await PermissionService.getPagePermission('pageId', userRole);
    setCanEdit(permission === 'edit');
  };
  
  checkPermission();
}, [userRole]);

// Use in UI
{canEdit && (
  <TouchableOpacity onPress={handleCreate}>
    <Text>Create</Text>
  </TouchableOpacity>
)}
```

## Permission Service Methods

- `PermissionService.hasPageAccess(pageId, role)`: Sayfaya erişim var mı?
- `PermissionService.getPagePermission(pageId, role)`: Sayfa için permission tipi (view/edit/none)
- `PermissionService.clearCache()`: Cache'i temizle











