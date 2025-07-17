'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BackTo } from '@nlc-ai/shared';
import { Send, Star, Calendar, ChevronDown } from 'lucide-react';

interface TemplateData {
  id?: string;
  title: string;
  frequency: 'weekly' | 'monthly';
  day: string;
  platform: string;
  course: string;
  targetClients: string;
  subject: string;
  body: string;
  googleForm: string;
  questionnaire: string;
}

const defaultTemplate: TemplateData = {
  title: '',
  frequency: 'weekly',
  day: '',
  platform: '',
  course: '',
  targetClients: '',
  subject: 'Your Feedback: Help Us Improve Your Learning Experience',
  body: `Hi [Student's Name],

We hope you're enjoying the course so far!

We value your feedback and want to ensure that your learning experience is as effective and rewarding as possible.

Please take a moment to complete the quick survey below.

Google Form:
[Form Link]

---------------------------------------------------------------------------------------------------

Google Form Questionnaire:

1. How satisfied are you with the content so far?
(Scale: 1 - Very Dissatisfied, 5 - Very Satisfied)

2. Have you encountered any difficulties while going through the modules?

3. What aspects of the course do you find most valuable?

4. Are there any topics you'd like us to cover in more depth?

5. How likely are you to recommend this course to a friend or colleague?
(Scale: 1 - Very Unlikely, 5 - Very Likely)

Thank you for taking the time to share your thoughts. Your feedback helps us continuously improve our content and delivery.

Best regards,
[Your Name]
[Your Title]
[Contact Information]`,
  googleForm: '[Form Link]',
  questionnaire: `1. How satisfied are you with the content so far?
(Scale: 1 - Very Dissatisfied, 5 - Very Satisfied)

2. Have you encountered any difficulties while going through the modules?`
};

const FormField = ({ label, required = false, children }: {
  label: string;
  required?: boolean;
  children: React.ReactNode
}) => (
  <div className="space-y-2">
    <label className="block text-stone-50 text-sm font-medium">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const SelectField = ({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-2 rounded-lg focus:border-purple-500 outline-none appearance-none pr-10"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
  </div>
);

const CheckboxField = ({ checked, onChange, label }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-600 rounded focus:ring-purple-500 focus:ring-2"
    />
    <span className="text-stone-300 text-sm">{label}</span>
  </label>
);

const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => onRatingChange(star)}
        className={`p-1 transition-colors ${
          star <= rating ? 'text-yellow-400' : 'text-stone-600'
        }`}
      >
        <Star className="w-5 h-5 fill-current" />
      </button>
    ))}
  </div>
);

