'use client'

import React, {useEffect, useState} from "react";
import {AlertCircle, ChevronLeft, ChevronRight, Plus,} from "lucide-react";
import {Button} from "@nlc-ai/web-ui";
import {Appointment, CalendarDay, CalendarEvent, UserType} from "@nlc-ai/types";
import {calendlyAPI} from "@nlc-ai/web-api-client";
import {CalendarPageSkeleton, CalendlyEmbedModal} from "@/lib";
import {useRouter} from "next/navigation";
import { getInitials } from "@nlc-ai/web-utils";

const MiniCalendarCell = ({ day, isCurrentMonth, isToday, hasEvents, onClick }: {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvents: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={`text-xs text-center py-2 w-8 h-8 rounded-full cursor-pointer transition-colors ${
      isToday
        ? "bg-gradient-to-b from-violet-600 via-fuchsia-600 to-fuchsia-200 text-white"
        : isCurrentMonth
          ? hasEvents
            ? "text-white bg-fuchsia-600/30 hover:bg-fuchsia-600/50"
            : "text-white hover:bg-white/10"
          : "text-stone-500"
    }`}
  >
    {day}
  </div>
);

const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 rounded-lg border border-neutral-700">
    <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
      <span className="text-white text-sm font-medium">{appointment.avatar}</span>
    </div>
    <div className="flex-1">
      <h4 className="text-stone-50 text-sm font-medium">{appointment.name}</h4>
      <p className="text-stone-400 text-xs">{appointment.time}</p>
      {appointment.attendees && appointment.attendees.map(({ name, email }, index) => (
        <p key={index} className="text-stone-500 text-xs">{name} - {email}</p>
      ))}
    </div>
  </div>
);

