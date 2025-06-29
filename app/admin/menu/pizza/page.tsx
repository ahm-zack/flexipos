export default function PizzaPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">🍕 Pizza Menu</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Margherita</h2>
            <p className="text-muted-foreground mb-4">
              Fresh tomatoes, mozzarella, basil
            </p>
            <p className="text-3xl font-bold text-primary">$12.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Pepperoni</h2>
            <p className="text-muted-foreground mb-4">
              Pepperoni, mozzarella, tomato sauce
            </p>
            <p className="text-3xl font-bold text-primary">$14.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Supreme</h2>
            <p className="text-muted-foreground mb-4">
              Pepperoni, sausage, peppers, onions
            </p>
            <p className="text-3xl font-bold text-primary">$16.99</p>
          </div>
        </div>
      </div>
    </div>
  );
}
