import React, { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Button } from '@nlc-ai/web-ui';

interface DeleteAccountFlowProps {
  onDeleteAccount: () => Promise<void>;
}

export const DeleteAccountFlow: React.FC<DeleteAccountFlowProps> = ({
                                                                      onDeleteAccount,
                                                                    }) => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [feedback, setFeedback] = useState('');

  const reasons = [
    'No longer need the service',
    'Found a better alternative',
    'Too expensive',
    'Difficult to use',
    'Not enough features',
    'Technical issues',
    'Other'
  ];

  const handleStartDelete = () => {
    setShowModal(true);
    setStep(1);
    setConfirmText('');
    setDeleteReason('');
    setFeedback('');
  };

  const handleClose = () => {
    if (!isDeleting) {
      setShowModal(false);
      setStep(1);
      setConfirmText('');
      setDeleteReason('');
      setFeedback('');
    }
  };

  const handleNextStep = () => {
    if (step === 1 && deleteReason) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinalDelete = async () => {
    if (confirmText.toLowerCase() !== 'delete my account') {
      return;
    }

    try {
      setIsDeleting(true);
      await onDeleteAccount();
      // The parent component should handle redirecting after successful deletion
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      // Error handling should be done by parent component
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmTextValid = confirmText.toLowerCase() === 'delete my account';

  return (
    <>
      {/* Delete Account Button */}
      <div className="mt-8 pt-8 border-t border-neutral-700">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-red-400 text-lg font-semibold mb-2">Danger Zone</h3>
              <p className="text-stone-400 text-sm mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                onClick={handleStartDelete}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-700">
              <h2 className="text-xl font-semibold text-white">
                {step === 1 && 'Why are you leaving?'}
                {step === 2 && 'Help us improve'}
                {step === 3 && 'Confirm deletion'}
              </h2>
              {!isDeleting && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-6">
              {/* Step 1: Reason for deletion */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-stone-400 text-sm mb-4">
                    We're sorry to see you go. Please let us know why you're deleting your account:
                  </p>

                  <div className="space-y-2">
                    {reasons.map((reason) => (
                      <label key={reason} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="deleteReason"
                          value={reason}
                          checked={deleteReason === reason}
                          onChange={(e) => setDeleteReason(e.target.value)}
                          className="w-4 h-4 text-violet-500 border-neutral-600 focus:ring-violet-500 focus:ring-2"
                        />
                        <span className="text-white text-sm">{reason}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="flex-1 border-neutral-700 text-stone-300 hover:text-white hover:border-neutral-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={!deleteReason}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Optional feedback */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-stone-400 text-sm mb-4">
                    Your feedback helps us improve our platform. What could we have done better?
                  </p>

                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what we could improve (optional)..."
                    className="w-full h-32 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handlePrevStep}
                      variant="outline"
                      className="flex-1 border-neutral-700 text-stone-300 hover:text-white hover:border-neutral-500"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Final confirmation */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-red-400 font-medium mb-2">This action is permanent</h4>
                        <div className="text-stone-400 text-sm space-y-1">
                          <div>• Your account will be permanently deleted</div>
                          <div>• All your data, settings, and content will be lost</div>
                          <div>• Active subscriptions will be cancelled</div>
                          <div>• Connected integrations will be disconnected</div>
                          <div>• This action cannot be undone</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-3">
                      Type "delete my account" to confirm deletion:
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="delete my account"
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={isDeleting}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handlePrevStep}
                      disabled={isDeleting}
                      variant="outline"
                      className="flex-1 border-neutral-700 text-stone-300 hover:text-white hover:border-neutral-500"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleFinalDelete}
                      disabled={!isConfirmTextValid || isDeleting}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeleting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Deleting...
                        </div>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
