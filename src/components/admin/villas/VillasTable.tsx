"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { Villa } from "@/types";
import { toast } from "sonner";

function SortButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
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

export default function VillasTable({ villas }: { villas: Villa[] }) {
  const { deleteVilla } = useAdminData();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Villa>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortButton
          label="Villa"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-14 shrink-0 rounded-lg overflow-hidden bg-sandstone">
            <Image
              src={row.original.images[0]}
              alt={row.original.name}
              fill
              sizes="56px"
              className="object-cover"
              unoptimized={row.original.images[0]?.startsWith("blob:")}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-charcoal truncate">
              {row.original.name}
            </p>
            <p className="text-xs text-slate truncate">
              {row.original.location}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "destination",
      header: "Destination",
      cell: ({ row }) => (
        <span className="text-sm text-charcoal">
          {row.original.destination}
        </span>
      ),
    },
    {
      accessorKey: "price_per_night",
      header: ({ column }) => (
        <SortButton
          label="Price / night"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-charcoal">
          ₹{row.original.price_per_night.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <SortButton
          label="Rating"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-sm text-charcoal">
          <Star size={13} className="fill-driftwood text-driftwood" />
          {row.original.rating.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.is_active
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-500 border-slate-200"
          }
        >
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`/admin/villas/${row.original.id}/edit`}
              aria-label={`Edit ${row.original.name}`}
            >
              <Pencil size={15} />
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${row.original.name}`}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 size={15} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {row.original.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the villa from the listing. This action
                  can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    deleteVilla(row.original.id);
                    toast.success(`${row.original.name} deleted`);
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table's returned functions are stable by its own contract, not React Compiler's
  const table = useReactTable({
    data: villas,
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
                No villas match your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
