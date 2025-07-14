import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TestCategories() {
  const [selectedCategory, setSelectedCategory] = React.useState("");
  
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["/api/tour-categories"],
    queryFn: async () => {
      const response = await fetch("/api/tour-categories");
      if (!response.ok) {
        throw new Error("Failed to fetch tour categories");
      }
      const data = await response.json();
      console.log("Test page - Tour categories fetched:", data);
      return data;
    },
  });

  React.useEffect(() => {
    console.log("Test page - Categories state:", {
      isLoading,
      error,
      data: categories,
      selectedCategory
    });
  }, [isLoading, error, categories, selectedCategory]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tour Categories Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Raw Data:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify({ isLoading, error: error?.message, data: categories }, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Dropdown Test:</h2>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : error ? (
                <SelectItem value="error" disabled>Error: {error.message}</SelectItem>
              ) : categories && categories.length > 0 ? (
                categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled>No categories found</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Selected Category:</h2>
          <p>{selectedCategory || "None selected"}</p>
        </div>
      </div>
    </div>
  );
}