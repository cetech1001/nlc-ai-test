'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";
import {Coach, inactiveCoachesData} from "@/app/data";
import {DataTable, TableColumn, tableRenderers, Pagination, PageHeader} from "@nlc-ai/shared";
import {coachColumns} from "@/lib/utils/coaches";

export default function InactiveCoaches() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCoaches, setFilteredCoaches] = useState(inactiveCoachesData);

  const coachesPerPage = 10;
  const totalPages = Math.ceil(filteredCoaches.length / coachesPerPage);
  const startIndex = (currentPage - 1) * coachesPerPage;
  const endIndex = startIndex + coachesPerPage;
  const currentCoaches = filteredCoaches.slice(startIndex, endIndex);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredCoaches(inactiveCoachesData);
    } else {
      const filtered = inactiveCoachesData.filter(
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
    if (action === 'mail') {
      router.push('/inactive-coaches/send-mail');
    }
  };

  const columns: TableColumn<Coach>[] = [
    ...coachColumns.map(column => {
      if (column.key === 'dateJoined') {
        return {
          key: 'dateJoined',
          header: 'Last Active',
          width: `${100 / coachColumns.length}%`,
          render: tableRenderers.dateText
        };
      }
      if (column.key === 'actions') {
        return {
          key: 'actions',
          header: 'Actions',
          width: `auto`,
          render: (_: string, row: Coach, onAction?: (action: string, row: Coach) => void) => {
            return tableRenderers.actions('Send Mail', row, 'mail', onAction);
          }
        }
      }
      return column;
    })
  ];

  return (
    <div className="flex flex-col">
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        <PageHeader
          title="Inactive Coaches List"
          showSearch={true}
          searchPlaceholder="Search users using name, plan, email etc."
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          showFilterButton={true}
          onFilterClick={() => console.log('Filter clicked')}
        />

        <DataTable
          columns={columns}
          data={currentCoaches}
          onRowAction={handleRowAction}
        />

        <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
      </div>
    </div>
  );
}
