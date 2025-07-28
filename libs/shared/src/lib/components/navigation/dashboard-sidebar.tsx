'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  Bars3Icon,
  CogIcon as HiCog,
  ArrowRightStartOnRectangleIcon as HiLogout,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { MenuItem, MenuItemWithDropdown } from "@nlc-ai/types";
import { Logo } from "../logo";

interface SidebarProps extends SidebarComponentProps {
  dashboardHeader: string;
  sidebarOpen: boolean;
  pathname: string;
  setSidebarOpenAction: (open: boolean) => void;
  navigateTo: (path: string) => void;
  logoSize?: 'small' | 'large';
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const hasDropdown = (item: MenuItem | MenuItemWithDropdown): item is MenuItemWithDropdown => {
  return 'dropdown' in item && Array.isArray(item.dropdown);
};

const HeadlessUISidebar = ({ logoSize = 'small', ...props }: SidebarProps) => {
  console.log(props.settingsItems);

  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const handleNavigation = (path: string) => {
    props.navigateTo(path);
    props.setSidebarOpenAction(false);
  };

  const toggleDropdown = (itemLabel: string) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(itemLabel)) {
      newOpenDropdowns.delete(itemLabel);
    } else {
      newOpenDropdowns.add(itemLabel);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  const isActive = (path: string) => {
    if (path === '/home') {
      return props.pathname === '/home' || props.pathname === '/dashboard';
    }
    return props.pathname.startsWith(path);
  };

  const isDropdownActive = (item: MenuItemWithDropdown) => {
    return item.dropdown.some(subItem => isActive(subItem.path));
  };

  const renderMenuItem = (item: MenuItem | MenuItemWithDropdown) => {
    const Icon = item.icon;

    if (hasDropdown(item)) {
      const isDropdownOpen = openDropdowns.has(item.label);
      const isParentActive = isDropdownActive(item);

      return (
        <li key={item.label}>
          <div>
            <button
              onClick={() => toggleDropdown(item.label)}
              className={classNames(
                isParentActive
                  ? 'bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 text-white shadow-lg shadow-[#7B21BA]/25'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]',
                'group flex items-center w-full gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200'
              )}
            >
              <Icon
                className={classNames(
                  isParentActive ? 'text-white' : 'text-[#A0A0A0] group-hover:text-white',
                  'h-5 w-5 shrink-0'
                )}
                aria-hidden="true"
              />
              <span className="flex-1 text-left">{item.label}</span>
              {isDropdownOpen ? (
                <ChevronDownIcon
                  className={classNames(
                    isParentActive ? 'text-white' : 'text-[#A0A0A0] group-hover:text-white',
                    'h-4 w-4 shrink-0 transition-transform duration-200'
                  )}
                />
              ) : (
                <ChevronRightIcon
                  className={classNames(
                    isParentActive ? 'text-white' : 'text-[#A0A0A0] group-hover:text-white',
                    'h-4 w-4 shrink-0 transition-transform duration-200'
                  )}
                />
              )}
            </button>

            <Transition
              show={isDropdownOpen}
              enter="transition duration-200 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-150 ease-in"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <div className="mt-2 ml-6 space-y-1">
                {item.dropdown.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = isActive(subItem.path);

                  return (
                    <button
                      key={subItem.label}
                      onClick={() => handleNavigation(subItem.path)}
                      className={classNames(
                        isSubActive
                          ? 'bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-white border-l-2 border-fuchsia-500'
                          : 'text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]/50 border-l-2 border-transparent hover:border-[#333333]',
                        'group flex items-center w-full gap-x-3 rounded-r-lg pl-4 pr-3 py-2.5 text-sm leading-6 font-medium transition-all duration-200'
                      )}
                    >
                      <SubIcon
                        className={classNames(
                          isSubActive ? 'text-white' : 'text-[#A0A0A0] group-hover:text-white',
                          'h-4 w-4 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {subItem.label}
                    </button>
                  );
                })}
              </div>
            </Transition>
          </div>
        </li>
      );
    }

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
  };

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-[#1A1A1A] bg-[#0A0A0A] px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center border-b border-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <Logo
            height={logoSize === 'small' ? 40 : 100}
            width={logoSize === 'small' ? 48 : 150}
            type={props.sidebarOpen ? 'png' : 'svg'}
            size={logoSize} />
          {logoSize === 'small' && (
            <span className="text-white font-semibold text-lg">{props.dashboardHeader}</span>
          )}
        </div>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-2">
              {props.menuItems.map(renderMenuItem)}
            </ul>
          </li>

          <li>
            <div className="border-t border-[#1A1A1A] pt-6">
              <ul role="list" className="-mx-2 space-y-2">
                {
                  props.settingsItems && props.settingsItems.length > 0 ? (
                    props.settingsItems.map(renderMenuItem)
                  ) : (
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
                  )
                }
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
  menuItems: (MenuItem | MenuItemWithDropdown)[];
  navigateTo: (path: string) => void;
  settingsItems?: (MenuItem | MenuItemWithDropdown)[];
  logoSize?: 'small' | 'large';
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
