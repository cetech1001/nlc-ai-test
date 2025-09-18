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

export const MonthlyPlanForm: FC<IProps> = ({ formData, handleFormChange }) => (
  <div className="flex p-4 md:p-6 flex-col gap-4 self-stretch rounded-[20px] border border-[#2B2A2A] bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]">
    <h4 className="text-white font-inter text-lg md:text-xl font-semibold leading-[25.6px]">
      Payment Plan Settings
    </h4>
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-white/70 text-sm">Total Price ($)</label>
        <input
          type="number"
          value={formData.oneTimePrice}
          onChange={(e) => handleFormChange('oneTimePrice', e.target.value)}
          className="bg-neutral-800 border border-neutral-600 text-white rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
          placeholder="2000"
        />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-white/70 text-sm">Number of Installments</label>
        <select
          value={formData.monthlyInstallments}
          onChange={(e) => handleFormChange('monthlyInstallments', e.target.value)}
          className="bg-neutral-800 border border-neutral-600 text-white rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
        >
          <option value="2">2 payments</option>
          <option value="3">3 payments</option>
          <option value="4">4 payments</option>
          <option value="6">6 payments</option>
          <option value="12">12 payments</option>
        </select>
      </div>
    </div>
    <p className="text-white/70 text-sm">
      {formData.monthlyInstallments} monthly payments of ${Math.ceil(parseFloat(formData.oneTimePrice || '0') / parseInt(formData.monthlyInstallments))}
    </p>
  </div>
);
