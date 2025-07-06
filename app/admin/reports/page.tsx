import { EODReportDashboard } from "@/modules/eod-report/components";

export default function ReportsPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Sales Reports</h1>
        <EODReportDashboard />
      </div>
    </div>
  );
}
