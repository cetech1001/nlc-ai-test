interface IProps {
  title: string;
  value: string;
  subtitle?: string;
}

export const StatCard = ({ title, value, subtitle }: IProps) => (
  <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
    <div className="absolute inset-0 opacity-20">
      <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
    </div>
    <div className="relative z-10 flex flex-col justify-between h-full min-h-[100px] sm:min-h-[120px]">
      <h3 className="text-stone-300 text-sm sm:text-base font-medium leading-tight sm:leading-relaxed">{title}</h3>
      <div className="flex justify-between items-end mt-auto pt-2">
        <p className="text-stone-50 text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight sm:leading-relaxed">{value}</p>
        {subtitle && (
          <div className="opacity-0 px-2.5 py-0.5 bg-green-700/20 rounded-full border border-green-700 flex justify-center items-center gap-1">
            <div className="w-4 h-4 relative">
              <div className="w-[0.67px] h-2.5 absolute left-[8.15px] top-[12.83px] border border-stone-50" />
              <div className="w-2 h-1 absolute left-[11.83px] top-[6.87px] border border-stone-50" />
            </div>
            <span className="text-stone-50 text-sm font-medium leading-relaxed">16%</span>
          </div>
        )}
      </div>
    </div>
  </div>
);
