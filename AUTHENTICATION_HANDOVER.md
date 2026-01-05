# Authentication Implementation Handover

## Overview

This document provides a comprehensive guide for implementing authentication in the Linda Dashboard. The current dashboard has all features implemented except for authentication and authorization.

## Current State

### What's Already Built
- ✅ Complete dashboard UI with 6 main pages
- ✅ API client with centralized endpoint management
- ✅ Forms for residents and family members
- ✅ Beautiful Life Story Book viewer
- ✅ Concern management with action buttons
- ✅ PDF/CSV export functionality
- ✅ React Query for server state management
- ✅ Toast notifications
- ✅ Responsive design

### What Needs to Be Added
- ❌ User authentication (login/logout)
- ❌ Role-based access control
- ❌ Protected routes
- ❌ Session management
- ❌ Password reset flow

---

## Recommended Approach: NextAuth.js

**Why NextAuth.js?**
- Battle-tested authentication for Next.js
- Supports email/password, OAuth, and more
- Built-in session management
- TypeScript support
- Easy integration with Prisma

### Installation

```bash
cd /Users/kene_eneh/linda-dashboard
npm install next-auth @auth/prisma-adapter bcrypt
npm install -D @types/bcrypt
```

---

## Step 1: Database Schema

Add the following models to your Prisma schema (`/Users/kene_eneh/linda_backend/prisma/schema.prisma`):

```prisma
// Staff/Admin Users
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  password      String    // Hashed with bcrypt
  role          UserRole  @default(STAFF)
  facilityId    String?
  facility      Facility? @relation(fields: [facilityId], references: [id])

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // NextAuth fields
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]

  @@index([facilityId])
  @@index([email])
}

enum UserRole {
  SUPER_ADMIN  // Full access to all facilities
  ADMIN        // Facility-level admin
  STAFF        // Care staff with read/write access
  VIEWER       // Read-only access
}

// NextAuth required models
model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

Run migration:
```bash
cd /Users/kene_eneh/linda_backend
npx prisma migrate dev --name add_auth_models
```

---

## Step 2: NextAuth Configuration

Create `/Users/kene_eneh/linda-dashboard/lib/auth.ts`:

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { facility: true },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          facilityId: user.facilityId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.facilityId = user.facilityId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.facilityId = token.facilityId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

---

## Step 3: API Route

Create `/Users/kene_eneh/linda-dashboard/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

---

## Step 4: Environment Variables

Add to `/Users/kene_eneh/linda-dashboard/.env.local`:

```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-key-generate-with-openssl-rand-base64-32
```

Generate secret:
```bash
openssl rand -base64 32
```

---

## Step 5: Session Provider

Update `/Users/kene_eneh/linda-dashboard/app/layout.tsx`:

```typescript
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## Step 6: Login Page

Create `/Users/kene_eneh/linda-dashboard/app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        router.push('/');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Linda Dashboard</CardTitle>
          <p className="text-gray-600">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Step 7: Protected Routes Middleware

Create `/Users/kene_eneh/linda-dashboard/middleware.ts`:

```typescript
export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## Step 8: Role-Based Access Control

Create `/Users/kene_eneh/linda-dashboard/lib/permissions.ts`:

```typescript
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER',
}

export const canEditResident = (role: string) => {
  return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF].includes(role as UserRole);
};

export const canViewLifebooks = (role: string) => {
  return true; // All roles can view
};

export const canExportReports = (role: string) => {
  return [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(role as UserRole);
};

export const canManageUsers = (role: string) => {
  return role === UserRole.SUPER_ADMIN;
};
```

---

## Step 9: Update Dashboard Layout

Update `/Users/kene_eneh/linda-dashboard/components/dashboard-layout.tsx` to show user info and logout:

```typescript
'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        {/* ... existing sidebar content ... */}

        {/* User section at bottom */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium">{session?.user?.name || 'User'}</div>
              <div className="text-xs text-gray-500">{session?.user?.role}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* ... existing content ... */}
        {children}
      </div>
    </div>
  );
}
```

---

## Step 10: Create Initial Admin User

Create a seed script `/Users/kene_eneh/linda_backend/prisma/seed-admin.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lindacare.com' },
    update: {},
    create: {
      email: 'admin@lindacare.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Created admin user:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run it:
```bash
cd /Users/kene_eneh/linda_backend
npx tsx prisma/seed-admin.ts
```

---

## Step 11: Type Definitions

Create `/Users/kene_eneh/linda-dashboard/types/next-auth.d.ts`:

```typescript
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      facilityId: string | null;
    };
  }

  interface User {
    role: string;
    facilityId: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    facilityId: string | null;
  }
}
```

---

## Step 12: Conditional UI Based on Roles

Example: Hide export buttons from VIEWER role in Reports page:

```typescript
import { useSession } from 'next-auth/react';
import { canExportReports } from '@/lib/permissions';

export default function ReportsPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1>Reports</h1>
        {session?.user && canExportReports(session.user.role) && (
          <div className="flex gap-2">
            <Button onClick={handleExportPDF}>Export PDF</Button>
            <Button onClick={handleExportCSV}>Export CSV</Button>
          </div>
        )}
      </div>
      {/* ... rest of page ... */}
    </DashboardLayout>
  );
}
```

---

## Testing Checklist

- [ ] Can log in with admin@lindacare.com / admin123
- [ ] Redirected to login when accessing protected routes without auth
- [ ] Session persists across page refreshes
- [ ] Logout works and redirects to login
- [ ] User info shows in dashboard
- [ ] Role-based UI elements show/hide correctly
- [ ] Can't access admin features as VIEWER role

---

## Security Best Practices

1. **Password Requirements**: Add validation for strong passwords
2. **Rate Limiting**: Add rate limiting to login endpoint (use `express-rate-limit` in backend)
3. **HTTPS**: Always use HTTPS in production
4. **Session Timeout**: Configure appropriate session expiry
5. **CSRF Protection**: NextAuth includes CSRF protection by default
6. **Password Reset**: Implement password reset flow (send email with token)

---

## Production Considerations

1. **Environment Variables**:
   - Use strong `NEXTAUTH_SECRET` in production
   - Set correct `NEXTAUTH_URL` for production domain

2. **Database**:
   - Ensure Prisma connection pooling is configured
   - Set up database backups

3. **Monitoring**:
   - Log authentication attempts
   - Monitor failed login attempts
   - Alert on suspicious activity

---

## Additional Features (Optional)

### Password Reset
1. Add `resetToken` and `resetTokenExpiry` to User model
2. Create `/forgot-password` page
3. Send email with reset link
4. Create `/reset-password/[token]` page

### Two-Factor Authentication
1. Install `@prisma/client` and `qrcode`
2. Add `twoFactorSecret` to User model
3. Implement TOTP verification

### OAuth Providers
Add Google/Microsoft login:

```typescript
import GoogleProvider from 'next-auth/providers/google';

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  // ... existing providers
]
```

---

## Support & Documentation

- NextAuth.js Docs: https://next-auth.js.org/
- Prisma Adapter: https://authjs.dev/reference/adapter/prisma
- Best Practices: https://next-auth.js.org/configuration/options#security

---

## Summary

This authentication system provides:
- ✅ Secure password-based login
- ✅ Role-based access control (4 roles)
- ✅ Protected routes
- ✅ Session management
- ✅ Easy integration with existing dashboard

**Estimated implementation time**: 4-6 hours

**Login credentials after setup**:
- Email: `admin@lindacare.com`
- Password: `admin123`

🚀 You're ready to implement authentication! Follow the steps above in order for a smooth implementation.
