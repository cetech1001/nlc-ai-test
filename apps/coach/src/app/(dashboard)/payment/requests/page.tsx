'use client'

import {useEffect, useMemo, useState} from 'react';
import {Search} from "lucide-react";
import {StatCard} from "@nlc-ai/shared";
import {AlertBanner} from '@nlc-ai/ui';
import {coachesAPI} from "@nlc-ai/api-client";
import {useAuth} from "@nlc-ai/auth";
import {CoachPaymentRequest, CoachPaymentRequestStats,} from "@nlc-ai/types";
import {PaymentRequestCard} from "@/lib";


const PaymentRequests = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<CoachPaymentRequestStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

  const [paymentRequests, setPaymentRequests] = useState<CoachPaymentRequest[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");

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
      (() => fetchPaymentRequests())();
    }
  }, [user?.id, currentPage, searchQuery, activeTab]);

  useEffect(() => {
    if (user?.id) {
      (() => fetchStats())();
    }
  }, [user?.id]);

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
      setIsStatsLoading(false);
    }
  };

  const fetchPaymentRequests = async () => {
    if (!user?.id) return;

    try {
      setError("");

      const response = await coachesAPI.getCoachPaymentRequests(
        user.id,
        currentPage,
        pagination.limit,
        { status: activeTab },
        searchQuery
      );

      setPaymentRequests(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || "Failed to load payment requests");
    } finally {
      setIsRequestsLoading(false);
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
      return searchQuery === "" ||
        request.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.description && request.description.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [paymentRequests, activeTab, searchQuery]);

  return (
    <div className={'flex flex-col'}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {error && (
          <AlertBanner type={"error"} message={error} onDismiss={() => setError('')}/>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title={"Total Requests"} value={stats?.total} isLoading={isStatsLoading}/>
          <StatCard title={"Pending Payment"} value={stats?.pending} isLoading={isStatsLoading}/>
          <StatCard title={"Completed"} value={stats?.paid} isLoading={isStatsLoading}/>
          <StatCard title={"Total Paid"} value={`$${stats?.totalAmountPaid.toLocaleString()}`} isLoading={isStatsLoading}/>
        </div>

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
              onClick={() => setActiveTab('inactive')}
              className={`text-lg font-medium transition-colors ${
                activeTab === 'inactive'
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
          {isRequestsLoading ? (
            [1, 2, 3].map((_, index) => (
              <PaymentRequestCard key={index} isLoading={true}/>
            ))
          ) : (
            filteredRequests.length > 0 ? (
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
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentRequests;
