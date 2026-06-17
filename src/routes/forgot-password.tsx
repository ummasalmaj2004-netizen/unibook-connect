import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — AIU-BOOK" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { setSent(true); toast.success("Check your email for reset instructions."); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary/40 via-background to-accent/30 px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 font-bold">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg">AIU-BOOK</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <h1 className="text-xl font-semibold">Forgot your password?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email and we'll send you a reset link.
          </p>
          {sent ? (
            <p className="mt-6 rounded-md bg-success/10 p-4 text-sm text-foreground">
              Reset email sent. Check your inbox.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}
          <Link to="/auth" className="mt-4 block text-center text-sm text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}