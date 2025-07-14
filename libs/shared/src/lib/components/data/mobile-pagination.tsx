import {PaginationMeta} from "@nlc-ai/types";
import {FC, useMemo} from "react";

interface IProps {
  pagination: PaginationMeta;
}

export const MobilePagination: FC<IProps> = ({ pagination }) => {
  const itemsShowing = useMemo(() => {
    if (pagination.totalPages === pagination.page) {
      return pagination.total;
    }
    return pagination.limit * pagination.page;
  }, [pagination]);
  return (
    <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-lg border border-neutral-700 p-4 sm:hidden">
      <div className="flex items-center justify-between text-sm">
              <span className="text-stone-300">
                Showing {itemsShowing} of {pagination.total} coaches
              </span>
        <div className="flex gap-4 text-stone-400">
          <span>Page {pagination.page} of {pagination.totalPages}</span>
        </div>
      </div>
    </div>
  );
}
