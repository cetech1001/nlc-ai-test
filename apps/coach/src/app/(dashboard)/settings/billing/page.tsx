'use client'

import {useEffect, useState} from "react";
import {PlanCard, DataTable, Pagination, PageHeader, DataFilter, MobilePagination} from "@nlc-ai/shared";
import {coachesAPI, plansAPI, transactionsAPI} from "@nlc-ai/api-client";
import { AlertBanner } from '@nlc-ai/ui';
import {CoachWithStatus, FilterValues, Plan, TransformedPlan} from "@nlc-ai/types";
import { useAuth } from "@nlc-ai/auth";
import { Search } from "lucide-react";
import {
  paymentHistoryColumns,
  transformPaymentHistoryData,
  paymentHistoryFilters,
  emptyPaymentHistoryFilterValues,
  PaymentHistoryData,
  CurrentPlanCard,
  CurrentPlanCardSkeleton, BillingTabs
} from "@/lib";
import {useRouter, useSearchParams} from "next/navigation";

const BillingSkeleton = () => {
  return (
    <div className="py-8 space-y-8">
      <div className="h-8 bg-white/10 rounded animate-pulse"></div>

      {/* Current Plan Skeleton */}
      <CurrentPlanCardSkeleton />

      {/* Plans Skeleton */}
      <div className="space-y-6">
        <div className="h-6 bg-white/10 rounded w-1/3 mx-auto"></div>
        <div className="gap-4 grid grid-cols-1 mb-2 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[linear-gradient(202deg,rgba(38,38,38,0.30)_11.62%,rgba(19,19,19,0.30)_87.57%)] rounded-[30px] border border-neutral-700 p-6 h-80 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-neutral-700 rounded"></div>
                <div className="h-4 bg-neutral-700 rounded w-2/3"></div>
                <div className="h-8 bg-neutral-700 rounded"></div>
                <div className="h-10 bg-neutral-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Billing() {
  const { user } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'subscription' | 'history'>('subscription');

  const [coach, setCoach] = useState<CoachWithStatus | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentHistoryLoading, setIsPaymentHistoryLoading] = useState(false);

  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryData[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyPaymentHistoryFilterValues);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const paymentsPerPage = 10;

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl as 'subscription' | 'history');
    }
  }, [searchParams]);

  const handleTabChange = (tabID: 'subscription' | 'history') => {
    setActiveTab(tabID);

    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('tab', tabID);

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.replace(`${window.location.pathname}${query}`, { scroll: false });
  };

  useEffect(() => {
    (async () => {
      if (!user?.id) {
        setError("User not found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const [coachData, plansData] = await Promise.all([
          coachesAPI.getCoach(user.id),
          plansAPI.getPlans(false)
        ]);

        setCoach(coachData);
        setPlans(plansData);
      } catch (err: any) {
        setError(err.message || "Failed to load billing data");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'history') {
      (() => fetchTransactions())();
    }
  }, [activeTab, currentPage, searchQuery, filterValues]);

  const fetchTransactions = async () => {
    try {
      setIsPaymentHistoryLoading(true);
      setError("");

      const response = await transactionsAPI.getTransactions(
        currentPage,
        paymentsPerPage,
        filterValues,
        searchQuery
      );

      setPaymentHistory(transformPaymentHistoryData(response.data));
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || "Failed to load transactions");
    } finally {
      setIsPaymentHistoryLoading(false);
    }
  };

  const handleUpgrade = (plan: Plan) => {
    console.log('Upgrading to:', plan.name);
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
    setFilterValues(emptyPaymentHistoryFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePaymentAction = async (action: string, payment: PaymentHistoryData) => {
    if (action === 'download') {
      try {
        await transactionsAPI.downloadTransaction(payment.id);
        setSuccessMessage("Invoice downloaded successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error: any) {
        setError(error.message || "Failed to download invoice");
      }
    }
  };

  const handleChangePlan = () => {
    setActiveTab('subscription');
  };

  const clearError = () => {
    setError("");
  };

  const clearSuccessMessage = () => {
    setSuccessMessage("");
  };

  if (isLoading) {
    return <BillingSkeleton/>;
  }

  if (error && !coach) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message={error} onDismiss={clearError} />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message="Coach data not found" onDismiss={clearError} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${ isFilterOpen && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' }`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {successMessage && (
          <AlertBanner type="success" message={successMessage} onDismiss={clearSuccessMessage} />
        )}

        {error && (
          <AlertBanner type="error" message={error} onDismiss={clearError} />
        )}

        <BillingTabs activeTab={activeTab} setActiveTab={handleTabChange}/>

        {activeTab === 'subscription' && (
          plans.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-stone-400 text-lg mb-4">No subscription plans available</div>
            </div>
          ) : (
            <div className="gap-4 grid grid-cols-1 mb-2 sm:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  currentPlan={coach.subscriptions?.[0]?.plan}
                  action={(plan: TransformedPlan) => plan.isCurrentPlan ? 'Current Plan' : 'Upgrade Plan'}
                  onActionClick={coach.subscriptions?.[0]?.plan?.id === plan.id ? (_: Plan) => {} : handleUpgrade}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'history' && (
          <>
            <CurrentPlanCard
              subscription={coach.subscriptions?.[0]}
              onChangePlan={handleChangePlan}
            />

            <PageHeader title="Billing History">
              <>
                <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
                  <input
                    type="text"
                    placeholder="Search invoices by plan name"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
                  />
                  <Search className="w-5 h-5 text-white" />
                </div>

                <DataFilter
                  filters={paymentHistoryFilters}
                  values={filterValues}
                  onChange={handleFilterChange}
                  onReset={handleResetFilters}
                  setIsFilterOpen={setIsFilterOpen}
                />
              </>
            </PageHeader>

            <DataTable
              columns={paymentHistoryColumns}
              data={paymentHistory}
              onRowAction={handlePaymentAction}
              emptyMessage="No payment history found matching your criteria"
              showMobileCards={true}
              isLoading={isPaymentHistoryLoading}
            />

            <Pagination
              totalPages={pagination.totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isLoading={isPaymentHistoryLoading}
            />

            {!isPaymentHistoryLoading && paymentHistory.length > 0 && (
              <MobilePagination pagination={pagination}/>
            )}
          </>
        )}
      </div>
    </div>
  );
}
