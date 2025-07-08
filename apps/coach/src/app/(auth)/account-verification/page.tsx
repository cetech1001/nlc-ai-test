'use client';

import { Suspense } from 'react';
import { CoachAccountVerificationContent } from './content';
import { AccountVerificationSkeleton } from '@nlc-ai/auth';

const CoachAccountVerificationPage = () => {
  return (
    <Suspense fallback={<AccountVerificationSkeleton/>}>
      <CoachAccountVerificationContent />
    </Suspense>
  );
}

export default CoachAccountVerificationPage;
