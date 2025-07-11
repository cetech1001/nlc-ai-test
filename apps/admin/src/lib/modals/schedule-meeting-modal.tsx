'use client'

import { FC, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@nlc-ai/ui";

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onMeetingScheduled?: (meetingData: any) => void;
}

export const ScheduleMeetingModal: FC<ScheduleMeetingModalProps> = (props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const handleDiscard = () => {
    setName("");
    setEmail("");
    setSelectedDate("");
    setSelectedTime("");
    props.onCloseAction();
  };

  const handleScheduleMeeting = () => {
    const meetingData = {
      name,
      email,
      date: selectedDate,
      time: selectedTime,
      status: "Scheduled"
    };

    props.onMeetingScheduled?.(meetingData);
    handleDiscard();
  };

  const isFormValid = name && email && selectedDate && selectedTime;

  return (
    <Transition appear show={props.isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={props.onCloseAction}>
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

                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium block">
                      Date
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-[#3A3A3A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium block">
                      Time
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      id="time"
                      type="time"
                      value={selectedTime}
                      onChange={e => setSelectedTime(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-[#3A3A3A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
                    />
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
