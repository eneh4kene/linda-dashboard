'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ResidentFormDialog } from '@/components/resident-form-dialog';
import { useRBAC } from '@/lib/use-rbac';
import { toast } from 'sonner';

export default function ResidentsPage() {
  const { can } = useRBAC();
  const queryClient = useQueryClient();
  const [editingResident, setEditingResident] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: residents, isLoading } = useQuery({
    queryKey: ['residents'],
    queryFn: () => apiClient.getResidents(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteResident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      toast.success('Resident deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete resident');
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Residents</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage resident profiles, consent, and preferences
            </p>
          </div>
          {can('create:resident') && (
            <Button onClick={() => {
              setEditingResident(null);
              setIsFormOpen(true);
            }}>
              + Add Resident
            </Button>
          )}
        </div>

        {/* Residents Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Residents</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading residents...</div>
            ) : !residents || residents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No residents found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Consent</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residents.map((resident: any) => (
                    <TableRow key={resident.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {resident.firstName} {resident.lastName}
                          </div>
                          {resident.preferredName && (
                            <div className="text-sm text-gray-500">
                              "{resident.preferredName}"
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{resident.roomNumber || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={resident.status === 'active' ? 'default' : 'secondary'}
                        >
                          {resident.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {resident.callConsent && (
                            <Badge variant="outline" className="text-xs">
                              📞
                            </Badge>
                          )}
                          {resident.lifestoryConsent && (
                            <Badge variant="outline" className="text-xs">
                              📖
                            </Badge>
                          )}
                          {resident.familyCheckInConsent && (
                            <Badge variant="outline" className="text-xs">
                              👨‍👩‍👧
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {resident._count?.calls || 0}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {resident._count?.familyMembers || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {can('edit:resident') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingResident(resident);
                                setIsFormOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          )}
                          <Link href={`/residents/${resident.id}`}>
                            <Button variant="ghost" size="sm">
                              View →
                            </Button>
                          </Link>
                          {can('delete:resident') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to delete ${resident.firstName} ${resident.lastName || ''}? This will permanently delete all their data including calls, memories, and life story book.`
                                  )
                                ) {
                                  deleteMutation.mutate(resident.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <ResidentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        resident={editingResident}
      />
    </DashboardLayout>
  );
}
