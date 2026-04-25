import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TicketNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Ticket not found</h2>
        <p className="mt-2 text-sm text-gray-500">
          This ticket doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <div className="mt-6">
          <Link href="/tickets">
            <Button variant="secondary">← Back to tickets</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
