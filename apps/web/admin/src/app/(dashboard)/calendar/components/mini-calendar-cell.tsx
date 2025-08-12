interface IProps {
  day: number;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export const MiniCalendarCell = ({ day, isCurrentMonth, isToday }: IProps) => {
  return (
    <div
      className={`text-xs text-center py-2 w-8 h-8 rounded-full ${
        isToday
          ? "bg-gradient-to-b from-violet-600 via-fuchsia-600 to-fuchsia-200 text-white"
          : isCurrentMonth
            ? "text-white"
            : "text-[#A0A0A0]"
      }`}
    >
      {day}
    </div>
  );
}
