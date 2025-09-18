import React, {FC} from "react";

interface PaymentFormData {
  oneTimePrice: string;
  subscriptionPrice: string;
  subscriptionFrequency: string;
  monthlyInstallments: string;
  monthlyAmount: string;
  enrollmentDuration: string;
  enrollmentDurationUnit: string;
}

interface IProps {
  formData: PaymentFormData;
  handleFormChange: (field: string, value: string) => void;
}

export const OneTimeForm: FC<IProps> = ({ formData, handleFormChange }) => (
  <div className="flex p-4 md:p-6 items-start gap-4 md:gap-[30px] self-stretch rounded-[20px] border border-[#2B2A2A] bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]">
    <div className="flex flex-col items-start gap-2 flex-1">
      <h4 className="text-white font-inter text-lg md:text-xl font-semibold leading-[25.6px]">
        One-time payment
      </h4>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-white/70 text-sm">Price ($)</label>
          <input
            type="number"
            value={formData.oneTimePrice}
            onChange={(e) => handleFormChange('oneTimePrice', e.target.value)}
            className="bg-neutral-800 border border-neutral-600 text-white rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
            placeholder="2000"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-white/70 text-sm">Access Duration (Optional)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.enrollmentDuration}
              onChange={(e) => handleFormChange('enrollmentDuration', e.target.value)}
              className="bg-neutral-800 border border-neutral-600 text-white rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none flex-1"
              placeholder="Unlimited"
            />
            <select
              value={formData.enrollmentDurationUnit}
              onChange={(e) => handleFormChange('enrollmentDurationUnit', e.target.value)}
              className="bg-neutral-800 border border-neutral-600 text-white rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="days">Days</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>
      </div>
      <p className="text-white/70 text-sm">
        One Time payment of ${formData.oneTimePrice}.00
      </p>
    </div>
  </div>
);
