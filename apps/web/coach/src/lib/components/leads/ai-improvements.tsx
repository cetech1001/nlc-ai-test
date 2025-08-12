import {Sparkles} from "lucide-react";
import {EmailImprovement} from "@nlc-ai/types";
import {FC} from "react";
import { Skeleton } from "@nlc-ai/web-ui";

interface IProps {
  improvements: EmailImprovement[];
  isLoading: boolean;
}

export const AiImprovements: FC<IProps> = (props) => {
  if (props.isLoading) {
    return <Skeleton className="h-6 w-3/4" />;
  }
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute w-56 h-56 -left-12 -top-20 opacity-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      <div className="relative z-10">
        <h3 className="text-stone-50 text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          AI Suggestions
        </h3>

        <div className="space-y-3">
          {props.improvements.map((improvement, index) => (
            <div key={index} className="bg-neutral-800/50 border border-neutral-600 rounded-lg p-3">
              <div className="text-xs text-stone-400 mb-1">Suggestion #{index + 1}</div>
              <div className="text-sm text-stone-300 mb-2">{improvement.reason}</div>
              <div className="text-xs">
                <div className="text-red-400 mb-1">Before: "{improvement.original}"</div>
                <div className="text-green-400">After: "{improvement.improved}"</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
