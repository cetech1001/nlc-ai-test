import {PaymentMethod} from "@prisma/client";

export interface PaymentMethodWithDetails extends PaymentMethod{
  coach: {
    firstName: string;
    lastName: string;
    email: string;
  };
}
