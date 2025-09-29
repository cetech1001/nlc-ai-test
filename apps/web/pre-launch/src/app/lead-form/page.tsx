'use client'

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, User } from 'lucide-react';
import { PageBackground } from '@/lib/components';
import Image from "next/image";
import {sdkClient} from "@/lib";
import {calculateQualification, hashString, LeadAnswers, LeadInfo} from "@nlc-ai/sdk-leads";

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
};

const isValidPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
};

const LeadFormPage = () => {
  const router = useRouter();
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({ name: '', email: '', phone: '' });
  const [touched, setTouched] = useState<Record<keyof LeadInfo, boolean>>({ name: false, email: false, phone: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null);
  const [spotsLoading, setSpotsLoading] = useState(true);

  const nameError = useMemo(() =>
    !leadInfo.name.trim() ? 'Name is required' : '', [leadInfo.name]);
  const emailError = useMemo(() =>
    !leadInfo.email.trim() ? 'Email is required'
      : (!isValidEmail(leadInfo.email) ? 'Enter a valid email address' : ''), [leadInfo.email]);
  const phoneError = useMemo(() =>
    !leadInfo.phone.trim() ? 'Phone number is required'
      : (!isValidPhone(leadInfo.phone) ? 'Enter a valid phone number' : ''), [leadInfo.phone]);

  const canSubmit = useMemo(() =>
    !nameError && !emailError && !phoneError, [nameError, emailError, phoneError]);

  useEffect(() => {
    (async () => {
      try {
        setSpotsLoading(true);
        const response = await sdkClient.leads.getQualifiedLeadCount();
        setSpotsRemaining(Math.max(0, response.remainingSpots));
      } catch (error) {
        console.error('Error fetching spots remaining:', error);
        setSpotsRemaining(null);
      } finally {
        setSpotsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!canSubmit || submitting) return;

    const storedAnswers = sessionStorage.getItem('quizAnswers');
    const storedHash = sessionStorage.getItem('quizAnswersHash');
    if (!storedAnswers || !storedHash) {
      router.push('/quiz');
      return;
    }

    const computedHash = hashString(storedAnswers);
    if (computedHash !== storedHash) {
      sessionStorage.removeItem('quizAnswers');
      sessionStorage.removeItem('quizAnswersHash');
      router.push('/quiz');
      return;
    }

    const answers: LeadAnswers = JSON.parse(storedAnswers);
    const isQualified = calculateQualification(answers);

    try {
      setSubmitting(true);

      await sdkClient.leads.createLeadFromLanding({
        lead: leadInfo,
        answers,
        qualified: isQualified,
        submittedAt: new Date().toISOString()
      });

      sessionStorage.setItem('leadInfo', JSON.stringify(leadInfo));
      sessionStorage.setItem('qualified', JSON.stringify(isQualified));
      router.replace('/results?email=' + leadInfo.email);
    } catch (e: any) {
      console.log("Error: ", e);
      if (typeof e === "string") {
        return setSubmitError(e);
      }
      const message = typeof e?.message === 'string' ? JSON.parse(e.message).message : '';
      setSubmitError(message || 'Something went wrong while submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSpotsRemaining = () => {
    if (spotsLoading) {
      return (
        <div className="flex items-center justify-center mb-8">
          <div className="animate-pulse">
            <div className="h-6 bg-purple-500/20 rounded-lg w-48"></div>
          </div>
        </div>
      );
    }

    if (spotsRemaining === null) {
      return null;
    }

    const urgencyColor = spotsRemaining <= 10 ? 'text-red-400' : spotsRemaining <= 25 ? 'text-yellow-400' : 'text-green-400';
    const urgencyBg = spotsRemaining <= 10 ? 'bg-red-500/10 border-red-500/20' : spotsRemaining <= 25 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-green-500/10 border-green-500/20';

    return (
      <div className={`text-center mb-8`}>
        <span className={`px-2.5 py-0.5 border ${urgencyBg} rounded-full text-sm font-medium w-auto ${urgencyColor}`}>
          {spotsRemaining} spots remaining
        </span>
      </div>
    );
  };

  return (
    <PageBackground>
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-purple-600/10 via-fuchsia-600/10 to-violet-600/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex justify-center mb-6 w-full" >
                <Image src={'/images/logo.png'} height={57} width={67} alt={'Logo'}
                       className={"cursor-pointer"}
                       onClick={() => router.push('/')}/>
              </div>

              <h2 className="text-xl sm:text-3xl font-bold mb-4 text-center text-white">
                See Your AI Automation Score
              </h2>
              <p className="text-sm sm:text-[16px] mb-8 text-center text-white/80">
                Enter your details to see your personalized results and qualification status
              </p>

              {renderSpotsRemaining()}

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium mb-3 text-white">
                    <User className="inline w-5 h-5 mr-3" />
                    Name
                  </label>
                  <input
                    type="text"
                    value={leadInfo.name}
                    onChange={(e) => setLeadInfo(prev => ({ ...prev, name: e.target.value }))}
                    onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                    aria-invalid={!!nameError && touched.name}
                    className={`w-full px-6 py-4 rounded-xl bg-black/30 border ${touched.name && nameError ? 'border-red-500' : 'border-gray-700'} focus:border-purple-400 focus:outline-none text-white placeholder-white/50`}
                    placeholder="Your full name"
                  />
                  {touched.name && nameError && (
                    <p className="text-red-400 text-sm mt-2">{nameError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-medium mb-3 text-white">
                    <Mail className="inline w-5 h-5 mr-3" />
                    Email
                  </label>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={leadInfo.email}
                    onChange={(e) => setLeadInfo(prev => ({ ...prev, email: e.target.value }))}
                    onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                    aria-invalid={!!emailError && touched.email}
                    className={`w-full px-6 py-4 rounded-xl bg-black/30 border ${touched.email && emailError ? 'border-red-500' : 'border-gray-700'} focus:border-purple-400 focus:outline-none text-white placeholder-white/50`}
                    placeholder="your@email.com"
                  />
                  {touched.email && emailError && (
                    <p className="text-red-400 text-sm mt-2">{emailError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-medium mb-3 text-white">
                    <Phone className="inline w-5 h-5 mr-3" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={leadInfo.phone}
                    onChange={(e) => setLeadInfo(prev => ({ ...prev, phone: e.target.value }))}
                    onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                    aria-invalid={!!phoneError && touched.phone}
                    className={`w-full px-6 py-4 rounded-xl bg-black/30 border ${touched.phone && phoneError ? 'border-red-500' : 'border-gray-700'} focus:border-purple-400 focus:outline-none text-white placeholder-white/50`}
                    placeholder="(555) 123-4567"
                  />
                  {touched.phone && phoneError && (
                    <p className="text-red-400 text-sm mt-2">{phoneError}</p>
                  )}
                </div>

                {submitError && (
                  <div className="text-red-400 text-sm mb-2">{submitError}</div>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className={`w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg text-sm sm:text-[16px] transition-all duration-300 ${!submitting ? 'transform hover:scale-105' : ''}`}
                >
                  {submitting ? 'Submitting...' : 'See My Results & Qualification Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default LeadFormPage;
