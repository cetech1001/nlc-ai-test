'use client'

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { BackTo } from "@nlc-ai/web-shared";
import {useRouter} from "next/navigation";

const CourseCreateScreen = () => {
  const router = useRouter();
  const [courseDescription, setCourseDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async () => {
    if (!courseDescription.trim()) return;

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      // Navigate to curriculum screen with generated structure
      console.log('Generated course structure for:', courseDescription);
    }, 3000);
  };

  const handleBack = () => {
    // Navigate back to courses page
    router.push('/courses');
  };

  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-16">
        <div className="w-full px-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <BackTo onClick={handleBack} title={'Create New Course'}/>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 overflow-hidden">
              {/* Glow Effect */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute w-64 h-64 -right-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
              </div>

              <div className="relative z-10 p-8 lg:p-12">
                <div className="space-y-8">
                  {/* AI Icon and Title */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-violet-600 rounded-2xl mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-white text-2xl font-bold mb-2">AI Course Generator</h2>
                    <p className="text-stone-300">
                      Tell us about your course and we'll create a structured curriculum for you
                    </p>
                  </div>

                  {/* Course Description Input */}
                  <div className="space-y-3">
                    <label htmlFor="courseDescription" className="block text-white text-lg font-semibold">
                      Course Description
                    </label>
                    <textarea
                      id="courseDescription"
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      placeholder="Describe your course idea in detail. For example: 'I want to create a comprehensive Instagram marketing course that teaches coaches how to grow their following, create engaging content, use hashtags effectively, and convert followers into paying clients. The course should cover content strategy, analytics, Instagram ads, and monetization techniques.'"
                      rows={8}
                      className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-2 focus:ring-[#7B21BA]/20 rounded-xl px-4 py-4 text-base resize-none outline-none transition-colors"
                      disabled={isGenerating}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-stone-400 text-sm">
                        Be as detailed as possible for better AI-generated structure
                      </p>
                      <span className="text-stone-400 text-sm">
                        {courseDescription.length} characters
                      </span>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-4">
                    <h3 className="text-white text-lg font-semibold">Need inspiration? Try these examples:</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {[
                        "Life coaching fundamentals covering goal setting, active listening, motivation techniques, and client relationship building",
                        "TikTok marketing for coaches including viral content creation, trending audio usage, and lead generation strategies"
                      ].map((example, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCourseDescription(example)}
                          disabled={isGenerating}
                          className="text-left p-4 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-stone-300 hover:border-[#7B21BA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <p className="text-sm">{example}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!courseDescription.trim() || isGenerating}
                      className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg min-w-[200px] justify-center"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Course Structure
                        </>
                      )}
                    </button>
                  </div>

                  {/* Loading State */}
                  {isGenerating && (
                    <div className="text-center space-y-4 pt-8">
                      <div className="text-stone-300">
                        <p className="font-medium">Creating your course structure...</p>
                        <p className="text-sm text-stone-400 mt-1">
                          This may take a few moments while our AI analyzes your description
                        </p>
                      </div>

                      {/* Progress indicator */}
                      <div className="flex justify-center space-x-2">
                        <div className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCreateScreen;
