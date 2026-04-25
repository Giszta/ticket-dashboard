import { Sidebar } from "@/components/layout/sidebar";
import { requireAuth } from "@/lib/auth/helpers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Druga linia obrony po middleware
  // Jeśli ktoś jakoś ominął middleware, tu go zatrzymamy
  await requireAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — stały, po lewej */}
      <Sidebar />

      {/* Główna treść — scroll tylko tutaj */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
