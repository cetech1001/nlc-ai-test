import {DollarSign, Globe, Lock, UserCheck, Users} from "lucide-react";
import { Input, Label } from '@nlc-ai/web-ui';
import {CommunityType, CommunityVisibility} from "@nlc-ai/sdk-community";
import React, {FC} from "react";
import {CommunityFormErrors, CreateCommunityForm} from "@/lib";

interface IProps {
  form: CreateCommunityForm;
  errors: CommunityFormErrors;
  updateForm: (field: string, value: string) => void;
}

// Mock data for coaches and courses - replace with actual data
const coaches = [
  { id: 'coach-1', name: 'John Smith' },
  { id: 'coach-2', name: 'Sarah Johnson' },
  { id: 'coach-3', name: 'Mike Wilson' },
];

const courses = [
  { id: 'course-1', name: 'Leadership Fundamentals' },
  { id: 'course-2', name: 'Advanced Communication' },
  { id: 'course-3', name: 'Team Building Mastery' },
];

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

export const CommunityTypeAndAccessFormStep: FC<IProps> = (props) => {
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

      {/* Paid Community Option */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Label className="text-white text-sm">Pricing</Label>
          <button
            type="button"
            onClick={() => props.updateForm('isPaid', Boolean(!props.form.isPaid).toString())}
            className={`w-16 p-1 rounded-[100px] border transition-colors ${
              props.form.isPaid
                ? "bg-fuchsia-400 border-fuchsia-400 justify-end"
                : "bg-stone-300 border-stone-300 justify-start"
            } flex items-center`}
          >
            <div className="w-6 h-6 bg-white rounded-full" />
          </button>
          <span className={`text-sm ${props.form.isPaid ? "text-white" : "text-zinc-500"}`}>
            {props.form.isPaid ? "Paid Community" : "Free Community"}
          </span>
        </div>

        {props.form.isPaid && (
          <div className="space-y-2">
            <Label htmlFor="monthlyPrice" className="text-white text-sm">
              Monthly Price ($) <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
              <Input
                id="monthlyPrice"
                type="number"
                min="0"
                step="0.01"
                value={props.form.monthlyPrice}
                onChange={(e) => props.updateForm('monthlyPrice', e.target.value)}
                placeholder="0.00"
                className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 pl-10 ${
                  props.errors.monthlyPrice ? 'border-red-500' : ''
                }`}
              />
            </div>
            {props.errors.monthlyPrice && (
              <p className="text-red-400 text-sm">{props.errors.monthlyPrice}</p>
            )}
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
                    {coach.name}
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
                    {course.name}
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
