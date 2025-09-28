import {FC, useState} from "react";
import {DataTable, tableRenderers} from "@nlc-ai/web-shared";
import {ExtendedClient} from "@nlc-ai/sdk-users";
import { Skeleton } from "@nlc-ai/web-ui";

type ClientData = Pick<ExtendedClient, 'id' | 'firstName' | 'lastName' | 'email' | 'lastInteractionAt'>;

interface IProps {
  title: string;
  data: ClientData[];
  isLoading: boolean;
  dateColumn: 'lastInteractionAt' | 'respondedOn';
}

const transformData = (data: ClientData[]) => {
  return data.map(client => ({
    ...client,
    name: `${client.firstName} ${client.lastName}`,
    lastInteractionAt: new Date(client.lastInteractionAt || '').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
  }));
}

export const RetentionStatsTableContainer: FC<IProps> = ({ title, data, dateColumn, isLoading }) => {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const columns = [
    {
      key: 'name',
      header: "Client's Name",
      width: '30%',
      render: tableRenderers.basicText
    },
    {
      key: 'email',
      header: 'Email',
      width: '40%',
      render: tableRenderers.basicText
    },
    {
      key: 'lastInteractionAt',
      header: dateColumn === 'lastInteractionAt' ? 'Last Activity' : 'Responded On',
      width: '30%',
      render: tableRenderers.dateText
    }
  ];

  return (
    <div className="space-y-4 mt-3">
      {isLoading && (
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
          <Skeleton className="h-6 sm:h-8 lg:h-10 w-full" />
          <Skeleton className="h-6 sm:h-8 lg:h-10 w-full" />
        </div>
      )}
      {!isLoading && <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-center justify-between">
        <h2 className="text-stone-50 text-xl font-semibold">{title}</h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={dateRange.from}
                placeholder={""}
                onChange={(e) => setDateRange(prev => ({...prev, from: e.target.value}))}
                className="bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-2 rounded-lg text-sm focus:border-purple-500 outline-none"
              />
              <span className="absolute left-3 top-2 text-stone-400 text-xs pointer-events-none">From</span>
            </div>
            <div className="relative">
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({...prev, to: e.target.value}))}
                className="bg-neutral-800 border border-neutral-600 text-stone-300 px-3 py-2 rounded-lg text-sm focus:border-purple-500 outline-none"
              />
              <span className="absolute left-3 top-2 text-stone-400 text-xs pointer-events-none">To</span>
            </div>
          </div>
        </div>
      </div>}

      <DataTable
        columns={columns}
        data={transformData(data)}
        emptyMessage="No data found"
        showMobileCards={true}
        isLoading={isLoading}
        className="min-h-[400px]"
      />
    </div>
  );
};
