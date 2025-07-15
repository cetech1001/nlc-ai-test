'use client'

import {ArrowLeft} from "lucide-react";
import {FC} from "react";

interface IProps {
  onClick: () => void;
  title?: string;
}

export const BackTo: FC<IProps> = (props) => {
  return (
    <button
      onClick={props.onClick}
      className="flex items-center gap-2 text-white hover:text-[#7B21BA] transition-colors mb-6"
    >
      <ArrowLeft className="w-5 h-5" />
      {props.title && (
        <span className="text-xl font-semibold">{props.title}</span>
      )}
    </button>
  );
}
