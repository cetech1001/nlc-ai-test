import {
  Button,
  Input,
  Label
} from "@nlc-ai/web-ui";
import { X, Plus, User, Mail, Phone, Tag, Users } from "lucide-react";
import {useEffect, useState} from "react";
import {ClientFormData, ClientFormErrors, ClientWithDetails} from "@nlc-ai/types";

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'networking', label: 'Networking Event' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'course_signup', label: 'Course Signup' },
  { value: 'consultation', label: 'Free Consultation' },
  { value: 'other', label: 'Other' },
];

const commonTags = [
  'VIP Client',
  'High Priority',
  'Long-term',
  'New Client',
  'Returning Client',
  'Group Program',
  '1-on-1 Coaching',
  'Fitness',
  'Nutrition',
  'Mindset',
  'Business',
  'Life Coaching',
  'Wellness',
  'Weight Loss',
  'Muscle Building',
];

interface IProps {
  type: "create" | "edit";
  onAction: (requestData: ClientFormData) => Promise<void>;
  onDiscard: () => void;
  originalClient?: ClientWithDetails | null;
}

export const ClientForm = (props: IProps) => {
  const [newTag, setNewTag] = useState("");
  const [showCommonTags, setShowCommonTags] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ClientFormErrors>({});

  const [formData, setFormData] = useState<ClientFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
    source: "",
    tags: [],
  });

  useEffect(() => {
    if (props.originalClient) {
      const client = props.originalClient;
      setFormData({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone || "",
        avatarUrl: client.avatarUrl || "",
        source: client.source || "",
        tags: client.tags || [],
      });
    }
  }, [props.originalClient]);

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      const updatedTags = [...(formData.tags || []), newTag.trim()];
      handleInputChange("tags", updatedTags);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    const updatedTags = formData.tags?.filter((_, i) => i !== index) || [];
    handleInputChange("tags", updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleAddCommonTag = (tag: string) => {
    if (!formData.tags?.includes(tag)) {
      const updatedTags = [...(formData.tags || []), tag];
      handleInputChange("tags", updatedTags);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ClientFormErrors = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName?.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName?.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field as keyof ClientFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const requestData: ClientFormData = {
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        email: formData.email?.trim(),
        phone: formData.phone?.trim() || undefined,
        avatarUrl: formData.avatarUrl?.trim() || undefined,
        source: formData.source?.trim() || undefined,
        tags: formData.tags?.length ? formData.tags : undefined,
      };

      await props.onAction(requestData);
    } catch (error: any) {
      if (error.statusCode === 409) {
        setErrors({ email: "A client with this email already exists" });
      } else {
        setErrors({ general: error.message || "Failed to create client" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (isLoading) return;

    const hasChanges = Object.values(formData).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value && value.trim() !== "";
    });

    if (hasChanges && !confirm("Are you sure you want to discard your changes?")) {
      return;
    }

    props.onDiscard();
  };

  return (
    <div className="max-w-4xl">
      {errors?.general && (
        <div className="mb-6 p-4 bg-red-800/20 border border-red-600 rounded-lg">
          <p className="text-red-400 text-sm">{errors.general}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white text-sm">
                First Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                  errors?.firstName ? 'border-red-500' : ''
                }`}
                placeholder="Enter first name"
                disabled={isLoading}
              />
              {errors?.firstName && (
                <p className="text-red-400 text-sm">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white text-sm">
                Last Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                  errors?.lastName ? 'border-red-500' : ''
                }`}
                placeholder="Enter last name"
                disabled={isLoading}
              />
              {errors?.lastName && (
                <p className="text-red-400 text-sm">{errors.lastName}</p>
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
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 pl-10 ${
                    errors?.email ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter email address"
                  disabled={isLoading}
                />
              </div>
              {errors?.email && (
                <p className="text-red-400 text-sm">{errors.email}</p>
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
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 pl-10"
                  placeholder="Enter phone number"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Client Details</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source" className="text-white text-sm">
              Client Source
            </Label>
            <select
              id="source"
              value={formData.source || ''}
              onChange={(e) => handleInputChange("source", e.target.value)}
              className="w-full bg-background border outline-none border-[#3A3A3A] text-white focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 px-3 py-2 rounded-md"
              disabled={isLoading}
            >
              <option value="">How did they find you?</option>
              {sourceOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors?.source && (
              <p className="text-red-400 text-sm">{errors.source}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="tags" className="text-white text-sm">
                Tags
              </Label>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 pl-10"
                  placeholder="Add a tag and press Enter"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim() || isLoading}
                className="px-4 py-2 bg-[#7B21BA] hover:bg-[#8B31CA] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.tags && formData.tags.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-white text-sm font-medium">Tags ({formData.tags.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-violet-600/20 text-violet-300 border border-violet-600/30 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        disabled={isLoading}
                        className="text-violet-400 hover:text-violet-200 ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowCommonTags(!showCommonTags)}
              className="text-violet-400 text-sm hover:text-violet-300 transition-colors"
              disabled={isLoading}
            >
              {showCommonTags ? 'Hide' : 'Show'} common tags
            </button>

            {showCommonTags && (
              <div className="flex flex-wrap gap-2 mt-3">
                {commonTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddCommonTag(tag)}
                    disabled={formData.tags?.includes(tag) || isLoading}
                    className={`px-3 py-1 border rounded-full text-sm transition-colors ${
                      formData.tags?.includes(tag)
                        ? 'bg-[#3A3A3A] text-[#666] border-[#3A3A3A] cursor-not-allowed'
                        : 'bg-[#2A2A2A] text-[#A0A0A0] border-[#3A3A3A] hover:bg-[#3A3A3A] hover:text-white hover:border-violet-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {errors?.tags && (
              <p className="text-red-400 text-sm">{errors.tags}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? (props.type === 'create' ? 'Creating...' : 'Saving...')
            : (props.type === 'create' ? 'Create Client' : 'Save Changes')
          }
        </Button>
        <Button
          onClick={handleDiscard}
          disabled={isLoading}
          variant="outline"
          className="bg-transparent border-[#3A3A3A] text-white hover:bg-background px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Discard
        </Button>
      </div>
    </div>
  );
};
