'use client';

import { Suspense } from 'react';
import { ResetPasswordSkeleton } from '@nlc-ai/auth';
import { AdminResetPasswordContent } from './content';

const AdminResetPasswordPage = () => {
  return (
    <Suspense fallback={<ResetPasswordSkeleton/>}>
      <AdminResetPasswordContent />
    </Suspense>
  );
}

export default AdminResetPasswordPage;
