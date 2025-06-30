'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";
import {allCoachesData, coachColumns} from "@/app/data";
import { Settings2, Search } from "lucide-react";
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
      router.push('/coaches/make-payment');
    } else if (action === 'menu') {
      console.log('Menu clicked for:', coach.name);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h2 className="text-stone-50 text-2xl font-medium leading-relaxed">
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

        <DataTable
          columns={coachColumns}
          data={currentCoaches}
          onRowAction={handleRowAction}
        />

        <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
      </div>
    </div>
  );
}
