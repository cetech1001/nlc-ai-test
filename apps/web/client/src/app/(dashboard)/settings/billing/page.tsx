'use client'

import { cn } from "@nlc-ai/web-ui";
import React, { useState } from 'react';

interface PaymentCardProps {
  type: 'visa' | 'mastercard';
  cardNumber: string;
  expiryDate: string;
  isDefault?: boolean;
  className?: string;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
                                                   type,
                                                   cardNumber,
                                                   expiryDate,
                                                   isDefault,
                                                   className
                                                 }) => {
  return (
    <div className={cn(
      "flex p-[30px] flex-col items-start gap-[10px] flex-1 rounded-[30px] border border-[#454444] relative overflow-hidden",
      "bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)]",
      className
    )}>
      <div className="flex flex-col items-start gap-5 self-stretch relative z-10">
        <div className="flex justify-between items-center self-stretch">
          {/* Visa Logo */}
          <svg className="w-[87.5px] h-14" viewBox="0 0 88 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="87.5" height="56" rx="4.48718" fill="#0E4595"/>
            <path d="M32.8913 39.0752L36.6337 17.115H42.6196L38.8745 39.0752H32.8913ZM60.4998 17.5884C59.314 17.1435 57.4555 16.666 55.1351 16.666C49.2204 16.666 45.0541 19.6444 45.0188 23.9131C44.9852 27.0688 47.9931 28.8291 50.2634 29.8795C52.5935 30.9559 53.3766 31.6423 53.3656 32.6036C53.3509 34.0755 51.505 34.748 49.7846 34.748C47.3888 34.748 46.116 34.4152 44.1502 33.5952L43.3788 33.2464L42.5387 38.1624C43.9368 38.7754 46.5222 39.3064 49.2064 39.3339C55.4986 39.3339 59.583 36.3896 59.6297 31.8311C59.652 29.333 58.0574 27.4319 54.6039 25.8645C52.5118 24.8487 51.2305 24.1707 51.2441 23.1421C51.2441 22.2293 52.3286 21.2531 54.6719 21.2531C56.6293 21.2229 58.0474 21.6497 59.1521 22.0945L59.6885 22.348L60.4998 17.5884ZM75.9031 17.1146H71.2777C69.8449 17.1146 68.7725 17.5058 68.1433 18.9357L59.2538 39.0607H65.5393L66.7993 35.7607H74.4654L75.1935 39.0607H80.7479L75.9031 17.1139V17.1146ZM68.5646 31.2952L70.9495 25.1564L73.5333 31.2952H68.5646ZM27.8098 17.1146L21.9495 32.0906L21.325 29.0472C20.2341 25.539 16.835 21.7381 13.0352 19.8352L18.3935 39.0403L24.7267 39.0331L34.1503 17.1144H27.8098" fill="white"/>
            <path d="M16.4794 17.1137H6.82737L6.75098 17.5706C14.26 19.3884 19.2287 23.7812 21.2917 29.0589L19.1928 18.9673C18.8305 17.5768 17.7797 17.1619 16.4796 17.1133" fill="#F2AE14"/>
          </svg>

          {isDefault && (
            <div className="flex px-2 py-[5px] justify-center items-center gap-[10px] rounded-lg bg-white/10">
              <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
                Used by default
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-10 self-stretch">
          <div className="flex flex-col items-start gap-[6px]">
            <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
              Payment Method
            </span>
            <span className="text-[#F9F9F9] font-inter text-base font-medium">
              Visa
            </span>
          </div>

          <div className="flex flex-col items-start gap-[6px]">
            <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
              Card Number
            </span>
            <span className="text-[#F9F9F9] font-inter text-base font-medium">
              {cardNumber}
            </span>
          </div>

          <div className="flex flex-col items-start gap-[6px]">
            <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
              Expires
            </span>
            <span className="text-[#F9F9F9] font-inter text-base font-medium">
              {expiryDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch">
          <svg className="w-4 h-4" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.2413 3.4915L12.366 2.36616C12.6005 2.13171 12.9184 2 13.25 2C13.5816 2 13.8995 2.13171 14.134 2.36616C14.3685 2.60062 14.5002 2.9186 14.5002 3.25016C14.5002 3.58173 14.3685 3.89971 14.134 4.13417L7.05467 11.2135C6.70222 11.5657 6.26758 11.8246 5.79 11.9668L4 12.5002L4.53333 10.7102C4.67552 10.2326 4.93442 9.79795 5.28667 9.4455L11.2413 3.4915ZM11.2413 3.4915L13 5.25016M12 9.8335V13.0002C12 13.398 11.842 13.7795 11.5607 14.0608C11.2794 14.3421 10.8978 14.5002 10.5 14.5002H3.5C3.10218 14.5002 2.72064 14.3421 2.43934 14.0608C2.15804 13.7795 2 13.398 2 13.0002V6.00016C2 5.60234 2.15804 5.22081 2.43934 4.9395C2.72064 4.6582 3.10218 4.50016 3.5 4.50016H6.66667" stroke="#DF69FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#DF69FF] font-inter text-sm font-bold">
            Edit
          </span>
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute left-[30px] bottom-[-197px] w-[267px] h-[267px] rounded-full opacity-40 bg-gradient-radial from-[#D497FF] to-[#7B21BA] blur-[112.55px]"></div>
    </div>
  );
};

const AddPaymentCard: React.FC = () => {
  return (
    <div className="flex h-[217px] p-[30px] flex-col justify-center items-center gap-[10px] flex-1 rounded-[30px] border border-dashed border-[#DF69FF] bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)] relative overflow-hidden">
      <div className="flex flex-col justify-center items-center gap-5 self-stretch relative z-10">
        <div className="flex items-center gap-[9px]">
          <svg className="w-4 h-4" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.16602 6.5V10.5M10.166 8.5H6.16602M14.166 8.5C14.166 9.28793 14.0108 10.0681 13.7093 10.7961C13.4078 11.5241 12.9658 12.1855 12.4087 12.7426C11.8515 13.2998 11.1901 13.7417 10.4621 14.0433C9.73416 14.3448 8.95395 14.5 8.16602 14.5C7.37808 14.5 6.59787 14.3448 5.86992 14.0433C5.14196 13.7417 4.48053 13.2998 3.92337 12.7426C3.36622 12.1855 2.92427 11.5241 2.62274 10.7961C2.32121 10.0681 2.16602 9.28793 2.16602 8.5C2.16602 6.9087 2.79816 5.38258 3.92337 4.25736C5.04859 3.13214 6.57472 2.5 8.16602 2.5C9.75731 2.5 11.2834 3.13214 12.4087 4.25736C13.5339 5.38258 14.166 6.9087 14.166 8.5Z" stroke="#DF69FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#DF69FF] font-inter text-sm font-semibold leading-[22px] tracking-[-0.32px]">
            Add Payment Method
          </span>
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute left-[30px] bottom-[-197px] w-[267px] h-[267px] rounded-full opacity-40 bg-gradient-radial from-[#D497FF] to-[#7B21BA] blur-[112.55px]"></div>
    </div>
  );
};

export const PaymentRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'methods' | 'history'>('methods');

  const paymentMethods = [
    {
      id: 1,
      type: 'visa' as const,
      cardNumber: '**** **** **** 0766',
      expiryDate: '12/28',
      isDefault: true
    },
    {
      id: 2,
      type: 'visa' as const,
      cardNumber: '**** **** **** 9211',
      expiryDate: '12/28',
      isDefault: false
    }
  ];

  return (
    <div className="flex w-full px-4 lg:px-[30px] py-[18px] flex-col items-start gap-[18px]">
      {/* Tab Navigation and Add Button */}
      <div className="flex justify-between items-center self-stretch">
        <div className="flex items-start gap-8">
          <button
            onClick={() => setActiveTab('methods')}
            className={cn(
              "font-inter text-2xl font-medium leading-[25.6px]",
              activeTab === 'methods' ? "text-[#DF69FF]" : "text-[#595959]"
            )}
          >
            Payments methods
          </button>

          <div className="w-[30px] h-0 rotate-90 border border-[#373535]"></div>

          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "font-inter text-2xl font-medium leading-[25.6px]",
              activeTab === 'history' ? "text-[#DF69FF]" : "text-[#595959]"
            )}
          >
            Payments history
          </button>
        </div>

        <button className="flex max-w-[686.66px] px-5 py-[13px] justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-[#FEBEFA] via-[#B339D4] via-[#7B21BA] to-[#7B26F0]">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.0098 9V15M15.0098 12H9.00977M21.0098 12C21.0098 13.1819 20.777 14.3522 20.3247 15.4442C19.8724 16.5361 19.2095 17.5282 18.3737 18.364C17.538 19.1997 16.5458 19.8626 15.4539 20.3149C14.362 20.7672 13.1917 21 12.0098 21C10.8279 21 9.65754 20.7672 8.56561 20.3149C7.47368 19.8626 6.48153 19.1997 5.6458 18.364C4.81008 17.5282 4.14714 16.5361 3.69485 15.4442C3.24256 14.3522 3.00977 13.1819 3.00977 12C3.00977 9.61305 3.95798 7.32387 5.6458 5.63604C7.33363 3.94821 9.62282 3 12.0098 3C14.3967 3 16.6859 3.94821 18.3737 5.63604C20.0616 7.32387 21.0098 9.61305 21.0098 12Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-white font-inter text-base font-semibold leading-6 tracking-[-0.32px]">
              Add Payment Method
            </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 self-stretch rounded-[30px] border border-[#2B2A2A] relative overflow-hidden">
        <div className="flex w-full items-center border border-[#2B2A2A] rounded-[30px] relative">
          <div className="flex px-[37px] py-8 flex-col items-start gap-14 flex-1 relative z-10">
            <div className="flex w-full items-start gap-4 self-stretch">
              {paymentMethods.map((method) => (
                <PaymentCard
                  key={method.id}
                  type={method.type}
                  cardNumber={method.cardNumber}
                  expiryDate={method.expiryDate}
                  isDefault={method.isDefault}
                />
              ))}

              <AddPaymentCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequests;
