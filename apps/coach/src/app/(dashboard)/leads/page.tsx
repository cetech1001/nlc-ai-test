'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, Calendar, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DataTable, Pagination, PageHeader, DataFilter, MobilePagination, StatCard } from "@nlc-ai/shared";
import { AlertBanner, Button } from '@nlc-ai/ui';
import { leadsAPI, aiAgentsAPI } from '@nlc-ai/api-client';
import { DataTableLead, FilterValues, LeadStats } from "@nlc-ai/types";
import {
  EmailAutomationModal,
  emptyLeadsFilterValues,
  coachLeadColumns,
  leadFilters,
  transformLeadData
} from '@/lib';

const CoachLeads = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLeadStatsLoading, setIsLeadStatsLoading] = useState(true);
  const [isLeadsLoading, setIsLeadsLoading] = useState(true);
  const [isGeneratingSequence, setIsGeneratingSequence] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [leads, setLeads] = useState<DataTableLead[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyLeadsFilterValues);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<DataTableLead | null>(null);
  const [stats, setStats] = useState<LeadStats>();
  const [activeSequences, setActiveSequences] = useState<any[]>([]);

  const leadsPerPage = 10;

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'created') {
      setSuccessMessage('Lead created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else if (success === 'updated') {
      setSuccessMessage('Lead updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    if (success) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      try {
        setError("");
        await Promise.all([
          fetchLeads(),
          fetchStats(),
          fetchActiveSequences(),
        ]);
      } catch (e: any) {
        const message = e.message || "Failed to load leads";
        setError(message);
        toast.error(message);
      }
    })();
  }, []);

  useEffect(() => {
    (() => fetchLeads())();
  }, [currentPage, searchQuery, filterValues]);

  const fetchLeads = async () => {
    try {
      setIsLeadsLoading(true);
      const response = await leadsAPI.getLeads(
        currentPage,
        leadsPerPage,
        filterValues,
        searchQuery
      );
      setLeads(transformLeadData(response.data));
      setPagination(response.pagination);
    } catch (e) {
      throw e;
    } finally {
      setIsLeadsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setIsLeadStatsLoading(true);
      const response = await leadsAPI.getLeadStats();
      setStats(response);
    } catch (e) {
      throw e;
    } finally {
      setIsLeadStatsLoading(false);
    }
  };

  const fetchActiveSequences = async () => {
    try {
      const sequences = await aiAgentsAPI.getActiveSequences();
      setActiveSequences(sequences);
    } catch (error) {
      console.error('Failed to fetch active sequences:', error);
    }
  };

  const handleGenerateSequence = async (leadID: string) => {
    try {
      setIsGeneratingSequence(leadID);
      await aiAgentsAPI.generateFollowupSequence(leadID);
      setSuccessMessage('AI follow-up sequence generated successfully!');
      await fetchActiveSequences();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to generate sequence');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsGeneratingSequence('');
    }
  };

  const handlePauseSequence = async (leadID: string) => {
    try {
      await aiAgentsAPI.pauseSequence(leadID);
      setSuccessMessage('Email sequence paused');
      await fetchActiveSequences();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to pause sequence');
    }
  };

  const handleResumeSequence = async (leadID: string) => {
    try {
      await aiAgentsAPI.resumeSequence(leadID);
      setSuccessMessage('Email sequence resumed');
      await fetchActiveSequences();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to resume sequence');
    }
  };

  const handleCancelSequence = async (leadID: string) => {
    if (!confirm('Are you sure you want to cancel this email sequence?')) return;

    try {
      await aiAgentsAPI.cancelSequence(leadID);
      setSuccessMessage('Email sequence cancelled');
      await fetchActiveSequences();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to cancel sequence');
    }
  };

  const handleDeleteLead = async (leadID: string) => {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      return;
    }

    try {
      await leadsAPI.deleteLead(leadID);
      setSuccessMessage("Lead deleted successfully!");
      await Promise.all([fetchLeads(), fetchStats(), fetchActiveSequences()]);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to delete lead");
    }
  };

  const handleEmailLead = (lead: any) => {
    setSelectedLead(lead);
    setShowEmailModal(true);
  };

  const handleRowAction = async (action: string, lead: any) => {
    if (action === 'edit') {
      router.push(`/leads/edit?leadID=${lead.originalID}`);
    } else if (action === 'delete') {
      await handleDeleteLead(lead.originalID);
    } else if (action === 'email') {
      handleEmailLead(lead);
    } else if (action === 'generate-sequence') {
      await handleGenerateSequence(lead.originalID);
    } else if (action === 'pause-sequence') {
      await handlePauseSequence(lead.originalID);
    } else if (action === 'resume-sequence') {
      await handleResumeSequence(lead.originalID);
    } else if (action === 'cancel-sequence') {
      await handleCancelSequence(lead.originalID);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterValues(emptyLeadsFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const getSequenceForLead = (leadID: string) => {
    return activeSequences.find(seq => seq.leadID === leadID);
  };

  return (
    <div className={`flex flex-col ${ isFilterOpen && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' }`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {successMessage && (
          <AlertBanner type={"success"} message={successMessage} onDismiss={clearMessages}/>
        )}

        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={clearMessages}/>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Leads"
            value={stats?.total}
            icon={TrendingUp}
            subtitle="&nbsp;"
            iconBgColor="from-violet-600/20 to-fuchsia-600/20"
            isLoading={isLeadStatsLoading || !stats}
          />
          <StatCard
            title="Converted"
            value={stats?.converted}
            subtitle={`${stats?.conversionRate}% rate`}
            icon={TrendingUp}
            iconBgColor="from-green-600/20 to-emerald-600/20"
            isLoading={isLeadStatsLoading || !stats}
          />
          <StatCard
            title="Not Converted"
            value={stats?.contacted}
            subtitle="Need follow-up"
            icon={AlertCircle}
            iconBgColor="from-yellow-600/20 to-orange-600/20"
            isLoading={isLeadStatsLoading || !stats}
          />
          <StatCard
            title="Scheduled"
            value={stats?.scheduled}
            subtitle="Meetings booked"
            icon={Calendar}
            iconBgColor="from-blue-600/20 to-cyan-600/20"
            isLoading={isLeadStatsLoading || !stats}
          />
          <StatCard
            title="AI Sequences"
            value={activeSequences.length}
            subtitle="Active automations"
            icon={Sparkles}
            iconBgColor="from-purple-600/20 to-pink-600/20"
            isLoading={false}
          />
        </div>

        <PageHeader title="My Leads">
          <>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search leads by name, email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <DataFilter
              filters={leadFilters}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              setIsFilterOpen={setIsFilterOpen}
            />

            <Button
              onClick={() => router.push('/leads/create')}
              className={'bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors hidden sm:flex'}
            >
              <span className="w-4 h-4 mr-2">
                <Plus className="w-4 h-4" />
              </span>
              Add New Lead
            </Button>
          </>
        </PageHeader>

        <div className={'flex sm:hidden justify-end'}>
          <Button
            onClick={() => router.push('/leads/create')}
            className={'bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors'}
          >
            <span className="w-4 h-4 mr-2">
              <Plus className="w-4 h-4" />
            </span>
            Add New Lead
          </Button>
        </div>

        <DataTable
          columns={coachLeadColumns(getSequenceForLead, isGeneratingSequence)}
          data={leads}
          onRowAction={handleRowAction}
          showMobileCards={true}
          emptyMessage="No leads found matching your criteria"
          isLoading={isLeadsLoading}
        />

        <Pagination
          totalPages={pagination.totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isLoading={isLeadsLoading}
        />

        {!isLeadsLoading && leads.length > 0 && (
          <MobilePagination pagination={pagination}/>
        )}
      </div>

      {showEmailModal && selectedLead && (
        <EmailAutomationModal
          isOpen={showEmailModal}
          onCloseAction={() => {
            setShowEmailModal(false);
            setSelectedLead(null);
          }}
          leadName={selectedLead.name}
          leadEmail={selectedLead.email}
          leadStatus={selectedLead.rawStatus}
          leadID={selectedLead.originalID}
        />
      )}
    </div>
  );
}

export default CoachLeads;
