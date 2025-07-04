import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UnifiedTourForm } from "@/components/admin/UnifiedTourForm";

export default function ToursCreate() {
  const [, setLocation] = useLocation();

  const handleSuccess = () => {
    setLocation('/admin/tours');
  };

  const handleCancel = () => {
    setLocation('/admin/tours');
  };

  return (
    <DashboardLayout location="/admin/tours/create">
      <UnifiedTourForm
        mode="create"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}