import { Suspense } from "react";
import { PizzaMenuContent } from "@/modules/pizza-management";

export default async function PizzaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <div className="h-10 bg-gray-200 rounded w-64 mx-auto animate-pulse mb-2" />
              <div className="h-4 bg-gray-100 rounded w-96 mx-auto animate-pulse mb-6" />
              <div className="flex justify-between items-center">
                <div className="h-10 bg-gray-200 rounded w-64 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-lg shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-20" />
                      <div className="h-6 bg-gray-200 rounded w-24" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-8 bg-gray-200 rounded w-24" />
                      <div className="h-10 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <PizzaMenuContent />
    </Suspense>
  );
}
