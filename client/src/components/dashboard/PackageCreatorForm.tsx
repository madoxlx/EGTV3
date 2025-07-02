import React from 'react';
import { SimplifiedPackageForm } from './SimplifiedPackageForm';

interface PackageCreatorFormProps {
  packageId?: string;
  onNavigateRequest?: () => void;
}

export type { PackageCreatorFormProps };

export function PackageCreatorForm({ packageId, onNavigateRequest }: PackageCreatorFormProps) {
  return (
    <SimplifiedPackageForm 
      packageId={packageId} 
      onSuccess={onNavigateRequest}
    />
  );
}