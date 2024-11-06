import { RefreshCwIcon } from 'lucide-react';

export function ProcessingIndicator() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm animate-in fade-in-0 slide-in-from-bottom-4">
      <RefreshCwIcon className="h-4 w-4 animate-spin" />
      Processing...
    </div>
  );
}