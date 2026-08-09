"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card className="p-6 sm:p-8 border border-pebble/80 bg-card shadow-xs rounded-2xl max-w-lg">
      <form onSubmit={handleSaveName} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-name" className="text-xs font-semibold uppercase tracking-wider text-slate">Full Name</Label>
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
          <Label htmlFor="profile-email" className="text-xs font-semibold uppercase tracking-wider text-slate">Email Address</Label>
          <Input id="profile-email" value={email} readOnly disabled className="bg-sandstone/50" />
          <p className="text-xs text-slate">
            Email updates are handled via support — reach out if you need to transfer accounts.
          </p>
        </div>

        <Button
          type="submit"
          disabled={savingName || name.trim() === initialName.trim()}
          className="self-start font-medium mt-1"
        >
          {savingName && <Loader2 size={16} className="animate-spin mr-1" />}
          {savingName ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-pebble">
        {changingPassword ? (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password" className="text-xs font-semibold uppercase tracking-wider text-slate">New Password</Label>
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
              <Label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-slate">Confirm Password</Label>
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
            <div className="flex items-center gap-3 mt-1">
              <Button type="submit" disabled={savingPassword} className="font-medium">
                {savingPassword && (
                  <Loader2 size={16} className="animate-spin mr-1" />
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
            className="border-pebble text-charcoal hover:bg-sandstone font-medium"
          >
            Change password
          </Button>
        )}
      </div>
    </Card>
  );
}
