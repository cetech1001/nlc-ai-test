import { Skeleton } from "@nlc-ai/ui";

interface DataTableSkeletonProps {
  columns: number
  rows?: number
  showMobileCards?: boolean
}

export const DataTableSkeleton = ({
  columns,
  rows = 5,
  showMobileCards = true
}: DataTableSkeletonProps) => {
  const getGridTemplate = () => {
    return Array(columns).fill('1fr').join(' ')
  }

  return (
    <>
      {showMobileCards && (
        <div className="block sm:hidden">
          <div className="space-y-4">
            {Array.from({ length: rows }).map((_, index) => (
              <div
                key={index}
                className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16 ml-3" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`${showMobileCards ? 'hidden sm:block' : ''}`}>
        <div className="overflow-x-auto">
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: Math.min(columns, 7) }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-56 h-56 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]"
                  style={{
                    left: `${-46 + i * 290}px`,
                    top: i === 0 ? '-80px' : '-40px',
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="h-16 rounded-tl-[30px] rounded-tr-[30px] flex items-center bg-[#7B21BA] px-6">
                <div
                  className="w-full grid gap-4"
                  style={{ gridTemplateColumns: getGridTemplate() }}
                >
                  {Array.from({ length: columns }).map((_, index) => (
                    <Skeleton key={index} className="h-4 bg-white/20" />
                  ))}
                </div>
              </div>

              <div className="divide-y divide-neutral-700">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <div key={rowIndex} className="h-16 flex items-center px-6">
                    <div
                      className="w-full grid gap-4 items-center"
                      style={{ gridTemplateColumns: getGridTemplate() }}
                    >
                      {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                          key={colIndex}
                          className="h-4"
                          style={{
                            width: colIndex === columns - 1 ? '60%' : '80%'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
