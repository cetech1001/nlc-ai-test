import { Send, Smile, AlertCircle } from "lucide-react";
import {FC, useState} from "react";
import { toast } from "sonner";
import { NLCClient } from "@nlc-ai/sdk-main";
import { ImageUpload, UploadedImage, VideoUpload, UploadedVideo } from "../../../../components";

interface IProps {
  sdkClient: NLCClient;
  handleCreatePost: (post: string, mediaUrls?: string[]) => void;
  onOptimisticPost?: (content: string, mediaUrls?: string[]) => void;
}

export const NewPost: FC<IProps> = ({ sdkClient, ...props }) => {
  const [newPost, setNewPost] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const POST_MAX_LENGTH = 2000;
  const characterCount = newPost.length;
  const isOverLimit = characterCount > POST_MAX_LENGTH;

  const handleCreatePost = async () => {
    if (!newPost.trim() || isPosting || isOverLimit) return;

    // Check if any videos are still processing
    const hasProcessingVideos = uploadedVideos.some(
      v => v.processingStatus === 'processing' || v.processingStatus === 'pending'
    );

    if (hasProcessingVideos) {
      toast.error('Please wait for videos to finish processing');
      return;
    }

    setIsPosting(true);

    try {
      const imageUrls = uploadedImages.map(img => img.url);
      const videoUrls = uploadedVideos.map(vid => vid.url);
      const mediaUrls = [...imageUrls, ...videoUrls];

      if (props.onOptimisticPost) {
        props.onOptimisticPost(newPost, mediaUrls);
      }

      const postContent = newPost;
      const postMediaUrls = [...mediaUrls];

      // Clear form
      setNewPost('');
      setUploadedImages([]);
      setUploadedVideos([]);
      setResetKey(prevState => prevState + 1);

      // Make actual API call
      await props.handleCreatePost(postContent, postMediaUrls);
    } catch (e) {
      // Restore form data on error
      setNewPost(newPost);
      setUploadedImages([...uploadedImages]);
      setUploadedVideos([...uploadedVideos]);
      toast.error('Failed to create post. Please try again.');
      console.error('Failed to create post:', e);
    } finally {
      setIsPosting(false);
    }
  };

  const totalMediaCount = uploadedImages.length + uploadedVideos.length;
  const hasMedia = totalMediaCount > 0;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[16px] sm:rounded-[20px] border border-neutral-700 overflow-hidden mb-4 sm:mb-6">
      {/* Glow Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-24 sm:w-32 h-24 sm:h-32 -right-4 sm:-right-6 -top-6 sm:-top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px] sm:blur-[56px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="space-y-4">
          {/* Text Input */}
          <div className="relative">
            <textarea
              placeholder="Share your coaching insights with fellow coaches..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={10}
              disabled={isPosting}
              className={`w-full bg-transparent border rounded-lg px-4 py-3 text-stone-50 placeholder:text-stone-400 focus:outline-none text-sm sm:text-base resize-none disabled:opacity-50 ${
                isOverLimit
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-neutral-600 focus:border-fuchsia-500'
              }`}
            />

            {/* Character Counter */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <span className={`text-xs ${
                isOverLimit ? 'text-red-400' :
                  characterCount > POST_MAX_LENGTH * 0.8 ? 'text-yellow-400' :
                    'text-stone-500'
              }`}>
                {characterCount}/{POST_MAX_LENGTH}
              </span>
              {isOverLimit && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>

          <ImageUpload
            key={`image-reset-key-${resetKey}`}
            sdkClient={sdkClient}
            onImagesUploaded={setUploadedImages}
            maxFiles={8}
            maxSizeMB={10}
            folder="nlc-ai/posts/images"
            tags={['post-media', 'image']}
            enableCropping={false}
            showPreview={true}
            disabled={isPosting}
          />

          <VideoUpload
            key={`video-reset-key-${resetKey}`}
            sdkClient={sdkClient}
            onVideosUploaded={setUploadedVideos}
            maxFiles={1}
            maxSizeMB={10000} // 10GB
            folder="nlc-ai/posts/videos"
            tags={['post-media', 'video']}
            showPreview={true}
            disabled={isPosting}
            pollProcessingStatus={true}
          />
        </div>

        <div className="flex items-center justify-between mt-4 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              className="text-stone-400 hover:text-fuchsia-400 transition-colors flex items-center gap-1 group"
              title="Add emoji"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm hidden sm:inline">Emoji</span>
            </button>

            {hasMedia && (
              <div className="text-xs text-stone-400">
                {totalMediaCount} {totalMediaCount === 1 ? 'file' : 'files'} attached
              </div>
            )}
          </div>

          <button
            onClick={handleCreatePost}
            disabled={!newPost.trim() || isPosting || isOverLimit}
            className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
          >
            {isPosting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="hidden sm:inline">Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Post</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
