import { Mail, Filter } from "lucide-react";

export function MailFilterIcon({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Mail className="absolute inset-0" />
      <Filter className="absolute inset-0 w-4 h-4 -top-1 -right-1 text-blue-700" />
    </div>
  );
}