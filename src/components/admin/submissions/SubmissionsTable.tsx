"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SubmissionStatusBadge from "@/components/admin/SubmissionStatusBadge";
import { VillaSubmission } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SortButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="-ml-2.5 gap-1.5 px-2.5 font-medium text-charcoal hover:bg-sandstone"
    >
      {label}
      <ArrowUpDown size={14} className="text-slate" />
    </Button>
  );
}

export default function SubmissionsTable({
  submissions,
}: {
  submissions: VillaSubmission[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<VillaSubmission>[] = [
    {
      accessorKey: "villa_name",
      header: ({ column }) => (
        <SortButton
          label="Property"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-sm text-charcoal truncate">
            {row.original.villa_name}
          </p>
          <p className="text-xs text-slate truncate">{row.original.location}</p>
        </div>
      ),
    },
    {
      accessorKey: "owner_name",
      header: "Owner",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-sm text-charcoal truncate">
            {row.original.owner_name}
          </p>
          <p className="text-xs text-slate truncate">
            {row.original.owner_email}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "destination",
      header: "Destination",
      cell: ({ row }) => (
        <span className="text-sm text-charcoal">
          {row.original.destination ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "price_per_night",
      header: ({ column }) => (
        <SortButton
          label="Asking"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) =>
        row.original.price_per_night != null ? (
          <span className="text-sm text-charcoal whitespace-nowrap">
            ₹{row.original.price_per_night.toLocaleString("en-IN")}
          </span>
        ) : (
          <span className="text-sm text-slate">—</span>
        ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <SortButton
          label="Received"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-charcoal whitespace-nowrap">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <SubmissionStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" asChild>
          <Link
            href={`/admin/submissions/${row.original.id}`}
            aria-label={`View submission for ${row.original.villa_name}`}
          >
            <Eye size={15} />
          </Link>
        </Button>
      ),
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table's returned functions are stable by its own contract, not React Compiler's
  const table = useReactTable({
    data: submissions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-2xl border border-pebble bg-white overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-4 h-11">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-sm text-slate"
              >
                No submissions match this filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
