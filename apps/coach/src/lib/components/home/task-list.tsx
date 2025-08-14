import {ComponentType, FC} from "react";

interface IProps {
  title: string;
  tasks: Array<{
    icon: ComponentType<any>;
    label: string;
    count: number;
    color: string;
  }>;
  cta?: {
    text: string;
    onClick: () => void;
  }
}

export const TaskList: FC<IProps> = (props) => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10">
        <h3 className="text-stone-50 text-xl font-medium leading-relaxed mb-6">{props.title}</h3>

        <div className="space-y-4 mb-6">
          {props.tasks.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-stone-300 text-sm">{item.label}</span>
              </div>
              <span className="text-white text-lg font-semibold">{item.count}</span>
            </div>
          ))}
        </div>

        {props.cta && (
          <button
            onClick={props.cta.onClick}
            className="text-stone-400 text-sm hover:text-stone-300 transition-colors">
            {props.cta.text}
          </button>
        )}
      </div>
    </div>
  );
};
