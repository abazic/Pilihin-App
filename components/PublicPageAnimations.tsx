"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REVEAL_SELECTOR = [
  "main h1",
  "main h2",
  "main h3",
  "main p",
  "main li",
  "main article",
  "main section",
  "main form",
  "main figure",
  "main blockquote",
  "main [data-scroll-reveal]",
].join(",");

export default function PublicPageAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    // Keep internal/admin screens free from public-facing motion effects.
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))
      .filter((element) => !element.closest(".scroll-reveal"))
      .filter((element) => !element.closest("[data-no-scroll-animation]"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    elements.forEach((element, index) => {
      element.classList.add("page-scroll-reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 65}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("page-scroll-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
