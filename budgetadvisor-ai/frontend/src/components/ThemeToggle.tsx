import { forwardRef } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export const ThemeToggle = forwardRef<HTMLButtonElement>((_, ref) => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <button
      ref={ref}
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-secondary transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "light" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
});

ThemeToggle.displayName = "ThemeToggle";
