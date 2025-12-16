"use client";

import { useEffect } from "react";

export default function FaviconLinks() {
  useEffect(() => {
    // Remove any existing favicon links we might have added
    const existingLinks = document.querySelectorAll('link[rel="icon"][media]');
    existingLinks.forEach((link) => link.remove());

    // Add favicon for dark mode (light SVG)
    const darkModeLink = document.createElement("link");
    darkModeLink.rel = "icon";
    darkModeLink.type = "image/svg+xml";
    darkModeLink.href = "/Sync-light.svg";
    darkModeLink.setAttribute("media", "(prefers-color-scheme: dark)");
    document.head.appendChild(darkModeLink);

    // Add favicon for light mode (dark SVG)
    const lightModeLink = document.createElement("link");
    lightModeLink.rel = "icon";
    lightModeLink.type = "image/svg+xml";
    lightModeLink.href = "/Sync-dark.svg";
    lightModeLink.setAttribute("media", "(prefers-color-scheme: light)");
    document.head.appendChild(lightModeLink);
  }, []);

  return null;
}

