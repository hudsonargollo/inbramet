"use client";

import { usePathname } from "next/navigation";
import { Marquee } from "./marquee";
import { SiteHeader } from "./site-header";

const AUTH_SCREENS = ["/login", "/register", "/register/verify", "/forgot-password", "/reset-password", "/account/verify-email"];

export function useIsAuthScreen(): boolean {
  return AUTH_SCREENS.includes(usePathname());
}

export function ConditionalHeader({
  announcements,
  clubName = null,
}: {
  announcements: string[];
  clubName?: string | null;
}) {
  if (useIsAuthScreen()) return null;
  return (
    <>
      <Marquee items={announcements} />
      <SiteHeader clubName={clubName} />
    </>
  );
}
