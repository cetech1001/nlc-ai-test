import {FC} from "react";
import {FilterConfig} from "@nlc-ai/types";

interface IProps {
  dateValue: {
    start: string;
    end: string;
  };
  filter: FilterConfig;
  handleFilterChange: (key: string, value: any) => void;
}

export const DateRangeFilter: FC<IProps> = (props) => {
  const { filter, dateValue, handleFilterChange } = props;

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-[#A0A0A0] mb-1">Start Date</label>
        <input
          type="date"
          value={dateValue.start || ''}
          onChange={(e) => handleFilterChange(filter.key, { ...dateValue, start: e.target.value })}
          className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
        />
      </div>
      <div>
        <label className="block text-sm text-[#A0A0A0] mb-1">End Date</label>
        <input
          type="date"
          value={dateValue.end || ''}
          onChange={(e) => handleFilterChange(filter.key, { ...dateValue, end: e.target.value })}
          className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
        />
      </div>
    </div>
  );
}
