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

interface FamilyMemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residentId: string;
  familyMember?: any; // If provided, we're editing; otherwise, creating
}

export function FamilyMemberFormDialog({
  open,
  onOpenChange,
  residentId,
  familyMember,
}: FamilyMemberFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!familyMember;

  // Form state
  const [formData, setFormData] = useState({
    firstName: familyMember?.firstName || '',
    lastName: familyMember?.lastName || '',
    relationship: familyMember?.relationship || '',
    phoneNumber: familyMember?.phoneNumber || '',
    email: familyMember?.email || '',
    canReceiveCheckIns: familyMember?.canReceiveCheckIns || false,
    canAccessStarred: familyMember?.canAccessStarred || false,
    notes: familyMember?.notes || '',
  });

  // Mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return apiClient.updateFamilyMember(familyMember.id, data);
      }
      return apiClient.createFamilyMember({
        ...data,
        residentId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members', residentId] });
      onOpenChange(false);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        relationship: '',
        phoneNumber: '',
        email: '',
        canReceiveCheckIns: false,
        canAccessStarred: false,
        notes: '',
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Family Member' : 'Add Family Member'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update family member information and permissions'
              : 'Add a new family member for this resident'}
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
                  placeholder="Sarah"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  required
                  placeholder="Johnson"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship *</Label>
              <Input
                id="relationship"
                value={formData.relationship}
                onChange={(e) => updateField('relationship', e.target.value)}
                required
                placeholder="e.g., Daughter, Son, Spouse, Friend"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
                required
                placeholder="+44 7700 900000"
              />
              <p className="text-xs text-gray-600">
                Used for family check-in calls and verification
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="sarah@example.com"
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Permissions</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="canReceiveCheckIns" className="text-sm font-medium">
                    Receive Check-in Calls
                  </Label>
                  <p className="text-xs text-gray-600">
                    Allow Linda to call for regular family check-ins
                  </p>
                </div>
                <Switch
                  id="canReceiveCheckIns"
                  checked={formData.canReceiveCheckIns}
                  onCheckedChange={(checked) =>
                    updateField('canReceiveCheckIns', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="canAccessStarred" className="text-sm font-medium">
                    Access Starred Memories
                  </Label>
                  <p className="text-xs text-gray-600">
                    View special moments marked by staff
                  </p>
                </div>
                <Switch
                  id="canAccessStarred"
                  checked={formData.canAccessStarred}
                  onCheckedChange={(checked) => updateField('canAccessStarred', checked)}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Staff Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="e.g., Primary contact, lives locally, prefers morning calls..."
              rows={3}
            />
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
              {isEditing ? 'Save Changes' : 'Add Family Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
