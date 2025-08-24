'use client'

import { useRouter } from 'next/navigation';
import { CreateCoach } from '@nlc-ai/sdk-users';
import { sdkClient, CoachForm } from "@/lib";
import { BackTo } from "@nlc-ai/web-shared";

const AdminCreateCoachPage = () => {
  const router = useRouter();

  const handleSubmit = async (formData: CreateCoach) => {
    await sdkClient.users.coaches.createCoach(formData);
    router.push('/coaches?success=created');
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <BackTo title={'Add New Coach'} onClick={router.back} />

      <div className="max-w-4xl">
        <CoachForm
          onDiscard={router.back}
          onSave={handleSubmit}
        />
      </div>
    </div>
  );
}

export default AdminCreateCoachPage;
