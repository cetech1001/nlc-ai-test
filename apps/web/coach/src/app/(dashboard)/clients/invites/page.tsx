'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import {Link, Search} from "lucide-react";
import {
  Pagination,
  PageHeader,
  DataFilter,
  MobilePagination,
  DataTable,
} from "@nlc-ai/web-shared";
import { AlertBanner, Button } from '@nlc-ai/web-ui';
import { FilterValues } from "@nlc-ai/types";
import {
  clientInviteColumns,
  clientInviteFilters, clientInviteMobileConfig,
  emptyClientInviteFilterValues,
  InviteClientModal,
  sdkClient
} from "@/lib";
import { useAuth } from "@nlc-ai/web-auth";

const ClientInvitesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [clientInvites, setClientInvites] = useState<any[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>(emptyClientInviteFilterValues);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const clientsPerPage = 10;

  useEffect(() => {
    const success = searchParams.get('success');
    if (success) {
      setSuccessMessage(success);
      router.replace(window.location.href, {});
    }
  }, [searchParams]);

  useEffect(() => {
    (() => fetchClientInvites())();
  }, [currentPage, searchQuery, filterValues]);

  const fetchClientInvites = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await sdkClient.users.relationship.getClientInvites({
        page: currentPage,
        limit: clientsPerPage,
        search: searchQuery || undefined
      }, filterValues);

      setClientInvites(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || "Failed to load client invites");
    } finally {
      setIsLoading(false);
    }
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
    setFilterValues(emptyClientInviteFilterValues);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const handleRowAction = async (action: string, id: string) => {
    if (action === 'resend') {
      const data = await sdkClient.users.relationship.resendClientInvite(id);
      setSuccessMessage(data.message);
      await fetchClientInvites();
    } else if (action === 'delete') {
      const data = await sdkClient.users.relationship.deleteClientInvite(id);
      setSuccessMessage(data.message);
      await fetchClientInvites();
    }
  };

  const onInviteSuccess = () => {
    setSuccessMessage(`Invitation sent successfully!`);
    fetchClientInvites();
  }

  return (
    <div className={`flex flex-col ${(isFilterOpen) && 'bg-[rgba(7, 3, 0, 0.3)] blur-[20px]'}`}>
      <div className="flex-1 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full sm:overflow-hidden">
        {successMessage && (
          <AlertBanner type="success" message={successMessage} onDismiss={clearMessages}/>
        )}

        {error && (
          <AlertBanner type="error" message={error} onDismiss={clearMessages}/>
        )}

        <PageHeader title="Client Invites List">
          <>
            <div className="relative bg-transparent rounded-xl border border-white/50 px-5 py-2.5 flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                placeholder="Search client invites using email"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-base font-normal leading-tight outline-none"
              />
              <Search className="w-5 h-5 text-white" />
            </div>

            <DataFilter
              filters={clientInviteFilters}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              setIsFilterOpen={setIsFilterOpen}
            />

            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors hidden sm:flex"
            >
              <span className="w-4 h-4 mr-2">
                <Link className="w-4 h-4" />
              </span>
              Invite Client
            </Button>
          </>
        </PageHeader>

        <div className={"grid grid-cols-2 gap-4 sm:hidden"}>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white rounded-lg transition-colors"
          >
            <span className="w-4 h-4 mr-2">
              <Link className="w-4 h-4" />
            </span>
            Invite Client
          </Button>
        </div>

        <DataTable
          columns={clientInviteColumns}
          data={clientInvites}
          onRowAction={handleRowAction}
          showMobileCards={true}
          emptyMessage="No client invites found matching your criteria"
          isLoading={isLoading}
          mobileConfig={clientInviteMobileConfig}
        />

        <Pagination
          totalPages={pagination.totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isLoading={isLoading}
        />

        {!isLoading && clientInvites.length > 0 && (
          <MobilePagination pagination={pagination}/>
        )}
      </div>
      <InviteClientModal
        isOpen={showInviteModal}
        userID={user?.id || ''}
        onClose={() => setShowInviteModal(false)}
        onInviteSuccess={onInviteSuccess}
      />
    </div>
  );
}

export default ClientInvitesPage;
