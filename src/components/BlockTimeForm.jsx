import { useState } from "react";
import { Ban, Trash2 } from "lucide-react";
import { todayISODate } from "../utils/storage";

const emptyForm = { date: todayISODate(), startTime: "", endTime: "", reason: "" };

const fieldClasses =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function BlockTimeForm({ blocks, onAddBlock, onRemoveBlock }) {
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.startTime || !form.endTime || !form.reason) return;
    onAddBlock(form);
    setForm({ ...emptyForm, date: form.date });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <h3 className="text-base font-semibold tracking-tight text-foreground">Timelock Management</h3>
      <p className="mb-4 text-sm text-muted-foreground">Block off a window to stop new bookings landing on it.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="block-date" className="mb-1 block text-sm font-semibold text-foreground">
            Date
          </label>
          <input
            id="block-date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={fieldClasses}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="block-start" className="mb-1 block text-sm font-semibold text-foreground">
              Start time
            </label>
            <input
              id="block-start"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className={fieldClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="block-end" className="mb-1 block text-sm font-semibold text-foreground">
              End time
            </label>
            <input
              id="block-end"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className={fieldClasses}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="block-reason" className="mb-1 block text-sm font-semibold text-foreground">
            Reason
          </label>
          <textarea
            id="block-reason"
            rows={3}
            placeholder="e.g. Ward rounds, surgery, personal leave"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className={fieldClasses}
            required
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Ban className="h-4 w-4" />
          Lock this slot
        </button>
      </form>

      <div className="mt-6 space-y-2">
        <p className="text-sm font-medium text-foreground">Active System Blocks</p>
        {blocks.length === 0 ? (
          <p className="text-xs text-muted-foreground">No blocks are currently applied.</p>
        ) : (
          <ul className="space-y-2">
            {blocks.map((block, index) => (
              <li
                key={`${block.date}-${block.startTime}-${index}`}
                className="flex items-start justify-between gap-2 rounded-lg border border-border bg-background p-2.5"
              >
                <div className="flex items-start gap-2">
                  <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {block.date} · {block.startTime}–{block.endTime}
                    </p>
                    <p className="text-xs text-muted-foreground">{block.reason}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveBlock(index)}
                  aria-label="Remove block"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
