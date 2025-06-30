'use client'

import {
  ThumbsDown,
  ThumbsUp,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackTo } from "@/app/(dashboard)/components/back-to";
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-neutral-800/50 border border-neutral-600 rounded-lg animate-pulse" />
});

export default function ClientRetention() {
  const router = useRouter();
  const [emailContent, setEmailContent] = useState(`<p>Hi [Coach's Name],</p>

<p>We noticed you haven't logged into your Next Level Coach AI account for a little while, and we just wanted to check in. Your coaching business is important to us, and we're here to help you make the most of your platform to engage with clients, grow your revenue, and streamline your day-to-day tasks.</p>

<p><strong>Here's what you're missing out on:</strong></p>

<ul>
<li><strong>Automated Email Responses:</strong> Let our AI take care of client follow-ups and responses so you can focus on coaching.</li>
<li><strong>Content Suggestions:</strong> Get fresh, AI-generated content ideas based on your best-performing materials.</li>
<li><strong>Client Engagement:</strong> Track client progress and send automated check-ins to keep your clients motivated.</li>
<li><strong>Real-Time Analytics:</strong> Make data-driven decisions with actionable insights into client engagement, course performance, and more.</li>
</ul>

<p>We understand that life can get busy, but we're here to make things easier and more efficient for you.</p>

<p><strong>To help you get back on track, we've made it simple to re-engage:</strong></p>
<p><a href="#" style="color: #9333ea; text-decoration: underline;">Login to Your Account</a> and see all the new features we've added since your last visit!</p>
<p>Need help or have questions? We're here for you. Feel free to reply to this email or check out our <a href="#" style="color: #9333ea; text-decoration: underline;">help center</a>.</p>

<p>We can't wait to help you take your coaching business to the next level.</p>

<p>Best,<br>The Next Level Coach AI Team<br>[Support Contact Details]<br>[Company Website]</p>`);

  const [emailSubject, setEmailSubject] = useState("We Miss You! Let's Get Back to Growing Your Coaching Business 🚀");

  const handleSendEmail = () => {
    console.log('Sending email...');
  };

  const handleDiscard = () => {
    router.back();
  };

  const handleEditorChange = (content: string) => {
    setEmailContent(content);
  };

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <BackTo route={'/inactive-coaches'} title={'Client Retention Email'}/>

      <div className="w-full max-w-[1750px] relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 overflow-hidden">

        <div className="w-32 h-32 lg:w-64 lg:h-64 absolute right-[-25px] lg:right-[-50px] top-[-10px] lg:top-[-21px] opacity-40 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#D497FF_0%,_#7B21BA_100%)] rounded-full blur-[56px] lg:blur-[112.55px]" />

        <div className="block lg:hidden">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-stone-50 text-xl sm:text-2xl font-semibold font-['Inter'] leading-relaxed">
                  Charlie Levin
                </div>
              </div>

              <div className="text-stone-300 text-sm font-normal font-['Inter']">
                charlie.levin@email.com
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="text-stone-50 text-sm font-medium font-['Inter']">User ID</div>
                  <div className="text-stone-300 text-sm font-normal font-['Inter']">#1234</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="text-stone-50 text-sm font-medium font-['Inter']">Plan</div>
                  <div className="text-stone-300 text-sm font-normal font-['Inter']">Starter</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="text-stone-50 text-sm font-medium font-['Inter']">Joined</div>
                  <div className="text-stone-300 text-sm font-normal font-['Inter']">Jan 18, 2024</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="text-stone-50 text-sm font-medium font-['Inter']">Last Active</div>
                  <div className="text-stone-300 text-sm font-normal font-['Inter']">Mar 25, 2025</div>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-neutral-700" />

            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <button className="p-1 hover:bg-white/10 rounded transition-colors opacity-70">
                  <ThumbsUp className="w-4 h-4 text-stone-50" />
                </button>
                <button className="p-1 hover:bg-white/10 rounded transition-colors opacity-70">
                  <ThumbsDown className="w-4 h-4 text-stone-50" />
                </button>
                <button className="p-1 hover:bg-white/10 rounded transition-colors opacity-70">
                  <Copy className="w-4 h-4 text-stone-50" />
                </button>
              </div>

              <div className="text-stone-50 text-base font-medium font-['Inter'] leading-relaxed">
                Automated Email Template
              </div>

              <div className="space-y-2">
                <div className="text-stone-50 text-sm font-bold font-['Inter'] leading-tight">Subject:</div>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-neutral-800/50 text-stone-300 text-sm font-normal font-['Inter'] leading-tight outline-none border border-neutral-600 rounded-lg px-3 py-2 focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="text-stone-50 text-sm font-bold font-['Inter'] leading-tight">Body:</div>

                <div className="tinymce-wrapper-mobile">
                  <Editor
                    apiKey={"x7tjtymizskqq6lgbevhcmmrcj6v47pvhgs3i9r4vbz4yml3"}
                    value={emailContent}
                    onEditorChange={handleEditorChange}
                    init={{
                      height: 350,
                      menubar: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link | forecolor',
                      content_style: `
                        body {
                          font-family: Inter, sans-serif;
                          font-size: 14px;
                          color: #d6d3d1;
                          background: rgb(0 0 0 / 1);
                          line-height: 1.6;
                          margin: 0;
                          padding: 8px;
                        }
                        a { color: #9333ea; text-decoration: underline; }
                        strong { color: #f5f5f4; }
                      `,
                      skin: 'oxide-dark',
                      content_css: 'dark',
                      setup: (editor: any) => {
                        editor.on('init', () => {
                          const container = editor.getContainer();
                          if (container) {
                            container.style.border = '1px solid rgb(64, 64, 64)';
                            container.style.borderRadius = '8px';
                            container.style.backgroundColor = 'rgba(23, 23, 23, 0.5)';
                          }
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block h-[792px]">
          <div className="absolute left-[30px] top-[30px] w-80 space-y-4">
            <div className="w-80 h-7 flex justify-between items-center">
              <div className="text-stone-50 text-2xl font-semibold font-['Inter'] leading-relaxed">
                Charlie Levin
              </div>
              <div className="px-2.5 py-0.5 opacity-0 bg-green-700/20 rounded-full border border-green-700 flex justify-center items-center gap-1">
                <div className="text-stone-50 text-sm font-medium font-['Inter'] leading-relaxed">
                  Email Response
                </div>
              </div>
            </div>

            <div className="text-stone-300 text-sm font-normal font-['Inter']">
              charlie.levin@email.com
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-4 mt-[47px]">
              <div className="flex flex-col gap-1.5">
                <div className="text-stone-50 text-sm font-medium font-['Inter']">User ID</div>
                <div className="text-stone-300 text-sm font-normal font-['Inter']">#1234</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-stone-50 text-sm font-medium font-['Inter']">Subscription Plan</div>
                <div className="text-stone-300 text-sm font-normal font-['Inter']">Starter</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-stone-50 text-sm font-medium font-['Inter']">Date Joined</div>
                <div className="text-stone-300 text-sm font-normal font-['Inter']">Jan 18, 2025</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-stone-50 text-sm font-medium font-['Inter']">Last Active</div>
                <div className="text-stone-300 text-sm font-normal font-['Inter']">Mar 25, 2025</div>
              </div>
            </div>
          </div>

          <div className="absolute left-[384px] top-0 w-px h-full bg-neutral-700" />

          <div className="absolute left-[433px] top-[32px] right-[30px] flex flex-col gap-5 h-[728px]">
            <div className="flex items-center gap-2.5">
              <button className="p-1 hover:bg-white/10 rounded transition-colors opacity-70">
                <ThumbsUp className="w-4 h-4 text-stone-50" />
              </button>
              <button className="p-1 hover:bg-white/10 rounded transition-colors opacity-70">
                <ThumbsDown className="w-4 h-4 text-stone-50" />
              </button>
              <button className="p-1 hover:bg-white/10 rounded transition-colors opacity-70">
                <Copy className="w-4 h-4 text-stone-50" />
              </button>
            </div>

            <div className="text-stone-50 text-base font-medium font-['Inter'] leading-relaxed">
              Automated Email Template
            </div>

            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              <div className="space-y-2">
                <div className="text-stone-50 text-sm font-bold font-['Inter'] leading-tight">Subject:</div>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-neutral-800/50 text-stone-300 text-sm font-normal font-['Inter'] leading-tight outline-none border border-neutral-600 rounded-lg px-3 py-2 focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <div className="text-stone-50 text-sm font-bold font-['Inter'] leading-tight">Body:</div>

                <div className="flex-1 tinymce-wrapper min-h-0">
                  <Editor
                    apiKey={"x7tjtymizskqq6lgbevhcmmrcj6v47pvhgs3i9r4vbz4yml3"}
                    value={emailContent}
                    onEditorChange={handleEditorChange}
                    init={{
                      height: '100%',
                      menubar: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link | forecolor backcolor | outdent indent',
                      content_style: `
                        body {
                          font-family: Inter, sans-serif;
                          font-size: 14px;
                          color: #d6d3d1;
                          background: rgb(0 0 0 / 1);
                          line-height: 1.6;
                          margin: 0;
                          padding: 12px;
                        }
                        a { color: #9333ea; text-decoration: underline; }
                        strong { color: #f5f5f4; }
                      `,
                      skin: 'oxide-dark',
                      content_css: 'dark',
                      resize: false,
                      branding: false,
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
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
        <button
          onClick={handleSendEmail}
          className="w-full sm:w-auto bg-[linear-gradient(17deg,rgba(254,190,250,1)_2%,rgba(179,57,212,1)_35%,rgba(123,33,186,1)_65%,rgba(123,38,240,1)_100%)] px-[18px] py-[13px] rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Send Email
        </button>
        <button
          onClick={handleDiscard}
          className="w-full sm:w-auto border border-white px-[18px] py-[13px] rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
        >
          Discard
        </button>
      </div>

      <style jsx global>{`
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
}
