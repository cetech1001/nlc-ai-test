interface IProps {
  title: string;
  value: string;
  subtitle?: string;
}

export const StatCard = ({ title, value, subtitle }: IProps) => (
  <div className="bg-[#1A1A1A] rounded-xl p-4 sm:p-6 border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all duration-200 hover:shadow-lg hover:shadow-black/20">
    <h3 className="text-[#A0A0A0] text-sm font-medium mb-2 truncate">{title}</h3>
    <p className="text-white text-xl sm:text-2xl font-semibold mb-1">{value}</p>
    {subtitle && <p className="text-[#A0A0A0] text-xs sm:text-sm">{subtitle}</p>}
  </div>
);
