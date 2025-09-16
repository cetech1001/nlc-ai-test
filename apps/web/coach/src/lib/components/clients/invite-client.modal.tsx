import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { Button, Input, Label, Textarea } from '@nlc-ai/web-ui';
import { toast } from 'sonner';
import {sdkClient} from "@/lib";

interface InviteClientModalProps {
  isOpen: boolean;
  userID: string;
  onClose: () => void;
  onInviteSuccess?: () => void;
}

export const InviteClientModal = ({ isOpen, userID, onClose, onInviteSuccess }: InviteClientModalProps) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  if (!isOpen) return null;

  const handleInviteClient = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsInviting(true);
    try {
      await sdkClient.users.relationship.inviteClient(inviteEmail, userID, inviteMessage);

      toast.success(`Invitation sent to ${inviteEmail}`);
      handleClose();
      onInviteSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleClose = () => {
    setInviteEmail('');
    setInviteMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8 w-full max-w-md">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-48 h-48 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Invite Client</h3>
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
              <Label htmlFor="inviteEmail" className="text-white text-sm mb-2 block">
                Email Address <span className="text-red-400">*</span>
              </Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address..."
                className="bg-neutral-800/50 border-neutral-600 text-white placeholder:text-stone-400"
              />
            </div>

            <div>
              <Label htmlFor="inviteMessage" className="text-white text-sm mb-2 block">
                Personal Message (Optional)
              </Label>
              <Textarea
                id="inviteMessage"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Add a personal message to the invitation..."
                rows={3}
                className="bg-neutral-800/50 border-neutral-600 text-white placeholder:text-stone-400 resize-none"
              />
              <p className="text-stone-400 text-xs mt-1">
                This message will be included in the invitation email.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
                disabled={isInviting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteClient}
                disabled={isInviting || !inviteEmail.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
