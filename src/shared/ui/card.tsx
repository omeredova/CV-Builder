import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/class-names";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("flex flex-col rounded-xl border bg-card text-card-foreground", className)}
      data-slot="card"
      {...props}
    />
  );
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("grid gap-2 px-6 pt-6", className)}
      data-slot="card-header"
      {...props}
    />
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3";
}

export function CardTitle({ as: Component = "h2", className, ...props }: CardTitleProps) {

  return (
    <Component
      className={cn("font-semibold leading-none", className)}
      data-slot="card-title"
      {...props}
    />
  );
}

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="card-description"
      {...props}
    />
  );
}

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("px-6 pb-6", className)} data-slot="card-content" {...props} />;
}
