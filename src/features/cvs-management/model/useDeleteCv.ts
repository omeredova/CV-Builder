import { useMutation } from "@apollo/client/react";
import { deleteCvMutation } from "@/entities/cv";

export function useDeleteCv(cvId: string, onDeleted: () => void) {
  const [remove, { loading, error }] = useMutation(deleteCvMutation);
  async function confirm(): Promise<void> {
    if (loading) return;
    try { await remove({ variables: { cv: { cvId } }, update(cache) { cache.evict({ id: cache.identify({ __typename: "Cv", id: cvId }) }); cache.gc(); } }); onDeleted(); } catch { /* Keep the dialog open with Apollo's error. */ }
  }
  return { loading, error, confirm };
}
