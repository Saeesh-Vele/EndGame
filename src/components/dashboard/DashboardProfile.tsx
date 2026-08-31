"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { describeAuthError, describeDbError } from "@/lib/errors";

const MIN_PASSWORD = 8;

/** Message under a single input. Renders nothing when the field is fine. */
function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-xs font-medium text-destructive"
    >
      <AlertCircle size={13} className="mt-px shrink-0" />
      <span>{message}</span>
    </p>
  );
}

export default function DashboardProfile({
  email,
  initialName,
}: {
  email: string;
  initialName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveName = async (event: React.FormEvent) => {
    event.preventDefault();
    if (savingName) return;

    const trimmed = name.trim();

    if (!trimmed) {
      setNameError("Your name can't be empty.");
      return;
    }

    if (trimmed.length > 120) {
      setNameError("That name is longer than we can store — 120 characters max.");
      return;
    }

    setNameError(null);
    setSavingName(true);

    try {
      const supabase = createClient();

      // Two writes on purpose. user_metadata is what the client reads without a
      // query (navbar initial, booking form prefill); profiles.full_name is what
      // server components read. The migration grants UPDATE on that column only,
      // so this can't be used to set is_admin.
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: trimmed },
      });

      if (authError) {
        toast.error(
          describeAuthError(authError, {
            scope: "dashboard:name",
            fallback: "Couldn't save your name just now. Try again in a moment.",
          })
        );
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

        // The auth copy saved but the profiles row didn't, so server-rendered
        // screens would still show the old name. Say so rather than claiming
        // a clean save.
        if (profileError) {
          toast.error(
            describeDbError(profileError, {
              scope: "dashboard:profile",
              byCode: {
                "22001":
                  "That name is longer than we can store — shorten it and save again.",
              },
              fallback:
                "Your name was updated for sign-in, but we couldn't save it to your profile. Try saving again.",
            })
          );
          setSavingName(false);
          return;
        }
      }

      toast.success("Name updated");
      setSavingName(false);
      router.refresh();
    } catch (thrown) {
      toast.error(
        describeAuthError(thrown, {
          scope: "dashboard:name",
          fallback: "Couldn't save your name just now. Try again in a moment.",
        })
      );
      setSavingName(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (savingPassword) return;

    if (password.length < MIN_PASSWORD) {
      setPasswordError(`Passwords need at least ${MIN_PASSWORD} characters.`);
      return;
    }

    if (password !== confirm) {
      setConfirmError("Those two passwords don't match.");
      return;
    }

    setPasswordError(null);
    setConfirmError(null);
    setSavingPassword(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        const message = describeAuthError(error, {
          scope: "dashboard:password",
          fallback: "Couldn't change your password just now. Try again in a moment.",
        });

        // "too weak" and "same as your current one" are about the field the
        // user is looking at — put them there, not in a toast that vanishes.
        if (error.code === "weak_password" || error.code === "same_password") {
          setPasswordError(message);
        } else if (error.code === "session_not_found") {
          toast.error("Your session expired. Sign in again to change your password.");
        } else {
          toast.error(message);
        }

        setSavingPassword(false);
        return;
      }

      toast.success("Password changed");
      setPassword("");
      setConfirm("");
      setChangingPassword(false);
      setSavingPassword(false);
    } catch (thrown) {
      toast.error(
        describeAuthError(thrown, {
          scope: "dashboard:password",
          fallback: "Couldn't change your password just now. Try again in a moment.",
        })
      );
      setSavingPassword(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8 border border-pebble/80 bg-card shadow-xs rounded-2xl max-w-lg">
      <form onSubmit={handleSaveName} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-name" className="text-xs font-semibold uppercase tracking-wider text-slate">Full Name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(null);
            }}
            placeholder="Your name"
            autoComplete="name"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "profile-name-error" : undefined}
            disabled={savingName}
          />
          <FieldError id="profile-name-error" message={nameError} />
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
                aria-invalid={Boolean(passwordError)}
                aria-describedby={
                  passwordError ? "new-password-error" : undefined
                }
                required
                disabled={savingPassword}
              />
              <FieldError id="new-password-error" message={passwordError} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-slate">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setConfirmError(null);
                }}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
                aria-invalid={Boolean(confirmError)}
                aria-describedby={
                  confirmError ? "confirm-password-error" : undefined
                }
                required
                disabled={savingPassword}
              />
              <FieldError id="confirm-password-error" message={confirmError} />
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
                  setPasswordError(null);
                  setConfirmError(null);
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
