import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { Database } from "@/integrations/supabase/types";

type Appt = Database["public"]["Tables"]["appointments"]["Row"];

export const Route = createFileRoute("/_authenticated/track")({
  head: () => ({ meta: [{ title: "Track Appointments — AIU-BOOK" }] }),
  component: TrackPage,
});

function TrackPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("appointments").select("*").eq("student_user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track appointments</h1>
          <p className="mt-1 text-muted-foreground">All your appointment requests and their current status.</p>
        </div>
        <Link to="/book">
          <Button><CalendarPlus className="mr-2 h-4 w-4" /> New appointment</Button>
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
        {loading ? (
          <div className="p-10 text-center text-muted-foreground">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-muted-foreground">You haven't booked any appointments yet.</p>
            <Link to="/book"><Button className="mt-4">Book your first appointment</Button></Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Appointment ID</th>
                  <th className="px-4 py-3">Lecturer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3 font-medium">{a.lecturer}</td>
                    <td className="px-4 py-3">{a.appointment_date}</td>
                    <td className="px-4 py-3">{a.appointment_time.slice(0,5)}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}