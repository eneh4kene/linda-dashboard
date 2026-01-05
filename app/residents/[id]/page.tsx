'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ResidentFormDialog } from '@/components/resident-form-dialog';
import { FamilyMemberFormDialog } from '@/components/family-member-form-dialog';

export default function ResidentProfilePage() {
  const params = useParams();
  const residentId = params.id as string;
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isFamilyFormOpen, setIsFamilyFormOpen] = useState(false);
  const [editingFamilyMember, setEditingFamilyMember] = useState<any>(null);

  const { data: resident, isLoading } = useQuery({
    queryKey: ['resident', residentId],
    queryFn: () => apiClient.getResident(residentId),
  });

  const { data: familyMembers } = useQuery({
    queryKey: ['family-members', residentId],
    queryFn: () => apiClient.getFamilyMembers(residentId),
  });

  const { data: calls } = useQuery({
    queryKey: ['calls', residentId],
    queryFn: () => apiClient.getCalls({ residentId }),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading resident profile...</div>
      </DashboardLayout>
    );
  }

  if (!resident) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Resident not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/residents">
                <Button variant="ghost" size="sm">
                  ← Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">
                {resident.firstName} {resident.lastName}
              </h1>
              <Badge>{resident.status}</Badge>
            </div>
            {resident.preferredName && (
              <p className="text-gray-600 mt-1">Prefers: "{resident.preferredName}"</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditFormOpen(true)}>
              Edit Profile
            </Button>
            <Button>Call Now</Button>
          </div>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Consent */}
            <Card>
              <CardHeader>
                <CardTitle>Consent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <span>Phone calls</span>
                  </div>
                  <Badge variant={resident.callConsent ? 'default' : 'secondary'}>
                    {resident.callConsent ? 'Granted' : 'Not granted'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>📖</span>
                    <span>Life Story Book</span>
                  </div>
                  <Badge variant={resident.lifestoryConsent ? 'default' : 'secondary'}>
                    {resident.lifestoryConsent ? 'Granted' : 'Not granted'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>👨‍👩‍👧</span>
                    <span>Family check-ins</span>
                  </div>
                  <Badge variant={resident.familyCheckInConsent ? 'default' : 'secondary'}>
                    {resident.familyCheckInConsent ? 'Granted' : 'Not granted'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resident.favoriteTopics && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Topics to enjoy
                    </div>
                    <div className="text-sm text-gray-600">{resident.favoriteTopics}</div>
                  </div>
                )}
                {resident.avoidTopics && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Topics to avoid
                    </div>
                    <div className="text-sm text-gray-600">{resident.avoidTopics}</div>
                  </div>
                )}
                {resident.communicationNotes && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Communication notes
                    </div>
                    <div className="text-sm text-gray-600">
                      {resident.communicationNotes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Family Members */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Family Members ({familyMembers?.length || 0})</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingFamilyMember(null);
                      setIsFamilyFormOpen(true);
                    }}
                  >
                    + Add Family
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!familyMembers || familyMembers.length === 0 ? (
                  <p className="text-sm text-gray-500">No family members registered</p>
                ) : (
                  <div className="space-y-3">
                    {familyMembers.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <div className="font-medium">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <span>{member.relationship}</span>
                            {member.phoneVerified && (
                              <Badge variant="outline" className="text-xs">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {member.canReceiveCheckIns && (
                            <Badge variant="outline" className="text-xs">
                              Check-ins
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingFamilyMember(member);
                              setIsFamilyFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Calls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Calls ({calls?.length || 0})</CardTitle>
                  <Link href={`/calls?resident=${residentId}`}>
                    <Button variant="ghost" size="sm">
                      View All →
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {!calls || calls.length === 0 ? (
                  <p className="text-sm text-gray-500">No calls yet</p>
                ) : (
                  <div className="space-y-3">
                    {calls.slice(0, 5).map((call: any) => (
                      <div
                        key={call.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                              {call.status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {call.durationSeconds
                                ? `${Math.floor(call.durationSeconds / 60)} min`
                                : '-'}
                            </span>
                          </div>
                          {call.summary && (
                            <div className="text-sm text-gray-600 mt-1 line-clamp-1">
                              {call.summary}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {call.endedAt
                            ? new Date(call.endedAt).toLocaleDateString()
                            : 'Scheduled'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <div className="text-gray-600">Room</div>
                  <div className="font-medium">{resident.roomNumber || 'Not assigned'}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-gray-600">Phone</div>
                  <div className="font-medium">{resident.phoneNumber || 'Not provided'}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-gray-600">Facility</div>
                  <div className="font-medium">Sunny Meadows Care</div>
                </div>
                <Separator />
                <div>
                  <div className="text-gray-600">Joined</div>
                  <div className="font-medium">
                    {new Date(resident.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Life Story Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <Badge className="mt-1">Collecting</Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    14 stories • 5 chapters • 32 min
                  </div>
                  <Link href={`/lifebooks/${residentId}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Book →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Form Dialog */}
      <ResidentFormDialog
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        resident={resident}
      />

      {/* Family Member Form Dialog */}
      <FamilyMemberFormDialog
        open={isFamilyFormOpen}
        onOpenChange={setIsFamilyFormOpen}
        residentId={residentId}
        familyMember={editingFamilyMember}
      />
    </DashboardLayout>
  );
}
