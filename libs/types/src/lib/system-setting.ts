import {Admin} from "./admin";

export interface SystemSetting {
  id: string;
  category: string;
  key: string;
  value: any;
  description?: string | null;
  isPublic?: boolean | null;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  admin: Admin;
}
