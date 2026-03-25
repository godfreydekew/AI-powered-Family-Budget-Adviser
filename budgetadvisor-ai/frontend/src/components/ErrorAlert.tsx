import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string | null;
  className?: string;
}

export const ErrorAlert = forwardRef<HTMLDivElement, ErrorAlertProps>(
  ({ message, className = "" }, ref) => {
    if (!message) return null;

    return (
      <div
        ref={ref}
        className={`flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 text-destructive text-sm ${className}`}
      >
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
        <span>{message}</span>
      </div>
    );
  }
);

ErrorAlert.displayName = "ErrorAlert";
