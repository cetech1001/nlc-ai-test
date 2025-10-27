import {ConversationType, UserProfile, UserType} from "@nlc-ai/types";
import {ChatContextConfig, ConversationResponse} from "@nlc-ai/sdk-messages";

/**
 * Gets the other participant in a direct conversation
 * For admin conversations, returns the assigned admin ID from metadata
 */
export const getOtherParticipant = (
  participantIDs: string[],
  types: UserType[],
  metadata: any,
  user?: UserProfile | null
) => {
  // Parse metadata if it's a string
  const parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

  // Check if this is an admin conversation
  const isAdminConversation = types.includes(UserType.ADMIN) || parsedMetadata?.pendingAdminAssignment;

  if (user?.type === UserType.ADMIN) {
    // Admin viewing conversation - get the coach
    const coachIndex = types.findIndex(t => t === UserType.COACH);
    const userID = participantIDs.find(id => id !== user.id)!;
    if (coachIndex !== -1) {
      return {
        userID,
        userType: UserType.COACH
      };
    }
  }

  if (user?.type === UserType.COACH && isAdminConversation) {
    // Coach viewing admin conversation
    const assignedAdminID = parsedMetadata?.assignedAdminID;

    if (assignedAdminID) {
      // Admin has been assigned
      return {
        userID: assignedAdminID,
        userType: UserType.ADMIN
      };
    } else {
      // No admin assigned yet - return a placeholder
      return {
        userID: 'unassigned',
        userType: UserType.ADMIN
      };
    }
  }

  // Regular conversation - find the other participant
  const otherIndex = participantIDs.findIndex(id => id !== user?.id);
  if (otherIndex !== -1) {
    return {
      userID: participantIDs[otherIndex],
      userType: types[otherIndex]
    };
  }

  // Fallback
  return {
    userID: participantIDs[0],
    userType: types[0]
  };
};

export function getChatContextConfig(userType: UserType): ChatContextConfig {
  switch (userType) {
    case UserType.COACH:
      return {
        userType: UserType.COACH,
        canMessageCoaches: true,
        canMessageClients: true,
        canMessageAdmin: true,
        showSupportWidget: true,
      };

    case UserType.CLIENT:
      return {
        userType: UserType.CLIENT,
        canMessageCoaches: true,
        canMessageClients: true,
        canMessageAdmin: false,
        showSupportWidget: false,
      };

    case UserType.ADMIN:
      return {
        userType: UserType.ADMIN,
        canMessageCoaches: true,
        canMessageClients: false,
        canMessageAdmin: false,
        showSupportWidget: false,
        conversationFilter: (conv: ConversationResponse) => {
          // Admins only see conversations where they are assigned
          const metadata = typeof conv.metadata === 'string'
            ? JSON.parse(conv.metadata)
            : conv.metadata;
          return !!metadata?.assignedAdminID;
        },
      };

    default:
      throw new Error('Invalid user type');
  }
}

/**
 * Determines conversation type from participant types
 */
export function getConversationType(participantTypes: string[]): ConversationType {
  const types = [...participantTypes].sort();

  if (types.includes(UserType.ADMIN)) {
    return 'coach_to_admin';
  }

  if (types.includes(UserType.COACH) && types.includes(UserType.CLIENT)) {
    return 'client_to_coach';
  }

  if (types.every(t => t === UserType.COACH)) {
    return 'coach_to_coach';
  }

  if (types.every(t => t === UserType.CLIENT)) {
    return 'client_to_client';
  }

  throw new Error('Invalid participant combination');
}

/**
 * Gets the contact type label for UI display
 */
export function getContactTypeLabel(conversationType: ConversationType, isCurrentUser = false): string {
  if (isCurrentUser) return 'You';

  switch (conversationType) {
    case 'coach_to_admin':
      return 'Support';
    case 'client_to_coach':
      return 'Coach';
    case 'coach_to_coach':
      return 'Coach';
    case 'client_to_client':
      return 'Peer';
    default:
      return 'Unknown';
  }
}

/**
 * Gets icon/badge configuration for conversation type
 */
export function getContactTypeBadge(conversationType: ConversationType): {
  color: string;
  icon: string;
} {
  switch (conversationType) {
    case 'coach_to_admin':
      return { color: 'from-fuchsia-600 to-violet-600', icon: 'headphones' };
    case 'client_to_coach':
      return { color: 'from-blue-600 to-green-600', icon: 'user' };
    case 'coach_to_coach':
      return { color: 'from-purple-600 to-blue-600', icon: 'users' };
    case 'client_to_client':
      return { color: 'from-green-600 to-teal-600', icon: 'users' };
    default:
      return { color: 'from-gray-600 to-gray-800', icon: 'message' };
  }
}

/**
 * Validates if user can initiate conversation with target
 */
export function canInitiateConversation(
  userType: UserType,
  targetType: UserType,
  config: ChatContextConfig,
): boolean {
  if (targetType === UserType.ADMIN) {
    return config.canMessageAdmin;
  }

  if (targetType === UserType.COACH) {
    return config.canMessageCoaches;
  }

  if (targetType === UserType.CLIENT) {
    return config.canMessageClients;
  }

  return false;
}

/**
 * Format presence status for display
 */
export function formatPresenceStatus(
  isOnline: boolean,
  isViewingChat: boolean,
  lastSeen?: Date | null
): { status: string; color: string; label: string } {
  if (isViewingChat) {
    return {
      status: 'online',
      color: 'bg-green-500',
      label: 'Online'
    };
  }

  if (isOnline) {
    return {
      status: 'away',
      color: 'bg-yellow-500',
      label: 'Away'
    };
  }

  return {
    status: 'offline',
    color: 'bg-gray-500',
    label: 'Offline'
  };
}

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};
