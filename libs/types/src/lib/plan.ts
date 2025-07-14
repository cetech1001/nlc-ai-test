import {Transaction} from "./transaction";
import {Subscription} from "./subscription";
import {PaymentLink} from "./payment";

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  monthlyPrice: number;
  annualPrice: number;
  maxClients?: number | null;
  maxAiAgents?: number | null;
  features?: any | null;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptions?: Subscription[];
  transactions?: Transaction[];
  paymentLinks?: PaymentLink[];
}
