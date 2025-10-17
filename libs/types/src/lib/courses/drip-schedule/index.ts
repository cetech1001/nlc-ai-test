export enum DripInterval {
  CUSTOM = 'custom',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface UpdateDripSchedule {
  isDripEnabled: boolean;
  dripInterval?: DripInterval;
  dripCount?: number;
  initialDelay?: number;
  releaseDate?: string;
  autoUnlockChapters?: boolean;
  completionThreshold?: number;
}
