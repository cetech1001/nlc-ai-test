'use client'

import {ArrowLeft} from "lucide-react";
import {FC} from "react";

interface IProps {
  title: string;
  onClick: () => void;
}

export const BackTo: FC<IProps> = (props) => {
  return (
    <div className="mb-8">
      <button
        onClick={props.onClick}
        className="flex items-center gap-2 text-white hover:text-[#7B21BA] transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-xl font-semibold">{props.title}</span>
      </button>
    </div>
  );
}
