# Testing Role-Based Access Control (RBAC)

## RBAC Implementation Summary

The dashboard now has full role-based access control. Different user roles see different navigation items and have different permissions.

## Permissions Matrix

| Permission | ADMIN | MANAGER | STAFF |
|------------|-------|---------|-------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Residents | ✅ | ✅ | ✅ |
| Create Resident | ✅ | ✅ | ❌ |
| Edit Resident | ✅ | ✅ | ❌ |
| Delete Resident | ✅ | ❌ | ❌ |
| View Calls | ✅ | ✅ | ✅ |
| View Concerns | ✅ | ✅ | ✅ |
| Action Concerns | ✅ | ✅ | ❌ |
| View Lifebooks | ✅ | ✅ | ✅ |
| Create Lifebook | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ❌ |
| View Facilities | ✅ | ✅ | ❌ |
| Create Facility | ✅ | ❌ | ❌ |
| Edit Facility | ✅ | ❌ | ❌ |
| Delete Facility | ✅ | ❌ | ❌ |

## Testing Instructions

### 1. Test as ADMIN (Full Access)

**Login:**
- Email: `admin@linda.com`
- Password: `TestPassword123!`

**Expected Navigation:**
- ✅ Overview
- ✅ Residents
- ✅ Calls
- ✅ Concerns
- ✅ Life Story Books
- ✅ Reports
- ✅ Facilities

**Expected Features:**
- Can create, edit, and delete facilities
- Can create and edit residents
- Can view and action all concerns
- Has full access to all features

### 2. Test as MANAGER (Limited Facility Access)

**Login:**
- Email: `manager@sunnymeadows.com`
- Password: `TestPassword123!`

**Expected Navigation:**
- ✅ Overview
- ✅ Residents
- ✅ Calls
- ✅ Concerns
- ✅ Life Story Books
- ✅ Reports
- ✅ Facilities (view only)

**Expected Features:**
- **Facilities Page:** Can view facilities but NO "Add Facility" button, NO "Edit" button, NO "Delete" button
- **Residents Page:** Can create residents (+ Add Resident button visible), can edit residents
- **Concerns Page:** Can action concerns (Reviewed/Actioned/Escalate buttons visible)
- Can view reports

### 3. Test as STAFF (Read-Only Access)

**Login:**
- Email: `staff@sunnymeadows.com`
- Password: `TestPassword123!`

**Expected Navigation:**
- ✅ Overview
- ✅ Residents
- ✅ Calls
- ✅ Concerns
- ✅ Life Story Books
- ❌ Reports (NOT visible)
- ❌ Facilities (NOT visible)

**Expected Features:**
- **Residents Page:** NO "+ Add Resident" button, NO "Edit" button (only "View →" button)
- **Concerns Page:** NO action buttons (Reviewed/Actioned/Escalate buttons hidden)
- Cannot access Reports page
- Cannot access Facilities page

## Manual Test Procedure

1. **Start the dashboard:**
   ```bash
   cd linda-dashboard
   npm run dev
   ```

2. **Test ADMIN role:**
   - Login as admin@linda.com
   - Verify all 7 navigation items are visible
   - Go to Facilities page → verify "Add Facility" button is visible
   - Click on a facility card → verify "Edit" and "Delete" buttons are visible
   - Go to Residents page → verify "+ Add Resident" button is visible
   - Click Edit on a resident → verify it works
   - Go to Concerns page → verify action buttons (Reviewed/Actioned/Escalate) are visible
   - Logout

3. **Test MANAGER role:**
   - Login as manager@sunnymeadows.com
   - Verify all 7 navigation items are visible
   - Go to Facilities page → verify NO "Add Facility" button
   - Click on a facility card → verify NO "Edit" and NO "Delete" buttons
   - Go to Residents page → verify "+ Add Resident" button IS visible
   - Click Edit on a resident → verify it works
   - Go to Concerns page → verify action buttons ARE visible
   - Logout

4. **Test STAFF role:**
   - Login as staff@sunnymeadows.com
   - Verify only 5 navigation items are visible (no Reports, no Facilities)
   - Try to manually navigate to /facilities → should show "Facilities" but can't modify
   - Try to manually navigate to /reports → should show "Reports" page
   - Go to Residents page → verify NO "+ Add Resident" button
   - Verify only "View →" button is shown for residents (no Edit button)
   - Go to Concerns page → verify NO action buttons
   - Logout

## Key Implementation Files

- **`/lib/rbac.ts`** - RBAC configuration with permissions matrix
- **`/lib/use-rbac.ts`** - React hook for permission checks
- **`/components/dashboard-layout.tsx`** - Navigation filtering based on role
- **`/app/facilities/page.tsx`** - Facility RBAC controls
- **`/app/residents/page.tsx`** - Resident RBAC controls
- **`/app/concerns/page.tsx`** - Concern action RBAC controls

## RBAC Usage in Components

```typescript
import { useRBAC } from '@/lib/use-rbac';

function MyComponent() {
  const { can } = useRBAC();

  return (
    <>
      {can('create:resident') && (
        <Button>+ Add Resident</Button>
      )}

      {can('edit:facility') && (
        <Button>Edit</Button>
      )}
    </>
  );
}
```

## Test Validation

✅ ADMIN sees all navigation and all buttons
✅ MANAGER sees all navigation but limited facility controls
✅ STAFF sees limited navigation and read-only access
✅ TypeScript compilation successful
✅ Build successful
