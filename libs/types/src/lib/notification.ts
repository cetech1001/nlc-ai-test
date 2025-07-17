import {Admin} from "./admin";
import {Coach} from "./coach";

export interface Notification {
  id: string;
  coachID?: string | null;
  adminID?: string | null;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  isRead?: boolean | null;
  readAt?: Date | null;
  priority?: string | null;
  metadata?: any;
  createdAt?: Date | null;
  admin?: Admin;
  coach?: Coach;
}
