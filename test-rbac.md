# Testing Role-Based Access Control (RBAC)

## RBAC Implementation Summary

The dashboard implements facility-scoped RBAC:

- **ADMIN** = ai4e1 ltd (Linda's vendor) - Multi-facility system administrator
- **MANAGER** = Facility manager - Single-facility manager with full resident/concern management
- **STAFF** = Facility staff - Single-facility read-only user

## Role Scoping

### ADMIN (ai4e1 ltd)
- **Scope:** Multi-facility, system-wide
- Can switch between facilities using dropdown selector
- Sees all data across all facilities

### MANAGER (Facility Manager)
- **Scope:** Single facility only (locked to their `facilityId`)
- NO facility selector (shows "Your Facility: [name]")
- Sees only their facility's data (backend auto-filters)

### STAFF (Facility Staff)
- **Scope:** Single facility only (locked to their `facilityId`)
- NO facility selector (shows "Your Facility: [name]")
- Read-only access to their facility's data (backend auto-filters)

## Permissions Matrix

| Feature | ADMIN | MANAGER | STAFF |
|---------|-------|---------|-------|
| **Navigation** |
| Overview | ✅ | ✅ | ✅ |
| Residents | ✅ | ✅ | ✅ |
| Calls | ✅ | ✅ | ✅ |
| Concerns | ✅ | ✅ | ✅ |
| Life Story Books | ✅ | ✅ | ✅ |
| Reports | ✅ | ✅ | ❌ |
| **Facilities** | ✅ | ❌ | ❌ |
| **Facilities Page** |
| View facilities | ✅ | ❌ | ❌ |
| Create facility | ✅ | ❌ | ❌ |
| Edit facility | ✅ | ❌ | ❌ |
| Delete facility | ✅ | ❌ | ❌ |
| **Facility Selector** |
| Switch facilities | ✅ | ❌ | ❌ |
| See locked facility | ❌ | ✅ | ✅ |
| **Residents Page** |
| View residents | ✅ (all) | ✅ (own facility) | ✅ (own facility) |
| Create resident | ✅ | ✅ | ❌ |
| Edit resident | ✅ | ✅ | ❌ |
| Delete resident | ✅ | ❌ | ❌ |
| **Concerns Page** |
| View concerns | ✅ (all) | ✅ (own facility) | ✅ (own facility) |
| Action concerns | ✅ | ✅ | ❌ |
| **Lifebooks Page** |
| View lifebooks | ✅ (all) | ✅ (own facility) | ✅ (own facility) |
| Create lifebook | ✅ | ✅ | ❌ |
| **Reports Page** |
| View reports | ✅ (all) | ✅ (own facility) | ❌ |

## Testing Instructions

### Prerequisites

1. **Backend running:**
   ```bash
   cd linda_backend
   npm run dev
   ```

2. **Dashboard running:**
   ```bash
   cd linda-dashboard
   npm run dev
   ```

3. **Test data seeded:**
   ```bash
   cd linda_backend
   npx tsx scripts/seed-test-data.ts
   ```

### Test 1: ADMIN Role (Multi-Facility Access)

**Login:**
- Email: `admin@linda.com`
- Password: `TestPassword123!`
- This user has NO `facilityId` (can access all facilities)

**Expected Navigation:**
- ✅ Overview
- ✅ Residents
- ✅ Calls
- ✅ Concerns
- ✅ Life Story Books
- ✅ Reports
- ✅ **Facilities** ← Only ADMIN sees this

**Sidebar - Facility Selector:**
- Should show: "Current Facility" label
- Should show: Dropdown selector with all facilities
- Should allow: Switching between facilities
- Data should update when switching facilities

**Facilities Page:**
- Should see: "Add Facility" button
- Should see: All facilities in grid
- Each facility card should have: "Edit" and "Delete" buttons

**Residents Page:**
- Should see: "+ Add Resident" button
- Should see: Residents from selected facility
- Each resident row should have: "Edit" and "View →" buttons

**Concerns Page:**
- Should see: Concerns from selected facility
- Each concern should have: "✓ Reviewed", "✓ Actioned", "⚠️ Escalate" buttons

**Test switching facilities:**
- Change facility in dropdown
- Verify page reloads
- Verify data now shows different facility's residents/concerns

### Test 2: MANAGER Role (Single-Facility Management)

**Login:**
- Email: `manager@sunnymeadows.com`
- Password: `TestPassword123!`
- This user has `facilityId: "brunnel-001"` (Sunny Meadows Care Home)

**Expected Navigation:**
- ✅ Overview
- ✅ Residents
- ✅ Calls
- ✅ Concerns
- ✅ Life Story Books
- ✅ Reports
- ❌ **Facilities** ← NOT visible

**Sidebar - Facility Display:**
- Should show: "Your Facility" label
- Should show: "Sunny Meadows Care Home" (locked, not a dropdown)
- Should NOT show: Dropdown selector
- Should show: Resident count for their facility

**Facilities Tab:**
- Should NOT appear in navigation
- If manually navigating to `/facilities`, should return 403 or show empty page

**Residents Page:**
- Should see: "+ Add Resident" button
- Should see: ONLY residents from Sunny Meadows (facilityId: brunnel-001)
- Each resident row should have: "Edit" and "View →" buttons
- Should NOT see residents from other facilities

**Concerns Page:**
- Should see: ONLY concerns from Sunny Meadows
- Each concern should have: "✓ Reviewed", "✓ Actioned", "⚠️ Escalate" buttons
- Should NOT see concerns from other facilities

**Reports Page:**
- Should see: ONLY reports for Sunny Meadows
- Should NOT see data from other facilities

**Verify Data Isolation:**
- All data (residents, calls, concerns, reports) should be filtered to Sunny Meadows only
- Backend enforces this filter based on user's `facilityId`

### Test 3: STAFF Role (Single-Facility Read-Only)

**Login:**
- Email: `staff@sunnymeadows.com`
- Password: `TestPassword123!`
- This user has `facilityId: "brunnel-001"` (Sunny Meadows Care Home)

**Expected Navigation:**
- ✅ Overview
- ✅ Residents
- ✅ Calls
- ✅ Concerns
- ✅ Life Story Books
- ❌ **Reports** ← NOT visible
- ❌ **Facilities** ← NOT visible

**Sidebar - Facility Display:**
- Should show: "Your Facility" label
- Should show: "Sunny Meadows Care Home" (locked, not a dropdown)
- Should NOT show: Dropdown selector

**Residents Page:**
- Should NOT see: "+ Add Resident" button
- Should see: ONLY residents from Sunny Meadows
- Each resident row should have: ONLY "View →" button (NO "Edit" button)

**Concerns Page:**
- Should see: ONLY concerns from Sunny Meadows
- Should NOT see: Action buttons (Reviewed/Actioned/Escalate)
- Read-only view of concerns

**Reports Tab:**
- Should NOT appear in navigation
- If manually navigating to `/reports`, should show page but with no action buttons

**Verify Read-Only Access:**
- No "Add" buttons anywhere
- No "Edit" buttons anywhere
- No "Delete" buttons anywhere
- No action buttons on concerns
- All data is filtered to Sunny Meadows only

## Data Filtering (Backend)

The backend automatically filters data based on user role:

```typescript
// Example from /api/staff/concerns
const facilityFilter = req.user?.role === 'ADMIN'
  ? {}  // ADMIN: No filter, sees all facilities
  : { resident: { facilityId: req.user?.facilityId } };  // MANAGER/STAFF: Filtered to their facility
```

**This means:**
- ADMIN with no `facilityId` → Sees all data across all facilities (filtered by selected facility in UI)
- MANAGER with `facilityId: "brunnel-001"` → Backend automatically returns only Sunny Meadows data
- STAFF with `facilityId: "brunnel-001"` → Backend automatically returns only Sunny Meadows data

## Manual Test Checklist

### ADMIN Tests
- [ ] Can see Facilities tab in navigation
- [ ] Can see facility dropdown selector in sidebar
- [ ] Can switch between facilities
- [ ] Can create/edit/delete facilities
- [ ] Can create/edit residents
- [ ] Can action concerns
- [ ] Sees all data when switching facilities

### MANAGER Tests
- [ ] CANNOT see Facilities tab in navigation
- [ ] Sees locked facility name (no dropdown)
- [ ] Can create/edit residents (in their facility only)
- [ ] Can action concerns (in their facility only)
- [ ] Can view reports (for their facility only)
- [ ] ALL data is scoped to their facility

### STAFF Tests
- [ ] CANNOT see Facilities tab
- [ ] CANNOT see Reports tab
- [ ] Sees locked facility name (no dropdown)
- [ ] NO "Add Resident" button
- [ ] NO "Edit" buttons on residents
- [ ] NO action buttons on concerns
- [ ] ALL data is read-only and scoped to their facility

## Key Implementation Files

- **`lib/rbac.ts`** - RBAC configuration with facility-scoped permissions
- **`lib/use-rbac.ts`** - React hook for permission checks
- **`components/dashboard-layout.tsx`** - Navigation filtering + facility selector logic
- **`app/facilities/page.tsx`** - Facility RBAC controls (ADMIN only)
- **`app/residents/page.tsx`** - Resident RBAC controls
- **`app/concerns/page.tsx`** - Concern action RBAC controls
- **Backend: `src/routes/staff-dashboard.ts`** - Facility filtering logic

## Test Credentials

| Role | Email | Password | Facility |
|------|-------|----------|----------|
| ADMIN | admin@linda.com | TestPassword123! | (none - can access all) |
| MANAGER | manager@sunnymeadows.com | TestPassword123! | Sunny Meadows (brunnel-001) |
| STAFF | staff@sunnymeadows.com | TestPassword123! | Sunny Meadows (brunnel-001) |

## Expected RBAC Behavior Summary

✅ **ADMIN** = ai4e1 ltd vendor account
- Multi-facility system admin
- Can switch facilities
- Full CRUD on everything

✅ **MANAGER** = Facility manager
- Locked to ONE facility
- Can manage residents & concerns in their facility
- Cannot access Facilities tab
- Cannot switch facilities

✅ **STAFF** = Facility staff
- Locked to ONE facility
- Read-only access to their facility's data
- Cannot access Facilities or Reports tabs
- Cannot create/edit/delete anything
