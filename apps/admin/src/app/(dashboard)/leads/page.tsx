'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, Mail, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { DataTable, Pagination, PageHeader, DataFilter, tableRenderers, MobilePagination } from "@nlc-ai/shared";
import { AlertBanner, Button } from '@nlc-ai/ui';
import { leadsAPI } from '@nlc-ai/api-client';
import {FilterConfig, FilterValues} from "@nlc-ai/types";
import { EmailAutomationModal } from '@/lib';

// Types for Leads
interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: string;
  status: string;
  meetingDate?: string;
  meetingTime?: string;
  notes?: string;
  lastContactedAt?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface DataTableLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  meetingDate: string;
  lastContacted: string;
  rawStatus: string;
  originalId: string;
}

interface LeadStats {
  total: number;
  contacted: number;
  scheduled: number;
  converted: number;
  unresponsive: number;
  conversionRate: number;
}

// Transform lead data for table
const transformLeadData = (leads: Lead[]): DataTableLead[] => {
  return leads.map(lead => ({
    id: `#${lead.id.slice(-4)}`,
    name: `${lead.firstName} ${lead.lastName}`,
    email: lead.email,
    phone: lead.phone || 'N/A',
    source: lead.source || 'Unknown',
    status: lead.status.charAt(0).toUpperCase() + lead.status.slice(1),
    meetingDate: lead.meetingDate ? new Date(lead.meetingDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'Not scheduled',
    lastContacted: lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) : 'Never',
    rawStatus: lead.status,
    originalId: lead.id,
  }));
};

const colWidth = 100 / 7;
const leadColumns = [
  {
    key: 'name',
    header: 'Name',
    width: `${colWidth}%`,
    render: (value: string) => value
  },
  {
    key: 'email',
    header: 'Email',
    width: `${colWidth * (4 / 3)}%`,
    render: (value: string) => tableRenderers.truncateText(value, 22)
  },
  {
    key: 'phone',
    header: 'Phone',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => value
  },
  {
    key: 'source',
    header: 'Source',
    width: `${colWidth}%`,
    render: (value: string) => value
  },
  {
    key: 'status',
    header: 'Status',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string, row: any) => {
      const statusConfig = {
        contacted: { bg: 'bg-yellow-600/20', text: 'text-yellow-400', label: 'Not Converted' },
        scheduled: { bg: 'bg-blue-600/20', text: 'text-blue-400', label: 'Scheduled' },
        converted: { bg: 'bg-green-600/20', text: 'text-green-400', label: 'Converted' },
        unresponsive: { bg: 'bg-red-600/20', text: 'text-red-400', label: 'No Show' }
      };
      const config = statusConfig[row.rawStatus as keyof typeof statusConfig] || statusConfig.contacted;

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      );
    }
  },
  {
    key: 'meetingDate',
    header: 'Meeting Date',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: string) => value
  },
  {
    key: 'actions',
    header: 'Actions',
    width: 'auto',
    render: (value: any, row: any, onRowAction?: (action: string, row: any) => void) => (
      <div className="flex gap-2">
        <button
          onClick={() => onRowAction?.('edit', row)}
          className="px-3 py-1 rounded text-sm bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onRowAction?.('email', row)}
          className="px-3 py-1 rounded text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
          title="Send Email"
        >
          <Mail className="w-3 h-3" />
        </button>
        <button
          onClick={() => onRowAction?.('delete', row)}
          className="px-3 py-1 rounded text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
        >
          Delete
        </button>
      </div>
    ),
  },
];

const leadFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All Statuses',
    options: [
      { label: 'Not Converted', value: 'contacted' },
      { label: 'Scheduled', value: 'scheduled' },
      { label: 'Converted', value: 'converted' },
      { label: 'No Show', value: 'unresponsive' },
    ],
    defaultValue: '',
  },
  {
    key: 'source',
    label: 'Source',
    type: 'multi-select',
    options: [
      { label: 'Website', value: 'website' },
      { label: 'Referral', value: 'referral' },
      { label: 'Social Media', value: 'social_media' },
      { label: 'Email Campaign', value: 'email_campaign' },
      { label: 'Cold Outreach', value: 'cold_outreach' },
      { label: 'Networking', value: 'networking' },
      { label: 'Advertisement', value: 'advertisement' },
      { label: 'Other', value: 'other' },
    ],
    defaultValue: [],
  },
  {
    key: 'dateRange',
    label: 'Created Date',
    type: 'date-range',
    defaultValue: { start: null, end: null },
  },
  {
    key: 'meetingDateRange',
    label: 'Meeting Date',
    type: 'date-range',
    defaultValue: { start: null, end: null },
  },
];

const emptyFilterValues: FilterValues = {
  status: '',
  source: [],
  dateRange: { start: null, end: null },
  meetingDateRange: { start: null, end: null },
};

