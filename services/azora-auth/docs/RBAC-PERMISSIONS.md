# RBAC Permission Matrix

## Roles

- **admin**: Full system access
- **instructor**: Course and content management
- **student**: Learning and enrollment access
- **guest**: Limited read-only access

## Permission Matrix

| Resource | Action | Admin | Instructor | Student | Guest |
|----------|--------|-------|------------|---------|-------|
| **Users** |
| users:read | View users | ✓ | ✓ | - | - |
| users:write | Create/update users | ✓ | - | - | - |
| users:delete | Delete users | ✓ | - | - | - |
| **Courses** |
| courses:read | View courses | ✓ | ✓ | ✓ | - |
| courses:write | Create/update courses | ✓ | ✓ | - | - |
| courses:delete | Delete courses | ✓ | - | - | - |
| **Content** |
| content:read | View content | ✓ | ✓ | ✓ | - |
| content:write | Create/update content | ✓ | ✓ | - | - |
| content:delete | Delete content | ✓ | ✓ | - | - |
| **Assessments** |
| assessments:read | View assessments | ✓ | ✓ | ✓ | - |
| assessments:write | Create/update assessments | ✓ | ✓ | - | - |
| assessments:grade | Grade assessments | ✓ | ✓ | - | - |
| **Payments** |
| payments:read | View payments | ✓ | - | ✓ | - |
| payments:write | Process payments | ✓ | - | - | - |
| payments:refund | Issue refunds | ✓ | - | - | - |
| **System** |
| system:read | View system info | ✓ | - | - | - |
| system:write | Modify system | ✓ | - | - | - |
| system:configure | Configure system | ✓ | - | - | - |

## Usage Examples

### Protecting Routes by Role

```javascript
const { requireRole, ROLES } = require('./middleware/rbac');

// Only admins can access
app.get('/api/admin/users', authenticateToken, requireRole(ROLES.ADMIN), handler);

// Admins and instructors can access
app.get('/api/courses/manage', authenticateToken, requireRole(ROLES.ADMIN, ROLES.INSTRUCTOR), handler);
```

### Protecting Routes by Permission

```javascript
const { requirePermission } = require('./middleware/rbac');

// Requires specific permission
app.post('/api/courses', authenticateToken, requirePermission('courses:write'), handler);
app.delete('/api/users/:id', authenticateToken, requirePermission('users:delete'), handler);
```

## Adding New Permissions

Edit `src/middleware/rbac.js`:

```javascript
const PERMISSIONS = {
  'resource:action': [ROLES.ADMIN, ROLES.OTHER_ROLE],
  // Add new permissions here
};
```
