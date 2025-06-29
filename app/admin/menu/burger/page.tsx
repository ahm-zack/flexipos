export default function BurgerPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">🍔 Burger Menu</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Classic Burger</h2>
            <p className="text-muted-foreground mb-4">
              Beef patty, lettuce, tomato, onion
            </p>
            <p className="text-3xl font-bold text-primary">$11.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Cheese Burger</h2>
            <p className="text-muted-foreground mb-4">
              Classic burger with cheese
            </p>
            <p className="text-3xl font-bold text-primary">$12.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Bacon Burger</h2>
            <p className="text-muted-foreground mb-4">
              Cheese burger with crispy bacon
            </p>
            <p className="text-3xl font-bold text-primary">$14.99</p>
          </div>
        </div>
      </div>
    </div>
  );
}
