import { cn } from "@nlc-ai/web-ui";
import React, { useState } from 'react';

type PrivacyOption = 'open' | 'level' | 'buy' | 'time' | 'private';

interface PrivacyOptionCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

const PrivacyOptionCard: React.FC<PrivacyOptionCardProps> = ({
 title,
 description,
 isSelected,
 onSelect
}) => {
  return (
    <div
      className={cn(
        "flex p-6 flex-col justify-center items-start gap-3 flex-1 rounded-2xl border border-[#454444] cursor-pointer transition-colors",
        "bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]",
        isSelected && "border-[#DF69FF]"
      )}
      onClick={onSelect}
    >
      <div className={cn(
        "flex w-5 h-5 p-1 justify-center items-center gap-[10px] rounded-full border",
        isSelected ? "border-[#DF69FF]/40" : "border-white/40"
      )}>
        {isSelected && (
          <div className="w-3 h-3 rounded-full bg-[#DF69FF]"></div>
        )}
      </div>

      <div className="flex flex-col items-start gap-1">
        <span className="text-[#F9F9F9] font-inter text-lg font-medium">
          {title}
        </span>
        <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-5">
          {description}
        </p>
      </div>
    </div>
  );
};

const FileUploadArea: React.FC = () => {
  return (
    <div className="flex w-[441px] h-[222px] p-14 justify-center items-center rounded-[10px] border border-dashed border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]">
      <div className="w-[284px] h-[108px] flex flex-col items-center gap-5">
        <svg className="w-10 h-10" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_42564_9746)">
            <path d="M29.0582 17.8156V10.2458C29.0582 10.0291 28.9581 9.82891 28.8165 9.67052L20.3296 0.758484C20.1712 0.591858 19.946 0.5 19.721 0.5H6.26525C3.78113 0.5 1.79688 2.52575 1.79688 5.01019V30.4542C1.79688 32.9386 3.78113 34.9311 6.26525 34.9311H16.8866C18.8955 38.2658 22.5473 40.4999 26.7071 40.4999C33.0264 40.4999 38.1869 35.3645 38.1869 29.0369C38.1954 23.5096 34.2269 18.8911 29.0582 17.8156ZM20.5548 3.42633L26.2487 9.42028H22.5555C21.455 9.42028 20.5548 8.51177 20.5548 7.41131V3.42633ZM6.26525 33.2636C4.70642 33.2636 3.46435 32.013 3.46435 30.4542V5.01019C3.46435 3.44281 4.70642 2.16748 6.26525 2.16748H18.8873V7.41131C18.8873 9.43706 20.5298 11.0878 22.5555 11.0878H27.3907V17.5987C27.1408 17.5904 26.9406 17.5654 26.7239 17.5654C23.8144 17.5654 21.1383 18.6827 19.1208 20.4334H8.53301C8.07433 20.4334 7.69927 20.8085 7.69927 21.2669C7.69927 21.7256 8.07433 22.1006 8.53301 22.1006H17.5702C16.9781 22.9344 16.4862 23.7681 16.1029 24.6851H8.53301C8.07433 24.6851 7.69927 25.0602 7.69927 25.5189C7.69927 25.9773 8.07433 26.3526 8.53301 26.3526H15.5609C15.3525 27.1864 15.2441 28.1117 15.2441 29.0369C15.2441 30.5375 15.5359 32.0216 16.0611 33.2722H6.26525V33.2636ZM26.7157 38.841C21.3134 38.841 16.9198 34.4474 16.9198 29.0452C16.9198 23.643 21.3049 19.2494 26.7157 19.2494C32.1261 19.2494 36.5112 23.643 36.5112 29.0452C36.5112 34.4474 32.1179 38.841 26.7157 38.841Z" fill="#DF69FF"/>
            <path d="M8.53296 17.9241H16.9781C17.4368 17.9241 17.8118 17.5487 17.8118 17.0903C17.8118 16.6317 17.4368 16.2566 16.9781 16.2566H8.53296C8.07428 16.2566 7.69922 16.6317 7.69922 17.0903C7.69922 17.5487 8.07428 17.9241 8.53296 17.9241Z" fill="#DF69FF"/>
            <path d="M27.3067 22.8926C27.1483 22.726 26.9316 22.6259 26.6982 22.6259C26.4647 22.6259 26.248 22.726 26.0896 22.8926L21.2041 28.1364C20.8873 28.47 20.9123 29.0034 21.2459 29.3119C21.5794 29.6287 22.1211 29.6037 22.4379 29.2704L25.8894 25.5772V34.6809C25.8894 35.1396 26.2645 35.5146 26.7232 35.5146C27.1816 35.5146 27.5569 35.1396 27.5569 34.6809V25.5772L30.9831 29.2704C31.1501 29.4453 31.3667 29.5372 31.5919 29.5372C31.7918 29.5372 31.992 29.4621 32.1587 29.3119C32.4922 28.9952 32.5172 28.47 32.2005 28.1364L27.3067 22.8926Z" fill="#DF69FF"/>
          </g>
          <defs>
            <clipPath id="clip0_42564_9746">
              <rect width="40" height="40" fill="white" transform="translate(0 0.5)"/>
            </clipPath>
          </defs>
        </svg>

        <div className="flex flex-col items-center gap-2 self-stretch">
          <span className="text-white text-center font-inter text-xl font-normal leading-5">
            Drag or click to upload
          </span>
          <span className="self-stretch text-white text-center font-inter text-base font-normal leading-5 opacity-50">
            Maximum File size 30MB
          </span>
        </div>
      </div>
    </div>
  );
};

