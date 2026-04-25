import Link from "next/link";
import { requireRole } from "@/lib/auth/helpers";
import { userRepository } from "@/server/repositories/user.repository";
import { UsersTable } from "@/features/users/users-table";
import { UserRole } from "@prisma/client";

export const metadata = {
  title: "User Management",
};

interface AdminUsersPageProps {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const session = await requireRole("ADMIN");

  // ← await searchParams przed użyciem
  const { search, role, page: pageParam } = await searchParams;

  const validRoles = Object.values(UserRole) as string[];
  const roleFilter =
    role && validRoles.includes(role) ? (role as UserRole) : undefined;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const { users, totalCount } = await userRepository.findMany({
    search: search?.trim() || undefined,
    role: roleFilter,
    page,
    pageSize: 20,
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="mt-1 text-sm text-gray-500">
          {totalCount} {totalCount === 1 ? "user" : "users"} in the system
        </p>
      </div>

      {/* Filtry — jako zwykły form, bez onChange (Server Component) */}
      <form className="mb-4 flex flex-wrap items-center gap-3">
        <select
          name="role"
          defaultValue={roleFilter ?? ""}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          {Object.values(UserRole).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search by name or email..."
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Filter
        </button>

        {(roleFilter || search) && (
          <Link
            href="/admin/users"
            className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
          >
            Clear
          </Link>
        )}
      </form>

      <UsersTable users={users} currentUserId={session.user.id} />
    </div>
  );
}