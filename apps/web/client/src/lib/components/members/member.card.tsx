import {MessageCircle} from "lucide-react";
import React from "react";

export const MemberCard = ({ member }: any) => {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-dark-600 card-gradient">
      <div className="absolute left-[30px] -bottom-[10px] w-[267px] h-[267px] bg-streak-gradient opacity-40 blur-[112.55px] rounded-full" />

      <div className="relative p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-16 h-16 sm:w-[76px] sm:h-[76px] rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h3 className="text-lg sm:text-xl font-semibold text-dark-900 truncate">{member.name}</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="text-sm sm:text-base text-dark-900/60 capitalize">{member.status}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-dark-900/60 text-sm sm:text-base">
                <span className="truncate">{member.username}</span>
                <div className="hidden sm:block w-1 h-1 bg-gray-400/40 rounded-full flex-shrink-0" />
                <span className="text-xs sm:text-base">{member.joinDate}</span>
              </div>
            </div>
          </div>
          <button className="btn-purple-outline flex items-center gap-2 w-full sm:w-auto justify-center">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Chat</span>
          </button>
        </div>

        <div className="pt-2">
          <p className="text-base sm:text-lg lg:text-xl text-dark-900 leading-6 sm:leading-7 lg:leading-8">
            {member.bio}
          </p>
        </div>
      </div>
    </div>
  );
};
