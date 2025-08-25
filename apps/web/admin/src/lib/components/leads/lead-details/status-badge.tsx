import {AlertCircle, Calendar, CheckCircle, MessageSquare} from "lucide-react";

export const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    contacted: {
      bg: 'bg-yellow-600/20',
      text: 'text-yellow-400',
      border: 'border-yellow-600/30',
      label: 'Not Converted',
      icon: MessageSquare
    },
    scheduled: {
      bg: 'bg-blue-600/20',
      text: 'text-blue-400',
      border: 'border-blue-600/30',
      label: 'Scheduled',
      icon: Calendar
    },
    converted: {
      bg: 'bg-green-600/20',
      text: 'text-green-400',
      border: 'border-green-600/30',
      label: 'Converted',
      icon: CheckCircle
    },
    unresponsive: {
      bg: 'bg-red-600/20',
      text: 'text-red-400',
      border: 'border-red-600/30',
      label: 'No Show',
      icon: AlertCircle
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.contacted;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} border ${config.border}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};
