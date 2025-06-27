'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";
import {allCoachesData, coachColumns} from "@/app/data";
import { ChevronDown, Settings2, Search } from "lucide-react";
import { DataTable } from "@/app/(dashboard)/components/data-table";
import {Pagination} from "@/app/(dashboard)/components/pagination";

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
      router.push('/make-payment');
    } else if (action === 'menu') {
      console.log('Menu clicked for:', coach.name);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h2 className="text-stone-50 text-3xl font-medium leading-relaxed">
            Coaches List
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-[100rem] max-w-md">
              <input
                type="text"
                placeholder="Search users using name, plan, email etc."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <button className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity p-2">
              <Settings2 className="w-8 h-8 text-white" />
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
            columns={coachColumns}
            data={currentCoaches}
            onRowAction={handleRowAction}
          />
        </div>

        <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
      </div>
    </div>
  );
}
