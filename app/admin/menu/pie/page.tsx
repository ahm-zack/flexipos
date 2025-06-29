export default function PiePage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">🥧 Pie Menu</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Apple Pie</h2>
            <p className="text-muted-foreground mb-4">
              Fresh apples with cinnamon
            </p>
            <p className="text-3xl font-bold text-primary">$8.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Cherry Pie</h2>
            <p className="text-muted-foreground mb-4">
              Sweet cherries in flaky crust
            </p>
            <p className="text-3xl font-bold text-primary">$9.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Pecan Pie</h2>
            <p className="text-muted-foreground mb-4">
              Rich pecans with caramel
            </p>
            <p className="text-3xl font-bold text-primary">$10.99</p>
          </div>
        </div>
      </div>
    </div>
  );
}
