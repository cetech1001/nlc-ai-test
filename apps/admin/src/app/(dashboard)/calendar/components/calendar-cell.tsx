import { FC } from "react";

interface CalendarCellProps {
  day: number;
  isCurrentMonth?: boolean;
  isToday?: boolean;
  events?: Array<{ title: string; time: string; color: string }>;
  eventCount?: number;
  minHeight?: number;
  minWidth?: number;
}

export const CalendarCell: FC<CalendarCellProps> = ({
 day,
 isCurrentMonth = true,
 isToday = false,
 events = [],
 eventCount = 0,
 minHeight = 80,
}) => (
  <div
    className={`min-h-[${minHeight}px] lg:min-h-[120px] w-full p-2 border border-[#2A2A2A] bg-neutral-800 rounded-lg ${
      !isCurrentMonth ? "text-[#555]" : "text-white"
    } ${isToday ? "bg-[#7B21BA] bg-opacity-20 border-[#7B21BA]" : ""} hover:bg-[#2A2A2A] transition-colors cursor-pointer`}
  >
    <div
      className={`text-sm font-medium mb-1 ${isToday ? "text-[#7B21BA] font-bold" : ""}`}
    >
      {day}
    </div>

    <div className="space-y-1">
      {eventCount > 1 ? (
        <div className="flex items-center justify-center h-full">
          <div className="bg-[#7B21BA] text-white text-xs px-2 py-1 rounded-full font-medium">
            {eventCount} events
          </div>
        </div>
      ) : (
        events.map((event, index) => (
          <div
            key={index}
            className={`text-xs px-2 py-1 rounded text-white ${event.color}`}
          >
            <div className="font-medium truncate">{event.title}</div>
            <div className="text-xs opacity-90 truncate">{event.time}</div>
          </div>
        ))
      )}
    </div>
  </div>
);

export const DayHeader = ({ day }: { day: string }) => {
  return (
    <div
      key={day}
      className="text-[#A0A0A0] text-sm font-medium text-center py-2 sm:py-3"
    >
      <span className="hidden sm:inline">{day}</span>
      <span className="sm:hidden">{day.slice(0, 3)}</span>
    </div>
  );
}
