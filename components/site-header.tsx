"use client";

import { CompanyLogo } from "@/components/company-logo";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
const NavigationRuntime = dynamic(() => import("./motion/navigation-runtime"), { ssr: false });
import { acquireScrollLock } from "@/lib/motion/scroll-lock";
import { pointerRouteAllowed } from "@/lib/motion/policy";
import "@/styles/navigation.css";

export function SiteHeader({ hasLogo }: { hasLogo: boolean }) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Browsers can retain :focus-visible when a mouse-opened menu restores
    // focus after keyboard use. Preserve focus, but reset its visual modality.
    const keyboard = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey && !event.altKey) delete header.current?.dataset.navPointerFocus;
    };
    document.addEventListener("keydown", keyboard, true);
    return () => document.removeEventListener("keydown", keyboard, true);
  }, []);


  function closeMenu(restoreFocus = false) {
    setOpenPath(null);
    if (restoreFocus) menuButton.current?.focus({ preventScroll: true });
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
    if (!open) { navigation.current?.style.removeProperty("will-change"); return; }
    const releaseScroll = acquireScrollLock();
    const focusItem = (item: HTMLElement | null | undefined) => {
      item?.focus({ preventScroll: true });
      const panel = navigation.current;
      if (!item || !panel?.contains(item)) return;
      // Reveal a focused link inside short/zoomed menus without moving the body.
      const linkBox = item.getBoundingClientRect(), panelBox = panel.getBoundingClientRect();
      const margin = 8;
      if (linkBox.bottom > panelBox.bottom - margin) panel.scrollTop += linkBox.bottom - panelBox.bottom + margin;
      else if (linkBox.top < panelBox.top + margin) panel.scrollTop -= panelBox.top + margin - linkBox.top;
    };
    focusItem(firstLink.current);
    const items = () => [menuButton.current, ...Array.from(navigation.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? [])]
      .filter((element): element is HTMLButtonElement | HTMLAnchorElement => !!element);
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpenPath(null);
        menuButton.current?.focus({ preventScroll: true });
      } else if (event.key === "Tab") {
        const focusable = items();
        const index = focusable.indexOf(document.activeElement as HTMLAnchorElement);
        event.preventDefault();
        focusItem(focusable[(index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length]);
      } else if (!event.ctrlKey && !event.metaKey && ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)
        && !(event.key === " " && document.activeElement === menuButton.current)) {
        // Lenis handles wheel/touch. Keep keyboard scrolling within a short menu too.
        event.preventDefault();
        const panel = navigation.current;
        if (panel) {
          const direction = ["ArrowUp", "PageUp", "Home"].includes(event.key) || (event.key === " " && event.shiftKey) ? -1 : 1;
          panel.scrollBy({ top: direction * (event.key.startsWith("Arrow") ? 40 : panel.clientHeight), behavior: "instant" });
          if (event.key === "Home") panel.scrollTop = 0;
          if (event.key === "End") panel.scrollTop = panel.scrollHeight;
        }
      }
    };
    const containFocus = (event: FocusEvent) => {
      if (!items().includes(event.target as HTMLAnchorElement)) focusItem(firstLink.current);
    };
    const outside = (event: MouseEvent) => {
      // The menu icon is replaced during this click; its original event path stays valid.
      if (header.current && !event.composedPath().includes(header.current)) {
        setOpenPath(null);
        menuButton.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", close);
    window.addEventListener("click", outside);
    document.addEventListener("focusin", containFocus);
    return () => {
      releaseScroll();
      window.removeEventListener("keydown", close);
      window.removeEventListener("click", outside);
      document.removeEventListener("focusin", containFocus);
    };
  }, [open]);
  return (
    <header ref={header} className={`site-header nav-depth-shell ${pathname === "/" ? "home-header" : ""}`} data-nav-scrolled={scrolled} data-nav-pointer={pointerRouteAllowed(pathname)} onPointerDownCapture={event => { event.currentTarget.dataset.navPointerFocus = ""; }}>
      <div className="nav-surface">
      <div className="shell header-inner">
        <Link prefetch={false} href="/" className="brand" aria-label="VK AND COMPANY home" onClick={() => closeMenu()}>
          {hasLogo && <CompanyLogo alt="VK AND COMPANY" priority />}
          <span>VK AND COMPANY</span>
        </Link>
        <button ref={menuButton} type="button" className="menu-button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpenPath(open ? null : pathname)}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav ref={navigation} id="main-navigation" className={`nav ${open ? "open" : ""}`} aria-label="Main navigation" data-lenis-prevent>
          <Link prefetch={false} ref={firstLink} href="/services/domestic" onClick={() => closeMenu(open)}>Domestic</Link>
          <Link prefetch={false} href="/services/international" onClick={() => closeMenu(open)}>International</Link>
          <Link prefetch={false} href="/about" onClick={() => closeMenu(open)}>About</Link>
          <Link prefetch={false} href="/contact" onClick={() => closeMenu(open)}>Contact</Link>
          <Link prefetch={false} href="/get-a-quote" className="button button-small" onClick={() => closeMenu(open)}>Get a quote</Link>
        </nav>
      </div>
      </div>
      <NavigationRuntime navigation={navigation} open={open} onScrolledChange={setScrolled}/>
    </header>
  );
}
