'use client'

import { Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@nlc-ai/ui";
import { useEffect, useState } from "react";
import { plansAPI } from "@nlc-ai/api-client";
import { PageHeader, DataFilter, PlanCard } from "@nlc-ai/shared";
import { AlertBanner } from '@nlc-ai/ui';
import {FilterValues, Plan} from "@nlc-ai/types";
import {emptyPlanFilterValues, planFilters, PlansPageSkeleton, transformPlan} from "@/lib";

const SubscriptionPlans = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyPlanFilterValues);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get('success');
    if (successParam) {
      setSuccessMessage(successParam);
      window.history.replaceState({}, '', window.location.pathname);
    }

    (() => fetchPlans())();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
    return () => {}
  }, [successMessage]);

  useEffect(() => {
    filterPlans();
  }, [plans, filterValues]);

  const fetchPlans = async (newIncludeDeleted?: string) => {
    try {
      setIsLoading(true);
      const includeDeleted = newIncludeDeleted
        ? newIncludeDeleted === 'true'
        : filterValues.includeDeleted === 'true';

      const fetchedPlans = await plansAPI.getPlans(true, includeDeleted);
      setPlans(fetchedPlans);
    } catch (error: any) {
      setError(error.message || "Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  const filterPlans = () => {
    let filtered = [...plans];

    if (filterValues.status) {
      filtered = filtered.filter(plan => {
        if (filterValues.status === 'active') return plan.isActive && !plan.isDeleted;
        if (filterValues.status === 'inactive') return !plan.isActive && !plan.isDeleted;
        if (filterValues.status === 'deleted') return plan.isDeleted;
        return true;
      });
    }

    setFilteredPlans(filtered);
  };

  const handleFilterChange = async (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    await fetchPlans();
  };

  const handleResetFilters = async () => {
    setFilterValues(emptyPlanFilterValues);
    await fetchPlans();
  };

  const handleEditPlan = (planID: string) => {
    router.push(`/subscription-plans/edit?id=${planID}`);
  };

  const handleCreateNewPlan = () => {
    router.push("/subscription-plans/create");
  };

  const handleToggleStatus = async (planID: string) => {
    try {
      await plansAPI.togglePlanStatus(planID);
      setSuccessMessage("Plan status updated successfully!");
      await fetchPlans();
    } catch (error: any) {
      setError(error.message || "Failed to update plan status");
    }
  };

  const handleDeletePlan = async (planID: string) => {
    if (!confirm("Are you sure you want to delete this plan? This action will mark it for deletion.")) {
      return;
    }

    try {
      await plansAPI.deletePlan(planID);
      setSuccessMessage("Plan deleted successfully!");
      await fetchPlans();
    } catch (error: any) {
      setError(error.message || "Failed to delete plan");
    }
  };

  const handleRestorePlan = async (planID: string) => {
    if (!confirm("Are you sure you want to restore this plan?")) {
      return;
    }

    try {
      await plansAPI.restorePlan(planID);
      setSuccessMessage("Plan restored successfully!");
      await fetchPlans();
    } catch (error: any) {
      setError(error.message || "Failed to restore plan");
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  if (isLoading) {
    return <PlansPageSkeleton />;
  }

  return (
    <div className={`mb-8 pt-2 sm:pt-8 ${isFilterOpen ? 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]' : ''}`}>
      {successMessage && (
        <AlertBanner type="success" message={successMessage} onDismiss={clearMessages} />
      )}

      {error && (
        <AlertBanner type="error" message={error} onDismiss={clearMessages} />
      )}

      <PageHeader
        title="Subscription Plans"
      >
        <div className="flex items-center gap-3">
          <Button
            onClick={handleCreateNewPlan}
            className={'bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors'}
          >
            <span className="w-4 h-4 mr-2">
              <Plus className="w-4 h-4" />
            </span>
            Create New Plan
          </Button>
          <DataFilter
            filters={planFilters}
            values={filterValues}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            setIsFilterOpen={setIsFilterOpen}
          />
        </div>
      </PageHeader>

      {filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-stone-400 text-lg mb-4">No subscription plans found</div>
          <Button
            onClick={handleCreateNewPlan}
            className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-lg hover:bg-[#8B31CA] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="relative group mb-8">
              <div className="absolute -top-2 -right-2 z-10">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plan.isDeleted
                    ? 'bg-red-600/20 text-red-400 border border-red-600/50'
                    : plan.isActive
                      ? 'bg-green-600/20 text-green-400 border border-green-600/50'
                      : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50'
                }`}>
                  {plan.isDeleted ? 'Deleted' : plan.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col gap-2">
                  {plan.isDeleted ? (
                    <button
                      onClick={() => handleRestorePlan(plan.id)}
                      className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                      title="Restore Plan"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleToggleStatus(plan.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          plan.isActive
                            ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                            : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                        }`}
                        title={plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                      >
                        {plan.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <PlanCard
                plan={transformPlan(plan)}
                action={plan.isDeleted ? "Deleted" : "Edit Plan"}
                onActionClick={plan.isDeleted ? () => {} : () => handleEditPlan(plan.id)}
              />

              {plan._count && (
                <div className="mt-2 text-center">
                  <span className="text-stone-400 text-xs">
                    {plan._count.subscriptions} active subscription{plan._count.subscriptions !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
