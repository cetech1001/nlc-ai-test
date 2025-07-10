export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  requiresVerification?: boolean;
  email?: string;
}
