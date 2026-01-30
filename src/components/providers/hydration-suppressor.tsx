"use client";

import { useEffect } from "react";

/**
 * Suppresses hydration warnings caused by browser extensions
 * (NordPass, LastPass, etc.) that inject attributes into the DOM.
 * 
 * This component runs once on mount and removes extension-specific
 * attributes that cause React hydration mismatches.
 */
export function HydrationSuppressor() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // Remove attributes added by password managers
    const extensionAttributes = [
      "data-nordpass-form",
      "data-nordpass-field",
      "data-lastpass-form",
      "data-lastpass-field",
      "data-lp-form",
      "data-lp-field",
      "data-1password-form",
      "data-1password-field",
      "data-dashlane-form",
      "data-dashlane-field",
      "data-bitwarden-form",
      "data-bitwarden-field",
    ];

    // Remove from all elements
    const allElements = document.querySelectorAll("*");
    allElements.forEach((el) => {
      extensionAttributes.forEach((attr) => {
        if (el.hasAttribute(attr)) {
          el.removeAttribute(attr);
        }
      });
    });

    // Also handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            extensionAttributes.forEach((attr) => {
              if (el.hasAttribute(attr)) {
                el.removeAttribute(attr);
              }
            });
            // Also check children
            const children = el.querySelectorAll("*");
            children.forEach((child) => {
              extensionAttributes.forEach((attr) => {
                if (child.hasAttribute(attr)) {
                  child.removeAttribute(attr);
                }
              });
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
