import React from "react";
import { useParams } from "wouter";
import MultiHotelManualPackageForm from "@/components/dashboard/MultiHotelManualPackageForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditManualPackage() {
  const { id } = useParams<{ id: string }>();
  const packageId = id ? parseInt(id) : undefined;

  if (!packageId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Invalid package ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Manual Package</CardTitle>
          <p className="text-muted-foreground">
            Update manual package details, hotels, and room configurations
          </p>
        </CardHeader>
      </Card>
      
      <MultiHotelManualPackageForm 
        isEditMode={true}
        packageId={packageId}
      />
    </div>
  );
}