import {Mail} from "lucide-react";

export const EmailSequence = () => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-emerald-600/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>

      <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Smart Email Automation</h3>
            <p className="text-[#A0A0A0] text-sm">AI-powered sequences based on lead status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-600/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-sm font-medium">Converted</span>
            </div>
            <p className="text-[#A0A0A0] text-xs">Onboarding sequence and success tips for new clients</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-yellow-600/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-yellow-400 text-sm font-medium">Not Converted</span>
            </div>
            <p className="text-[#A0A0A0] text-xs">Welcome & nurture sequence with value content and gentle follow-ups</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-600/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-blue-400 text-sm font-medium">Scheduled</span>
            </div>
            <p className="text-[#A0A0A0] text-xs">Meeting prep materials, confirmations, and reminders</p>
          </div>

          <div className="bg-gradient-to-br from-red-600/10 to-pink-600/10 border border-red-600/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-red-400 text-sm font-medium">No Show</span>
            </div>
            <p className="text-[#A0A0A0] text-xs">Re-engagement attempts with alternative approaches</p>
          </div>
        </div>
      </div>
    </div>
  );
}
