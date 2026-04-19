import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Łączy klasy CSS z obsługą warunkowego dodawania i mergowania klas Tailwind.
 * Użycie: cn("base-class", isActive && "active-class", "text-red-500 text-blue-500")
 * Tailwind merge zadba o to, że wygra ostatnia klasa (text-blue-500).
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
