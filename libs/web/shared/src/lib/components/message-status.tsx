import { Check, CheckCheck, Clock } from 'lucide-react';

export interface MessageStatusProps {
  isOptimistic?: boolean;
  isRead?: boolean;
  isSent?: boolean;
  size?: 'sm' | 'md';
}

export const MessageStatus: React.FC<MessageStatusProps> = ({
                                                              isOptimistic = false,
                                                              isRead = false,
                                                              isSent = true,
                                                              size = 'sm'
                                                            }) => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  if (isOptimistic) {
    return (
      <div className="flex items-center gap-1 text-stone-400">
        <Clock className={`${iconSize} animate-spin`} />
        <span className="text-xs">Sending...</span>
      </div>
    );
  }

  if (isRead) {
    return (
      <div className="flex items-center gap-1 text-blue-400" title="Read">
        <CheckCheck className={iconSize} />
      </div>
    );
  }

  if (isSent) {
    return (
      <div className="flex items-center gap-1 text-stone-400" title="Delivered">
        <Check className={iconSize} />
      </div>
    );
  }

  return null;
};
