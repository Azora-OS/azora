/**
 * Utility for merging Tailwind CSS classes
 * Based on clsx and tailwind-merge
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
