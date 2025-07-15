export interface ProfileFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
  photo?: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PasswordFormData {
  newPassword: string;
  confirmPassword: string;
}
