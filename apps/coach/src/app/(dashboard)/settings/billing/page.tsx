'use client'

import {useEffect, useState} from "react";
import {PlanCard} from "@nlc-ai/shared";
import { coachesAPI, plansAPI } from "@nlc-ai/api-client";
import { AlertBanner } from '@nlc-ai/ui';
import {CoachWithStatus, Plan, TransformedPlan} from "@nlc-ai/types";
import { useAuth } from "@nlc-ai/auth";
import { Search, MoreVertical, Download } from "lucide-react";

// Mock subscription data - replace with real API calls
const mockCurrentSubscription = {
  plan: { name: 'Growth Pro' },
  status: 'active',
  billingCycle: 'monthly',
  currentPeriodEnd: new Date('2025-06-26'),
  nextBillingDate: new Date('2025-06-26')
};

// Mock payment history - replace with real API calls
const mockPaymentHistory = [
  {
    id: "1234",
    invoiceDate: "Mar 25, 2025",
    planType: "Growth",
    amount: 1200,
    paidOn: "Mar 26, 2025",
    status: "Cancelled"
  },
  {
    id: "1233",
    invoiceDate: "Feb 25, 2025",
    planType: "Premium",
    amount: 2000,
    paidOn: "Feb 26, 2025",
    status: "Paid"
  },
  {
    id: "1232",
    invoiceDate: "Jan 25, 2025",
    planType: "Growth",
    amount: 1200,
    paidOn: "Jan 26, 2025",
    status: "Paid"
  },
  {
    id: "1231",
    invoiceDate: "Dec 25, 2024",
    planType: "Premium",
    amount: 2000,
    paidOn: "Dec 26, 2024",
    status: "Paid"
  },
  {
    id: "1230",
    invoiceDate: "Nov 25, 2024",
    planType: "Growth",
    amount: 1200,
    paidOn: "Nov 26, 2024",
    status: "Paid"
  },
  {
    id: "1229",
    invoiceDate: "Oct 25, 2024",
    planType: "Starter",
    amount: 400,
    paidOn: "Oct 26, 2024",
    status: "Paid"
  }
];

