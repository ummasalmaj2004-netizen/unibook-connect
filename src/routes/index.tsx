import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, ClipboardList, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UniBook — University Appointment System" },
      { name: "description", content: "Book and track appointments with university lecturers and academic advisors." },
      { property: "og:title", content: "UniBook — University Appointment System" },
      { property: "og:description", content: "Book and track appointments with university lecturers and academic advisors." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, role } = useAuth();
  const dashHref = role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden text-primary-foreground"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_25%_15%,white_0,transparent_45%),radial-gradient(circle_at_75%_85%,white_0,transparent_45%)]" />
          <div className="container relative mx-auto px-4 py-20 md:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Official University Platform
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Book and track appointments with your lecturers — in minutes.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-white/85">
                A simple, professional system for students to request academic appointments and for staff to manage them efficiently.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {user ? (
                  <Link to={dashHref}>
                    <Button size="lg" variant="secondary">
                      Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth" search={{ mode: "register" }}>
                      <Button size="lg" variant="secondary">
                        Create student account <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/auth">
                      <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                        Sign in
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Everything you need to manage student appointments
            </h2>
            <p className="mt-4 text-muted-foreground">
              Streamlined workflows for students and administrators.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: CalendarCheck, title: "Book in seconds", text: "Choose your lecturer, date, time and reason — submit and you're done." },
              { icon: ClipboardList, title: "Track in real-time", text: "See the status of every request: pending, approved, rejected or completed." },
              { icon: ShieldCheck, title: "Secure & university-grade", text: "Role-based access for students and administrators with full data protection." },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
