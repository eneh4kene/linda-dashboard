'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';

export default function Home() {
  const { data: summary } = useQuery({
    queryKey: ['check-ins-summary'],
    queryFn: () => apiClient.getCheckInsSummary(7),
  });

  const { data: concerns } = useQuery({
    queryKey: ['concerns'],
    queryFn: () => apiClient.getConcerns(),
  });

  const { data: recentCheckIns } = useQuery({
    queryKey: ['recent-check-ins'],
    queryFn: () => apiClient.getRecentCheckIns(5),
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
        {/* Needs Attention */}
        {concerns && concerns.total > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <span>🚨</span> NEEDS ATTENTION ({concerns.total})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {concerns.concerns.slice(0, 3).map((concern: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <Badge variant={concern.concern.severity === 'high' ? 'destructive' : 'secondary'}>
                    {concern.concern.severity}
                  </Badge>
                  <div>
                    <div className="font-medium text-red-900">
                      {concern.resident.name}
                    </div>
                    <div className="text-red-700">{concern.concern.description}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Check-Ins (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.summary.totalCheckIns || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                {summary?.summary.completed || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                With Concerns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {summary?.summary.withConcerns || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {summary?.summary.concernsBySeverity.high || 0} high priority
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Residents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-xs text-gray-500 mt-1">3 new this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Calls This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">34</div>
              <p className="text-xs text-gray-500 mt-1">93% completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Family Check-Ins */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Family Check-Ins</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCheckIns?.checkIns.length === 0 ? (
              <p className="text-sm text-gray-500">No recent check-ins</p>
            ) : (
              <div className="space-y-3">
                {recentCheckIns?.checkIns.slice(0, 5).map((checkIn: any) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {checkIn.familyMember.name} → {checkIn.resident.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {checkIn.familyMember.relationship} • {checkIn.moodSummary}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(checkIn.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
