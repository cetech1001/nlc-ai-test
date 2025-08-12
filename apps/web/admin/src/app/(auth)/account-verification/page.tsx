'use client';

import { Suspense } from 'react';
import { AccountVerificationSkeleton } from '@nlc-ai/web-auth';
import { AdminAccountVerificationContent } from './content';

const AdminAccountVerificationPage = () => {
  return (
    <Suspense fallback={<AccountVerificationSkeleton/>}>
      <AdminAccountVerificationContent />
    </Suspense>
  );
}

export default AdminAccountVerificationPage;
