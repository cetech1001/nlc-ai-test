import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button, Textarea, Label } from '@nlc-ai/web-ui';
import { toast } from 'sonner';
import {sdkClient} from "@/lib";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postID: string;
  communityID: string;
  initialContent: string;
  onSaveSuccess?: (newContent: string) => void;
}

export const EditPostModal = ({ isOpen, onClose, postID, communityID, initialContent, onSaveSuccess }: EditPostModalProps) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const POST_MAX_LENGTH = 2000;
  const characterCount = content.length;
  const isOverLimit = characterCount > POST_MAX_LENGTH;

  const handleSave = async () => {
    if (!content.trim() || isSaving || isOverLimit) {
      if (!content.trim()) {
        toast.error('Post content cannot be empty');
      }
      return;
    }

    setIsSaving(true);
    try {
      await sdkClient.communities.posts.updatePost(communityID, postID, {
        content: content.trim()
      });

      toast.success('Post updated successfully');
      onSaveSuccess?.(content.trim());
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setContent(initialContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] lg:rounded-[30px] border border-neutral-700 p-6 lg:p-8 w-full max-w-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-48 h-48 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
                <Save className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Edit Post</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="postContent" className="text-white text-sm mb-2 block">
                Content <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Textarea
                  id="postContent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={6}
                  className={`bg-neutral-800/50 border text-white placeholder:text-stone-400 resize-none ${
                    isOverLimit ? 'border-red-500' : 'border-neutral-600'
                  }`}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <span className={`text-xs ${
                    isOverLimit ? 'text-red-400' :
                      characterCount > POST_MAX_LENGTH * 0.8 ? 'text-yellow-400' :
                        'text-stone-500'
                  }`}>
                    {characterCount}/{POST_MAX_LENGTH}
                  </span>
                </div>
              </div>
              {isOverLimit && (
                <p className="text-red-400 text-xs mt-1">
                  Content exceeds maximum length
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !content.trim() || isOverLimit}
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
