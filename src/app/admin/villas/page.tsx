"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import VillasTable from "@/components/admin/villas/VillasTable";

export default function AdminVillasPage() {
  const { villas, destinations } = useAdminData();
  const [search, setSearch] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("all");

  const filtered = useMemo(() => {
    return villas.filter((villa) => {
      if (destinationFilter !== "all" && villa.destination !== destinationFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          villa.name.toLowerCase().includes(q) ||
          villa.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [villas, search, destinationFilter]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">Villas</h1>
          <p className="mt-1 text-sm text-slate">
            Manage every villa listed on StayVilla.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/villas/new">
            <Plus size={16} />
            Add villa
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or location"
            className="pl-9"
          />
        </div>

        <Select value={destinationFilter} onValueChange={setDestinationFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All destinations</SelectItem>
            {destinations.map((d) => (
              <SelectItem key={d.id} value={d.name}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mt-4 text-sm text-slate">
        {filtered.length} {filtered.length === 1 ? "villa" : "villas"}
      </p>

      <div className="mt-3">
        <VillasTable villas={filtered} />
      </div>
    </div>
  );
}
