import React from "react";
import IncludedTours from "./IncludedTours";

type Package = {
  id: number;
  selectedTourId?: number | null;
  tourSelection?: string | null;
  includedFeatures?: string[] | null;
  inclusions?: string[] | null;
};

interface OptionalToursProps {
  packageData: Package;
}

export default function OptionalTours({ packageData }: OptionalToursProps) {
  return <IncludedTours packageData={packageData} showAsOptional={true} />;
}