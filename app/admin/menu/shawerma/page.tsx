export default function ShawermaPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">
          🌯 Shawerma Menu
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Chicken Shawerma</h2>
            <p className="text-muted-foreground mb-4">
              Grilled chicken with garlic sauce
            </p>
            <p className="text-3xl font-bold text-primary">$9.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Beef Shawerma</h2>
            <p className="text-muted-foreground mb-4">
              Seasoned beef with tahini
            </p>
            <p className="text-3xl font-bold text-primary">$10.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Mixed Shawerma</h2>
            <p className="text-muted-foreground mb-4">
              Chicken and beef combination
            </p>
            <p className="text-3xl font-bold text-primary">$11.99</p>
          </div>
        </div>
      </div>
    </div>
  );
}
