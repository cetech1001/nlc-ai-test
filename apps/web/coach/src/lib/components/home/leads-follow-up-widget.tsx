import { Phone } from "lucide-react";

interface LeadsFollowUpData {
  leadsOpenedLastEmail: number;
  bookedCalls: number;
  ghostedAgain: number;
}

interface IProps {
  data: LeadsFollowUpData;
}

export const LeadsFollowUpWidget = ({ data }: IProps) => {
  const hasActivity = data.leadsOpenedLastEmail > 0 || data.bookedCalls > 0 || data.ghostedAgain > 0;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-stone-50 text-md font-medium leading-relaxed">
            Leads to Follow Up
          </h3>
        </div>

        {hasActivity ? (
          <div className="space-y-2 text-stone-300 text-sm">
            <p>{data.leadsOpenedLastEmail} leads opened last email.</p>
            <p>{data.bookedCalls} booked a call.</p>
            <p>{data.ghostedAgain} ghosted again.</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-stone-400 text-sm">
              No lead activity yet. Your first leads will appear here once captured.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
