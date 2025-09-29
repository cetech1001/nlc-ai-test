export interface ExtendedInvoice {
  customer: {
    id: string;
    type: string;
    name: string;
    email: string;
  };
  subscription?: {
    plan?: { name: string; };
    community?: { name: string; };
    course?: { title: string; };
  } | null;
}
