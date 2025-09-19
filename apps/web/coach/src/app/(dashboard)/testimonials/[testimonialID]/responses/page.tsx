'use client'

import { TemplateFrame } from "@nlc-ai/web-shared";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface SurveyResponse {
  overallExperience: string;
  mostLiked: string;
  improvements: string;
  materialClarity: string;
  assignmentHelpfulness: string;
  metExpectations: string;
  contentRelevance: string;
  confidenceLevel: string;
  courseDuration: string;
  starRating: number;
}

interface SurveyData {
  title: string;
  created: string;
  from: string;
  dateReceived: string;
  frequency: string;
  day: string;
  platform: string;
  course: string;
  targetClients: string;
  response: SurveyResponse;
}

const ResponseSidebar: React.FC<{ surveyData: SurveyData }> = ({ surveyData }) => (
  <>
    <div className="flex flex-col gap-3 sm:gap-4">
      <h3 className="text-[#F9F9F9] font-inter text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">
        {surveyData.title}
      </h3>
      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-[10px]">
        <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
          Created:
        </span>
        <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
          {surveyData.created}
        </span>
      </div>
    </div>

    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            From
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {surveyData.from}
          </span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            Date Received
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {surveyData.dateReceived}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            Frequency
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {surveyData.frequency}
          </span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            Day
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {surveyData.day}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            Platform
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {surveyData.platform}
          </span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            Course
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {surveyData.course}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
          Target Clients
        </span>
        <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
          {surveyData.targetClients}
        </span>
      </div>
    </div>
  </>
);

const ResponseContent: React.FC<{ response: SurveyResponse }> = ({ response }) => (
  <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-[30px] overflow-y-auto">
    <div className="flex flex-col gap-4">
      <h2 className="text-[#F9F9F9] font-inter text-xl sm:text-2xl font-semibold leading-tight">
        Course Feedback Survey - Response
      </h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            1. Overall Experience:
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {response.overallExperience}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            2. What did you like most about the course?
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {response.mostLiked}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            3. What could be improved?
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {response.improvements}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            4. Clarity of Course Materials:
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {response.materialClarity}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            5. Helpfulness of Assignments and Exercises:
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {response.assignmentHelpfulness}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            6. Did the course meet your expectations?
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {response.metExpectations}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            7. Relevance of Course Content:
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {response.contentRelevance}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            8. Confidence in Applying What You Learned:
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {response.confidenceLevel}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            9. Course Duration:
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {response.courseDuration}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
            10. Star Rating:
          </span>
          <span className="text-[#C5C5C5] font-inter text-sm font-normal leading-[25.6px]">
            {response.starRating}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const TestimonialResponsesPage: React.FC = () => {
  const router = useRouter();

  // Sample data based on the screenshot
  const [surveyData] = useState<SurveyData>({
    title: "Course 01 Testimonial Survey",
    created: "Apr 14, 2025 | 10:30 AM",
    from: "Leslie Alexander",
    dateReceived: "Jan 15, 2025",
    frequency: "Weekly",
    day: "Monday",
    platform: "Kajabi, Teachable",
    courses: "Flex & Flow",
    targetClients: "50% Course Completion",
    response: {
      overallExperience: "Satisfied",
      mostLiked: "The clear explanations and practical examples really helped me understand complex topics.",
      improvements: "Some of the video segments were a bit too long and could be broken down into shorter parts.",
      materialClarity: "Clear",
      assignmentHelpfulness: "Helpful",
      metExpectations: "Met Expectations",
      contentRelevance: "Very Relevant",
      confidenceLevel: "Confident",
      courseDuration: "Just Right",
      starRating: 4.5
    }
  });

  const handleSave = () => {
    console.log('Saving response changes');
  };

  const handleDiscard = () => {
    router.back();
  };

  return (
    <TemplateFrame
      pageTitle="Testimonial Survey Response"
      onSave={handleSave}
      onDiscard={handleDiscard}
      sidebarComponent={<ResponseSidebar surveyData={surveyData} />}
      mainComponent={
        <div className="flex-1 flex flex-col overflow-hidden">
          <ResponseContent response={surveyData.response} />
        </div>
      }
      displayActionButtons={false}
    />
  );
};

export default TestimonialResponsesPage;