const Leads = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<DataTableLead[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyFilterValues);
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
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    contacted: 0,
    scheduled: 0,
    converted: 0,
    unresponsive: 0,
    conversionRate: 0,
  });

  const leadsPerPage = 10;

  useEffect(() => {
    // Check for success message from URL params
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
    fetchLeads();
    fetchStats();
  }, [currentPage, searchQuery, filterValues]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await leadsAPI.getLeads(
        currentPage,
        leadsPerPage,
        filterValues,
        searchQuery
      );

      setLeads(transformLeadData(response.data));
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || "Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await leadsAPI.getLeadStats();
      setStats(response);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      return;
    }

    try {
      await leadsAPI.deleteLead(leadId);
      setSuccessMessage("Lead deleted successfully!");
      await fetchLeads();
      await fetchStats();

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
      router.push(`/leads/edit?leadID=${lead.originalId}`);
    } else if (action === 'delete') {
      await handleDeleteLead(lead.originalId);
    } else if (action === 'email') {
      handleEmailLead(lead);
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
    setFilterValues(emptyFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300`}></div>
      <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#A0A0A0] text-sm font-medium">{title}</p>
            <p className="text-white text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-[#A0A0A0] text-xs mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${color.replace('from-', 'from-').replace('to-', 'to-').replace('/20', '/20')} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col ${ isFilterOpen && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' }`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {successMessage && (
          <AlertBanner type={"success"} message={successMessage} onDismiss={clearMessages}/>
        )}

        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={clearMessages}/>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Leads"
            value={stats.total}
            icon={TrendingUp}
            subtitle="&nbsp;"
            color="from-violet-600/20 to-fuchsia-600/20"
          />
          <StatCard
            title="Not Converted"
            value={stats.contacted}
            subtitle="Need follow-up"
            icon={AlertCircle}
            color="from-yellow-600/20 to-orange-600/20"
          />
          <StatCard
            title="Scheduled"
            value={stats.scheduled}
            subtitle="Meetings booked"
            icon={Calendar}
            color="from-blue-600/20 to-cyan-600/20"
          />
          <StatCard
            title="Converted"
            value={stats.converted}
            subtitle={`${stats.conversionRate}% rate`}
            icon={TrendingUp}
            color="from-green-600/20 to-emerald-600/20"
          />
          <StatCard
            title="No Show"
            value={stats.unresponsive}
            subtitle="Need re-engagement"
            icon={AlertCircle}
            color="from-red-600/20 to-pink-600/20"
          />
        </div>

        <PageHeader title="Lead Management">
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
              className={'bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors'}
            >
            <span className="w-4 h-4 mr-2">
              <Plus className="w-4 h-4" />
            </span>
              Add New Lead
            </Button>
          </>
        </PageHeader>

        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-[#2A2A2A] h-16 rounded-lg"></div>
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            <div data-table-container>
              <DataTable
                columns={leadColumns}
                data={leads}
                onRowAction={handleRowAction}
                emptyMessage="No leads found matching your criteria"
              />

              {pagination.totalPages > 1 && (
                <Pagination
                  totalPages={pagination.totalPages}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </div>
          </>
        )}

        {!isLoading && leads.length > 0 && (
          <MobilePagination pagination={pagination}/>
        )}

        {/* Email Automation Info */}
        {!isLoading && leads.length > 0 && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-emerald-600/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>

            <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Smart Email Automation</h3>
                  <p className="text-[#A0A0A0] text-sm">AI-powered sequences based on lead status</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-yellow-600/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-400 text-sm font-medium">Not Converted</span>
                  </div>
                  <p className="text-[#A0A0A0] text-xs">Welcome & nurture sequence with value content and gentle follow-ups</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-600/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-400 text-sm font-medium">Scheduled</span>
                  </div>
                  <p className="text-[#A0A0A0] text-xs">Meeting prep materials, confirmations, and reminders</p>
                </div>

                <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-600/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm font-medium">Converted</span>
                  </div>
                  <p className="text-[#A0A0A0] text-xs">Onboarding sequence and success tips for new clients</p>
                </div>

                <div className="bg-gradient-to-br from-red-600/10 to-pink-600/10 border border-red-600/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-red-400 text-sm font-medium">No Show</span>
                  </div>
                  <p className="text-[#A0A0A0] text-xs">Re-engagement attempts with alternative approaches</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Automation Modal */}
      {showEmailModal && selectedLead && (
        <EmailAutomationModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedLead(null);
          }}
          leadName={selectedLead.name}
          leadEmail={selectedLead.email}
          leadStatus={selectedLead.rawStatus}
          leadId={selectedLead.originalId}
        />
      )}
    </div>
  );
}

export default Leads;
