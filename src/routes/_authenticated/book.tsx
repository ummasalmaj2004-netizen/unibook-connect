import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/book")({
  head: () => ({ meta: [{ title: "Book Appointment — UniBook" }] }),
  component: BookPage,
});

const DEPARTMENTS = [
  "Computer Science", "Engineering", "Business Administration", "Mathematics",
  "Physics", "Chemistry", "Biology", "Arts & Humanities", "Law", "Medicine",
];

const schema = z.object({
  student_name: z.string().trim().min(2).max(100),
  student_id: z.string().trim().min(1).max(50),
  lecturer: z.string().trim().min(2).max(100),
  department: z.string().min(1),
  appointment_date: z.string().min(1),
  appointment_time: z.string().min(1),
  reason: z.string().trim().min(5, "Please describe the reason (min 5 chars)").max(1000),
});

function BookPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    student_name: "", student_id: "", lecturer: "", department: "",
    appointment_date: "", appointment_time: "", reason: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, student_id, department").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setForm((f) => ({
          ...f,
          student_name: data.full_name || f.student_name,
          student_id: data.student_id || f.student_id,
          department: data.department || f.department,
        }));
      });
  }, [user]);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("appointments").insert({ ...parsed.data, student_user_id: user.id });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Appointment request submitted!");
    navigate({ to: "/track" });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Book an appointment</h1>
      <p className="mt-1 text-muted-foreground">Fill in your appointment details. You'll be notified once it's reviewed.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Student Name">
            <Input value={form.student_name} onChange={(e) => update("student_name", e.target.value)} required maxLength={100} />
          </Field>
          <Field label="Student ID">
            <Input value={form.student_id} onChange={(e) => update("student_id", e.target.value)} required maxLength={50} />
          </Field>
          <Field label="Lecturer / Advisor">
            <Input value={form.lecturer} onChange={(e) => update("lecturer", e.target.value)} required maxLength={100} placeholder="e.g. Dr. Jane Smith" />
          </Field>
          <Field label="Department">
            <Select value={form.department} onValueChange={(v) => update("department", v)}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Appointment Date">
            <Input type="date" min={today} value={form.appointment_date} onChange={(e) => update("appointment_date", e.target.value)} required />
          </Field>
          <Field label="Appointment Time">
            <Input type="time" value={form.appointment_time} onChange={(e) => update("appointment_time", e.target.value)} required />
          </Field>
        </div>
        <Field label="Reason for appointment">
          <Textarea value={form.reason} onChange={(e) => update("reason", e.target.value)} required maxLength={1000} rows={5} placeholder="Briefly describe what you'd like to discuss..." />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/dashboard" })}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit request"}</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}