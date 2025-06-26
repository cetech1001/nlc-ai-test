'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";
import { allCoachesData } from "@/app/data";
import { ChevronDown, Filter, Search } from "lucide-react";
import { DataTable, tableRenderers } from "@/app/(dashboard)/components/data-table";

export default function Coaches() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCoaches, setFilteredCoaches] = useState(allCoachesData);

  const coachesPerPage = 10;
  const totalPages = Math.ceil(filteredCoaches.length / coachesPerPage);
  const startIndex = (currentPage - 1) * coachesPerPage;
  const endIndex = startIndex + coachesPerPage;
  const currentCoaches = filteredCoaches.slice(startIndex, endIndex);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredCoaches(allCoachesData);
    } else {
      const filtered = allCoachesData.filter(
        (coach) =>
          coach.name.toLowerCase().includes(query.toLowerCase()) ||
          coach.email.toLowerCase().includes(query.toLowerCase()) ||
          coach.plan.toLowerCase().includes(query.toLowerCase()) ||
          coach.id.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredCoaches(filtered);
    }
    setCurrentPage(1);
  };

  const handleRowAction = (action: string, coach: any) => {
    if (action === 'payment') {
      router.push(`/make-payment?coach=${encodeURIComponent(coach.name)}&email=${encodeURIComponent(coach.email)}&date=${encodeURIComponent(coach.dateJoined)}&plan=${encodeURIComponent(coach.plan)}&status=${encodeURIComponent(coach.status)}`);
    } else if (action === 'menu') {
      // Handle menu action
      console.log('Menu clicked for:', coach.name);
    }
  };

  const getPaginationPages = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Define table columns with custom widths
  const columns = [
    {
      key: 'id',
      header: 'User ID',
      width: '120px',
      render: tableRenderers.basicText
    },
    {
      key: 'name',
      header: 'Name',
      width: '180px',
      render: (value: string) => tableRenderers.truncateText(value, 20)
    },
    {
      key: 'email',
      header: 'Email',
      width: '200px',
      render: (value: string) => tableRenderers.truncateText(value, 25)
    },
    {
      key: 'dateJoined',
      header: 'Date Joined',
      width: '140px',
      render: tableRenderers.dateText
    },
    {
      key: 'plan',
      header: 'Plan',
      width: '120px',
      render: tableRenderers.basicText
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: tableRenderers.status
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'auto',
      render: (value: any, row: any, onAction?: (action: string, row: any) => void) =>
        tableRenderers.actions(value, row, onAction)
    }
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
        {/* Header Section with Title, Search, and Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h2 className="text-stone-50 text-3xl font-medium leading-relaxed">
            Coaches List
          </h2>
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative bg-transparent rounded-2xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search users using name, plan, email etc."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>
            {/* Filter Button */}
            <button className="w-14 h-14 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity">
              <Filter className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>

        <div className="block sm:hidden">
          <div className="space-y-4">
            {currentCoaches.map((coach) => (
              <div key={coach.id} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-stone-50 font-medium text-base leading-tight truncate">{coach.name}</h3>
                      <p className="text-stone-300 text-sm leading-tight mt-0.5">{coach.id}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <span className={`text-sm font-medium whitespace-nowrap ${
                        coach.status === "Active" ? "text-green-600" : "text-red-600"
                      }`}>
                        {coach.status}
                      </span>
                      <ChevronDown className="w-4 h-4 text-stone-50" />
                    </div>
                  </div>
                  <div className="text-stone-300 text-sm leading-tight space-y-1">
                    <p className="truncate">{coach.email}</p>
                    <p className="text-xs">
                      <span className="text-stone-400">{coach.dateJoined}</span>
                      <span className="text-stone-500 mx-1">•</span>
                      <span className="text-stone-300">{coach.plan}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRowAction('payment', coach)}
                    className="text-fuchsia-400 text-sm font-medium underline hover:text-fuchsia-300 transition-colors"
                  >
                    Make Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden sm:block">
          <DataTable
            columns={columns}
            data={currentCoaches}
            onRowAction={handleRowAction}
          />
        </div>

        <div className="bg-black/50 backdrop-blur-sm p-4 sm:p-6">
          <div className="flex items-center justify-end gap-5">
            {getPaginationPages().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={page === "..."}
                className={`w-12 min-w-12 min-h-12 p-2.5 rounded-[10px] flex items-center justify-center text-xl font-semibold leading-relaxed transition-colors ${
                  page === currentPage
                    ? "bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-stone-50"
                    : page === "..."
                      ? "bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 border border-neutral-700 text-stone-50 cursor-default"
                      : "bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 border border-neutral-700 text-stone-50 hover:bg-gradient-to-r hover:from-fuchsia-600/20 hover:via-purple-700/20 hover:to-violet-600/20"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
