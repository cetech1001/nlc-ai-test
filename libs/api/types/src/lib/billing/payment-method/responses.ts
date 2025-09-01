import {PaymentMethod} from "@prisma/client";

export interface ExtendedPaymentMethod extends PaymentMethod{
  coach?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  client?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}
