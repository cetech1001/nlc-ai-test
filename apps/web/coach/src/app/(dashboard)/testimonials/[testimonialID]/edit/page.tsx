'use client'

import { ChevronDownIcon, CopyIcon, SendIcon, TemplateFrame } from "@nlc-ai/web-shared";
import React, { useState } from "react";
import {useRouter} from "next/navigation";
import { useParams } from "next/navigation";

interface FormData {
  frequency: 'weekly' | 'monthly';
  day: string;
  platform: string;
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

// Star Rating Component
const StarRating: React.FC<{ rating: number; onChange: (rating: number) => void }> = ({ rating, onChange }) => (
  <div className="flex items-center gap-2 sm:gap-[10px]">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => onChange(star)}
        className="w-5 h-5 sm:w-6 sm:h-6 opacity-70"
      >
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.1043 4.17701L14.9317 7.82776C15.1108 8.18616 15.4565 8.43467 15.8573 8.49218L19.9453 9.08062C20.9554 9.22644 21.3573 10.4505 20.6263 11.1519L17.6702 13.9924C17.3797 14.2718 17.2474 14.6733 17.3162 15.0676L18.0138 19.0778C18.1856 20.0698 17.1298 20.8267 16.227 20.3574L12.5732 18.4627C12.215 18.2768 11.786 18.2768 11.4268 18.4627L7.773 20.3574C6.87023 20.8267 5.81439 20.0698 5.98724 19.0778L6.68385 15.0676C6.75257 14.6733 6.62033 14.2718 6.32982 13.9924L3.37368 11.1519C2.64272 10.4505 3.04464 9.22644 4.05466 9.08062L8.14265 8.49218C8.54354 8.43467 8.89028 8.18616 9.06937 7.82776L10.8957 4.17701C11.3477 3.27433 12.6523 3.27433 13.1043 4.17701Z"
            stroke="#F9F9F9"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={star <= rating ? "#D497FF" : "none"}
          />
        </svg>
      </button>
    ))}
    <div className="w-px h-5 sm:h-6 bg-[#373535]"></div>
    <button className="w-5 h-5 sm:w-6 sm:h-6 opacity-70">
      <CopyIcon />
    </button>
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
      label="Platform"
      placeholder="Select course platform"
      value={formData.platform}
      onChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}
      required
    />

    <FormDropdown
      label="Course"
      placeholder="Select course"
      value={formData.course}
      onChange={(value) => setFormData(prev => ({ ...prev, course: value }))}
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
  rating: number;
  setRating: (rating: number) => void;
  onSendPrompt: () => void;
}> = ({ formData, setFormData, rating, setRating, onSendPrompt }) => (
  <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-[30px] border-b border-[#373535]">
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

    <StarRating rating={rating} onChange={setRating} />
  </div>
);

const EmailTemplateSection: React.FC<{ formData: FormData }> = ({ formData }) => {
  const emailTemplate = `Hi [Student's Name],
We hope you're enjoying the course so far!
We value your feedback and want to ensure that your learning experience is as effective and rewarding as possible.

Please take a moment to complete the quick survey below.

${formData.formLink ? `Survey Link: ${formData.formLink}` : 'Survey Link: [Form Link Will Be Added Here]'}`;

  const surveyQuestions = `1. How would you rate your overall experience with this course?
• Very Satisfied
• Satisfied
• Neutral
• Dissatisfied
• Very Dissatisfied

2. What did you like most about the course? [Short Answer Text]

3. What do you feel could be improved in the course? [Short Answer Text]

4. How clear and understandable were the course materials?
• Very Clear
• Clear
• Somewhat Clear
• Unclear
• Very Unclear

5. How helpful were the assignments and exercises?
• Extremely Helpful
• Helpful
• Somewhat Helpful
• Not Helpful
• Not Applicable

6. Did the course meet your expectations?
• Exceeded Expectations
• Met Expectations
• Did Not Meet Expectations

7. How relevant was the course content to your needs?
• Extremely Relevant
• Very Relevant
• Somewhat Relevant
• Not Relevant

8. How confident are you in applying what you learned?
• Very Confident
• Confident
• Somewhat Confident
• Not Confident

9. Was the course duration appropriate?
• Too Long
• Just Right
• Too Short

10. How would you rate the instructor's communication?
• Excellent
• Good
• Fair
• Poor

11. Did you encounter any technical difficulties?
• Yes
• No
If yes, please describe: [Short Answer Text]

12. Would you recommend this course to others?
• Definitely Yes
• Maybe
• No

13. What other topics would you like to see offered? [Short Answer Text]

14. Rate your overall experience (1-5 stars): [Rating Scale]`;

  return (
    <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-[30px] flex-1 overflow-hidden">
      <h4 className="text-[#F9F9F9] font-inter text-base font-medium leading-[25.6px]">
        Automated Email Template
      </h4>

      <div className="flex-1 overflow-auto space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h5 className="text-[#F9F9F9] font-inter text-sm font-semibold">Email Message</h5>
            <div className="flex-1 h-px bg-[#373535]"></div>
          </div>
          <div className="bg-[#0A0A0A] border border-[#373535] rounded-lg p-4 max-h-48 overflow-y-auto">
            <div className="text-[#C5C5C5] font-inter text-sm leading-relaxed whitespace-pre-line">
              <span className="text-[#F9F9F9] font-bold">Subject:</span> "Your Feedback: Help Us Improve Your Learning Experience"
              <br/><br/>
              <span className="text-[#F9F9F9] font-bold">Body:</span><br/>
              {emailTemplate}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h5 className="text-[#F9F9F9] font-inter text-sm font-semibold">Generated Survey Questions</h5>
            <div className="flex-1 h-px bg-[#373535]"></div>
          </div>
          <div className="bg-[#0A0A0A] border border-[#373535] rounded-lg p-4 max-h-80 overflow-y-auto">
            <div className="text-[#C5C5C5] font-inter text-sm leading-relaxed whitespace-pre-line">
              {surveyQuestions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditTestimonialSurvey: React.FC = () => {
  const router = useRouter();
  const { templateID } = useParams<{ templateID: string }>();

  const [formData, setFormData] = useState<FormData>({
    frequency: 'weekly',
    day: '',
    platform: '',
    course: '',
    targetClients: '',
    prompt: '',
    formLink: ''
  });

  const [rating, setRating] = useState<number>(0);

  const handleSave = () => {
    console.log(`Saving template ${templateID}:`, formData);
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
            rating={rating}
            setRating={setRating}
            onSendPrompt={handleSendPrompt}
          />
          <EmailTemplateSection formData={formData} />
        </div>
      }
      saveButtonTitle={'Save Changes'}
    />
  );
};

export default EditTestimonialSurvey;
