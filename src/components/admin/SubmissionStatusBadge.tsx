import { Badge } from "@/components/ui/badge";
import { VillaSubmissionStatus } from "@/types";

const STATUS_STYLES: Record<VillaSubmissionStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  reviewed: "bg-sky-50 text-sky-700 border-sky-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<VillaSubmissionStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  approved: "Approved",
  rejected: "Rejected",
};

export default function SubmissionStatusBadge({
  status,
}: {
  status: VillaSubmissionStatus;
}) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
