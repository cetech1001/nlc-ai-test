'use client'

import { useState } from "react";
import {leadsData, leadColumns} from "@/app/data";
import { DataTable, PageHeader, Pagination } from "@nlc-ai/shared";
import ScheduleMeetingModal from "@/lib/modals/schedule-meeting-modal";

export default function Leads() {
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
          <PageHeader
            title="Leads List"
            subtitle="Here you will see all potential clients. You can update each one’s conversion status to trigger the appropriate follow-up sequence."
            actionButton={{
              label: "Schedule A Meeting",
              onClick: () => setIsScheduleMeetingModalOpen(true)
            }}
          />

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
