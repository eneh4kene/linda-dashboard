'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { exportToCSV, exportToPDF } from '@/lib/export-utils';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { data: residents } = useQuery({
    queryKey: ['residents'],
    queryFn: () => apiClient.getResidents('brunnel-001'),
  });

  const { data: calls } = useQuery({
    queryKey: ['calls'],
    queryFn: () => apiClient.getCalls(),
  });

  const { data: concerns } = useQuery({
    queryKey: ['concerns'],
    queryFn: () => apiClient.getConcerns({ facilityId: 'brunnel-001' }),
  });

  const { data: summary } = useQuery({
    queryKey: ['check-ins-summary', 30],
    queryFn: () => apiClient.getCheckInsSummary(30, 'brunnel-001'),
  });

  const hasData = residents && residents.length > 0;

  const handleExportCSV = () => {
    if (!hasData) {
      toast.error('No data available to export');
      return;
    }

    try {
      const reportData = [
        {
          Category: 'Total Residents',
          Value: residents?.length || 0,
        },
        {
          Category: 'Total Calls',
          Value: calls?.length || 0,
        },
        {
          Category: 'Total Concerns',
          Value: concerns?.total || 0,
        },
        {
          Category: 'Family Check-ins',
          Value: summary?.summary.totalCheckIns?.toString() || '0',
        },
      ];

      exportToCSV(reportData, `brunnel-report-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const handleExportPDF = () => {
    if (!hasData) {
      toast.error('No data available to export');
      return;
    }

    try {
      const content = `
        <h1>Brunnel Care Homes - Report</h1>
        <p>Generated: ${new Date().toLocaleDateString()}</p>

        <div class="section">
          <h2>Overview</h2>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Residents</td><td>${residents?.length || 0}</td></tr>
            <tr><td>Total Calls</td><td>${calls?.length || 0}</td></tr>
            <tr><td>Total Concerns</td><td>${concerns?.total || 0}</td></tr>
            <tr><td>Family Check-ins</td><td>${summary?.summary.totalCheckIns || 0}</td></tr>
          </table>
        </div>
      `;

      exportToPDF(content, `brunnel-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Opening print dialog...');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  // Show getting started guide if no residents
  if (!hasData) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-sm text-gray-600 mt-1">
                Analytics and performance metrics for Brunnel Care Homes
              </p>
            </div>
          </div>

          {/* Getting Started Card */}
          <Card>
            <CardContent className="py-12">
              <div className="text-center max-w-2xl mx-auto">
                <div className="text-6xl mb-6">📊</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Welcome to Brunnel Care Homes!
                </h2>
                <p className="text-gray-600 mb-8">
                  Your facility has been successfully set up. To start seeing reports and analytics,
                  follow these steps:
                </p>

                <div className="text-left space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Add Residents</h3>
                      <p className="text-sm text-gray-600">
                        Go to the Residents page and add your first residents with their basic
                        information and room numbers.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Add Family Members</h3>
                      <p className="text-sm text-gray-600">
                        For each resident, add their family members with contact information to
                        enable check-in calls.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Start Making Calls</h3>
                      <p className="text-sm text-gray-600">
                        Once family members are added, Linda will start making regular check-in
                        calls to collect stories and updates.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">View Reports</h3>
                      <p className="text-sm text-gray-600">
                        After calls are made, return here to view analytics, export reports, and
                        track engagement.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3 justify-center">
                  <Button onClick={() => window.location.href = '/residents'}>
                    Add Your First Resident
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facility Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Facility Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Facility Name</div>
                  <div className="font-semibold">Brunnel Care Homes</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Facility ID</div>
                  <div className="font-mono text-sm">brunnel-001</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Timezone</div>
                  <div className="font-semibold">Europe/London</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Call Schedule</div>
                  <div className="font-semibold">14:00 (Mon-Fri)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show actual reports when data exists
  const residentCount = residents?.length || 0;
  const callCount = calls?.length || 0;
  const concernCount = concerns?.total || 0;
  const checkInCount = summary?.summary.totalCheckIns || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-600 mt-1">
              Analytics and performance metrics for Brunnel Care Homes
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              📄 Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              📊 Export CSV
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Residents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{residentCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{callCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Concerns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{concernCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Family Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{checkInCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Residents Section */}
        <Card>
          <CardHeader>
            <CardTitle>Residents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Total" value={residentCount.toString()} />
              <StatCard
                title="With Family Members"
                value={residents?.filter((r: any) => r._count?.familyMembers > 0).length.toString() || '0'}
              />
              <StatCard
                title="Active Calls"
                value={residents?.filter((r: any) => r.status === 'active').length.toString() || '0'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Calls Section */}
        {callCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Calls" value={callCount.toString()} />
                <StatCard
                  title="Completed"
                  value={calls?.filter((c: any) => c.status === 'completed').length.toString() || '0'}
                />
                <StatCard
                  title="In Progress"
                  value={calls?.filter((c: any) => c.status === 'in-progress').length.toString() || '0'}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Concerns Section */}
        {concernCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total" value={concernCount.toString()} />
                <StatCard
                  title="High Priority"
                  value={concerns?.concerns?.filter((c: any) => c.concern.severity === 'high').length.toString() || '0'}
                />
                <StatCard
                  title="Medium Priority"
                  value={concerns?.concerns?.filter((c: any) => c.concern.severity === 'medium').length.toString() || '0'}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Family Engagement */}
        {checkInCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Family Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                  title="Check-in calls (Last 30 days)"
                  value={checkInCount.toString()}
                />
                <StatCard
                  title="Avg per resident"
                  value={residentCount > 0 ? (checkInCount / residentCount).toFixed(1) : '0'}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
