import { Avatar } from "@/components/ui/avatar";
import { ChangeRoleSelect } from "./change-role-select";
import { formatRelativeTime } from "@/lib/utils/formatters";
import type { UserWithStats } from "@/server/repositories/user.repository";

interface UsersTableProps {
  users: UserWithStats[];
  currentUserId: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  if (users.length === 0) {
    return <div className="py-16 text-center text-sm text-gray-500">No users found.</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["User", "Role", "Tickets Created", "Tickets Assigned", "Joined"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {users.map((user) => (
            <tr key={user.id} className="transition-colors hover:bg-gray-50">
              {/* User */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} email={user.email} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {user.name ?? <span className="text-gray-400 italic">No name</span>}
                    </p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </td>

              {/* Role */}
              <td className="px-4 py-3">
                <ChangeRoleSelect
                  userId={user.id}
                  currentRole={user.role}
                  isCurrentUser={user.id === currentUserId}
                />
              </td>

              {/* Tickets Created */}
              <td className="px-4 py-3">
                <span className="text-sm text-gray-700">{user._count.createdTickets}</span>
              </td>

              {/* Tickets Assigned */}
              <td className="px-4 py-3">
                <span className="text-sm text-gray-700">
                  {user._count.assignedTickets > 0 ? (
                    user._count.assignedTickets
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </span>
              </td>

              {/* Joined */}
              <td className="px-4 py-3">
                <span className="text-sm text-gray-500">{formatRelativeTime(user.createdAt)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
