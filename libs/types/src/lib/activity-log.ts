export interface ActivityLog {
  id: string;
  userID: string;
  userType: string;
  action: string;
  entityType?: string | null;
  entityID?: string | null;
  metadata?: any | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}
