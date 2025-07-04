import { TrendingUp, TrendingDown } from "lucide-react";

interface IProps {
  title: string;
  value: string;
  subtitle?: string;
  growth?: number;
}

export const StatCard = ({ title, value, subtitle, growth }: IProps) => {
  const showGrowth = growth !== undefined && growth !== 0;
  const isPositiveGrowth = growth && growth > 0;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[100px] sm:min-h-[120px]">
        <h3 className="text-stone-300 text-sm sm:text-base font-medium leading-tight sm:leading-relaxed">{title}</h3>
        <div className="flex justify-between items-end mt-auto pt-2">
          <p className="text-stone-50 text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight sm:leading-relaxed">{value}</p>
          {showGrowth && (
            <div className={`px-2.5 py-0.5 rounded-full border flex justify-center items-center gap-1 ${
              isPositiveGrowth
                ? 'bg-green-700/20 border-green-700'
                : 'bg-red-700/20 border-red-700'
            }`}>
              {isPositiveGrowth ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={`text-sm font-medium leading-relaxed ${
                isPositiveGrowth ? 'text-green-400' : 'text-red-400'
              }`}>
                {Math.abs(growth).toFixed(1)}%
              </span>
            </div>
          )}
          {subtitle && !showGrowth && (
            <div className="px-2.5 py-0.5 bg-green-700/20 rounded-full border border-green-700 flex justify-center items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-sm font-medium leading-relaxed">{subtitle}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
