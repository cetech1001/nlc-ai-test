export interface CreateClient {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  source?: string;
  tags?: string[];
  coachID?: string;
}

export interface UpdateClient {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  source?: string;
  tags?: string[];
}

export interface ClientQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  coursesBought?: string;
  dateJoinedStart?: string;
  dateJoinedEnd?: string;
  lastInteractionStart?: string;
  lastInteractionEnd?: string;
  coachID?: string;
}
