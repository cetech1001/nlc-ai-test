import {FilterConfig} from "../index";
import {FC} from "react";

interface IProps {
  selectedValues: any[];
  filter: FilterConfig;
  handleFilterChange: (key: string, value: any) => void;
}

export const MultiSelectFilter: FC<IProps> = (props) => {
  const { filter, selectedValues, handleFilterChange } = props;
  return (
    <div className="space-y-2">
      <div className="text-sm text-[#A0A0A0]">
        {selectedValues.length} selected
      </div>
      <div className="max-h-40 overflow-y-auto space-y-1">
        {filter.options?.map((option, idx) => (
          <label key={idx} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={(e) => {
                const newValues = e.target.checked
                  ? [...selectedValues, option.value]
                  : selectedValues.filter(v => v !== option.value);
                handleFilterChange(filter.key, newValues);
              }}
              className="w-4 h-4 text-[#7B21BA] bg-[#2A2A2A] border-[#3A3A3A] rounded focus:ring-[#7B21BA] focus:ring-2"
            />
            <span className="text-white text-sm">
                    {option.label}
              {option.count !== undefined && (
                <span className="text-[#A0A0A0] ml-1">({option.count})</span>
              )}
                  </span>
          </label>
        ))}
      </div>
    </div>
  );
}