const BillingSkeleton = () => {
  return (
    <div className="py-8 space-y-8">
      <div className="h-8 bg-white/10 rounded animate-pulse"></div>

      {/* Current Plan Skeleton */}
      <div className="bg-[linear-gradient(202deg,rgba(38,38,38,0.30)_11.62%,rgba(19,19,19,0.30)_87.57%)] rounded-[30px] border border-neutral-700 p-6">
        <div className="h-6 bg-neutral-700 rounded mb-6 w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-neutral-700 rounded w-1/3"></div>
              <div className="h-5 bg-neutral-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>

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

const transformPlan = (plan: Plan, currentPlanName?: string): TransformedPlan => {
  return {
    id: plan.id,
    title: plan.name,
    subtitle: plan.description || `Access to ${plan.name} features`,
    monthlyPrice: plan.monthlyPrice,
    price: plan.annualPrice,
    billingCycle: 'per month billed annually',
    monthlyBilling: 'per month',
    colorClass: plan.color || "#7B21BA",
    features: plan.features || [],
    isCurrentPlan: currentPlanName === plan.name,
  };
};

export default function Billing() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'subscription' | 'history'>('subscription');
  const [coach, setCoach] = useState<CoachWithStatus | null>(null);
  const [plans, setPlans] = useState<TransformedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

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

        const currentPlanName = coachData.subscriptions?.[0]?.plan?.name;

        const transformedPlans = plansData.map(plan =>
          transformPlan(plan, currentPlanName)
        );

        setPlans(transformedPlans);
      } catch (err: any) {
        setError(err.message || "Failed to load billing data");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.id]);

  const handleUpgrade = (planTitle: string) => {
    console.log('Upgrading to:', planTitle);
    // Implement upgrade logic
  };

  const handlePaymentAction = (action: string, payment: any) => {
    if (action === 'download') {
      console.log('Downloading invoice for:', payment.id);
      // Implement download logic
    }
  };

  const clearError = () => {
    setError("");
  };

  const clearSuccessMessage = () => {
    setSuccessMessage("");
  };

  const filteredHistory = mockPaymentHistory.filter(payment =>
    payment.id.includes(searchQuery) ||
    payment.planType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <BillingSkeleton/>;
  }

  if (error) {
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

  const currentSubscription = coach.subscriptions?.[0] || mockCurrentSubscription;
  const subscriptionStatus = currentSubscription?.status || 'none';
  const billingCycle = currentSubscription?.billingCycle || 'Monthly';

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Active', color: 'text-green-600' };
      case 'canceled':
        return { text: 'Canceled', color: 'text-red-600' };
      case 'past_due':
        return { text: 'Past Due', color: 'text-yellow-600' };
      case 'trialing':
        return { text: 'Trial', color: 'text-blue-600' };
      case 'none':
        return { text: 'No Subscription', color: 'text-gray-600' };
      default:
        return { text: status, color: 'text-gray-600' };
    }
  };

  const statusDisplay = getStatusDisplay(subscriptionStatus);

  return (
    <div>
      {successMessage && (
        <div className="mb-6">
          <AlertBanner type="success" message={successMessage} onDismiss={clearSuccessMessage} />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex justify-center items-center gap-8 mb-8">
        <button
          onClick={() => setActiveTab('subscription')}
          className={`text-lg font-medium transition-colors ${
            activeTab === 'subscription'
              ? 'text-fuchsia-400'
              : 'text-stone-300 hover:text-stone-50'
          }`}
        >
          Subscription Plans
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`text-lg font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-fuchsia-400'
              : 'text-stone-300 hover:text-stone-50'
          }`}
        >
          Payment History
        </button>
      </div>

      {activeTab === 'subscription' && (
        <>
          {/* Current Plan Info */}
          <div className="mb-8">
            <div className="flex flex-col px-4 gap-4 justify-center w-full h-72 sm:h-44 bg-[linear-gradient(202deg,rgba(38,38,38,0.30)_11.62%,rgba(19,19,19,0.30)_87.57%)] rounded-[30px] border border-neutral-700">
              <div>
                <h3 className="text-stone-50 text-2xl font-semibold font-['Inter'] leading-relaxed">
                  Current Subscription
                </h3>
              </div>

              <div className="w-full flex flex-col gap-2 sm:grid sm:grid-cols-7 sm:gap-0">
                <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                  <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Billing Cycle</div>
                  <div className="text-stone-50 text-base font-medium font-['Inter']">
                    {billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}
                  </div>
                </div>
                <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                  <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Status</div>
                  <div className="flex items-center gap-2">
                    <div className={`text-base font-medium font-['Inter'] ${statusDisplay.color}`}>
                      {statusDisplay.text}
                    </div>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10" stroke="rgb(245 245 245)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-3 sm:gap-1.5">
                  <div className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Actions</div>
                  <button className="bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity text-sm">
                    Change Plan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Available Plans */}
          <div className="mb-6">
            <h3 className="text-stone-50 text-2xl font-semibold font-['Inter'] leading-relaxed mb-6">Select Plan</h3>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-stone-400 text-lg mb-4">No subscription plans available</div>
            </div>
          ) : (
            <div className="gap-4 grid grid-cols-1 mb-2 sm:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  action={plan.isCurrentPlan ? 'Current Plan' : 'Upgrade Plan'}
                  onActionClick={plan.isCurrentPlan ? () => {} : () => handleUpgrade(plan.title)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-6">
            <h3 className="text-stone-50 text-2xl font-semibold font-['Inter'] leading-relaxed">Billing History</h3>

            <div className="flex gap-2">
              <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search invoices by plan name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
                />
                <Search className="w-5 h-5 text-white" />
              </div>

              <button className="bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
                <div className="w-6 h-6 rounded border border-white flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span>Filter Options</span>
              </button>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-[linear-gradient(202deg,rgba(38,38,38,0.30)_11.62%,rgba(19,19,19,0.30)_87.57%)] rounded-[30px] border border-neutral-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600">
                <tr>
                  <th className="py-4 px-4 text-left text-white font-medium">Invoice No.</th>
                  <th className="py-4 px-4 text-left text-white font-medium">Invoice Date</th>
                  <th className="py-4 px-4 text-left text-white font-medium">Plan Type</th>
                  <th className="py-4 px-4 text-left text-white font-medium">Amount</th>
                  <th className="py-4 px-4 text-left text-white font-medium">Paid On</th>
                  <th className="py-4 px-4 text-left text-white font-medium">Status</th>
                  <th className="py-4 px-4 text-left text-white font-medium">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredHistory.map((payment) => (
                  <tr key={payment.id} className="border-b border-neutral-700 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-stone-50 font-medium">#{payment.id}</td>
                    <td className="py-4 px-4 text-stone-300">{payment.invoiceDate}</td>
                    <td className="py-4 px-4 text-stone-300">{payment.planType}</td>
                    <td className="py-4 px-4 text-stone-50 font-medium">${payment.amount}</td>
                    <td className="py-4 px-4 text-stone-300">{payment.paidOn}</td>
                    <td className="py-4 px-4">
                        <span className={`font-medium flex items-center gap-1 ${
                          payment.status === 'Paid' ? 'text-green-400' :
                            payment.status === 'Cancelled' ? 'text-red-400' :
                              'text-stone-300'
                        }`}>
                          {payment.status}
                          <MoreVertical className="w-4 h-4 cursor-pointer hover:bg-white/10 rounded" />
                        </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handlePaymentAction('download', payment)}
                        className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>

            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <div className="text-stone-400 text-lg mb-2">
                  No payment history found
                </div>
                <div className="text-stone-500 text-sm">
                  {searchQuery
                    ? `No payments match your search for "${searchQuery}"`
                    : "You don't have any payment history yet"
                  }
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredHistory.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button className="w-10 h-10 rounded-lg bg-neutral-700 text-stone-300 hover:bg-neutral-600 flex items-center justify-center transition-colors">
                1
              </button>
              <button className="w-10 h-10 rounded-lg bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white flex items-center justify-center">
                2
              </button>
              <button className="w-10 h-10 rounded-lg bg-neutral-700 text-stone-300 hover:bg-neutral-600 flex items-center justify-center transition-colors">
                3
              </button>
              <button className="w-10 h-10 rounded-lg bg-neutral-700 text-stone-300 hover:bg-neutral-600 flex items-center justify-center transition-colors">
                4
              </button>
              <button className="w-10 h-10 rounded-lg bg-neutral-700 text-stone-300 hover:bg-neutral-600 flex items-center justify-center transition-colors">
                5
              </button>
              <span className="text-stone-400 mx-2">...</span>
              <button className="w-10 h-10 rounded-lg bg-neutral-700 text-stone-300 hover:bg-neutral-600 flex items-center justify-center transition-colors">
                20
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
