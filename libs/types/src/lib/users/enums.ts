export const UserType = {
  ADMIN: 'admin',
  COACH: 'coach',
  CLIENT: 'client'
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType]
