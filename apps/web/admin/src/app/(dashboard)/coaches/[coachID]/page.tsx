'use client'

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BackTo } from "@nlc-ai/web-shared";
import { AlertBanner, Button } from '@nlc-ai/web-ui';
import { sdkClient } from "@/lib";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  MapPin
} from "lucide-react";
import {ExtendedClient, ExtendedCoach} from "@nlc-ai/sdk-users";
import {Lead} from "@nlc-ai/sdk-leads";


const CoachDetailsSkeleton = () => (
  <div className="py-4 sm:py-6 lg:py-8 space-y-6 animate-pulse">
    <div className="h-6 bg-neutral-700 rounded w-48"></div>
    <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
      <div className="space-y-4">
        <div className="h-8 bg-neutral-700 rounded w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-neutral-700 rounded w-20"></div>
              <div className="h-5 bg-neutral-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-neutral-800/30 rounded-[20px] p-6 space-y-4">
          <div className="h-6 bg-neutral-700 rounded w-32"></div>
          <div className="h-8 bg-neutral-700 rounded w-16"></div>
        </div>
      ))}
    </div>
  </div>
);

const StatCard = ({
                    icon: Icon,
                    title,
                    value,
                    subtitle,
                    color = "text-fuchsia-400"
                  }: {
  icon: any;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) => (
  <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
    <div className="absolute inset-0 opacity-20">
      <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
    </div>

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${color.replace('text-', 'bg-').replace('400', '500/20')} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <h3 className="text-stone-50 text-lg font-medium">{title}</h3>
      </div>

      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && (
        <div className="text-stone-400 text-sm">{subtitle}</div>
      )}
    </div>
  </div>
);

const CoachDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const coachID = params.coachID as string;

  const [coach, setCoach] = useState<ExtendedCoach | null>(null);
  const [clients, setClients] = useState<ExtendedClient[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'leads'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (coachID) {
      loadCoachData();
    }
  }, [coachID]);

  const loadCoachData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [coachData, clientsData, leadsData] = await Promise.all([
        sdkClient.users.coaches.getCoach(coachID),
        sdkClient.users.clients.getClients({}, { coachID }),
        sdkClient.leads.getLeads({}, { coachID })
      ]);

      setCoach(coachData);
      setClients(clientsData.data || []);
      setLeads(leadsData.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load coach data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push('/coaches');
  };

  const handleMakePayment = () => {
    setShowPaymentModal(true);
  };

  if (isLoading) {
    return <CoachDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message={error} onDismiss={() => setError('')} />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message="Coach not found" onDismiss={() => setError('')} />
      </div>
    );
  }

  const currentSubscription = coach.subscriptions?.[0];
  const currentPlan = currentSubscription?.plan?.name || 'No Plan';
  const subscriptionStatus = currentSubscription?.status || 'none';

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Active', color: 'text-green-400' };
      case 'canceled':
        return { text: 'Canceled', color: 'text-red-400' };
      case 'past_due':
        return { text: 'Past Due', color: 'text-yellow-400' };
      case 'trialing':
        return { text: 'Trial', color: 'text-blue-400' };
      case 'none':
        return { text: 'No Subscription', color: 'text-gray-400' };
      default:
        return { text: status, color: 'text-gray-400' };
    }
  };

  const statusDisplay = getStatusDisplay(subscriptionStatus);

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <BackTo onClick={handleBackClick} title="Coach Details" />

      {/* Coach Header Card */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {coach.avatarUrl ? (
                <img
                  src={coach.avatarUrl}
                  alt={`${coach.firstName} ${coach.lastName}`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-fuchsia-400/30"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}

              <div>
                <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed">
                  {coach.firstName} {coach.lastName}
                </h2>
                {coach.businessName && (
                  <p className="text-stone-300 text-lg">{coach.businessName}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    coach.isActive
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {coach.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-500/20 border border-violet-500/30 ${statusDisplay.color}`}>
                    {statusDisplay.text}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleMakePayment}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Make Payment
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-stone-300 text-sm">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <div className="text-stone-50 text-base font-medium">{coach.email}</div>
            </div>

            {coach.phone && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-stone-300 text-sm">
                  <Phone className="w-4 h-4" />
                  Phone
                </div>
                <div className="text-stone-50 text-base font-medium">{coach.phone}</div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-stone-300 text-sm">
                <Calendar className="w-4 h-4" />
                Date Joined
              </div>
              <div className="text-stone-50 text-base font-medium">
                {coach.createdAt ? new Date(coach.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'N/A'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-stone-300 text-sm">
                <Activity className="w-4 h-4" />
                Last Login
              </div>
              <div className="text-stone-50 text-base font-medium">
                {coach.lastLoginAt ? new Date(coach.lastLoginAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Never'}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-stone-300 text-sm">Current Plan</div>
              <div className="text-stone-50 text-base font-medium">{currentPlan}</div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm">Billing Cycle</div>
              <div className="text-stone-50 text-base font-medium">
                {currentSubscription?.billingCycle ?
                  currentSubscription.billingCycle.charAt(0).toUpperCase() + currentSubscription.billingCycle.slice(1) :
                  'N/A'
                }
              </div>
            </div>

            {coach.timezone && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-stone-300 text-sm">
                  <MapPin className="w-4 h-4" />
                  Timezone
                </div>
                <div className="text-stone-50 text-base font-medium">{coach.timezone}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Clients"
          value={coach.clientCount || 0}
          subtitle="Active clients"
          color="text-blue-400"
        />

        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${(coach.totalRevenue || 0).toLocaleString()}`}
          subtitle="Lifetime value"
          color="text-green-400"
        />

        <StatCard
          icon={TrendingUp}
          title="Leads"
          value={leads.length}
          subtitle="Total leads"
          color="text-purple-400"
        />

        <StatCard
          icon={Clock}
          title="Account Age"
          value={coach.createdAt ?
            `${Math.floor((Date.now() - new Date(coach.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days` :
            'N/A'
          }
          subtitle="Since joining"
          color="text-orange-400"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-neutral-800/30 p-1 rounded-lg w-fit">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'clients', label: `Clients (${clients.length})` },
          { key: 'leads', label: `Leads (${leads.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Activity or Business Info */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6">
            <h3 className="text-stone-50 text-xl font-semibold mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coach.websiteUrl && (
                <div>
                  <label className="text-stone-300 text-sm">Website</label>
                  <a href={coach.websiteUrl} target="_blank" rel="noopener noreferrer"
                     className="text-fuchsia-400 hover:text-fuchsia-300 block">
                    {coach.websiteUrl}
                  </a>
                </div>
              )}
              {coach.bio && (
                <div>
                  <label className="text-stone-300 text-sm">Bio</label>
                  <p className="text-stone-50">{coach.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="space-y-4">
          {clients.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              No clients found for this coach
            </div>
          ) : (
            <div className="grid gap-4">
              {clients.map((client) => (
                <div key={client.id}
                     className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-lg border border-neutral-700 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium">{client.firstName} {client.lastName}</h4>
                      <p className="text-stone-400 text-sm">{client.email}</p>
                      <div className="flex gap-4 mt-2 text-sm text-stone-300">
                        <span>Courses: {client.coursesBought}</span>
                        <span>Completed: {client.coursesCompleted}</span>
                        <span>Engagement: {Math.round((client.engagementScore || 0) * 100)}%</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(`/clients/${client.id}`)}
                      variant="outline"
                      className="text-fuchsia-400 border-fuchsia-400/30 hover:bg-fuchsia-400/10"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="space-y-4">
          {leads.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              No leads found for this coach
            </div>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => (
                <div key={lead.id}
                     className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-lg border border-neutral-700 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium">{lead.name}</h4>
                      <p className="text-stone-400 text-sm">{lead.email}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          lead.status === 'converted' ? 'bg-green-500/20 text-green-400' :
                            lead.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                              lead.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                        }`}>
                          {lead.status}
                        </span>
                        {lead.source && <span className="text-stone-300">Source: {lead.source}</span>}
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(`/leads/${lead.id}`)}
                      variant="outline"
                      className="text-fuchsia-400 border-fuchsia-400/30 hover:bg-fuchsia-400/10"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal - You'll need to create this as a separate component */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Make Payment</h3>
            <p className="text-stone-300 mb-6">
              Create payment for {coach.firstName} {coach.lastName}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push(`/coaches/make-payment?coachID=${coach.id}`)}
                className="flex-1 bg-gradient-to-r from-fuchsia-600 to-violet-600"
              >
                Continue to Payment
              </Button>
              <Button
                onClick={() => setShowPaymentModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDetailsPage;
