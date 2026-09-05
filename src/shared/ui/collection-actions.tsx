import { Plus, Trash2 } from "lucide-react";

import { cn } from "@/shared/lib/class-names";
import { Button, type ButtonProps } from "@/shared/ui/button";

export interface CollectionActionsProps {
  addLabel: string;
  removeLabel: string;
  onAdd?: ButtonProps["onClick"];
  onRemove?: ButtonProps["onClick"];
  addDisabled?: boolean;
  removeDisabled?: boolean;
  className?: string;
}

export function CollectionActions({ addLabel, removeLabel, onAdd, onRemove, addDisabled, removeDisabled, className }: CollectionActionsProps) {
  return (
    <div className={cn("flex flex-wrap justify-end gap-4", className)}>
      <Button type="button" variant="ghost" className="gap-4" onClick={onAdd} disabled={addDisabled}>
        <Plus aria-hidden="true" className="size-5" />
        {addLabel}
      </Button>
      <Button type="button" variant="ghost" className="gap-4 text-primary hover:border-primary active:border-primary" onClick={onRemove} disabled={removeDisabled}>
        <Trash2 aria-hidden="true" className="size-5" />
        {removeLabel}
      </Button>
    </div>
  );
}
