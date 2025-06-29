export default function ReportsPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">
          📊 Sales Reports
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Today&apos;s Sales</h3>
            <p className="text-3xl font-bold text-green-600">$1,245</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Orders Today</h3>
            <p className="text-3xl font-bold text-blue-600">87</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">This Week</h3>
            <p className="text-3xl font-bold text-purple-600">$8,920</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">This Month</h3>
            <p className="text-3xl font-bold text-orange-600">$34,567</p>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Popular Items</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
              <span>🍕 Margherita Pizza</span>
              <span className="font-semibold">45 orders</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
              <span>🍔 Classic Burger</span>
              <span className="font-semibold">38 orders</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
              <span>🌯 Chicken Shawerma</span>
              <span className="font-semibold">32 orders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
