import React from "react";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { useLanguage } from "@/hooks/use-language";

export default function TourCategoriesPage() {
  const { t } = useLanguage();
  
  return (
    <CategoryManager
      title={t('admin.tour_categories.title', 'Tour Categories')}
      description={t('admin.tour_categories.description', 'Create and manage categories for your tours')}
      categoryType="tour"
      apiEndpoint="/api/tour-categories"
    />
  );
}