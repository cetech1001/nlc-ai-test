import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, Upload } from 'lucide-react';

interface PDFLessonFormProps {
  chapterID?: string;
  lessonID?: string;
  lessonToEdit?: {
    id: string;
    title: string;
    description?: string;
    pdfUrl?: string;
    estimatedMinutes?: number;
    isLocked?: boolean;
  } | null;
  chapterTitle?: string;
  onBack: () => void;
  onSave: (lessonData: any) => void;
  onUploadPDF?: (file: File) => Promise<string>;
}

export const PDFLessonForm: React.FC<PDFLessonFormProps> = ({
                                                              chapterID,
                                                              lessonID,
                                                              lessonToEdit,
                                                              chapterTitle,
                                                              onBack,
                                                              onSave,
                                                              onUploadPDF
                                                            }) => {
  const [formData, setFormData] = useState({
    title: '',
    uploadedFile: null as File | null,
    uploadedPdfUrl: '',
    estimatedMinutes: 30,
    settings: {
      isFreePreview: false,
      isPrerequisite: false,
      enableDiscussions: false,
      makeVideoDownloadable: false
    },
    icon: '',
    label: ''
  });

  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  // Populate form when editing
  useEffect(() => {
    if (lessonToEdit) {
      setFormData(prev => ({
        ...prev,
        title: lessonToEdit.title,
        uploadedPdfUrl: lessonToEdit.pdfUrl || '',
        estimatedMinutes: lessonToEdit.estimatedMinutes || 30,
        settings: {
          ...prev.settings,
          isFreePreview: !lessonToEdit.isLocked
        }
      }));
    }
  }, [lessonToEdit]);

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadPDF) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Please select a valid PDF file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setUploadError('PDF file size must be less than 50MB');
      return;
    }

    setIsUploadingPdf(true);
    setUploadError('');

    try {
      const uploadedUrl = await onUploadPDF(file);
      setFormData(prev => ({
        ...prev,
        uploadedFile: file,
        uploadedPdfUrl: uploadedUrl
      }));
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload PDF');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSave = () => {
    const lessonData = {
      ...formData,
      type: 'pdf',
      pdfUrl: formData.uploadedPdfUrl,
      chapterID,
      lessonID
    };
    onSave(lessonData);
  };

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-purple-900/30"></div>

      <div className="pt-8 pb-16 px-6 w-full relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-white text-2xl font-bold">
              {lessonToEdit ? 'Edit Lesson' : 'New Lesson'}
            </h1>
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-medium">
              PDF
            </span>
          </div>
        </div>

        {chapterTitle && (
          <div className="bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-violet-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div>
                <h3 className="text-white font-semibold">Chapter: {chapterTitle}</h3>
                {lessonToEdit && (
                  <p className="text-purple-200 text-sm">Editing: {lessonToEdit.title}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-[20px] border border-neutral-700 overflow-hidden">
            <div className="p-8 space-y-8">
              {uploadError && (
                <div className="mb-6 p-4 bg-red-800/20 border border-red-600 rounded-lg">
                  <p className="text-red-400 text-sm">{uploadError}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-white text-sm font-medium">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-white text-sm font-medium">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.estimatedMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 30 }))}
                  className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-white text-sm font-medium">
                  Upload a PDF File <span className="text-red-400">*</span>
                </label>
                <div className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center">
                  {formData.uploadedPdfUrl && (
                    <div className="mb-4">
                      <div className="bg-green-800/20 border border-green-600 rounded-lg p-3">
                        <p className="text-green-400 text-sm">✓ PDF uploaded successfully</p>
                      </div>
                    </div>
                  )}

                  <div className="text-neutral-400 mb-4">
                    {formData.uploadedFile ?
                      `${formData.uploadedFile.name} ${formData.uploadedPdfUrl ? '(Uploaded)' : '(Ready to upload)'}` :
                      lessonToEdit?.pdfUrl ? 'Current PDF file uploaded' : 'No file selected'}
                  </div>

                  <button
                    type="button"
                    disabled={isUploadingPdf}
                    onClick={() => document.getElementById('pdf-upload')?.click()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                  >
                    {isUploadingPdf ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {lessonToEdit?.pdfUrl || formData.uploadedPdfUrl ? 'Replace PDF' : 'Browse files'}
                      </>
                    )}
                  </button>

                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    disabled={isUploadingPdf}
                  />
                </div>
                <p className="text-neutral-400 text-sm">You can upload PDF files up to 50MB in size</p>
              </div>

              <div className="space-y-6">
                <h3 className="text-white text-lg font-semibold">Lesson Settings</h3>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.isFreePreview}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, isFreePreview: e.target.checked }
                      }))}
                      className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Make this a free preview lesson</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.isPrerequisite}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, isPrerequisite: e.target.checked }
                      }))}
                      className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Make this a prerequisite</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.enableDiscussions}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, enableDiscussions: e.target.checked }
                      }))}
                      className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Enable discussions for this lesson</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.makeVideoDownloadable}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, makeVideoDownloadable: e.target.checked }
                      }))}
                      className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Make this file downloadable</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-medium">
                    Lesson icon & label <span className="text-red-400">*</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-lg px-4 py-3 appearance-none focus:border-purple-500 focus:outline-none"
                      >
                        <option value="">Choose icon</option>
                        <option value="pdf">PDF icon</option>
                        <option value="document">Document icon</option>
                        <option value="file">File icon</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter label"
                      value={formData.label}
                      onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-neutral-400 text-sm">You can hide all lesson icon & labels in Settings. Max 16 characters</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  {lessonToEdit ? 'Update Lesson' : 'Add Lesson'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
