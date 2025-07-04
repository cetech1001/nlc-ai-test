'use client'

import { StatCard } from "@/app/(dashboard)/home/components/stat-card";
import {DataTable, TableAction} from "@/app/(dashboard)/components/data-table";
import { useRouter } from "next/navigation";
import {coachColumns, coachesData} from "@/app/data";
import {RevenueGraph} from "@/app/(dashboard)/home/components/revenue-graph";
import {useEffect, useState} from "react";
import {HomePageSkeleton} from "@/app/(dashboard)/home/components/home-page.skeleton";


export default function AdminDashboard() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleRowAction = (action: string, coach: any) => {
    if (action === 'payment') {
      router.push('/coaches/make-payment');
    } else if (action === 'view') {
      console.log('Viewing coach:', coach.name);
    }
  };

  const actions: TableAction[] = [
    {
      label: 'Make Payment',
      action: 'payment',
      variant: 'primary',
    }
  ];

  if (isLoading) {
    return <HomePageSkeleton/>;
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
        <div className="flex-1 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="absolute w-64 h-64 -left-12 top-52 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <div className="absolute w-64 h-64 right-40 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <RevenueGraph/>
        </div>

        <div className="w-full xl:w-1/3 grid grid-cols-2 gap-4 lg:gap-6">
          <StatCard title="Total Coaches" value="565" />
          <StatCard title="All Time Revenue" value="$718,240" />
          <StatCard title="Inactive Coaches" value="20" />
          <StatCard title="Monthly Revenue" value="$50,880" />
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-stone-50 text-xl sm:text-2xl font-semibold leading-relaxed">
            Recently Joined Coaches
          </h2>
          <button
            onClick={() => router.push('/coaches')}
            className="text-fuchsia-400 text-sm font-bold hover:text-fuchsia-300 transition-colors self-start sm:self-auto"
          >
            View All
          </button>
        </div>

        <DataTable
          columns={coachColumns}
          data={coachesData}
          onRowAction={handleRowAction}
          actions={actions}
          showMobileCards={true}
          emptyMessage="No coaches found"
        />
      </div>
    </div>
  );
}
