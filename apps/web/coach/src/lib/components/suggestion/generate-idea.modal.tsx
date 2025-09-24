import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Video, Image, FileText } from 'lucide-react';
import { Button, Textarea, Label } from '@nlc-ai/web-ui';
import { toast } from 'sonner';
import { sdkClient } from "@/lib";
import { useRouter } from "next/navigation";

interface GenerateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTENT_TYPES = [
  { value: 'video', label: 'Video Content', icon: Video },
  { value: 'post', label: 'Social Media Post', icon: FileText },
  { value: 'carousel', label: 'Carousel Post', icon: Image },
  { value: 'story', label: 'Story Content', icon: Image },
  { value: 'reel', label: 'Reel/Short Video', icon: Video },
  { value: 'blog', label: 'Blog Post', icon: FileText },
  { value: 'email', label: 'Email Content', icon: FileText },
];

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'Twitter / X' },
];

const VIDEO_DURATIONS = [
  { value: '15s', label: '15 seconds' },
  { value: '30s', label: '30 seconds' },
  { value: '60s', label: '1 minute' },
  { value: '90s', label: '1.5 minutes' },
  { value: '3m', label: '3 minutes' },
  { value: '5m', label: '5 minutes' },
  { value: '10m+', label: '10+ minutes' },
];

const VIDEO_STYLES = [
  { value: 'talking-head', label: 'Talking Head' },
  { value: 'tutorial', label: 'Tutorial/How-to' },
  { value: 'lifestyle', label: 'Lifestyle/Behind-the-scenes' },
  { value: 'animated', label: 'Animated/Motion Graphics' },
  { value: 'slideshow', label: 'Slideshow/Presentation' },
  { value: 'testimonial', label: 'Testimonial/Case Study' },
];

const VIDEO_ORIENTATIONS = [
  { value: 'vertical', label: 'Vertical (9:16)' },
  { value: 'horizontal', label: 'Horizontal (16:9)' },
  { value: 'square', label: 'Square (1:1)' },
];

