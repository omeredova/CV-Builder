import { Skeleton } from "@/shared/ui/skeleton";

export function UserSkillsSkeleton() {
  return <div aria-hidden="true" className="space-y-8">
    {[0, 1, 2].map((group) => <div key={group}>
      <Skeleton className="h-6 w-44" />
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => <div className="flex h-10 items-center gap-4 px-4" key={item}>
          <Skeleton className="h-1 w-20 shrink-0" /><Skeleton className="h-5 w-24" />
        </div>)}
      </div>
    </div>)}
  </div>;
}
