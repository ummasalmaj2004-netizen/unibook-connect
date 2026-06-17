import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEPARTMENTS = [
  "Computer Science", "Engineering", "Business Administration", "Mathematics",
  "Physics", "Chemistry", "Biology", "Arts & Humanities", "Law", "Medicine",
];

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — AIU-BOOK" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, role } = useAuth();
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setFullName(data.full_name ?? "");
        setStudentId(data.student_id ?? "");
        setDepartment(data.department ?? "");
      }
    });
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName.trim(), student_id: studentId.trim(), department,
    }).eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
      <p className="mt-1 text-muted-foreground">Update your personal information.</p>

      <form onSubmit={onSave} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Input value={role ?? ""} disabled className="capitalize" />
        </div>
        <div className="space-y-2">
          <Label>Full name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} required />
        </div>
        <div className="space-y-2">
          <Label>Student ID</Label>
          <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} maxLength={50} />
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save changes"}</Button>
        </div>
      </form>
    </div>
  );
}