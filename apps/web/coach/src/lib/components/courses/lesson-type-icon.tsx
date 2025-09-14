import React from 'react';
import { Video, FileText, FileDown } from 'lucide-react';

interface LessonTypeIconProps {
  type: string;
}

export const LessonTypeIcon: React.FC<LessonTypeIconProps> = ({ type }) => {
  const iconClass = "w-4 h-4";

  switch (type) {
    case 'video':
      return <Video className={iconClass} />;
    case 'text':
      return <FileText className={iconClass} />;
    case 'pdf':
      return <FileDown className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
};
