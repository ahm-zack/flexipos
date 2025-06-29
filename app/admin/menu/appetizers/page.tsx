export default function AppetizersPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">
          🥗 Appetizers Menu
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Mozzarella Sticks</h2>
            <p className="text-muted-foreground mb-4">
              Crispy breaded mozzarella with marinara sauce
            </p>
            <p className="text-3xl font-bold text-primary">$8.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Buffalo Wings</h2>
            <p className="text-muted-foreground mb-4">
              Spicy chicken wings with ranch dressing
            </p>
            <p className="text-3xl font-bold text-primary">$12.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Nachos Supreme</h2>
            <p className="text-muted-foreground mb-4">
              Tortilla chips with cheese, jalapeños, and salsa
            </p>
            <p className="text-3xl font-bold text-primary">$10.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Onion Rings</h2>
            <p className="text-muted-foreground mb-4">
              Golden crispy onion rings with dipping sauce
            </p>
            <p className="text-3xl font-bold text-primary">$7.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Loaded Potato Skins</h2>
            <p className="text-muted-foreground mb-4">
              Potato skins with cheese, bacon, and sour cream
            </p>
            <p className="text-3xl font-bold text-primary">$9.99</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">Jalapeño Poppers</h2>
            <p className="text-muted-foreground mb-4">
              Stuffed jalapeños with cream cheese, breaded and fried
            </p>
            <p className="text-3xl font-bold text-primary">$8.49</p>
          </div>
        </div>
      </div>
    </div>
  );
}
