"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SubmissionsTable from "@/components/admin/submissions/SubmissionsTable";
import { VillaSubmission, VillaSubmissionStatus } from "@/types";

const STATUS_OPTIONS: {
  value: VillaSubmissionStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

/**
 * Status filtering for the submissions screen. Rows come from the server
 * component in src/app/admin/submissions/page.tsx.
 */
export default function SubmissionsPageClient({
  submissions,
}: {
  submissions: VillaSubmission[];
}) {
  const [statusFilter, setStatusFilter] = useState<
    VillaSubmissionStatus | "all"
  >("all");

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? submissions
        : submissions.filter((s) => s.status === statusFilter),
    [submissions, statusFilter]
  );

  return (
    <>
      <div className="mt-6">
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as VillaSubmissionStatus | "all")
          }
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mt-4 text-sm text-slate">
        {filtered.length} {filtered.length === 1 ? "submission" : "submissions"}
      </p>

      <div className="mt-3">
        <SubmissionsTable submissions={filtered} />
      </div>
    </>
  );
}
