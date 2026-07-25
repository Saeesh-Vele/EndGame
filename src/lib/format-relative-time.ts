export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.round((Date.now() - then) / 1000);

  if (diffSec < 60) return "just now";

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;

  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? "hour" : "hours"} ago`;

  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ${diffDay === 1 ? "day" : "days"} ago`;

  const diffMonth = Math.round(diffDay / 30);
  return `${diffMonth} ${diffMonth === 1 ? "month" : "months"} ago`;
}
