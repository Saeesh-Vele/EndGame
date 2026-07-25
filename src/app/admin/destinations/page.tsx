"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import DestinationDialog from "@/components/admin/destinations/DestinationDialog";

export default function AdminDestinationsPage() {
  const { destinations, deleteDestination } = useAdminData();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">Destinations</h1>
          <p className="mt-1 text-sm text-slate">
            Manage the destinations villas are grouped under.
          </p>
        </div>
        <DestinationDialog />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {destinations.map((destination) => (
          <div
            key={destination.id}
            className="rounded-2xl border border-pebble bg-white overflow-hidden"
          >
            <div className="relative aspect-[16/10]">
              <Image
                src={destination.image}
                alt={destination.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-charcoal truncate">
                    {destination.name}
                  </p>
                  <p className="text-xs text-slate truncate">
                    /{destination.slug}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <DestinationDialog destination={destination} />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${destination.name}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete {destination.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Villas in this destination won&apos;t be deleted,
                          but they&apos;ll lose their destination grouping.
                          This can&apos;t be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => {
                            deleteDestination(destination.id);
                            toast.success(`${destination.name} deleted`);
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate">
                {destination.villa_count} villas
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
