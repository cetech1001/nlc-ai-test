export interface ChatbotCustomization {
  id: string;
  coachID: string;
  name: string;
  avatarUrl?: string;
  logoUrl?: string;

  // Color customization
  primaryColor: string;
  gradientStart: string;
  gradientEnd: string;

  // Text colors
  assistantTextColor: string;
  assistantBubbleColor: string;
  userTextColor: string;
  userBubbleColor: string;

  // Background
  backgroundColor: string;
  glowColor: string;

  // Other settings
  position: 'bottom-right' | 'bottom-left';
  greeting?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface ChatbotCustomizationFormData {
  name: string;
  avatarUrl?: string;
  logoUrl?: string;
  primaryColor: string;
  gradientStart: string;
  gradientEnd: string;
  assistantTextColor: string;
  assistantBubbleColor: string;
  userTextColor: string;
  userBubbleColor: string;
  backgroundColor: string;
  glowColor: string;
  position: 'bottom-right' | 'bottom-left';
  greeting?: string;
}

export interface ChatbotCustomizationErrors {
  name?: string;
  avatarUrl?: string;
  logoUrl?: string;
  greeting?: string;
}
