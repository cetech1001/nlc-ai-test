'use client'

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@nlc-ai/web-ui';
import { ArrowLeft, Save } from 'lucide-react';
import { CreateCoach } from '@nlc-ai/sdk-users';
import { sdkClient, CoachForm } from "@/lib";

const initialFormData: CreateCoach = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  businessName: '',
  websiteUrl: '',
  timezone: '',
  bio: '',
};

const AdminCreateCoachPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateCoach>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateCoach, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.websiteUrl && !/^https?:\/\/.+/.test(formData.websiteUrl)) {
      newErrors.websiteUrl = 'Please enter a valid URL (must start with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await sdkClient.users.coaches.createCoach(formData);
      router.push('/coaches?success=created');
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create coach' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Add New Coach</h1>
          <p className="text-[#A0A0A0] mt-1">Create a new coach profile and account</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <CoachForm
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            onInputChange={handleInputChange}
          />

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-800/20 border border-red-600 rounded-lg">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Create Coach
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminCreateCoachPage;
