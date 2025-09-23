import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Button, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@nlc-ai/web-ui';
import { toast } from 'sonner';
import { sdkClient } from "@/lib";
import { useRouter } from "next/navigation";

interface GenerateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTENT_TYPES = [
  { value: 'video', label: 'Video Content' },
  { value: 'post', label: 'Social Media Post' },
  { value: 'carousel', label: 'Carousel Post' },
  { value: 'story', label: 'Story Content' },
  { value: 'reel', label: 'Reel/Short Video' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'email', label: 'Email Content' },
];

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  // { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter / X' },
  // { value: 'threads', label: 'Threads' },
];

export const GenerateIdeaModal = ({ isOpen, onClose }: GenerateIdeaModalProps) => {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [contentType, setContentType] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
      const result = await sdkClient.agents.contentSuggestion.generateContentSuggestion({
        idea: idea.trim(),
        contentType: contentType || undefined,
        targetPlatforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
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
    setSelectedPlatforms([]);
    setCustomInstructions('');
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
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-48 h-48 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
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

            <div>
              <Label htmlFor="contentType" className="text-white text-sm mb-2 block">
                Content Type (Optional)
              </Label>
              <Select
                value={contentType} onValueChange={setContentType}
                disabled={isGenerating} className="bg-neutral-800 border-neutral-600">
                <SelectTrigger className="bg-neutral-800/50 border-neutral-600 text-white">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-600">
                  {CONTENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-white hover:bg-neutral-700">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-sm mb-2 block">
                Target Platforms (Optional)
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
                Additional Instructions (Optional)
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
                className="flex-1"
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !idea.trim() || isIdeaOverLimit || isInstructionsOverLimit}
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
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
