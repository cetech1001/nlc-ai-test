'use client'

import React, { useState, useEffect } from "react";
import { X, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import {sdkClient} from "@/lib";
import {useAuth} from "@nlc-ai/web-auth";
import {useRouter} from "next/navigation";

interface UploadedFile {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  status: string;
  uploadedAt: Date;
  indexedAt?: Date;
}

const DocumentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.9425 6.45263L14.6289 0.138938C14.5399 0.0499687 14.4193 0 14.2934 0H5.39688C4.31645 0 3.4375 0.878953 3.4375 1.95937V22.0406C3.4375 23.121 4.31645 24 5.39688 24H19.1221C20.2025 24 21.0814 23.121 21.0814 22.0406V6.78802C21.0814 6.66225 21.0315 6.54155 20.9425 6.45263ZM14.7678 1.61948L19.462 6.31359H15.7785C15.2212 6.31359 14.7678 5.86022 14.7678 5.30288V1.61948H14.7678ZM20.1328 22.0406C20.1328 22.5979 19.6794 23.0513 19.1221 23.0513H5.39688C4.83958 23.0513 4.38616 22.5979 4.38616 22.0406V1.95937C4.38616 1.40208 4.83958 0.948656 5.39688 0.948656H13.8191V5.30297C13.8191 6.38339 14.698 7.26234 15.7784 7.26234H20.1328V22.0406Z" fill="white"/>
    <path d="M16.0516 12.0475H8.46261C8.20067 12.0475 7.98828 12.2599 7.98828 12.5218C7.98828 12.7838 8.20067 12.9961 8.46261 12.9961H16.0516C16.3136 12.9961 16.5259 12.7838 16.5259 12.5218C16.5259 12.2599 16.3136 12.0475 16.0516 12.0475Z" fill="white"/>
    <path d="M16.0516 14.166H8.46261C8.20067 14.166 7.98828 14.3784 7.98828 14.6403C7.98828 14.9023 8.20067 15.1147 8.46261 15.1147H16.0516C16.3136 15.1147 16.5259 14.9023 16.5259 14.6403C16.5259 14.3784 16.3136 14.166 16.0516 14.166Z" fill="white"/>
    <path d="M16.0516 16.2845H8.46261C8.20067 16.2845 7.98828 16.4969 7.98828 16.7589C7.98828 17.0208 8.20067 17.2332 8.46261 17.2332H16.0516C16.3136 17.2332 16.5259 17.0208 16.5259 16.7589C16.5259 16.4969 16.3136 16.2845 16.0516 16.2845Z" fill="white"/>
    <path d="M13.5852 18.4032H8.46261C8.20067 18.4032 7.98828 18.6156 7.98828 18.8775C7.98828 19.1395 8.20067 19.3519 8.46261 19.3519H13.5852C13.8472 19.3519 14.0595 19.1395 14.0595 18.8775C14.0595 18.6156 13.8472 18.4032 13.5852 18.4032Z" fill="white"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M37.7756 22.5103V12.6695C37.7756 12.3878 37.6455 12.1276 37.4614 11.9217L26.4284 0.336029C26.2225 0.119415 25.9297 0 25.6374 0H8.14483C4.91546 0 2.33594 2.63348 2.33594 5.86324V38.9404C2.33594 42.1702 4.91546 44.7604 8.14483 44.7604H21.9525C24.5642 49.0955 29.3115 51.9999 34.7193 51.9999C42.9343 51.9999 49.643 45.3238 49.643 37.098C49.6541 29.9125 44.495 23.9084 37.7756 22.5103ZM26.7212 3.80422L34.1234 11.5964H29.3222C27.8916 11.5964 26.7212 10.4153 26.7212 8.9847V3.80422ZM8.14483 42.5927C6.11834 42.5927 4.50366 40.9669 4.50366 38.9404V5.86324C4.50366 3.82565 6.11834 2.16772 8.14483 2.16772H24.5535V8.9847C24.5535 11.6182 26.6887 13.7641 29.3222 13.7641H35.6079V22.2283C35.283 22.2176 35.0227 22.185 34.7411 22.185C30.9587 22.185 27.4798 23.6374 24.857 25.9135H11.0929C10.4966 25.9135 10.0091 26.4011 10.0091 26.9969C10.0091 27.5932 10.4966 28.0808 11.0929 28.0808H22.8412C22.0716 29.1647 21.432 30.2485 20.9338 31.4407H11.0929C10.4966 31.4407 10.0091 31.9283 10.0091 32.5245C10.0091 33.1204 10.4966 33.6084 11.0929 33.6084H20.2292C19.9582 34.6923 19.8174 35.8951 19.8174 37.098C19.8174 39.0487 20.1966 40.978 20.8794 42.6038H8.14483V42.5927ZM34.7304 49.8433C27.7075 49.8433 21.9958 44.1316 21.9958 37.1087C21.9958 30.0859 27.6964 24.3742 34.7304 24.3742C41.764 24.3742 47.4645 30.0859 47.4645 37.1087C47.4645 44.1316 41.7532 49.8433 34.7304 49.8433Z" fill="#DF69FF"/>
    <path d="M35.5014 29.1103C35.2955 28.8937 35.0138 28.7635 34.7103 28.7635C34.4068 28.7635 34.1252 28.8937 33.9193 29.1103L27.568 35.9273C27.1562 36.3609 27.1888 37.0544 27.6224 37.4555C28.056 37.8673 28.7602 37.8347 29.172 37.4015L33.659 32.6003V44.4351C33.659 45.0314 34.1466 45.519 34.7429 45.519C35.3387 45.519 35.8267 45.0314 35.8267 44.4351V32.6003L40.2808 37.4015C40.4978 37.6288 40.7795 37.7482 41.0723 37.7482C41.3321 37.7482 41.5924 37.6507 41.809 37.4555C42.2426 37.0437 42.2751 36.3609 41.8633 35.9273L35.5014 29.1103Z" fill="#DF69FF"/>
  </svg>
);

