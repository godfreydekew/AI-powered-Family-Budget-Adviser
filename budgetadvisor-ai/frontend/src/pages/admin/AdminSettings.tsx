import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">System Settings</h1>
        <div className="glass-card p-6 space-y-6 max-w-2xl">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Default AI Model</label>
            <select defaultValue="gpt-4o" className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Max Processing Time (ms)</label>
            <input type="number" defaultValue={5000} className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-ring tabular" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-flag Unknown Categories</p>
              <p className="text-xs text-muted-foreground">Automatically flag items that can't be categorised</p>
            </div>
            <button className="relative w-11 h-6 bg-accent rounded-full transition-colors">
              <span className="absolute left-0.5 top-0.5 size-5 bg-accent-foreground rounded-full transition-transform translate-x-5" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable OCR Fallback</p>
              <p className="text-xs text-muted-foreground">Use OCR when AI Vision confidence is low</p>
            </div>
            <button className="relative w-11 h-6 bg-accent rounded-full transition-colors">
              <span className="absolute left-0.5 top-0.5 size-5 bg-accent-foreground rounded-full transition-transform translate-x-5" />
            </button>
          </div>
          <Button>Save Settings</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
