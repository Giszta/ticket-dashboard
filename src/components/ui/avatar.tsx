import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

// Deterministyczny kolor na podstawie imienia — ten sam user zawsze ma ten sam kolor
function getAvatarColor(name?: string | null, email?: string | null): string {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700",
    "bg-yellow-100 text-yellow-700",
    "bg-red-100 text-red-700",
    "bg-indigo-100 text-indigo-700",
    "bg-pink-100 text-pink-700",
    "bg-teal-100 text-teal-700",
  ];
  const str = name ?? email ?? "";
  const index = str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

export function Avatar({ name, email, size = "md", className }: AvatarProps) {
  const initials = getInitials(name, email);
  const colorClass = getAvatarColor(name, email);

  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-full font-medium",
        sizeClasses[size],
        colorClass,
        className,
      )}
      aria-label={name ?? email ?? "User"}
      title={name ?? email ?? "Unknown user"}
    >
      {initials}
    </div>
  );
}
