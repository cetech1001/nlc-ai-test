'use client'

import React, {useEffect, useState} from "react";
import { Button } from "@nlc-ai/ui";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertCircle,
} from "lucide-react";
import {AppointmentCard} from "@/app/(dashboard)/calendar/components/appointment-card";
import {CalendarCell, DayHeader} from "@/app/(dashboard)/calendar/components/calendar-cell";
import {MiniCalendarCell} from "@/app/(dashboard)/calendar/components/mini-calendar-cell";
import {CalendarPageSkeleton} from "@/lib/skeletons/calendar-page.skeleton";
import {Appointment, CalendarDay, CalendarEvent} from "@nlc-ai/types";
import {calendlyAPI} from "@nlc-ai/api-client";
import CalendlyEmbedModal from "@/lib/modals/calendly-embed-modal";

const isToday = (date: Date, day: number) => {
  const today = new Date();
  const testDate = new Date(date.getFullYear(), date.getMonth(), day);

  return testDate.getFullYear() === today.getFullYear()
    && testDate.getMonth() === today.getMonth()
    && testDate.getDate() === today.getDate();
}

const getDaysInMonth = (currentDate: Date, calendarEvents: Record<number, CalendarEvent[]>) => {
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
      eventCount: 0,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = calendarEvents[day] || [];
    days.push({
      day,
      isCurrentMonth: true,
      isToday: isToday(currentDate, day),
      events: dayEvents,
      eventCount: dayEvents.length,
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
        eventCount: 0,
      });
    }
  }

  return days;
};

