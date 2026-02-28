"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "@i18n/navigation";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

interface NavDropdownProps {
  label: string;
  items: NavItem[];
  locale: string;
}

export function NavDropdown({ label, items, locale }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const pathname = usePathname();

  const isActive = items.some(
    (item) =>
      pathname === `/${locale}${item.href}` ||
      pathname.startsWith(`/${locale}${item.href}/`)
  );

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, close]);

  function handleMouseEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  }

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "ArrowDown" && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`inline-flex items-center gap-1 transition-colors ${
          isActive
            ? "text-primary font-medium"
            : "text-foreground/80 hover:text-primary"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-border bg-background shadow-lg py-1 z-50"
          role="menu"
        >
          {items.map((item) => {
            const itemActive =
              pathname === `/${locale}${item.href}` ||
              pathname.startsWith(`/${locale}${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={`block px-4 py-2 text-sm transition-colors ${
                  itemActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground/80 hover:bg-muted hover:text-primary"
                }`}
                onClick={close}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
