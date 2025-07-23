"use client";
import React, { ReactNode } from "react";
import { POSNav } from "./pos-nav";
import { CartPanelStatic } from "./cart-panel-static";

interface POSLayoutProps {
  children: ReactNode;
}

export default function POSLayout({ children }: POSLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-[15%] bg-sidebar overflow-hidden">
        <POSNav />
      </div>

      {/* Center Content */}
      <div className="w-[60%] overflow-y-auto">{children}</div>

      {/* Right Sidebar */}
      <div className="w-[25%] bg-sidebar overflow-hidden">
        <CartPanelStatic />
      </div>
    </div>
  );
}
