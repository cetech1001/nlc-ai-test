export interface CreatePlanRequest {
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  color?: string;
  maxClients?: number;
  maxAiAgents?: number;
  features?: Record<string, any>;
  isActive?: boolean;
  accessibleAiAgents?: string[];
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
  accessibleAiAgents?: string[];
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
