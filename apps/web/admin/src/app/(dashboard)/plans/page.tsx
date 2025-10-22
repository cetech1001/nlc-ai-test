'use client'

import { Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";
import { Button } from "@nlc-ai/web-ui";
import { useEffect, useState } from "react";
import { PageHeader, DataFilter, PlanCard } from "@nlc-ai/web-shared";
import { AlertBanner } from '@nlc-ai/web-ui';
import {Plan, TransformedPlan} from "@nlc-ai/sdk-billing";
import {FilterValues} from "@nlc-ai/sdk-core";
import {emptyPlanFilterValues, planFilters, PlansPageSkeleton, sdkClient} from "@/lib";

const SubscriptionPlans = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyPlanFilterValues);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const successParam = searchParams.get('success');
    if (successParam) {
      setSuccessMessage(successParam);
      router.replace(window.location.pathname);
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
    return () => { /* empty */ }
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

      const fetchedPlans = await sdkClient.billing.plans.getPlans(true, includeDeleted);
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

  const handleEditPlan = (plan: Plan) => {
    router.push(`/plans/edit?id=${plan.id}`);
  };

  const handleCreateNewPlan = () => {
    router.push("/plans/create");
  };

  const handleToggleStatus = async (planID: string) => {
    try {
      await sdkClient.billing.plans.togglePlanStatus(planID);
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
      await sdkClient.billing.plans.deletePlan(planID);
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
      await sdkClient.billing.plans.restorePlan(planID);
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

      <PageHeader title="Subscription Plans">
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
                plan={plan}
                action={(plan: TransformedPlan) => plan.isDeleted ? "Deleted" : "Edit Plan"}
                onActionClick={plan.isDeleted ? () => { /* empty */ } : handleEditPlan}
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
