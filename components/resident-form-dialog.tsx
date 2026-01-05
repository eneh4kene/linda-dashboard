'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface ResidentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident?: any; // If provided, we're editing; otherwise, creating
}

export function ResidentFormDialog({
  open,
  onOpenChange,
  resident,
}: ResidentFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!resident;

  // Form state
  const [formData, setFormData] = useState({
    firstName: resident?.firstName || '',
    lastName: resident?.lastName || '',
    preferredName: resident?.preferredName || '',
    phoneNumber: resident?.phoneNumber || '',
    roomNumber: resident?.roomNumber || '',
    status: resident?.status || 'active',
    callConsent: resident?.callConsent || false,
    lifestoryConsent: resident?.lifestoryConsent || false,
    familyCheckInConsent: resident?.familyCheckInConsent || false,
    communicationNotes: resident?.communicationNotes || '',
    favoriteTopics: resident?.favoriteTopics || '',
    avoidTopics: resident?.avoidTopics || '',
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return apiClient.updateResident(resident.id, data);
      } else {
        return apiClient.createResident(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ['resident', resident.id] });
      }
      onOpenChange(false);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        preferredName: '',
        phoneNumber: '',
        roomNumber: '',
        status: 'active',
        callConsent: false,
        lifestoryConsent: false,
        familyCheckInConsent: false,
        communicationNotes: '',
        favoriteTopics: '',
        avoidTopics: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Resident' : 'Add New Resident'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update resident information and preferences'
              : 'Add a new resident to the care home'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  required
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="Smith"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input
                id="preferredName"
                value={formData.preferredName}
                onChange={(e) => updateField('preferredName', e.target.value)}
                placeholder="How they like to be addressed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => updateField('phoneNumber', e.target.value)}
                  placeholder="+44 7700 900000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => updateField('roomNumber', e.target.value)}
                  placeholder="101"
                />
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Consent</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="callConsent" className="text-sm font-medium">
                    Phone Calls
                  </Label>
                  <p className="text-xs text-gray-600">Allow Linda to call resident</p>
                </div>
                <Switch
                  id="callConsent"
                  checked={formData.callConsent}
                  onCheckedChange={(checked) => updateField('callConsent', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="lifestoryConsent" className="text-sm font-medium">
                    Life Story Book
                  </Label>
                  <p className="text-xs text-gray-600">Collect stories for life book</p>
                </div>
                <Switch
                  id="lifestoryConsent"
                  checked={formData.lifestoryConsent}
                  onCheckedChange={(checked) => updateField('lifestoryConsent', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="familyCheckInConsent" className="text-sm font-medium">
                    Family Check-ins
                  </Label>
                  <p className="text-xs text-gray-600">Enable family check-in calls</p>
                </div>
                <Switch
                  id="familyCheckInConsent"
                  checked={formData.familyCheckInConsent}
                  onCheckedChange={(checked) =>
                    updateField('familyCheckInConsent', checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Preferences</h3>

            <div className="space-y-2">
              <Label htmlFor="favoriteTopics">Topics to Enjoy</Label>
              <Textarea
                id="favoriteTopics"
                value={formData.favoriteTopics}
                onChange={(e) => updateField('favoriteTopics', e.target.value)}
                placeholder="e.g., Gardening, cooking, family stories..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avoidTopics">Topics to Avoid</Label>
              <Textarea
                id="avoidTopics"
                value={formData.avoidTopics}
                onChange={(e) => updateField('avoidTopics', e.target.value)}
                placeholder="e.g., Sensitive subjects or topics that cause distress..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="communicationNotes">Communication Notes</Label>
              <Textarea
                id="communicationNotes"
                value={formData.communicationNotes}
                onChange={(e) => updateField('communicationNotes', e.target.value)}
                placeholder="e.g., Speaks softly, prefers morning calls, hard of hearing..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isEditing ? 'Save Changes' : 'Add Resident'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
