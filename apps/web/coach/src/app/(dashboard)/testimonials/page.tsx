'use client'

import React, { useState } from "react";

const ArchiveIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_42670_6601)">
      <path d="M23.7408 7.896C23.5266 7.64293 23.212 7.4978 22.8778 7.4978H1.12211C0.788222 7.4978 0.473928 7.64293 0.259711 7.89572C0.0597907 8.13174 -0.0305367 8.43876 0.00916606 8.74359L1.29353 22.1471C1.29466 22.1575 1.29578 22.1678 1.29719 22.1779C1.41016 23.0235 2.12827 23.6611 2.96775 23.6611H21.0323C21.9149 23.6611 22.6508 22.9852 22.7065 22.1471L23.9908 8.74387C24.0305 8.43909 23.9404 8.13202 23.7408 7.896ZM21.0367 21.985C21.0359 21.9836 21.0317 21.9827 21.0322 21.9833L2.98256 21.9858C2.9753 21.9824 2.96466 21.9699 2.96133 21.9601L1.73589 9.17591H22.264L21.0367 21.985Z" fill="#D8D7D7"/>
      <path d="M21.8808 4.27546C21.6683 4.03077 21.3593 3.89038 21.0326 3.89038H2.99612C2.66978 3.89038 2.35937 4.03607 2.14436 4.28999C1.92822 4.54559 1.8348 4.87836 1.88739 5.19237L2.39073 8.46413L4.04925 8.20908L3.64294 5.56821H20.3862L19.9802 8.20908L21.6384 8.46413L22.1429 5.18286C22.1898 4.85239 22.0944 4.52155 21.8808 4.27546Z" fill="#D8D7D7"/>
      <path d="M19.3923 0.724749C19.1797 0.479782 18.8704 0.339111 18.5433 0.339111H5.48427C5.15793 0.339111 4.84753 0.484798 4.63251 0.738718C4.41609 0.994325 4.32295 1.32709 4.37583 1.64335L4.87917 4.85919L6.53684 4.59969L6.1325 2.01694H17.8893L17.4639 4.59266L19.1193 4.86612L19.6534 1.63294C19.701 1.30192 19.6056 0.971122 19.3923 0.724749Z" fill="#D8D7D7"/>
      <path d="M15.5244 12.783H8.47759C8.01423 12.783 7.63867 13.1585 7.63867 13.6219C7.63867 14.0852 8.01423 14.4608 8.47759 14.4608H15.5244C15.9878 14.4608 16.3634 14.0852 16.3634 13.6219C16.3633 13.1585 15.9878 12.783 15.5244 12.783Z" fill="#D8D7D7"/>
    </g>
    <defs>
      <clipPath id="clip0_42670_6601">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const DeleteIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.7898 9.94568C20.7898 9.94568 20.1348 18.0707 19.7548 21.4933C19.5738 23.1279 18.564 24.0858 16.9101 24.116C13.7626 24.1727 10.6115 24.1763 7.46523 24.1099C5.874 24.0774 4.88114 23.1074 4.7038 21.5017C4.32137 18.049 3.66992 9.94568 3.66992 9.94568" stroke="#D8D7D7" strokeWidth="1.80959" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22.458 6.05083H2" stroke="#D8D7D7" strokeWidth="1.80959" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5156 6.05078C17.5686 6.05078 16.7531 5.38123 16.5673 4.45351L16.2742 2.98654C16.0932 2.30976 15.4804 1.84167 14.7818 1.84167H9.67519C8.97669 1.84167 8.36384 2.30976 8.18288 2.98654L7.88973 4.45351C7.70395 5.38123 6.88842 6.05078 5.94141 6.05078" stroke="#D8D7D7" strokeWidth="1.80959" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.5">
      <path d="M20.211 11.8274C20.211 13.6833 19.661 15.4976 18.63 17.0407C17.599 18.5839 16.133 19.7867 14.419 20.497C12.704 21.2072 10.817 21.3931 8.997 21.0311C7.177 20.6691 5.505 19.7755 4.192 18.4632C2.88 17.1509 1.986 15.479 1.624 13.6587C1.262 11.8384 1.447 9.9517 2.157 8.237C2.867 6.5222 4.07 5.0566 5.613 4.0253C7.156 2.9941 8.97 2.4436 10.826 2.4434C12.059 2.4432 13.279 2.6859 14.418 3.1574C15.556 3.6289 16.591 4.3201 17.462 5.1915C18.334 6.0629 19.025 7.0974 19.497 8.236C19.969 9.3746 20.211 10.595 20.211 11.8274Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22.557 23.559L17.457 18.459" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  </svg>
);

interface TestimonialSurveyTemplate {
  ID: string;
  title: string;
  status: 'Email Response';
  createdDate: string;
  createdTime: string;
}

const SearchBar: React.FC<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}> = ({ searchQuery, setSearchQuery, placeholder = "Search templates by name" }) => (
  <div className="flex w-full max-w-[564px] px-4 sm:px-5 py-2 sm:py-[10px] justify-between items-center border border-white/50 rounded-[10px]">
    <input
      type="text"
      placeholder={placeholder}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="flex-1 bg-transparent text-white placeholder:text-white/50 font-inter text-sm sm:text-base outline-none"
    />
    <SearchIcon className="opacity-70 w-5 h-5 sm:w-6 sm:h-6" />
  </div>
);

