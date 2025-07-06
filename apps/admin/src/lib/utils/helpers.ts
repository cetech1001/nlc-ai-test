export const convertFilterValuesToAPIFormat = (filterValues: Record<string, any>) => {
  const apiFilters: Record<string, any> = {};

  // Handle status
  if (filterValues.status && filterValues.status !== '') {
    apiFilters.status = filterValues.status;
  }

  // Handle subscription plans (array to comma-separated string)
  if (filterValues.subscriptionPlan && Array.isArray(filterValues.subscriptionPlan) && filterValues.subscriptionPlan.length > 0) {
    apiFilters.subscriptionPlan = filterValues.subscriptionPlan.join(',');
  }

  // Handle date ranges
  if (filterValues.dateJoined) {
    if (filterValues.dateJoined.start) {
      apiFilters.dateJoinedStart = filterValues.dateJoined.start;
    }
    if (filterValues.dateJoined.end) {
      apiFilters.dateJoinedEnd = filterValues.dateJoined.end;
    }
  }

  if (filterValues.lastActive) {
    if (filterValues.lastActive.start) {
      apiFilters.lastActiveStart = filterValues.lastActive.start;
    }
    if (filterValues.lastActive.end) {
      apiFilters.lastActiveEnd = filterValues.lastActive.end;
    }
  }

  // Handle boolean filters
  if (filterValues.isVerified && filterValues.isVerified !== '') {
    apiFilters.isVerified = filterValues.isVerified === 'true';
  }

  return apiFilters;
};
