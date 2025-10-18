import React, {FC, useEffect, useState} from "react";
import {DollarSign, Globe, Lock, UserCheck, Users, CreditCard, Calendar, Zap} from "lucide-react";
import { Input, Label } from '@nlc-ai/web-ui';
import {CommunityType, CommunityVisibility, CommunityFormErrors, CreateCommunityForm} from "@nlc-ai/sdk-communities";
import {sdkClient} from "@/lib";
import {toast} from "sonner";
import {ExtendedCoach} from "@nlc-ai/sdk-users";
import {ExtendedCourse} from "@nlc-ai/types";

interface IProps {
  form: CreateCommunityForm;
  errors: CommunityFormErrors;
  updateForm: (field: string, value: any) => void;
}

const communityTypes = [
  {
    value: CommunityType.PRIVATE,
    label: 'Private Community',
    icon: Lock,
    description: 'A private community for specific members'
  },
  {
    value: CommunityType.COACH_CLIENT,
    label: 'Coach-Client',
    icon: Users,
    description: 'Community for a coach and their clients'
  },
  {
    value: CommunityType.COACH_TO_COACH,
    label: 'Coach-to-Coach',
    icon: UserCheck,
    description: 'Professional network for coaches'
  },
  {
    value: CommunityType.COURSE,
    label: 'Course Community',
    icon: Users,
    description: 'Community tied to a specific course'
  },
];

const visibilityOptions = [
  {
    value: CommunityVisibility.PRIVATE,
    label: 'Private',
    icon: Lock,
    description: 'Only members can see and join'
  },
  {
    value: CommunityVisibility.PUBLIC,
    label: 'Public',
    icon: Globe,
    description: 'Anyone can see and join'
  },
  {
    value: CommunityVisibility.INVITE_ONLY,
    label: 'Invite Only',
    icon: UserCheck,
    description: 'Members must be invited'
  },
];

const pricingOptions = [
  {
    value: 'free',
    label: 'Free',
    icon: Users,
    description: 'Community is free to join',
    color: 'text-green-400'
  },
  {
    value: 'monthly',
    label: 'Monthly Subscription',
    icon: Calendar,
    description: 'Recurring monthly payment',
    color: 'text-blue-400'
  },
  {
    value: 'annual',
    label: 'Annual Subscription',
    icon: CreditCard,
    description: 'Recurring annual payment',
    color: 'text-purple-400'
  },
  {
    value: 'one_time',
    label: 'One-Time Payment',
    icon: Zap,
    description: 'Single payment for lifetime access',
    color: 'text-amber-400'
  },
];

