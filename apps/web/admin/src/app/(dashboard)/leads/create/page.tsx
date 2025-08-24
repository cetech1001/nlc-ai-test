'use client'

import {useState} from "react";
import { useRouter } from 'next/navigation';
import { LeadFormData } from '@nlc-ai/types';
import {sdkClient, LeadForm, AutomationPreview} from "@/lib";
import { BackTo } from "@nlc-ai/web-shared";
import {LeadStatus} from "@nlc-ai/sdk-leads";

const AdminCreateLeadPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState(LeadStatus.CONVERTED);

  const handleSubmit = async (formData: LeadFormData) => {
    const submitData = {
      ...formData,
      meetingDate: formData.meetingDate || undefined,
      meetingTime: formData.meetingTime || undefined,
    };

    await sdkClient.leads.createLead(submitData);
    router.push('/leads?success=created');
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <BackTo title={'Add New Plan'} onClick={router.back} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LeadForm
            onDiscard={router.back}
            onSave={handleSubmit}
            setStatus={setStatus}
          />
        </div>

        <AutomationPreview status={status}/>
      </div>
    </div>
  );
}

export default AdminCreateLeadPage;
