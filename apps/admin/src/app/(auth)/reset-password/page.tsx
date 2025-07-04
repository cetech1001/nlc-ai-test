'use client';

import { Suspense } from 'react';
import { AdminResetPasswordContent } from './content';
import { Skeleton } from '@nlc-ai/ui';

const ResetPasswordSkeleton = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-8 w-24 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton/>}>
      <AdminResetPasswordContent />
    </Suspense>
  );
}
