'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  Bars3Icon,
  CogIcon as HiCog,
  ArrowRightStartOnRectangleIcon as HiLogout
} from '@heroicons/react/24/outline';
import {MenuItem} from "../../types";
import {Logo} from "../logo";


interface SidebarProps extends SidebarComponentProps{
  dashboardHeader: string;
  sidebarOpen: boolean;
  pathname: string;
  setSidebarOpenAction: (open: boolean) => void;
  navigateTo: (path: string) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const HeadlessUISidebar = (props: SidebarProps) => {
  const handleNavigation = (path: string) => {
    props.navigateTo(path);
    props.setSidebarOpenAction(false);
  };

  const isActive = (path: string) => {
    if (path === '/home') {
      return props.pathname === '/home' || props.pathname === '/dashboard';
    }
    return props.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-[#1A1A1A] bg-[#0A0A0A] px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center border-b border-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <Logo height={40} width={48} type={props.sidebarOpen ? 'png' : 'svg'}/>
          <span className="text-white font-semibold text-lg">{props.dashboardHeader}</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-2">
              {props.menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.label}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={classNames(
                        active
                          ? 'bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 text-white shadow-lg shadow-[#7B21BA]/25'
                          : 'text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]',
                        'group flex items-center w-full gap-x-4 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200'
                      )}
                    >
                      <Icon
                        className={classNames(
                          active ? 'text-white' : 'text-[#A0A0A0] group-hover:text-white',
                          'h-5 w-5 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>

          <li>
            <div className="border-t border-[#1A1A1A] pt-6">
              <ul role="list" className="-mx-2 space-y-2">
                <li>
                  <button
                    onClick={() => handleNavigation('/settings')}
                    className={classNames(
                      isActive('/settings')
                        ? 'bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 text-white shadow-lg shadow-[#7B21BA]/25'
                        : 'text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]',
                      'group flex items-center w-full gap-x-4 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200'
                    )}
                  >
                    <HiCog
                      className={classNames(
                        isActive('/settings') ? 'text-white' : 'text-[#A0A0A0] group-hover:text-white',
                        'h-5 w-5 shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    Settings
                  </button>
                </li>
              </ul>
            </div>
          </li>

          <li className={"flex-col"}>
            <div className="border-t border-[#1A1A1A] pt-6">
              <ul role="list" className="-mx-2 space-y-2">
                <li>
                  <button
                    onClick={props.logout}
                    className="group flex items-center w-full gap-x-4 rounded-lg p-3 text-sm leading-6 font-medium text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] transition-all duration-200"
                  >
                    <HiLogout
                      className="h-5 w-5 shrink-0 text-[#A0A0A0] group-hover:text-white"
                      aria-hidden="true"
                    />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      <Transition.Root show={props.sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={props.setSidebarOpenAction}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => props.setSidebarOpenAction(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  );
}

interface SidebarComponentProps {
  dashboardHeader: string;
  pathname: string;
  logout: () => void;
  menuItems: MenuItem[];
  navigateTo: (path: string) => void;
}

export const DashboardSidebarWrapper = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return {
    SidebarComponent: (props: SidebarComponentProps) => (
      <HeadlessUISidebar
        {...props}
        sidebarOpen={sidebarOpen}
        setSidebarOpenAction={setSidebarOpen} />
    ),
    MobileMenuButton: () => (
      <button
        type="button"
        className="-m-2.5 p-2.5 text-white lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
    ),
    sidebarOpen,
    setSidebarOpen
  };
}
