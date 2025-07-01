import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function DessertsManagementPage() {
  return (
    <div className="space-y-6">
      {/* Back Button and Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/items">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Items
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Dessert Management
          </h1>
          <p className="text-muted-foreground">
            Manage your dessert menu items
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Dessert
        </Button>
      </div>

      {/* Coming Soon Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🍰 Dessert Management</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Dessert management functionality is coming soon. This will include:
          </p>
          <ul className="text-left space-y-2 max-w-md mx-auto">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Create and edit dessert items
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Manage cakes, ice cream, and sweets
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Set serving sizes and pricing
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Upload dessert images
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
