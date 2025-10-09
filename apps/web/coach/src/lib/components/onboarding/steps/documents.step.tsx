'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, X, Check, AlertCircle, Mail, BookOpen, MessageSquare, FileSpreadsheet } from 'lucide-react';
import { sdkClient } from '@/lib';
import type { OnboardingRequest, UploadedDocument } from '@nlc-ai/types';

interface LocalUploadedDocument extends UploadedDocument {
  type: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
}

interface DocumentCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
  acceptedTypes: string;
}

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    id: 'email_threads',
    title: 'Email Threads',
    description: 'Past client email conversations that showcase your communication style',
    icon: <Mail className="w-5 h-5" />,
    examples: ['Client onboarding emails', 'Follow-up sequences', 'Problem-solving exchanges'],
    acceptedTypes: '.eml,.msg,.txt,.pdf'
  },
  {
    id: 'frameworks',
    title: 'Coaching Frameworks',
    description: 'Your proprietary methods, worksheets, and structured approaches',
    icon: <BookOpen className="w-5 h-5" />,
    examples: ['Program outlines', 'Assessment tools', 'Goal-setting templates'],
    acceptedTypes: '.pdf,.doc,.docx,.txt'
  },
  {
    id: 'faqs',
    title: 'FAQs & Resources',
    description: 'Common questions and your standard responses',
    icon: <MessageSquare className="w-5 h-5" />,
    examples: ['Client FAQs', 'Pricing explanations', 'Program details'],
    acceptedTypes: '.pdf,.doc,.docx,.txt'
  },
  {
    id: 'transcripts',
    title: 'Session Transcripts',
    description: 'Transcripts from coaching sessions, webinars, or consultations',
    icon: <FileText className="w-5 h-5" />,
    examples: ['1-on-1 session notes', 'Webinar recordings', 'Consultation calls'],
    acceptedTypes: '.txt,.pdf,.doc,.docx'
  },
  {
    id: 'content',
    title: 'Content & Posts',
    description: 'Blog posts, social media content, and other written materials',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    examples: ['Blog articles', 'Social media posts', 'Newsletter content'],
    acceptedTypes: '.pdf,.doc,.docx,.txt'
  }
];

interface DocumentsStepProps {
  onContinue: () => void;
  data?: OnboardingRequest;
  onUpdate?: (documents: UploadedDocument[]) => void;
}

