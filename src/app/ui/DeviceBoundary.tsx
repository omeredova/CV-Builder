"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DeviceErrorPage } from "@/shared/ui/device-error-page";

export function DeviceBoundary({ children }: { children: ReactNode }) {
  const mobileSettings = usePathname() === "/settings";
  return <>
    {!mobileSettings && <DeviceErrorPage />}
    <div className={mobileSettings ? "block" : "hidden md:block"}>{children}</div>
  </>;
}
