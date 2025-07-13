'use client';

import { Suspense } from 'react';
import { AccountVerificationSkeleton } from '@nlc-ai/auth';
import { AdminAccountVerificationContent } from './content';

const AdminAccountVerificationPage = () => {
  return (
    <Suspense fallback={<AccountVerificationSkeleton/>}>
      <AdminAccountVerificationContent />
    </Suspense>
  );
}

export default AdminAccountVerificationPage;
