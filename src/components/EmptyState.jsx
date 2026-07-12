import { CalendarX2 } from "lucide-react";

export default function EmptyState({ message = "No results match this state criteria." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <CalendarX2 className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
