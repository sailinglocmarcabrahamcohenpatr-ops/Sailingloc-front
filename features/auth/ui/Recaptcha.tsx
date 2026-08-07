"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (container: HTMLElement, params: Record<string, unknown>) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

const SCRIPT_ID = "recaptcha-script";
// Clé de test officielle Google (valide toujours, affiche un bandeau "test").
// Remplacer par une vraie clé de site depuis https://www.google.com/recaptcha/admin
// via NEXT_PUBLIC_RECAPTCHA_SITE_KEY pour la production.
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

interface RecaptchaProps {
  onChange: (token: string | null) => void;
}

export default function Recaptcha({ onChange }: RecaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    function renderWidget() {
      if (cancelled || !containerRef.current || widgetId.current !== null) return;
      widgetId.current = window.grecaptcha!.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onChange(token),
        "expired-callback": () => onChange(null),
        "error-callback": () => onChange(null),
      });
    }

    function waitForReady() {
      if (cancelled || !window.grecaptcha) return;
      window.grecaptcha.ready(renderWidget);
    }

    if (window.grecaptcha) {
      waitForReady();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", waitForReady);
      return () => existing.removeEventListener("load", waitForReady);
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", waitForReady);
    document.body.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener("load", waitForReady);
    };
  }, [onChange]);

  return <div ref={containerRef} className="auth-recaptcha" />;
}