export const CommunityTypeAndAccessFormStep: FC<IProps> = (props) => {
  const updatePricing = (field: string, value: any) => {
    props.updateForm('pricing', {
      ...props.form.pricing,
      [field]: value
    });
  };

  const [coaches, setCoaches] = useState<ExtendedCoach[]>([]);
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);

  useEffect(() => {
    fetchCoaches();
    fetchCourses();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await sdkClient.users.coaches.getCoaches();
      setCoaches(response.data);
    } catch (e) {
      console.log("Failed to get coaches: ", e);
      toast.error("Failed to get coaches");
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await sdkClient.courses.getCourses();
      setCourses(response.data);
    } catch (e) {
      console.log("Failed to get coaches: ", e);
      toast.error("Failed to get coaches");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-white text-sm mb-4 block">
          Community Type <span className="text-red-400">*</span>
        </Label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {communityTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.value}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  props.form.type === type.value
                    ? 'border-[#7B21BA] bg-[#7B21BA]/20'
                    : 'border-[#3A3A3A] bg-background hover:bg-[#2A2A2A]'
                }`}
                onClick={() => props.updateForm('type', type.value)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#7B21BA]" />
                  <div>
                    <div className="text-white font-medium">{type.label}</div>
                    <div className="text-[#A0A0A0] text-sm">{type.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-white text-sm mb-4 block">
          Visibility <span className="text-red-400">*</span>
        </Label>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {visibilityOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.value}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  props.form.visibility === option.value
                    ? 'border-[#7B21BA] bg-[#7B21BA]/20'
                    : 'border-[#3A3A3A] bg-background hover:bg-[#2A2A2A]'
                }`}
                onClick={() => props.updateForm('visibility', option.value)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#7B21BA]" />
                  <div>
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-[#A0A0A0] text-sm">{option.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing Options */}
      <div>
        <Label className="text-white text-sm mb-4 block">
          Pricing Model <span className="text-red-400">*</span>
        </Label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pricingOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.value}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  props.form.pricing.type === option.value
                    ? 'border-[#7B21BA] bg-[#7B21BA]/20'
                    : 'border-[#3A3A3A] bg-background hover:bg-[#2A2A2A]'
                }`}
                onClick={() => updatePricing('type', option.value)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${option.color}`} />
                  <div>
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-[#A0A0A0] text-sm">{option.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Price Input - Show only for paid options */}
        {props.form.pricing.type !== 'free' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pricingAmount" className="text-white text-sm">
                {props.form.pricing.type === 'monthly' ? 'Monthly Price ($)' :
                  props.form.pricing.type === 'annual' ? 'Annual Price ($)' :
                    'One-Time Price ($)'} <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
                <Input
                  id="pricingAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={props.form.pricing.amount ? (props.form.pricing.amount / 100).toString() : ''}
                  onChange={(e) => updatePricing('amount', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : 0)}
                  placeholder="0.00"
                  className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 pl-10 ${
                    props.errors['pricing.amount'] ? 'border-red-500' : ''
                  }`}
                />
              </div>
              {props.errors['pricing.amount'] && (
                <p className="text-red-400 text-sm">{props.errors['pricing.amount']}</p>
              )}
              <p className="text-[#A0A0A0] text-xs">
                {props.form.pricing.type === 'monthly' ? 'Amount charged every month' :
                  props.form.pricing.type === 'annual' ? 'Amount charged every year' :
                    'One-time payment for lifetime access'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricingCurrency" className="text-white text-sm">
                Currency
              </Label>
              <select
                id="pricingCurrency"
                value={props.form.pricing.currency || 'USD'}
                onChange={(e) => updatePricing('currency', e.target.value)}
                className="w-full bg-background border border-[#3A3A3A] text-white rounded-lg px-3 py-3 focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Conditional Fields */}
      {(props.form.type === CommunityType.COACH_CLIENT || props.form.type === CommunityType.COURSE) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {props.form.type === CommunityType.COACH_CLIENT && (
            <div className="space-y-2">
              <Label htmlFor="coachID" className="text-white text-sm">
                Select Coach <span className="text-red-400">*</span>
              </Label>
              <Input
                id="coachID"
                list="coaches"
                value={props.form.coachID}
                onChange={(e) => props.updateForm('coachID', e.target.value)}
                placeholder="Search and select a coach..."
                className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                  props.errors.coachID ? 'border-red-500' : ''
                }`}
              />
              <datalist id="coaches">
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.firstName} {coach.lastName}
                  </option>
                ))}
              </datalist>
              {props.errors.coachID && (
                <p className="text-red-400 text-sm">{props.errors.coachID}</p>
              )}
            </div>
          )}

          {props.form.type === CommunityType.COURSE && (
            <div className="space-y-2">
              <Label htmlFor="courseID" className="text-white text-sm">
                Select Course <span className="text-red-400">*</span>
              </Label>
              <Input
                id="courseID"
                list="courses"
                value={props.form.courseID}
                onChange={(e) => props.updateForm('courseID', e.target.value)}
                placeholder="Search and select a course..."
                className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                  props.errors.courseID ? 'border-red-500' : ''
                }`}
              />
              <datalist id="courses">
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </datalist>
              {props.errors.courseID && (
                <p className="text-red-400 text-sm">{props.errors.courseID}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
