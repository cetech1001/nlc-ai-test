'use client'

import * as React from "react";
import { X, Plus } from "lucide-react";
import { cn } from "../../utils";
import { Input, Button } from "../primitives";
import {useState} from "react";

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxTags?: number;
}

const TagInput = React.forwardRef<HTMLDivElement, TagInputProps>(
  ({ value = [], onChange, placeholder = "Add item...", disabled, className, maxTags, ...props }, ref) => {
    const [inputValue, setInputValue] = useState("");

    const addTag = () => {
      const trimmed = inputValue.trim();
      if (trimmed && !value.includes(trimmed) && (!maxTags || value.length < maxTags)) {
        onChange([...value, trimmed]);
        setInputValue("");
      }
    };

    const removeTag = (index: number) => {
      const newTags = value.filter((_, i) => i !== index);
      onChange(newTags);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    };

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            // @ts-ignore
            onChange={(e) => setInputValue(e.target.value)}
            onKeyUp={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || (maxTags ? value.length >= maxTags : false)}
            className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 flex-1"
          />
          <Button
            type="button"
            onClick={addTag}
            disabled={!inputValue.trim() || disabled || (maxTags ? value.length >= maxTags : false)}
            className="px-4 py-2 bg-[#7B21BA] hover:bg-[#8B31CA] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {value.length > 0 && (
          <div className="space-y-2">
            <p className="text-white text-sm font-medium">Items ({value.length}{maxTags ? `/${maxTags}` : ''}):</p>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {value.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2"
                >
                  <span className="text-white text-sm flex-1">{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    disabled={disabled}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

TagInput.displayName = "TagInput";

export { TagInput };
