'use client'

import { ChevronDownIcon, SendIcon, TemplateFrame } from "@nlc-ai/web-shared";
import React, { useState } from "react";
import {useRouter} from "next/navigation";

interface FormData {
  frequency: 'weekly' | 'monthly';
  day: string;
  course: string;
  targetClients: string;
  prompt: string;
  formLink: string;
}

const FormDropdown: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}> = ({ label, placeholder, value, onChange, required = false }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex w-full min-h-[50px] px-4 sm:px-5 py-2 sm:py-[10px] justify-between items-center border border-white/30 rounded-[10px]">
      <span className="text-white/50 font-inter text-sm sm:text-base leading-5 flex-1">
        {value || placeholder}
      </span>
      <ChevronDownIcon className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
  </div>
);

const FormInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}> = ({ label, placeholder, value, onChange, required = false }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-h-[50px] px-4 sm:px-5 py-2 sm:py-[10px] border border-white/30 rounded-[10px] bg-transparent text-white placeholder:text-white/50 font-inter text-sm sm:text-base outline-none"
    />
  </div>
);

const FormSidebar: React.FC<{
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}> = ({ formData, setFormData }) => (
  <>
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <h3 className="text-[#F9F9F9] font-inter text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">
          Course A Testimonial Survey
        </h3>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-[10px]">
        <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
          Created:
        </span>
        <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
          Apr 14, 2025 | 10:30 AM
        </span>
      </div>
    </div>

    <div className="flex flex-col gap-3">
      <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
        Select Frequency<span className="text-red-500">*</span>
      </label>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-4 h-4 rounded border border-[#C5C5C5] bg-[#DF69FF]">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <span className="text-[#F9F9F9] font-inter text-sm font-normal leading-[25.6px]">
            Weekly
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-[#C5C5C5]"></div>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            Monthly
          </span>
        </div>
      </div>
    </div>

    <FormDropdown
      label="Day"
      placeholder="Select day of the week"
      value={formData.day}
      onChange={(value) => setFormData(prev => ({ ...prev, day: value }))}
      required
    />

    <FormDropdown
      label="Course"
      placeholder="Select course"
      value={formData.course}
      onChange={(value) => setFormData(prev => ({ ...prev, courses: value }))}
      required
    />

    <FormDropdown
      label="Target Clients"
      placeholder="Select target client criteria"
      value={formData.targetClients}
      onChange={(value) => setFormData(prev => ({ ...prev, targetClients: value }))}
      required
    />

    <FormInput
      label="Survey Form Link"
      placeholder="Enter Google Form or survey link"
      value={formData.formLink}
      onChange={(value) => setFormData(prev => ({ ...prev, formLink: value }))}
      required
    />
  </>
);

const PromptSection: React.FC<{
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSendPrompt: () => void;
}> = ({ formData, setFormData, onSendPrompt }) => (
  <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-[30px]">
    <div className="flex flex-col gap-3">
      <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
        Your Prompt<span className="text-red-500">*</span>
      </label>
      <div className="flex w-full h-20 sm:h-[92px] px-4 sm:px-5 py-2 sm:py-[10px] justify-between items-start border border-white/20 rounded-[10px] bg-[#171717] gap-3">
        <textarea
          placeholder="Enter a prompt to generate email body. (Tip: Try mentioning tone & purpose of the email and press enter to submit)"
          value={formData.prompt}
          onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
          className="flex-1 h-full bg-transparent text-white placeholder:text-white/50 font-inter text-sm sm:text-base outline-none resize-none"
        />
        <button
          onClick={onSendPrompt}
          className="flex p-2 sm:p-[10px] items-center gap-[10px] rounded-full bg-gradient-to-r from-[#B339D4] via-[#7B21BA] to-[#7B26F0] flex-shrink-0"
        >
          <SendIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  </div>
);

const NewTestimonialSurveyTemplatePage: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    frequency: 'weekly',
    day: '',
    courses: '',
    targetClients: '',
    prompt: '',
    formLink: ''
  });

  const handleSave = () => {
    console.log(`Saving template:`, formData);
  };

  const handleDiscard = () => {
    router.back();
  };

  const handleSendPrompt = () => {
    console.log('Sending prompt:', formData.prompt);
  };

  return (
    <TemplateFrame
      pageTitle={'Edit Testimonial Survey'}
      onSave={handleSave}
      onDiscard={handleDiscard}
      sidebarComponent={<FormSidebar formData={formData} setFormData={setFormData} />}
      mainComponent={
        <div className="flex-1 flex flex-col overflow-hidden">
          <PromptSection
            formData={formData}
            setFormData={setFormData}
            onSendPrompt={handleSendPrompt}
          />
        </div>
      }
      saveButtonTitle={'Create New Template'}
    />
  );
};

export default NewTestimonialSurveyTemplatePage;
