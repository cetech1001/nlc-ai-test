import {Dispatch, FC, SetStateAction, useMemo} from "react";
import { DataTable, tableRenderers } from "@nlc-ai/web-shared";
import {TableColumn} from "@nlc-ai/types";
import {coachesAPI} from "@nlc-ai/web-api-client";
import {ExtendedCoach, DataTableCoach} from "@nlc-ai/sdk-users";
import {Edit, Eye, Send, Trash} from "lucide-react";
import {Button} from "@nlc-ai/web-ui";

interface IProps {
  coaches: ExtendedCoach[];
  handleViewDetails: (coachID: string) => void;
  handleEditClick: (coachID: string) => void;
  handleActionSuccess: (message: string) => void;
  setError: Dispatch<SetStateAction<string>>;
  areInactiveCoaches?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

const transformCoachData = (coaches: ExtendedCoach[]): DataTableCoach[] => {
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
                  className="px-3 py-1 rounded text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                >
                  <Trash className="w-3 h-3" />
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
              onClick={() => onRowAction?.('edit', coach)}
              className="px-3 py-1 rounded text-sm bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors"
            >
              <Edit className="w-3 h-3" />
            </button>
            {props.areInactiveCoaches ? (
              <button
                onClick={() => props.handleViewDetails(coach.originalID)}
                className="px-3 py-1 rounded text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                title="Send Marketing Email"
              >
                <Send className="w-3 h-3" />
              </button>
            ) : (
              <Button
                onClick={() => props.handleViewDetails(coach.originalID)}
                variant="outline"
                className="text-fuchsia-400 border-fuchsia-400/30 hover:bg-fuchsia-400/10"
              >
                <Eye className="w-3 h-3" />
              </Button>
            )}
            {/*<button
              onClick={() => onRowAction?.(props.areInactiveCoaches ? 'send-mail' : 'make-payment', coach)}
              className="text-fuchsia-400 text-sm font-normal underline leading-relaxed hover:text-fuchsia-300 transition-colors whitespace-nowrap"
              disabled={coach.rawStatus === 'deleted'}
            >
              {props.areInactiveCoaches ? 'Send Mail' : 'View Details'}
            </button>*/}
          </div>
        )
      },
    }
  ], [props.areInactiveCoaches]);

  const handleRowAction = async (action: string, coach: DataTableCoach) => {
    if (action === 'make-payment' || action === 'send-mail') {
      props.handleViewDetails(coach.originalID);
    } else if (action === 'toggle-status') {
      await handleToggleStatus(coach.originalID);
    } else if (action === 'delete') {
      await handleDeleteCoach(coach.originalID);
    } else if (action === 'restore') {
      await handleRestoreCoach(coach.originalID);
    } else if (action === 'edit') {
      props.handleEditClick(coach.originalID);
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
