export type UserRole = "CUSTOMER" | "AGENT" | "ADMIN";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type CommentVisibility = "PUBLIC" | "INTERNAL";

export type PaginatedResponse<T> = {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };
