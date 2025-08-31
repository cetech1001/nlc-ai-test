'use client'

import React, {memo, useState, useCallback} from 'react';
import { useRouter } from 'next/navigation';
import {ChevronRight, CheckCircle, ChevronLeft} from 'lucide-react';
import { PageBackground } from '@/lib/components';
import {hashString, LeadAnswers, LeadQuestionOption, questions} from "@nlc-ai/sdk-leads";

const persistAnswersWithHash = (answers: LeadAnswers) => {
  const serialized = JSON.stringify(answers);
  const checksum = hashString(serialized);
  sessionStorage.setItem('quizAnswers', serialized);
  sessionStorage.setItem('quizAnswersHash', checksum);
};

const buttonBaseClasses = "w-full p-3 sm:p-6 cursor-pointer rounded-2xl border-2 transition-transform duration-150 text-left will-change-transform";

const getButtonClasses = (isSelected: boolean) => {
  if (isSelected) {
    return `${buttonBaseClasses} border-purple-400 bg-purple-500/20 text-white scale-[1.02]`;
  }
  return `${buttonBaseClasses} border-gray-700 bg-black/20 hover:scale-[1.01] hover:border-purple-400/50 text-white/80`;
};

const ProgressBar = memo(({ currentQuestion }: { currentQuestion: number }) => (
  <div className="flex items-center justify-center mb-8">
    {questions.map((_, index) => {
      const step = index + 1;
      const isCompleted = index < currentQuestion;
      const isActive = index === currentQuestion;
      const isPrevActive = index - 1 === currentQuestion;
      return (
        <React.Fragment key={step}>
          {index > 0 && (
            <>
              <div
                key={`line-${step}`}
                className={`flex-1 h-0.5 ${
                  isCompleted || isActive || isPrevActive
                    ? 'bg-gradient-to-l from-purple-500 to-fuchsia-500'
                    : 'bg-gray-700'
                }`}
              />
              <div
                key={`line-${step}-x`}
                className={`flex-1 h-0.5 ${
                  isCompleted || isActive
                    ? 'bg-gradient-to-l from-purple-500 to-fuchsia-500'
                    : 'bg-gray-700'
                }`}
              />
            </>
          )}
          <div
            className={`w-8 h-8 flex items-center justify-center rounded ${
              isCompleted || isActive
                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white'
                : 'border border-gray-700 text-white'
            }`}
          >
            {step}
          </div>
        </React.Fragment>
      );
    })}
  </div>
));

