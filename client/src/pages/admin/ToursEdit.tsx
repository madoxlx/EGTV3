import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UnifiedTourForm } from "@/components/admin/UnifiedTourForm";

export default function ToursEdit() {
  const [, setLocation] = useLocation();
  const [tourId, setTourId] = useState<number | null>(null);

  // Get tour ID from URL search params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setTourId(parseInt(id));
    } else {
      setLocation('/admin/tours');
    }
  }, [setLocation]);

  const handleSuccess = () => {
    setLocation('/admin/tours');
  };

  const handleCancel = () => {
    setLocation('/admin/tours');
  };

  return (
    <DashboardLayout location="/admin/tours/edit">
      <UnifiedTourForm
        mode="edit"
        tourId={tourId || undefined}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}