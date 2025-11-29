import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDoctorName(name: string | undefined | null): string {
  if (!name) return '';
  if (name.toLowerCase().startsWith('dr.') || name.toLowerCase().startsWith('dr ')) {
    return name;
  }
  return `Dr. ${name}`;
}
