interface IProps {
  title: string;
  value: string;
  subtitle?: string;
}

export const StatCard = ({ title, value, subtitle }: IProps) => (
  <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
    <h3 className="text-[#A0A0A0] text-sm font-medium mb-2">{title}</h3>
    <p className="text-white text-2xl font-semibold">{value}</p>
    {subtitle && <p className="text-[#A0A0A0] text-sm mt-1">{subtitle}</p>}
  </div>
);
