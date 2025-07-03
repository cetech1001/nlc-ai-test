'use client'

import React, {useEffect, useState} from "react";
import { Button } from "@nlc-ai/ui";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {appointments, CalendarEvent, calendarEvents} from "@/app/data";
import {AppointmentCard} from "@/app/(dashboard)/calendar/components/appointment-card";
import {CalendarCell, DayHeader} from "@/app/(dashboard)/calendar/components/calendar-cell";
import {MiniCalendarCell} from "@/app/(dashboard)/calendar/components/mini-calendar-cell";


interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

const isToday = (date: Date, day: number) => {
  const today = new Date();
  const testDate = new Date(date.getFullYear(), date.getMonth(), day);

  return testDate.getFullYear() === today.getFullYear()
    && testDate.getMonth() === today.getMonth()
    && testDate.getDate() === today.getDate();
}

const getDaysInMonth = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const lastDayOfWeek = lastDay.getDay();

  const days = [];

  const prevMonth = new Date(year, month, 0);
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonth.getDate() - i;
    days.push({
      day,
      isCurrentMonth: false,
      isToday: isToday(prevMonth, day),
      events: [],
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      isCurrentMonth: true,
      isToday: isToday(currentDate, day),
      events: calendarEvents[day] || [],
    });
  }

  if (lastDayOfWeek < 6) {
    const nextMonth = new Date(year, month + 1, 1);

    for (let i = lastDayOfWeek + 1, day = 1; i < 7; day++, i++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: isToday(nextMonth, day),
        events: [],
      });
    }
  }

  return days;
};

const getWeekForDate = (date: Date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);

    weekDays.push({
      day: day.getDate(),
      isCurrentMonth: day.getMonth() === date.getMonth(),
      isToday: isToday(day, day.getDate()),
      events: calendarEvents[day.getDate()] || [],
      fullDate: day
    });
  }

  return weekDays;
};

export default function Calendar(){
  const [today] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(today);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    return start;
  });
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [weekDays, setWeekDays] = useState<CalendarDay[]>([]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekStart((prev) => {
      const newWeekStart = new Date(prev);
      if (direction === "prev") {
        newWeekStart.setDate(prev.getDate() - 7);
      } else {
        newWeekStart.setDate(prev.getDate() + 7);
      }
      setCurrentDate(newWeekStart);
      return newWeekStart;
    });
  };

  const handleNavigation = (direction: "prev" | "next") => {
    if (window.innerWidth < 640) {
      navigateWeek(direction);
    } else {
      navigateMonth(direction);
    }
  };

  useEffect(() => {
    setDays(getDaysInMonth(currentDate));
  }, [currentDate]);

  useEffect(() => {
    setWeekDays(getWeekForDate(currentWeekStart));
  }, [currentWeekStart]);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 xl:gap-8 h-full">
        <div className="w-full xl:w-80 lg:flex-shrink-0 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-3xl shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)]">
          <div className="bg-[#1A1A1A] rounded-lg p-4 sm:p-6 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-white text-lg font-semibold">Calendar</h2>
              <h2 className="text-white text-lg font-semibold sm:hidden">{monthNames[currentDate.getMonth()]}</h2>
              <Button className="bg-gradient-to-b from-violet-600 via-fuchsia-600 to-fuchsia-200 hover:bg-[#8B31CA] text-white text-sm px-4 py-2">
                {currentDate.getFullYear()}
              </Button>
            </div>

            <div className="mb-6 sm:mb-8">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-[#A0A0A0] text-xs text-center py-2"
                  >
                    {day.toUpperCase()}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                  <MiniCalendarCell key={index} day={day.day} isToday={day.isToday} isCurrentMonth={day.isCurrentMonth}/>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-sm font-medium">
                  Today's appointments
                </h3>
                <button className="text-[#7B21BA] text-sm hover:text-[#8B31CA]">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {appointments.map((appointment, index) => (
                  <AppointmentCard
                    key={index}
                    name={appointment.name}
                    date={appointment.date}
                    time={appointment.time}
                    avatar={appointment.avatar}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] h-full">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#2A2A2A]">
              <div>
                <h2 className="text-white text-lg sm:text-xl font-semibold">
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigation("prev")}
                  className="p-2 text-[#A0A0A0] hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleNavigation("next")}
                  className="p-2 text-[#A0A0A0] hover:text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="hidden sm:grid grid-cols-7 mb-2">
                {dayNames.map((day, index) => (
                  <DayHeader key={index} day={day}/>
                ))}
              </div>

              <div className="hidden sm:grid grid-cols-7 gap-0.5 sm:gap-1">
                {days.map((dayData, index) => (
                  <CalendarCell
                    key={index}
                    day={dayData.day}
                    isCurrentMonth={dayData.isCurrentMonth}
                    isToday={dayData.isToday}
                    events={dayData.events}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {weekDays.map((dayData, index) => (
                  <div key={index} className={"flex flex-row items-center gap-4 w-full"}>
                    <div className={"w-1/5"}>
                      <DayHeader day={dayNames[index]}/>
                    </div>
                    <div className={"w-4/5"}>
                      <CalendarCell
                        day={dayData.day}
                        isCurrentMonth={dayData.isCurrentMonth}
                        isToday={dayData.isToday}
                        events={dayData.events}
                        minHeight={70}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
