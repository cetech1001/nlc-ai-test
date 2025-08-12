import {FC} from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface AlertMessagesProps {
  success?: string | null;
  error?: string | null;
}

export const AlertMessages: FC<AlertMessagesProps> = ({ success, error }) => {
  if (!success && !error) return null;

  return (
    <div className="space-y-4 mb-6">
      {success && (
        <div className="p-4 bg-green-800/20 border border-green-600 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-800/20 border border-red-600 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
