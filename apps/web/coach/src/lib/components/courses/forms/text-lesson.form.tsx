import React, {useEffect, useState} from "react";
import {ArrowLeft} from "lucide-react";
import {RichTextEditor} from "@nlc-ai/web-shared";


interface TextLessonFormProps {
  chapterID?: string;
  lessonID?: string;
  lessonToEdit?: {
    id: string;
    title: string;
    description?: string;
    content?: string;
    estimatedMinutes?: number;
    isLocked?: boolean;
  } | null;
  chapterTitle?: string;
  onBack: () => void;
  onSave: (lessonData: any) => void;
}

export const TextLessonForm: React.FC<TextLessonFormProps> = ({
  chapterID,
  lessonID,
  lessonToEdit,
  chapterTitle,
  onBack,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
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

  // Populate form when editing
  useEffect(() => {
    if (lessonToEdit) {
      setFormData(prev => ({
        ...prev,
        title: lessonToEdit.title,
        content: lessonToEdit.content || lessonToEdit.description || '',
        estimatedMinutes: lessonToEdit.estimatedMinutes || 30,
        settings: {
          ...prev.settings,
          isFreePreview: !lessonToEdit.isLocked
        }
      }));
    }
  }, [lessonToEdit]);

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
            <h1 className="text-white text-2xl font-bold">
              {lessonToEdit ? 'Edit Lesson' : 'New Lesson'}
            </h1>
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-medium">
              Text
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
                  Content <span className="text-red-400">*</span>
                </label>

                <div className="bg-neutral-800/50 border border-neutral-600 rounded-lg p-3 h-96">
                  <RichTextEditor
                    content={formData.content}
                    updateContent={(content) =>
                      setFormData(prevState => ({ ...prevState, content }))}/>
                </div>
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
