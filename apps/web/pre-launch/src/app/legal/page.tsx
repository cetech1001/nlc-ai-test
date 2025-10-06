'use client'

import React, { useState } from 'react';
import {PrivacyPolicy, TermsOfService} from "@/lib";

const Legal = () => {
  const [view, setView] = useState<'terms' | 'privacy'>('terms');

  return (
    <div className="min-h-screen bg-black">
      <div className="p-6 bg-black/50 backdrop-blur-lg border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto flex justify-center gap-4">
          <button
            onClick={() => setView('terms')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              view === 'terms'
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setView('privacy')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              view === 'privacy'
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
        </div>
      </div>

      {view === 'terms' ? <TermsOfService /> : <PrivacyPolicy />}
    </div>
  );
};

export default Legal;
