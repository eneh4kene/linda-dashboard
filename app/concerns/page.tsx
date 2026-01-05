'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useRBAC } from '@/lib/use-rbac';

export default function ConcernsPage() {
  const { can } = useRBAC();

  const { data: concerns } = useQuery({
    queryKey: ['concerns'],
    queryFn: () => apiClient.getConcerns(),
  });

  const highPriority = concerns?.concerns.filter(
    (c: any) => c.concern.severity === 'high'
  );
  const mediumPriority = concerns?.concerns.filter(
    (c: any) => c.concern.severity === 'medium'
  );
  const lowPriority = concerns?.concerns.filter(
    (c: any) => c.concern.severity === 'low'
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Concerns & Alerts</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and acknowledge concerns flagged during family check-ins
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Concerns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{concerns?.total || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-900">
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {highPriority?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-900">
                Medium Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {mediumPriority?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-900">
                Low Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {lowPriority?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* High Priority Concerns */}
        {highPriority && highPriority.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <span>🔴</span> High Priority Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {highPriority.map((concern: any, idx: number) => (
                <ConcernCard key={idx} concern={concern} canAction={can('action:concerns')} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Medium Priority Concerns */}
        {mediumPriority && mediumPriority.length > 0 && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-900 flex items-center gap-2">
                <span>🟡</span> Medium Priority Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mediumPriority.map((concern: any, idx: number) => (
                <ConcernCard key={idx} concern={concern} canAction={can('action:concerns')} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Low Priority Concerns */}
        {lowPriority && lowPriority.length > 0 && (
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-900 flex items-center gap-2">
                <span>🟢</span> Low Priority Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowPriority.map((concern: any, idx: number) => (
                <ConcernCard key={idx} concern={concern} canAction={can('action:concerns')} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {concerns?.total === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4">✅</div>
              <div className="text-lg font-medium text-gray-900">No concerns</div>
              <div className="text-sm text-gray-600 mt-1">
                All family check-ins have been reviewed
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function ConcernCard({ concern, canAction }: { concern: any; canAction: boolean }) {
  const severityColors = {
    high: 'bg-red-100 text-red-900 border-red-200',
    medium: 'bg-orange-100 text-orange-900 border-orange-200',
    low: 'bg-yellow-100 text-yellow-900 border-yellow-200',
  };

  const handleReviewed = () => {
    toast.success('Concern marked as reviewed', {
      description: `${concern.resident.name} - ${concern.concern.type}`,
    });
  };

  const handleActioned = () => {
    toast.success('Concern marked as actioned', {
      description: `${concern.resident.name} - ${concern.concern.type}`,
    });
  };

  const handleEscalate = () => {
    toast.warning('Concern escalated to management', {
      description: `${concern.resident.name} - ${concern.concern.type}`,
    });
  };

  return (
    <div
      className={`border rounded-lg p-4 ${
        severityColors[concern.concern.severity as keyof typeof severityColors]
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{concern.resident.name}</span>
            <Badge variant="outline" className="text-xs">
              Room {concern.resident.roomNumber}
            </Badge>
          </div>
          <div className="text-sm opacity-75">
            Family: {concern.familyMember.name} ({concern.familyMember.relationship})
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="font-medium">
            {formatDistanceToNow(new Date(concern.checkInDate), { addSuffix: true })}
          </div>
          <div className="opacity-75">
            {new Date(concern.periodCovered.start).toLocaleDateString()} -{' '}
            {new Date(concern.periodCovered.end).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
        <div className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">
          {concern.concern.type}
        </div>
        <div className="font-medium">{concern.concern.description}</div>
      </div>

      {canAction && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white"
            onClick={handleReviewed}
          >
            ✓ Reviewed
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white"
            onClick={handleActioned}
          >
            ✓ Actioned
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white"
            onClick={handleEscalate}
          >
            ⚠️ Escalate
          </Button>
        </div>
      )}
    </div>
  );
}
