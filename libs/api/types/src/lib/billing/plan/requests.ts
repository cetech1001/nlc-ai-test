export interface CreatePlanRequest {
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  color?: string;
  maxClients?: number;
  maxAiAgents?: number;
  features?: Record<string, any>;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  monthlyPrice?: number;
  annualPrice?: number;
  color?: string;
  maxClients?: number;
  maxAiAgents?: number;
  features?: Record<string, any>;
  isActive?: boolean;
}

export interface PlanFilters {
  includeInactive?: boolean;
  includeDeleted?: boolean;
  name?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
}
