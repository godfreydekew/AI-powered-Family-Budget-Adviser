import { forwardRef } from "react";
import { CheckCircle2 } from "lucide-react";

interface SuccessAlertProps {
  message: string | null;
  className?: string;
}

export const SuccessAlert = forwardRef<HTMLDivElement, SuccessAlertProps>(
  ({ message, className = "" }, ref) => {
    if (!message) return null;

    return (
      <div
        ref={ref}
        className={`flex items-start gap-2.5 p-3 rounded-xl bg-success/10 text-success text-sm ${className}`}
      >
        <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
        <span>{message}</span>
      </div>
    );
  }
);

SuccessAlert.displayName = "SuccessAlert";
