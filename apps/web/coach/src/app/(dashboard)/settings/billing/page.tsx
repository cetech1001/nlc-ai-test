'use client'

import {useEffect, useState} from "react";
import {DataTable, Pagination, PageHeader, DataFilter, MobilePagination} from "@nlc-ai/web-shared";
// import {transactionsAPI} from "@nlc-ai/web-api-client";
import { AlertBanner } from '@nlc-ai/web-ui';
import {ExtendedTransaction} from "@nlc-ai/sdk-billing";
import {FilterValues} from "@nlc-ai/sdk-core";
import { useAuth } from "@nlc-ai/web-auth";
import { Search } from "lucide-react";
import {Plan} from "@nlc-ai/sdk-billing";
import {ExtendedCoach} from "@nlc-ai/sdk-users";
import {
  paymentHistoryColumns,
  transformPaymentHistoryData,
  paymentHistoryFilters,
  emptyPaymentHistoryFilterValues,
  PaymentHistoryData,
  CurrentPlanCard,
  BillingTabs,
  SubscriptionPlans,
  sdkClient,
  CancelSubscriptionFlow
} from "@/lib";
import {useRouter, useSearchParams} from "next/navigation";

export default function Billing() {
  const { user } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'subscription' | 'history'>('subscription');

  const [coach, setCoach] = useState<ExtendedCoach | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isCoachLoading, setIsCoachLoading] = useState(true);

  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentHistory, setPaymentHistory] = useState<ExtendedTransaction[]>([]);
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
    if (user?.id) {
      if (activeTab === 'history') {
        (async () => {
          await Promise.all([
            fetchCoachData(),
            fetchTransactions(),
          ]);
        })();
      } else {
        (() => fetchPlans())();
      }
    }
  }, [user?.id, activeTab]);

  useEffect(() => {
    (() => fetchTransactions())();
  }, [currentPage, searchQuery, filterValues]);

  const fetchPlans = async () => {
    try {
      setIsPlansLoading(true);
      setError("");

      const plansData = await sdkClient.billing.plans.getPlans();
      setPlans(plansData);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch plans');
    } finally {
      setIsPlansLoading(false);
    }
  }

  const fetchCoachData = async () => {
    try {
      setIsCoachLoading(true);
      setError("");

      const coachData = await sdkClient.users.coaches.getCoach(user?.id!);
      setCoach(coachData);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch coach subscription data');
    } finally {
      setIsCoachLoading(false);
    }
  }

  const fetchTransactions = async () => {
    try {
      setIsHistoryLoading(true);
      setError("");

      const response = await sdkClient.billing.transactions.getTransactions(
        {
          page: currentPage,
          limit: paymentsPerPage,
          search: searchQuery
        },
        filterValues,
      );

      setPaymentHistory(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || "Failed to load transactions");
    } finally {
      setIsHistoryLoading(false);
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

  const handleCancelSubscription = async (reason: string, feedback?: string) => {
    try {
      /*await sdkClient.billing.subscriptions.cancelSubscription(coach?.subscriptions?.[0]?.id!, {
        reason,
        feedback
      });*/

      // Refresh coach data to get updated subscription status
      await fetchCoachData();
      setSuccessMessage("Subscription cancelled successfully. You'll continue to have access until your next billing date.");
    } catch (error: any) {
      setError(error.message || "Failed to cancel subscription");
      throw error; // Re-throw so the modal can handle it
    }
  };

  const handlePaymentAction = async (action: string, payment: PaymentHistoryData) => {
    if (action === 'download') {
      try {
        await sdkClient.billing.transactions.downloadTransaction(payment.id);
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
          <>
            <SubscriptionPlans plans={plans} handleUpgrade={handleUpgrade} coach={coach} isLoading={isPlansLoading}/>
            {coach?.subscriptions?.[0] && (
              <div className="mt-8">
                <CancelSubscriptionFlow
                  subscription={coach.subscriptions[0]}
                  onCancelSubscription={handleCancelSubscription}
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            <CurrentPlanCard
              subscription={coach?.subscriptions?.[0]}
              onChangePlan={handleChangePlan}
              isLoading={isCoachLoading}
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
              data={transformPaymentHistoryData(paymentHistory)}
              onRowAction={handlePaymentAction}
              emptyMessage="No payment history found matching your criteria"
              showMobileCards={true}
              isLoading={isHistoryLoading}
            />

            <Pagination
              totalPages={pagination.totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isLoading={isHistoryLoading}
            />

            {!isHistoryLoading && paymentHistory.length > 0 && (
              <MobilePagination pagination={pagination}/>
            )}
          </>
        )}
      </div>
    </div>
  );
}
