import {RecentCoach} from "@nlc-ai/sdk-analytics";
import {FC, useMemo} from "react";
import {TableColumn} from "@nlc-ai/types";
import {DataTable, tableRenderers } from "@nlc-ai/web-shared";

interface IProps {
  coaches: RecentCoach[];
  handleRouteClick: (coachID: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

const colWidth = 100 / 7;

export const RecentCoachesTable: FC<IProps> = (props) => {
  const coachColumns: TableColumn<any>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Name',
      width: `${colWidth}%`,
      render: (_: string, row: RecentCoach) => tableRenderers.truncateText(`${row.firstName} ${row.lastName}`, 18)
    },
    {
      key: 'email',
      header: 'Email',
      width: `${colWidth * (4 / 3)}%`,
    },
    {
      key: 'createdAt',
      header: 'Date Joined',
      width: `${colWidth}%`,
      render: tableRenderers.dateText
    },
    {
      key: 'subscriptionStatus',
      header: 'Subscription Status',
      width: `${colWidth * (4 / 3)}%`,
      render: tableRenderers.basicText
    },
    {
      key: 'totalClients',
      header: 'Total Clients',
      width: `${colWidth * (2 / 3)}%`,
    },
    {
      key: 'totalRevenue',
      header: 'Total Revenue',
      width: `${colWidth * (2 / 3)}%`,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: `auto`,
      render: (_: string, coach: any, onRowAction?: (action: string, row: any) => void) => {
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onRowAction?.('view-details', coach)}
              className="text-fuchsia-400 text-sm font-normal underline leading-relaxed hover:text-fuchsia-300 transition-colors whitespace-nowrap"
              disabled={coach.rawStatus === 'deleted'}
            >
              View Details
            </button>
          </div>
        )
      },
    }
  ], []);

  const handleRowAction = async (action: string, coach: RecentCoach) => {
    if (action === 'view-details') {
      props.handleRouteClick(coach.id);
    }
  };

  return (
    <DataTable
      columns={coachColumns}
      data={props.coaches}
      onRowAction={handleRowAction}
      showMobileCards={true}
      emptyMessage={props.emptyMessage || "No coaches found matching your criteria"}
      isLoading={props.isLoading}
    />
  );
}
