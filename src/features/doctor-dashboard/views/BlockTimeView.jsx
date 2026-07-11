import BlockTimeForm from "../components/BlockTimeForm";

export default function BlockTimeView({ blocks, onAddBlock, onRemoveBlock }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Block Time</h2>
        <p className="text-sm text-muted-foreground">Manage windows when you're unavailable for booking.</p>
      </div>
      <div className="max-w-md">
        <BlockTimeForm blocks={blocks} onAddBlock={onAddBlock} onRemoveBlock={onRemoveBlock} />
      </div>
    </div>
  );
}
