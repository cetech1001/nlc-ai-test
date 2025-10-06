'use client'

import React, { useState } from 'react';
import { Check, AlertTriangle, Sparkles, Rocket, ChevronRight, Edit2, FileText, Link2 } from 'lucide-react';

interface OnboardingData {
  scenarios: {
    completed: number;
    total: number;
  };
  documents: {
    uploaded: number;
    categories: string[];
  };
  connections: {
    essential: number;
    social: number;
  };
}

export const ReviewCompleteStep = ({ onComplete }: { onComplete: () => void }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Mock data - in real app this would come from state/props
  const data: OnboardingData = {
    scenarios: {
      completed: 10,
      total: 12
    },
    documents: {
      uploaded: 8,
      categories: ['Email Threads', 'Frameworks', 'FAQs', 'Transcripts']
    },
    connections: {
      essential: 2,
      social: 3
    }
  };

  const completionScore = Math.round(
    ((data.scenarios.completed / data.scenarios.total) * 40 +
      (Math.min(data.documents.uploaded, 10) / 10) * 30 +
      (data.connections.essential >= 1 ? 20 : 0) +
      (data.connections.social > 0 ? 10 : 0))
  );

  const isReady = data.connections.essential >= 1 && data.scenarios.completed >= 8;

  const handleLaunch = async () => {
    if (!agreedToTerms) return;

    setIsProcessing(true);

    // Simulate AI training process
    await new Promise(resolve => setTimeout(resolve, 3000));

    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Completion Score */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-2xl border border-neutral-700 p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-purple-200 via-purple-600 to-violet-600 rounded-full blur-[112px]" />
        </div>

        <div className="relative z-10 text-center">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-neutral-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - completionScore / 100)}`}
                className="transition-all duration-1000"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#e935c1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl font-bold text-white">{completionScore}%</div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            {completionScore >= 80 ? 'Excellent Setup!' : completionScore >= 60 ? 'Good Progress!' : 'Getting Started'}
          </h2>
          <p className="text-stone-300">
            {completionScore >= 80
              ? 'Your AI is well-trained and ready to represent you authentically'
              : completionScore >= 60
                ? 'Your AI has enough information to get started effectively'
                : 'Add more information to improve AI accuracy'}
          </p>
        </div>
      </div>

      {/* Setup Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-neutral-800/30 rounded-xl p-5 border border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-purple-400" />
            </div>
            <button className="text-stone-400 hover:text-white text-sm">
              Edit
            </button>
          </div>
          <h3 className="text-white font-semibold mb-2">Coaching Style</h3>
          <div className="text-2xl font-bold text-white mb-1">
            {data.scenarios.completed}/{data.scenarios.total}
          </div>
          <p className="text-stone-400 text-sm">scenarios answered</p>
        </div>

        <div className="bg-neutral-800/30 rounded-xl p-5 border border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-fuchsia-400" />
            </div>
            <button className="text-stone-400 hover:text-white text-sm">
              Edit
            </button>
          </div>
          <h3 className="text-white font-semibold mb-2">Documents</h3>
          <div className="text-2xl font-bold text-white mb-1">
            {data.documents.uploaded}
          </div>
          <p className="text-stone-400 text-sm">files uploaded</p>
        </div>

        <div className="bg-neutral-800/30 rounded-xl p-5 border border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-violet-400" />
            </div>
            <button className="text-stone-400 hover:text-white text-sm">
              Edit
            </button>
          </div>
          <h3 className="text-white font-semibold mb-2">Connections</h3>
          <div className="text-2xl font-bold text-white mb-1">
            {data.connections.essential + data.connections.social}
          </div>
          <p className="text-stone-400 text-sm">accounts connected</p>
        </div>
      </div>

      {/* Readiness Check */}
      <div className="bg-neutral-800/30 rounded-xl border border-neutral-700 overflow-hidden">
        <div className="p-5 border-b border-neutral-700">
          <h3 className="text-white font-semibold text-lg">Readiness Check</h3>
          <p className="text-stone-400 text-sm">Ensure you're ready to launch your AI agents</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            {data.connections.essential >= 1 ? (
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-green-400" />
              </div>
            ) : (
              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
            )}
            <div>
              <p className="text-white font-medium">Essential Account Connected</p>
              <p className="text-stone-400 text-sm">
                {data.connections.essential >= 1
                  ? `${data.connections.essential} essential account(s) connected`
                  : 'Connect at least one email provider to enable AI automation'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {data.scenarios.completed >= 8 ? (
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-green-400" />
              </div>
            ) : (
              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
            )}
            <div>
              <p className="text-white font-medium">Coaching Style Defined</p>
              <p className="text-stone-400 text-sm">
                {data.scenarios.completed >= 8
                  ? `${data.scenarios.completed} scenarios answered - your style is well-defined`
                  : `Answer at least 8 scenarios (${data.scenarios.completed}/8 completed)`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {data.documents.uploaded >= 5 ? (
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-green-400" />
              </div>
            ) : (
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              </div>
            )}
            <div>
              <p className="text-white font-medium">Training Materials Uploaded</p>
              <p className="text-stone-400 text-sm">
                {data.documents.uploaded >= 5
                  ? `${data.documents.uploaded} documents uploaded - great foundation!`
                  : `${data.documents.uploaded} documents uploaded (5+ recommended for best results)`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="bg-gradient-to-r from-purple-900/20 to-fuchsia-900/20 rounded-2xl p-6 border border-purple-500/30">
        <div className="flex gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">What Happens Next?</h3>
            <p className="text-stone-300 text-sm mb-4">
              Once you launch, our AI will begin training on your data. Here's what to expect:
            </p>
          </div>
        </div>

        <div className="space-y-3 ml-16">
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-400 text-xs font-bold">1</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">AI Training (2-5 minutes)</p>
              <p className="text-stone-400 text-xs">We'll process your responses, documents, and connections</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-400 text-xs font-bold">2</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Agent Activation</p>
              <p className="text-stone-400 text-xs">Your AI agents will be ready to automate tasks and communications</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-400 text-xs font-bold">3</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Dashboard Tour</p>
              <p className="text-stone-400 text-xs">We'll show you around and help you get started</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-400 text-xs font-bold">4</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Continuous Learning</p>
              <p className="text-stone-400 text-xs">Your AI improves over time as you approve and edit its outputs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="bg-neutral-800/30 rounded-xl p-5 border border-neutral-700">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-neutral-600 bg-black/30 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
          />
          <div>
            <p className="text-white font-medium mb-1">Ready to Launch</p>
            <p className="text-stone-400 text-sm">
              I understand that my AI agents will use the information I've provided to automate tasks and communications on my behalf.
              I can review, edit, or disable any AI actions at any time. I agree to the{' '}
              <a href="/terms" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" className="text-purple-400 hover:text-purple-300 underline">
                Privacy Policy
              </a>.
            </p>
          </div>
        </label>
      </div>

      {/* Launch Button */}
      {!isReady && (
        <div className="bg-orange-900/20 rounded-xl p-4 border border-orange-500/30">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div>
              <p className="text-orange-400 font-medium text-sm mb-1">Action Required</p>
              <p className="text-stone-300 text-sm">
                Please complete the required items above before launching your AI agents.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleLaunch}
        disabled={!isReady || !agreedToTerms || isProcessing}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            Training Your AI Agents...
          </>
        ) : (
          <>
            <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Launch My AI Agents
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Bottom Note */}
      <div className="text-center">
        <p className="text-stone-500 text-sm">
          🔒 Your data is secure and you maintain full control over your AI agents
        </p>
      </div>
    </div>
  );
};
