'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function LifebooksPage() {
  const { data: residents } = useQuery({
    queryKey: ['residents'],
    queryFn: () => apiClient.getResidents(),
  });

  // Mock book status for now - in real app, would come from API
  const booksCollecting = residents?.filter((_: any, i: number) => i % 3 === 0) || [];
  const booksReady = residents?.filter((_: any, i: number) => i % 3 === 1) || [];
  const booksDelivered = residents?.filter((_: any, i: number) => i % 3 === 2) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Life Story Books</h1>
          <p className="text-sm text-gray-600 mt-1">
            Curate and manage resident life story books
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{residents?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-900">
                Collecting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {booksCollecting.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900">
                Ready for Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {booksReady.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">
                Delivered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {booksDelivered.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ready for Review */}
        {booksReady.length > 0 && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <span>✨</span> Ready for Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booksReady.map((resident: any) => (
                  <BookCard key={resident.id} resident={resident} status="ready" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Collecting Stories */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Collecting Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booksCollecting.length === 0 ? (
                <p className="text-sm text-gray-500 col-span-2">No books in collection phase</p>
              ) : (
                booksCollecting.map((resident: any) => (
                  <BookCard key={resident.id} resident={resident} status="collecting" />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivered */}
        {booksDelivered.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📦 Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booksDelivered.map((resident: any) => (
                  <BookCard key={resident.id} resident={resident} status="delivered" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function BookCard({ resident, status }: { resident: any; status: string }) {
  const statusConfig: Record<string, { badge: string; color: string; action: string }> = {
    collecting: {
      badge: 'Collecting',
      color: 'bg-yellow-100 border-yellow-200',
      action: 'Review Segments',
    },
    ready: {
      badge: 'Ready for Review',
      color: 'bg-green-100 border-green-200',
      action: 'Preview Book',
    },
    delivered: {
      badge: 'Delivered',
      color: 'bg-blue-100 border-blue-200',
      action: 'View Book',
    },
  };

  const config = statusConfig[status];

  // Mock data - in real app, would come from segments API
  const storyCount = Math.floor(Math.random() * 20) + 5;
  const chapterCount = Math.floor(Math.random() * 6) + 3;
  const duration = Math.floor(Math.random() * 40) + 15;

  return (
    <div className={`border rounded-lg p-4 ${config.color}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="font-semibold text-lg mb-1">
            {resident.firstName} {resident.lastName}
          </div>
          <Badge variant="outline" className="text-xs">
            {config.badge}
          </Badge>
        </div>
        <div className="text-right text-sm text-gray-600">
          Room {resident.roomNumber || 'N/A'}
        </div>
      </div>

      <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <div className="font-bold text-lg">{storyCount}</div>
            <div className="text-xs opacity-75">Stories</div>
          </div>
          <div>
            <div className="font-bold text-lg">{chapterCount}</div>
            <div className="text-xs opacity-75">Chapters</div>
          </div>
          <div>
            <div className="font-bold text-lg">{duration}</div>
            <div className="text-xs opacity-75">Minutes</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/viewer/${resident.id}`} className="flex-1" target="_blank">
          <Button size="sm" variant="outline" className="w-full bg-white">
            {config.action}
          </Button>
        </Link>
        <Button size="sm" variant="ghost" className="bg-white">
          Edit
        </Button>
      </div>
    </div>
  );
}
