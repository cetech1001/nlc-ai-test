import {EmailInSequence} from "@nlc-ai/types";
import {FC} from "react";

interface IProps {
  email: EmailInSequence | null;
}

export const EmailStats: FC<IProps> = (props) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute w-56 h-56 -left-12 -top-20 opacity-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      <div className="relative z-10">
        <h3 className="text-stone-50 text-lg font-semibold mb-4">Email Stats</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-stone-300">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
              props.email?.status === 'scheduled' ? 'bg-blue-700/20 text-blue-400 border-blue-700' :
                props.email?.status === 'sent' ? 'bg-green-700/20 text-green-400 border-green-700' :
                  'bg-gray-700/20 text-gray-400 border-gray-700'
            }`}>
                    {(props.email?.status?.charAt(0).toUpperCase() || '') + props.email?.status?.slice(1)}
                  </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-300">Sequence Position:</span>
            <span className="text-stone-50">{props.email?.sequenceOrder}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-300">Manually Edited:</span>
            <span className={props.email?.isEdited ? 'text-yellow-400' : 'text-green-400'}>
                    {props.email?.isEdited ? 'Yes' : 'No'}
                  </span>
          </div>
        </div>
      </div>
    </div>
  );
}
