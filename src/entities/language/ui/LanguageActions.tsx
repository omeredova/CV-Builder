import { CollectionActions, type CollectionActionsProps } from "@/shared/ui/collection-actions";

export type LanguageActionsProps = Omit<CollectionActionsProps, "addLabel" | "removeLabel">;

export function LanguageActions(props: LanguageActionsProps) {
  return <CollectionActions {...props} addLabel="ADD LANGUAGE" removeLabel="REMOVE LANGUAGES" />;
}
