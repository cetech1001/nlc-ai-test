'use client'

import React, { useState } from 'react';
import { ChevronDown, MessageCircle, AlertCircle } from 'lucide-react';

interface ScenarioQuestion {
  id: string;
  category: string;
  question: string;
  placeholder: string;
  helpText: string;
}

const SCENARIOS: ScenarioQuestion[] = [
  {
    id: 'client_introduction',
    category: 'Communication Style',
    question: 'How would you introduce yourself to a new prospective client in an email?',
    placeholder: 'Example: Hi [Name], I\'m thrilled to connect with you! I specialize in helping entrepreneurs...',
    helpText: 'This helps us understand your tone, formality level, and how you build rapport.'
  },
  {
    id: 'client_struggling',
    category: 'Problem Solving',
    question: 'A client messages you saying they\'re struggling to stay motivated. How do you respond?',
      placeholder: 'Share your typical response approach...',
  helpText: 'We\'ll learn how you provide emotional support and encouragement.'
},
{
  id: 'missed_deadline',
    category: 'Accountability',
  question: 'A client missed an important deadline they committed to. What do you say?',
  placeholder: 'Describe how you handle accountability while maintaining the relationship...',
  helpText: 'This shows us how you balance accountability with empathy.'
},
{
  id: 'pricing_inquiry',
    category: 'Sales & Pricing',
  question: 'Someone asks about your pricing but seems hesitant. How do you handle this conversation?',
  placeholder: 'Explain your approach to pricing discussions...',
  helpText: 'Helps us understand your sales style and how you communicate value.'
},
{
  id: 'program_structure',
    category: 'Methodology',
  question: 'Describe your coaching methodology or framework in 2-3 sentences.',
  placeholder: 'Example: I use a three-pillar approach focusing on mindset, strategy, and execution...',
  helpText: 'This defines the core structure of your coaching approach.'
},
{
  id: 'success_celebration',
    category: 'Client Success',
  question: 'A client just achieved a major breakthrough. How do you celebrate with them?',
  placeholder: 'Share how you acknowledge and celebrate wins...',
  helpText: 'Shows us how you reinforce positive outcomes and build momentum.'
},
{
  id: 'boundary_setting',
    category: 'Professional Boundaries',
  question: 'A client wants to extend a session beyond scheduled time. How do you respond?',
  placeholder: 'Describe how you maintain boundaries while being supportive...',
  helpText: 'Teaches the AI how you maintain professional boundaries.'
},
{
  id: 'difficult_feedback',
    category: 'Difficult Conversations',
  question: 'You need to give a client challenging feedback about their lack of progress. What do you say?',
  placeholder: 'Explain your approach to tough conversations...',
  helpText: 'We\'ll learn how you handle difficult situations with care.'
},
{
  id: 'referral_request',
    category: 'Business Growth',
  question: 'How do you ask satisfied clients for referrals or testimonials?',
  placeholder: 'Share your approach to requesting referrals...',
  helpText: 'Helps us understand your business development style.'
},
{
  id: 'unique_approach',
    category: 'Brand Identity',
  question: 'What makes your coaching approach unique? What do clients say sets you apart?',
  placeholder: 'Describe your unique value proposition...',
  helpText: 'This captures your brand identity and differentiation.'
},
{
  id: 'ideal_client',
    category: 'Target Audience',
  question: 'Describe your ideal client. Who do you work best with?',
  placeholder: 'Example: I work best with entrepreneurs who are growth-minded and action-oriented...',
  helpText: 'Helps the AI understand who to prioritize and how to qualify leads.'
},
{
  id: 'communication_preferences',
    category: 'Communication Style',
  question: 'Do you prefer formal or casual communication? Give examples of phrases you commonly use.',
  placeholder: 'Example: I\'m casual but professional. I often say "Let\'s dive in" or "Here\'s what I\'m thinking..."',
  helpText: 'Captures your authentic voice and language patterns.'
}
];

export const ScenariosStep = ({ onContinue }: { onContinue: () => void }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(SCENARIOS[0].id);

  const handleAnswerChange = (questionID: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionID]: value }));
  };

  const answeredCount = Object.keys(answers).filter(key => answers[key]?.trim()).length;
  const progress = (answeredCount / SCENARIOS.length) * 100;

  const categoryColors: Record<string, string> = {
    'Communication Style': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    'Problem Solving': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    'Accountability': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    'Sales & Pricing': 'text-green-400 bg-green-500/10 border-green-500/30',
    'Methodology': 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30',
    'Client Success': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    'Professional Boundaries': 'text-red-400 bg-red-500/10 border-red-500/30',
    'Difficult Conversations': 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    'Business Growth': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    'Brand Identity': 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    'Target Audience': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">Your Progress</h3>
            <p className="text-stone-400 text-sm">
              {answeredCount} of {SCENARIOS.length} questions answered
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
            <div className="text-stone-400 text-xs">Complete</div>
          </div>
        </div>

        <div className="w-full bg-neutral-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-purple-900/20 to-fuchsia-900/20 rounded-xl p-4 border border-purple-500/30">
        <div className="flex gap-3">
          <MessageCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-medium mb-1">Be Authentic</h4>
            <p className="text-stone-300 text-sm">
              Answer as you naturally would. The more authentic you are, the better your AI will represent you.
              You can skip questions and come back to them later.
            </p>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {SCENARIOS.map((scenario, index) => {
          const isExpanded = expandedQuestion === scenario.id;
          const isAnswered = answers[scenario.id]?.trim().length > 0;

          return (
            <div
              key={scenario.id}
              className={`bg-neutral-800/30 rounded-xl border transition-all ${
                isAnswered
                  ? 'border-green-500/30'
                  : isExpanded
                    ? 'border-purple-500/50'
                    : 'border-neutral-700'
              }`}
            >
              <button
                onClick={() => setExpandedQuestion(isExpanded ? null : scenario.id)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                    isAnswered
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-neutral-700 text-stone-400 border border-neutral-600'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        categoryColors[scenario.category] || 'text-stone-400 bg-neutral-700/50 border-neutral-600'
                      }`}>
                        {scenario.category}
                      </span>
                    </div>
                    <h4 className="text-white font-medium">{scenario.question}</h4>
                  </div>
                </div>

                <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} />
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-4">
                  <div className="flex items-start gap-2 text-sm text-stone-400 bg-neutral-900/50 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-purple-400" />
                    <p>{scenario.helpText}</p>
                  </div>

                  <textarea
                    value={answers[scenario.id] || ''}
                    onChange={(e) => handleAnswerChange(scenario.id, e.target.value)}
                    placeholder={scenario.placeholder}
                    rows={6}
                    className="w-full bg-black/30 border border-neutral-600 rounded-lg p-4 text-white placeholder-stone-500 focus:border-purple-500 focus:outline-none resize-none"
                  />

                  <div className="flex justify-between items-center text-xs text-stone-500">
                    <span>{answers[scenario.id]?.length || 0} characters</span>
                    {answers[scenario.id]?.trim().length > 0 && (
                      <span className="text-green-400 flex items-center gap-1">
                        ✓ Answered
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Reminder */}
      <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700 text-center">
        <p className="text-stone-400 text-sm">
          💡 You can always update these responses later in your settings
        </p>
      </div>
    </div>
  );
};
