"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketAction } from "@/server/actions/ticket.actions";
import { createTicketSchema, type CreateTicketInput } from "@/lib/validations/ticket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TicketPriority } from "@prisma/client";

interface CreateTicketFormProps {
  categories: { id: string; name: string; color: string }[];
}

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export function CreateTicketForm({ categories }: CreateTicketFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      categoryId: "",
    },
  });

  const description = useWatch({ control, name: "description" });
  const descriptionLength = description?.length ?? 0;

  async function onSubmit(data: CreateTicketInput) {
    setServerError(null);

    // Konwertujemy dane formularza do FormData
    // (Server Actions przyjmują FormData lub plain objects)
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("priority", data.priority);
    if (data.categoryId) formData.append("categoryId", data.categoryId);

    startTransition(async () => {
      const result = await createTicketAction(formData);

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      // Sukces — redirect na nowy ticket
      router.push(`/tickets/${result.data.id}`);
    });
  }

  const isLoading = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Title */}
      <Input
        label="Subject"
        placeholder="Brief description of the issue"
        error={errors.title?.message}
        required
        {...register("title")}
      />

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Description
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          placeholder="Please describe the issue in detail. Include any error messages, steps to reproduce, and what you expected to happen."
          rows={6}
          className={`w-full resize-none rounded-md border bg-white px-3 py-2 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:ring-2 focus:outline-none ${
            errors.description
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
          }`}
          aria-describedby={errors.description ? "description-error" : "description-hint"}
          aria-invalid={errors.description ? "true" : undefined}
          {...register("description")}
        />
        <div className="flex items-start justify-between">
          {errors.description ? (
            <p id="description-error" className="text-xs text-red-600" role="alert">
              {errors.description.message}
            </p>
          ) : (
            <p id="description-hint" className="text-xs text-gray-500">
              Minimum 20 characters. The more detail, the faster we can help.
            </p>
          )}
          <span
            className={`text-xs ${descriptionLength > 4800 ? "text-red-500" : "text-gray-400"}`}
          >
            {descriptionLength}/5000
          </span>
        </div>
      </div>

      {/* Priority + Category — side by side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Priority */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Priority
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          </label>
          <select
            className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:ring-2 focus:outline-none ${
              errors.priority
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
            aria-invalid={errors.priority ? "true" : undefined}
            {...register("priority")}
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.priority && (
            <p className="text-xs text-red-600" role="alert">
              {errors.priority.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            {...register("categoryId")}
          >
            <option value="">Select category (optional)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          <strong>Error:</strong> {serverError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Submit ticket
        </Button>
      </div>
    </form>
  );
}
