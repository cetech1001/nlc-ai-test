import React from 'react';
import { Sparkles, Brain, Zap, Target } from 'lucide-react';

export const WelcomeStep = ({ onContinue }: { onContinue: () => void }) => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-purple-400" />
        </div>

        <h2 className="text-4xl font-bold text-white">
          Welcome to Your AI-Powered Coaching Platform
        </h2>

        <p className="text-xl text-stone-300 max-w-2xl mx-auto">
          Let's personalize your AI agents to match your unique coaching style, voice, and approach.
          This will take about 10-15 minutes.
        </p>
      </div>

      {/* What We'll Cover */}
      <div className="bg-neutral-800/50 rounded-2xl p-8 border border-neutral-700">
        <h3 className="text-xl font-semibold text-white mb-6">What We'll Cover</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Your Coaching Style</h4>
              <p className="text-stone-400 text-sm">
                Answer scenario-based questions to help our AI understand your approach, tone, and methodology.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-fuchsia-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Training Materials</h4>
              <p className="text-stone-400 text-sm">
                Upload documents like email threads, frameworks, FAQs, and transcripts to train your AI.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Account Connections</h4>
              <p className="text-stone-400 text-sm">
                Connect your email, social media, and other platforms for seamless automation.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Review & Launch</h4>
              <p className="text-stone-400 text-sm">
                Review your setup and activate your personalized AI agents.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Matters */}
      <div className="bg-gradient-to-r from-purple-900/20 to-fuchsia-900/20 rounded-2xl p-6 border border-purple-500/30">
        <div className="flex gap-4">
          <div className="text-3xl">🎯</div>
          <div>
            <h4 className="text-white font-semibold mb-2">Why This Matters</h4>
            <p className="text-stone-300 text-sm">
              The more we know about your coaching style and business, the better your AI agents will represent you.
              They'll sound like you, respond like you, and make decisions aligned with your values and approach.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="text-center">
        <p className="text-stone-500 text-sm">
          🔒 Your data is encrypted and secure. We use it solely to personalize your AI agents.
        </p>
      </div>
    </div>
  );
};

export default WelcomeStep;
