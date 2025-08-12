'use client'

import {useState, useEffect, FC} from 'react';
import { ThumbsDown, ThumbsUp, Copy } from "lucide-react";
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-neutral-800/50 border border-neutral-600 rounded-lg animate-pulse" />
});

interface TinyMCEConfig {
  apiKey: string;
}

interface EmailEditorProps {
  initialSubject?: string;
  initialContent?: string;
  onSubjectChange?: (subject: string) => void;
  onContentChange?: (content: string) => void;
  onSend?: () => void;
  onDiscard?: () => void;
  recipientInfo?: {
    name: string;
    email: string;
    userId?: string;
    plan?: string;
    dateJoined?: string;
    lastActive?: string;
  };
  templateActions?: boolean;
  sendButtonText?: string;
  discardButtonText?: string;
  isLoading?: boolean;
  showDeliverabilityScore?: boolean;
  deliverabilityScore?: number;
}

const EmailEditorSkeleton = () => (
  <div className="w-full max-w-[1750px] relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 overflow-hidden">
    <div className="w-32 h-32 lg:w-64 lg:h-64 absolute right-[-25px] lg:right-[-50px] top-[-10px] lg:top-[-21px] opacity-40 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#D497FF_0%,_#7B21BA_100%)] rounded-full blur-[56px] lg:blur-[112.55px]" />

    {/* Mobile Layout */}
    <div className="block lg:hidden p-4 sm:p-6 space-y-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-neutral-700 rounded w-48"></div>
        <div className="h-4 bg-neutral-700 rounded w-64"></div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-4 bg-neutral-700 rounded w-20"></div>
              <div className="h-5 bg-neutral-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full h-px bg-neutral-700"></div>
      <div className="space-y-4">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-8 h-8 bg-neutral-700 rounded"></div>
          ))}
        </div>
        <div className="h-6 bg-neutral-700 rounded w-32"></div>
        <div className="space-y-2">
          <div className="h-4 bg-neutral-700 rounded w-20"></div>
          <div className="h-10 bg-neutral-700 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-neutral-700 rounded w-16"></div>
          <div className="h-96 bg-neutral-700 rounded"></div>
        </div>
      </div>
    </div>

    {/* Desktop Layout */}
    <div className="hidden lg:block h-[792px] animate-pulse">
      <div className="absolute left-[30px] top-[30px] w-80 space-y-4">
        <div className="h-8 bg-neutral-700 rounded w-48"></div>
        <div className="h-4 bg-neutral-700 rounded w-64"></div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 mt-[47px]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-4 bg-neutral-700 rounded w-20"></div>
              <div className="h-5 bg-neutral-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-[384px] top-0 w-px h-full bg-neutral-700"></div>

      <div className="absolute left-[433px] top-[32px] right-[30px] space-y-5">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-8 h-8 bg-neutral-700 rounded"></div>
          ))}
        </div>
        <div className="h-6 bg-neutral-700 rounded w-32"></div>
        <div className="space-y-2">
          <div className="h-4 bg-neutral-700 rounded w-20"></div>
          <div className="h-10 bg-neutral-700 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-neutral-700 rounded w-16"></div>
          <div className="h-96 bg-neutral-700 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export const EmailEditor: FC<EmailEditorProps> = ({
  initialSubject = "",
  initialContent = "",
  onSubjectChange,
  onContentChange,
  onSend,
  onDiscard,
  recipientInfo,
  templateActions = true,
  sendButtonText = "Send Email",
  discardButtonText = "Discard",
  isLoading = false
}) => {
  const [emailSubject, setEmailSubject] = useState(initialSubject);
  const [emailContent, setEmailContent] = useState(initialContent);
  const [tinyMCEConfig, setTinyMCEConfig] = useState<TinyMCEConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    const fetchTinyMCEConfig = async () => {
      try {
        const response = await fetch('/api/tinymce/config');
        if (response.ok) {
          const config = await response.json();
          setTinyMCEConfig(config);
        } else {
          // Fallback config if API fails
          setTinyMCEConfig({ apiKey: 'no-api-key' });
        }
      } catch (error) {
        console.error('Failed to load TinyMCE config:', error);
        // Fallback config
        setTinyMCEConfig({ apiKey: 'no-api-key' });
      } finally {
        setConfigLoading(false);
      }
    };

    fetchTinyMCEConfig();
  }, []);

  useEffect(() => {
    setEmailSubject(initialSubject);
  }, [initialSubject]);

  useEffect(() => {
    setEmailContent(initialContent);
  }, [initialContent]);

  const handleSubjectChange = (value: string) => {
    setEmailSubject(value);
    onSubjectChange?.(value);
  };

  const handleContentChange = (content: string) => {
    setEmailContent(content);
    onContentChange?.(content);
  };

  const handleCopy = () => {
    const textContent = emailContent.replace(/<[^>]*>/g, ''); // Strip HTML tags for clipboard
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${textContent}`);
  };

  const handleThumbsUp = () => {
    // Handle positive feedback
    console.log('Positive feedback for email template');
  };

  const handleThumbsDown = () => {
    // Handle negative feedback
    console.log('Negative feedback for email template');
  };

  if (configLoading || !tinyMCEConfig || isLoading) {
    return <EmailEditorSkeleton />;
  }

  return (
    <div className="w-full max-w-[1750px] relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 overflow-hidden">
      <div className="w-32 h-32 lg:w-64 lg:h-64 absolute right-[-25px] lg:right-[-50px] top-[-10px] lg:top-[-21px] opacity-40 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#D497FF_0%,_#7B21BA_100%)] rounded-full blur-[56px] lg:blur-[112.55px]" />

      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="p-4 sm:p-6 space-y-6">
          {recipientInfo && (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-stone-50 text-xl sm:text-2xl font-semibold font-['Inter'] leading-relaxed">
                    {recipientInfo.name}
                  </div>
                </div>

                <div className="text-stone-300 text-sm font-normal font-['Inter']">
                  {recipientInfo.email}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {recipientInfo.userId && (
                    <div className="flex flex-col gap-1.5">
                      <div className="text-stone-50 text-sm font-medium font-['Inter']">User ID</div>
                      <div className="text-stone-300 text-sm font-normal font-['Inter']">#{recipientInfo.userId}</div>
                    </div>
                  )}
                  {recipientInfo.plan && (
                    <div className="flex flex-col gap-1.5">
                      <div className="text-stone-50 text-sm font-medium font-['Inter']">Plan</div>
                      <div className="text-stone-300 text-sm font-normal font-['Inter']">{recipientInfo.plan}</div>
                    </div>
                  )}
                  {recipientInfo.dateJoined && (
                    <div className="flex flex-col gap-1.5">
                      <div className="text-stone-50 text-sm font-medium font-['Inter']">Joined</div>
                      <div className="text-stone-300 text-sm font-normal font-['Inter']">{recipientInfo.dateJoined}</div>
                    </div>
                  )}
                  {recipientInfo.lastActive && (
                    <div className="flex flex-col gap-1.5">
                      <div className="text-stone-50 text-sm font-medium font-['Inter']">Last Active</div>
                      <div className="text-stone-300 text-sm font-normal font-['Inter']">{recipientInfo.lastActive}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-neutral-700" />
            </>
          )}

          <div className="space-y-4">
            {templateActions && (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleThumbsUp}
                  className="p-1 hover:bg-white/10 rounded transition-colors opacity-70 hover:opacity-100"
                  title="Good template"
                >
                  <ThumbsUp className="w-4 h-4 text-stone-50" />
                </button>
                <button
                  onClick={handleThumbsDown}
                  className="p-1 hover:bg-white/10 rounded transition-colors opacity-70 hover:opacity-100"
                  title="Poor template"
                >
                  <ThumbsDown className="w-4 h-4 text-stone-50" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-white/10 rounded transition-colors opacity-70 hover:opacity-100"
                  title="Copy email content"
                >
                  <Copy className="w-4 h-4 text-stone-50" />
                </button>
              </div>
            )}

            <div className="text-stone-50 text-base font-medium font-['Inter'] leading-relaxed">
              {templateActions ? 'Automated Email Template' : 'Email Composition'}
            </div>

            <div className="space-y-2">
              <div className="text-stone-50 text-sm font-bold font-['Inter'] leading-tight">Subject:</div>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full bg-neutral-800/50 text-stone-300 text-sm font-normal font-['Inter'] leading-tight outline-none border border-neutral-600 rounded-lg px-3 py-2 focus:border-purple-500 transition-colors placeholder:text-stone-500"
              />
            </div>

            <div className="space-y-2">
              <div className="text-stone-50 text-sm font-bold font-['Inter'] leading-tight">Body:</div>

              <div className="tinymce-wrapper-mobile">
                <Editor
                  apiKey={tinyMCEConfig.apiKey}
                  value={emailContent}
                  onEditorChange={handleContentChange}
                  init={{
                    height: 350,
                    menubar: false,
                    elementpath: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link | forecolor',
                    content_style: `
                      body {
                        font-family: Inter, sans-serif;
                        font-size: 16px;
                        color: #d6d3d1;
                        background: rgb(0 0 0 / 1);
                        line-height: 1.6;
                        margin: 0;
                        padding: 8px;
                      }
                      a { color: #9333ea; text-decoration: underline; }
                      strong { color: #f5f5f4; }
                      p { margin: 0 0 1em 0; }
                      ul, ol { margin: 1em 0; padding-left: 2em; }
                      li { margin: 0.5em 0; }
                    `,
                    skin: 'oxide-dark',
                    content_css: 'dark',
                    placeholder: 'Start typing your email content...',
                    setup: (editor: any) => {
                      editor.on('init', () => {
                        const container = editor.getContainer();
                        if (container) {
                          container.style.border = '1px solid rgb(64, 64, 64)';
                          container.style.borderRadius = '8px';
                          container.style.backgroundColor = 'rgba(23, 23, 23, 0.5)';
                        }
                      });
                      editor.on('blur', () => {
                        setTimeout(() => {
                          window.scrollTo(window.scrollX, window.scrollY + 1);
                          window.scrollTo(window.scrollX, window.scrollY - 1);
                        }, 300);
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block h-[792px]">
        {recipientInfo && (
          <>
            <div className="absolute left-[30px] top-[30px] w-80 space-y-4">
              <div className="w-80 h-7 flex justify-between items-center">
                <div className="text-stone-50 text-2xl font-semibold font-['Inter'] leading-relaxed">
                  {recipientInfo.name}
                </div>
              </div>

              <div className="text-stone-300 text-sm font-normal font-['Inter']">
                {recipientInfo.email}
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-4 mt-[47px]">
                {recipientInfo.userId && (
                  <div className="flex flex-col gap-1.5">
                    <div className="text-stone-50 text-sm font-medium font-['Inter']">User ID</div>
                    <div className="text-stone-300 text-sm font-normal font-['Inter']">#{recipientInfo.userId}</div>
                  </div>
                )}
                {recipientInfo.plan && (
                  <div className="flex flex-col gap-1.5">
                    <div className="text-stone-50 text-sm font-medium font-['Inter']">Subscription Plan</div>
                    <div className="text-stone-300 text-sm font-normal font-['Inter']">{recipientInfo.plan}</div>
                  </div>
                )}
                {recipientInfo.dateJoined && (
                  <div className="flex flex-col gap-1.5">
                    <div className="text-stone-50 text-sm font-medium font-['Inter']">Date Joined</div>
                    <div className="text-stone-300 text-sm font-normal font-['Inter']">{recipientInfo.dateJoined}</div>
                  </div>
                )}
                {recipientInfo.lastActive && (
                  <div className="flex flex-col gap-1.5">
                    <div className="text-stone-50 text-sm font-medium font-['Inter']">Last Active</div>
                    <div className="text-stone-300 text-sm font-normal font-['Inter']">{recipientInfo.lastActive}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute left-[384px] top-0 w-px h-full bg-neutral-700" />
          </>
        )}

        <div className={`absolute ${recipientInfo ? 'left-[433px]' : 'left-[30px]'} top-[32px] right-[30px] flex flex-col gap-5 h-[728px]`}>
          {templateActions && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleThumbsUp}
                className="p-1 hover:bg-white/10 rounded transition-colors opacity-70 hover:opacity-100"
                title="Good template"
              >
                <ThumbsUp className="w-4 h-4 text-stone-50" />
              </button>
              <button
                onClick={handleThumbsDown}
                className="p-1 hover:bg-white/10 rounded transition-colors opacity-70 hover:opacity-100"
                title="Poor template"
              >
                <ThumbsDown className="w-4 h-4 text-stone-50" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-white/10 rounded transition-colors opacity-70 hover:opacity-100"
                title="Copy email content"
              >
                <Copy className="w-4 h-4 text-stone-50" />
              </button>
            </div>
          )}

          <div className="text-stone-50 text-base font-medium font-['Inter'] leading-relaxed">
            {templateActions ? 'Automated Email Template' : 'Email Composition'}
          </div>

          <div className="flex-1 flex flex-col space-y-4 min-h-0">
            <div className="space-y-2">
              <div className="text-stone-50 text-sm font-bold font-['Inter'] leading-tight">Subject:</div>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full bg-neutral-800/50 text-stone-300 text-sm font-normal font-['Inter'] leading-tight outline-none border border-neutral-600 rounded-lg px-3 py-2 focus:border-purple-500 transition-colors placeholder:text-stone-500"
              />
            </div>

            <div className="space-y-2 flex-1 flex flex-col min-h-0">
              <div className="text-stone-50 text-sm font-bold font-['Inter'] leading-tight">Body:</div>

              <div className="flex-1 tinymce-wrapper min-h-0">
                <Editor
                  apiKey={tinyMCEConfig.apiKey}
                  value={emailContent}
                  onEditorChange={handleContentChange}
                  init={{
                    height: '100%',
                    menubar: false,
                    elementpath: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link | forecolor backcolor | outdent indent',
                    content_style: `
                      body {
                        font-family: Inter, sans-serif;
                        font-size: 16px;
                        color: #d6d3d1;
                        background: rgb(0 0 0 / 1);
                        line-height: 1.6;
                        margin: 0;
                        padding: 12px;
                      }
                      a { color: #9333ea; text-decoration: underline; }
                      strong { color: #f5f5f4; }
                      p { margin: 0 0 1em 0; }
                      ul, ol { margin: 1em 0; padding-left: 2em; }
                      li { margin: 0.5em 0; }
                    `,
                    skin: 'oxide-dark',
                    content_css: 'dark',
                    resize: false,
                    branding: false,
                    placeholder: 'Start typing your email content...',
                    setup: (editor: any) => {
                      editor.on('init', () => {
                        const container = editor.getContainer();
                        if (container) {
                          container.style.border = '1px solid rgb(64, 64, 64)';
                          container.style.borderRadius = '8px';
                          container.style.backgroundColor = 'rgba(23, 23, 23, 0.5)';
                          container.style.height = '100%';
                        }
                      });
                      editor.on('blur', () => {
                        setTimeout(() => {
                          window.scrollTo(window.scrollX, window.scrollY + 1);
                          window.scrollTo(window.scrollX, window.scrollY - 1);
                        }, 300);
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(onSend || onDiscard) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 mt-6 px-6 pb-6">
          {onSend && (
            <button
              onClick={onSend}
              disabled={!emailSubject.trim() || !emailContent.trim()}
              className="w-full sm:w-auto bg-[linear-gradient(17deg,rgba(254,190,250,1)_2%,rgba(179,57,212,1)_35%,rgba(123,33,186,1)_65%,rgba(123,38,240,1)_100%)] px-[18px] py-[13px] rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendButtonText}
            </button>
          )}
          {onDiscard && (
            <button
              onClick={onDiscard}
              className="w-full sm:w-auto border border-white px-[18px] py-[13px] rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
            >
              {discardButtonText}
            </button>
          )}
        </div>
      )}

      <style>{`
        .tox .tox-editor-header {
          background-color: rgba(23, 23, 23, 0.8) !important;
          border: 1px solid rgb(64, 64, 64) !important;
          border-bottom: none !important;
          border-radius: 8px 8px 0 0 !important;
        }

        .tox .tox-edit-area {
          border: 1px solid rgb(64, 64, 64) !important;
          border-top: none !important;
          border-radius: 0 0 8px 8px !important;
        }

        .tox .tox-statusbar {
          background-color: rgba(23, 23, 23, 0.8) !important;
          border: 1px solid rgb(64, 64, 64) !important;
          border-top: none !important;
        }

        .tox .tox-toolbar {
          background-color: rgba(23, 23, 23, 0.8) !important;
        }

        .tox .tox-tbtn {
          color: #d6d3d1 !important;
        }

        .tox .tox-tbtn:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }

        .tox .tox-tbtn--enabled {
          background-color: rgba(123, 33, 186, 0.3) !important;
          color: white !important;
        }

        .tox .tox-menubar {
          background-color: rgba(23, 23, 23, 0.8) !important;
        }

        .tox .tox-collection__item {
          color: #d6d3d1 !important;
        }

        .tox .tox-collection__item--active {
          background-color: rgba(123, 33, 186, 0.3) !important;
        }

        .tox .tox-menu {
          background-color: #1a1a1a !important;
          border: 1px solid #404040 !important;
        }

        .tox .tox-dialog {
          background-color: #1a1a1a !important;
          border: 1px solid #404040 !important;
        }

        .tox .tox-dialog__header {
          background-color: #2a2a2a !important;
          border-bottom: 1px solid #404040 !important;
        }

        .tox .tox-dialog__title {
          color: #d6d3d1 !important;
        }

        .tox .tox-textfield {
          background-color: #2a2a2a !important;
          border: 1px solid #404040 !important;
          color: #d6d3d1 !important;
        }

        .tox .tox-button {
          color: #d6d3d1 !important;
        }

        .tox .tox-button:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }

        .tinymce-wrapper {
          height: 100%;
        }

        .tinymce-wrapper .tox-tinymce {
          height: 100% !important;
        }

        .tinymce-wrapper-mobile .tox-tinymce {
          border-radius: 8px !important;
        }
      `}</style>
    </div>
  );
};
