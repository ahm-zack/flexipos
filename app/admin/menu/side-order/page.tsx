export default function SideOrderPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">🍟 Side Orders</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">French Fries</h2>
            <p className="text-muted-foreground mb-4">Crispy golden fries</p>
            <p className="text-3xl font-bold text-primary">$4.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Onion Rings</h2>
            <p className="text-muted-foreground mb-4">
              Battered and fried onion rings
            </p>
            <p className="text-3xl font-bold text-primary">$5.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Mozzarella Sticks</h2>
            <p className="text-muted-foreground mb-4">
              Breaded mozzarella with marinara
            </p>
            <p className="text-3xl font-bold text-primary">$6.99</p>
          </div>
        </div>
      </div>
    </div>
  );
}
