'use client'

import {useState, useEffect, useMemo} from 'react';
import { Search } from "lucide-react";
import { StatCard } from "@nlc-ai/shared";
import { AlertBanner } from '@nlc-ai/ui';
import { coachesAPI } from "@nlc-ai/api-client";
import { useAuth } from "@nlc-ai/auth";
import {
  CoachPaymentRequest,
  CoachPaymentRequestStats,
} from "@nlc-ai/types";
import {PaymentRequestCard} from "@/lib";

const PaymentRequestStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CoachPaymentRequestStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const data = await coachesAPI.getCoachPaymentRequestStats(user.id);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch payment request stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    (() => fetchStats())();
  }, [user?.id]);

  if (!stats && !isLoading) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title={"Total Requests"} value={stats?.total} isLoading={isLoading}/>
      <StatCard title={"Pending Payment"} value={stats?.pending} isLoading={isLoading}/>
      <StatCard title={"Completed"} value={stats?.paid} isLoading={isLoading}/>
      <StatCard title={"Total Paid"} value={`$${stats?.totalAmountPaid.toLocaleString()}`} isLoading={isLoading}/>
    </div>
  );
};



const PaymentRequestsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[linear-gradient(202deg,rgba(38,38,38,0.30)_11.62%,rgba(19,19,19,0.30)_87.57%)] rounded-[30px] border border-neutral-700 p-6 h-80 animate-pulse">
          <div className="h-6 bg-neutral-700 rounded mb-2"></div>
          <div className="h-4 bg-neutral-700 rounded mb-4 w-2/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-neutral-700 rounded"></div>
            <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
          </div>
          <div className="mt-auto pt-6">
            <div className="h-10 bg-neutral-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};


const PaymentRequests = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'stats'>('active');
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentRequests, setPaymentRequests] = useState<CoachPaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    if (user?.id) {
      fetchPaymentRequests();
    }
  }, [user?.id, currentPage, searchQuery, activeTab]);

  const fetchPaymentRequests = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError("");

      const response = await coachesAPI.getCoachPaymentRequests(
        user.id,
        currentPage,
        pagination.limit,
        searchQuery
      );

      setPaymentRequests(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || "Failed to load payment requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleMakePayment = (request: CoachPaymentRequest) => {
    window.open(request.paymentLinkUrl, '_blank');
  };

  const filteredRequests = useMemo(() => {
    return paymentRequests.filter(request => {
      const matchesTab = activeTab === 'active'
        ? request.status === 'pending'
        : request.status === 'paid' || request.status === 'expired';

      const matchesSearch = searchQuery === "" ||
        request.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.description && request.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTab && matchesSearch;
    });
  }, [paymentRequests, activeTab, searchQuery]);

  return (
    <div className={'flex flex-col'}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={() => setError('')}/>
        )}

        <PaymentRequestStats />

        <div className={"flex flex-col xl:flex-row justify-between gap-3 xl:gap-0"}>
          <div className="flex justify-center xl:justify-start items-center gap-8 w-full xl:w-2/5 order-3 xl:order-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`text-lg font-medium transition-colors ${
                activeTab === 'active'
                  ? 'text-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50'
              }`}
            >
              Active Requests
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`text-lg font-medium transition-colors ${
                activeTab === 'archived'
                  ? 'text-fuchsia-400'
                  : 'text-stone-300 hover:text-stone-50'
              }`}
            >
              Completed/Expired
            </button>
          </div>
          <div className={"flex w-full xl:w-3/5 order-1 xl:order-2 justify-end gap-2"}>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search by plan name"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <PaymentRequestsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <PaymentRequestCard
                  key={request.id}
                  request={request}
                  onMakePayment={handleMakePayment}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-stone-400 text-lg mb-2">
                  No {activeTab} payment requests found
                </div>
                <div className="text-stone-500 text-sm">
                  {searchQuery
                    ? `No requests match your search for "${searchQuery}"`
                    : `No ${activeTab} payment requests available`
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentRequests;
