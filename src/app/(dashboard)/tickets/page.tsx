import { Suspense } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/helpers";
import { ticketRepository } from "@/server/repositories/ticket.repository";
import { TicketsTable } from "@/features/tickets/tickets-table";
import { TicketsFilters } from "@/features/tickets/tickets-filters";
import { TicketsSearch } from "@/features/tickets/tickets-search";
import { TicketsPagination } from "@/features/tickets/tickets-pagination";
import { Button } from "@/components/ui/button";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { TicketStatus, TicketPriority, UserRole } from "@prisma/client";

export const metadata = {
  title: "Tickets",
};

interface TicketsPageSearchParams {
  page?: string;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

function parseSearchParams(params: TicketsPageSearchParams) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 20;

  const validStatuses = Object.values(TicketStatus) as string[];
  const validPriorities = Object.values(TicketPriority) as string[];
  const validSortBy = ["createdAt", "updatedAt", "priority", "status"] as const;
  const validSortOrder = ["asc", "desc"] as const;

  const status =
    params.status && validStatuses.includes(params.status)
      ? (params.status as TicketStatus)
      : undefined;

  const priority =
    params.priority && validPriorities.includes(params.priority)
      ? (params.priority as TicketPriority)
      : undefined;

  const sortBy = validSortBy.includes(params.sortBy as (typeof validSortBy)[number])
    ? (params.sortBy as (typeof validSortBy)[number])
    : "createdAt";

  const sortOrder = validSortOrder.includes(params.sortOrder as (typeof validSortOrder)[number])
    ? (params.sortOrder as (typeof validSortOrder)[number])
    : "desc";

  const search = params.search?.trim() || undefined;

  return { page, pageSize, status, priority, sortBy, sortOrder, search };
}

async function TicketsContent({
  searchParams,
  userId,
  userRole,
}: {
  searchParams: TicketsPageSearchParams;
  userId: string;
  userRole: UserRole;
}) {
  const params = parseSearchParams(searchParams);
  const createdById = userRole === "CUSTOMER" ? userId : undefined;

  const result = await ticketRepository.findMany({
    ...params,
    createdById,
  });

  return (
    <div className="space-y-4">
      <TicketsTable tickets={result.tickets} />
      {result.totalCount > 0 && (
        <TicketsPagination
          currentPage={result.currentPage}
          totalPages={result.totalPages}
          totalCount={result.totalCount}
          pageSize={result.pageSize}
        />
      )}
    </div>
  );
}

function TicketsSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Ticket", "Status", "Priority", "Assigned To", "Category", "Created"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-400 uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRowSkeleton key={i} cols={6} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TicketsPageProps {
  // Next.js 15+ — searchParams jest Promisem
  searchParams: Promise<TicketsPageSearchParams>;
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const session = await requireAuth();
  const userRole = session.user.role as UserRole;

  // ← KLUCZOWA ZMIANA: await searchParams przed użyciem
  const resolvedSearchParams = await searchParams;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tickets</h2>
          <p className="mt-1 text-sm text-gray-500">
            {userRole === "CUSTOMER" ? "Your support requests" : "All support tickets"}
          </p>
        </div>

        {(userRole === "CUSTOMER" || userRole === "ADMIN") && (
          <Link href="/tickets/new">
            <Button>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Ticket
            </Button>
          </Link>
        )}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Suspense fallback={<div className="h-9 w-72 animate-pulse rounded-lg bg-gray-200" />}>
          <TicketsSearch />
        </Suspense>

        <Suspense fallback={<div className="h-9 w-64 animate-pulse rounded-lg bg-gray-200" />}>
          <TicketsFilters />
        </Suspense>
      </div>

      {/* Tabela — key na resolvedSearchParams żeby skeleton się resetował */}
      <Suspense fallback={<TicketsSkeleton />} key={JSON.stringify(resolvedSearchParams)}>
        <TicketsContent
          searchParams={resolvedSearchParams}
          userId={session.user.id}
          userRole={userRole}
        />
      </Suspense>
    </div>
  );
}
