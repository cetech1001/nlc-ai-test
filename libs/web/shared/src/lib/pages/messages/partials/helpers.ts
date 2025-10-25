import {ConversationType, UserType} from "@nlc-ai/types";
import {ChatContextConfig} from "@nlc-ai/sdk-messages";

export function getChatContextConfig(userType: UserType): ChatContextConfig {
  switch (userType) {
    case UserType.COACH:
      return {
        userType: UserType.COACH,
        canMessageCoaches: true,  // Coach-to-coach networking
        canMessageClients: true,   // Coach-to-client direct messaging
        canMessageAdmin: true,     // Coach can contact admin support
        showSupportWidget: true,   // Show admin support widget
      };

    case UserType.CLIENT:
      return {
        userType: UserType.CLIENT,
        canMessageCoaches: true,   // Client can message their coach
        canMessageClients: true,   // Client can message peer clients (same coach)
        canMessageAdmin: false,    // Clients cannot contact admin directly
        showSupportWidget: false,  // No admin support widget for clients
      };

    case UserType.ADMIN:
      return {
        userType: UserType.ADMIN,
        canMessageCoaches: true,   // Admin responds to coaches
        canMessageClients: false,  // Admin doesn't message clients directly
        canMessageAdmin: false,    // Admin doesn't message other admins
        showSupportWidget: false,  // Admins don't need support widget
        conversationFilter: (conv) => {
          // Admins only see admin support conversations
          return conv.participantTypes.includes(UserType.ADMIN);
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
