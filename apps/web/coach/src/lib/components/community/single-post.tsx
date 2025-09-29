import React, { useState } from 'react';
import { PostResponse, ReactionType, PostCommentResponse } from '@nlc-ai/sdk-communities';
import { UserProfile, UserType } from '@nlc-ai/types';
import {
  sdkClient,
  EditPostModal,
  EditCommentModal,
  PostHeader,
  PostContent,
  PostActions,
  CommentsSection
} from '@/lib';
import { toast } from 'sonner';
import { appConfig } from '@nlc-ai/web-shared';

interface SinglePostProps {
  post: PostResponse;
  user: UserProfile | null;
  handleReactToPost: (postID: string, reactionType: ReactionType) => void;
  handleAddComment: (postID: string, newComment: string) => void;
  onPostUpdate?: (updatedPost: PostResponse) => void;
  onPostDelete?: (postID: string) => void;
  onUserClick?: (userID: string, userType: UserType) => void;
}

interface OptimisticComment extends PostCommentResponse {
  isOptimistic?: boolean;
  tempID?: string;
}

export const SinglePost: React.FC<SinglePostProps> = (props) => {
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<{ [key: string]: OptimisticComment[] }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({});
  const [commentsPage, setCommentsPage] = useState<{ [key: string]: number }>({});
  const [hasMoreComments, setHasMoreComments] = useState<{ [key: string]: boolean }>({});

  // Nested replies state
  const [repliesExpanded, setRepliesExpanded] = useState<{ [key: string]: boolean }>({});
  const [repliesData, setRepliesData] = useState<{ [key: string]: PostCommentResponse[] }>({});
  const [loadingReplies, setLoadingReplies] = useState<{ [key: string]: boolean }>({});

  // Edit comment modal states
  const [showEditCommentModal, setShowEditCommentModal] = useState<{ [key: string]: boolean }>({});
  const [editingCommentContent, setEditingCommentContent] = useState<{ [key: string]: string }>({});

  // Post edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ [key: string]: boolean }>({});
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  // Optimistic state
  const [optimisticPost, setOptimisticPost] = useState<PostResponse>(props.post);
  const [isReacting, setIsReacting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const isOwnPost = props.user?.id === optimisticPost.communityMember?.userID;

  const toggleComments = async (postID: string) => {
    const isCurrentlyShowing = showComments[postID];

    setShowComments(prev => ({
      ...prev,
      [postID]: !prev[postID]
    }));

    if (!isCurrentlyShowing && !comments[postID]) {
      await loadComments(postID, 1);
    }
  };

  const loadComments = async (postID: string, page: number = 1) => {
    try {
      setLoadingComments(prev => ({ ...prev, [postID]: true }));

      const response = await sdkClient.communities.comments.getComments(props.post.communityID, {
        postID,
        page,
        limit: 10,
      });

      setComments(prev => ({
        ...prev,
        [postID]: page === 1 ? response.data : [...(prev[postID] || []), ...response.data]
      }));

      setCommentsPage(prev => ({ ...prev, [postID]: page }));
      setHasMoreComments(prev => ({
        ...prev,
        [postID]: response.pagination.hasNext
      }));
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(prev => ({ ...prev, [postID]: false }));
    }
  };

  const loadMoreComments = async (postID: string) => {
    const currentPage = commentsPage[postID] || 1;
    await loadComments(postID, currentPage + 1);
  };

  const handleLoadReplies = async (commentID: string) => {
    const isExpanded = repliesExpanded[commentID];

    // Toggle expansion
    setRepliesExpanded(prev => ({
      ...prev,
      [commentID]: !isExpanded
    }));

    // If expanding and not yet loaded, fetch replies
    if (!isExpanded && !repliesData[commentID]) {
      try {
        setLoadingReplies(prev => ({ ...prev, [commentID]: true }));

        const response = await sdkClient.communities.comments.getReplies(
          props.post.communityID,
          commentID,
          { limit: 100 } // Load all replies for now
        );

        setRepliesData(prev => ({
          ...prev,
          [commentID]: response.data
        }));
      } catch (error) {
        console.error('Failed to load replies:', error);
        toast.error('Failed to load replies');
      } finally {
        setLoadingReplies(prev => ({ ...prev, [commentID]: false }));
      }
    }
  };

  const handleOptimisticReaction = async (postID: string, reactionType: ReactionType) => {
    if (isReacting) return;

    setIsReacting(true);
    const previousReaction = optimisticPost.userReaction;
    const previousLikeCount = optimisticPost.likeCount;

    const newReaction = previousReaction === reactionType ? undefined : reactionType;
    const likeCountDelta =
      previousReaction === reactionType ? -1 :
        previousReaction ? 0 : 1;

    const updatedPost = {
      ...optimisticPost,
      userReaction: newReaction,
      likeCount: previousLikeCount + likeCountDelta
    };

    setOptimisticPost(updatedPost);
    props.onPostUpdate?.(updatedPost);

    try {
      await props.handleReactToPost(postID, reactionType);
    } catch (error) {
      setOptimisticPost({
        ...optimisticPost,
        userReaction: previousReaction,
        likeCount: previousLikeCount
      });
      props.onPostUpdate?.(props.post);
      toast.error('Failed to update reaction');
      console.error('Failed to react to post:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const handleOptimisticComment = async () => {
    if (!newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    const tempID = `temp-${Date.now()}`;
    const optimisticCommentData: OptimisticComment = {
      id: tempID,
      tempID,
      postID: props.post.id,
      communityMemberID: props.user?.id || '',
      content: newComment,
      mediaUrls: [],
      parentCommentID: undefined,
      likeCount: 0,
      replyCount: 0,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      communityMember: {
        id: '',
        userID: props.user?.id!,
        userType: props.user?.type!,
        userName: props.user?.firstName + ' ' + props.user?.lastName,
        userAvatarUrl: props.user?.avatarUrl || undefined,
        role: 'member' as any
      },
      isOptimistic: true,
      replies: []
    };

    setComments(prev => ({
      ...prev,
      [props.post.id]: [optimisticCommentData, ...(prev[props.post.id] || [])]
    }));

    const updatedPost = {
      ...optimisticPost,
      commentCount: optimisticPost.commentCount + 1
    };
    setOptimisticPost(updatedPost);
    props.onPostUpdate?.(updatedPost);

    const commentToAdd = newComment;
    setNewComment('');

    try {
      await props.handleAddComment(props.post.id, commentToAdd);

      setComments(prev => ({
        ...prev,
        [props.post.id]: (prev[props.post.id] || []).filter(c => c.tempID !== tempID)
      }));

      await loadComments(props.post.id, 1);
    } catch (error) {
      setComments(prev => ({
        ...prev,
        [props.post.id]: (prev[props.post.id] || []).filter(c => c.tempID !== tempID)
      }));

      setOptimisticPost({
        ...optimisticPost,
        commentCount: optimisticPost.commentCount - 1
      });

      setNewComment(commentToAdd);
      toast.error('Failed to add comment');
      console.error('Failed to add comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleReactToComment = async (commentID: string, reactionType: ReactionType) => {
    // Helper to update comment in nested structure
    const updateCommentInTree = (commentsList: OptimisticComment[]): OptimisticComment[] => {
      return commentsList.map(comment => {
        if (comment.id === commentID) {
          const wasLiked = comment.userReaction === reactionType;
          return {
            ...comment,
            likeCount: wasLiked ? comment.likeCount - 1 : comment.likeCount + 1,
            userReaction: wasLiked ? undefined : reactionType
          };
        }
        return comment;
      });
    };

    const previousComments = comments[props.post.id] || [];
    const updatedComments = updateCommentInTree(previousComments);

    setComments(prev => ({
      ...prev,
      [props.post.id]: updatedComments
    }));

    // Also update in replies data if exists
    Object.keys(repliesData).forEach(parentID => {
      const updatedReplies = updateCommentInTree(repliesData[parentID] as OptimisticComment[]);
      setRepliesData(prev => ({
        ...prev,
        [parentID]: updatedReplies
      }));
    });

    try {
      await sdkClient.communities.comments.reactToComment(props.post.communityID, commentID, { type: reactionType });
    } catch (error) {
      setComments(prev => ({
        ...prev,
        [props.post.id]: previousComments
      }));
      toast.error('Failed to update reaction');
      console.error('Failed to react to comment:', error);
    }
  };

  const handleEditPost = () => setShowEditModal(true);

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await sdkClient.communities.posts.deletePost(props.post.communityID, props.post.id);
      toast.success('Post deleted successfully');
      props.onPostDelete?.(props.post.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const handleCopyLink = () => {
    const url = `${appConfig.publicUrl}/communities/${props.post.community?.slug}/post/${props.post.id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success('Link copied to clipboard');
      });
  };

  const handleReportPost = () => {
    toast.info('Report functionality will be implemented soon');
  };

  const handleEditComment = (commentID: string, currentContent: string) => {
    setEditingCommentContent(prev => ({ ...prev, [commentID]: currentContent }));
    setShowEditCommentModal(prev => ({ ...prev, [commentID]: true }));
  };

  const handleDeleteComment = async (commentID: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await sdkClient.communities.comments.deleteComment(props.post.communityID, commentID);

      // Helper to mark comment as deleted in tree
      const markDeletedInTree = (commentsList: OptimisticComment[]): OptimisticComment[] => {
        return commentsList.map(comment => {
          if (comment.id === commentID) {
            return {
              ...comment,
              isDeleted: true,
              content: '',
              mediaUrls: []
            };
          }
          return comment;
        }).filter(comment => {
          // Remove if it's the deleted comment and has no replies
          if (comment.id === commentID && comment.replyCount === 0) {
            return false;
          }
          return true;
        });
      };

      const updatedComments = markDeletedInTree(comments[props.post.id] || []);
      setComments(prev => ({
        ...prev,
        [props.post.id]: updatedComments
      }));

      // Update replies data
      Object.keys(repliesData).forEach(parentID => {
        const updatedReplies = markDeletedInTree(repliesData[parentID] as OptimisticComment[]);
        setRepliesData(prev => ({
          ...prev,
          [parentID]: updatedReplies
        }));
      });

      const updatedPost = {
        ...optimisticPost,
        commentCount: optimisticPost.commentCount - 1
      };
      setOptimisticPost(updatedPost);
      props.onPostUpdate?.(updatedPost);

      toast.success('Comment deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete comment');
    }
  };

  const handleReplyToComment = (commentID: string) => {
    setReplyingTo(prev => ({
      ...prev,
      [commentID]: !prev[commentID]
    }));
  };

  const handleSubmitReply = async (parentCommentID: string) => {
    const reply = replyText[parentCommentID]?.trim();
    if (!reply) return;

    try {
      await sdkClient.communities.comments.createComment(props.post.communityID, {
        content: reply,
        postID: props.post.id,
        parentCommentID,
        mediaUrls: []
      });

      setReplyText(prev => ({ ...prev, [parentCommentID]: '' }));
      setReplyingTo(prev => ({ ...prev, [parentCommentID]: false }));
      toast.success('Reply added successfully');

      // Reload replies for this comment
      setRepliesData(prev => ({
        ...prev,
        [parentCommentID]: []
      }));
      await handleLoadReplies(parentCommentID);

      // Re-expand if it was expanded
      setRepliesExpanded(prev => ({
        ...prev,
        [parentCommentID]: true
      }));

      // Update reply count in parent comment
      const updateReplyCount = (commentsList: OptimisticComment[]): OptimisticComment[] => {
        return commentsList.map(comment => {
          if (comment.id === parentCommentID) {
            return {
              ...comment,
              replyCount: comment.replyCount + 1
            };
          }
          return comment;
        });
      };

      setComments(prev => ({
        ...prev,
        [props.post.id]: updateReplyCount(prev[props.post.id] || [])
      }));

      Object.keys(repliesData).forEach(pID => {
        setRepliesData(prev => ({
          ...prev,
          [pID]: updateReplyCount(prev[pID] as OptimisticComment[])
        }));
      });

    } catch (error: any) {
      toast.error(error.message || 'Failed to add reply');
    }
  };

  const handleCommentEditSuccess = (commentID: string, newContent: string) => {
    const updateInTree = (commentsList: OptimisticComment[]): OptimisticComment[] => {
      return commentsList.map(comment =>
        comment.id === commentID
          ? { ...comment, content: newContent, isEdited: true }
          : comment
      );
    };

    setComments(prev => ({
      ...prev,
      [props.post.id]: updateInTree(prev[props.post.id] || [])
    }));

    Object.keys(repliesData).forEach(parentID => {
      setRepliesData(prev => ({
        ...prev,
        [parentID]: updateInTree(prev[parentID] as OptimisticComment[])
      }));
    });

    setShowEditCommentModal(prev => ({ ...prev, [commentID]: false }));
  };

  return (
    <>
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[16px] sm:rounded-[20px] border border-neutral-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-24 sm:w-32 h-24 sm:h-32 -left-4 sm:-left-6 -top-6 sm:-top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px] sm:blur-[56px]" />
        </div>

        <div className="relative z-10 p-4">
          <PostHeader
            post={optimisticPost}
            isOwnPost={isOwnPost}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onCopyLink={handleCopyLink}
            onReport={handleReportPost}
            onUserClick={props.onUserClick}
          />

          <PostContent
            content={optimisticPost.content}
            mediaUrls={optimisticPost.mediaUrls}
          />

          <PostActions
            likeCount={optimisticPost.likeCount}
            commentCount={optimisticPost.commentCount}
            userReaction={optimisticPost.userReaction}
            isReacting={isReacting}
            showComments={showComments[optimisticPost.id]}
            onReact={(reactionType: ReactionType) => handleOptimisticReaction(optimisticPost.id, reactionType)}
            onToggleComments={() => toggleComments(optimisticPost.id)}
          />

          {showComments[optimisticPost.id] && (
            <CommentsSection
              postID={optimisticPost.id}
              comments={comments[optimisticPost.id] || []}
              commentCount={optimisticPost.commentCount}
              user={props.user}
              isLoading={loadingComments[optimisticPost.id] || false}
              hasMore={hasMoreComments[optimisticPost.id] || false}
              newComment={newComment}
              isCommenting={isCommenting}
              onCommentChange={setNewComment}
              onSubmitComment={handleOptimisticComment}
              onReactToComment={handleReactToComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onReplyToComment={handleReplyToComment}
              onLoadMore={() => loadMoreComments(optimisticPost.id)}
              onUserClick={props.onUserClick}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyTextChange={(commentID: string, text: string) => setReplyText(prev => ({ ...prev, [commentID]: text }))}
              onSubmitReply={handleSubmitReply}
              onLoadReplies={handleLoadReplies}
              repliesExpanded={repliesExpanded}
              repliesData={repliesData}
              loadingReplies={loadingReplies}
            />
          )}
        </div>
      </div>

      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        postID={optimisticPost.id}
        communityID={optimisticPost.communityID}
        initialContent={optimisticPost.content}
        onSaveSuccess={(newContent) => {
          const updatedPost = { ...optimisticPost, content: newContent, isEdited: true };
          setOptimisticPost(updatedPost);
          props.onPostUpdate?.(updatedPost);
        }}
      />

      {Object.entries(showEditCommentModal).map(([commentID, isOpen]) => (
        <EditCommentModal
          key={commentID}
          isOpen={isOpen}
          onClose={() => setShowEditCommentModal(prev => ({ ...prev, [commentID]: false }))}
          commentID={commentID}
          communityID={optimisticPost.communityID}
          initialContent={editingCommentContent[commentID] || ''}
          onSaveSuccess={(newContent) => handleCommentEditSuccess(commentID, newContent)}
        />
      ))}
    </>
  );
};
