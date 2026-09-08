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

export function CollectionAddButton({ children, className, variant = "ghost", ...props }: ButtonProps) {
  return <Button type="button" variant={variant} className={cn("gap-4", className)} {...props}>
    <Plus aria-hidden="true" className="size-5" />
    {children}
  </Button>;
}

export function CollectionActions({ addLabel, removeLabel, onAdd, onRemove, addDisabled, removeDisabled, className }: CollectionActionsProps) {
  return (
    <div className={cn("flex flex-wrap justify-end gap-4", className)}>
      <CollectionAddButton onClick={onAdd} disabled={addDisabled}>{addLabel}</CollectionAddButton>
      <Button type="button" variant="ghost" className="gap-4 text-primary hover:border-primary active:border-primary" onClick={onRemove} disabled={removeDisabled}>
        <Trash2 aria-hidden="true" className="size-5" />
        {removeLabel}
      </Button>
    </div>
  );
}
