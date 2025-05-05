
import { Hospital } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container flex flex-col md:flex-row items-center justify-between py-6 gap-4">
        <div className="flex items-center gap-2">
          <Hospital className="h-5 w-5 text-medblue-600" />
          <p className="text-sm text-muted-foreground">
            © 2025 MedCord. Secure blockchain medical records.
          </p>
        </div>
        
        <nav className="flex gap-4 sm:gap-6">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
