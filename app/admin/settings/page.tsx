export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">⚙️ Settings</h1>
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Restaurant Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                <span>Restaurant Name</span>
                <span className="font-semibold">Lazaza Restaurant</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                <span>Tax Rate</span>
                <span className="font-semibold">8.5%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                <span>Service Charge</span>
                <span className="font-semibold">15%</span>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">System Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                <span>Theme</span>
                <span className="font-semibold">Auto (Light/Dark)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                <span>Language</span>
                <span className="font-semibold">English</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                <span>Currency</span>
                <span className="font-semibold">USD ($)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
