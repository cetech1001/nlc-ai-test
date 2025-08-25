import {FileText} from "lucide-react";
import {FC} from "react";

interface IProps {
  notes: string;
}

export const Notes: FC<IProps> = ({ notes }) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-stone-50 text-lg font-medium">Notes</h3>
        </div>

        <div className="bg-neutral-800/50 rounded-lg p-4">
          <p className="text-stone-300 leading-relaxed">{notes}</p>
        </div>
      </div>
    </div>
  );
}
