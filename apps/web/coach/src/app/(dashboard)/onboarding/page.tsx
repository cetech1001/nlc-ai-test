'use client'

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import {WelcomeStep, ScenariosStep, DocumentsStep, ConnectionsStep, ReviewCompleteStep} from "@/lib";
import {appConfig} from "@nlc-ai/web-shared";
import {useRouter} from "next/navigation";
import {sdkClient} from "@/lib";
import {useAuth} from "@nlc-ai/web-auth";
import type { OnboardingData, ScenarioAnswer, UploadedDocument, ConnectedAccount } from '@nlc-ai/types';

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'scenarios', title: 'Your Coaching Style', component: ScenariosStep },
  { id: 'documents', title: 'Upload Materials', component: DocumentsStep },
  { id: 'connections', title: 'Connect Accounts', component: ConnectionsStep },
  { id: 'review', title: 'Review & Complete', component: ReviewCompleteStep }
];

const OnboardingContainer = () => {
  const router = useRouter();
  const { user } = useAuth();

  if (appConfig.features.enableLanding) {
    // router.push('/vault');
  }

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Onboarding data state
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    scenarios: [],
    documents: [],
    connections: [],
  });

  // Load any existing onboarding progress
  useEffect(() => {
    if (user) {
      loadOnboardingProgress();
    }
  }, [user]);

  const loadOnboardingProgress = async () => {
    try {
      const status = await sdkClient.agents.onboarding.getStatus();
      if (status.isComplete) {
        // If already complete, redirect to dashboard
        // router.push('/home');
      }
      // Load any saved progress here if you implement a load progress endpoint
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    }
  };

  const updateScenarios = (scenarios: ScenarioAnswer[]) => {
    setOnboardingData(prev => ({
      ...prev,
      scenarios,
    }));
  };

  const updateDocuments = (documents: UploadedDocument[]) => {
    setOnboardingData(prev => ({
      ...prev,
      documents,
    }));
  };

  const updateConnections = (connections: ConnectedAccount[]) => {
    setOnboardingData(prev => ({
      ...prev,
      connections,
    }));
  };

  const saveProgress = async () => {
    try {
      await sdkClient.agents.onboarding.saveProgress(onboardingData);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      const result = await sdkClient.agents.onboarding.complete({
        ...onboardingData,
        completedAt: new Date(),
      });

      if (result.success) {
        // Redirect to dashboard or chat
        router.push('/chat');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  };

  const renderComponent = (currentStep: number) => {
    const StepComponent = ONBOARDING_STEPS[currentStep].component;

    const stepProps = {
      onComplete: handleNext,
      onContinue: handleNext,
    };

    // Pass specific props based on step
    if (currentStep === 1) { // Scenarios
      return (
        <ScenariosStep
          {...stepProps}
          data={onboardingData}
          onUpdate={updateScenarios}
        />
      );
    } else if (currentStep === 2) { // Documents
      return (
        <DocumentsStep
          {...stepProps}
          data={onboardingData}
          onUpdate={updateDocuments}
        />
      );
    } else if (currentStep === 3) { // Connections
      return (
        <ConnectionsStep
          {...stepProps}
          data={onboardingData}
          onUpdate={updateConnections}
        />
      );
    } else if (currentStep === 4) { // Review
      return (
        <ReviewCompleteStep
          {...stepProps}
          data={onboardingData}
          onComplete={completeOnboarding}
        />
      );
    }

    return <StepComponent {...stepProps} />;
  };

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }

      // Save progress when moving to next step
      await saveProgress();

      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const isStepAccessible = (stepIndex: number) => {
    return stepIndex <= currentStep || completedSteps.includes(stepIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute w-96 h-96 -left-20 top-40 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[120px]" />
      <div className="absolute w-96 h-96 -right-20 bottom-40 opacity-20 bg-gradient-to-l from-purple-600 via-fuchsia-400 to-violet-600 rounded-full blur-[120px]" />

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {ONBOARDING_STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              const isCurrent = currentStep === index;
              const isAccessible = isStepAccessible(index);

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => handleStepClick(index)}
                    disabled={!isAccessible}
                    className={`flex flex-col items-center gap-3 transition-all ${
                      isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 border-transparent'
                          : isCurrent
                            ? 'bg-neutral-800 border-purple-500'
                            : 'bg-neutral-800 border-neutral-700'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <span className={`text-sm font-semibold ${isCurrent ? 'text-white' : 'text-stone-400'}`}>
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium text-center max-w-[100px] ${
                        isCurrent ? 'text-white' : 'text-stone-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>

                  {index < ONBOARDING_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-all ${
                        completedSteps.includes(index)
                          ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600'
                          : 'bg-neutral-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-8 md:p-12">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {ONBOARDING_STEPS[currentStep].title}
              </h1>
              <div className="text-stone-400">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </div>
            </div>

            {/* Step content */}
            <div className="min-h-[400px] flex items-center justify-center">
              {renderComponent(currentStep)}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-neutral-700">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border border-neutral-600 transition-all ${
                  currentStep === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-neutral-800 text-white'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={currentStep === ONBOARDING_STEPS.length - 1}
                className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition-all ${
                  currentStep === ONBOARDING_STEPS.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingContainer;
