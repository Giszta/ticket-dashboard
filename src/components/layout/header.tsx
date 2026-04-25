import { auth } from "@/lib/auth";

interface HeaderProps {
  title?: string;
}

export async function Header({ title }: HeaderProps) {
  const session = await auth();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>{title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}</div>

      <div className="flex items-center gap-3">
        {/* Można tu dodać powiadomienia, global search itp. */}
        <span className="text-sm text-gray-500">{session?.user?.email}</span>
      </div>
    </header>
  );
}
