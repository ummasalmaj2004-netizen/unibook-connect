import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, Search, ShieldAlert, Users, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import type { Database } from "@/integrations/supabase/types";

type Appt = Database["public"]["Tables"]["appointments"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Status = Database["public"]["Enums"]["appointment_status"];

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — AIU-BOOK" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { role, loading } = useAuth();
  const [appts, setAppts] = useState<Appt[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const [a, s] = await Promise.all([
      supabase.from("appointments").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setAppts(a.data ?? []);
    setStudents(s.data ?? []);
  };

  useEffect(() => { if (role === "admin") refresh(); }, [role]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return appts;
    return appts.filter((a) =>
      a.student_name.toLowerCase().includes(q) ||
      a.student_id.toLowerCase().includes(q) ||
      a.lecturer.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
    );
  }, [appts, query]);

  const stats = useMemo(() => ({
    total: appts.length,
    pending: appts.filter((a) => a.status === "pending").length,
    approved: appts.filter((a) => a.status === "approved").length,
    rejected: appts.filter((a) => a.status === "rejected").length,
  }), [appts]);

  const setStatus = async (id: string, status: Status) => {
    setBusy(true);
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success(`Marked as ${status}`); refresh(); }
  };

  if (loading) return <div className="container mx-auto p-10 text-muted-foreground">Loading...</div>;

  if (role !== "admin") {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Admin access required</h1>
        <p className="mt-2 text-muted-foreground">
          You don't have permission to view this page. Contact your system administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin dashboard</h1>
        <p className="mt-1 text-muted-foreground">Review, approve, and manage all student appointments.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Total requests" value={stats.total} />
        <Stat icon={Clock} label="Pending" value={stats.pending} tone="warning" />
        <Stat icon={CheckCircle2} label="Approved" value={stats.approved} tone="success" />
        <Stat icon={XCircle} label="Rejected" value={stats.rejected} tone="destructive" />
      </div>

      <Tabs defaultValue="appointments" className="mt-10">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="mt-6 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name, student ID, lecturer, department..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Lecturer</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Date & time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No appointments found.</td></tr>
                  ) : filtered.map((a) => (
                    <tr key={a.id} className="border-t border-border align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium">{a.student_name}</div>
                        <div className="text-xs text-muted-foreground">{a.student_id}</div>
                      </td>
                      <td className="px-4 py-3">{a.lecturer}</td>
                      <td className="px-4 py-3">{a.department}</td>
                      <td className="px-4 py-3">
                        <div>{a.appointment_date}</div>
                        <div className="text-xs text-muted-foreground">{a.appointment_time.slice(0,5)}</div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          {a.status === "pending" && (
                            <>
                              <Button size="sm" disabled={busy} onClick={() => setStatus(a.id, "approved")}>Approve</Button>
                              <Button size="sm" variant="destructive" disabled={busy} onClick={() => setStatus(a.id, "rejected")}>Reject</Button>
                            </>
                          )}
                          {a.status === "approved" && (
                            <Button size="sm" variant="outline" disabled={busy} onClick={() => setStatus(a.id, "completed")}>Mark completed</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No students yet.</td></tr>
                  ) : students.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{s.full_name || "—"}</td>
                      <td className="px-4 py-3">{s.student_id || "—"}</td>
                      <td className="px-4 py-3">{s.department || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.email || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone = "primary" }: { icon: any; label: string; value: number; tone?: "primary" | "success" | "warning" | "destructive" }) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneMap[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}