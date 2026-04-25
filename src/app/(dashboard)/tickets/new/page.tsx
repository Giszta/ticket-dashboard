import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/server/db/client";
import { CreateTicketForm } from "@/features/tickets/create-ticket-form";
import { UserRole } from "@prisma/client";

export const metadata = {
  title: "New Ticket",
};

export default async function NewTicketPage() {
  const session = await requireAuth();
  const userRole = session.user.role as UserRole;

  // Tylko Customer i Admin mogą tworzyć tickety
  if (userRole === "AGENT") {
    redirect("/tickets");
  }

  // Pobieramy kategorie dla formularza
  const categories = await db.category.findMany({
    select: { id: true, name: true, color: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Submit a Support Request</h2>
          <p className="mt-1 text-sm text-gray-500">
            Describe your issue and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <CreateTicketForm categories={categories} />
        </div>

        {/* Tips */}
        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <h3 className="text-sm font-medium text-blue-900">Tips for faster resolution</h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            <li>• Include error messages and screenshots if applicable</li>
            <li>• Describe steps to reproduce the issue</li>
            <li>• Mention what you expected vs what happened</li>
            <li>• Include your browser and OS if relevant</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
