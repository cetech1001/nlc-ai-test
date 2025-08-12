import {
  Button,
  Input,
  Textarea,
  Label
} from "@nlc-ai/web-ui";
import { Calendar, User, Mail, Phone, MapPin, FileText } from "lucide-react";
import { LeadFormData, LeadFormErrors } from "@nlc-ai/types";

const statusOptions = [
  { value: 'contacted', label: 'Not Converted', color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
  { value: 'converted', label: 'Converted', color: 'bg-green-600/20 text-green-400 border-green-600/30' },
  { value: 'unresponsive', label: 'No Show', color: 'bg-red-600/20 text-red-400 border-red-600/30' },
];

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'networking', label: 'Networking Event' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'other', label: 'Other' },
];

interface IProps {
  type: "create" | "edit";
  formData: LeadFormData;
  handleInputChange: (field: string, value: string) => void;
  onAction: () => void;
  onDiscard: () => void;
  isLoading?: boolean;
  errors?: LeadFormErrors;
}

export const LeadForm = (props: IProps) => {
  return (
    <div className="max-w-4xl">
      {props.errors?.general && (
        <div className="mb-6 p-4 bg-red-800/20 border border-red-600 rounded-lg">
          <p className="text-red-400 text-sm">{props.errors.general}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white text-sm">
                First Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={props.formData.name}
                onChange={(e) => props.handleInputChange("name", e.target.value)}
                className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                  props.errors?.name ? 'border-red-500' : ''
                }`}
                placeholder="Enter first name"
                disabled={props.isLoading}
              />
              {props.errors?.name && (
                <p className="text-red-400 text-sm">{props.errors.name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm">
                Email Address <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
                <Input
                  id="email"
                  type="email"
                  value={props.formData.email}
                  onChange={(e) => props.handleInputChange("email", e.target.value)}
                  className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 pl-10 ${
                    props.errors?.email ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter email address"
                  disabled={props.isLoading}
                />
              </div>
              {props.errors?.email && (
                <p className="text-red-400 text-sm">{props.errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white text-sm">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
                <Input
                  id="phone"
                  type="tel"
                  value={props.formData.phone || ''}
                  onChange={(e) => props.handleInputChange("phone", e.target.value)}
                  className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 pl-10"
                  placeholder="Enter phone number"
                  disabled={props.isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lead Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Lead Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="source" className="text-white text-sm">
                Lead Source
              </Label>
              <select
                id="source"
                value={props.formData.source || ''}
                onChange={(e) => props.handleInputChange("source", e.target.value)}
                className="w-full bg-background border-[#3A3A3A] text-white focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 px-3 py-2 rounded-md"
                disabled={props.isLoading}
              >
                <option value="">Select source</option>
                {sourceOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {props.errors?.source && (
                <p className="text-red-400 text-sm">{props.errors.source}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-white text-sm">
                {props.type === 'create' ? 'Initial Status' : 'Lead Status'}
              </Label>
              <select
                id="status"
                value={props.formData.status}
                onChange={(e) => props.handleInputChange("status", e.target.value)}
                className="w-full bg-background border-[#3A3A3A] text-white focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 px-3 py-2 rounded-md"
                disabled={props.isLoading}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {props.errors?.status && (
                <p className="text-red-400 text-sm">{props.errors.status}</p>
              )}
            </div>
          </div>

          {props.formData.status === 'scheduled' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="meetingDate" className="text-white text-sm">
                  Meeting Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
                  <Input
                    id="meetingDate"
                    type="date"
                    value={props.formData.meetingDate || ''}
                    onChange={(e) => props.handleInputChange("meetingDate", e.target.value)}
                    className="bg-background border-[#3A3A3A] text-white focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 pl-10"
                    disabled={props.isLoading}
                  />
                </div>
                {props.errors?.meetingDate && (
                  <p className="text-red-400 text-sm">{props.errors.meetingDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingTime" className="text-white text-sm">
                  Meeting Time
                </Label>
                <Input
                  id="meetingTime"
                  type="time"
                  value={props.formData.meetingTime || ''}
                  onChange={(e) => props.handleInputChange("meetingTime", e.target.value)}
                  className="bg-background border-[#3A3A3A] text-white focus:border-[#7B21BA] focus:ring-[#7B21BA]/20"
                  disabled={props.isLoading}
                />
                {props.errors?.meetingTime && (
                  <p className="text-red-400 text-sm">{props.errors.meetingTime}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Additional Notes</h3>
          </div>

          <div className="space-y-2">
            <Textarea
              id="notes"
              value={props.formData.notes || ''}
              onChange={(e) => props.handleInputChange("notes", e.target.value)}
              className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 min-h-[80px] resize-none"
              placeholder="Add any additional notes about this lead..."
              disabled={props.isLoading}
            />
            {props.errors?.notes && (
              <p className="text-red-400 text-sm">{props.errors.notes}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button
          onClick={props.onAction}
          disabled={props.isLoading}
          className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {props.isLoading
            ? (props.type === 'create' ? 'Creating...' : 'Saving...')
            : (props.type === 'create' ? 'Create Lead' : 'Save Changes')
          }
        </Button>
        <Button
          onClick={props.onDiscard}
          disabled={props.isLoading}
          variant="outline"
          className="bg-transparent border-[#3A3A3A] text-white hover:bg-background px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Discard
        </Button>
      </div>
    </div>
  );
};
