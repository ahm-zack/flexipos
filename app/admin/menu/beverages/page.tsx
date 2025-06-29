export default function BeveragesPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">☕ Beverages</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Coffee</h2>
            <p className="text-muted-foreground mb-4">Fresh brewed coffee</p>
            <p className="text-3xl font-bold text-primary">$2.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Soft Drinks</h2>
            <p className="text-muted-foreground mb-4">
              Coke, Pepsi, Sprite, Orange
            </p>
            <p className="text-3xl font-bold text-primary">$1.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Fresh Juice</h2>
            <p className="text-muted-foreground mb-4">
              Orange, Apple, Mixed Berry
            </p>
            <p className="text-3xl font-bold text-primary">$3.99</p>
          </div>
        </div>
      </div>
    </div>
  );
}
