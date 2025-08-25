import {HelpCircle, Star, XCircle} from "lucide-react";

export const QualificationBadge = ({ qualified }: { qualified?: boolean | null }) => {
  if (qualified === null || qualified === undefined) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-400 border border-gray-600/30">
        <HelpCircle className="w-3 h-3 mr-1" />
        Not Assessed
      </span>
    );
  }

  if (qualified) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400 border border-green-600/30">
        <Star className="w-3 h-3 mr-1" />
        Qualified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/30">
      <XCircle className="w-3 h-3 mr-1" />
      Not Qualified
    </span>
  );
};
