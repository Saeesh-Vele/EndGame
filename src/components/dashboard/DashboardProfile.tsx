"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD = 8;

export default function DashboardProfile({
  email,
  initialName,
}: {
  email: string;
  initialName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveName = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || savingName) return;

    setSavingName(true);
    const supabase = createClient();

    // Two writes on purpose. user_metadata is what the client reads without a
    // query (navbar initial, booking form prefill); profiles.full_name is what
    // server components read. The migration grants UPDATE on that column only,
    // so this can't be used to set is_admin.
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: trimmed },
    });

    if (authError) {
      toast.error(authError.message);
      setSavingName(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: trimmed })
        .eq("id", user.id);

      if (profileError) {
        toast.error(profileError.message);
        setSavingName(false);
        return;
      }
    }

    toast.success("Name updated");
    setSavingName(false);
    router.refresh();
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (savingPassword) return;

    if (password.length < MIN_PASSWORD) {
      toast.error(`Passwords need at least ${MIN_PASSWORD} characters.`);
      return;
    }

    if (password !== confirm) {
      toast.error("Those two passwords don't match.");
      return;
    }

    setSavingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
      setSavingPassword(false);
      return;
    }

    toast.success("Password changed");
    setPassword("");
    setConfirm("");
    setChangingPassword(false);
    setSavingPassword(false);
  };

  return (
    <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-sm max-w-lg">
      <form onSubmit={handleSaveName} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            disabled={savingName}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={email} readOnly disabled />
          <p className="text-xs text-slate">
            Email changes aren&apos;t self-serve yet — write to us and
            we&apos;ll move it.
          </p>
        </div>

        <Button
          type="submit"
          disabled={savingName || name.trim() === initialName.trim()}
          className="self-start"
        >
          {savingName && <Loader2 size={16} className="animate-spin" />}
          {savingName ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <div className="mt-7 pt-6 border-t border-pebble">
        {changingPassword ? (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
                required
                disabled={savingPassword}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
                required
                disabled={savingPassword}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={savingPassword}>
                {savingPassword && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {savingPassword ? "Updating…" : "Update password"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={savingPassword}
                onClick={() => {
                  setChangingPassword(false);
                  setPassword("");
                  setConfirm("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setChangingPassword(true)}
          >
            Change password
          </Button>
        )}
      </div>
    </div>
  );
}
