import Link from "next/link";
import { Fragment, type MouseEventHandler, type ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";

interface AppBreadcrumbProps {
  onPageClick?: MouseEventHandler<HTMLAnchorElement>;
  pageHref?: string;
  pageName: string;
  trail?: readonly ReactNode[];
}

export function AppBreadcrumb({ onPageClick, pageHref, pageName, trail = [] }: AppBreadcrumbProps) {
  return (
    <Breadcrumb className="flex h-breadcrumb-header items-center ml-10">
      <BreadcrumbList className="h-full flex-nowrap items-center overflow-hidden whitespace-nowrap text-page-title leading-page-title">
        <BreadcrumbItem className="h-full shrink-0 items-center">
          {pageHref ? (
            <Link
              className="inline-flex h-full items-center font-normal text-muted-foreground hover:text-foreground"
              href={pageHref}
              onClick={onPageClick}
            >
              {pageName}
            </Link>
          ) : (
            <BreadcrumbPage className="inline-flex h-full items-center text-muted-foreground">
              {pageName}
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {trail.map((item, index) => (
          <Fragment key={index}>
            <BreadcrumbSeparator className="flex h-full shrink-0 items-center justify-center" />
            <BreadcrumbItem className="h-full min-w-0 shrink items-center">
              <BreadcrumbPage
                aria-current={index === trail.length - 1 ? "page" : undefined}
                className={`inline-flex h-full items-center ${index === trail.length - 1 ? "text-muted-foreground" : "text-primary"}`}
              >
                {item}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
