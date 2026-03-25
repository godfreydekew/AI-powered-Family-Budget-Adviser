import { CATEGORIES, type CategoryKey } from "@/data/dummy-data";

export function CategoryPill({ category }: { category: string }) {
  const cat = CATEGORIES.find((c) => c.key === category);
  if (!cat) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: cat.color + "15", color: cat.color }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
      {cat.label}
    </span>
  );
}
