'use client';

import React, { Suspense } from 'react';
import {ResultsPageContent} from './content';
import {PageBackground, ResultsSkeleton} from "@/lib";

const ResultsPage = () => {
  return (
    <PageBackground>
      <div className="glow-orb -top-72 -right-72 sm:-top-96 sm:-right-96 opacity-70" />
      <div className="glow-orb glow-orb--purple -bottom-72 -left-72 sm:-bottom-96 sm:-left-96 opacity-70" />
      <Suspense fallback={<ResultsSkeleton/>}>
        <ResultsPageContent />
      </Suspense>
    </PageBackground>
  );
}

export default ResultsPage;