export const SettingsTab: React.FC<{ courseID: string }> = () => {
  const [selectedPrivacy, setSelectedPrivacy] = useState<PrivacyOption>('private');
  // const [activeTab, setActiveTab] = useState<'curriculum' | 'settings' | 'pricing' | 'drip'>('settings');
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [upgradeToAnnual, setUpgradeToAnnual] = useState(false);

  const privacyOptions = [
    {
      id: 'open' as PrivacyOption,
      title: 'Open',
      description: 'All Members can access.'
    },
    {
      id: 'level' as PrivacyOption,
      title: 'Level unlock',
      description: 'Members unlock at a specific level'
    },
    {
      id: 'buy' as PrivacyOption,
      title: 'Buy now',
      description: 'Members pay a 1 time price to unlock'
    },
    {
      id: 'time' as PrivacyOption,
      title: 'Time unlock',
      description: 'Members unlock after x days'
    },
    {
      id: 'private' as PrivacyOption,
      title: 'Private',
      description: 'Members you select can access'
    }
  ];

  return (

    <div className="flex w-full items-center rounded-[30px] border border-[#373535] relative">
      <div className="flex h-[859px] p-8 flex-col items-start gap-5 flex-1">
        <div className="flex flex-col items-start gap-8 self-stretch">
          {/* Header */}
          <div className="flex justify-between items-center self-stretch">
            <div className="flex flex-col items-start gap-1">
              <div className="flex h-7 flex-col justify-center self-stretch">
                <h3 className="text-[#F9F9F9] font-inter text-2xl font-semibold leading-[25.6px]">
                  Settings
                </h3>
              </div>
            </div>

            <button className="flex max-w-[686.66px] px-5 py-2 justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-[#FEBEFA] via-[#B339D4] via-[#7B21BA] to-[#7B26F0]">
              <span className="text-white font-inter text-sm font-semibold leading-6 tracking-[-0.32px]">
                Import with key
              </span>
            </button>
          </div>

          {/* Form Section */}
          <div className="flex flex-col items-start gap-5 self-stretch">
            <div className="flex justify-center items-start gap-[30px] self-stretch">
              {/* Upload Cover */}
              <div className="flex flex-col items-start gap-3">
                <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                  Upload Cover
                  <span className="text-red-500">*</span>
                </label>
                <FileUploadArea />
              </div>

              {/* Course Details */}
              <div className="flex flex-col items-start gap-[30px] flex-1">
                {/* Course Name */}
                <div className="flex flex-col items-start gap-3 self-stretch">
                  <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                    Course Name
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex h-[50px] px-5 justify-between items-center self-stretch rounded-[10px] border border-white/30">
                    <input
                      type="text"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="Enter course name.."
                      className="flex-1 bg-transparent text-white font-inter text-base font-normal placeholder:text-white/50 outline-none"
                    />
                  </div>
                </div>

                {/* Course Description */}
                <div className="flex h-[142px] flex-col items-start gap-3 self-stretch">
                  <label className="self-stretch text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                    Course Description
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex px-5 py-[15px] justify-between items-start flex-1 self-stretch rounded-[10px] border border-white/30">
                    <textarea
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      placeholder="Enter your course description..."
                      className="flex-1 bg-transparent text-white font-inter text-base font-normal placeholder:text-white/50 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="flex flex-col items-start gap-4 self-stretch">
              <h4 className="text-[#F9F9F9] font-inter text-xl font-medium leading-6">
                Privacy settings
              </h4>

              <div className="flex items-start gap-4 self-stretch">
                {privacyOptions.map((option) => (
                  <PrivacyOptionCard
                    key={option.id}
                    title={option.title}
                    description={option.description}
                    isSelected={selectedPrivacy === option.id}
                    onSelect={() => setSelectedPrivacy(option.id)}
                  />
                ))}
              </div>
            </div>

            {/* Instructions */}
            <p className="self-stretch text-[#C5C5C5] font-inter text-sm font-normal leading-5">
              To give members access: Go to the Members tab, find the member you want to give access to, click Membership ⚙️, courses tab, give access to course.
            </p>

            {/* Toggle Switch */}
            <div className="flex items-center gap-[10px]">
              <button
                onClick={() => setUpgradeToAnnual(!upgradeToAnnual)}
                className={cn(
                  "flex w-12 h-6 p-1 items-start rounded-full transition-colors",
                  upgradeToAnnual ? "bg-[#DF69FF] justify-end" : "bg-white/10 justify-start"
                )}
              >
                <div className="w-4 h-4 bg-white/20 rounded-full"></div>
              </button>
              <span className="text-[#F9F9F9] font-inter text-lg font-normal">
                Or when members upgrade to annual
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};
