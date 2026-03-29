import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  listBenefitsDocuments,
  ingestBenefitsDocument,
  deleteBenefitsDocument,
  getBenefitsDocument,
} from "@/api/benefits";
import type { DocumentPublic, DocumentIngest } from "@/api/benefits";
import {
  Trash2,
  Upload,
  FileText,
  ChevronRight,
  X,
  Layers,
  Calendar,
  Globe,
  Tag,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Upload form
// ---------------------------------------------------------------------------

const EMPTY_FORM: DocumentIngest = {
  title: "",
  source: "",
  full_text: "",
  page_type: "",
  benefit_name: "",
  country: "UK",
};

function UploadDialog({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [form, setForm] = useState<DocumentIngest>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = (key: keyof DocumentIngest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.source.trim() || !form.full_text.trim()) {
      setError("Title, source and text are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await ingestBenefitsDocument({
        ...form,
        page_type: form.page_type || undefined,
        benefit_name: form.benefit_name || undefined,
      });
      setForm(EMPTY_FORM);
      onUploaded();
      onClose();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Benefits Document</DialogTitle>
          <DialogDescription>
            The text will be chunked, embedded, and stored for the RAG pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="Universal Credit — Eligibility 2024"
                value={form.title}
                onChange={field("title")}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Source <span className="text-destructive">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="GOV.UK / Admin upload / filename"
                value={form.source}
                onChange={field("source")}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Benefit name
              </label>
              <input
                className={inputCls}
                placeholder="Universal Credit"
                value={form.benefit_name}
                onChange={field("benefit_name")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Page type
              </label>
              <select className={inputCls} value={form.page_type} onChange={field("page_type")}>
                <option value="">— none —</option>
                <option value="eligibility">Eligibility</option>
                <option value="rates">Rates</option>
                <option value="how-to-claim">How to claim</option>
                <option value="appeals">Appeals</option>
                <option value="overview">Overview</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Country
              </label>
              <select className={inputCls} value={form.country} onChange={field("country")}>
                <option value="UK">UK</option>
                <option value="US">US</option>
                <option value="CA">CA</option>
                <option value="AU">AU</option>
                <option value="IE">IE</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Document text <span className="text-destructive">*</span>
            </label>
            <textarea
              className={`${inputCls} min-h-[220px] resize-y font-mono text-xs leading-relaxed`}
              placeholder="Paste the full plain-text content of the benefits document here…"
              value={form.full_text}
              onChange={field("full_text")}
              required
            />
            <p className="text-[10px] text-muted-foreground">
              {form.full_text.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Uploading…" : "Upload & Embed"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Document detail drawer
// ---------------------------------------------------------------------------

function DocumentDetailDialog({
  doc,
  onClose,
  onDelete,
}: {
  doc: DocumentPublic;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBenefitsDocument(doc.id);
      onDelete(doc.id);
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2">
            <FileText className="size-4 mt-0.5 text-accent shrink-0" />
            {doc.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetaItem icon={<Layers className="size-3.5" />} label="Chunks">
              {doc.chunk_count}
            </MetaItem>
            <MetaItem icon={<Globe className="size-3.5" />} label="Country">
              {doc.country}
            </MetaItem>
            <MetaItem icon={<Tag className="size-3.5" />} label="Benefit">
              {doc.benefit_name ?? "—"}
            </MetaItem>
            <MetaItem icon={<Tag className="size-3.5" />} label="Type">
              {doc.page_type ?? "—"}
            </MetaItem>
            <MetaItem icon={<Calendar className="size-3.5" />} label="Created" span>
              {formatDate(doc.created_at)}
            </MetaItem>
          </div>

          {/* Source */}
          <div className="rounded-lg bg-secondary/40 border border-border px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Source
            </p>
            <p className="text-xs text-foreground break-all">{doc.source}</p>
          </div>

          {/* Extra metadata */}
          {doc.doc_metadata && Object.keys(doc.doc_metadata).length > 0 && (
            <div className="rounded-lg bg-secondary/40 border border-border px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                Metadata
              </p>
              <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap">
                {JSON.stringify(doc.doc_metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Confirm delete */}
          {confirmDelete ? (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-3 space-y-2">
              <p className="text-xs text-destructive font-medium">
                Permanently delete this document and all {doc.chunk_count} chunks?
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 w-full"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Delete document
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetaItem({
  icon,
  label,
  children,
  span,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={`rounded-lg bg-secondary/40 border border-border px-3 py-2 ${span ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
        {icon}
        {label}
      </div>
      <p className="text-sm font-medium text-foreground">{children}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main admin page
// ---------------------------------------------------------------------------

export default function AdminBenefits() {
  const [documents, setDocuments] = useState<DocumentPublic[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selected, setSelected] = useState<DocumentPublic | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listBenefitsDocuments();
      setDocuments(res.data);
      setTotal(res.count);
    } catch {
      // silently — table shows empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeleted = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setTotal((t) => t - 1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Benefits Knowledge Base</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {total} document{total !== 1 ? "s" : ""} · used by the Benefits Advisor RAG pipeline
            </p>
          </div>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="size-4 mr-2" />
            Upload document
          </Button>
        </div>

        {/* Documents table */}
        <div className="glass-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Benefit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Chunks</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="size-8 opacity-30" />
                      <p className="text-sm">No documents yet</p>
                      <p className="text-xs">Upload the first benefits document to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow
                    key={doc.id}
                    className="cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => setSelected(doc)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="size-3.5 text-accent shrink-0" />
                        <span className="font-medium text-sm max-w-[240px] truncate">
                          {doc.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.benefit_name ?? "—"}
                    </TableCell>
                    <TableCell>
                      {doc.page_type ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground capitalize">
                          {doc.page_type}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.country}
                    </TableCell>
                    <TableCell className="text-right tabular text-sm font-medium">
                      {doc.chunk_count}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(doc.created_at)}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Upload dialog */}
      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={load}
      />

      {/* Document detail dialog */}
      {selected && (
        <DocumentDetailDialog
          doc={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDeleted}
        />
      )}
    </AdminLayout>
  );
}
