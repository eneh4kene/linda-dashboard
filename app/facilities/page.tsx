'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useRBAC } from '@/lib/use-rbac';

export default function FacilitiesPage() {
  const { can } = useRBAC();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<any>(null);

  const { data: facilities, isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => apiClient.getFacilities(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createFacility(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      setIsCreateDialogOpen(false);
      toast.success('Facility created successfully');
    },
    onError: () => {
      toast.error('Failed to create facility');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateFacility(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      setEditingFacility(null);
      toast.success('Facility updated successfully');
    },
    onError: () => {
      toast.error('Failed to update facility');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast.success('Facility deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete facility');
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage care facilities and their settings
            </p>
          </div>
          {can('create:facility') && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Facility</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Facility</DialogTitle>
                </DialogHeader>
                <FacilityForm
                  onSubmit={(data) => createMutation.mutate(data)}
                  isLoading={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Facilities Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-600">Loading facilities...</div>
        ) : facilities && facilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility: any) => (
              <Card key={facility.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{facility.name}</span>
                    <div className="flex gap-2">
                      {can('edit:facility') && (
                        <Dialog
                          open={editingFacility?.id === facility.id}
                          onOpenChange={(open) => !open && setEditingFacility(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingFacility(facility)}
                            >
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Facility</DialogTitle>
                            </DialogHeader>
                            <FacilityForm
                              facility={facility}
                              onSubmit={(data) =>
                                updateMutation.mutate({ id: facility.id, data })
                              }
                              isLoading={updateMutation.isPending}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                      {can('delete:facility') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete ${facility.name}? This will delete all associated residents and data.`
                              )
                            ) {
                              deleteMutation.mutate(facility.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Facility ID</div>
                    <div className="font-mono text-sm">{facility.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="text-sm">{facility.phone || 'Not set'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Timezone</div>
                    <div className="text-sm">{facility.timezone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Residents</div>
                    <div className="text-sm font-semibold">
                      {facility._count?.residents || 0}
                    </div>
                  </div>
                  {facility.settings?.callSchedule && (
                    <div>
                      <div className="text-xs text-gray-500">Call Schedule</div>
                      <div className="text-sm">
                        {facility.settings.callSchedule.defaultTime}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4">🏥</div>
              <div className="text-lg font-medium text-gray-900">No facilities yet</div>
              <div className="text-sm text-gray-600 mt-1 mb-4">
                Create your first facility to get started
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Add Your First Facility
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function FacilityForm({
  facility,
  onSubmit,
  isLoading,
}: {
  facility?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: facility?.name || '',
    phone: facility?.phone || '',
    timezone: facility?.timezone || 'Europe/London',
    defaultCallTime: facility?.settings?.callSchedule?.defaultTime || '14:00',
    excludeDays: facility?.settings?.callSchedule?.excludeDays || [0, 6],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      phone: formData.phone,
      timezone: formData.timezone,
      settings: {
        callSchedule: {
          defaultTime: formData.defaultCallTime,
          excludeDays: formData.excludeDays,
        },
        familyCheckIns: {
          enabled: true,
          frequency: 'weekly',
        },
      },
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Facility Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Brunnel Care Homes"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+44 1234 567890"
        />
      </div>

      <div>
        <Label htmlFor="timezone">Timezone</Label>
        <select
          id="timezone"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
        >
          <option value="Europe/London">Europe/London (GMT)</option>
          <option value="America/New_York">America/New_York (EST)</option>
          <option value="America/Chicago">America/Chicago (CST)</option>
          <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
          <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
        </select>
      </div>

      <div>
        <Label htmlFor="defaultCallTime">Default Call Time</Label>
        <Input
          id="defaultCallTime"
          type="time"
          value={formData.defaultCallTime}
          onChange={(e) =>
            setFormData({ ...formData, defaultCallTime: e.target.value })
          }
        />
        <p className="text-xs text-gray-500 mt-1">
          Time when family check-in calls will be made
        </p>
      </div>

      <div>
        <Label>Exclude Days</Label>
        <div className="flex gap-2 flex-wrap">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <label
              key={day}
              className="flex items-center gap-1 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.excludeDays.includes(index)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      excludeDays: [...formData.excludeDays, index],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      excludeDays: formData.excludeDays.filter((d: number) => d !== index),
                    });
                  }
                }}
              />
              {day}
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Days when calls should not be made
        </p>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : facility ? 'Update Facility' : 'Create Facility'}
        </Button>
      </div>
    </form>
  );
}
