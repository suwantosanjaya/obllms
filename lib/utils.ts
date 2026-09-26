import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtml(html: string | undefined | null) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}
export function getLateDuration(submittedAt: Date | string, dueDate: Date | string) {
  const submitDate = new Date(submittedAt);
  const targetDate = new Date(dueDate);
  
  if (submitDate <= targetDate) return null;
  
  const diffMs = submitDate.getTime() - targetDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 60) return `${diffMins} menit`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    const remainingMins = diffMins % 60;
    return remainingMins > 0 ? `${diffHours} jam ${remainingMins} menit` : `${diffHours} jam`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;
  
  return remainingHours > 0 ? `${diffDays} hari ${remainingHours} jam` : `${diffDays} hari`;
}

export function formatDateTime(dateString: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', { 
    timeZone: 'Asia/Jakarta',
    ...options
  });
}
