'use client'

import {ArrowLeft} from "lucide-react";
import React from "react";
import {useRouter} from "next/navigation";


interface IProps {
  route: string;
  title: string;
}

export const BackTo = (props: IProps) => {
  const router = useRouter();

  const onButtonClick = () => {
    router.push(props.route);
  }

  return (
    <div className="mb-8">
      <button
        onClick={onButtonClick}
        className="flex items-center gap-2 text-white hover:text-[#7B21BA] transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-xl font-semibold">{props.title}</span>
      </button>
    </div>
  );
}
