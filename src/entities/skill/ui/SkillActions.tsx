import { CollectionActions, type CollectionActionsProps } from "@/shared/ui/collection-actions";

export type SkillActionsProps = Omit<CollectionActionsProps, "addLabel" | "removeLabel">;

export function SkillActions(props: SkillActionsProps) {
  return <CollectionActions {...props} addLabel="ADD SKILL" removeLabel="REMOVE SKILLS" />;
}