const CoachReplica: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingFileID, setDeletingFileID] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const userID = user?.id;
  const embedCode = `<script src="${window.location.origin}/embed/chatbot.js" data-coach-id="${userID}"></script>`;
  const chatbotLink = `${window.location.origin}/chat/${userID}`;

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sdkClient.agents.coachReplica.listFiles();

      setUploadedFiles(response.files);
    } catch (err) {
      setError('Failed to load files. Please try again.');
      console.error('Load files error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const uploadResponse = await sdkClient.agents.coachReplica.uploadFile(file, file.name);
        await sdkClient.agents.coachReplica.addFileToVectorStore(uploadResponse.fileID);


        const newFile: UploadedFile = {
          id: uploadResponse.fileID,
          filename: uploadResponse.filename,
          size: uploadResponse.size,
          mimeType: file.type,
          status: 'indexed',
          uploadedAt: new Date(),
          indexedAt: new Date()
        };

        setUploadedFiles(prev => [newFile, ...prev]);
      }
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileID: string) => {
    if (!confirm('Are you sure you want to delete this file? It will be removed from your AI assistant\'s knowledge base.')) {
      return;
    }

    setDeletingFileID(fileID);
    setError(null);

    try {
      await sdkClient.agents.coachReplica.removeFileFromVectorStore(fileID);

      setUploadedFiles(prev => prev.filter(f => f.id !== fileID));
    } catch (err) {
      setError('Failed to delete file. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setDeletingFileID(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const copyToClipboard = async (text: string, type: 'embed' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'embed') {
        setCopiedEmbed(true);
        setTimeout(() => setCopiedEmbed(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-black via-neutral-900 to-black relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute w-96 h-96 -left-20 top-40 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[120px]" />
      <div className="absolute w-96 h-96 -right-20 bottom-40 opacity-20 bg-gradient-to-l from-purple-600 via-fuchsia-400 to-violet-600 rounded-full blur-[120px]" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex w-full px-4 lg:px-[30px] py-5 justify-between items-center border-b border-[#373535] min-h-[86px] flex-wrap gap-4">
          <h1 className="text-[#F9F9F9] font-inter text-4xl font-semibold leading-normal tracking-[-0.96px]">
            Bot Training
          </h1>

          {/* Action Buttons */}
          <div className="flex items-center gap-8">
            <button onClick={() => router.push(`/chat/${user?.id}`)} className="text-[#DF69FF] font-inter text-lg font-semibold leading-[25.6px] hover:text-[#B339D4] transition-colors">
              Preview ChatBot
            </button>
            <div className="w-px h-[27px] bg-[#373535]"></div>
            <button
              onClick={() => copyToClipboard(chatbotLink, 'link')}
              className="text-[#DF69FF] font-inter text-lg font-semibold leading-[25.6px] hover:text-[#B339D4] transition-colors flex items-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy ChatBot Link
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 lg:mx-[30px] mt-5 flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-5 h-5 text-red-400 hover:text-red-300" />
            </button>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-[30px]">
          <div className="flex flex-col gap-[30px] w-full">
            {/* Embed Code Section */}
            <div className="w-full rounded-[20px] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] border border-[#373535] p-6">
              <h3 className="text-[#F9F9F9] font-inter text-2xl font-medium leading-[25.6px] mb-4">
                Embed ChatBot on Your Website
              </h3>
              <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%] mb-5">
                Copy and paste this code snippet into your website's HTML to add the AI chatbot. It will appear as a floating button on your site.
              </p>

              <div className="relative">
                <pre className="bg-black/50 border border-[#454444] rounded-lg p-4 overflow-x-auto text-[#DF69FF] font-mono text-sm">
                  {embedCode}
                </pre>
                <button
                  onClick={() => copyToClipboard(embedCode, 'embed')}
                  className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg text-white text-sm font-medium hover:from-purple-700 hover:to-fuchsia-700 transition-all"
                >
                  {copiedEmbed ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-[30px] w-full">
              {/* Left Section - Training */}
              <div className="flex-1 flex flex-col gap-[30px]">
                {/* Train Section */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-[#F9F9F9] font-inter text-2xl font-medium leading-[25.6px]">
                    Train The Next Level Coach AI
                  </h3>
                  <p className="text-[#C5C5C5] font-inter text-sm font-normal leading-[150%] max-w-[980px]">
                    In order to personalize your automated email responses and attune them to your coaching philosophy. Upload documents related to your course content, your methods, your philosophy here.
                  </p>
                </div>

                {/* Upload Section */}
                <div className="flex flex-col gap-3">
                  <label className="text-[#F9F9F9] font-inter text-sm font-medium leading-[25.6px]">
                    Upload Document<span className="text-red-500">*</span>
                  </label>

                  <label className="flex h-[388px] justify-center items-center rounded-[30px] border border-dashed border-[#454444] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] cursor-pointer hover:border-[#DF69FF] transition-colors">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className="flex flex-col items-center gap-5">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-12 h-12 text-[#DF69FF] animate-spin" />
                          <div className="text-white text-center font-inter text-xl font-normal leading-5">
                            Uploading and indexing file...
                          </div>
                        </>
                      ) : (
                        <>
                          <UploadIcon />
                          <div className="flex flex-col items-center gap-4">
                            <div className="text-white text-center font-inter text-xl font-normal leading-5">
                              Drag or click to upload the file
                            </div>
                            <div className="text-white text-center font-inter text-base font-medium leading-5 opacity-50">
                              Maximum File size 30MB
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Right Section - Uploaded Documents */}
              <div className="w-full lg:w-[709px] flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#F9F9F9] font-inter text-2xl font-medium leading-[25.6px]">
                    Uploaded Documents
                  </h3>
                  <span className="text-[#C5C5C5] font-inter text-sm">
                    {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'}
                  </span>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#DF69FF] animate-spin" />
                  </div>
                ) : uploadedFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 rounded-[10px] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] border border-dashed border-[#454444]">
                    <DocumentIcon />
                    <p className="text-[#C5C5C5] font-inter text-sm mt-4">
                      No documents uploaded yet
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="w-full min-h-[74px] rounded-[10px] bg-gradient-to-br from-[rgba(38,38,38,0.30)] to-[rgba(19,19,19,0.30)] border border-[#373535] relative hover:border-[#DF69FF]/30 transition-colors">
                        <div className="flex items-center h-full px-5 py-4 gap-3">
                          <DocumentIcon />

                          <div className="flex-1 min-w-0">
                            <p className="text-[#F9F9F9] font-inter text-base font-medium leading-5 truncate">
                              {file.filename}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[#C5C5C5] font-inter text-xs">
                                {formatFileSize(file.size)}
                              </span>
                              <span className="text-[#C5C5C5] font-inter text-xs">•</span>
                              <span className="text-[#C5C5C5] font-inter text-xs">
                                Uploaded {formatDate(file.uploadedAt)}
                              </span>
                              {file.status === 'indexed' && (
                                <>
                                  <span className="text-[#C5C5C5] font-inter text-xs">•</span>
                                  <span className="text-green-400 font-inter text-xs flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Indexed
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              disabled={deletingFileID === file.id}
                              className="w-9 h-9 flex justify-center items-center rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                              title="Delete file"
                            >
                              {deletingFileID === file.id ? (
                                <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                              ) : (
                                <X className="w-5 h-5 text-red-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachReplica;
