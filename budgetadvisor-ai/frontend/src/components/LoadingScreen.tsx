import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ message = "Loading…", fullScreen = true }: LoadingScreenProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="size-8 text-accent animate-spin" />
      <p className="text-sm text-muted-foreground font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return <div className="flex-1 flex items-center justify-center py-20">{content}</div>;
}
