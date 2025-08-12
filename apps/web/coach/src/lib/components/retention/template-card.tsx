import {Copy, Trash2, Archive} from "lucide-react";
import {FC} from "react";
import {EmailTemplate} from "@nlc-ai/types";

const templateTypeColors = {
  feedback: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  retention: 'bg-red-500/20 text-red-400 border-red-500/30',
  survey: 'bg-green-500/20 text-green-400 border-green-500/30',
  followup: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
};

const templateTypeLabels = {
  feedback: 'Feedback',
  retention: 'Retention',
  survey: 'Survey',
  followup: 'Follow-up'
};

interface TemplateCardProps {
  template: EmailTemplate;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TemplateCard: FC<TemplateCardProps> = ({ template, onEdit, onDuplicate, onDelete }) => {
  const color = template.category ? templateTypeColors[template.category as keyof typeof this] : '';
  const label = template.category ? templateTypeLabels[template.category as keyof typeof this] : 'No Label';
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
        <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>

      <div className="relative z-10 p-4 border-b border-neutral-700">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-stone-50 text-lg font-semibold leading-tight flex-1 line-clamp-2">
            {template.name}
          </h3>

          <div className="flex items-center gap-2 ml-3">
            <button
              onClick={() => onDuplicate(template.id)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors opacity-70 hover:opacity-100"
              title="Duplicate template"
            >
              <Copy className="w-4 h-4 text-stone-50" />
            </button>
            <button
              onClick={() => onDelete(template.id)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors opacity-70 hover:opacity-100"
              title="Delete template"
            >
              <Trash2 className="w-4 h-4 text-stone-50" />
            </button>
            <button
              onClick={() => onDelete(template.id)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors opacity-70 hover:opacity-100"
              title="Archive template"
            >
              <Archive className="w-4 h-4 text-stone-50" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
            {label}
          </span>

          <div className="text-stone-400 text-xs">
            Created: {template.createdAt?.toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="relative z-10 p-4 space-y-4">
        <div>
          <div className="text-stone-300 text-sm font-medium mb-2">Automated Email Template</div>
          <p className="text-stone-400 text-sm leading-relaxed line-clamp-3">
            {template.bodyTemplate}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-4">
            <span>Used {template.usageCount} times</span>
            {template.lastUsedAt && (
              <span>Last used: {template.lastUsedAt.toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => onEdit(template.id)}
            className="text-fuchsia-400 text-sm font-medium underline hover:text-fuchsia-300 transition-colors"
          >
            View & Edit Template
          </button>
        </div>
      </div>
    </div>
  );
};
