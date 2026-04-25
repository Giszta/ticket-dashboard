import { Avatar } from "@/components/ui/avatar";
import { TicketStatus, TicketPriority } from "@prisma/client";

interface TicketMetaProps {
  ticket: {
    status: TicketStatus;
    priority: TicketPriority;
    assignedTo: { id: string; name: string | null; email: string } | null;
    category: { id: string; name: string; color: string } | null;
    createdBy: { id: string; name: string | null; email: string };
    createdAt: Date;
    updatedAt: Date;
  };
  // Przekażemy tu akcje w następnym branchu
  actions?: React.ReactNode;
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-semibold tracking-wider text-gray-400 uppercase">{label}</dt>
      <dd className="text-sm text-gray-900">{children}</dd>
    </div>
  );
}

export function TicketMeta({ ticket, actions }: TicketMetaProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Actions slot — wypełnimy w następnym branchu */}
      {actions && <div className="border-b border-gray-100 p-4">{actions}</div>}

      {/* Meta fields */}
      <dl className="divide-y divide-gray-50 p-4">
        <div className="py-3">
          <MetaRow label="Assigned To">
            {ticket.assignedTo ? (
              <div className="mt-1 flex items-center gap-2">
                <Avatar name={ticket.assignedTo.name} email={ticket.assignedTo.email} size="sm" />
                <span>{ticket.assignedTo.name ?? ticket.assignedTo.email}</span>
              </div>
            ) : (
              <span className="mt-1 block text-gray-400 italic">Unassigned</span>
            )}
          </MetaRow>
        </div>

        <div className="py-3">
          <MetaRow label="Reported By">
            <div className="mt-1 flex items-center gap-2">
              <Avatar name={ticket.createdBy.name} email={ticket.createdBy.email} size="sm" />
              <span>{ticket.createdBy.name ?? ticket.createdBy.email}</span>
            </div>
          </MetaRow>
        </div>

        <div className="py-3">
          <MetaRow label="Category">
            {ticket.category ? (
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: ticket.category.color }}
                  aria-hidden="true"
                />
                <span>{ticket.category.name}</span>
              </div>
            ) : (
              <span className="mt-1 block text-gray-400 italic">Uncategorized</span>
            )}
          </MetaRow>
        </div>

        <div className="py-3">
          <MetaRow label="Last Updated">
            <span className="mt-1 block text-gray-600">
              {new Date(ticket.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </MetaRow>
        </div>
      </dl>
    </div>
  );
}
