'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function CallsPage() {
  const { data: calls, isLoading } = useQuery({
    queryKey: ['calls'],
    queryFn: () => apiClient.getCalls(),
  });

  // Group calls by status
  const inProgress = calls?.filter((c: any) => c.status === 'in_progress') || [];
  const scheduled = calls?.filter((c: any) => c.status === 'scheduled') || [];
  const completed = calls?.filter((c: any) => c.status === 'completed') || [];
  const failed = calls?.filter((c: any) => c.status === 'failed' || c.status === 'no_answer') || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calls</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage scheduled calls and view call history
            </p>
          </div>
          <Button>📞 Schedule Call</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Today's Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {scheduled.length + inProgress.length + completed.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {completed.length} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {inProgress.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">
                Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {scheduled.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-700">
                {calls && calls.length > 0
                  ? Math.round((completed.length / calls.length) * 100)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* In Progress Calls */}
        {inProgress.length > 0 && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="animate-pulse">🔵</span> Calls In Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inProgress.map((call: any) => (
                <CallCard key={call.id} call={call} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Scheduled Calls */}
        {scheduled.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>⏳ Scheduled Calls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduled.map((call: any) => (
                <CallCard key={call.id} call={call} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Completed Calls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>✅ Recent Completed Calls</CardTitle>
              <span className="text-sm text-gray-600">
                {completed.length} total
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading calls...</div>
            ) : completed.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No completed calls yet</div>
            ) : (
              <div className="space-y-3">
                {completed.slice(0, 10).map((call: any) => (
                  <CallCard key={call.id} call={call} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Failed/Missed Calls */}
        {failed.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">❌ Failed/Missed Calls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {failed.map((call: any) => (
                <CallCard key={call.id} call={call} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function CallCard({ call }: { call: any }) {
  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-900 border-green-200',
    in_progress: 'bg-blue-100 text-blue-900 border-blue-200',
    scheduled: 'bg-purple-100 text-purple-900 border-purple-200',
    failed: 'bg-red-100 text-red-900 border-red-200',
    no_answer: 'bg-orange-100 text-orange-900 border-orange-200',
  };

  const statusIcons: Record<string, string> = {
    completed: '✅',
    in_progress: '🔵',
    scheduled: '⏳',
    failed: '❌',
    no_answer: '📵',
  };

  const getSentimentEmoji = (score: number | null) => {
    if (!score) return '😐';
    if (score > 0.6) return '😊';
    if (score > 0.3) return '😐';
    return '😔';
  };

  return (
    <div
      className={`border rounded-lg p-4 ${
        statusColors[call.status] || 'bg-gray-100 text-gray-900 border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{statusIcons[call.status]}</span>
            <span className="font-semibold">
              {call.resident?.firstName} {call.resident?.lastName}
            </span>
            {call.resident?.roomNumber && (
              <Badge variant="outline" className="text-xs">
                Room {call.resident.roomNumber}
              </Badge>
            )}
            {call.isFirstCall && (
              <Badge variant="outline" className="text-xs bg-yellow-100">
                First Call
              </Badge>
            )}
          </div>
          <div className="text-sm opacity-75">
            <Badge variant="outline" className="text-xs mr-2">
              Call #{call.callNumber}
            </Badge>
            {call.direction === 'INBOUND' ? '📞 Inbound' : '📱 Outbound'}
          </div>
        </div>
        <div className="text-right text-sm">
          {call.endedAt && (
            <div className="font-medium">
              {formatDistanceToNow(new Date(call.endedAt), { addSuffix: true })}
            </div>
          )}
          {call.scheduledAt && !call.endedAt && (
            <div className="font-medium">
              Scheduled: {new Date(call.scheduledAt).toLocaleTimeString()}
            </div>
          )}
          {call.durationSeconds && (
            <div className="opacity-75">
              {Math.floor(call.durationSeconds / 60)}:{String(call.durationSeconds % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>

      {call.summary && (
        <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
          <div className="text-sm line-clamp-2">{call.summary}</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {call.sentimentScore !== null && (
            <Badge variant="outline" className="text-xs">
              {getSentimentEmoji(call.sentimentScore)} Sentiment
            </Badge>
          )}
          {call.audioUrl && (
            <Badge variant="outline" className="text-xs">
              🎵 Audio
            </Badge>
          )}
          {call.transcript && (
            <Badge variant="outline" className="text-xs">
              📝 Transcript
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {call.status === 'scheduled' && (
            <>
              <Button size="sm" variant="ghost">
                Reschedule
              </Button>
              <Button size="sm" variant="outline">
                Call Now
              </Button>
            </>
          )}
          {call.status === 'completed' && (
            <Link href={`/calls/${call.id}`}>
              <Button size="sm" variant="outline">
                View Details →
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
