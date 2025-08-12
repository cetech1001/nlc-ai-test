interface AppointmentCardProps {
  name: string;
  date: string;
  time: string;
  avatar: string;
}

export const AppointmentCard = ({
 name,
 date,
 time,
 avatar,
}: AppointmentCardProps) => (
  <div className="flex items-center gap-3 p-3 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
    <div className="w-10 h-10 bg-[#7B21BA] rounded-full flex items-center justify-center">
      <span className="text-white text-sm font-medium">{avatar}</span>
    </div>
    <div className="flex-1">
      <h4 className="text-white text-sm font-medium">{name}</h4>
      <p className="text-[#A0A0A0] text-xs">
        {date} | {time}
      </p>
    </div>
  </div>
);
