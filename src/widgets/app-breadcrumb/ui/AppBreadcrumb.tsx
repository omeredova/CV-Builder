import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/shared/ui/breadcrumb";

interface AppBreadcrumbProps {
  pageName: string;
}

export function AppBreadcrumb({ pageName }: AppBreadcrumbProps) {
  return (
    <Breadcrumb className="flex h-breadcrumb-header items-center ml-5">
      <BreadcrumbList className="text-page-title leading-page-title">
        <BreadcrumbItem>
          <BreadcrumbPage className="text-muted-foreground">{pageName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
