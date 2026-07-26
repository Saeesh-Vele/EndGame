"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { deleteDestination } from "@/app/admin/actions";
import { Destination } from "@/types";

export default function DeleteDestinationButton({
  destination,
  villaCount,
}: {
  destination: Destination;
  villaCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // The Server Action re-counts before deleting — this only decides what the
  // dialog says, so a stale count can't cause an orphaning delete.
  const hasVillas = villaCount > 0;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteDestination(destination.id);
      if (result.success) {
        toast.success(`${destination.name} deleted`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Couldn't delete the destination.");
      }
    });
  };

  return (
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
          <AlertDialogTitle>Delete {destination.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasVillas
              ? `${villaCount} ${
                  villaCount === 1 ? "villa is" : "villas are"
                } still listed under ${destination.name}. Move or delete ${
                  villaCount === 1 ? "it" : "them"
                } before deleting this destination.`
              : "This destination has no villas. Deleting it can't be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {!hasVillas && (
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
