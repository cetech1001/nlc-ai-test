import { useState } from 'react';
import { Button } from '@nlc-ai/ui';
import { X, Mail, Send, Clock, Sparkles, Eye } from 'lucide-react';

interface EmailAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName: string;
  leadEmail: string;
  leadStatus: string;
  leadId: string;
}

const emailSequences = {
  contacted: {
    title: 'Welcome & Nurture Sequence',
    description: 'Build trust with value-driven content and gentle follow-ups',
    color: 'from-yellow-600/20 to-orange-600/20',
    borderColor: 'border-yellow-600/30',
    iconColor: 'text-yellow-400',
    emails: [
      {
        id: 1,
        subject: 'Welcome! Here\'s what you need to know...',
        timing: 'Immediate',
        preview: 'Hi {{firstName}}, thanks for your interest! I wanted to personally reach out and share some valuable insights that can help you achieve your goals...',
        status: 'ready'
      },
      {
        id: 2,
        subject: 'The #1 mistake I see coaches make',
        timing: '2 days later',
        preview: 'I\'ve been coaching for over 5 years, and there\'s one mistake I see new coaches make over and over again...',
        status: 'ready'
      },
      {
        id: 3,
        subject: 'Your personalized action plan',
        timing: '5 days later',
        preview: 'Based on what you shared about your goals, I\'ve put together a personalized action plan just for you...',
        status: 'ready'
      },
      {
        id: 4,
        subject: 'Success story: How Sarah went from $0 to $10k/month',
        timing: '1 week later',
        preview: 'I wanted to share an inspiring story with you. Sarah was exactly where you are 6 months ago...',
        status: 'ready'
      }
    ]
  },
  scheduled: {
    title: 'Meeting Preparation Sequence',
    description: 'Ensure successful meetings with prep materials and reminders',
    color: 'from-blue-600/20 to-cyan-600/20',
    borderColor: 'border-blue-600/30',
    iconColor: 'text-blue-400',
    emails: [
      {
        id: 1,
        subject: 'Meeting confirmed! Here\'s what to expect',
        timing: 'Immediate',
        preview: 'Great news! Your meeting is confirmed for {{meetingDate}} at {{meetingTime}}. Here\'s everything you need to know...',
        status: 'ready'
      },
      {
        id: 2,
        subject: 'Pre-meeting preparation guide',
        timing: '2 days before',
        preview: 'To make our time together as valuable as possible, I\'ve prepared a quick guide to help you prepare...',
        status: 'ready'
      },
      {
        id: 3,
        subject: 'Reminder: We meet tomorrow!',
        timing: '24 hours before',
        preview: 'Just a friendly reminder that we have our meeting scheduled for tomorrow at {{meetingTime}}...',
        status: 'ready'
      },
      {
        id: 4,
        subject: 'Final reminder: Meeting in 1 hour',
        timing: '1 hour before',
        preview: 'Quick reminder - our meeting starts in 1 hour. Here\'s the meeting link and agenda...',
        status: 'ready'
      }
    ]
  },
  converted: {
    title: 'Onboarding & Success Sequence',
    description: 'Welcome new clients and set them up for success',
    color: 'from-green-600/20 to-emerald-600/20',
    borderColor: 'border-green-600/30',
    iconColor: 'text-green-400',
    emails: [
      {
        id: 1,
        subject: '🎉 Welcome to the team! Let\'s get started',
        timing: 'Immediate',
        preview: 'Congratulations on taking this important step! I\'m excited to work with you and help you achieve incredible results...',
        status: 'ready'
      },
      {
        id: 2,
        subject: 'Your complete onboarding guide',
        timing: '1 day later',
        preview: 'Here\'s everything you need to get started on the right foot. This guide will walk you through each step...',
        status: 'ready'
      },
      {
        id: 3,
        subject: 'How was your first week?',
        timing: '1 week later',
        preview: 'I wanted to check in and see how your first week has been going. Do you have any questions or concerns?',
        status: 'ready'
      },
      {
        id: 4,
        subject: 'Pro tips for accelerated success',
        timing: '2 weeks later',
        preview: 'Now that you\'ve had some time to settle in, here are some advanced strategies that my most successful clients use...',
        status: 'ready'
      }
    ]
  },
  unresponsive: {
    title: 'Re-engagement & Recovery Sequence',
    description: 'Win back unresponsive leads with value and alternative approaches',
    color: 'from-red-600/20 to-pink-600/20',
    borderColor: 'border-red-600/30',
    iconColor: 'text-red-400',
    emails: [
      {
        id: 1,
        subject: 'Did I catch you at a bad time?',
        timing: 'Immediate',
        preview: 'I noticed we haven\'t connected recently. I completely understand that timing isn\'t always perfect...',
        status: 'ready'
      },
      {
        id: 2,
        subject: 'No pressure - just a valuable resource',
        timing: '3 days later',
        preview: 'No worries if you\'re not ready to move forward right now. I wanted to share this free resource that might help...',
        status: 'ready'
      },
      {
        id: 3,
        subject: 'A different approach that might work better',
        timing: '1 week later',
        preview: 'I\'ve been thinking about your situation, and I realize there might be a different approach that would work better for you...',
        status: 'ready'
      },
      {
        id: 4,
        subject: 'Final check-in (then I\'ll step back)',
        timing: '2 weeks later',
        preview: 'This will be my final email for a while. I don\'t want to overwhelm you, but I did want to make one last offer...',
        status: 'ready'
      }
    ]
  }
};

