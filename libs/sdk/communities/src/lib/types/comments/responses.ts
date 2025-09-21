import { ReactionType } from './enums';
import { MemberRole } from '../community';
import { UserType } from '@nlc-ai/sdk-users';

export interface Comment {
  id: string;
  postID?: string;
  communityMemberID: string;
  content: string;
  mediaUrls: string[];
  parentCommentID?: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  replies?: CommentResponse[];
  reactions?: CommentReaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentResponse extends Comment {
  communityMember?: {
    id: string;
    userName: string;
    userID: string;
    userAvatarUrl?: string;
    role: MemberRole;
  };
  userReaction?: ReactionType;
  _count?: {
    replies: number;
    reactions: number;
  };
}

export interface CommentReaction {
  id: string;
  commentID: string;
  userID: string;
  userType: UserType;
  type: ReactionType;
  createdAt: Date;
}
