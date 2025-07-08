'use client';

import { Suspense } from 'react';
import { CoachResetPasswordContent } from './content';
import { ResetPasswordSkeleton } from '@nlc-ai/auth';

const CoachResetPasswordPage = () => {
  return (
    <Suspense fallback={<ResetPasswordSkeleton/>}>
      <CoachResetPasswordContent />
    </Suspense>
  );
}

export default CoachResetPasswordPage;
