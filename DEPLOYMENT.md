# Linda Dashboard - Deployment Guide

## Pre-Deployment Checklist

### ✅ Completed Checks
- [x] Build successful (`npm run build`)
- [x] No hardcoded API URLs (uses env vars)
- [x] Authentication implemented
- [x] Role-based access control (RBAC)
- [x] .env files in .gitignore
- [x] No console.log statements (only console.error for error handling)
- [x] Production-ready dependencies

### 🔧 Environment Variables

Required environment variables for production:

```bash
NEXT_PUBLIC_API_URL=https://api.linda.ai4e1.net
```

## Deployment to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare dashboard for production deployment"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `linda-dashboard`
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Set Environment Variables in Vercel
1. In project settings → Environment Variables
2. Add the following:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://api.linda.ai4e1.net
   Environment: Production, Preview
   ```

### Step 4: Configure Custom Domain
1. Go to project Settings → Domains
2. Add domain: `app.linda.ai4e1.net`
3. Vercel will provide DNS instructions
4. Add CNAME record in GoDaddy:
   ```
   Type: CNAME
   Name: app.linda
   Value: cname.vercel-dns.com
   TTL: 600 seconds
   ```
5. Wait for DNS propagation (5-30 minutes)

### Step 5: Deploy
- Vercel will automatically deploy when you push to `main` branch
- Each push creates a new deployment
- Production URL: `https://app.linda.ai4e1.net`

## Post-Deployment Verification

### Test Checklist
1. [ ] Dashboard loads at `https://app.linda.ai4e1.net`
2. [ ] Login page accessible
3. [ ] Login works with test credentials
4. [ ] API calls connect to production backend
5. [ ] Protected routes require authentication
6. [ ] Role-based access control works
7. [ ] WebSocket connections work (if applicable)

### Test Login
After deploying backend and creating admin user:
```
Email: [admin-email]
Password: [admin-password]
```

## DNS Configuration Summary

### GoDaddy DNS Records
Add these CNAME records for `ai4e1.net`:

```
# Dashboard (Vercel)
Type: CNAME
Name: app.linda
Value: cname.vercel-dns.com

# Backend API (Railway)
Type: CNAME
Name: api.linda
Value: [railway-provided-value]
```

## Security Notes

1. **HTTPS Only**: Both Vercel and Railway provide automatic SSL
2. **CORS**: Backend only accepts requests from `https://app.linda.ai4e1.net`
3. **Authentication**: JWT tokens stored in localStorage
4. **Session Management**: 7-day token expiry
5. **Role-Based Access**: ADMIN, MANAGER, STAFF roles enforced

## Monitoring

### Vercel Analytics
- Enable in Vercel dashboard → Analytics tab
- Monitor page load times, errors, and user traffic

### Error Tracking
- Check Vercel logs: Project → Deployments → [Latest] → Logs
- Check browser console for client-side errors

## Rollback Procedure

If deployment fails:
1. Go to Vercel → Deployments
2. Find last working deployment
3. Click "..." → Promote to Production

## Support

For deployment issues:
- Vercel Documentation: https://vercel.com/docs
- Railway Documentation: https://docs.railway.app
