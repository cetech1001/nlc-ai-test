import {Notification} from "./notification";
import {SystemSetting} from "./system-setting";

export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: string | null;
  isActive?: boolean | null;
  lastLoginAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  notifications?: Notification[];
  systemSettings?: SystemSetting[];
}
