'use client'

import { useEffect, useState } from 'react';
import {useParams, useRouter} from 'next/navigation';
import { Button } from '@nlc-ai/web-ui';
import {AlertTriangle} from 'lucide-react';
import {Lead, LeadFormData, LeadStatus} from "@nlc-ai/sdk-leads";
import {sdkClient, LeadForm, AutomationPreview, getStatusAutomation} from "@/lib";
import { BackTo } from "@nlc-ai/web-shared";

const statusOptions = [
  {
    value: LeadStatus.CONTACTED,
    label: 'Not Converted',
    color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
    bgColor: 'from-yellow-600/10 to-orange-600/10 border-yellow-600/20'
  },
  {
    value: LeadStatus.SCHEDULED,
    label: 'Scheduled',
    color: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    bgColor: 'from-blue-600/10 to-cyan-600/10 border-blue-600/20'
  },
  {
    value: LeadStatus.CONVERTED,
    label: 'Converted',
    color: 'bg-green-600/20 text-green-400 border-green-600/30',
    bgColor: 'from-green-600/10 to-emerald-600/10 border-green-600/20'
  },
  {
    value: LeadStatus.UNRESPONSIVE,
    label: 'No Show',
    color: 'bg-red-600/20 text-red-400 border-red-600/30',
    bgColor: 'from-red-600/10 to-pink-600/10 border-red-600/20'
  },
];

const AdminEditLeadPage = () => {
  const router = useRouter();
  const params = useParams();

  const leadID = params.leadID as string;

  const [lead, setLead] = useState<Lead | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState(LeadStatus.CONVERTED);
  const [originalStatus, setOriginalStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusChange, setShowStatusChange] = useState(false);

  useEffect(() => {
    (() => fetchLead())();
  }, [leadID]);

  const fetchLead = async () => {
    try {
      if (!leadID) {
        setErrors({ leadID: "No Lead ID provided" });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const leadData = await sdkClient.leads.getLead(leadID);
      setLead(leadData);
      setOriginalStatus(leadData.status);


    } catch (error: any) {
      setErrors({ fetch: error.message || 'Failed to load lead' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: LeadFormData) => {
    const submitData = {
      ...formData,
      meetingDate: formData.meetingDate || undefined,
      meetingTime: formData.meetingTime || undefined,
    };

    await sdkClient.leads.updateLead(leadID || '', submitData);
    router.push('/leads?success=updated');
  };

  const currentAutomation = getStatusAutomation(status);
  const originalAutomation = getStatusAutomation(originalStatus);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-[#2A2A2A] rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-[#2A2A2A] rounded-2xl"></div>
            </div>
            <div className="h-96 bg-[#2A2A2A] rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-4">{errors.fetch}</div>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <BackTo title={'Edit Plan'} onClick={router.back} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {/* Status Change Warning */}
          {showStatusChange && (
            <div className={`p-4 bg-gradient-to-br ${statusOptions.find(s => s.value === status)?.bgColor} border rounded-xl mb-8`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium mb-1">Status Change Detected</h4>
                  <p className="text-[#A0A0A0] text-sm mb-3">
                    Changing status from <span className="text-white font-medium">{originalAutomation.title}</span> to{' '}
                    <span className="text-white font-medium">{currentAutomation.title}</span>
                  </p>
                  <div className="bg-[#1A1A1A]/50 rounded-lg p-3">
                    <p className="text-yellow-400 text-sm font-medium mb-1">⚡ Auto-Trigger:</p>
                    <p className="text-[#A0A0A0] text-sm">{currentAutomation.triggerNote}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <LeadForm
            setStatus={setStatus}
            onDiscard={router.back}
            onSave={handleSubmit}
            lead={lead}
            setShowStatusChange={setShowStatusChange}
          />
        </div>

        <AutomationPreview status={status} lead={lead} showStatusChange={showStatusChange}/>
      </div>
    </div>
  );
}

export default AdminEditLeadPage;
