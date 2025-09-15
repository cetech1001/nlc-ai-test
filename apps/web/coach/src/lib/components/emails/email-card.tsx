import {FC} from "react";
// import {EmailItem} from "@nlc-ai/types";

interface IProps {
  email: any;
  onClick: () => void;
}

export const EmailCard: FC<IProps> = ({ email, onClick }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-purple-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      onClick={onClick}
      className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
    >
      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
        <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>

      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="absolute w-24 h-24 -right-4 -bottom-8 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full blur-[40px]" />
      </div>

      <div className="relative z-10 space-y-2">
        <h3 className="text-stone-50 text-lg font-semibold leading-tight line-clamp-2">
          {email.title}
        </h3>

        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(email.recipient.name)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <span className="text-white text-sm font-semibold">
              {getInitials(email.recipient.name)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-stone-50 text-sm font-medium truncate">
              {email.recipient.name}
            </p>
            <p className="text-stone-400 text-xs truncate">
              {email.recipient.email}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-stone-300 text-sm font-medium">{email.date}</p>
            <p className="text-stone-400 text-xs">{email.time}</p>
          </div>
        </div>

        <div className="rounded-lg">
          <p className="text-stone-300 text-sm leading-relaxed line-clamp-3">
            {email.preview}
          </p>
        </div>

        <div className="pt-2">
          <button className="text-transparent bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-sm font-medium hover:from-fuchsia-300 hover:to-violet-300 transition-all underline decoration-fuchsia-400/50 hover:decoration-fuchsia-300/70">
            View Automated Response
          </button>
        </div>
      </div>
    </div>
  );
};
