'use client'

import { useParams } from "next/navigation";
import {LeadDetails} from "@/lib";

export default function AdminLeadDetailPage() {
  const params = useParams();
  const leadID = params.leadID as string;

  return (
    <LeadDetails
      leadID={leadID}
      isAdminView={true}
      backUrl="/leads"
      backTitle="Lead Details"
    />
  );
}