const CreateTemplateButton: React.FC = () => (
  <a
    href="/testimonial-surveys/edit/new"
    className="flex px-4 sm:px-5 py-2 sm:py-[13px] justify-center items-center gap-2 rounded-lg bg-gradient-to-t from-[#FEBEFA] via-[#B339D4] to-[#7B21BA] whitespace-nowrap"
  >
    <span className="text-white font-inter text-sm sm:text-base font-semibold leading-6 tracking-[-0.32px]">
      Create New Template
    </span>
  </a>
);

const TestimonialSurveyCard: React.FC<{ template: TestimonialSurveyTemplate }> = ({ template }) => (
  <div className="w-full max-w-[570px] h-auto min-h-[163px] rounded-[20px] sm:rounded-[30px] border border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] relative overflow-hidden">
    <div className="absolute w-[150px] sm:w-[223px] h-[150px] sm:h-[223px] rounded-full opacity-50 blur-[80px] sm:blur-[112.55px] bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 right-[30px] sm:right-[50px] bottom-[-20px] sm:bottom-[-30px]"></div>

    <div className="relative z-10 flex flex-col justify-between h-full p-5 sm:p-[30px]">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex justify-between items-start sm:items-center gap-3">
          <h3 className="text-[#F9F9F9] font-inter text-lg sm:text-2xl font-semibold leading-tight sm:leading-[25.6px] flex-1">
            {template.title}
          </h3>
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <button className="w-5 h-5 sm:w-6 sm:h-6">
              <ArchiveIcon />
            </button>
            <button className="w-5 h-5 sm:w-6 sm:h-6">
              <DeleteIcon />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-[10px]">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            Created:
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {template.createdDate} | {template.createdTime}
          </span>
        </div>
      </div>

      <div className="mt-4 sm:mt-0">
        <a
          href={`/testimonial-surveys/edit/${template.ID}`}
          className="text-[#DF69FF] font-inter text-sm font-bold inline-block hover:underline"
        >
          View & Edit Questions
        </a>
      </div>
    </div>
  </div>
);

const TabNavigation: React.FC<{
  activeTab: 'templates' | 'responses';
  setActiveTab: (tab: 'templates' | 'responses') => void;
}> = ({ activeTab, setActiveTab }) => (
  <div className="flex items-center gap-4 sm:gap-8">
    <button
      onClick={() => setActiveTab('templates')}
      className={`font-inter text-lg sm:text-2xl font-medium leading-[25.6px] ${
        activeTab === 'templates' ? 'text-[#DF69FF]' : 'text-[#595959]'
      }`}
    >
      Active Templates
    </button>
    <div className="w-[1px] h-6 sm:h-8 bg-[#373535]"></div>
    <button
      onClick={() => setActiveTab('responses')}
      className={`font-inter text-lg sm:text-2xl font-medium leading-[25.6px] ${
        activeTab === 'responses' ? 'text-[#DF69FF]' : 'text-[#595959]'
      }`}
    >
      Responses
    </button>
  </div>
);

const TemplatesGrid: React.FC<{ templates: TestimonialSurveyTemplate[] }> = ({ templates }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-5 auto-rows-max">
    {templates.map((template) => (
      <TestimonialSurveyCard key={template.ID} template={template} />
    ))}
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-[300px] sm:h-[400px]">
    <p className="text-[#C5C5C5] font-inter text-base sm:text-lg text-center px-4">
      {message}
    </p>
  </div>
);

const TestimonialSurveys: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'responses'>('templates');
  const [searchQuery, setSearchQuery] = useState('');

  const testimonialTemplates: TestimonialSurveyTemplate[] = [
    {
      ID: '1',
      title: 'Course A: Testimonial Survey',
      status: 'Email Response',
      createdDate: 'Apr 14, 2025',
      createdTime: '10:30 AM'
    },
    {
      ID: '2',
      title: 'Course B: Testimonial Survey',
      status: 'Email Response',
      createdDate: 'Apr 14, 2025',
      createdTime: '10:30 AM'
    },
    {
      ID: '3',
      title: 'Course C: Testimonial Survey',
      status: 'Email Response',
      createdDate: 'Apr 14, 2025',
      createdTime: '10:30 AM'
    },
    {
      ID: '4',
      title: 'Course D: Testimonial Survey',
      status: 'Email Response',
      createdDate: 'Apr 14, 2025',
      createdTime: '10:30 AM'
    },
    {
      ID: '5',
      title: 'Course E: Testimonial Survey',
      status: 'Email Response',
      createdDate: 'Apr 14, 2025',
      createdTime: '10:30 AM'
    }
  ];

  const filteredTemplates = testimonialTemplates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-[30px] overflow-auto">
      <div className="flex flex-col gap-5 lg:gap-[20px]">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-0">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="Search templates by name"
            />
            <CreateTemplateButton />
          </div>
        </div>

        {activeTab === 'templates' && (
          <>
            {filteredTemplates.length > 0 ? (
              <TemplatesGrid templates={filteredTemplates} />
            ) : (
              <EmptyState
                message={searchQuery
                  ? "No templates found matching your search."
                  : "No templates created yet. Create your first template to get started."
                }
              />
            )}
          </>
        )}

        {activeTab === 'responses' && (
          <EmptyState message="No responses yet. Create and send surveys to see responses here." />
        )}
      </div>
    </div>
  );
};

export default TestimonialSurveys;
