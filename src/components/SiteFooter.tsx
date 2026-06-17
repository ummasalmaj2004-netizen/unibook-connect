import { GraduationCap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            UniBook
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            The official appointment booking and tracking system for students and academic advisors.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">University</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Academic Affairs Office</li>
            <li>Student Services</li>
            <li>Registrar</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Support</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>help@unibook.edu</li>
            <li>+1 (555) 010-2030</li>
            <li>Mon–Fri, 9:00–17:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} UniBook · All rights reserved.
        </div>
      </div>
    </footer>
  );
}