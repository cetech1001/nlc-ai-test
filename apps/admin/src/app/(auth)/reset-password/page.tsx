'use client';

import { Suspense } from 'react';
import { AdminResetPasswordContent } from './content';

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-[#F9F9F9]">Loading...</div>
      </div>
    }>
      <AdminResetPasswordContent />
    </Suspense>
  );
}
