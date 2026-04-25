import Link from "next/link";
import { auth } from "@/lib/auth";
import { NavItem } from "./nav-item";
import { UserMenu } from "./user-menu";
import { UserRole } from "@prisma/client";

// Ikony — używamy SVG inline zamiast biblioteki ikon
// W większym projekcie zainstalowałbyś lucide-react lub heroicons
function DashboardIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function TicketsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

export async function Sidebar() {
  // Sidebar to Server Component — bezpośrednio czyta sesję
  const session = await auth();
  const user = session?.user;
  const role = user?.role as UserRole | undefined;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">SupportDesk</span>
        </Link>
      </div>

      {/* Nawigacja */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
          <NavItem href="/" label="Dashboard" icon={<DashboardIcon />} />
          <NavItem href="/tickets" label="Tickets" icon={<TicketsIcon />} />
        </div>

        {/* Przycisk "New Ticket" dla customerów i adminów */}
        {role && ["CUSTOMER", "ADMIN"].includes(role) && (
          <div className="mt-4">
            <Link
              href="/tickets/new"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <PlusIcon />
              New Ticket
            </Link>
          </div>
        )}

        {/* Sekcja Admin — tylko dla ADMIN */}
        {role === "ADMIN" && (
          <div className="mt-8">
            <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Administration
            </p>
            <div className="space-y-1">
              <NavItem href="/admin/users" label="Users" icon={<UsersIcon />} />
            </div>
          </div>
        )}
      </nav>

      {/* User info na dole sidebara */}
      {user && (
        <div className="border-t border-gray-200 p-4">
          <UserMenu user={user} />
        </div>
      )}
    </aside>
  );
}
