import {Dispatch, FC, SetStateAction, useMemo} from "react";
import { DataTable, tableRenderers } from "@nlc-ai/shared";
import {TableColumn, DataTableCoach, CoachWithStatus} from "@nlc-ai/types";
import {coachesAPI} from "@nlc-ai/api-client";

interface IProps {
  coaches: CoachWithStatus[];
  handleRouteClick: (coachID: string) => void;
  handleActionSuccess: (message: string) => void;
  setError: Dispatch<SetStateAction<string>>;
  areInactiveCoaches?: boolean;
}

const transformCoachData = (coaches: CoachWithStatus[]): DataTableCoach[] => {
  return coaches.map(coach => ({
    id: `#${coach.id.slice(-4)}`,
    name: `${coach.firstName} ${coach.lastName}`,
    email: coach.email,
    dateJoined: new Date(coach.createdAt || '').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    plan: coach.currentPlan || 'No Plan',
    status: coach.status.charAt(0).toUpperCase() + coach.status.slice(1),
    rawStatus: coach.status,
    originalId: coach.id,
  }));
};

const colWidth = 100 / 7;

export const CoachesTable: FC<IProps> = (props) => {
  const transformedCoaches = transformCoachData(props.coaches);

  const coachColumns: TableColumn<any>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Name',
      width: `${colWidth}%`,
      render: (value: string) => tableRenderers.truncateText(value, 18)
    },
    {
      key: 'email',
      header: 'Email',
      width: `${colWidth * (4 / 3)}%`,
      render: (value: string) => tableRenderers.truncateText(value, 20)
    },
    {
      key: 'dateJoined',
      header: 'Date Joined',
      width: `${colWidth}%`,
      render: tableRenderers.dateText
    },
    {
      key: 'plan',
      header: 'Plan',
      width: `${colWidth * (2 / 3)}%`,
      render: tableRenderers.basicText
    },
    {
      key: 'status',
      header: 'Status',
      width: `${colWidth * (2 / 3)}%`,
      render: tableRenderers.status,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: `auto`,
      render: tableRenderers.coachActions(props.areInactiveCoaches),
    }
  ], [props.areInactiveCoaches]);

  const handleRowAction = async (action: string, coach: DataTableCoach) => {
    if (action === 'make-payment' || action === 'send-mail') {
      props.handleRouteClick(coach.originalId);
    } else if (action === 'toggle-status') {
      await handleToggleStatus(coach.originalId);
    } else if (action === 'delete') {
      await handleDeleteCoach(coach.originalId);
    } else if (action === 'restore') {
      await handleRestoreCoach(coach.originalId);
    }
  };

  const handleRestoreCoach = async (coachID: string) => {
    if (!confirm("Are you sure you want to restore this coach?")) {
      return;
    }

    try {
      await coachesAPI.restoreCoach(coachID);
      props.handleActionSuccess("Coach restored successfully!");
    } catch (error: any) {
      props.setError(error.message || "Failed to restore coach");
    }
  };

  const handleToggleStatus = async (coachID: string) => {
    try {
      await coachesAPI.toggleCoachStatus(coachID);
      props.handleActionSuccess("Coach status updated successfully!");
    } catch (error: any) {
      props.setError(error.message || "Failed to update coach status");
    }
  };

  const handleDeleteCoach = async (coachID: string) => {
    if (!confirm("Are you sure you want to deactivate this coach?")) {
      return;
    }

    try {
      await coachesAPI.deleteCoach(coachID);
      props.handleActionSuccess("Coach deactivated successfully!");
    } catch (error: any) {
      props.setError(error.message || "Failed to deactivate coach");
    }
  };

  return (
    <DataTable
      columns={coachColumns}
      data={transformedCoaches}
      onRowAction={handleRowAction}
      emptyMessage="No coaches found matching your criteria"
    />
  );
}
