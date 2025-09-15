'use client'

import { PageHeader } from "@nlc-ai/web-shared";
import { cn } from "@nlc-ai/web-ui";
import React from 'react';

interface ContentCategoryCardProps {
  id: string;
  title: string;
  videoCount: number;
  lastUpdated: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

interface CategoryData {
  id: string;
  title: string;
  videoCount: number;
  lastUpdated: string;
  description: string;
  icon: React.ReactNode;
}

const ControversialIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28.9585 24.9253C28.7479 24.6244 28.5591 24.3212 28.3866 24.0059C29.9966 22.4481 30.8791 20.4384 30.8791 18.3078C30.8791 13.6697 26.646 9.89656 21.4423 9.89656C20.7518 9.89656 20.0685 9.97566 19.4004 10.1071C18.0749 6.89074 14.6163 4.58594 10.556 4.58594C9.03539 4.58594 7.52477 4.91531 6.18727 5.53844C5.94664 5.65031 5.84289 5.93594 5.95477 6.17625C6.06664 6.41688 6.35227 6.51937 6.59227 6.40844C7.80414 5.84438 9.17414 5.54594 10.556 5.54594C15.2266 5.54594 19.026 8.88844 19.026 12.9972C19.026 17.1059 15.2266 20.4487 10.556 20.4487C9.18602 20.4487 7.87289 20.1684 6.65289 19.6156C6.46789 19.5328 6.25039 19.5741 6.10914 19.7194C5.80914 20.0306 5.30539 20.4784 4.61289 20.845C4.42102 20.9472 4.23039 21.035 4.04414 21.1109C3.78914 21.2137 3.62289 21.0391 3.57977 20.9825C3.53727 20.9272 3.41102 20.7297 3.57477 20.5128C3.65914 20.4006 3.74289 20.2844 3.82602 20.1653C4.13414 19.7259 4.39914 19.2819 4.63602 18.8075C4.73289 18.6134 4.68789 18.3787 4.52602 18.2344C2.94789 16.8291 2.07914 14.9691 2.07914 12.9972C2.07914 11.4559 2.60977 9.97687 3.61414 8.72C3.77977 8.51281 3.74602 8.21062 3.53852 8.04531C3.33352 7.88094 3.03102 7.91344 2.86414 8.12063C1.72227 9.54969 1.11914 11.2359 1.11914 12.9972C1.11914 15.1278 2.00164 17.1375 3.61164 18.6953C3.43914 19.0106 3.25039 19.3137 3.03914 19.6153C2.96289 19.725 2.88664 19.8312 2.80852 19.9347C2.43977 20.4237 2.44414 21.08 2.81852 21.5675C3.08477 21.9134 3.47977 22.1019 3.88977 22.1019C4.06164 22.1019 4.23664 22.0688 4.40539 22.0003C4.62164 21.9125 4.84227 21.8103 5.06289 21.6928C5.60914 21.4041 6.11164 21.0447 6.56102 20.6222C7.81914 21.1444 9.16164 21.4088 10.556 21.4088C11.2564 21.4088 11.9369 21.3352 12.5941 21.2054C13.9528 24.5133 17.4641 26.7194 21.4423 26.7194C22.8366 26.7194 24.1791 26.455 25.4373 25.9328C25.8866 26.3553 26.3891 26.7144 26.9341 27.0025C27.156 27.1213 27.3773 27.2234 27.5929 27.3109C27.7616 27.3797 27.9366 27.4125 28.1085 27.4125C28.5185 27.4125 28.9135 27.2241 29.1798 26.8781C29.5541 26.3906 29.5585 25.7344 29.1898 25.2447C29.1123 25.1422 29.036 25.0362 28.9585 24.9253Z" fill="#F9F9F9"/>
  </svg>
);

const InformativeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.857 3.64917C12.4679 3.64917 12.1523 3.96469 12.1523 4.35387C12.1523 4.74305 12.4679 5.05857 12.857 5.05857C15.1888 5.05857 17.0859 6.95533 17.0859 9.28675C17.0859 9.67593 17.4014 9.99145 17.7906 9.99145C18.1798 9.99145 18.4953 9.67593 18.4953 9.28675C18.4953 6.17819 15.966 3.64917 12.857 3.64917Z" fill="white"/>
    <path d="M11.0398 1.02019C7.85601 1.68548 5.27447 4.24231 4.59519 7.44591C4.02161 10.1511 4.72842 12.867 6.53437 14.8972C7.41717 15.8896 7.92343 17.1995 7.92343 18.4948V19.9042C7.92343 20.8419 8.53731 21.6386 9.38417 21.9145C9.66267 23.5599 11.0909 24.884 12.8563 24.884C14.6213 24.884 16.0499 23.5604 16.3284 21.9145C17.1753 21.6386 17.7892 20.8419 17.7892 19.9042V18.4948C17.7892 17.197 18.2971 15.9028 19.2194 14.8506C20.5693 13.3106 21.3127 11.3346 21.3127 9.28677C21.3127 3.9515 16.4292 -0.105725 11.0398 1.02019ZM12.8563 23.4747C11.9504 23.4747 11.1562 22.8514 10.8629 22.0136H14.8497C14.5564 22.8514 13.7622 23.4747 12.8563 23.4747ZM16.3798 19.9042C16.3798 20.2928 16.0637 20.6089 15.6751 20.6089H10.0375C9.64895 20.6089 9.33282 20.2928 9.33282 19.9042V19.1995H16.3798V19.9042ZM18.1595 13.9217C17.1767 15.0429 16.572 16.395 16.4186 17.7901H9.2942C9.14096 16.3943 8.53783 15.0289 7.58752 13.9605C6.08238 12.2685 5.49424 10.0005 5.97395 7.73827C6.5339 5.09734 8.68558 2.95201 11.3281 2.39985C15.8393 1.45711 19.9033 4.84492 19.9033 9.28677C19.9033 10.9927 19.284 12.6387 18.1595 13.9217Z" fill="white"/>
  </svg>
);

const EntertainmentIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.5 22.75H5.5C4.50576 22.7489 3.55255 22.3535 2.84952 21.6505C2.14649 20.9474 1.75106 19.9942 1.75 19V9C1.75106 8.00576 2.14649 7.05255 2.84952 6.34952C3.55255 5.64649 4.50576 5.25106 5.5 5.25H18.5C19.4942 5.25106 20.4474 5.64649 21.1505 6.34952C21.8535 7.05255 22.2489 8.00576 22.25 9V19C22.2489 19.9942 21.8535 20.9474 21.1505 21.6505C20.4474 22.3535 19.4942 22.7489 18.5 22.75ZM5.5 6.75C4.90343 6.75053 4.33144 6.98775 3.90959 7.40959C3.48775 7.83144 3.25053 8.40343 3.25 9V19C3.25053 19.5966 3.48775 20.1686 3.90959 20.5904C4.33144 21.0122 4.90343 21.2495 5.5 21.25H18.5C19.0966 21.2495 19.6686 21.0122 20.0904 20.5904C20.5122 20.1686 20.7495 19.5966 20.75 19V9C20.7495 8.40343 20.5122 7.83144 20.0904 7.40959C19.6686 6.98775 19.0966 6.75053 18.5 6.75H5.5Z" fill="#F9F9F9"/>
    <path d="M11 17.507C10.7701 17.5071 10.5424 17.4619 10.3299 17.3739C10.1175 17.286 9.92446 17.157 9.76192 16.9944C9.59938 16.8317 9.4705 16.6386 9.38266 16.4261C9.29482 16.2136 9.24974 15.9859 9.25 15.756V12.243C9.25001 11.9447 9.32629 11.6513 9.47159 11.3907C9.61688 11.1302 9.82638 10.9111 10.0802 10.7543C10.334 10.5975 10.6236 10.5081 10.9217 10.4948C11.2197 10.4814 11.5162 10.5445 11.783 10.678L14.794 12.184C15.0681 12.321 15.3015 12.5276 15.4707 12.7832C15.6399 13.0387 15.7391 13.3342 15.7582 13.6401C15.7773 13.946 15.7158 14.2515 15.5798 14.5261C15.4437 14.8008 15.2379 15.0349 14.983 15.205L11.971 17.212C11.6836 17.4041 11.3457 17.5068 11 17.507ZM11 11.992C10.9536 11.9922 10.9083 12.0054 10.869 12.03C10.8322 12.0519 10.8019 12.0832 10.781 12.1205C10.7601 12.1579 10.7494 12.2002 10.75 12.243V15.756C10.7489 15.8015 10.7607 15.8465 10.784 15.8856C10.8074 15.9247 10.8414 15.9564 10.882 15.977C10.9215 15.9998 10.9668 16.0107 11.0124 16.0084C11.058 16.0061 11.102 15.9907 11.139 15.964L14.15 13.957C14.1863 13.9326 14.2156 13.8992 14.235 13.86C14.2544 13.8208 14.2632 13.7772 14.2606 13.7335C14.258 13.6899 14.244 13.6477 14.22 13.6111C14.1961 13.5745 14.163 13.5448 14.124 13.525L11.112 12.02C11.0773 12.0021 11.039 11.9926 11 11.992Z" fill="#F9F9F9"/>
    <path d="M12.0008 6.74997C11.9023 6.75021 11.8047 6.73089 11.7138 6.69312C11.6228 6.65536 11.5402 6.5999 11.4708 6.52997L7.47082 2.52997C7.33834 2.38779 7.26622 2.19975 7.26965 2.00545C7.27308 1.81114 7.35179 1.62576 7.4892 1.48835C7.62661 1.35093 7.812 1.27222 8.0063 1.26879C8.2006 1.26537 8.38865 1.33749 8.53082 1.46997L12.0008 4.93897L15.4708 1.46997C15.613 1.33749 15.801 1.26537 15.9953 1.26879C16.1896 1.27222 16.375 1.35093 16.5124 1.48835C16.6499 1.62576 16.7286 1.81114 16.732 2.00545C16.7354 2.19975 16.6633 2.38779 16.5308 2.52997L12.5308 6.52997C12.4614 6.5999 12.3789 6.65536 12.2879 6.69312C12.1969 6.73089 12.0993 6.75021 12.0008 6.74997Z" fill="#F9F9F9"/>
  </svg>
);

const ConversationalIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.36792 0 0 5.367 0 12C0 14.1048 0.54895 16.1605 1.59137 17.9736L0.045227 22.775C-0.0626221 23.1097 0.026001 23.4767 0.274658 23.7253C0.520935 23.9716 0.886962 24.0635 1.22497 23.9548L6.02636 22.4086C7.83947 23.451 9.8952 24 12 24C18.6321 24 24 18.633 24 12C24 5.36792 18.633 0 12 0ZM12 22.125C10.0988 22.125 8.2456 21.5945 6.64068 20.5909C6.40979 20.4466 6.12304 20.4076 5.85626 20.4935L2.39026 21.6097L3.50647 18.1437C3.59106 17.8808 3.55536 17.5937 3.40887 17.3593C2.40546 15.7544 1.875 13.9012 1.875 12C1.875 6.41711 6.41711 1.875 12 1.875C17.5829 1.875 22.125 6.41711 22.125 12C22.125 17.5829 17.5829 22.125 12 22.125ZM13.1719 12C13.1719 12.6471 12.6473 13.1719 12 13.1719C11.3527 13.1719 10.8281 12.6471 10.8281 12C10.8281 11.3527 11.3527 10.8281 12 10.8281C12.6473 10.8281 13.1719 11.3527 13.1719 12ZM17.8594 12C17.8594 12.6471 17.3348 13.1719 16.6875 13.1719C16.0402 13.1719 15.5156 12.6471 15.5156 12C15.5156 11.3527 16.0402 10.8281 16.6875 10.8281C17.3348 10.8281 17.8594 11.3527 17.8594 12ZM8.48437 12C8.48437 12.6471 7.95977 13.1719 7.3125 13.1719C6.6654 13.1719 6.14062 12.6471 6.14062 12C6.14062 11.3527 6.6654 10.8281 7.3125 10.8281C7.95977 10.8281 8.48437 11.3527 8.48437 12Z" fill="#F9F9F9"/>
  </svg>
);

const CaseStudiesIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.0375 15.0375C11.6297 15.0375 11.2969 15.3703 11.2969 15.7781V16.5094C11.2969 16.9172 11.6297 17.25 12.0422 17.25C12.45 17.25 12.7828 16.9172 12.7828 16.5094V15.7781C12.7781 15.3703 12.4453 15.0375 12.0375 15.0375Z" fill="#F9F9F9"/>
    <path d="M8.04442 5.73279C8.28348 6.06561 8.74754 6.14061 9.08035 5.89686C9.41317 5.65779 9.48817 5.19373 9.24442 4.86092L8.79442 4.23748C8.56004 3.89998 8.09598 3.82029 7.75848 4.05467C7.42098 4.28904 7.34129 4.75311 7.57567 5.09061C7.58035 5.09529 7.58504 5.10467 7.58973 5.10936L8.04442 5.73279Z" fill="#F9F9F9"/>
    <path d="M14.9949 5.90156C15.1215 5.99531 15.2761 6.04219 15.4308 6.04219C15.6699 6.04219 15.8902 5.92969 16.0308 5.7375L16.4808 5.11406C16.7199 4.78125 16.6449 4.32187 16.3168 4.07812C16.1902 3.98438 16.0355 3.9375 15.8808 3.9375C15.6418 3.9375 15.4215 4.05 15.2808 4.24219L14.8308 4.86094C14.5918 5.19375 14.6621 5.65781 14.9949 5.90156Z" fill="#F9F9F9"/>
    <path d="M12 0C7.40625 0 4.98281 0.534375 4.98281 0.534375C2.93906 0.928125 0.965625 2.79844 0.515625 4.83281C0.257812 6.07031 0.0046875 7.75313 0 10.0547C0.0046875 12.3516 0.257812 14.0344 0.515625 15.2719C0.965625 17.3109 2.94375 19.1766 4.9875 19.575C5.65781 19.7109 6.97969 19.8609 8.41875 19.9688C8.58281 20.2219 8.75625 20.4937 8.94844 20.7844C9.70781 21.9375 10.2937 22.7437 10.7344 23.3016C11.1 23.7656 11.55 24 12.0047 24C12.4594 24 12.9047 23.7656 13.275 23.3016C13.7156 22.7391 14.3016 21.9375 15.0609 20.7844C15.2531 20.4984 15.4266 20.2266 15.5906 19.9688C17.025 19.8609 18.3469 19.7109 19.0219 19.575C21.0656 19.1766 23.0438 17.3109 23.4938 15.2719C23.7516 14.0344 24.0047 12.3516 24.0047 10.0547C24 7.75781 23.7469 6.075 23.4891 4.8375C23.0391 2.79844 21.0609 0.932812 19.0172 0.534375C19.0172 0.534375 16.5938 0 12 0Z" fill="#F9F9F9"/>
  </svg>
);

