import React, {FC, ReactNode} from "react";
import {BackTo} from "./navigation";

interface IProps {
  pageTitle: string;
  onSave: () => void;
  onDiscard: () => void;
  sidebarComponent: ReactNode;
  mainComponent: ReactNode;
  saveButtonTitle?: string;
  discardButtonTitle?: string;
}

export const TemplateFrame: FC<IProps> = (props) => {
  const handleSave = () => {
    props.onSave();
  };

  const handleDiscard = () => {
    props.onDiscard();
  };

  return (
    <div className="flex-1 overflow-auto min-h-screen pt-4">
      <BackTo onClick={props.onDiscard} title={props.pageTitle}/>

      <div className="relative rounded-[20px] sm:rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] overflow-hidden mb-4">
        <div className="absolute w-[200px] sm:w-[267px] h-[200px] sm:h-[267px] rounded-full opacity-40 blur-[80px] sm:blur-[112.55px] bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 right-[-15px] sm:right-[-21px] top-[-15px] sm:top-[-21px]"></div>

        <div className="z-10 flex flex-col lg:flex-row min-h-[600px] lg:h-[792px]">
          <Sidebar children={props.sidebarComponent} />

          <div className="flex-1 flex flex-col overflow-hidden">
            {props.mainComponent}
          </div>
        </div>
      </div>

      <ActionButtons
        onSave={handleSave}
        onDelete={handleDiscard}
        saveButtonTitle={props.saveButtonTitle}
        discardButtonTitle={props.discardButtonTitle}
      />
    </div>
  );
};

const Sidebar: FC<{ children: ReactNode; }> = ({ children }) => (
  <div className="flex flex-col gap-4 sm:gap-[18px] p-4 sm:p-6 lg:p-[30px] w-full lg:w-[384px] overflow-y-auto lg:border-r lg:border-[#373535]">
    {children}
  </div>
);

const ActionButtons: React.FC<{
  onSave: () => void;
  onDelete: () => void;
  saveButtonTitle?: string;
  discardButtonTitle?: string;
}> = ({ onSave, onDelete, saveButtonTitle = 'Save', discardButtonTitle = 'Discard' }) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5">
    <button
      onClick={onSave}
      className="flex px-4 sm:px-5 py-3 sm:py-[13px] justify-center items-center gap-2 rounded-lg bg-gradient-to-t from-[#FEBEFA] via-[#B339D4] to-[#7B21BA]"
    >
      <span className="text-white font-inter text-sm sm:text-base font-semibold leading-6 tracking-[-0.32px]">
        {saveButtonTitle}
      </span>
    </button>

    <button
      onClick={onDelete}
      className="flex px-4 sm:px-5 py-3 sm:py-[13px] justify-center items-center gap-2 rounded-lg border border-white"
    >
      <span className="text-white font-inter text-sm sm:text-base font-medium leading-6 tracking-[-0.32px]">
        {discardButtonTitle}
      </span>
    </button>
  </div>
);
