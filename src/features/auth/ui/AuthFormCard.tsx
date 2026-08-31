import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export interface AuthFormCardProps {
  children: ReactNode;
  subtitle: string;
  title: string;
}

export function AuthFormCard({ children, subtitle, title }: AuthFormCardProps) {
  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardHeader className="mb-auth-heading-bottom gap-0 p-0 text-center">
        <CardTitle as="h1" className="text-auth-title font-normal leading-tight sm:text-4xl">
          {title}
        </CardTitle>
        <CardDescription className="mt-auth-subtitle-top text-base text-card-foreground">
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
