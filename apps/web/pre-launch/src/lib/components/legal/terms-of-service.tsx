import React, {useState} from "react";
import {ChevronDown, ChevronUp, FileText} from "lucide-react";

export const TermsOfService = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'eligibility',
      title: '1. Eligibility',
      content: 'You must be at least 18 years old to use the Services. By using the Services, you confirm that you meet this requirement.'
    },
    {
      id: 'accounts',
      title: '2. Account Registration & Security',
      content: (
        <>
          <p className="mb-2">To use the Services, you must create an account with accurate information.</p>
          <p className="mb-2">You are responsible for maintaining the confidentiality of your login credentials.</p>
          <p className="mb-2">You are responsible for all activity that occurs under your account.</p>
          <p>Notify us immediately if you suspect unauthorized access to your account.</p>
        </>
      )
    },
    {
      id: 'use',
      title: '3. Acceptable Use of Services',
      content: (
        <>
          <p className="mb-2">You agree to use the Services only for lawful purposes. You will not:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Upload or transmit unlawful, harmful, or infringing content</li>
            <li>Attempt to disrupt or compromise the security of the platform</li>
            <li>Resell, sublicense, or share access to the Services without our permission</li>
            <li>Use the Services to send spam or unauthorized communications</li>
            <li>Engage in any activity that violates applicable laws or regulations</li>
          </ul>
        </>
      )
    },
    {
      id: 'content',
      title: '4. User Content & License Grant',
      content: (
        <>
          <p className="mb-2">You may upload course materials, emails, client data, and other content ("User Content").</p>
          <p className="mb-2">You retain ownership of your User Content.</p>
          <p className="mb-2">You grant us a limited, non-exclusive, worldwide license to process and use your User Content solely to provide the Services, including training AI agents and generating automated responses.</p>
          <p>You are responsible for ensuring you have the rights to upload and use all User Content, and that it does not violate any third-party rights or applicable laws.</p>
        </>
      )
    },
    {
      id: 'ai',
      title: '5. AI-Generated Content',
      content: (
        <>
          <p className="mb-2">Our Services use artificial intelligence to generate content, responses, and automation workflows.</p>
          <p className="mb-2">AI-generated content is provided "as is" and may contain errors or inaccuracies.</p>
          <p className="mb-2">You are responsible for reviewing and verifying all AI-generated content before using it with your clients or in your business.</p>
          <p>We are not liable for any consequences resulting from your reliance on AI-generated content.</p>
        </>
      )
    },
    {
      id: 'payments',
      title: '6. Subscriptions & Payments',
      content: (
        <>
          <p className="mb-2">Some Services require a paid subscription. Fees and billing terms will be presented at signup.</p>
          <p className="mb-2">All payments are non-refundable unless otherwise stated in writing or required by law.</p>
          <p className="mb-2">We may change subscription prices with 30 days prior notice via email or platform notification.</p>
          <p>Failure to pay fees may result in suspension or termination of your access to the Services.</p>
        </>
      )
    },
    {
      id: 'thirdparty',
      title: '7. Third-Party Services & Integrations',
      content: (
        <>
          <p className="mb-2">Our Services may integrate with third-party service providers (e.g., email platforms, CRM systems, scheduling tools, payment processors, cloud hosting).</p>
          <p className="mb-2">Use of those services is subject to their own terms and privacy policies.</p>
          <p>We are not responsible for the actions, failures, or data practices of third-party services.</p>
        </>
      )
    },
    {
      id: 'ip',
      title: '8. Intellectual Property',
      content: (
        <>
          <p className="mb-2">The Services, including software, design, features, trademarks, and branding, are owned by Next Level Coach AI and protected by copyright, trademark, and other intellectual property laws.</p>
          <p className="mb-2">You may not copy, modify, distribute, reverse engineer, or create derivative works without our written permission.</p>
          <p>Any feedback or suggestions you provide about the Services may be used by us without obligation or compensation to you.</p>
        </>
      )
    },
    {
      id: 'termination',
      title: '9. Account Suspension & Termination',
      content: (
        <>
          <p className="mb-2">We may suspend or terminate your access if you:</p>
          <ul className="list-disc pl-6 space-y-1 mb-2">
            <li>Violate these Terms</li>
            <li>Fail to pay fees</li>
            <li>Misuse the Services or engage in fraudulent activity</li>
          </ul>
          <p className="mb-2">You may cancel your subscription at any time through your account settings.</p>
          <p>Termination does not relieve you of payment obligations already incurred. Upon termination, your access to the Services will cease, though we may retain certain data as required by law or our Privacy Policy.</p>
        </>
      )
    },
    {
      id: 'disclaimers',
      title: '10. Disclaimers & No Warranties',
      content: (
        <>
          <p className="mb-2">The Services are provided "as is" and "as available" without warranties of any kind, either express or implied.</p>
          <p className="mb-2">We do not guarantee that the Services will be error-free, uninterrupted, secure, or produce specific business results.</p>
          <p className="mb-2">We disclaim all warranties, including warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
          <p>You assume all risks associated with your use of the Services.</p>
        </>
      )
    },
    {
      id: 'liability',
      title: '11. Limitation of Liability',
      content: (
        <>
          <p className="mb-2">To the maximum extent permitted by law:</p>
          <p className="mb-2">We are not liable for indirect, incidental, consequential, special, or punitive damages, including lost profits, lost data, or business interruption.</p>
          <p className="mb-2">Our total liability to you for any claim arising from these Terms or your use of the Services will not exceed the amount you paid us in the 12 months before the claim arose.</p>
          <p>Some jurisdictions do not allow limitations on liability, so these limitations may not apply to you.</p>
        </>
      )
    },
    {
      id: 'indemnification',
      title: '12. Indemnification',
      content: 'You agree to indemnify, defend, and hold harmless Next Level Coach AI, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your misuse of the Services, violation of these Terms, or infringement of any third-party rights.'
    },
    {
      id: 'governing',
      title: '13. Governing Law & Dispute Resolution',
      content: (
        <>
          <p className="mb-2">These Terms are governed by the laws of the State of [Insert State], without regard to conflict of laws principles.</p>
          <p className="mb-2">Any disputes will be resolved in the courts of [Insert State, County].</p>
          <p>By using the Services, you agree to submit to the jurisdiction of these courts.</p>
        </>
      )
    },
    {
      id: 'changes',
      title: '14. Changes to Terms',
      content: (
        <>
          <p className="mb-2">We may update these Terms from time to time.</p>
          <p className="mb-2">If changes are material, we will notify you by email or through the platform at least 7 days before they take effect.</p>
          <p>Continued use of the Services after changes means you accept the new Terms. If you do not agree, you must stop using the Services.</p>
        </>
      )
    },
    {
      id: 'general',
      title: '15. General Provisions',
      content: (
        <>
          <p className="mb-2"><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Next Level Coach AI regarding the Services.</p>
          <p className="mb-2"><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect.</p>
          <p className="mb-2"><strong>Waiver:</strong> Failure to enforce any right does not waive that right.</p>
          <p><strong>Assignment:</strong> You may not assign these Terms without our written consent. We may assign our rights and obligations without restriction.</p>
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen text-white">
      <div className="glow-orb glow-orb--lg -top-96 -right-96 opacity-40" />
      <div className="glow-orb glow-orb--lg glow-orb--purple -bottom-96 -left-96 opacity-40" />

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl py-8 md:py-12 px-4 md:px-8 border border-purple-500/20">
            <div className="flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-purple-400 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Terms of Service</h1>
            </div>

            <p className="text-center text-gray-400 mb-8">Last Updated: October 1, 2025</p>

            <div className="mb-8 p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <p className="text-white/90 leading-relaxed">
                Welcome to Next Level Coach AI ("we," "our," "us"). These Terms of Service ("Terms") govern your access to and use of our platform, applications, and services (the "Services"). By using the Services, you agree to these Terms. If you do not agree, do not use our Services.
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
                If you have questions about these Terms, please contact us at:
              </p>
              <p className="text-purple-400 font-semibold">support@nextlevelcoach.ai</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
