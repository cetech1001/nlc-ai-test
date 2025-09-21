import React, { useState, useEffect } from 'react';
import { PricingCard, OneTimeForm, SubscriptionForm, MonthlyPlanForm } from "./partials";
import type { ExtendedCourse } from '@nlc-ai/sdk-courses';
import { sdkClient } from '@/lib';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

type PricingOption = 'free' | 'one-time' | 'subscription' | 'monthly';

interface PaymentFormData {
  oneTimePrice: string;
  subscriptionPrice: string;
  subscriptionFrequency: string;
  monthlyInstallments: string;
  monthlyAmount: string;
  enrollmentDuration: string;
  enrollmentDurationUnit: string;
}

interface PaywallTabProps {
  course: ExtendedCourse | null;
  onCourseUpdate?: (updatedCourse: ExtendedCourse) => void;
}

export const PaywallTab: React.FC<PaywallTabProps> = ({ course, onCourseUpdate }) => {
  const [selectedOption, setSelectedOption] = useState<PricingOption>('one-time');
  const [formData, setFormData] = useState<PaymentFormData>({
    oneTimePrice: '2000',
    subscriptionPrice: '97',
    subscriptionFrequency: 'monthly',
    monthlyInstallments: '3',
    monthlyAmount: '667',
    enrollmentDuration: '',
    enrollmentDurationUnit: 'months'
  });
  // const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize form data from course
  useEffect(() => {
    if (course) {
      // Determine pricing option based on course data
      if (course.price === 0 || course.price === null) {
        setSelectedOption('free');
      } else if (course.allowInstallments && course.installmentCount) {
        setSelectedOption('monthly');
      } else if (course.allowSubscriptions && course.monthlyPrice) {
        setSelectedOption('subscription');
      } else {
        setSelectedOption('one-time');
      }

      // Set form data from course
      setFormData(prev => ({
        ...prev,
        oneTimePrice: course.price?.toString() || '2000',
        subscriptionPrice: course.monthlyPrice?.toString() || '97',
        monthlyInstallments: course.installmentCount?.toString() || '3',
        monthlyAmount: course.installmentAmount?.toString() || '667'
      }));
    }
  }, [course]);

  const handleSave = async () => {
    if (!course) return;

    setIsSaving(true);
    setError('');

    try {
      let updateData: any = {
        allowInstallments: false,
        allowSubscriptions: false,
        price: null,
        monthlyPrice: null,
        installmentCount: null,
        installmentAmount: null,
        installmentInterval: null
      };

      switch (selectedOption) {
        case 'free':
          updateData.price = 0;
          break;

        case 'one-time':
          const oneTimePrice = parseFloat(formData.oneTimePrice);
          if (isNaN(oneTimePrice) || oneTimePrice <= 0) {
            throw new Error('Please enter a valid one-time price');
          }
          updateData.price = oneTimePrice;
          break;

        case 'subscription':
          const subscriptionPrice = parseFloat(formData.subscriptionPrice);
          if (isNaN(subscriptionPrice) || subscriptionPrice <= 0) {
            throw new Error('Please enter a valid subscription price');
          }
          updateData.allowSubscriptions = true;
          updateData.monthlyPrice = subscriptionPrice;
          updateData.price = subscriptionPrice; // Set base price for display
          break;

        case 'monthly':
          const totalPrice = parseFloat(formData.oneTimePrice);
          const installments = parseInt(formData.monthlyInstallments);
          if (isNaN(totalPrice) || totalPrice <= 0) {
            throw new Error('Please enter a valid total price');
          }
          if (isNaN(installments) || installments <= 1) {
            throw new Error('Please select a valid number of installments');
          }

          const installmentAmount = Math.ceil(totalPrice / installments);
          updateData.allowInstallments = true;
          updateData.price = totalPrice;
          updateData.installmentCount = installments;
          updateData.installmentAmount = installmentAmount;
          updateData.installmentInterval = 'month';
          break;
      }

      // Update course settings
      const updatedCourse = await sdkClient.courses.updateCourse(course.id, updateData);

      // Update paywall settings if needed
      const paywallSettings = {
        isEnabled: selectedOption !== 'free',
        pricingType: selectedOption === 'subscription' ? 'recurring' :
          selectedOption === 'monthly' ? 'installment' : 'one_time',
        // Add preview content settings if needed
        previewContent: {
          freeChapterIds: [],
          freeLessonIds: [],
          previewMessage: selectedOption === 'free' ? 'This course is free to access' :
            'Subscribe to access the full course content'
        }
      };

      try {
        await sdkClient.courses.paywall.updatePaywallSettings(course.id, paywallSettings);
      } catch (paywallError) {
        // Paywall settings update failed, but course update succeeded
        console.warn('Paywall settings update failed:', paywallError);
      }

      toast.success('Pricing settings saved successfully');

      // Notify parent component of the update
      if (onCourseUpdate) {
        onCourseUpdate(updatedCourse);
      }

    } catch (error: any) {
      console.error('Error saving paywall settings:', error);
      setError(error.message || 'Failed to save pricing settings');
      toast.error(error.message || 'Failed to save pricing settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-calculate monthly amount when installments or price changes
    if (field === 'monthlyInstallments' || field === 'oneTimePrice') {
      const price = field === 'oneTimePrice' ? parseFloat(value) : parseFloat(formData.oneTimePrice);
      const installments = field === 'monthlyInstallments' ? parseInt(value) : parseInt(formData.monthlyInstallments);

      if (!isNaN(price) && !isNaN(installments) && installments > 0) {
        const amount = Math.ceil(price / installments);
        setFormData(prev => ({ ...prev, monthlyAmount: amount.toString() }));
      }
    }
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading course data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative z-10 max-h-full overflow-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-white text-xl font-semibold">Pricing Options</h3>
          <p className="text-white/60 text-sm">Configure how students will access your course</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity self-start disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </div>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm flex-1">{error}</p>
        </div>
      )}

      {/* Glow orbs for theme consistency */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-gradient-to-br from-purple-400/15 to-violet-500/15 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute bottom-32 left-8 w-16 h-16 bg-gradient-to-br from-fuchsia-400/10 to-purple-500/10 rounded-full blur-lg pointer-events-none"></div>

      <div className="flex flex-col items-start gap-6 self-stretch">
        <PricingCard
          title="Free"
          description="Offer free content to your subscribers. Optionally, you can set an enrollment duration that will limit the time students have access to your content."
          isSelected={selectedOption === 'free'}
          onSelect={() => setSelectedOption('free')}
        />

        <PricingCard
          title="One-time payment"
          description="Charge students a one-time fee to access the content. Optionally, you can set an enrollment duration that will limit the time students have access to your content."
          isSelected={selectedOption === 'one-time'}
          onSelect={() => setSelectedOption('one-time')}
        >
          <OneTimeForm
            formData={formData}
            handleFormChange={handleFormChange}
          />
        </PricingCard>

        <PricingCard
          title="Subscription / Membership"
          description="Charge students recurring monthly fee for access to course content"
          isSelected={selectedOption === 'subscription'}
          onSelect={() => setSelectedOption('subscription')}
        >
          <SubscriptionForm
            formData={formData}
            handleFormChange={handleFormChange}
          />
        </PricingCard>

        <PricingCard
          title="Monthly Payment Plan"
          description="Divide the full price of your course into monthly payments"
          isSelected={selectedOption === 'monthly'}
          onSelect={() => setSelectedOption('monthly')}
        >
          <MonthlyPlanForm
            formData={formData}
            handleFormChange={handleFormChange}
          />
        </PricingCard>
      </div>

      {/* Current Course Pricing Summary */}
      <div className="mt-8 p-4 bg-gradient-to-br from-[rgba(38,38,38,0.3)] to-[rgba(19,19,19,0.3)] border border-[#2B2A2A] rounded-[20px]">
        <h4 className="text-white font-semibold text-lg mb-3">Current Course Pricing</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-white/70">Pricing Type</span>
            <span className="text-white font-medium">
              {course.allowSubscriptions ? 'Subscription' :
                course.allowInstallments ? 'Installments' :
                  course.price === 0 ? 'Free' : 'One-time'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white/70">Price</span>
            <span className="text-white font-medium">
              {course.price === 0 ? 'Free' :
                course.allowSubscriptions ? `${course.monthlyPrice}/month` :
                  course.allowInstallments ?
                    `${course.installmentAmount}/month × ${course.installmentCount}` :
                    `${course.price}`}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white/70">Status</span>
            <span className={`font-medium ${course.isPublished ? 'text-green-400' : 'text-yellow-400'}`}>
              {course.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
