"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EODReportDashboard } from "./eod-report-dashboard";
import { HistoricalEODReports } from "./historical-eod-reports";

export function EODReportManager() {
  const [activeTab, setActiveTab] = useState("generate");

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b bg-muted/30">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-auto p-1 bg-transparent">
              <TabsTrigger
                value="generate"
                className="text-sm sm:text-base py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Generate Report
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-sm sm:text-base py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                View History
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="generate" className="mt-0 p-4 sm:p-6">
          <EODReportDashboard />
        </TabsContent>

        <TabsContent value="history" className="mt-0 p-4 sm:p-6">
          <HistoricalEODReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
