import React, { useState } from 'react';
import { X, Mail, Calendar } from 'lucide-react';
import { Button, Input, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@nlc-ai/web-ui';
import { toast } from 'sonner';
import { sdkClient } from '@/lib';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityID: string;
  onSuccess: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      communityID,
                                                                      onSuccess,
                                                                    }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    inviteeID: '',
    inviteeType: 'client' as 'coach' | 'client',
    message: '',
    expiresInDays: '7',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.inviteeID.trim()) {
      toast.error('Please enter a member ID');
      return;
    }

    setIsLoading(true);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expiresInDays));

      await sdkClient.communities.inviteMember(communityID, {
        inviteeID: formData.inviteeID.trim(),
        inviteeType: formData.inviteeType,
        message: formData.message.trim() || undefined,
        expiresAt: expiresAt.toISOString(),
      });

      toast.success('Invitation sent successfully!');
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        inviteeID: '',
        inviteeType: 'client',
        message: '',
        expiresInDays: '7',
      });
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700 shadow-2xl">
        {/* Glow orb */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute w-48 h-48 -right-12 -top-12 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Invite Member</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-stone-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Member ID
              </label>
              <Input
                value={formData.inviteeID}
                onChange={(e) => setFormData({ ...formData, inviteeID: e.target.value })}
                placeholder="Enter member ID"
                disabled={isLoading}
                className="bg-neutral-700/50 border-neutral-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Member Type
              </label>
              <Select
                value={formData.inviteeType}
                onValueChange={(value) => setFormData({ ...formData, inviteeType: value as 'coach' | 'client' })}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-neutral-700/50 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Invitation Message (Optional)
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Add a personal message..."
                rows={3}
                disabled={isLoading}
                className="bg-neutral-700/50 border-neutral-600 text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Expires In
              </label>
              <Select
                value={formData.expiresInDays}
                onValueChange={(value) => setFormData({ ...formData, expiresInDays: value })}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-neutral-700/50 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90"
              >
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
