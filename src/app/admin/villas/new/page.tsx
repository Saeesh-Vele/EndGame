import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import VillaForm from "@/components/admin/villas/VillaForm";

export default function NewVillaPage() {
  return (
    <div>
      <Link
        href="/admin/villas"
        className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-slate hover:text-charcoal transition-colors duration-200"
      >
        <ArrowLeft size={15} />
        Back to villas
      </Link>

      <h1 className="mt-3 text-2xl font-medium text-charcoal">Add villa</h1>
      <p className="mt-1 text-sm text-slate">
        Create a new villa listing for StayVilla.
      </p>

      <div className="mt-6">
        <VillaForm />
      </div>
    </div>
  );
}
