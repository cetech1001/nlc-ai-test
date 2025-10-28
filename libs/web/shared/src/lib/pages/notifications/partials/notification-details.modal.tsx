import React, {JSX} from 'react';
import { X } from 'lucide-react';
import { NotificationResponse } from "@nlc-ai/sdk-notifications";

interface NotificationDetailsModalProps {
  notification: NotificationResponse;
  onClose: () => void;
  getNotificationIcon: (type: string) => JSX.Element;
  formatTimestamp: (timestamp: string | Date) => string;
}

export const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
                                                                                    notification,
                                                                                    onClose,
                                                                                    getNotificationIcon,
                                                                                    formatTimestamp,
                                                                                  }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-gradient-to-b from-neutral-900 to-black border border-neutral-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-neutral-800 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-semibold text-xl mb-2">
                    {notification.title}
                  </h2>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-stone-500">
                      {formatTimestamp(notification.createdAt)}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      notification.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                        notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          notification.priority === 'normal' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                    }`}>
                      {notification.priority}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
            <div className="prose prose-invert max-w-none">
              <p className="text-stone-300 text-base leading-relaxed whitespace-pre-wrap">
                {notification.message}
              </p>
            </div>

            {/* Metadata Section */}
            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <h3 className="text-white font-medium text-sm mb-4">Additional Information</h3>
                <div className="space-y-3">
                  {notification.metadata.communityName && (
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500 text-sm">Community:</span>
                      <span className="text-purple-400 text-sm">{notification.metadata.communityName}</span>
                    </div>
                  )}

                  {notification.metadata.authorName && (
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500 text-sm">From:</span>
                      <span className="text-blue-400 text-sm">{notification.metadata.authorName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-black/90 backdrop-blur-sm border-t border-neutral-800 p-4">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
