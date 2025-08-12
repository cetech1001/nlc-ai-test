import {AlertTriangle, Zap} from "lucide-react";
import {Button} from "@nlc-ai/web-ui";
import {DeliverabilityAnalysis} from "@nlc-ai/types";
import {FC} from "react";
import {getScoreBg, getScoreColor} from "@/lib";

interface IProps {
  isAnalyzing: boolean;
  quickScore: number | null;
  deliverabilityAnalysis: DeliverabilityAnalysis | null;
  handleFullAnalysis: () => void;
}

export const DeliverabilityAnalysisStats: FC<IProps> = (props) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute w-56 h-56 -left-12 -top-20 opacity-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-stone-50 text-lg font-semibold">Deliverability</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={props.handleFullAnalysis}
            disabled={props.isAnalyzing}
            className="border-neutral-600 text-stone-300 hover:text-stone-50 hover:border-purple-500"
          >
            {props.isAnalyzing ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Zap className="w-3 h-3" />
            )}
          </Button>
        </div>

        {props.deliverabilityAnalysis ? (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className={`p-3 rounded-lg border ${getScoreBg(props.deliverabilityAnalysis.overallScore)}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-200">Overall Score</span>
                <span className={`text-lg font-bold ${getScoreColor(props.deliverabilityAnalysis.overallScore)}`}>
                        {props.deliverabilityAnalysis.overallScore}%
                      </span>
              </div>
            </div>

            {/* Primary Inbox Probability */}
            <div className={`p-3 rounded-lg border ${getScoreBg(props.deliverabilityAnalysis.primaryInboxProbability)}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-200">Primary Inbox</span>
                <span className={`text-lg font-bold ${getScoreColor(props.deliverabilityAnalysis.primaryInboxProbability)}`}>
                        {props.deliverabilityAnalysis.primaryInboxProbability}%
                      </span>
              </div>
            </div>

            {/* Top Recommendations */}
            {props.deliverabilityAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-stone-50 mb-2">Top Issues:</h4>
                <div className="space-y-2">
                  {props.deliverabilityAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-stone-300">{rec.suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spam Triggers */}
            {props.deliverabilityAnalysis.spamTriggers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-stone-50 mb-2">Spam Triggers:</h4>
                <div className="space-y-1">
                  {props.deliverabilityAnalysis.spamTriggers.slice(0, 2).map((trigger, index) => (
                    <div key={index} className={`px-2 py-1 rounded text-xs ${
                      trigger.severity === 'high' ? 'bg-red-700/20 text-red-400' :
                        trigger.severity === 'medium' ? 'bg-yellow-700/20 text-yellow-400' :
                          'bg-gray-700/20 text-gray-400'
                    }`}>
                      "{trigger.trigger}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : props.quickScore !== null ? (
          <div className={`p-3 rounded-lg border ${getScoreBg(props.quickScore)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-200">Quick Score</span>
              <span className={`text-lg font-bold ${getScoreColor(props.quickScore)}`}>
                      {props.quickScore}%
                    </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">Run full analysis for detailed insights</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-stone-400">Analyzing deliverability...</p>
          </div>
        )}
      </div>
    </div>
  );
}
