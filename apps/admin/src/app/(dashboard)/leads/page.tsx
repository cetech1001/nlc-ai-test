'use client'

import { useState } from "react";
import {leadsData, leadColumns} from "@/app/data";
import { DataTable } from "@/app/(dashboard)/components/data-table";
import {Pagination} from "@/app/(dashboard)/components/pagination";
import { Button } from "@nlc-ai/ui";
import ScheduleMeetingModal from "@/app/(dashboard)/leads-follow-up/components/schedule-meeting-modal";

export default function LeadsFollowUp() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredLeads] = useState(leadsData);

  const leadsPerPage = 10;
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  const [isScheduleMeetingModalOpen, setIsScheduleMeetingModalOpen] = useState(false);

  const onScheduleMeetingModalClose = () => {
    setIsScheduleMeetingModalOpen(false);
  }

  return (
    <div>
      <div className={`flex flex-col ${ isScheduleMeetingModalOpen ? 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' : ''}`}>
        <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-2xl font-semibold">
              Leads Found
            </h2>
            <Button
              onClick={() => setIsScheduleMeetingModalOpen(true)}
              className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg hover:bg-[#8B31CA] text-white"
            >
              Schedule A Meeting
            </Button>
          </div>
          <div className="w-full justify-start text-stone-300 text-sm font-normal font-['Inter'] leading-tight">Here you will see all potential clients. You can mark their conversion status to let the system process with the follow-up process.</div>

          <DataTable
            columns={leadColumns}
            data={currentLeads}
          />

          <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
        </div>

      </div>
      <ScheduleMeetingModal
        isOpen={isScheduleMeetingModalOpen}
        onClose={onScheduleMeetingModalClose}
        onMeetingScheduled={onScheduleMeetingModalClose}
      />
    </div>
  );
}
