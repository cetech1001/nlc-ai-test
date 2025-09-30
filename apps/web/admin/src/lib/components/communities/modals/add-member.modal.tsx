import React, {useState} from 'react';
import {Shield, UserPlus, X} from 'lucide-react';
import {Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@nlc-ai/web-ui';
import {toast} from 'sonner';
import {sdkClient} from '@/lib';
import {MemberRole, UserType} from "@nlc-ai/types";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityID: string;
  onSuccess: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
                                                                isOpen,
                                                                onClose,
                                                                communityID,
                                                                onSuccess,
                                                              }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userID: '',
    userType: UserType.CLIENT,
    role: MemberRole.MEMBER,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userID.trim()) {
      toast.error('Please enter a user ID');
      return;
    }

    setIsLoading(true);

    try {
      await sdkClient.communities.addMember(communityID, {
        userID: formData.userID.trim(),
        userType: formData.userType,
        role: formData.role,
      });

      toast.success('Member added successfully!');
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        userID: '',
        userType: UserType.CLIENT,
        role: MemberRole.MEMBER,
      });
    } catch (error: any) {
      console.error('Failed to add member:', error);
      toast.error(error.message || 'Failed to add member');
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
          <div className="absolute w-48 h-48 -left-12 -top-12 bg-gradient-to-r from-blue-200 via-blue-600 to-cyan-600 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Add Member</h2>
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
                User ID
              </label>
              <Input
                value={formData.userID}
                onChange={(e) => setFormData({ ...formData, userID: e.target.value })}
                placeholder="Enter user ID"
                disabled={isLoading}
                className="bg-neutral-700/50 border-neutral-600 text-white"
              />
              <p className="text-xs text-stone-400 mt-1">
                The user must already exist in the system
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                User Type
              </label>
              <Select
                value={formData.userType}
                onValueChange={(value) => setFormData({ ...formData, userType: value as UserType })}
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
                <Shield className="w-4 h-4 inline mr-1" />
                Role
              </label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-neutral-700/50 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-stone-400 mt-1">
                Assigns permissions and access levels
              </p>
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
                className="flex-1 bg-gradient-to-t from-blue-200 via-blue-600 to-cyan-600 hover:opacity-90"
              >
                {isLoading ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