export const GenerateIdeaModal = ({ isOpen, onClose }: GenerateIdeaModalProps) => {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [contentType, setContentType] = useState('');
  const [category, setCategory] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Video-specific options
  const [videoDuration, setVideoDuration] = useState('');
  const [videoStyle, setVideoStyle] = useState('');
  const [includeMusic, setIncludeMusic] = useState(false);
  const [includeCaptions, setIncludeCaptions] = useState(true);
  const [videoOrientation, setVideoOrientation] = useState('');

  const isVideoContent = ['video', 'reel'].includes(contentType);

  // Load categories on mount
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const result = await sdkClient.agents.contentSuggestion.getContentCategories();
      setCategories(result.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  if (!isOpen) return null;

  const IDEA_MAX_LENGTH = 500;
  const INSTRUCTIONS_MAX_LENGTH = 300;
  const ideaCharacterCount = idea.length;
  const instructionsCharacterCount = customInstructions.length;
  const isIdeaOverLimit = ideaCharacterCount > IDEA_MAX_LENGTH;
  const isInstructionsOverLimit = instructionsCharacterCount > INSTRUCTIONS_MAX_LENGTH;

  const handleGenerate = async () => {
    if (!idea.trim() || isGenerating || isIdeaOverLimit || isInstructionsOverLimit) {
      if (!idea.trim()) {
        toast.error('Please enter your content idea');
      }
      return;
    }

    setIsGenerating(true);
    try {
      const videoOptions = isVideoContent ? {
        duration: videoDuration || undefined,
        style: videoStyle || undefined,
        includeMusic,
        includeCaptions,
        orientation: videoOrientation as 'vertical' | 'horizontal' | 'square' || undefined,
      } : undefined;

      const result = await sdkClient.agents.contentSuggestion.generateContentSuggestion({
        idea: idea.trim(),
        contentType: contentType || undefined,
        targetPlatforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
        category: category || undefined,
        videoOptions,
        customInstructions: customInstructions.trim() || undefined,
      });

      toast.success('Content suggestion generated successfully!');
      handleClose();
      router.push(`/agents/suggestion/${result.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate content suggestion');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setIdea('');
    setContentType('');
    setCategory('');
    setSelectedPlatforms([]);
    setCustomInstructions('');
    setVideoDuration('');
    setVideoStyle('');
    setIncludeMusic(false);
    setIncludeCaptions(true);
    setVideoOrientation('');
    onClose();
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8 w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-48 h-48 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
          <div className="absolute w-32 h-32 -left-4 -bottom-8 bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-600 rounded-full blur-[40px]" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Generate Content Idea</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={isGenerating}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="contentIdea" className="text-white text-sm mb-2 block">
                Your Content Idea <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Textarea
                  id="contentIdea"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe your content idea... (e.g., 'A motivational post about overcoming challenges in fitness')"
                  rows={4}
                  className={`bg-neutral-800/50 border text-white placeholder:text-stone-400 resize-none ${
                    isIdeaOverLimit ? 'border-red-500' : 'border-neutral-600'
                  }`}
                  disabled={isGenerating}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <span className={`text-xs ${
                    isIdeaOverLimit ? 'text-red-400' :
                      ideaCharacterCount > IDEA_MAX_LENGTH * 0.8 ? 'text-yellow-400' :
                        'text-stone-500'
                  }`}>
                    {ideaCharacterCount}/{IDEA_MAX_LENGTH}
                  </span>
                </div>
              </div>
              {isIdeaOverLimit && (
                <p className="text-red-400 text-xs mt-1">
                  Idea exceeds maximum length
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="contentType" className="text-white text-sm mb-2 block">
                  Content Type
                </Label>
                <select
                  id="contentType"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select content type</option>
                  {CONTENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="category" className="text-white text-sm mb-2 block">
                  Content Category
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isVideoContent && (
              <div className="space-y-4 p-4 bg-neutral-800/20 rounded-lg border border-neutral-600/50">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video Options
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white text-sm mb-2 block">Duration</Label>
                    <select
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value)}
                      disabled={isGenerating}
                      className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select duration</option>
                      {VIDEO_DURATIONS.map(duration => (
                        <option key={duration.value} value={duration.value}>
                          {duration.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-white text-sm mb-2 block">Style</Label>
                    <select
                      value={videoStyle}
                      onChange={(e) => setVideoStyle(e.target.value)}
                      disabled={isGenerating}
                      className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select style</option>
                      {VIDEO_STYLES.map(style => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-white text-sm mb-2 block">Orientation</Label>
                    <select
                      value={videoOrientation}
                      onChange={(e) => setVideoOrientation(e.target.value)}
                      disabled={isGenerating}
                      className="w-full bg-neutral-800/50 border border-neutral-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select orientation</option>
                      {VIDEO_ORIENTATIONS.map(orientation => (
                        <option key={orientation.value} value={orientation.value}>
                          {orientation.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMusic}
                      onChange={(e) => setIncludeMusic(e.target.checked)}
                      disabled={isGenerating}
                      className="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-600 rounded focus:ring-purple-500"
                    />
                    Include background music suggestions
                  </label>
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCaptions}
                      onChange={(e) => setIncludeCaptions(e.target.checked)}
                      disabled={isGenerating}
                      className="w-4 h-4 text-purple-600 bg-neutral-800 border-neutral-600 rounded focus:ring-purple-500"
                    />
                    Include captions/subtitles
                  </label>
                </div>
              </div>
            )}

            <div>
              <Label className="text-white text-sm mb-2 block">
                Target Platforms
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLATFORMS.map(platform => (
                  <button
                    key={platform.value}
                    type="button"
                    onClick={() => handlePlatformToggle(platform.value)}
                    disabled={isGenerating}
                    className={`p-2 rounded-lg border text-sm transition-colors ${
                      selectedPlatforms.includes(platform.value)
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-neutral-800/50 border-neutral-600 text-gray-400 hover:text-white hover:border-neutral-500'
                    } disabled:opacity-50`}
                  >
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="customInstructions" className="text-white text-sm mb-2 block">
                Additional Instructions
              </Label>
              <div className="relative">
                <Textarea
                  id="customInstructions"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Any specific requirements or preferences..."
                  rows={3}
                  className={`bg-neutral-800/50 border text-white placeholder:text-stone-400 resize-none ${
                    isInstructionsOverLimit ? 'border-red-500' : 'border-neutral-600'
                  }`}
                  disabled={isGenerating}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <span className={`text-xs ${
                    isInstructionsOverLimit ? 'text-red-400' :
                      instructionsCharacterCount > INSTRUCTIONS_MAX_LENGTH * 0.8 ? 'text-yellow-400' :
                        'text-stone-500'
                  }`}>
                    {instructionsCharacterCount}/{INSTRUCTIONS_MAX_LENGTH}
                  </span>
                </div>
              </div>
              {isInstructionsOverLimit && (
                <p className="text-red-400 text-xs mt-1">
                  Instructions exceed maximum length
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-neutral-600 text-white hover:bg-neutral-800"
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !idea.trim() || isIdeaOverLimit || isInstructionsOverLimit}
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Script
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
