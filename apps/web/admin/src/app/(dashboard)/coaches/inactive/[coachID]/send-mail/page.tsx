'use client'

import {
  ThumbsDown,
  ThumbsUp,
  Copy,
} from "lucide-react";
import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import { RichTextEditor, TemplateFrame } from "@nlc-ai/web-shared";
import {ExtendedCoach} from "@nlc-ai/sdk-users";
import {sdkClient, SendMailPageSkeleton} from "@/lib";
import { formatDate } from "@nlc-ai/web-utils";
import {toast} from "sonner";

const AdminClientRetentionPage = () => {
  const router = useRouter();
  const params = useParams();

  const coachID = params.coachID as string;

  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [coach, setCoach] = useState<ExtendedCoach | null>(null);

  useEffect(() => {
    (() => fetchCoach())();
  }, []);

  const fetchCoach = async () => {
    setIsLoading(true);
    try {
      const response = await sdkClient.users.coaches.getCoach(coachID);
      setCoach(response);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSendEmail = async () => {
    if (!emailSubject.trim()) {
      toast.error('Please enter an email subject');
      return;
    }

    if (!emailContent.trim()) {
      toast.error('Please enter email content');
      return;
    }

    if (!coach?.email) {
      toast.error('Coach email not found');
      return;
    }

    setIsSending(true);
    try {
      await sdkClient.email.sendEmail({
        to: coach.email,
        subject: emailSubject,
        message: emailContent,
        name: `${coach.firstName} ${coach.lastName}`,
        appName: 'Next Level Coach AI'
      });

      toast.success('Email sent successfully!');
      router.back();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscard = () => {
    router.back();
  };

  const handleEditorChange = (content: string) => {
    setEmailContent(content);
  };

  if (isLoading) {
    return <SendMailPageSkeleton/>;
  }

  const sidebarComponent = (
    <>
      <div className="flex justify-between items-center">
        <div className="text-stone-50 text-xl sm:text-2xl font-semibold font-['Inter'] leading-relaxed">
          {coach?.firstName} {coach?.lastName}
        </div>
      </div>

      <div className="text-stone-300 text-sm font-normal font-['Inter']">
        {coach?.email}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        <div className="flex flex-col gap-1.5">
          <div className="text-stone-50 text-sm font-medium font-['Inter']">User ID</div>
          <div className="text-stone-300 text-sm font-normal font-['Inter']">#{coach?.id.split('-')[0]}</div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-stone-50 text-sm font-medium font-['Inter']">Subscription Plan</div>
          <div className="text-stone-300 text-sm font-normal font-['Inter']">{coach?.subscriptionPlan || 'N/A'}</div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-stone-50 text-sm font-medium font-['Inter']">Date Joined</div>
          <div className="text-stone-300 text-sm font-normal font-['Inter']">
            {coach?.createdAt && formatDate(coach.createdAt)}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-stone-50 text-sm font-medium font-['Inter']">Last Active</div>
          <div className="text-stone-300 text-sm font-normal font-['Inter']">
            {coach?.lastLoginAt ? formatDate(coach.lastLoginAt) : 'Never'}
          </div>
        </div>
      </div>
    </>
  );

  const mainComponent = (
    <div className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8 h-full overflow-hidden">
      <div className="flex items-center gap-2.5">
        <button className="p-1 hover:bg-white/10 rounded transition-colors opacity-70">
          <ThumbsUp className="w-4 h-4 text-stone-50" />
        </button>
        <button className="p-1 hover:bg-white/10 rounded transition-colors opacity-70">
          <ThumbsDown className="w-4 h-4 text-stone-50" />
        </button>
        <button className="p-1 hover:bg-white/10 rounded transition-colors opacity-70">
          <Copy className="w-4 h-4 text-stone-50" />
        </button>
      </div>

      <div className="text-stone-50 text-base font-medium font-['Inter'] leading-relaxed">
        Automated Email Template
      </div>

      <div className="flex-1 flex flex-col space-y-4 min-h-0">
        <div className="space-y-2">
          <div className="text-stone-50 text-sm font-bold font-['Inter'] leading-tight">Subject:</div>
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="w-full bg-neutral-800/50 text-stone-300 text-sm font-normal font-['Inter'] leading-tight outline-none border border-neutral-600 rounded-lg px-3 py-2 focus:border-purple-500 transition-colors"
            placeholder="Enter email subject"
          />
        </div>

        <div className="space-y-2 flex-1 flex flex-col h-full sm:hidden">
          <div className="text-stone-50 text-sm font-bold font-['Inter'] leading-tight">Body:</div>
          <RichTextEditor content={emailContent} updateContent={handleEditorChange} view={'mobile'}/>
        </div>
        <div className="space-y-2 flex-1 flex-col h-full hidden sm:flex">
          <div className="text-stone-50 text-sm font-bold font-['Inter'] leading-tight">Body:</div>
          <RichTextEditor content={emailContent} updateContent={handleEditorChange}/>
        </div>
      </div>
    </div>
  );

  return (
    <TemplateFrame
      pageTitle="Client Retention Email"
      onSave={handleSendEmail}
      onDiscard={handleDiscard}
      sidebarComponent={sidebarComponent}
      mainComponent={mainComponent}
      saveButtonText={isSending ? "Sending..." : "Send Email"}
      discardButtonText="Discard"
    />
  );
}

export default AdminClientRetentionPage;
