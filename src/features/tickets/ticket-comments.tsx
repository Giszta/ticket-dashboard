import { cn } from "@/lib/utils";
import { formatDate, formatRelativeTime } from "@/lib/utils/formatters";
import { Avatar } from "@/components/ui/avatar";
import { CommentVisibility, UserRole } from "@prisma/client";

type Comment = {
  id: string;
  body: string;
  visibility: CommentVisibility;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
  };
};

interface TicketCommentsProps {
  comments: Comment[];
  currentUserRole: UserRole;
  // Slot na formularz dodawania komentarza — dodamy w następnym branchu
  addCommentForm?: React.ReactNode;
}

export function TicketComments({ comments, currentUserRole, addCommentForm }: TicketCommentsProps) {
  // Customer nie widzi komentarzy INTERNAL
  const visibleComments = comments.filter((comment) => {
    if (currentUserRole === "CUSTOMER") {
      return comment.visibility === "PUBLIC";
    }
    return true; // Agent i Admin widzą wszystko
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Comments
          {visibleComments.length > 0 && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {visibleComments.length}
            </span>
          )}
        </h2>
      </div>

      {visibleComments.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <svg
            className="mx-auto h-8 w-8 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No comments yet</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {visibleComments.map((comment) => {
            const isInternal = comment.visibility === "INTERNAL";

            return (
              <li
                key={comment.id}
                className={cn(
                  "px-6 py-5",
                  // Komentarze wewnętrzne mają inne tło — wizualnie odróżnione
                  isInternal && "bg-amber-50",
                )}
              >
                {/* Internal badge */}
                {isInternal && (
                  <div className="mb-3 flex items-center gap-1.5">
                    <svg
                      className="h-3.5 w-3.5 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="text-xs font-semibold tracking-wide text-amber-700 uppercase">
                      Internal Note
                    </span>
                  </div>
                )}

                {/* Author + time */}
                <div className="flex items-start gap-3">
                  <Avatar name={comment.author.name} email={comment.author.email} size="md" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {comment.author.name ?? comment.author.email}
                      </span>
                      <span className="text-xs text-gray-400">
                        {comment.author.role === "AGENT"
                          ? "Support Agent"
                          : comment.author.role === "ADMIN"
                            ? "Admin"
                            : "Customer"}
                      </span>
                      <time
                        dateTime={new Date(comment.createdAt).toISOString()}
                        className="text-xs text-gray-400"
                        title={formatDate(comment.createdAt)}
                      >
                        {formatRelativeTime(comment.createdAt)}
                      </time>
                    </div>

                    {/* Comment body — zachowujemy białe znaki i nowe linie */}
                    <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                      {comment.body}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Slot na formularz dodawania komentarza */}
      {addCommentForm && <div className="border-t border-gray-100 px-6 py-5">{addCommentForm}</div>}
    </div>
  );
}
