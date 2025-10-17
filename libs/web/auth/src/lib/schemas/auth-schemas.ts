import { z } from 'zod';
import {UserType} from "@nlc-ai/types";

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const firstNameSchema = z
  .string()
  .min(1, 'First name is required')
  .min(2, 'First name must be at least 2 characters')
  .max(50, 'First name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces');

const lastNameSchema = z
  .string()
  .min(1, 'Last name is required')
  .min(2, 'Last name must be at least 2 characters')
  .max(50, 'Last name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces');

const inviteTokenSchema = z
  .string();

const verificationCodeSchema = z
  .string()
  .min(1, 'Verification code is required')
  .length(6, 'Verification code must be 6 digits')
  .regex(/^\d{6}$/, 'Verification code must contain only numbers');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const registerTypeSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  inviteToken: inviteTokenSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
})

export const registerSchema = (userType: UserType) => z
  .object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    inviteToken: inviteTokenSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => {
    return userType === UserType.CLIENT && !data.inviteToken;
  }, {
    message: 'Invite token is required',
    path: ['inviteToken'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const accountVerificationSchema = z.object({
  verificationCode: verificationCodeSchema,
});


export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerTypeSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type AccountVerificationFormData = z.infer<typeof accountVerificationSchema>;
