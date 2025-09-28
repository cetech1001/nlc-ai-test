'use client'

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClientForm } from "@/lib/components/clients/client-form";
import {ClientFormSkeleton, sdkClient} from "@/lib";
import { formatDate } from "@nlc-ai/web-utils";
import { BackTo } from "@nlc-ai/web-shared";
import { User, CheckCircle } from "lucide-react";
import {ExtendedClient, ClientFormData} from "@nlc-ai/sdk-users";

const EditClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientID = searchParams.get('clientID');

  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [originalClient, setOriginalClient] = useState<ExtendedClient | null>(null);

  useEffect(() => {
    if (!clientID) {
      router.push("/clients");
      return;
    }

    (() => loadClient(clientID))();
  }, [clientID, router]);

  const loadClient = async (id: string) => {
    try {
      setIsLoadingClient(true);
      const client = await sdkClient.users.clients.getClient(id);
      setOriginalClient(client);
    } finally {
      setIsLoadingClient(false);
    }
  };

  const handleEditClient = async (requestData: ClientFormData) => {
    if (clientID) {
      await sdkClient.users.clients.updateClient(clientID, requestData);
      router.push("/clients?success=Client updated successfully");
    }
  };

  const handleDiscard = () => {
    router.push("/clients");
  };

  const handleBackToClients = () => {
    handleDiscard();
  };

  if (isLoadingClient) {
    return <ClientFormSkeleton title="Edit Client" onBack={handleBackToClients} />;
  }

  if (!originalClient) {
    return (
      <main className="flex-1 pt-2 sm:pt-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">Client not found</div>
          <button
            onClick={() => router.push("/clients")}
            className="text-[#7B21BA] hover:text-[#8B31CA] underline"
          >
            Back to Clients
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pt-2 sm:pt-8">
      <BackTo title={'Edit Client'} onClick={handleBackToClients} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <ClientForm
            type="edit"
            originalClient={originalClient}
            onAction={handleEditClient}
            onDiscard={handleDiscard}
          />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-emerald-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

            <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6 overflow-hidden">
              <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
              <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Client Summary</h3>
                    <p className="text-[#A0A0A0] text-sm">Current progress & stats</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {originalClient?.coursesBought || 0}
                        </div>
                        <div className="text-[#A0A0A0] text-xs">Courses Bought</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {originalClient?.coursesCompleted || 0}
                        </div>
                        <div className="text-[#A0A0A0] text-xs">Completed</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
                    <div className="text-[#A0A0A0] text-xs font-medium mb-2">MEMBER SINCE</div>
                    <div className="text-white text-sm">
                      {originalClient && new Date(originalClient.createdAt!).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {originalClient?.lastInteractionAt && (
                    <div className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
                      <div className="text-[#A0A0A0] text-xs font-medium mb-2">LAST INTERACTION</div>
                      <div className="text-white text-sm">
                        {new Date(originalClient.lastInteractionAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-400 text-sm font-medium">Currently Active</span>
                    </div>
                    <p className="text-[#A0A0A0] text-xs">
                      This client is actively engaged in your programs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>

            <div className="relative bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6 overflow-hidden">
              <div className="absolute w-56 h-56 right-12 -top-20 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="text-white text-sm">Joined Program</div>
                      <div className="text-[#A0A0A0] text-xs">
                        {originalClient && formatDate(originalClient.createdAt!)}
                      </div>
                    </div>
                  </div>

                  {originalClient?.courseEnrollments && originalClient.courseEnrollments.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="text-white text-sm">Course Enrollment</div>
                        <div className="text-[#A0A0A0] text-xs">
                          Latest: {originalClient.courseEnrollments[0]?.course?.title || 'Course enrolled'}
                        </div>
                      </div>
                    </div>
                  )}

                  {originalClient?.emailThreadsCount && originalClient.emailThreadsCount > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-[#1A1A1A]/50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="text-white text-sm">Email Communication</div>
                        <div className="text-[#A0A0A0] text-xs">
                          {originalClient.emailThreadsCount} active thread{originalClient.emailThreadsCount > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditClient;
