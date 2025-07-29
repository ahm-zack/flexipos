"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/admin/reports",
      label: "Generate Report",
      active: pathname === "/admin/reports",
    },
    {
      href: "/admin/reports/history",
      label: "View History",
      active: pathname === "/admin/reports/history",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <ul className="flex w-full max-w-md mx-auto h-auto p-1 bg-transparent">
            {navLinks.map((link) => (
              <li key={link.href} className="flex-1">
                <Link
                  href={link.href}
                  className={`block text-center text-sm sm:text-base py-3 px-4 rounded transition-colors ${
                    link.active
                      ? "bg-background shadow-sm font-semibold"
                      : "hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
