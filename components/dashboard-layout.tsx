'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Overview', href: '/', icon: '📊' },
  { name: 'Residents', href: '/residents', icon: '👥' },
  { name: 'Calls', href: '/calls', icon: '📞' },
  { name: 'Concerns', href: '/concerns', icon: '🚨' },
  { name: 'Life Story Books', href: '/lifebooks', icon: '📖' },
  { name: 'Reports', href: '/reports', icon: '📈' },
  { name: 'Facilities', href: '/facilities', icon: '🏥' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');

  const { data: facilities } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => apiClient.getFacilities(),
  });

  const { data: selectedFacility } = useQuery({
    queryKey: ['facility', selectedFacilityId],
    queryFn: () => apiClient.getFacility(selectedFacilityId),
    enabled: !!selectedFacilityId,
  });

  // Load selected facility from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selectedFacilityId');
    if (stored) {
      setSelectedFacilityId(stored);
    } else if (facilities && facilities.length > 0) {
      // Auto-select first facility if none selected
      const firstFacilityId = facilities[0].id;
      setSelectedFacilityId(firstFacilityId);
      localStorage.setItem('selectedFacilityId', firstFacilityId);
    }
  }, [facilities]);

  // Save to localStorage when selection changes
  const handleFacilityChange = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    localStorage.setItem('selectedFacilityId', facilityId);
    // Reload page to refresh all data with new facility
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Linda Dashboard</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Facility Selector (bottom of sidebar) */}
        <div className="p-4 border-t border-gray-200 bg-white space-y-3">
          {facilities && facilities.length > 0 ? (
            <>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Current Facility
              </div>
              <select
                value={selectedFacilityId}
                onChange={(e) => handleFacilityChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {facilities.map((facility: any) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
              {selectedFacility && (
                <div className="text-xs text-gray-500">
                  <div>{selectedFacility._count?.residents || 0} residents</div>
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-gray-500">
              <Link href="/facilities" className="text-blue-600 hover:underline">
                Create a facility
              </Link>{' '}
              to get started
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          <UserMenu />
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

// User Menu Component
function UserMenu() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const roleBadgeColor = {
    ADMIN: 'bg-purple-100 text-purple-800',
    MANAGER: 'bg-blue-100 text-blue-800',
    STAFF: 'bg-green-100 text-green-800',
  }[user.role];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
      >
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </div>
          <div className={cn('text-xs px-2 py-0.5 rounded-full inline-block', roleBadgeColor)}>
            {user.role}
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center">
          <span className="text-sm font-medium">{initials}</span>
        </div>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-gray-600">{user.email}</div>
              {user.facility && (
                <div className="text-xs text-gray-500 mt-1">{user.facility.name}</div>
              )}
            </div>
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={logout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Hook to get current facility ID
export function useCurrentFacility() {
  const [facilityId, setFacilityId] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('selectedFacilityId');
    if (stored) {
      setFacilityId(stored);
    }
  }, []);

  return facilityId || 'brunnel-001'; // Fallback to brunnel-001
}
