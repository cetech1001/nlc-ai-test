import {MessageSquare, Star} from "lucide-react";
import {QualificationBadge} from "@/lib/components/leads/lead-details/qualification-badge";
import {FormAnswer} from "@/lib/components/leads/lead-details/form-answer";
import {Lead} from "@nlc-ai/sdk-leads";
import {FC} from "react";

interface IProps {
  lead: Lead;
}

export const FormResponses: FC<IProps> = ({ lead }) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden lg:col-span-2">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-emerald-200 via-emerald-600 to-blue-600 rounded-full blur-[56px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-stone-50 text-lg font-medium">Form Responses</h3>
              <p className="text-stone-400 text-sm">{Object.keys(lead.answers!).length} questions answered</p>
            </div>
          </div>

          {/* Qualification Summary */}
          <div className="text-right">
            <div className="text-sm text-stone-400 mb-1">Lead Assessment</div>
            <QualificationBadge qualified={lead.qualified} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(lead.answers!)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([questionNumber, answer]) => (
              <FormAnswer
                key={questionNumber}
                questionNumber={questionNumber}
                answer={answer}
              />
            ))
          }
        </div>

        {/* Response Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-fuchsia-600/10 to-violet-600/10 border border-fuchsia-600/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-fuchsia-400" />
            <span className="text-white text-sm font-medium">Response Summary</span>
          </div>
          <div className="text-stone-300 text-sm">
            This lead completed a/an {Object.keys(lead.answers!).length}-question qualification form and has been
            {lead.qualified === true ? (
              <span className="text-green-400 font-medium"> qualified </span>
            ) : lead.qualified === false ? (
              <span className="text-red-400 font-medium"> marked as not qualified </span>
            ) : (
              <span className="text-gray-400 font-medium"> not yet assessed </span>
            )}
            based on their responses.
          </div>
        </div>
      </div>
    </div>
  );
}