const HourlySchedule = ({ appointments, selectedDate }: {
  appointments: Appointment[];
  selectedDate: Date;
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getAppointmentsForHour = (hour: number) => {
    return appointments.filter(apt => {
      const aptTime = apt.time.split(' - ')[0];
      const aptHour = new Date(`1970/01/01 ${aptTime}`).getHours();
      return aptHour === hour;
    });
  };

  return (
    <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -right-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10">
        <div className="bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 p-4">
          <h3 className="text-white font-semibold">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {hours.map(hour => {
            const hourAppointments = getAppointmentsForHour(hour);
            const timeString = new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', {
              hour: 'numeric',
              hour12: true
            });

            return (
              <div key={hour} className="border-b border-neutral-700 last:border-b-0">
                <div className="flex">
                  <div className="w-20 p-3 text-stone-400 text-sm font-medium border-r border-neutral-700">
                    {timeString}
                  </div>
                  <div className="flex-1 p-3 min-h-[60px]">
                    {hourAppointments.length > 0 ? (
                      <div className="space-y-2">
                        {hourAppointments.map((apt, idx) => (
                          <div key={idx} className="bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-600/30 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{apt.avatar}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-stone-50 text-sm font-medium">{apt.name}</p>
                                <p className="text-stone-400 text-xs">{apt.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center text-stone-500 text-xs">
                        No appointments
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Calendar = () => {
  const router = useRouter();

  const [today] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<Record<number, CalendarEvent[]>>({});
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isCalendlyConnected, setIsCalendlyConnected] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (currentDate: Date, calendarEvents: Record<number, CalendarEvent[]>) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    const prevMonth = new Date(year, month, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        events: [],
        eventCount: 0,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = calendarEvents[day] || [];
      const testDate = new Date(year, month, day);
      days.push({
        day,
        isCurrentMonth: true,
        isToday: testDate.toDateString() === today.toDateString(),
        events: dayEvents,
        eventCount: dayEvents.length,
      });
    }

    const lastDayOfWeek = lastDay.getDay();
    if (lastDayOfWeek < 6) {
      for (let i = lastDayOfWeek + 1, day = 1; i < 7; day++, i++) {
        days.push({
          day,
          isCurrentMonth: false,
          isToday: false,
          events: [],
          eventCount: 0,
        });
      }
    }

    return days;
  };

  const convertEventsToAppointments = (events: CalendarEvent[], day: number): Appointment[] => {
    return events.map((event, index) => ({
      id: event.calendlyUri || `event-${day}-${index}`,
      name: event.title,
      date: `${currentDate.toLocaleDateString('en-US', { month: 'short' })} ${day}`,
      time: event.time,
      avatar: getInitials(event.attendees?.[0].name),
      type: event.type || 'manual',
      calendlyUri: event.calendlyUri,
      location: event.location,
      attendees: event.attendees
    }));
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkCalendlyConnection = async () => {
      try {
        const isConnected = await calendlyAPI.isConnected(UserType.coach);
        setIsCalendlyConnected(isConnected);
        if (isConnected) {
          const schedulingUrl = await calendlyAPI.getSchedulingUrl(UserType.coach);
          setCalendlyUrl(schedulingUrl || '');
        }
      } catch (error) {
        setIsCalendlyConnected(false);
      }
    };
    (() => checkCalendlyConnection())();
  }, []);

  useEffect(() => {
    const loadCalendlyEvents = async () => {
      if (!isCalendlyConnected || isLoading) return;
      try {
        setError('');
        const convertedEvents = await calendlyAPI.loadEventsForMonth(currentDate, UserType.coach);
        setCalendarEvents(convertedEvents);
      } catch (error: any) {
        setError(error.message || 'Failed to load calendar types');
        setCalendarEvents({});
      }
    };
    (() => loadCalendlyEvents())();
  }, [isLoading, currentDate, isCalendlyConnected]);

  useEffect(() => {
    setDays(getDaysInMonth(currentDate, calendarEvents));
  }, [currentDate, calendarEvents]);

  useEffect(() => {
    const dayEvents = calendarEvents[selectedDate.getDate()] || [];
    setSelectedDayAppointments(convertEventsToAppointments(dayEvents, selectedDate.getDate()));
  }, [calendarEvents, selectedDate, currentDate]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const handleScheduleMeeting = () => {
    if (!isCalendlyConnected) {
      alert('Please configure Calendly in System Settings first');
      return;
    }
    setIsCalendlyModalOpen(true);
  };

  if (isLoading) {
    return <CalendarPageSkeleton/>;
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      {error && (
        <div className="mb-4 p-4 bg-red-800/20 border border-red-600 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 text-sm font-medium">Failed to load calendar events</p>
            <p className="text-red-300 text-xs">{error}</p>
          </div>
        </div>
      )}

      {!isCalendlyConnected && (
        <div className="mb-4 p-4 bg-yellow-800/20 border border-yellow-600 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-yellow-400 text-sm font-medium">Calendly not connected</p>
            <p className="text-yellow-300 text-xs">Connect your Calendly account in System Settings to view your events.</p>
          </div>
          <Button
            onClick={() => {
              router.push('/settings?tab=system-settings')
            }}
            className="bg-yellow-600 hover:bg-yellow-700 cursor-pointer text-white text-sm px-3 py-1.5"
          >
            Configure
          </Button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6 h-full">
        {/* Left Sidebar - Mini Calendar */}
        <div className="w-full xl:w-80 xl:flex-shrink-0">
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
            </div>

            <div className="relative z-10">
              {/* Mini Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-stone-50 text-lg font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="p-1 text-stone-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="p-1 text-stone-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mini Calendar Grid */}
              <div className="mb-6">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-stone-400 text-xs text-center py-2">
                      {day.charAt(0)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((dayData, index) => (
                    <MiniCalendarCell
                      key={index}
                      day={dayData.day}
                      isToday={dayData.isToday}
                      isCurrentMonth={dayData.isCurrentMonth}
                      hasEvents={dayData.eventCount > 0}
                      onClick={() => handleDayClick(dayData.day, dayData.isCurrentMonth)}
                    />
                  ))}
                </div>
              </div>

              {/* Today's Appointments */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-stone-50 text-sm font-medium">
                    {selectedDate.toDateString() === today.toDateString()
                      ? "Today's Appointments"
                      : `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()} Appointments`
                    }
                  </h3>
                  <button
                    onClick={handleScheduleMeeting}
                    className="text-fuchsia-400 text-sm hover:text-fuchsia-300 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {!isCalendlyConnected ? (
                    <div className="text-stone-400 text-sm text-center py-8">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                      Connect Calendly to view appointments
                    </div>
                  ) : selectedDayAppointments.length === 0 ? (
                    <div className="text-stone-400 text-sm text-center py-8">
                      No appointments for this day
                    </div>
                  ) : (
                    selectedDayAppointments.slice(0, 3).map((appointment, index) => (
                      <AppointmentCard key={appointment.id || index} appointment={appointment} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Hourly Schedule */}
        <div className="flex-1">
          <HourlySchedule
            appointments={selectedDayAppointments}
            selectedDate={selectedDate}
          />
        </div>
      </div>

      <CalendlyEmbedModal
        isOpen={isCalendlyModalOpen}
        onCloseAction={() => {
          setIsCalendlyModalOpen(false);
          if (isCalendlyConnected) {
            calendlyAPI.loadEventsForMonth(currentDate, UserType.coach)
              .then(events => setCalendarEvents(events))
              .catch(error => console.error('Failed to refresh types:', error));
          }
        }}
        url={calendlyUrl}
      />
    </main>
  );
};

export default Calendar;
