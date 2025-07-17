'use client'

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BackTo } from "@nlc-ai/shared";
import { EmailEditor } from "@nlc-ai/shared";

const defaultEmailContent = `<p>Hi [Client Name],</p>

<p>I hope this message finds you well! I wanted to reach out and see how you're progressing with your fitness journey.</p>

<p><strong>Your Recent Activity:</strong></p>
<ul>
<li><strong>Course Progress:</strong> You're doing great with "Strength Starter: Build Muscle Fast" - keep up the momentum!</li>
<li><strong>Engagement:</strong> I noticed you've been actively participating in the community discussions.</li>
<li><strong>Next Steps:</strong> Have you had a chance to try the nutrition tips from Module 3?</li>
</ul>

<p>I'm here to support you every step of the way. If you have any questions about your current program or want to discuss your goals, feel free to reply to this email or schedule a quick call.</p>

<p><strong>Quick Reminder:</strong> Don't forget to log your workouts this week - it really helps track your progress!</p>

<p>Keep pushing forward, you're doing amazing!</p>

<p>Best regards,<br>
[Your Name]<br>
Certified Fitness Coach<br>
[Contact Information]</p>`;

export default function EmailDetails() {
  const router = useRouter();
  const params = useParams();

  const clientID = params.clientID as string;
  const emailID = params.emailID as string;

  const [emailSubject, setEmailSubject] = useState("Check-in: How's Your Fitness Journey Going?");
  const [emailContent, setEmailContent] = useState(defaultEmailContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading email data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [emailID]);

  const handleBackClick = () => {
    router.push(`/clients/${clientID}/emails`);
  };

  const handleSendEmail = () => {
    console.log('Sending email:', { emailSubject, emailContent });
    // Handle send logic here
  };

  const handleDiscardEmail = () => {
    router.back();
  };

  const recipientInfo = {
    name: "Maria Sharapova",
    email: "maria.sharapova@email.com",
    userId: "1234",
    plan: "Growth Pro",
    dateJoined: "Jun 15, 2023",
    lastActive: "Mar 25, 2025"
  };

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <BackTo onClick={handleBackClick} title="Email Details" />

      <EmailEditor
        initialSubject={emailSubject}
        initialContent={emailContent}
        onSubjectChange={setEmailSubject}
        onContentChange={setEmailContent}
        onSend={handleSendEmail}
        onDiscard={handleDiscardEmail}
        recipientInfo={recipientInfo}
        templateActions={true}
        sendButtonText="Approve & Send"
        discardButtonText="Discard Mail"
        isLoading={isLoading}
      />
    </div>
  );
}
