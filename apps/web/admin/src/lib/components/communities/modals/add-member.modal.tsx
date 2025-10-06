import {useEffect, useState} from 'react';
import {Plus, Shield, Users, X} from 'lucide-react';
import {Button, Input, Label} from '@nlc-ai/web-ui';
import {toast} from 'sonner';
import {sdkClient} from '@/lib';
import {UserType} from "@nlc-ai/types";

interface SystemUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  avatarUrl?: string;
  isActive: boolean;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityID: string;
  onAddSuccess?: () => void;
}

export const AddMemberModal = ({ isOpen, onClose, communityID, onAddSuccess }: AddMemberModalProps) => {
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [selectedRole, setSelectedRole] = useState('member');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSystemUsers();
    }
  }, [isOpen, userSearchQuery]);

  if (!isOpen) return null;

  const fetchSystemUsers = async () => {
    try {
      setIsLoadingUsers(true);

      // Fetch coaches and clients
      const [coachesResponse, clientsResponse] = await Promise.all([
        sdkClient.users.coaches.getCoaches({ search: userSearchQuery, limit: 50 }),
        sdkClient.users.clients.getClients({ search: userSearchQuery, limit: 50 }, {})
      ]);

      const coaches: SystemUser[] = coachesResponse.data.map(coach => ({
        id: coach.id,
        email: coach.email,
        firstName: coach.firstName,
        lastName: coach.lastName,
        userType: UserType.COACH,
        avatarUrl: coach.avatarUrl,
        isActive: coach.isActive || true,
      }));

      const clients: SystemUser[] = clientsResponse.data.map(client => ({
        id: client.id,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        userType: UserType.CLIENT,
        avatarUrl: client.avatarUrl,
        isActive: client.isActive || true,
      }));

      setSystemUsers([...coaches, ...clients]);
    } catch (error) {
      console.error('Failed to fetch system users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    setIsAddingMember(true);
    try {
      await sdkClient.communities.members.addMember(communityID, {
        userID: selectedUser.id,
        userType: selectedUser.userType,
        role: selectedRole as any,
      });

      toast.success(`${selectedUser.firstName} ${selectedUser.lastName} has been added to the community`);
      handleClose();
      onAddSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setSelectedRole('member');
    setUserSearchQuery('');
    setSystemUsers([]);
    onClose();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'moderator':
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const roles = [
    { value: 'member', label: 'Member', description: 'Can participate in discussions' },
    { value: 'moderator', label: 'Moderator', description: 'Can moderate content and manage members' },
    { value: 'admin', label: 'Admin', description: 'Full administrative access' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-48 h-48 -left-6 -top-10 bg-gradient-to-l from-emerald-200 via-emerald-600 to-blue-600 rounded-full blur-[56px]" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Add Member</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="userSearch" className="text-white text-sm mb-2 block">
                Search Users
              </Label>
              <Input
                id="userSearch"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search coaches or clients..."
                className="bg-neutral-800/50 border-neutral-600 text-white placeholder:text-stone-400"
              />
              <p className="text-stone-400 text-xs mt-1">
                Search by name or email to find existing users in the system.
              </p>
            </div>

            <div>
              <Label className="text-white text-sm mb-3 block">Select User</Label>
              <div className="max-h-60 overflow-y-auto space-y-2 border border-neutral-600 rounded-lg p-3 bg-neutral-800/30">
                {isLoadingUsers ? (
                  <div className="text-stone-400 text-center py-8 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading users...
                  </div>
                ) : systemUsers.length === 0 ? (
                  <div className="text-stone-400 text-center py-8">
                    {userSearchQuery ? 'No users found matching your search' : 'Start typing to search for users'}
                  </div>
                ) : (
                  systemUsers.map(user => (
                    <div
                      key={`${user.userType}-${user.id}`}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedUser?.id === user.id && selectedUser?.userType === user.userType
                          ? 'border-purple-600 bg-purple-600/20'
                          : 'border-neutral-600 bg-neutral-800/50 hover:bg-neutral-700/50'
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-stone-400 text-sm flex items-center gap-2">
                            {user.email}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              user.userType === 'coach'
                                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                                : 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                            }`}>
                              {user.userType}
                            </span>
                          </div>
                        </div>
                        {selectedUser?.id === user.id && selectedUser?.userType === user.userType && (
                          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedUser && (
              <div>
                <Label className="text-white text-sm mb-3 block">Assign Role</Label>
                <div className="space-y-3">
                  {roles.map(role => (
                    <div
                      key={role.value}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedRole === role.value
                          ? 'border-purple-600 bg-purple-600/20'
                          : 'border-neutral-600 bg-neutral-800/50 hover:bg-neutral-700/50'
                      }`}
                      onClick={() => setSelectedRole(role.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-purple-400">
                            {getRoleIcon(role.value)}
                          </div>
                          <div>
                            <div className="text-white font-medium">{role.label}</div>
                            <div className="text-stone-400 text-sm">{role.description}</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedRole === role.value
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-neutral-400'
                        }`}>
                          {selectedRole === role.value && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedUser && (
              <div className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-600">
                <h4 className="text-white font-medium mb-2">Selected User</h4>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {selectedUser.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-stone-200 text-sm font-medium">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </div>
                    <div className="text-stone-400 text-xs">
                      {selectedUser.email} • {selectedRole}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
                disabled={isAddingMember}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={isAddingMember || !selectedUser}
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                {isAddingMember ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
