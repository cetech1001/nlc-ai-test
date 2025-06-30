import React from "react";

interface CalendarCellProps {
  day: number;
  isCurrentMonth?: boolean;
  isToday?: boolean;
  events?: Array<{ title: string; time: string; color: string }>;
  minHeight?: number;
  minWidth?: number;
}

export const CalendarCell = ({
  day,
  isCurrentMonth = true,
  isToday = false,
  events = [],
  minHeight = 80,
}: CalendarCellProps) => (
  <div
    className={`min-h-[${minHeight}px] lg:min-h-[120px] w-full p-2 border border-[#2A2A2A] bg-neutral-800 rounded-lg ${
      !isCurrentMonth ? "text-[#555]" : "text-white"
    } ${isToday ? "bg-[#7B21BA] bg-opacity-20 border-[#7B21BA]" : ""} hover:bg-[#2A2A2A]  transition-colors cursor-pointer`}
  >
    <div
      className={`text-sm font-medium mb-1 ${isToday ? "text-[#7B21BA] font-bold" : ""}`}
    >
      {day}
    </div>
    <div className="space-y-1">
      {events.map((event, index) => (
        <div
          key={index}
          className={`text-xs px-2 py-1 rounded text-white ${event.color}`}
        >
          <div className="font-medium">{event.title}</div>
          <div className="text-xs opacity-90">{event.time}</div>
        </div>
      ))}
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
