# Testing Authentication Flow

## Manual Testing Steps:

1. **Start the dashboard:**
   ```bash
   npm run dev
   ```
   Dashboard should be running on http://localhost:3001

2. **Visit http://localhost:3001**
   - Should redirect to /login (not authenticated)

3. **Login Page:**
   - Use test credentials:
     - Email: `manager@sunnymeadows.com`
     - Password: `TestPassword123!`
   - Click "Sign In"
   - Should redirect to dashboard home page

4. **Dashboard Home:**
   - Should see user menu in top right with "Manager Smith" and "MANAGER" badge
   - Should see concerns, check-ins, and stats
   - Click user menu -> should see dropdown with email and Sign Out button

5. **Test Logout:**
   - Click "Sign Out"
   - Should redirect to /login
   - Should be logged out (localStorage cleared)

6. **Test Different Roles:**
   - Login as ADMIN: `admin@linda.com`
   - Login as STAFF: `staff@sunnymeadows.com`
   - Each should show appropriate role badge

## Automated Test (Run after manual testing):

```bash
npm test -- __tests__/api-client.test.ts
```

All 12 tests should pass with authentication working.
