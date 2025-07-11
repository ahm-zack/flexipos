"use client";

import React from "react";

export default function TestPrintPage() {
  const handlePrint = async () => {
    try {
      await fetch("http://localhost:3001/print", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "Hello World from POS Dashboard!",
      });
      alert("Print request sent!");
    } catch (error) {
      alert("Failed to send print request");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Test Print Service</h1>
      <button
        onClick={handlePrint}
        style={{
          padding: "8px 16px",
          fontSize: 18,
          background: "#10b981",
          color: "white",
          border: "none",
          borderRadius: 6,
        }}
      >
        Print Hello World
      </button>
    </div>
  );
}
