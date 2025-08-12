'use client'

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { InlineWidget } from "react-calendly";

interface CalendlyEmbedModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  url?: string;
}

export const CalendlyEmbedModal: React.FC<CalendlyEmbedModalProps> = ({
 isOpen,
 onCloseAction,
 url
}) => {
  const calendlyUrl = url || "https://calendly.com/your-username";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCloseAction}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl h-[85vh] transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="relative h-full">
                  {/* Header with close button */}
                  <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Schedule a Meeting
                    </h3>
                    <button
                      onClick={onCloseAction}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="pt-16 h-full">
                    <InlineWidget
                      url={calendlyUrl}
                      styles={{
                        height: '100%',
                        width: '100%'
                      }}
                      pageSettings={{
                        backgroundColor: 'FFFFFF',
                        hideEventTypeDetails: false,
                        hideLandingPageDetails: false,
                        primaryColor: '7B21BA',
                        textColor: '4d5055'
                      }}
                    />
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
