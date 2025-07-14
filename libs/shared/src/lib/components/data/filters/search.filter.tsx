import {Search} from "lucide-react";
import {FilterConfig} from "@nlc-ai/types";
import {FC} from "react";

interface IProps {
  value: any;
  filter: FilterConfig;
  handleFilterChange: (key: string, value: any) => void;
}

export const SearchFilter: FC<IProps> = (props) => {
  const { filter, value, handleFilterChange } = props;
  return (
    <div className="relative">
      <input
        type="text"
        value={value || ''}
        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
        placeholder={filter.placeholder || 'Search...'}
        className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
    </div>
  );
}
