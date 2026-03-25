import { AdminLayout } from "@/components/layouts/AdminLayout";
import { adminCategories } from "@/data/dummy-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function AdminCategories() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Active</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminCategories.map((c) => (
                <TableRow key={c.key}>
                  <TableCell className="tabular text-muted-foreground">{c.displayOrder}</TableCell>
                  <TableCell className="font-mono text-xs">{c.key}</TableCell>
                  <TableCell className="font-medium">{c.label}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="size-4 rounded" style={{ backgroundColor: c.color }} />
                      <span className="text-xs text-muted-foreground">{c.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`size-2 rounded-full inline-block ${c.active ? "bg-success" : "bg-muted-foreground"}`} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
