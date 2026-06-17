import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const navLinks = user
    ? role === "admin"
      ? [{ to: "/admin", label: "Admin Dashboard" }, { to: "/profile", label: "Profile" }]
      : [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/book", label: "Book" },
          { to: "/track", label: "Track" },
          { to: "/profile", label: "Profile" },
        ]
    : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-base leading-tight">
            <span className="block text-foreground">AIU-BOOK</span>
            <span className="block text-[10px] font-normal text-muted-foreground">Student Appointments</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut} className="ml-2">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          ) : (
            <>
              <Link to="/auth" className="ml-2">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/auth" search={{ mode: "register" }}>
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>

        <button
          className="md:hidden rounded-md p-2 text-foreground hover:bg-accent"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}