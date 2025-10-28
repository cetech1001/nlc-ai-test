'use client';

import { useState } from 'react';
import { X, Crown, Shield, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import { MemberRole } from '@nlc-ai/types';
import { ExtendedCommunityMember } from '@nlc-ai/sdk-communities';

interface ChangeMemberRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: ExtendedCommunityMember | null;
  communityID: string;
  onSuccess: () => void;
  onRoleChange: (memberID: string, newRole: MemberRole) => Promise<void>;
}

const roleOptions = [
  {
    value: MemberRole.OWNER,
    label: 'Owner',
    icon: Crown,
    description: 'Full control over the community',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-600/20',
    borderColor: 'border-yellow-600/30',
  },
  {
    value: MemberRole.ADMIN,
    label: 'Admin',
    icon: Shield,
    description: 'Can manage community and members',
    color: 'text-purple-400',
    bgColor: 'bg-purple-600/20',
    borderColor: 'border-purple-600/30',
  },
  {
    value: MemberRole.MODERATOR,
    label: 'Moderator',
    icon: Users,
    description: 'Can moderate posts and comments',
    color: 'text-blue-400',
    bgColor: 'bg-blue-600/20',
    borderColor: 'border-blue-600/30',
  },
  {
    value: MemberRole.MEMBER,
    label: 'Member',
    icon: User,
    description: 'Standard community member',
    color: 'text-gray-400',
    bgColor: 'bg-gray-600/20',
    borderColor: 'border-gray-600/30',
  },
];

export const ChangeMemberRoleModal = ({
                                        isOpen,
                                        onClose,
                                        member,
                                        communityID,
                                        onSuccess,
                                        onRoleChange,
                                      }: ChangeMemberRoleModalProps) => {
  const [selectedRole, setSelectedRole] = useState<MemberRole | null>(member?.role || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !member) return null;

  const handleSubmit = async () => {
    if (!selectedRole || selectedRole === member.role) {
      toast.error('Please select a different role');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRoleChange(member.id, selectedRole);
      toast.success('Member role updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update member role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-neutral-800/95 to-neutral-900/95 rounded-[30px] border border-neutral-700 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-gradient-to-r from-purple-600 to-fuchsia-600 opacity-20 blur-3xl rounded-full" />
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-l from-violet-600 to-purple-600 opacity-20 blur-3xl rounded-full" />

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-1">Change Member Role</h2>
              <p className="text-stone-400 text-sm">
                Update the role for {member.userName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-400" />
            </button>
          </div>

          {/* Current Role Display */}
          <div className="mb-6 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <p className="text-sm text-stone-400 mb-2">Current Role</p>
            <div className="flex items-center gap-3">
              {roleOptions.find(r => r.value === member.role)?.icon && (
                <div className={`p-2 rounded-lg ${roleOptions.find(r => r.value === member.role)?.bgColor}`}>
                  {(() => {
                    const RoleIcon = roleOptions.find(r => r.value === member.role)?.icon;
                    return RoleIcon ? <RoleIcon className={`w-5 h-5 ${roleOptions.find(r => r.value === member.role)?.color}`} /> : null;
                  })()}
                </div>
              )}
              <div>
                <p className="text-white font-medium capitalize">{member.role}</p>
                <p className="text-sm text-stone-400">
                  {roleOptions.find(r => r.value === member.role)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3 mb-8">
            <label className="block text-sm font-medium text-stone-300 mb-3">
              Select New Role
            </label>
            {roleOptions.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.value;
              const isCurrent = member.role === role.value;

              return (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  disabled={isCurrent}
                  className={`w-full p-4 rounded-xl border transition-all ${
                    isSelected
                      ? `${role.bgColor} ${role.borderColor} border-2`
                      : 'bg-neutral-800/30 border-neutral-700 hover:bg-neutral-800/50'
                  } ${isCurrent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${role.bgColor}`}>
                      <Icon className={`w-6 h-6 ${role.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{role.label}</p>
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-700 text-stone-300">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-400">{role.description}</p>
                    </div>
                    {isSelected && !isCurrent && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedRole || selectedRole === member.role}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Updating...
                </div>
              ) : (
                'Update Role'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
