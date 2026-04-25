"use client";

import { useState, useTransition, useRef } from "react";
import { addCommentAction } from "@/server/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";

interface AddCommentFormProps {
  ticketId: string;
  userRole: UserRole;
}

export function AddCommentForm({ ticketId, userRole }: AddCommentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"PUBLIC" | "INTERNAL">("PUBLIC");
  const formRef = useRef<HTMLFormElement>(null);

  const canAddInternal = userRole === "AGENT" || userRole === "ADMIN";

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.append("visibility", visibility);

    startTransition(async () => {
      const result = await addCommentAction(ticketId, formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Reset formularza po sukcesie
      formRef.current?.reset();
      setVisibility("PUBLIC");
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      {/* Visibility toggle — tylko dla agentów i adminów */}
      {canAddInternal && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVisibility("PUBLIC")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              visibility === "PUBLIC"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            Public reply
          </button>
          <button
            type="button"
            onClick={() => setVisibility("INTERNAL")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              visibility === "INTERNAL"
                ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Internal note
          </button>
        </div>
      )}

      {/* Textarea */}
      <div>
        <textarea
          name="body"
          placeholder={
            visibility === "INTERNAL"
              ? "Add an internal note (not visible to customers)..."
              : "Write a reply..."
          }
          rows={4}
          required
          disabled={isPending}
          className={cn(
            "w-full resize-none rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400",
            "transition-colors focus:ring-2 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-60",
            visibility === "INTERNAL"
              ? "border-amber-200 bg-amber-50 focus:border-amber-400 focus:ring-amber-400/20"
              : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500/20",
          )}
          aria-label={visibility === "INTERNAL" ? "Internal note" : "Public reply"}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          isLoading={isPending}
          variant={visibility === "INTERNAL" ? "secondary" : "primary"}
          className={cn(
            visibility === "INTERNAL" &&
              "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
          )}
        >
          {visibility === "INTERNAL" ? "Add internal note" : "Send reply"}
        </Button>
      </div>
    </form>
  );
}
