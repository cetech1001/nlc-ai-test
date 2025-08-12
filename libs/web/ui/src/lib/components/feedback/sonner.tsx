'use client'

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import {ComponentProps} from "react";

type ToasterProps = ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={true}
      richColors={false}
      closeButton
      toastOptions={{
        style: {
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          color: '#ffffff',
        },
        classNames: {
          toast: "group-[.toaster]:bg-[#1A1A1A] group-[.toaster]:border-[#2A2A2A] group-[.toaster]:text-white group-[.toaster]:shadow-lg",
          title: "group-[.toast]:text-white group-[.toast]:font-medium",
          description: "group-[.toast]:text-stone-300",
          closeButton: "group-[.toast]:bg-[#2A2A2A] group-[.toast]:border-[#3A3A3A] group-[.toast]:text-stone-300 group-[.toast]:hover:bg-[#3A3A3A]",
          success: "group-[.toaster]:bg-green-900/20 group-[.toaster]:border-green-600 group-[.toast]:text-green-300",
          error: "group-[.toaster]:bg-red-900/20 group-[.toaster]:border-red-600 group-[.toast]:text-red-300",
          warning: "group-[.toaster]:bg-yellow-900/20 group-[.toaster]:border-yellow-600 group-[.toast]:text-yellow-300",
          info: "group-[.toaster]:bg-blue-900/20 group-[.toaster]:border-blue-600 group-[.toast]:text-blue-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster as Sonner };
