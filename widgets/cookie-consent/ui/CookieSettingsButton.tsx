"use client";

import { useCookieConsent } from "@/shared/lib";

interface CookieSettingsButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function CookieSettingsButton({ className = "btn btn-primary", children }: CookieSettingsButtonProps) {
  const { openPreferences } = useCookieConsent();

  return (
    <button type="button" className={className} onClick={openPreferences}>
      {children ?? (
        <>
          <i className="fa-solid fa-sliders" aria-hidden="true" /> Gérer mes cookies
        </>
      )}
    </button>
  );
}