export default function TemplateEditor() {
  const router = useRouter();
  const params = useParams();
  const isEditing = params.id !== 'new';
  const templateId = params.id as string;

  const [template, setTemplate] = useState<TemplateData>(defaultTemplate);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (isEditing) {
      // Load existing template data
      setTemplate({
        ...defaultTemplate,
        id: templateId,
        title: 'Feedback Survey 01'
      });
    }
  }, [isEditing, templateId]);

  const handleInputChange = (field: keyof TemplateData, value: string) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/client-retention');
    }, 1000);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this template?')) {
      router.push('/client-retention');
    }
  };

  const handleGenerateFromPrompt = () => {
    if (prompt.trim()) {
      // Simulate AI generation
      console.log('Generating from prompt:', prompt);
    }
  };

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const platformOptions = [
    { value: 'udemy', label: 'Udemy' },
    { value: 'coursera', label: 'Coursera' },
    { value: 'teachable', label: 'Teachable' },
    { value: 'thinkific', label: 'Thinkific' }
  ];

  const courseOptions = [
    { value: 'course1', label: 'Course 1' },
    { value: 'course2', label: 'Course 2' },
    { value: 'course3', label: 'Course 3' }
  ];

  const targetOptions = [
    { value: 'new-students', label: 'New Students' },
    { value: 'struggling-students', label: 'Struggling Students' },
    { value: 'advanced-students', label: 'Advanced Students' },
    { value: 'all-students', label: 'All Students' }
  ];

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <BackTo
        onClick={() => router.push('/client-retention')}
        title={isEditing ? 'Client Retention Template Customization' : 'Create New Client Retention Survey Template'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Template Info Card */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>
            <div className="relative z-10 space-y-4">
              {isEditing ? (
                <div>
                  <h3 className="text-stone-50 text-lg font-semibold mb-2">Feedback Survey 01</h3>
                  <p className="text-stone-400 text-sm">Created: Apr 14, 2025 | 10:30 AM</p>
                </div>
              ) : (
                <FormField label="Title" required>
                  <input
                    type="text"
                    value={template.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter title"
                    className="w-full bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-2 rounded-lg focus:border-purple-500 outline-none"
                  />
                </FormField>
              )}

              <FormField label="Select Frequency" required>
                <div className="space-y-2">
                  <CheckboxField
                    checked={template.frequency === 'weekly'}
                    onChange={(checked) => handleInputChange('frequency', checked ? 'weekly' : 'monthly')}
                    label="Weekly"
                  />
                  <CheckboxField
                    checked={template.frequency === 'monthly'}
                    onChange={(checked) => handleInputChange('frequency', checked ? 'monthly' : 'weekly')}
                    label="Monthly"
                  />
                </div>
              </FormField>

              <FormField label="Day" required>
                <SelectField
                  value={template.day}
                  onChange={(value) => handleInputChange('day', value)}
                  options={dayOptions}
                  placeholder="Select day of the week"
                />
              </FormField>

              <FormField label="Platform" required>
                <SelectField
                  value={template.platform}
                  onChange={(value) => handleInputChange('platform', value)}
                  options={platformOptions}
                  placeholder="Select course platform"
                />
              </FormField>

              <FormField label="Course" required>
                <SelectField
                  value={template.course}
                  onChange={(value) => handleInputChange('course', value)}
                  options={courseOptions}
                  placeholder="Select course"
                />
              </FormField>

              <FormField label="Target Clients" required>
                <SelectField
                  value={template.targetClients}
                  onChange={(value) => handleInputChange('targetClients', value)}
                  options={targetOptions}
                  placeholder="Select target client criteria"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Prompt & Email Template */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Prompt Card */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute w-64 h-64 right-[-50px] top-[-21px] opacity-40 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#D497FF_0%,_#7B21BA_100%)] rounded-full blur-[112px]" />

            <div className="relative z-10 space-y-4">
              <FormField label="Your Prompt" required>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a prompt to generate email body. (Tip: Try mentioning tone & purpose of the email and press enter to submit)"
                    className="w-full bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-3 rounded-lg focus:border-purple-500 outline-none min-h-[120px] resize-none pr-12"
                  />
                  <button
                    onClick={handleGenerateFromPrompt}
                    className="absolute bottom-3 right-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white p-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </FormField>

              <StarRating rating={rating} onRatingChange={setRating} />
            </div>
          </div>

          {/* Email Template Card */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute w-64 h-64 -left-50 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

            <div className="relative z-10 space-y-4">
              <h3 className="text-stone-50 text-lg font-semibold">Automated Email Template</h3>

              <FormField label="Subject:">
                <input
                  type="text"
                  value={template.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-2 rounded-lg focus:border-purple-500 outline-none"
                />
              </FormField>

              <FormField label="Body:">
                <textarea
                  value={template.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-3 rounded-lg focus:border-purple-500 outline-none min-h-[300px] resize-none"
                />
              </FormField>

              <div className="border-t border-neutral-700 pt-4">
                <FormField label="Google Form:">
                  <input
                    type="text"
                    value={template.googleForm}
                    onChange={(e) => handleInputChange('googleForm', e.target.value)}
                    placeholder="[Form Link]"
                    className="w-full bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-2 rounded-lg focus:border-purple-500 outline-none"
                  />
                </FormField>

                <div className="mt-4">
                  <h4 className="text-stone-50 text-sm font-medium mb-2">Google Form Questionnaire:</h4>
                  <textarea
                    value={template.questionnaire}
                    onChange={(e) => handleInputChange('questionnaire', e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-3 rounded-lg focus:border-purple-500 outline-none min-h-[120px] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full sm:w-auto bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Save Template')}
        </button>

        {isEditing && (
          <button
            onClick={handleDelete}
            className="w-full sm:w-auto border border-red-500 text-red-400 px-6 py-3 rounded-lg font-medium hover:bg-red-500/10 transition-colors"
          >
            Delete Template
          </button>
        )}

        <button
          onClick={() => router.push('/client-retention')}
          className="w-full sm:w-auto border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
        >
          {isEditing ? 'Discard Template' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}