const ContentCategoryCard: React.FC<ContentCategoryCardProps> = ({
 id,
 title,
 videoCount,
 lastUpdated,
 description,
 icon,
 className
}) => {
  return (
    <div className={cn(
      "w-full max-w-[570px] min-h-[306px] flex-shrink-0 rounded-[20px] sm:rounded-[30px] border border-[#454444] relative overflow-hidden",
      "bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)]",
      className
    )}>
      <div className="absolute -left-3 sm:-left-5 top-24 sm:top-32 w-[200px] sm:w-[267px] h-[200px] sm:h-[267px] rounded-full opacity-50 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 blur-[80px] sm:blur-[112.55px]"></div>

      <div className="relative z-10 p-5 sm:p-6 lg:p-[30px] h-full flex flex-col">
        <div className="flex w-full flex-col gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex justify-between items-start gap-3">
            <h3 className="text-[#F9F9F9] font-inter text-lg sm:text-xl lg:text-2xl font-semibold leading-tight flex-1">
              {title}
            </h3>
            <div className="flex px-2 sm:px-[10px] py-1 sm:py-[2px] justify-center items-center gap-1 rounded-full bg-[rgba(22,143,22,0.20)] flex-shrink-0">
              <span className="text-[#F9F9F9] font-inter text-xs sm:text-sm font-medium leading-[25.6px] whitespace-nowrap">
                {videoCount} Videos
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-[10px]">
            <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
              Last Updated:
            </span>
            <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
              {lastUpdated}
            </span>
          </div>
        </div>

        <div className="mb-4 flex-1">
          <h4 className="text-[#F9F9F9] font-inter text-sm sm:text-base font-medium leading-[25.6px] mb-2">
            About Category
          </h4>
          <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%]">
            {description}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <a
            href={`/content/categories/${id}`}
            className="text-[#DF69FF] font-inter text-sm font-bold leading-[25.6px] hover:underline"
          >
            View Details
          </a>

          <div className="w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] rounded-full backdrop-blur-[40px] bg-gradient-to-b from-[rgba(255,255,255,0.20)] to-[rgba(18,25,62,0.20)] border border-white/20 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoriesGrid: React.FC<{ categories: CategoryData[] }> = ({ categories }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
    {categories.map((category) => (
      <ContentCategoryCard
        key={category.id}
        id={category.id}
        title={category.title}
        videoCount={category.videoCount}
        lastUpdated={category.lastUpdated}
        description={category.description}
        icon={category.icon}
      />
    ))}
  </div>
);

const ContentCategories: React.FC = () => {
  const categories: CategoryData[] = [
    {
      id: 'controversial',
      title: 'Controversial',
      videoCount: 16,
      lastUpdated: 'Apr 14, 2025 | 10:30 AM',
      description: 'Content that challenges traditional ideas and sparks debate, encouraging viewers to think critically and engage in discussions.',
      icon: <ControversialIcon className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      id: 'informative',
      title: 'Informative',
      videoCount: 16,
      lastUpdated: 'Apr 14, 2025 | 10:30 AM',
      description: 'Educational content designed to deliver valuable knowledge and practical insights in a clear and easy-to-understand way.',
      icon: <InformativeIcon className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      id: 'entertainment',
      title: 'Entertainment',
      videoCount: 16,
      lastUpdated: 'Apr 14, 2025 | 10:30 AM',
      description: 'Fun and engaging videos meant to entertain and captivate the audience, offering light-hearted content to create emotional connections.',
      icon: <EntertainmentIcon className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      id: 'conversational',
      title: 'Conversational',
      videoCount: 16,
      lastUpdated: 'Apr 14, 2025 | 10:30 AM',
      description: 'Content that challenges traditional ideas and sparks debate, encouraging viewers to think critically and engage in discussions.',
      icon: <ConversationalIcon className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      id: 'case-studies',
      title: 'Case Studies',
      videoCount: 16,
      lastUpdated: 'Apr 14, 2025 | 10:30 AM',
      description: 'Content that build social proof using testimonials and feedbacks from your clients.',
      icon: <CaseStudiesIcon className="w-6 h-6 sm:w-8 sm:h-8" />
    }
  ];

  return (
    <div className="flex w-full py-4 sm:py-5 lg:py-[18px] flex-col items-start gap-4 min-h-screen">
      <div className="fixed top-20 right-10 w-[300px] h-[300px] rounded-full opacity-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-[250px] h-[250px] rounded-full opacity-15 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 w-full mx-auto">
        <PageHeader
          title={'Content Categories'}
        />
        <CategoriesGrid categories={categories} />
      </div>
    </div>
  );
};

export default ContentCategories;
