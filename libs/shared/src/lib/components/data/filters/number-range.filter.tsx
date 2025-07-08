import {FC} from "react";
import {FilterConfig} from "../index";

interface IProps {
  numberValue: {
    min: string;
    max: string;
  };
  filter: FilterConfig;
  handleFilterChange: (key: string, value: any) => void;
}

export const NumberRangeFilter: FC<IProps> = (props) => {
  const { filter, numberValue, handleFilterChange } = props;

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-[#A0A0A0] mb-1">Min {filter.label}</label>
        <input
          type="number"
          value={numberValue.min || ''}
          onChange={(e) => handleFilterChange(filter.key, { ...numberValue, min: e.target.value })}
          placeholder="0"
          className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
        />
      </div>
      <div>
        <label className="block text-sm text-[#A0A0A0] mb-1">Max {filter.label}</label>
        <input
          type="number"
          value={numberValue.max || ''}
          onChange={(e) => handleFilterChange(filter.key, { ...numberValue, max: e.target.value })}
          placeholder="1000"
          className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
        />
      </div>
    </div>
  );
}
