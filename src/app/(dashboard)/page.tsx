import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/helpers";
import { dashboardService } from "@/server/services/dashboard.service";
import { StatsCards } from "@/features/dashboard/stats-cards";
import { PriorityBreakdown } from "@/features/dashboard/priority-breakdown";
import { RecentTickets } from "@/features/dashboard/recent-tickets";
import { StatsCardSkeleton } from "@/components/ui/skeleton";
import { UserRole } from "@prisma/client";

export const metadata = {
  title: "Dashboard",
};

// Osobny komponent async — pozwala Suspense na streaming
async function DashboardContent() {
  const session = await requireAuth();

  const { stats, recentTickets } = await dashboardService.getDashboardData({
    userId: session.user.id,
    userRole: session.user.role as UserRole,
  });

  return (
    <>
      <StatsCards stats={stats} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent tickets — zajmuje 2/3 szerokości na dużych ekranach */}
        <div className="lg:col-span-2">
          <RecentTickets tickets={recentTickets} />
        </div>

        {/* Priority breakdown — zajmuje 1/3 */}
        <div>
          <PriorityBreakdown stats={stats} />
        </div>
      </div>
    </>
  );
}

// Skeleton dla całego dashboardu — pokazywany podczas ładowania
function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    </>
  );
}

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back,{" "}
          <span className="font-medium text-gray-700">
            {session.user.name ?? session.user.email}
          </span>
        </p>
      </div>

      {/* Suspense boundary — pokazuje skeleton podczas ładowania danych */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