const QuizPage = () => {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<LeadAnswers>({});
  const [otherText, setOtherText] = useState<string>('');
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [showOtherInput, setShowOtherInput] = useState<boolean>(false);

  const handleAnswer = (questionID: number, option: LeadQuestionOption, isMultiSelect = false) => {
    if (option.value === 'other') {
      setShowOtherInput(true);
      if (!isMultiSelect) {
        setAnswers(prev => ({
          ...prev,
          [questionID]: option.value
        }));
      } else {
        const currentAnswers = (answers[questionID] as string[]) || [];
        const newAnswers = currentAnswers.includes(option.value)
          ? currentAnswers.filter(a => a !== option.value)
          : [...currentAnswers, option.value];

        setAnswers(prev => ({
          ...prev,
          [questionID]: newAnswers
        }));
      }
      return;
    }

    if (isMultiSelect) {
      const currentAnswers = (answers[questionID] as string[]) || [];
      const newAnswers = currentAnswers.includes(option.value)
        ? currentAnswers.filter(a => a !== option.value)
        : [...currentAnswers, option.value];

      setAnswers(prev => ({
        ...prev,
        [questionID]: newAnswers
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionID]: option.value
      }));

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowOtherInput(false);
        setOtherText('');
      } else {
        persistAnswersWithHash({
          ...answers,
          [questionID]: option.value
        });
        router.push('/lead-form');
      }
    }
  };

  const handleTextAnswerChange = useCallback((questionID: number, value: string) => {
    setTextAnswers(prev => ({
      ...prev,
      [questionID]: value
    }));

    setAnswers(prev => ({
      ...prev,
      [questionID]: value
    }));
  }, []);

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowOtherInput(false);
      setOtherText('');
    }
  };

  const handleNextMultiSelect = () => {
    const currentQ = questions[currentQuestion];

    if (currentQ?.textOnly) {
      const textAnswer = textAnswers[currentQ.id] || '';
      const finalAnswers = {
        ...answers,
        [currentQ.id]: textAnswer
      };

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        persistAnswersWithHash(finalAnswers);
        router.push('/lead-form');
      }
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowOtherInput(false);
      setOtherText('');
    } else {
      persistAnswersWithHash(answers);
      router.push('/lead-form');
    }
  };

  const handleNextWithOther = () => {
    if (!otherText.trim()) return;

    const currentQ = questions[currentQuestion];
    const updatedAnswers = currentQ?.multiSelect
      ? {
        ...answers,
        [currentQ.id]: [...((answers[currentQ.id] as string[]) || []).filter(a => a !== 'other'), `other: ${otherText}`]
      }
      : {
        ...answers,
        [currentQ.id]: `other: ${otherText}`
      };

    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowOtherInput(false);
      setOtherText('');
    } else {
      // Store answers + hash in sessionStorage and navigate to lead form
      persistAnswersWithHash(updatedAnswers);
      router.push('/lead-form');
    }
  };

  const currentQ = questions[currentQuestion];
  const hasOtherSelected = currentQ?.multiSelect
    ? (answers[currentQ?.id] as string[] || []).includes('other')
    : answers[currentQ?.id] === 'other';

  const canProceed = () => {
    if (currentQ?.textOnly) {
      return textAnswers[currentQ.id]?.trim().length > 0;
    }

    return currentQ?.multiSelect
      ? (answers[currentQ?.id] && (answers[currentQ?.id] as string[]).length > 0 && (!hasOtherSelected || otherText.trim()))
      : (answers[currentQ?.id] && (!hasOtherSelected || otherText.trim()));
  };

  const shouldShowNextButton = currentQ?.multiSelect || currentQ?.textOnly || showOtherInput;

  return (
    <PageBackground>
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-purple-600/10 via-fuchsia-600/10 to-violet-600/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="mb-12">
                <ProgressBar currentQuestion={currentQuestion}/>

                <h2 className="text-[20px] sm:text-3xl font-bold mb-4 text-white">{currentQ?.text}</h2>
                {currentQ?.subtitle && (
                  <p className="text-white/70 text-lg">{currentQ?.subtitle}</p>
                )}
                {currentQ?.multiSelect && (
                  <p className="text-base text-purple-300 mt-4">Select all that apply</p>
                )}
              </div>

              {/* Text-only question */}
              {currentQ?.textOnly ? (
                <div className="space-y-6">
                                    <textarea
                                      value={textAnswers[currentQ.id] || ''}
                                      onChange={(e) => handleTextAnswerChange(currentQ.id, e.target.value)}
                                      className="w-full px-6 py-4 rounded-2xl bg-black/30 border border-gray-700 focus:border-purple-400 focus:outline-none text-white placeholder-white/50 min-h-[120px] resize-none"
                                      placeholder={currentQ.placeholder || "Type your answer here..."}
                                      autoFocus
                                    />
                  <p className="text-sm text-white/50">
                    {textAnswers[currentQ.id]?.length || 0} characters
                  </p>
                </div>
              ) : (
                /* Multiple choice questions */
                <div className="space-y-4">
                  {currentQ?.options?.map((option, index) => {
                    const isSelected = currentQ?.multiSelect
                      ? (answers[currentQ?.id] || []).includes(option.value)
                      : answers[currentQ?.id] === option.value;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(currentQ?.id, option, currentQ?.multiSelect)}
                        className={getButtonClasses(isSelected)}
                      >
                        <div className="flex items-center">
                          <div>
                            {currentQ?.multiSelect ? (
                              <div className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                                isSelected ? 'bg-purple-600 border-purple-400' : 'border-gray-500'
                              }`}>
                                {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                              </div>
                            ) : (
                              <div className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                                isSelected ? 'border-purple-400' : 'border-gray-500'
                              }`}>
                                {isSelected && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
                              </div>
                            )}
                          </div>
                          <span className="max-w-11/12 sm:max-w-10/12 text-xs sm:text-[16px]">{option.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {showOtherInput && hasOtherSelected && (
                <div className="mt-6">
                  <label className="block text-lg font-medium mb-3 text-white">
                    Please specify:
                  </label>
                  <input
                    type="text"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl bg-black/30 border border-gray-700 focus:border-purple-400 focus:outline-none text-white placeholder-white/50"
                    placeholder="Enter your answer..."
                    autoFocus
                  />
                </div>
              )}

              <div className="mt-12 flex items-center justify-between">
                {currentQuestion > 0 && (
                  <button
                    onClick={handlePrev}
                    disabled={currentQuestion === 0}
                    className="border-2 border-gray-700 text-white/90 hover:text-white cursor-pointer hover:border-purple-400/60 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-2 px-6 rounded-lg transition-transform duration-150 text-sm sm:text-lg hover:scale-105"
                  >
                    <ChevronLeft className="inline mr-2 w-5 h-5"/> Previous
                  </button>
                )}

                {shouldShowNextButton && (
                  <button
                    onClick={showOtherInput && hasOtherSelected ? handleNextWithOther : handleNextMultiSelect}
                    disabled={!canProceed()}
                    className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-purple-700 hover:from-fuchsia-300 hover:via-fuchsia-700 hover:to-purple-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-transform duration-150 text-sm sm:text-lg hover:scale-105"
                  >
                    Next Step <ChevronRight className="inline ml-2 w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default QuizPage;
