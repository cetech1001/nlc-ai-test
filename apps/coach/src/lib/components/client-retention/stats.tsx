'use client'

import { useState, useEffect } from 'react';
import { Search } from "lucide-react";
import { DataTable, tableRenderers } from "@nlc-ai/shared";

interface RetentionStats {
  retentionClients: number;
  feedbackResponses: number;
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  lastActivity?: string;
  respondedOn?: string;
}

const mockRetentionClients: ClientData[] = [
  { id: '1', name: 'Theresa Webb', email: 'theresa.webb@email.com', lastActivity: 'Mar 26, 2025' },
  { id: '2', name: 'Darrell Steward', email: 'darrell.steward@email.com', lastActivity: 'Feb 26, 2025' },
  { id: '3', name: 'Esther Howard', email: 'esther.howard@email.com', lastActivity: 'Jan 26, 2025' },
  { id: '4', name: 'Guy Hawkins', email: 'guy.hawkins@email.com', lastActivity: 'Dec 26, 2024' },
  { id: '5', name: 'Albert Flores', email: 'albert.flores@email.com', lastActivity: 'Nov 26, 2024' },
  { id: '6', name: 'Kathryn Murphy', email: 'kathryn.murphy@email.com', lastActivity: 'Oct 26, 2024' },
  { id: '7', name: 'Annette Black', email: 'annette.black@email.com', lastActivity: 'Dec 26, 2024' },
  { id: '8', name: 'Ralph Edwards', email: 'ralph.edwards@email.com', lastActivity: 'Nov 26, 2024' }
];

const mockFeedbackClients: ClientData[] = [
  { id: '1', name: 'Theresa Webb', email: 'theresa.webb@email.com', respondedOn: 'Mar 26, 2025' },
  { id: '2', name: 'Darrell Steward', email: 'darrell.steward@email.com', respondedOn: 'Feb 26, 2025' },
  { id: '3', name: 'Esther Howard', email: 'esther.howard@email.com', respondedOn: 'Jan 26, 2025' },
  { id: '4', name: 'Guy Hawkins', email: 'guy.hawkins@email.com', respondedOn: 'Dec 26, 2024' },
  { id: '5', name: 'Albert Flores', email: 'albert.flores@email.com', respondedOn: 'Nov 26, 2024' },
  { id: '6', name: 'Kathryn Murphy', email: 'kathryn.murphy@email.com', respondedOn: 'Oct 26, 2024' },
  { id: '7', name: 'Annette Black', email: 'annette.black@email.com', respondedOn: 'Dec 26, 2024' },
  { id: '8', name: 'Ralph Edwards', email: 'ralph.edwards@email.com', respondedOn: 'Nov 26, 2024' }
];

const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
  <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
    <div className="absolute inset-0 opacity-30">
      <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
    </div>
    <div className="relative z-10">
      <h3 className="text-stone-300 text-sm font-medium leading-tight mb-2">{title}</h3>
      <p className="text-stone-50 text-3xl font-bold leading-tight mb-1">{value}</p>
      {subtitle && <p className="text-stone-400 text-xs">{subtitle}</p>}
    </div>
  </div>
);

const DataTableContainer = ({ title, data, dateColumn, searchPlaceholder }: {
  title: string;
  data: ClientData[];
  dateColumn: 'lastActivity' | 'respondedOn';
  searchPlaceholder: string;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const filteredData = data.filter(client => {
    const matchesSearch = searchQuery === '' ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Add date filtering logic here if needed
    return matchesSearch;
  });

  const columns = [
    {
      key: 'name',
      header: "Client's Name",
      width: '30%',
      render: tableRenderers.basicText
    },
    {
      key: 'email',
      header: 'Email',
      width: '40%',
      render: tableRenderers.basicText
    },
    {
      key: dateColumn,
      header: dateColumn === 'lastActivity' ? 'Last Activity' : 'Responded On',
      width: '30%',
      render: tableRenderers.dateText
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-stone-50 text-xl font-semibold">{title}</h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-2 rounded-lg text-sm focus:border-purple-500 outline-none"
              />
              <span className="absolute left-3 top-2 text-stone-400 text-xs pointer-events-none">From</span>
            </div>
            <div className="relative">
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-2 rounded-lg text-sm focus:border-purple-500 outline-none"
              />
              <span className="absolute left-3 top-2 text-stone-400 text-xs pointer-events-none">To</span>
            </div>
          </div>

          <div className="relative bg-transparent rounded-xl border border-white/50 px-4 py-2 flex items-center gap-3 w-80">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder:text-white/50 text-sm font-normal leading-tight outline-none"
            />
            <Search className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        emptyMessage="No data found"
        showMobileCards={false}
        className="min-h-[400px]"
      />
    </div>
  );
};

export default function RetentionStats() {
  const [stats, _] = useState<RetentionStats>({ retentionClients: 938, feedbackResponses: 1356 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="py-4 sm:py-6 lg:py-8 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-neutral-700 rounded-[20px]"></div>
          <div className="h-32 bg-neutral-700 rounded-[20px]"></div>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-neutral-700 rounded w-64"></div>
          <div className="h-96 bg-neutral-700 rounded-[20px]"></div>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-neutral-700 rounded w-64"></div>
          <div className="h-96 bg-neutral-700 rounded-[20px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="# of Clients Who Came Back To The Course After Receiving The Retention Mail"
          value={stats.retentionClients.toString()}
        />
        <StatCard
          title="# of Clients Who Responded To The Feedback Survey Form"
          value={stats.feedbackResponses.toString()}
        />
      </div>

      {/* Successful Retentions Table */}
      <DataTableContainer
        title="Successful Retentions"
        data={mockRetentionClients}
        dateColumn="lastActivity"
        searchPlaceholder="Search clients using email, name"
      />

      {/* Feedback Received Table */}
      <DataTableContainer
        title="Feedback Received From"
        data={mockFeedbackClients}
        dateColumn="respondedOn"
        searchPlaceholder="Search clients using email, name"
      />
    </div>
  );
}
