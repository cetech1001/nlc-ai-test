'use client';

import { useState } from 'react';
import { X, Sparkles, Settings, Zap, Clock, Target } from 'lucide-react';
import { Button } from '@nlc-ai/ui';
import { aiAgentsAPI } from '@nlc-ai/api-client';
import { SEQUENCE_TEMPLATES, TIMING_OPTIONS, EmailSequenceWithEmails } from '@nlc-ai/types';

interface CreateSequenceModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  leadID: string;
  leadName: string;
  leadEmail: string;
  leadStatus: string;
  onSequenceCreatedAction: (sequence: EmailSequenceWithEmails) => void;
}

export const CreateSequenceModal = ({
  isOpen,
  onCloseAction,
  leadID,
  leadName,
  leadEmail,
  leadStatus,
  onSequenceCreatedAction,
}: CreateSequenceModalProps) => {
  const [step, setStep] = useState<'template' | 'customize' | 'confirm'>('template');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [emailCount, setEmailCount] = useState(4);
  const [customInstructions, setCustomInstructions] = useState('');
  const [useCustomTimings, setUseCustomTimings] = useState(false);
  const [customTimings, setCustomTimings] = useState<string[]>([]);

  const currentTemplate = SEQUENCE_TEMPLATES.find(t => t.type === selectedTemplate);

  const handleTemplateSelect = (templateType: string) => {
    setSelectedTemplate(templateType);
    const template = SEQUENCE_TEMPLATES.find(t => t.type === templateType);
    if (template) {
      setEmailCount(template.recommendedEmailCount);
      setCustomTimings(template.defaultTimings.slice(0, template.recommendedEmailCount));
    }
    setStep('customize');
  };

  const handleCreateSequence = async () => {
    try {
      setIsCreating(true);

      console.log("Lead ID: ", leadID);

      const sequence = await aiAgentsAPI.generateFollowupSequence({
        leadID,
        sequenceConfig: {
          emailCount,
          sequenceType: selectedTemplate as any,
          customInstructions: customInstructions || undefined,
          timings: useCustomTimings && customTimings.length > 0 ? customTimings : undefined,
        }
      });

      onSequenceCreatedAction(sequence);
      onCloseAction();

      // Reset form
      setStep('template');
      setSelectedTemplate('standard');
      setEmailCount(4);
      setCustomInstructions('');
      setUseCustomTimings(false);
      setCustomTimings([]);

    } catch (error) {
      console.error('Failed to create sequence:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const updateCustomTiming = (index: number, value: string) => {
    const newTimings = [...customTimings];
    newTimings[index] = value;
    setCustomTimings(newTimings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative group max-w-4xl w-full max-h-[95vh] overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-300"></div>

        <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border border-[#3A3A3A] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#3A3A3A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Create AI Email Sequence</h2>
                <p className="text-sm text-[#A0A0A0]">{leadName} ({leadEmail})</p>
              </div>
            </div>

            <button
              onClick={onCloseAction}
              className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center text-[#A0A0A0] hover:text-white hover:border-[#555] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center p-4 border-b border-[#3A3A3A]">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${step === 'template' ? 'text-violet-400' : 'text-[#666]'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === 'template' ? 'bg-violet-600/20 text-violet-400' : 'bg-[#3A3A3A] text-[#666]'
                }`}>
                  1
                </div>
                <span className="text-sm">Template</span>
              </div>

              <div className={`w-8 h-px ${step !== 'template' ? 'bg-violet-600/30' : 'bg-[#3A3A3A]'}`}></div>

              <div className={`flex items-center gap-2 ${step === 'customize' ? 'text-violet-400' : 'text-[#666]'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === 'customize' ? 'bg-violet-600/20 text-violet-400' : 'bg-[#3A3A3A] text-[#666]'
                }`}>
                  2
                </div>
                <span className="text-sm">Customize</span>
              </div>

              <div className={`w-8 h-px ${step === 'confirm' ? 'bg-violet-600/30' : 'bg-[#3A3A3A]'}`}></div>

              <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-violet-400' : 'text-[#666]'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === 'confirm' ? 'bg-violet-600/20 text-violet-400' : 'bg-[#3A3A3A] text-[#666]'
                }`}>
                  3
                </div>
                <span className="text-sm">Confirm</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Template Selection */}
            {step === 'template' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">Choose Your Email Strategy</h3>
                  <p className="text-[#A0A0A0]">Select a template that matches your lead's engagement level and your goals</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SEQUENCE_TEMPLATES.map((template) => (
                    <div
                      key={template.type}
                      onClick={() => handleTemplateSelect(template.type)}
                      className="border border-[#3A3A3A] rounded-xl p-6 cursor-pointer hover:border-violet-600/50 bg-[#2A2A2A] hover:bg-[#2E2E2E] transition-all group"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-lg flex items-center justify-center group-hover:from-violet-600/30 group-hover:to-fuchsia-600/30 transition-all">
                          {template.type === 'aggressive' && <Zap className="w-5 h-5 text-violet-400" />}
                          {template.type === 'standard' && <Target className="w-5 h-5 text-violet-400" />}
                          {template.type === 'nurturing' && <Clock className="w-5 h-5 text-violet-400" />}
                          {template.type === 'minimal' && <Settings className="w-5 h-5 text-violet-400" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{template.name}</h4>
                          <p className="text-[#A0A0A0] text-sm mb-2">{template.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#666]">Emails:</span>
                          <span className="text-violet-400">{template.recommendedEmailCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#666]">Timing:</span>
                          <span className="text-[#A0A0A0]">{template.defaultTimings.slice(0, 2).join(', ')}</span>
                        </div>
                        <div className="pt-1 border-t border-[#3A3A3A]">
                          <span className="text-[#666]">Best for:</span>
                          <p className="text-[#A0A0A0] mt-1">{template.useCase}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Customization */}
            {step === 'customize' && currentTemplate && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">Customize Your Sequence</h3>
                  <p className="text-[#A0A0A0]">Fine-tune the {currentTemplate.name.toLowerCase()} for {leadName}</p>
                </div>

                {/* Email Count */}
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4">
                  <h4 className="text-white font-medium mb-3">Number of Emails</h4>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={emailCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        setEmailCount(count);
                        if (useCustomTimings) {
                          const newTimings = [...customTimings];
                          while (newTimings.length < count) {
                            newTimings.push('1-week');
                          }
                          setCustomTimings(newTimings.slice(0, count));
                        }
                      }}
                      className="flex-1 h-2 bg-[#3A3A3A] rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="w-12 text-center">
                      <span className="text-violet-400 font-medium text-lg">{emailCount}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-[#666] mt-1">
                    <span>2 emails</span>
                    <span>8 emails</span>
                  </div>
                </div>

                {/* Custom Instructions */}
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4">
                  <h4 className="text-white font-medium mb-3">Custom Instructions (Optional)</h4>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g., Focus on productivity challenges. Mention our new framework. Keep tone casual and friendly."
                    className="w-full h-20 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white placeholder:text-[#666] focus:border-violet-600/50 focus:outline-none resize-none"
                  />
                  <p className="text-xs text-[#666] mt-2">
                    These instructions will be used by AI to customize the email content for this specific lead
                  </p>
                </div>

                {/* Timing Customization */}
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Email Timing</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useCustomTimings}
                        onChange={(e) => {
                          setUseCustomTimings(e.target.checked);
                          if (e.target.checked && customTimings.length === 0) {
                            setCustomTimings(currentTemplate.defaultTimings.slice(0, emailCount));
                          }
                        }}
                        className="rounded border-[#3A3A3A] bg-[#1A1A1A] text-violet-600 focus:ring-violet-600/50"
                      />
                      <span className="text-sm text-[#A0A0A0]">Customize timing</span>
                    </label>
                  </div>

                  {useCustomTimings ? (
                    <div className="space-y-3">
                      {Array.from({ length: emailCount }, (_, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-violet-600/20 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-violet-400">{index + 1}</span>
                          </div>
                          <select
                            value={customTimings[index] || 'immediate'}
                            onChange={(e) => updateCustomTiming(index, e.target.value)}
                            className="flex-1 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white focus:border-violet-600/50 focus:outline-none"
                          >
                            {TIMING_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label} - {option.description}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-[#A0A0A0]">
                      Using default {currentTemplate.name.toLowerCase()} timing: {' '}
                      {currentTemplate.defaultTimings.slice(0, emailCount).join(' → ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 'confirm' && currentTemplate && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">Ready to Create Sequence</h3>
                  <p className="text-[#A0A0A0]">Review your settings and create the AI email sequence</p>
                </div>

                <div className="bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-violet-600/20 rounded-xl p-6">
                  <h4 className="text-white font-medium mb-4">Sequence Summary</h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-[#A0A0A0] text-sm">Template:</span>
                      <div className="text-white font-medium">{currentTemplate.name}</div>
                    </div>
                    <div>
                      <span className="text-[#A0A0A0] text-sm">Emails:</span>
                      <div className="text-white font-medium">{emailCount} emails</div>
                    </div>
                    <div>
                      <span className="text-[#A0A0A0] text-sm">Lead:</span>
                      <div className="text-white font-medium">{leadName}</div>
                    </div>
                    <div>
                      <span className="text-[#A0A0A0] text-sm">Status:</span>
                      <div className="text-white font-medium capitalize">{leadStatus}</div>
                    </div>
                  </div>

                  {customInstructions && (
                    <div className="mb-4">
                      <span className="text-[#A0A0A0] text-sm">Custom Instructions:</span>
                      <div className="text-white text-sm mt-1 bg-[#2A2A2A] rounded p-2">
                        {customInstructions}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[#A0A0A0] text-sm">Timing:</span>
                    <div className="text-white text-sm mt-1">
                      {useCustomTimings && customTimings.length > 0 ?
                        customTimings.slice(0, emailCount).join(' → ') :
                        currentTemplate.defaultTimings.slice(0, emailCount).join(' → ')
                      }
                    </div>
                  </div>
                </div>

                <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl p-4">
                  <h5 className="text-white font-medium mb-2">What happens next?</h5>
                  <ul className="space-y-1 text-sm text-[#A0A0A0]">
                    <li>• AI will generate {emailCount} personalized emails using your coach profile</li>
                    <li>• Each email will match your authentic voice and communication style</li>
                    <li>• Emails will be scheduled according to the timing you've set</li>
                    <li>• You can edit any email before it's sent</li>
                    <li>• Deliverability will be analyzed for each email</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-[#3A3A3A]">
            <div className="text-sm text-[#A0A0A0]">
              {step === 'template' && 'Choose a template to get started'}
              {step === 'customize' && 'Customize your sequence settings'}
              {step === 'confirm' && 'All set! Create your AI sequence'}
            </div>

            <div className="flex gap-3">
              {step !== 'template' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (step === 'customize') setStep('template');
                    if (step === 'confirm') setStep('customize');
                  }}
                  className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
                >
                  Back
                </Button>
              )}

              <Button
                variant="outline"
                onClick={onCloseAction}
                className="border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
              >
                Cancel
              </Button>

              {step === 'customize' && (
                <Button
                  onClick={() => setStep('confirm')}
                  className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
                >
                  Continue
                </Button>
              )}

              {step === 'confirm' && (
                <Button
                  onClick={handleCreateSequence}
                  disabled={isCreating}
                  className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Sequence...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Create AI Sequence
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
