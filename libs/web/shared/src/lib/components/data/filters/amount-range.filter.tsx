import React from 'react';
import { Input, Label } from '@nlc-ai/web-ui';

interface AmountRangeFilterProps {
  value: { min: string; max: string };
  onChange: (value: { min: string; max: string }) => void;
  placeholder?: { min?: string; max?: string };
  disabled?: boolean;
}

export const AmountRangeFilter: React.FC<AmountRangeFilterProps> = ({
  value,
  onChange,
  placeholder = { min: 'Min amount', max: 'Max amount' },
  disabled = false,
}) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minValue = e.target.value;
    // Only allow numbers and decimal points
    if (/^\d*\.?\d*$/.test(minValue) || minValue === '') {
      onChange({ ...value, min: minValue });
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxValue = e.target.value;
    // Only allow numbers and decimal points
    if (/^\d*\.?\d*$/.test(maxValue) || maxValue === '') {
      onChange({ ...value, max: maxValue });
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-white text-sm font-medium">Amount Range ($)</Label>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Input
            type="text"
            placeholder={placeholder.min}
            value={value.min}
            onChange={handleMinChange}
            disabled={disabled}
            className="bg-[#2A2A2A] border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20"
          />
          <span className="text-xs text-[#A0A0A0]">Minimum</span>
        </div>
        <div className="space-y-1">
          <Input
            type="text"
            placeholder={placeholder.max}
            value={value.max}
            onChange={handleMaxChange}
            disabled={disabled}
            className="bg-[#2A2A2A] border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20"
          />
          <span className="text-xs text-[#A0A0A0]">Maximum</span>
        </div>
      </div>
    </div>
  );
};
