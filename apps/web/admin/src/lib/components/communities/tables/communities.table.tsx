import {Cog, Eye, TrendingUp, Users} from "lucide-react";

const colWidth = 100 / 8;

export const communityColumns = [
  {
    key: 'name',
    header: 'Name',
    width: `${colWidth * (4 / 3)}%`,
    sortable: true,
  },
  {
    key: 'type',
    header: 'Type',
    width: `${colWidth}%`,
    render: (value: string) => (
      <span className="px-2.5 py-0.5 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full text-sm font-medium">
        {value.replace('_', ' ')}
      </span>
    ),
  },
  {
    key: 'memberCount',
    header: 'Members',
    width: `${colWidth * (2 / 3)}%`,
    sortable: true,
  },
  {
    key: 'postCount',
    header: 'Posts',
    width: `${colWidth * (2 / 3)}%`,
    sortable: true,
  },
  {
    key: 'ownerName',
    header: 'Owner',
    width: `${colWidth * (2 / 3)}%`,
  },
  {
    key: 'createdAt',
    header: 'Created',
    width: `${colWidth * (2 / 3)}%`,
    sortable: true,
  },
  {
    key: 'isActive',
    header: 'Status',
    width: `${colWidth * (2 / 3)}%`,
    render: (value: boolean) => (
      <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${
        value
          ? 'bg-green-600/20 text-green-400 border border-green-600/30'
          : 'bg-red-600/20 text-red-400 border border-red-600/30'
      }`}>
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    width: `auto`,
    render: (_: string, community: any, onRowAction?: (action: string, row: any) => void) => {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onRowAction?.('view-details', community)}
            className="px-3 py-1 rounded text-sm bg-fuchsia-600/20 text-fuchsia-400 hover:bg-fuchsia-600/30"
          >
            <Eye/>
          </button>
          <button
            onClick={() => onRowAction?.('moderate', community)}
            className="px-3 py-1 rounded text-sm bg-fuchsia-600/20 text-fuchsia-400 hover:bg-fuchsia-600/30"
          >
            Moderate
          </button>
          <button
            onClick={() => onRowAction?.('analytics', community)}
            className="px-3 py-1 rounded text-sm bg-fuchsia-600/20 text-fuchsia-400 hover:bg-fuchsia-600/30"
          >
            <TrendingUp/>
          </button>
          <button
            onClick={() => onRowAction?.('members', community)}
            className="px-3 py-1 rounded text-sm bg-fuchsia-600/20 text-fuchsia-400 hover:bg-fuchsia-600/30"
          >
            <Users/>
          </button>
          <button
            onClick={() => onRowAction?.('settings', community)}
            className="px-3 py-1 rounded text-sm bg-fuchsia-600/20 text-fuchsia-400 hover:bg-fuchsia-600/30"
          >
            <Cog/>
          </button>
        </div>
      )
    },
  }
];
