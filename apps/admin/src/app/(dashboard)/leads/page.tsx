'use client'

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { DataTable, Pagination, PageHeader, DataFilter, tableRenderers } from "@nlc-ai/shared";
import { AlertBanner } from '@nlc-ai/ui';
import { leadsAPI } from '@nlc-ai/api-client';
import {FilterConfig, FilterValues} from "@nlc-ai/types";

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
    width: `${colWidth}%`,
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
    render: (value: string, row: any) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        row.rawStatus === 'contacted' ? 'bg-blue-600/20 text-blue-400' :
          row.rawStatus === 'scheduled' ? 'bg-yellow-600/20 text-yellow-400' :
            row.rawStatus === 'converted' ? 'bg-green-600/20 text-green-400' :
              'bg-red-600/20 text-red-400'
      }`}>
        {value}
      </span>
    )
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
          className="px-3 py-1 rounded text-sm bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
        >
          Edit
        </button>
        <button
          onClick={() => onRowAction?.('delete', row)}
          className="px-3 py-1 rounded text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30"
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
      { label: 'Contacted', value: 'contacted' },
      { label: 'Scheduled', value: 'scheduled' },
      { label: 'Converted', value: 'converted' },
      { label: 'Unresponsive', value: 'unresponsive' },
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

  const leadsPerPage = 10;

  useEffect(() => {
    fetchLeads();
  }, [currentPage, searchQuery, filterValues]);

  // Replace the mock API with real API calls
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

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      return;
    }

    try {
      await leadsAPI.deleteLead(leadId);
      setSuccessMessage("Lead deleted successfully!");
      await fetchLeads();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to delete lead");
    }
  };

  // Add this function for status updates
  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      await leadsAPI.updateLeadStatus(leadId, newStatus);
      setSuccessMessage("Lead status updated successfully!");
      await fetchLeads();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to update lead status");
    }
  };

  // Update the row actions to include status update
  const handleRowAction = (action: string, lead: any) => {
    if (action === 'edit') {
      router.push(`/leads/edit/${lead.originalId}`);
    } else if (action === 'delete') {
      handleDeleteLead(lead.originalId);
    } else if (action === 'update-status') {
      // You can add a dropdown or modal for status update
      const newStatus = prompt('Enter new status (contacted, scheduled, converted, unresponsive):');
      if (newStatus && ['contacted', 'scheduled', 'converted', 'unresponsive'].includes(newStatus)) {
        handleUpdateStatus(lead.originalId, newStatus);
      }
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

  return (
    <div className={`flex flex-col ${ isFilterOpen && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' }`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {successMessage && (
          <AlertBanner type={"success"} message={successMessage} onDismiss={clearMessages}/>
        )}

        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={clearMessages}/>
        )}

        <PageHeader
          title="Lead Management"
          actionButton={{
            label: "Add New Lead",
            onClick: () => router.push('/leads/create'),
            icon: <Plus className="w-4 h-4" />,
            variant: "primary"
          }}
        >
          <div className="flex items-center gap-3 w-full sm:w-3/4">
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
          </div>
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
          </>
        )}

        {!isLoading && leads.length > 0 && (
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-lg border border-neutral-700 p-4 sm:hidden">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-300">
                Showing {leads.length} of {pagination.total} leads
              </span>
              <div className="flex gap-4 text-stone-400">
                <span>Page {pagination.page} of {pagination.totalPages}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leads;
