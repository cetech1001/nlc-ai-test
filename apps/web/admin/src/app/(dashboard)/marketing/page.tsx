'use client'

import React, { useState, useEffect } from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import { User, AtSign, FileText, MessageSquare, CheckCircle, XCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import {appConfig, TemplateFrame} from '@nlc-ai/web-shared';
import {sdkClient} from "@/lib";

interface EmailFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  type?: string;
  as?: 'input' | 'textarea';
}

const FormInput: React.FC<FormInputProps> = ({
                                               label,
                                               placeholder,
                                               value,
                                               onChange,
                                               required = false,
                                               icon: Icon,
                                               type = "text",
                                               as = "input"
                                             }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px] flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {as === "textarea" ? (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full px-4 sm:px-5 py-2 sm:py-[10px] border border-white/30 rounded-[10px] bg-transparent text-white placeholder:text-white/50 font-inter text-sm sm:text-base outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20 transition-all resize-none"
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[50px] px-4 sm:px-5 py-2 sm:py-[10px] border border-white/30 rounded-[10px] bg-transparent text-white placeholder:text-white/50 font-inter text-sm sm:text-base outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20 transition-all"
      />
    )}
  </div>
);

// Email Preview Component
const EmailPreview: React.FC<{
  name: string;
  email: string;
  subject: string;
  message: string;
}> = ({ name, email, subject, message }) => {
  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6">
        <div className="flex items-center gap-3 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm opacity-90 font-medium">{appConfig.app.name}</div>
            <div className="text-xs opacity-70">{appConfig.app.supportEmail}</div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-500">TO:</span>
          <span className="text-sm text-gray-800">{email}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xs font-semibold text-gray-500 mt-1">SUBJECT:</span>
          <span className="text-base font-semibold text-gray-900 flex-1">
            {subject}
          </span>
        </div>
      </div>

      <div className="p-6 bg-white">
        <div className="text-gray-700 space-y-4">
          <p className="text-lg font-medium">Hi {name || 'there'},</p>
          <div className="whitespace-pre-wrap leading-relaxed text-gray-600">
            {message}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">Best regards,</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{appConfig.app.name}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          This email was sent to {email}
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          © {new Date().getFullYear()} {appConfig.app.name}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

// Move FormSidebar outside the main component
const FormSidebar: React.FC<{
  sendStatus: 'idle' | 'sending' | 'success' | 'error';
  errorMessage: string;
  formData: EmailFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmailFormData>>;
}> = ({ sendStatus, errorMessage, formData, setFormData }) => (
  <div className="flex flex-col gap-4 sm:gap-[18px]">
    <div className="flex flex-col gap-3">
      <h3 className="text-[#F9F9F9] font-inter text-lg sm:text-xl font-semibold leading-tight">
        Send Marketing Email
      </h3>
      <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-relaxed">
        Compose and send a personalized marketing email to this lead.
      </p>
    </div>

    {sendStatus === 'sending' && (
      <div className="flex items-center gap-2 px-4 py-3 bg-blue-600/20 border border-blue-400/30 rounded-lg">
        <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
        <span className="text-blue-300 text-sm font-medium">Sending email...</span>
      </div>
    )}

    {sendStatus === 'success' && (
      <div className="flex items-center gap-2 px-4 py-3 bg-green-600/20 border border-green-400/30 rounded-lg">
        <CheckCircle className="w-4 h-4 text-green-400" />
        <span className="text-green-300 text-sm font-medium">Email sent successfully!</span>
      </div>
    )}

    {sendStatus === 'error' && (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-600/20 border border-red-400/30 rounded-lg">
        <XCircle className="w-4 h-4 text-red-400" />
        <span className="text-red-300 text-sm">{errorMessage}</span>
      </div>
    )}

    <FormInput
      label="Recipient Name"
      placeholder="Enter recipient name"
      value={formData.name}
      onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
      required
      icon={User}
    />

    <FormInput
      label="Recipient Email"
      placeholder="Enter email address"
      value={formData.email}
      onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
      required
      type="email"
      icon={AtSign}
    />

    <FormInput
      label="Email Subject"
      placeholder="Enter email subject"
      value={formData.subject}
      onChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
      required
      icon={FileText}
    />

    <FormInput
      label="Email Message"
      placeholder="Enter your message here..."
      value={formData.message}
      onChange={(value) => setFormData(prev => ({ ...prev, message: value }))}
      required
      as="textarea"
      icon={MessageSquare}
    />
  </div>
);

// Move MainContent outside the main component
const MainContent: React.FC<{
  formData: EmailFormData;
}> = ({ formData }) => (
  <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-[30px]">
    <div className="flex items-center gap-2 text-[#F9F9F9] mb-2">
      <Mail className="w-5 h-5" />
      <h2 className="text-xl font-semibold font-inter">Email Preview</h2>
    </div>
    <p className="text-[#C5C5C5] font-inter text-sm mb-4">
      This is how your email will appear to the recipient
    </p>
    <EmailPreview
      name={formData.name}
      email={formData.email}
      subject={formData.subject}
      message={formData.message}
    />
  </div>
);

const Marketing: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const leadID = searchParams.get('leadID');

  const [formData, setFormData] = useState<EmailFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (leadID) {
      fetchLead(leadID);
    }
  }, [leadID]);

  const reset = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  }

  const fetchLead = async (leadID: string) => {
    try {
      const response = await sdkClient.leads.getLead(leadID);

      setFormData({
        name: response.name,
        email: response.email,
        subject: '',
        message: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load lead');
      // router.back();
    }
  };

  const handleSendEmail = async () => {
    // Validation
    if (!formData.email || !formData.subject || !formData.message) {
      setErrorMessage('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }

    setSendStatus('sending');
    setErrorMessage('');

    try {
      // Call API to send email via Mailgun
      await sdkClient.email.sendEmail({
        to: formData.email,
        subject: formData.subject,
        message: formData.message,
        name: formData.name,
        appName: appConfig.app.name,
      });

      setSendStatus('success');
      toast.success('Email sent successfully!');

      // Redirect back after 1.5 seconds
      setTimeout(() => {
        reset();
        if (leadID) {
          router.back();
        }
      }, 1500);
    } catch (error: any) {
      setSendStatus('error');
      const message = error.message || 'Failed to send email. Please try again.';
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleCancel = () => {
    reset();
    // if (leadID) {
    router.back();
    // }
  };

  return (
    <TemplateFrame
      pageTitle="Send Marketing Email"
      onSave={handleSendEmail}
      onDiscard={handleCancel}
      sidebarComponent={
        <FormSidebar
          sendStatus={sendStatus}
          errorMessage={errorMessage}
          formData={formData}
          setFormData={setFormData}
        />
      }
      mainComponent={
        <MainContent formData={formData} />
      }
      saveButtonText={sendStatus === 'sending' ? 'Sending...' : 'Send Email'}
    />
  );
};

export default Marketing;
