"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import VillaForm from "./VillaForm";

export default function EditVillaClient({ id }: { id: string }) {
  const { villas } = useAdminData();
  const villa = villas.find((v) => v.id === id);

  return (
    <div>
      <Link
        href="/admin/villas"
        className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-slate hover:text-charcoal transition-colors duration-200"
      >
        <ArrowLeft size={15} />
        Back to villas
      </Link>

      {villa ? (
        <>
          <h1 className="mt-3 text-2xl font-medium text-charcoal">
            Edit {villa.name}
          </h1>
          <p className="mt-1 text-sm text-slate">
            Update this villa&apos;s details.
          </p>
          <div className="mt-6">
            <VillaForm villa={villa} />
          </div>
        </>
      ) : (
        <p className="mt-6 text-sm text-slate">Villa not found.</p>
      )}
    </div>
  );
}
