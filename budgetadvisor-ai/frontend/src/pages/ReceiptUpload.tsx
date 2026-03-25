import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Camera, ScanLine, X, AlertTriangle } from "lucide-react";
import { CATEGORIES, type CategoryKey } from "@/data/dummy-data";
import { scanReceipt, confirmReceipt } from "@/api/receipts";
import { getApiErrorMessage } from "@/api/errors";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LineItemExtraction, ReceiptScanResponse } from "@/api/types";
import { CameraCapture } from "@/components/CameraCapture";

interface EditableItem extends LineItemExtraction {
  _id: string;
}

function isFlagged(item: LineItemExtraction): boolean {
  return item.category === "other" || item.line_total == null;
}

export default function ReceiptUpload() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const [scanData, setScanData] = useState<ReceiptScanResponse | null>(null);
  const [logId, setLogId] = useState<string | null>(null);

  const [merchantName, setMerchantName] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [items, setItems] = useState<EditableItem[]>([]);

  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => { setFile(f); setPreview(URL.createObjectURL(f)); setError(null); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };
  const resetToStep1 = () => { setStep(1); setFile(null); setPreview(null); setScanData(null); setLogId(null); setError(null); };

  const handleCameraCapture = (capturedFile: File) => {
    handleFile(capturedFile);
    setShowCamera(false);
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true); setError(null);
    try {
      const data = await scanReceipt(file);
      setScanData(data);
      setLogId(data._log_id ?? null);
      setMerchantName(data.merchant.name ?? "");
      setTransactionDate(data.transaction.date ?? new Date().toISOString().split("T")[0]);
      setItems(data.items.map((item, i) => ({ ...item, _id: String(i) })));
      setStep(2);
    } catch (err) { setError(getApiErrorMessage(err)); }
    finally { setScanning(false); }
  };

  const updateItem = (index: number, patch: Partial<EditableItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleConfirm = async () => {
    if (!scanData) return;
    setSaving(true); setError(null);
    try {
      const totalSaved = items.reduce((sum, item) => sum + (item.promotion_saving ?? 0), 0);
      const totalPromotions = items.filter((i) => i.on_promotion).length;
      await confirmReceipt({
        extraction: {
          merchant: { ...scanData.merchant, name: merchantName || null },
          transaction: { ...scanData.transaction, date: transactionDate || null },
          items: items.map(({ _id, ...rest }) => rest),
          savings: { total_promotions: totalPromotions, total_saved: totalSaved },
        },
        scan_method: "vision",
        image_path: null,
        log_id: logId,
      });
      navigate("/receipts");
    } catch (err) { setError(getApiErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const totalPromo = items.reduce((sum, item) => sum + (item.promotion_saving ?? 0), 0);
  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  if (showCamera) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-semibold">Capture Receipt</h1>
          <CameraCapture
            onCapture={handleCameraCapture}
            onCancel={() => setShowCamera(false)}
          />
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Upload Receipt</h1>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-accent rounded-2xl p-6 sm:p-12 text-center cursor-pointer transition-colors"
            >
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <Upload className="size-8 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium">Drop your receipt here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-2">JPG, PNG, WebP, HEIC, PDF</p>
            </div>

            {preview && (
              <div className="glass-card p-4 flex items-center gap-4">
                <img src={preview} alt="Receipt preview" className="size-20 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">{file && (file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="size-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button onClick={handleScan} disabled={!file || scanning}>
                <ScanLine className="size-4" />
                {scanning ? "Scanning…" : "Scan with AI"}
              </Button>
              <Button variant="ghost" onClick={() => setShowCamera(true)}>
                <Camera className="size-4" /> Use camera
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2">
                {preview && (
                  <div className="glass-card p-3">
                    <img src={preview} alt="Receipt" className="w-full rounded-lg object-contain max-h-96" style={{ outline: "1px solid rgba(0,0,0,0.1)", outlineOffset: "-1px" }} />
                  </div>
                )}
              </div>
              <div className="lg:col-span-3 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Merchant</label>
                    <input value={merchantName} onChange={(e) => setMerchantName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Date</label>
                    <input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="overflow-x-auto glass-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Cat.</TableHead>
                        <TableHead>Promo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={item._id} className={isFlagged(item) ? "border-l-2 border-l-warning bg-warning/5" : ""}>
                          <TableCell>
                            <p className="text-xs text-muted-foreground">{item.raw_description}</p>
                            <input value={item.clean_description ?? ""} onChange={(e) => updateItem(index, { clean_description: e.target.value })} className="w-full bg-transparent text-sm font-medium focus:outline-none focus:underline mt-0.5" />
                            {isFlagged(item) && (
                              <span className="inline-flex items-center gap-1 text-xs text-warning mt-1">
                                <AlertTriangle className="size-3" /> Needs review
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <input type="number" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })} className="w-12 bg-secondary rounded-lg px-2 py-1 text-sm tabular text-center" />
                          </TableCell>
                          <TableCell>
                            <input type="number" value={item.unit_price ?? ""} step="0.01" onChange={(e) => updateItem(index, { unit_price: e.target.value ? Number(e.target.value) : null })} className="w-16 bg-secondary rounded-lg px-2 py-1 text-sm tabular" />
                          </TableCell>
                          <TableCell>
                            <select value={item.category as CategoryKey} onChange={(e) => updateItem(index, { category: e.target.value })} className="bg-secondary rounded-lg px-2 py-1 text-xs">
                              {CATEGORIES.map((c) => (<option key={c.key} value={c.key}>{c.label}</option>))}
                            </select>
                          </TableCell>
                          <TableCell>
                            <input type="checkbox" checked={item.on_promotion} onChange={(e) => updateItem(index, { on_promotion: e.target.checked })} />
                            {item.on_promotion && (
                              <span className="text-xs text-success ml-1 tabular">-£{(item.promotion_saving ?? 0).toFixed(2)}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="glass-card p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total promotional savings</span>
                  <span className="font-semibold text-success tabular">£{totalPromo.toFixed(2)}</span>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleConfirm} disabled={saving}>
                    {saving ? "Saving…" : "Save Receipt"}
                  </Button>
                  <Button variant="ghost" onClick={resetToStep1} disabled={saving}>
                    Start Over
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