export const DocumentsStep = ({ onContinue, data, onUpdate }: DocumentsStepProps) => {
  const [uploadedDocs, setUploadedDocs] = useState<LocalUploadedDocument[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Track if we've already loaded initial data
  const hasLoadedInitialData = useRef(false);

  // Load existing documents from data prop ONLY ONCE on mount
  useEffect(() => {
    if (!hasLoadedInitialData.current && data?.documents && data.documents.length > 0) {
      const localDocs: LocalUploadedDocument[] = data.documents.map(doc => ({
        ...doc,
        type: 'application/pdf',
        size: 0,
        status: 'success' as const,
      }));
      setUploadedDocs(localDocs);
      hasLoadedInitialData.current = true;
    }
  }, []); // Empty dependency array - only run once

  // Update parent when documents change (debounced to avoid excessive calls)
  useEffect(() => {
    // Skip if we haven't loaded initial data yet
    if (!hasLoadedInitialData.current) return;

    const timeoutId = setTimeout(() => {
      if (onUpdate) {
        const simpleDocuments: UploadedDocument[] = uploadedDocs.map(doc => ({
          id: doc.id,
          name: doc.name,
          category: doc.category,
          openaiFileID: doc.openaiFileID,
        }));
        onUpdate(simpleDocuments);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [uploadedDocs]); // Only depend on uploadedDocs

  const handleFileSelect = async (files: FileList | null, category: string) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      const newDoc: LocalUploadedDocument = {
        id: Math.random().toString(36).substring(2, 11),
        name: file.name,
        type: file.type,
        size: file.size,
        category,
        status: 'uploading'
      };

      setUploadedDocs(prev => [...prev, newDoc]);

      try {
        const uploadResponse = await sdkClient.agents.coachReplica.uploadFile(file, file.name);
        await sdkClient.agents.coachReplica.addFileToVectorStore(uploadResponse.fileID);

        setUploadedDocs(prev =>
          prev.map(doc =>
            doc.id === newDoc.id
              ? { ...doc, status: 'success', openaiFileID: uploadResponse.fileID }
              : doc
          )
        );

      } catch (error) {
        console.error('File upload failed:', error);
        setUploadedDocs(prev =>
          prev.map(doc =>
            doc.id === newDoc.id ? { ...doc, status: 'error' } : doc
          )
        );
      }
    }
  };

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    setDragOver(null);
    handleFileSelect(e.dataTransfer.files, category);
  };

  const handleRemove = async (docID: string, openaiFileID?: string) => {
    try {
      if (openaiFileID) {
        await sdkClient.agents.coachReplica.removeFileFromVectorStore(openaiFileID);
      }

      setUploadedDocs(prev => prev.filter(doc => doc.id !== docID));
    } catch (error) {
      console.error('Failed to remove file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getUploadedByCategory = (category: string) => {
    return uploadedDocs.filter(doc => doc.category === category);
  };

  const totalUploaded = uploadedDocs.length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">Training Materials</h3>
            <p className="text-stone-400 text-sm">
              Upload documents to help your AI learn your style and approach
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{totalUploaded}</div>
            <div className="text-stone-400 text-xs">Documents</div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-purple-900/20 to-fuchsia-900/20 rounded-xl p-4 border border-purple-500/30">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-medium mb-1">Optional But Recommended</h4>
            <p className="text-stone-300 text-sm">
              The more examples you provide, the better your AI will understand and replicate your approach.
              You can upload more documents anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Categories */}
      <div className="space-y-6">
        {DOCUMENT_CATEGORIES.map((category) => {
          const categoryDocs = getUploadedByCategory(category.id);

          return (
            <div key={category.id} className="bg-neutral-800/30 rounded-2xl border border-neutral-700 overflow-hidden">
              {/* Category Header */}
              <div className="p-5 border-b border-neutral-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">{category.title}</h4>
                      {categoryDocs.length > 0 && (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                          {categoryDocs.length} uploaded
                        </span>
                      )}
                    </div>
                    <p className="text-stone-400 text-sm mb-3">{category.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {category.examples.map((example, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-neutral-700/50 text-stone-400 rounded">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div className="p-5">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(category.id);
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => handleDrop(e, category.id)}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    dragOver === category.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-neutral-600 hover:border-neutral-500'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept={category.acceptedTypes}
                    onChange={(e) => handleFileSelect(e.target.files, category.id)}
                    className="hidden"
                    id={`upload-${category.id}`}
                  />
                  <label
                    htmlFor={`upload-${category.id}`}
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-stone-400" />
                    <div>
                      <span className="text-white font-medium">Click to upload</span>
                      <span className="text-stone-400"> or drag and drop</span>
                    </div>
                    <span className="text-xs text-stone-500">
                      Accepted formats: {category.acceptedTypes.replace(/\./g, '').toUpperCase()}
                    </span>
                  </label>
                </div>

                {/* Uploaded Files */}
                {categoryDocs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {categoryDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg border border-neutral-700"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">
                              {doc.name}
                            </div>
                            <div className="text-stone-500 text-xs">
                              {formatFileSize(doc.size)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {doc.status === 'uploading' && (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
                          )}
                          {doc.status === 'success' && (
                            <Check className="w-5 h-5 text-green-400" />
                          )}
                          {doc.status === 'error' && (
                            <span className="text-red-400 text-xs">✗</span>
                          )}
                          <button
                            onClick={() => handleRemove(doc.id, doc.openaiFileID)}
                            className="p-1 hover:bg-neutral-800 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-stone-400 hover:text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="bg-neutral-800/50 rounded-xl p-5 border border-neutral-700">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <span>💡</span> Tips for Better AI Training
        </h4>
        <ul className="space-y-2 text-sm text-stone-400">
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span>Upload diverse examples that show different scenarios and your various responses</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span>Include both successful interactions and how you handled challenges</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span>More content = better AI accuracy. Aim for at least 5-10 documents total</span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span>Remove any sensitive personal information before uploading</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
