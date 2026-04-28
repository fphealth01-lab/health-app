import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind class names with conflict resolution.
 * Combines `clsx` (conditional class composition) with `tailwind-merge`
 * (de-duplicates conflicting Tailwind utilities, last-one-wins).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
