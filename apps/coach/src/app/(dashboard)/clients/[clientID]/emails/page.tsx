'use client'

import { useState, useEffect } from 'react';
import {useParams, useRouter} from "next/navigation";
import { Search } from "lucide-react";
import { AlertBanner } from '@nlc-ai/ui';
import {
  EmailCard,
  EmailCardsSkeleton,
  emailFilters,
  emptyEmailFilterValues,
  mockEmails
} from "@/lib";
import {DataFilter, Pagination } from '@nlc-ai/shared';
import {FilterValues} from "@nlc-ai/types";

const EmailsList = () => {
  const router = useRouter();
  const params = useParams();

  const clientID = params.clientID as string;

  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyEmailFilterValues);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEmailClick = (emailID: string) => {
    router.push(`/clients/${clientID}/emails/${emailID}`);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterValues(emptyEmailFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const filteredEmails = mockEmails.filter(email => {
    const matchesTab = email.status === activeTab;
    const matchesSearch = searchQuery === "" ||
      email.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.recipient.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className={`flex flex-col ${ isFilterOpen && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' }`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={() => setError('')}/>
        )}

        <div className={"flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0"}>
          <div className="flex items-center gap-8 order-2 sm:order-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`text-lg font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'text-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50'
              }`}
            >
              Pending
            </button>
            <div className={"h-6 border-r border-gray-700"}></div>
            <button
              onClick={() => setActiveTab('approved')}
              className={`text-lg font-medium transition-colors ${
                activeTab === 'approved'
                  ? 'text-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50'
              }`}
            >
              Approved
            </button>
          </div>

          <div className={"flex order-1 sm:order-2 gap-2 w-full justify-end"}>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 max-w-md w-full">
              <input
                type="text"
                placeholder="Search emails using title, name"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>
            <DataFilter
              filters={emailFilters}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              setIsFilterOpen={setIsFilterOpen}
            />
          </div>
        </div>

        {isLoading && (
          <EmailCardsSkeleton />
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
            {filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onClick={() => handleEmailClick(email.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-stone-400 text-lg mb-2">
                  No {activeTab} emails found
                </div>
                <div className="text-stone-500 text-sm">
                  {searchQuery
                    ? `No emails match your search for "${searchQuery}"`
                    : `No ${activeTab} emails available`
                  }
                </div>
              </div>
            )}
          </div>
        )}

        <Pagination
          totalPages={1}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default EmailsList;
