
import RegisterForm from "@/components/auth/RegisterForm";
import { Hospital } from "lucide-react";

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-8 border-b">
        <div className="flex items-center gap-2">
          <Hospital className="h-6 w-6 text-medblue-600" />
          <h1 className="font-bold text-xl text-medblue-600">MedCord</h1>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <RegisterForm />
      </main>
      
      <footer className="py-4 text-center text-sm text-muted-foreground">
        &copy; 2025 MedCord. All rights reserved.
      </footer>
    </div>
  );
}
