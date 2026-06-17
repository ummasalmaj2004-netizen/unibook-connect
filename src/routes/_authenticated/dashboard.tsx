import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarPlus, ClipboardList, User as UserIcon, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Student Dashboard — AIU-BOOK" }] }),
  component: Dashboard,
});

interface Stats { total: number; pending: number; approved: number; rejected: number; completed: number; }

function Dashboard() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, completed: 0 });
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user) return;
    if (role === "admin") return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setName(data?.full_name ?? ""));
    supabase.from("appointments").select("status").eq("student_user_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        const next: Stats = { total: data.length, pending: 0, approved: 0, rejected: 0, completed: 0 };
        data.forEach((a) => { next[a.status as keyof Stats]++; });
        setStats(next);
      });
  }, [user, role]);

  if (role === "admin") {
    return (
      <div className="container mx-auto px-4 py-10">
        <p>Admins should use the <Link to="/admin" className="text-primary underline">admin dashboard</Link>.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome{name ? `, ${name.split(" ")[0]}` : ""} 👋</h1>
        <p className="mt-1 text-muted-foreground">Manage your academic appointments from one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={ClipboardList} label="Total" value={stats.total} tone="primary" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} tone="warning" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} tone="success" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} tone="destructive" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} tone="primary" />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <ActionCard to="/book" icon={CalendarPlus} title="Book an appointment" text="Request time with a lecturer or advisor." />
        <ActionCard to="/track" icon={ClipboardList} title="Track appointments" text="View status and history of your requests." />
        <ActionCard to="/profile" icon={UserIcon} title="View profile" text="Update your name, student ID and department." />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: "primary" | "success" | "warning" | "destructive" }) {
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
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ActionCard({ to, icon: Icon, title, text }: { to: string; icon: any; title: string; text: string }) {
  return (
    <Link to={to} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      <Button variant="ghost" className="mt-3 px-0 text-primary group-hover:underline">Open →</Button>
    </Link>
  );
}