export interface ExtendedPaymentMethod{
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
