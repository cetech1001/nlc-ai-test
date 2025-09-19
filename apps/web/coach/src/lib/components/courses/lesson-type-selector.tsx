import React from 'react';
import { Video, FileText, FileDown, ArrowLeft } from 'lucide-react';

interface LessonTypeSelectorProps {
  selectedChapter: {
    chapterID: string;
    title: string;
  } | null;
  onBack: () => void;
  onSelectType: (type: 'video' | 'text' | 'pdf') => void;
}

export const LessonTypeSelector: React.FC<LessonTypeSelectorProps> = ({
  selectedChapter,
  onBack,
  onSelectType
}) => {
  if (!selectedChapter) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-white text-lg mb-4">No chapter selected</p>
          <p className="text-neutral-400 text-sm mb-6">
            Please select a chapter from the sidebar to create a lesson
          </p>
          <button
            onClick={onBack}
            className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-white text-2xl font-bold">Create New Lesson</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Creating lesson in: <span className="text-purple-400 font-medium">{selectedChapter.title}</span>
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-violet-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <div>
            <h3 className="text-white font-semibold">Selected Chapter</h3>
            <p className="text-purple-200 text-sm">{selectedChapter.title}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-white text-xl font-semibold mb-6">Choose lesson type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <button
            onClick={() => onSelectType('video')}
            className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-8 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all group flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div className="text-white font-semibold text-lg mb-2">Video Lesson</div>
            <p className="text-neutral-400 text-sm">
              Upload video files or embed from URL. Perfect for tutorials and demonstrations.
            </p>
          </button>

          <button
            onClick={() => onSelectType('text')}
            className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-8 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all group flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="text-white font-semibold text-lg mb-2">Text Lesson</div>
            <p className="text-neutral-400 text-sm">
              Create rich text content with formatting. Great for written explanations and guides.
            </p>
          </button>

          <button
            onClick={() => onSelectType('pdf')}
            className="bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border border-neutral-600 rounded-xl p-8 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/20 transition-all group flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileDown className="w-8 h-8 text-white" />
            </div>
            <div className="text-white font-semibold text-lg mb-2">PDF Lesson</div>
            <p className="text-neutral-400 text-sm">
              Upload PDF documents, worksheets, and downloadable resources.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
