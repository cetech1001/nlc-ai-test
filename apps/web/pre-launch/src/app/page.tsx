'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  PageBackground,
  HeroSection,
  ExclusiveAccessSection,
  UrgencySection,
  QuizCTASection
} from '@/lib/components';

const Home = () => {
  const router = useRouter();

  const handleStartQuiz = () => {
    router.push('/quiz');
  };

  return (
      <PageBackground>
        <HeroSection />
        <ExclusiveAccessSection />
        <UrgencySection />
        <QuizCTASection onStartQuiz={handleStartQuiz} />
      </PageBackground>
  );
};

export default Home;
