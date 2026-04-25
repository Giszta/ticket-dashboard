"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export function NavItem({ href, label, icon, badge }: NavItemProps) {
  const pathname = usePathname();

  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={cn(
          "shrink-0 transition-colors",
          isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600",
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-medium text-blue-700">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
