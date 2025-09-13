'use client'

import { cn } from "@nlc-ai/web-ui";
import React, { useState } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
                                                            checked,
                                                            onChange,
                                                            label,
                                                            className
                                                          }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative flex items-center justify-start w-16 h-8 p-1 rounded-full transition-all duration-200 ease-in-out",
          checked
            ? "bg-[#DF69FF] justify-end"
            : "bg-gray-600 justify-start"
        )}
        type="button"
        role="switch"
        aria-checked={checked}
      >
        <div
          className={cn(
            "w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out",
            checked ? "translate-x-0" : "translate-x-0"
          )}
        />
      </button>
      {label && (
        <span className="text-[#F4F4F4] font-['Plus_Jakarta_Sans'] text-xl font-normal">
          {label}
        </span>
      )}
    </div>
  );
};


interface CommunityCardProps {
  image: string;
  title: string;
  status: 'On' | 'Off';
  className?: string;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ image, title, status, className }) => {
  return (
    <div className={cn(
      "flex h-[110px] px-[30px] py-6 justify-between items-center flex-1 rounded-[30px] border border-[#2B2A2A] relative overflow-hidden",
      "bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]",
      className
    )}>
      {/* Glow Effect */}
      <div className="-left-20 -bottom-1 w-[858px] h-[91px] glow-circle"></div>

      <div className="flex items-center gap-6 relative z-10">
        <img
          src={image}
          alt={title}
          className="w-[62px] h-[62px] rounded-[14.091px] border border-black"
        />
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-white font-inter text-xl font-semibold leading-[25.6px]">
            {title}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <button className="flex px-[18px] py-[13px] justify-center items-center gap-2 rounded-lg border border-white">
          <svg className="w-5 h-5" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.39453 10.6333C2.39453 11.9667 3.33036 13.1283 4.65036 13.3225C5.54036 13.4533 6.44036 13.555 7.3487 13.6258C7.73703 13.6567 8.09286 13.86 8.30953 14.185L10.5195 17.5L12.7295 14.185C12.9462 13.86 13.302 13.6567 13.6904 13.6267C14.5987 13.555 15.4987 13.4533 16.3887 13.3225C17.7087 13.1283 18.6445 11.9675 18.6445 10.6325V5.6175C18.6445 4.2825 17.7087 3.12167 16.3887 2.9275C14.4453 2.64226 12.4837 2.49938 10.5195 2.5C8.5262 2.5 6.5662 2.64584 4.65036 2.9275C3.33036 3.12167 2.39453 4.28334 2.39453 5.6175V10.6325V10.6333Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white font-inter text-base font-medium leading-6 tracking-[-0.32px]">
            {status}
          </span>
          <svg className="w-6 h-6 opacity-40" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.4" d="M19.5 8.5L12.5 15.5L5.5 8.5" stroke="#F9F9F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export const ChatSettings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    // <SettingsLayout>
      <div className="flex w-full px-4 lg:px-[30px] py-[18px] flex-col items-start gap-[18px]">
        {/* Back Navigation */}
        <div className="flex items-center gap-5">
          <a href="/settings" className="flex w-8 h-8 justify-center items-center">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.66699 16.3659L25.667 16.3659" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.7334 24.3983L5.66673 16.3663L13.7334 8.33301" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <h2 className="text-[#F9F9F9] font-inter text-[30px] font-medium leading-[25.6px]">
            Chat
          </h2>
        </div>

        {/* Main Content */}
        <div className="flex-1 self-stretch rounded-[30px] border border-[#2B2A2A] relative overflow-hidden bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]">
          {/* Glow Effect */}
          <div className="absolute right-[-133px] top-[-21px] w-[267px] h-[290px] glow-circle"></div>

          <div className="flex px-[37px] py-8 flex-col items-start gap-14 flex-1 relative z-10">
            <div className="flex flex-col items-start gap-8 self-stretch">
              {/* Notifications Section */}
              <div className="flex px-[30px] py-[30px] justify-between items-center self-stretch rounded-[30px] border border-[#454444] relative overflow-hidden bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]">
                {/* Glow Effect */}
                <div className="-left-20 -bottom-3 w-[858px] h-[91px] glow-circle"></div>

                <div className="flex flex-col items-start gap-5 flex-1 relative z-10">
                  <div className="flex justify-between items-center self-stretch">
                    <div className="flex flex-col items-start gap-3">
                      <h3 className="text-[#F9F9F9] font-inter text-xl font-semibold">
                        Notifications
                      </h3>
                      <p className="text-[#F9F9F9] font-inter text-base font-normal leading-[22px]">
                        Notify me with sound and blinking tab header when somebody messages me.
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={notifications}
                      onChange={setNotifications}
                      label="On"
                    />
                  </div>
                </div>
              </div>

              {/* Email Notifications Section */}
              <div className="flex px-[30px] py-[30px] justify-between items-center self-stretch rounded-[30px] border border-[#454444] relative overflow-hidden bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]">
                {/* Glow Effect */}
                <div className="-left-20 -bottom-3 w-[858px] h-[91px] glow-circle"></div>

                <div className="flex flex-col items-start gap-5 flex-1 relative z-10">
                  <div className="flex justify-between items-center self-stretch">
                    <div className="flex flex-col items-start gap-3">
                      <h3 className="text-[#F9F9F9] font-inter text-xl font-semibold">
                        Email notifications
                      </h3>
                      <p className="text-[#F9F9F9] font-inter text-base font-normal leading-[22px]">
                        If you're offline and somebody messages you, we'll let you know via email. We won't email you if you're online.
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={emailNotifications}
                      onChange={setEmailNotifications}
                      label="On"
                    />
                  </div>
                </div>
              </div>

              {/* Who can message me Section */}
              <div className="flex px-[30px] py-[30px] justify-between items-center self-stretch rounded-[30px] border border-[#454444] relative overflow-hidden bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]">
                {/* Glow Effect */}
                <div className="-left-20 top-3 w-[858px] h-[91px] glow-circle"></div>

                <div className="flex flex-col items-start gap-5 flex-1 relative z-10">
                  <div className="flex justify-between items-center self-stretch">
                    <div className="flex flex-col items-start gap-3">
                      <h3 className="text-[#F9F9F9] font-inter text-xl font-semibold">
                        Who can message me?
                      </h3>
                      <p className="text-[#F9F9F9] font-inter text-base font-normal leading-[22px]">
                        Only members in the group you're in can message you. You choose what group users can message you from by turning your chat on/off below.
                      </p>
                    </div>
                    <div className="flex items-center gap-[10px]">
                      <span className="text-[#F4F4F4] font-['Plus_Jakarta_Sans'] text-xl font-normal">
                        On
                      </span>
                    </div>
                  </div>

                  {/* Community Cards */}
                  <div className="flex flex-col lg:flex-row items-start gap-4 self-stretch">
                    <CommunityCard
                      image="https://api.builder.io/api/v1/image/assets/TEMP/9e1bf38b1c9d39a8d1f6f8da3665aeb22e20135f?width=124"
                      title="Ultimate branding Course"
                      status="On"
                    />
                    <CommunityCard
                      image="https://api.builder.io/api/v1/image/assets/TEMP/ddc1ae4528aebec7dc7640621455acb2be51d317?width=122"
                      title="BNB BOSS Academy"
                      status="On"
                    />
                  </div>
                </div>
              </div>

              {/* Blocked Users Section */}
              <div className="flex px-[30px] py-[30px] justify-between items-center self-stretch rounded-[30px] border border-[#454444] relative overflow-hidden bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]">
                {/* Glow Effect */}
                <div className="-left-20 -bottom-3 w-[858px] h-[91px] glow-circle"></div>

                <div className="flex flex-col items-start gap-5 flex-1 relative z-10">
                  <div className="flex justify-between items-center self-stretch">
                    <div className="flex flex-col items-start gap-3">
                      <h3 className="text-[#F9F9F9] font-inter text-xl font-semibold">
                        Blocked users
                      </h3>
                      <p className="text-[#F9F9F9] font-inter text-base font-normal leading-[22px]">
                        You have no blocked users.
                      </p>
                    </div>
                    <div className="flex items-center gap-[10px]">
                      <span className="text-[#F4F4F4] font-['Plus_Jakarta_Sans'] text-xl font-normal">
                        On
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    // </SettingsLayout>
  );
};

export default ChatSettings;
