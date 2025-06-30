'use client'

import React, { useState, Fragment } from "react";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import { ChevronDown, CheckIcon, Calendar, Clock } from "lucide-react";
import { Button } from "@nlc-ai/ui";

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingScheduled?: (meetingData: any) => void;
}

const agentOptions = [
  { id: "A1", name: "Email Management Agent" },
  { id: "A2", name: "Client Check-in Agent" },
  { id: "A3", name: "Content Suggestion Agent" },
  { id: "A4", name: "Lead Follow-up Agent" },
  { id: "A5", name: "Analytics Agent" },
];

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
];

const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onMeetingScheduled,
                                                                   }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const handleDiscard = () => {
    setName("");
    setEmail("");
    setSelectedDate("");
    setSelectedTime("");
    setSelectedAgents([]);
    onClose();
  };

  const handleScheduleMeeting = () => {
    const meetingData = {
      name,
      email,
      date: selectedDate,
      time: selectedTime,
      agentsOfInterest: selectedAgents,
      status: "Scheduled"
    };

    onMeetingScheduled?.(meetingData);
    handleDiscard();
  };

  const isFormValid = name && email && selectedDate && selectedTime && selectedAgents.length > 0;

  // Generate date options (next 30 days)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      });
    }
    return dates;
  };

  const dateOptions = generateDateOptions();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[linear-gradient(202deg,rgba(38, 38, 38, 0.30)_11.62%,rgba(19, 19, 19, 0.30)_87.57%)] border border-[#2A2A2A] p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg text-center font-semibold leading-6 text-white mb-6"
                >
                  Schedule Meeting
                </Dialog.Title>

                <div className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-white text-sm font-medium block">
                      Name
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-[#3A3A3A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
                      placeholder="Enter client's name"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-white text-sm font-medium block">
                      Email
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-[#3A3A3A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
                      placeholder="Enter client's email"
                    />
                  </div>

                  {/* Date Field */}
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium block">
                      Date
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <Listbox value={selectedDate} onChange={setSelectedDate}>
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-[linear-gradient(202deg,rgba(38, 38, 38, 0.30)_11.62%,rgba(19, 19, 19, 0.30)_87.57%)] border border-[#3A3A3A] py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]">
                          <span className={`block truncate ${!selectedDate ? 'text-[#A0A0A0]' : ''}`}>
                            {selectedDate ? dateOptions.find(d => d.value === selectedDate)?.label : "Select meeting date"}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <Calendar className="h-5 w-5 text-[#A0A0A0]" aria-hidden="true" />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#2A2A2A] border border-[#3A3A3A] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                            {dateOptions.map((date) => (
                              <Listbox.Option
                                key={date.value}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                    active ? "bg-[#3A3A3A] text-white" : "text-white"
                                  }`
                                }
                                value={date.value}
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                      {date.label}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#7B21BA]">
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  {/* Time Field */}
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium block">
                      Time
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <Listbox value={selectedTime} onChange={setSelectedTime}>
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-[linear-gradient(202deg,rgba(38, 38, 38, 0.30)_11.62%,rgba(19, 19, 19, 0.30)_87.57%)] border border-[#3A3A3A] py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]">
                          <span className={`block truncate ${!selectedTime ? 'text-[#A0A0A0]' : ''}`}>
                            {selectedTime || "Select meeting time"}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <Clock className="h-5 w-5 text-[#A0A0A0]" aria-hidden="true" />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#2A2A2A] border border-[#3A3A3A] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                            {timeSlots.map((time) => (
                              <Listbox.Option
                                key={time}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                    active ? "bg-[#3A3A3A] text-white" : "text-white"
                                  }`
                                }
                                value={time}
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                      {time}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#7B21BA]">
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  {/* Agents of Interest */}
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium block">
                      Select Agents of Interest
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <Listbox value={selectedAgents} onChange={setSelectedAgents} multiple>
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-[linear-gradient(202deg,rgba(38, 38, 38, 0.30)_11.62%,rgba(19, 19, 19, 0.30)_87.57%)] border border-[#3A3A3A] py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]">
                          <span className={`block truncate ${selectedAgents.length === 0 ? 'text-[#A0A0A0]' : ''}`}>
                            {selectedAgents.length === 0
                              ? "Select all that apply"
                              : selectedAgents.length === 1
                                ? agentOptions.find(a => a.id === selectedAgents[0])?.name
                                : `${selectedAgents.length} agents selected`
                            }
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown className="h-5 w-5 text-[#A0A0A0]" aria-hidden="true" />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-scroll rounded-md bg-[#2A2A2A] border border-[#3A3A3A] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                            {agentOptions.map((agent) => (
                              <Listbox.Option
                                key={agent.id}
                                className={({ active }) =>
                                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                    active ? "bg-[#3A3A3A] text-white" : "text-white"
                                  }`
                                }
                                value={agent.id}
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                      {agent.name}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#7B21BA]">
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 mt-6">
                  <Button
                    onClick={handleScheduleMeeting}
                    disabled={!isFormValid}
                    className="flex-1 px-4 py-2 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] disabled:bg-[#4A4A4A] disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                  >
                    Schedule Meeting
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={handleDiscard}
                    className="flex-1 bg-transparent border-[#3A3A3A] text-white hover:bg-[#2A2A2A]"
                  >
                    Discard
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ScheduleMeetingModal;
