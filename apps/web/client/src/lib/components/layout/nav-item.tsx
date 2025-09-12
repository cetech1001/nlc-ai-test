import React from "react";

export const NavItem = ({ icon, label, href, active = false }: { icon: string; label: string; href?: string; active?: boolean }) => {
  const iconComponent = {
    chat: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    ),
    users: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    ),
    calendar: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    group: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
    trophy: (
      <>
        <path strokeWidth={1.2} d="M7.5 16.6667V8.33341C7.5 7.41294 8.24619 6.66675 9.16667 6.66675H10.8333C11.7538 6.66675 12.5 7.41294 12.5 8.33341V16.6667M7.5 16.6667C7.5 17.5872 8.24619 18.3334 9.16667 18.3334H10.8333C11.7538 18.3334 12.5 17.5872 12.5 16.6667M7.5 16.6667V11.6667C7.5 10.7463 6.75381 10.0001 5.83333 10.0001H4.16667C3.24619 10.0001 2.5 10.7463 2.5 11.6667V16.6667C2.5 17.5872 3.24619 18.3334 4.16667 18.3334H5.83333C6.75381 18.3334 7.5 17.5872 7.5 16.6667ZM12.5 16.6667V13.3334C12.5 12.4129 13.2462 11.6667 14.1667 11.6667H15.8333C16.7538 11.6667 17.5 12.4129 17.5 13.3334V16.6667C17.5 17.5872 16.7538 18.3334 15.8333 18.3334H14.1667C13.2462 18.3334 12.5 17.5872 12.5 16.6667Z" />
        <path d="M9.81337 1.00216C9.87324 0.817896 10.1339 0.817896 10.1938 1.00216L10.5792 2.18838C10.606 2.27079 10.6828 2.32658 10.7694 2.32658H12.0167C12.2104 2.32658 12.291 2.5745 12.1343 2.68838L11.1252 3.42151C11.0551 3.47244 11.0258 3.56271 11.0525 3.64511L11.438 4.83134C11.4978 5.0156 11.2869 5.16882 11.1302 5.05494L10.1211 4.32182C10.051 4.27089 9.95612 4.27089 9.88602 4.32182L8.87696 5.05494C8.72022 5.16882 8.50932 5.0156 8.56919 4.83134L8.95462 3.64511C8.9814 3.56271 8.95206 3.47244 8.88197 3.42151L7.8729 2.68838C7.71616 2.5745 7.79672 2.32658 7.99046 2.32658H9.23773C9.32438 2.32658 9.40117 2.27079 9.42794 2.18838L9.81337 1.00216Z" fill="currentColor" />
      </>
    ),
    archive: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 12l4 4 4-4" />
    )
  };

  const Component = href ? 'a' : 'button';

  return (
    <Component
      {...(href ? { href } : {})}
      className={`flex items-center gap-4 w-full px-3 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-sidebar-accent text-white'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
      }`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 20 20">
        {iconComponent[icon as keyof typeof iconComponent]}
      </svg>
      <span className="text-sm font-semibold">{label}</span>
    </Component>
  );
}
