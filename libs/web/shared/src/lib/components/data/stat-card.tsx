import {TrendingUp, TrendingDown, Activity} from "lucide-react";
import {ComponentType, FC, ReactNode} from "react";
import {StatCardSkeleton} from "../skeletons";

interface IProps {
  title: string;
  value?: string | number;
  description?: string;
  growth?: number;
  isLoading?: boolean;
  icon?: ComponentType<any>;
  iconBgColor?: string;
  iconTextColor?: string;
  subtitle?: string | ReactNode;
}

export const StatCard: FC<IProps> = (props) => {
  if (props.isLoading) {
    return <StatCardSkeleton/>
  }

  const showGrowth = props.growth !== undefined/* && props.growth !== 0*/;
  const isPositiveGrowth = props.growth && props.growth > 0;

  const Icon = props.icon;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className={"flex justify-between h-full"}>
        <div className="relative z-10 flex flex-col justify-between h-full min-h-[100px] sm:min-h-[120px]">
          <div className={"flex-1"}>
            <h3 className="text-stone-300 text-sm sm:text-base font-medium leading-tight sm:leading-relaxed">{props.title}</h3>
            {props.description && (
              <p className="text-stone-400 text-xs leading-tight mb-4">{props.description}</p>
            )}
          </div>
          <div className="flex flex-col justify-between items-start gap-2 mt-auto pt-2">
            <p className="text-stone-50 text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight sm:leading-relaxed">{props.value}</p>
            {showGrowth && (
              <div className={`px-2.5 py-0.5 rounded-full border flex justify-center items-center gap-1 ${
                isPositiveGrowth
                  ? 'bg-green-700/20 border-green-700'
                  : (props.growth! < 0 ? 'bg-red-700/20 border-red-700' : 'bg-gray-700/20 border-gray-700')
              }`}>
                {isPositiveGrowth ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  props.growth! < 0
                    ? <TrendingDown className="w-3 h-3 text-red-400" />
                    : <Activity className={"w-3 h-3 text-gray-400"}/>
                )}
                <span className={`text-sm font-medium leading-relaxed ${
                  isPositiveGrowth ? 'text-green-400' : (props.growth! < 0 ? 'text-red-400' : 'text-gray-400')
                }`}>
                {Math.abs(props.growth!).toFixed(1)}%
              </span>
              </div>
            )}
            {typeof props.subtitle === 'string' ? (
              <p className="text-stone-400 text-xs leading-tight mb-4">{props.subtitle}</p>
            ) : props.subtitle}
          </div>
        </div>
        {Icon && (
          <div className={"h-full flex flex-col sm:flex-row justify-end items-end sm:items-start"}>
            <div className={`w-12 h-12 bg-gradient-to-br ${props.iconBgColor} rounded-xl flex flex-row items-center justify-center`}>
              <Icon className={`w-6 h-6 ${props.iconTextColor || 'text-white'}`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
