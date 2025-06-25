import { Sidebar } from '@/app/(dashboard)/components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
  return (
    <div className="min-h-screen bg-[#000000] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        {children}
      </div>
    </div>
  );
}