export const EmailAutomationModal = ({ isOpen, onClose, leadName, leadEmail, leadStatus, leadId }: EmailAutomationModalProps) => {
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  if (!isOpen) return null;

  const sequence = emailSequences[leadStatus as keyof typeof emailSequences] || emailSequences.contacted;

  const handleSendSequence = () => {
    // Here you would trigger the actual email sequence
    console.log(`Starting ${sequence.title} for ${leadName} (${leadEmail})`);
    onClose();
  };

  const handleSendSingleEmail = (emailId: number) => {
    const email = sequence.emails.find(e => e.id === emailId);
    console.log(`Sending single email: ${email?.subject} to ${leadName}`);
    onClose();
  };

  const personalizeContent = (content: string) => {
    return content
      .replace(/\{\{firstName\}\}/g, leadName.split(' ')[0])
      .replace(/\{\{lastName\}\}/g, leadName.split(' ')[1] || '')
      .replace(/\{\{email\}\}/g, leadEmail)
      .replace(/\{\{meetingDate\}\}/g, 'January 15th')
      .replace(/\{\{meetingTime\}\}/g, '2:00 PM EST');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A3A3A]">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${sequence.color} rounded-xl flex items-center justify-center`}>
              <Mail className={`w-6 h-6 ${sequence.iconColor}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{sequence.title}</h2>
              <p className="text-[#A0A0A0] text-sm">For: {leadName} ({leadEmail})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#A0A0A0] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6">
            <p className="text-[#A0A0A0] text-sm mb-4">{sequence.description}</p>

            <div className={`bg-gradient-to-br ${sequence.color} border ${sequence.borderColor} rounded-xl p-4 mb-6`}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className={`w-4 h-4 ${sequence.iconColor}`} />
                <span className={`text-sm font-medium ${sequence.iconColor}`}>AI-Powered Automation</span>
              </div>
              <p className="text-[#A0A0A0] text-xs">
                All emails are automatically personalized with the lead's information and sent at optimal times.
              </p>
            </div>
          </div>

          {/* Email Sequence */}
          <div className="space-y-4">
            {sequence.emails.map((email, index) => (
              <div key={email.id} className="bg-[#1A1A1A]/50 border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${sequence.color} rounded-lg flex items-center justify-center text-sm font-medium ${sequence.iconColor}`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{email.subject}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-[#666]" />
                        <span className="text-[#A0A0A0] text-xs">{email.timing}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedEmail(email.id);
                        setIsPreviewMode(true);
                      }}
                      className="px-3 py-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] border border-[#3A3A3A] rounded-lg text-[#A0A0A0] hover:text-white text-xs transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleSendSingleEmail(email.id)}
                      className={`px-3 py-1 bg-gradient-to-r ${sequence.color.replace('/20', '/40')} hover:${sequence.color.replace('/20', '/60')} border ${sequence.borderColor} rounded-lg ${sequence.iconColor} text-xs transition-colors flex items-center gap-1`}
                    >
                      <Send className="w-3 h-3" />
                      Send Now
                    </button>
                  </div>
                </div>

                <p className="text-[#A0A0A0] text-sm leading-relaxed">
                  {personalizeContent(email.preview)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-[#3A3A3A]">
          <div className="text-[#A0A0A0] text-sm">
            {sequence.emails.length} emails • Scheduled over 2 weeks
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendSequence}
              className={`bg-gradient-to-r ${sequence.color.replace('/20', '/60')} hover:${sequence.color.replace('/20', '/80')} text-white border ${sequence.borderColor}`}
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Start Sequence
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {isPreviewMode && selectedEmail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
              <button
                onClick={() => setIsPreviewMode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {/* Email preview content would go here */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Subject:</label>
                  <p className="text-gray-900">{sequence.emails.find(e => e.id === selectedEmail)?.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Content:</label>
                  <div className="bg-gray-50 rounded-lg p-4 mt-2">
                    <p className="text-gray-900 leading-relaxed">
                      {personalizeContent(sequence.emails.find(e => e.id === selectedEmail)?.preview || '')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
