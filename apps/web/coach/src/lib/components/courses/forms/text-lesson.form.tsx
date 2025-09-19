import React, { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import {RichTextEditor} from "@nlc-ai/web-shared";

interface TextLessonFormProps {
  chapterID?: string;
  lessonID?: string;
  onBack: () => void;
  onSave: (lessonData: any) => void;
}

export const TextLessonForm: React.FC<TextLessonFormProps> = ({
 chapterID,
 lessonID,
 onBack,
 onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    settings: {
      isFreePreview: false,
      isPrerequisite: false,
      enableDiscussions: false,
      makeVideoDownloadable: false
    },
    icon: '',
    label: ''
  });

  const handleSave = () => {
    const lessonData = {
      ...formData,
      type: 'text',
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
            <h1 className="text-white text-2xl font-bold">New Lessons</h1>
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-medium">
              Text
            </span>
          </div>
        </div>

        <div className="sm:max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-[20px] border border-neutral-700 overflow-hidden">
            <div className="p-4 sm:p-8 space-y-8">
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-white text-sm font-medium">
                  Content <span className="text-red-400">*</span>
                </label>

                <div className="bg-neutral-800 border border-neutral-600 rounded-lg p-3 h-96">
                  <RichTextEditor
                    content={formData.content}
                    updateContent={content => setFormData(prevState => ({ ...prevState, content }))}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-white text-lg font-semibold">Lessons settings</h3>

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
                    <span className="text-white">Make this video downloadable</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-medium">
                    Lesson icon & label <span className="text-red-400">*</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-lg px-4 py-3 appearance-none focus:border-purple-500 focus:outline-none"
                      >
                        <option value="">Choose icon</option>
                        <option value="text">Text icon</option>
                        <option value="document">Document icon</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter label"
                      value={formData.label}
                      onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-lg px-4 py-3 placeholder-neutral-400 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-neutral-400 text-sm">You can hide all lesson icon & labels in Settings. Max 16 characters</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-8 py-3 rounded-lg font-medium transition-opacity"
                >
                  Add Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
