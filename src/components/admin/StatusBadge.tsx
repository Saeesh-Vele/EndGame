import { Badge } from "@/components/ui/badge";
import { BookingRequest } from "@/types";

const STATUS_STYLES: Record<BookingRequest["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_LABELS: Record<BookingRequest["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

export default function StatusBadge({
  status,
}: {
  status: BookingRequest["status"];
}) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
