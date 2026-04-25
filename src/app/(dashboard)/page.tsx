import { requireAuth } from "@/lib/auth/helpers";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-gray-500">
          Welcome back, {session.user.name ?? session.user.email}
        </p>
      </div>

      {/* Placeholder — zastąpimy statystykami */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-gray-400">Dashboard stats coming soon...</p>
      </div>
    </div>
  );
}
