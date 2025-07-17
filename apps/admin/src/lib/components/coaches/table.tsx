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
  isLoading?: boolean;
  emptyMessage?: string;
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
    originalID: coach.id,
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
      render: (_: string, coach: any, onRowAction?: (action: string, row: any) => void) => {
        return (
          <div className="flex gap-2">
            {coach.rawStatus !== 'deleted' && (
              <>
                <button
                  onClick={() => onRowAction?.('toggle-status', coach)}
                  className={`px-3 py-1 rounded text-sm ${
                    coach.rawStatus === 'blocked'
                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                      : 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                  }`}
                >
                  {coach.rawStatus === 'blocked' ? 'Unblock' : 'Block'}
                </button>
                <button
                  onClick={() => onRowAction?.('delete', coach)}
                  className="px-3 py-1 rounded text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30"
                >
                  Delete
                </button>
              </>
            )}
            {coach.rawStatus === 'deleted' && (
              <button
                onClick={() => onRowAction?.('restore', coach)}
                className="px-3 py-1 rounded text-sm bg-green-600/20 text-green-400 hover:bg-green-600/30"
              >
                Restore
              </button>
            )}
            <button
              onClick={() => onRowAction?.(props.areInactiveCoaches ? 'send-mail' : 'make-payment', coach)}
              className="text-fuchsia-400 text-sm font-normal underline leading-relaxed hover:text-fuchsia-300 transition-colors whitespace-nowrap"
              disabled={coach.rawStatus === 'deleted'}
            >
              {props.areInactiveCoaches ? 'Send Mail' : 'Make Payment'}
            </button>
          </div>
        )
      },
    }
  ], [props.areInactiveCoaches]);

  const handleRowAction = async (action: string, coach: DataTableCoach) => {
    if (action === 'make-payment' || action === 'send-mail') {
      props.handleRouteClick(coach.originalID);
    } else if (action === 'toggle-status') {
      await handleToggleStatus(coach.originalID);
    } else if (action === 'delete') {
      await handleDeleteCoach(coach.originalID);
    } else if (action === 'restore') {
      await handleRestoreCoach(coach.originalID);
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
      showMobileCards={true}
      emptyMessage={props.emptyMessage || "No coaches found matching your criteria"}
      isLoading={props.isLoading}
    />
  );
}
