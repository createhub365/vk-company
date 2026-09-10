"use client";

import { CompanyLogo } from "@/components/company-logo";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SiteHeader({ hasLogo }: { hasLogo: boolean }) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  function closeMenu(restoreFocus = false) {
    setOpenPath(null);
    if (restoreFocus) menuButton.current?.focus();
  }

  useEffect(() => {
    const element = header.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      element.style.setProperty("--header-height", `${element.getBoundingClientRect().height}px`);
      if (menuButton.current?.getClientRects().length === 0) setOpenPath(null);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPath(null);
        menuButton.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpenPath(null);
    };
    window.addEventListener("keydown", close);
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  return (
    <header ref={header} className={`site-header ${pathname === "/" ? "home-header" : ""}`} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
    }}>
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label="VK AND COMPANY home" onClick={() => closeMenu()}>
          {hasLogo && <CompanyLogo alt="VK AND COMPANY" priority />}
          <span>VK AND COMPANY</span>
        </Link>
        <button ref={menuButton} type="button" className="menu-button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpenPath(open ? null : pathname)}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="main-navigation" className={`nav ${open ? "open" : ""}`} aria-label="Main navigation">
          <Link ref={firstLink} href="/services/domestic" onClick={() => closeMenu(open)}>Domestic</Link>
          <Link href="/services/international" onClick={() => closeMenu(open)}>International</Link>
          <Link href="/about" onClick={() => closeMenu(open)}>About</Link>
          <Link href="/contact" onClick={() => closeMenu(open)}>Contact</Link>
          <Link href="/get-a-quote" className="button button-small" onClick={() => closeMenu(open)}>Get a quote</Link>
        </nav>
      </div>
    </header>
  );
}
