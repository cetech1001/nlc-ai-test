'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@nlc-ai/web-ui';
import { ExtendedCoach, CreateCoach } from "@nlc-ai/sdk-users";
import { sdkClient, CoachForm } from "@/lib";
import { BackTo } from "@nlc-ai/web-shared";

const AdminEditCoachPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const coachID = searchParams.get('coachID');

  const [coach, setCoach] = useState<ExtendedCoach | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (() => fetchCoach())();
  }, [coachID]);

  const fetchCoach = async () => {
    try {
      if (!coachID) {
        setErrors({ coachID: "No Coach ID provided" });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const coachData = await sdkClient.users.coaches.getCoach(coachID);
      setCoach(coachData);
    } catch (error: any) {
      setErrors({ fetch: error.message || 'Failed to load coach' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: CreateCoach) => {
    await sdkClient.users.coaches.updateCoach(coachID!, formData);
    router.push('/coaches?success=updated');
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-[#2A2A2A] rounded w-1/3"></div>
          <div className="space-y-6">
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
      <BackTo title={'Edit Coach'} onClick={router.back} />

      <div className="max-w-4xl">
        <CoachForm
          onDiscard={router.back}
          onSave={handleSubmit}
          coach={coach}
        />
      </div>
    </div>
  );
}

export default AdminEditCoachPage;
