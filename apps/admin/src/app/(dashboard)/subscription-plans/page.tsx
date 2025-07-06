'use client'

import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { PlanCard } from "@/app/(dashboard)/components/plan-card";
import { Button } from "@nlc-ai/ui";
import { useEffect, useState } from "react";
import { PlansPageSkeleton } from "@/app/(dashboard)/subscription-plans/components/plans-page.skeleton";
import { plansAPI, type Plan as APIPlan } from "@/lib/api/plans";
import { PageHeader } from "@nlc-ai/shared";

const transformPlan = (apiPlan: APIPlan, isCurrentPlan = false) => ({
  id: apiPlan.id,
  title: apiPlan.name,
  subtitle: apiPlan.description || `Access to ${apiPlan.maxAiAgents || 'unlimited'} agents`,
  price: Math.floor(apiPlan.annualPrice / 100),
  monthlyPrice: Math.floor(apiPlan.monthlyPrice / 100),
  billingCycle: "per user/month billed annually",
  monthlyBilling: `$${Math.floor(apiPlan.monthlyPrice / 100)} billed monthly`,
  features: apiPlan.features || [],
  isCurrentPlan,
  colorClass: getColorClass(apiPlan.name),
});

const getColorClass = (planName: string) => {
  const colorMap: Record<string, string> = {
    'Solo Agent': 'bg-[#9C55FF]',
    'Starter Pack': 'bg-[#B347FF]',
    'Growth Pro': 'bg-fuchsia-400',
    'Scale Elite': 'bg-gradient-to-b from-violet-600 via-fuchsia-600 to-fuchsia-200 rotate-45',
  };
  return colorMap[planName] || 'bg-[#7B21BA]';
};

const SubscriptionPlans = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<APIPlan[]>([]);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get('success');
    if (successParam) {
      setSuccessMessage(successParam);
      window.history.replaceState({}, '', window.location.pathname);
    }

    fetchPlans();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [successMessage]);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const fetchedPlans = await plansAPI.getPlans(true); // Include inactive plans
      setPlans(fetchedPlans);
    } catch (error: any) {
      setError(error.message || "Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPlan = (planId: string) => {
    router.push(`/subscription-plans/edit?id=${planId}`);
  };

  const handleCreateNewPlan = () => {
    router.push("/subscription-plans/create");
  };

  const handleToggleStatus = async (planId: string) => {
    try {
      await plansAPI.togglePlanStatus(planId);
      setSuccessMessage("Plan status updated successfully!");
      await fetchPlans();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to update plan status");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      return;
    }

    try {
      await plansAPI.deletePlan(planId);
      setSuccessMessage("Plan deleted successfully!");
      await fetchPlans();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to delete plan");
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
    <div className="mb-8 pt-2 sm:pt-8">
      {successMessage && (
        <div className="mb-6 p-4 bg-green-800/20 border border-green-600 rounded-lg">
          <p className="text-green-400 text-sm">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-800/20 border border-red-600 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={clearMessages}
              className="text-red-400 hover:text-red-300 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <PageHeader
        title="Subscription Plans"
        subtitle="Manage your subscription plans and pricing structure"
        actionButton={{
          label: "Create New Plan",
          onClick: handleCreateNewPlan,
          icon: <Plus className="w-4 h-4" />,
          variant: "primary"
        }}
      />

      {plans.length === 0 ? (
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
          {plans.map((plan) => (
            <div key={plan.id} className="relative group mb-8">
              <div className="absolute -top-2 -right-2 z-10">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plan.isActive
                    ? 'bg-green-600/20 text-green-400 border border-green-600/50'
                    : 'bg-red-600/20 text-red-400 border border-red-600/50'
                }`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col gap-2">
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
                </div>
              </div>

              <PlanCard
                plan={transformPlan(plan)}
                action="Edit Plan"
                onActionClick={() => handleEditPlan(plan.id)}
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