const getWeekForDate = (date: Date, calendarEvents: Record<number, CalendarEvent[]>) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);

    const dayEvents = calendarEvents[day.getDate()] || [];
    weekDays.push({
      day: day.getDate(),
      isCurrentMonth: day.getMonth() === date.getMonth(),
      isToday: isToday(day, day.getDate()),
      events: dayEvents,
      eventCount: dayEvents.length,
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
  const [calendarEvents, setCalendarEvents] = useState<Record<number, CalendarEvent[]>>({});
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isCalendlyConnected, setIsCalendlyConnected] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Check Calendly connection status
  useEffect(() => {
    const checkCalendlyConnection = async () => {
      try {
        const isConnected = await calendlyAPI.isConnected();
        setIsCalendlyConnected(isConnected);

        if (isConnected) {
          const schedulingUrl = await calendlyAPI.getSchedulingUrl();
          setCalendlyUrl(schedulingUrl || '');
        }
      } catch (error) {
        console.error('Failed to check Calendly connection:', error);
        setIsCalendlyConnected(false);
      }
    };


    checkCalendlyConnection();
  }, []);

  // Load Calendly events when date changes
  useEffect(() => {
    const loadCalendlyEvents = async () => {
      if (!isCalendlyConnected || isLoading) {
        return;
      }

      try {
        setError('');
        const convertedEvents = await calendlyAPI.loadEventsForMonth(currentDate);
        setCalendarEvents(convertedEvents);

        // Only update selected day appointments if we have a selected day and it exists in the new month
        if (selectedDay && convertedEvents[selectedDay]) {
          const dayEvents = convertedEvents[selectedDay] || [];
          setSelectedDayAppointments(convertEventsToAppointments(dayEvents, selectedDay));
        }
        // If we're viewing the current month and no day is selected, show today's appointments
        else if (!selectedDay && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
          const todayEvents = convertedEvents[today.getDate()] || [];
          setSelectedDayAppointments(convertEventsToAppointments(todayEvents, today.getDate()));
          setSelectedDay(today.getDate());
        }
        // If we're viewing a different month and have a selected day that doesn't exist, clear selection
        else if (selectedDay && !convertedEvents[selectedDay]) {
          setSelectedDayAppointments([]);
          setSelectedDay(null);
        }
      } catch (error: any) {
        console.error('Failed to load Calendly events:', error);
        setError(error.message || 'Failed to load calendar events');
        setCalendarEvents({});
      }
    };

    loadCalendlyEvents();
  }, [isLoading, currentDate, isCalendlyConnected, today, selectedDay]);

  const convertEventsToAppointments = (events: CalendarEvent[], day: number): Appointment[] => {
    return events.map((event, index) => ({
      id: event.calendlyUri || `event-${day}-${index}`,
      name: event.title,
      date: `${currentDate.toLocaleDateString('en-US', { month: 'short' })} ${day}`,
      time: event.time,
      avatar: event.title.charAt(0).toUpperCase(),
      type: event.type || 'manual',
      calendlyUri: event.calendlyUri,
      location: event.location,
      attendees: event.attendees
    }));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
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

  const handleCellClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;

    const dayEvents = calendarEvents[day] || [];
    setSelectedDayAppointments(convertEventsToAppointments(dayEvents, day));
    setSelectedDay(day);
    setShowAllAppointments(false);
  };

  const handleViewAllToggle = () => {
    setShowAllAppointments(!showAllAppointments);
  };

  const handleScheduleMeeting = () => {
    if (!isCalendlyConnected) {
      alert('Please configure Calendly in System Settings first');
      return;
    }

    if (!calendlyUrl) {
      alert('Calendly scheduling URL not found. Please check your Calendly configuration.');
      return;
    }

    setIsCalendlyModalOpen(true);
  };

  useEffect(() => {
    setDays(getDaysInMonth(currentDate, calendarEvents));
  }, [currentDate, calendarEvents]);

  useEffect(() => {
    setWeekDays(getWeekForDate(currentWeekStart, calendarEvents));
  }, [currentWeekStart, calendarEvents]);

  // Set initial selected day to today
  useEffect(() => {
    if (!selectedDay && !isLoading && Object.keys(calendarEvents).length > 0) {
      const todayEvents = calendarEvents[today.getDate()] || [];
      setSelectedDayAppointments(convertEventsToAppointments(todayEvents, today.getDate()));
      setSelectedDay(today.getDate());
    }
  }, [calendarEvents, isLoading, selectedDay, today]);

  if (isLoading) {
    return <CalendarPageSkeleton/>;
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-800/20 border border-red-600 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 text-sm font-medium">Failed to load calendar events</p>
            <p className="text-red-300 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Calendly Not Connected Banner */}
      {!isCalendlyConnected && (
        <div className="mb-4 p-4 bg-yellow-800/20 border border-yellow-600 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-yellow-400 text-sm font-medium">Calendly not connected</p>
            <p className="text-yellow-300 text-xs">Connect your Calendly account in System Settings to view your events.</p>
          </div>
          <Button
            onClick={() => window.location.href = '/settings?tab=system-settings'}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1.5"
          >
            Configure
          </Button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 xl:gap-8 h-full">
        {/* Left Sidebar */}
        <div className="w-full xl:w-80 lg:flex-shrink-0 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-3xl shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)]">
          <div className="bg-[#1A1A1A] rounded-lg p-4 sm:p-6 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-white text-lg font-semibold">Calendar</h2>
              <h2 className="text-white text-lg font-semibold sm:hidden">{monthNames[currentDate.getMonth()]}</h2>
              <Button className="bg-gradient-to-b from-violet-600 via-fuchsia-600 to-fuchsia-200 hover:bg-[#8B31CA] text-white text-sm px-4 py-2">
                {currentDate.getFullYear()}
              </Button>
            </div>

            {!showAllAppointments && (
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
                    <div
                      key={index}
                      onClick={() => handleCellClick(day.day, day.isCurrentMonth)}
                      className="cursor-pointer"
                    >
                      <MiniCalendarCell
                        day={day.day}
                        isToday={day.isToday}
                        isCurrentMonth={day.isCurrentMonth}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-sm font-medium">
                  {selectedDay
                    ? `${monthNames[currentDate.getMonth()]} ${selectedDay} appointments`
                    : "Today's appointments"
                  }
                </h3>
                <div className="flex items-center gap-2">
                  {selectedDayAppointments.length > 5 && (
                    <button
                      onClick={handleViewAllToggle}
                      className="text-[#7B21BA] text-sm hover:text-[#8B31CA]"
                    >
                      {showAllAppointments ? 'View Less' : 'View All'}
                    </button>
                  )}
                  <button
                    onClick={handleScheduleMeeting}
                    className="text-[#7B21BA] text-sm hover:text-[#8B31CA] flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {!isCalendlyConnected ? (
                  <div className="text-[#A0A0A0] text-sm text-center py-8">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#666]" />
                    Connect Calendly to view appointments
                  </div>
                ) : selectedDayAppointments.length === 0 ? (
                  <div className="text-[#A0A0A0] text-sm text-center py-8">
                    No appointments for this day
                  </div>
                ) : (
                  (showAllAppointments ? selectedDayAppointments : selectedDayAppointments.slice(0, 5))
                    .map((appointment, index) => (
                      <AppointmentCard
                        key={appointment.id || index}
                        name={appointment.name}
                        date={appointment.date}
                        time={appointment.time}
                        avatar={appointment.avatar}
                      />
                    ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar Area */}
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
              {/* Desktop Calendar Grid */}
              <div className="hidden sm:grid grid-cols-7 mb-2">
                {dayNames.map((day, index) => (
                  <DayHeader key={index} day={day}/>
                ))}
              </div>

              <div className="hidden sm:grid grid-cols-7 gap-0.5 sm:gap-1">
                {days.map((dayData, index) => (
                  <div
                    key={index}
                    onClick={() => handleCellClick(dayData.day, dayData.isCurrentMonth)}
                    className="cursor-pointer"
                  >
                    <CalendarCell
                      day={dayData.day}
                      isCurrentMonth={dayData.isCurrentMonth}
                      isToday={dayData.isToday}
                      events={dayData.eventCount > 1 ? [] : dayData.events}
                      eventCount={dayData.eventCount}
                    />
                  </div>
                ))}
              </div>

              {/* Mobile Week View */}
              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {weekDays.map((dayData, index) => (
                  <div key={index} className="flex flex-row items-center gap-4 w-full">
                    <div className="w-1/5">
                      <DayHeader day={dayNames[index]}/>
                    </div>
                    <div
                      className="w-4/5 cursor-pointer"
                      onClick={() => handleCellClick(dayData.day, dayData.isCurrentMonth)}
                    >
                      <CalendarCell
                        day={dayData.day}
                        isCurrentMonth={dayData.isCurrentMonth}
                        isToday={dayData.isToday}
                        events={dayData.eventCount > 1 ? [] : dayData.events}
                        eventCount={dayData.eventCount}
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

      {/* Calendly Embed Modal */}
      <CalendlyEmbedModal
        isOpen={isCalendlyModalOpen}
        onClose={() => {
          setIsCalendlyModalOpen(false);
          // Refresh calendar events after scheduling
          if (isCalendlyConnected) {
            calendlyAPI.loadEventsForMonth(currentDate)
              .then(events => setCalendarEvents(events))
              .catch(error => console.error('Failed to refresh events:', error));
          }
        }}
        url={calendlyUrl}
      />
    </main>
  );
};
