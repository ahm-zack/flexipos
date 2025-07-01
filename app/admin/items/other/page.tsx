import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function OtherItemsManagementPage() {
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
            Other Items Management
          </h1>
          <p className="text-muted-foreground">
            Manage miscellaneous menu items
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Coming Soon Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🍽️ Other Items Management</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Other items management functionality is coming soon. This will
            include:
          </p>
          <ul className="text-left space-y-2 max-w-md mx-auto">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Create and edit miscellaneous items
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Manage special dishes and combos
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Set custom pricing and availability
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Upload item images
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
