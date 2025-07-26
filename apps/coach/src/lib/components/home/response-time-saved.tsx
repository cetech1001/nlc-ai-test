import {Info} from "lucide-react";

export const ResponseTimeSaved = () => {
  return (
    <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-stone-50 text-xl font-medium leading-relaxed mb-2">
            Response Time Saved This Week
          </h3>
          <button className="text-stone-400 hover:text-stone-300">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-stone-50 text-4xl font-semibold mb-2">534 Hrs</div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-stone-300 text-sm">Consumed Through Platform</span>
            <span className="text-white text-sm font-medium">1,238</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-3 shadow-inner">
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 h-3 rounded-full shadow-lg" style={{ width: '40%' }}></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-stone-300 text-sm">Would Have Been Consumed Manually</span>
            <span className="text-white text-sm font-medium">1,832</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-3 shadow-inner">
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-3 rounded-full shadow-lg" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
