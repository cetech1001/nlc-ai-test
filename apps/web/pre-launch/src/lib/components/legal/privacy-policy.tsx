import React, {useState} from "react";
import {ChevronDown, ChevronUp, Shield} from "lucide-react";

export const PrivacyPolicy = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      content: (
        <>
          <p className="mb-4">We collect the following types of information when you use our platform:</p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Account Information</h3>
              <p>Name, email address, payment details, login credentials, and profile information.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Course Content & Training Data</h3>
              <p>Files, transcripts, videos, documents, and other materials you upload for AI agent training and automation.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Communications</h3>
              <p>Emails, chat messages, surveys, and other content processed by our AI agents on your behalf.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Lead & Client Data</h3>
              <p>Contact details, form responses, and interaction data gathered through forms, chatbots, or CRM integrations.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Social Media Data</h3>
              <p>Engagement metrics and account data if you connect your social media profiles to our platform.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Usage & Analytics Data</h3>
              <p>Activity logs, feature usage, performance statistics, device information, IP addresses, and browser details to improve services and user experience.</p>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'use',
      title: '2. How We Use Your Information',
      content: (
        <>
          <p className="mb-2">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, operate, maintain, and improve the AI agents and platform</li>
            <li>Train and optimize AI models to automate email responses, client check-ins, follow-ups, and content generation</li>
            <li>Manage lead capture, qualification, scheduling, and CRM integrations</li>
            <li>Send account notifications, service updates, and important communications</li>
            <li>Monitor platform performance, troubleshoot issues, and enhance security</li>
            <li>Analyze usage patterns to develop new features and improve existing functionality</li>
            <li>Process payments and prevent fraud</li>
            <li>Comply with legal obligations and enforce our Terms of Service</li>
          </ul>
          <p className="mt-4 font-semibold text-purple-300">We do not sell or rent your personal information to third parties.</p>
        </>
      )
    },
    {
      id: 'sharing',
      title: '3. How We Share Your Information',
      content: (
        <>
          <p className="mb-4">We may share information with:</p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Service Providers</h3>
              <p>Third-party vendors who help us operate the platform, including cloud hosting (AWS, Google Cloud), payment processors (Stripe), email services (SendGrid, Mailgun), CRM platforms, scheduling tools, analytics providers, and AI infrastructure providers.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Legal & Regulatory Authorities</h3>
              <p>When required by law, subpoena, court order, or government request, or to protect our rights and safety.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Business Transfers</h3>
              <p>In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred to the acquiring entity.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">With Your Consent</h3>
              <p>When you explicitly authorize us to share your information with specific third parties or integrations.</p>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'security',
      title: '4. Data Security',
      content: (
        <>
          <p className="mb-4">We implement industry-standard security measures to protect your information, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encryption in transit using TLS 1.3</li>
            <li>Encryption at rest using AES-256</li>
            <li>Role-based access controls limiting employee access to sensitive data</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Monitoring and logging of system activity for suspicious behavior</li>
            <li>Secure authentication mechanisms including multi-factor authentication (MFA)</li>
          </ul>
          <p className="mt-4 italic text-gray-400">However, no system is 100% secure. While we strive to protect your information, we cannot guarantee absolute security against all threats.</p>
        </>
      )
    },
    {
      id: 'rights',
      title: '5. Your Privacy Rights',
      content: (
        <>
          <p className="mb-4">Depending on your location, you may have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements)</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
          </ul>
          <p className="mb-2">These rights may be subject to GDPR (EU), CCPA (California), or other applicable privacy laws.</p>
          <p>To exercise these rights, contact us at <span className="text-purple-400 font-semibold">support@nextlevelcoach.ai</span></p>
        </>
      )
    },
    {
      id: 'retention',
      title: '6. Data Retention',
      content: (
        <>
          <p className="mb-2">We retain personal data only as long as necessary to:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Provide our Services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce agreements</li>
          </ul>
          <p className="mb-2">When you close your account, we will delete or anonymize your personal data within 90 days, except where we are required to retain it by law (e.g., tax records, legal compliance).</p>
          <p>Backup copies may persist for a limited time but will not be accessible for operational use.</p>
        </>
      )
    },
    {
      id: 'cookies',
      title: '7. Cookies & Tracking Technologies',
      content: (
        <>
          <p className="mb-4">We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Maintain your login session</li>
            <li>Remember your preferences</li>
            <li>Analyze platform usage and performance</li>
            <li>Provide personalized experiences</li>
          </ul>
          <p className="mb-2">You can control cookies through your browser settings. Note that disabling cookies may affect platform functionality.</p>
          <p>We may also use analytics tools like Google Analytics to understand user behavior and improve our Services.</p>
        </>
      )
    },
    {
      id: 'children',
      title: '8. Children\'s Privacy',
      content: 'Our Services are not directed to individuals under the age of 13 (or 16 in certain jurisdictions). We do not knowingly collect information from children. If we learn we have collected such information, we will delete it promptly. Parents or guardians who believe we may have collected information from a child should contact us immediately.'
    },
    {
      id: 'international',
      title: '9. International Data Transfers',
      content: (
        <>
          <p className="mb-2">Your information may be transferred to and processed in countries other than your own, including the United States.</p>
          <p className="mb-2">We ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission, to protect your data in accordance with applicable laws.</p>
          <p>By using our Services, you consent to the transfer of your information to these locations.</p>
        </>
      )
    },
    {
      id: 'changes',
      title: '10. Changes to This Policy',
      content: (
        <>
          <p className="mb-2">We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.</p>
          <p className="mb-2">If we make material changes, we will notify you by email or through a prominent notice on the platform at least 30 days before they take effect.</p>
          <p>Continued use of the Services after changes means you accept the updated Privacy Policy.</p>
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="glow-orb glow-orb--lg -top-96 -right-96 opacity-40" />
      <div className="glow-orb glow-orb--lg glow-orb--purple -bottom-96 -left-96 opacity-40" />

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12 border border-purple-500/20">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-purple-400 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
            </div>

            <p className="text-center text-gray-400 mb-8">Last Updated: October 1, 2025</p>

            <div className="mb-8 p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <p className="text-white/90 leading-relaxed">
                Next Level Coach AI ("we," "our," "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform and services.
              </p>
            </div>

            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="border border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-black/30 hover:bg-black/50 transition-colors"
                  >
                    <h2 className="text-xl font-semibold text-white text-left">{section.title}</h2>
                    {expandedSection === section.id ? (
                      <ChevronUp className="w-5 h-5 text-purple-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-purple-400" />
                    )}
                  </button>
                  {expandedSection === section.id && (
                    <div className="px-6 py-4 bg-black/20 text-white/80 leading-relaxed">
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-black/30 border border-purple-500/20 rounded-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="text-white/80 mb-2">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-purple-400 font-semibold">support@nextlevelcoach.ai</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
