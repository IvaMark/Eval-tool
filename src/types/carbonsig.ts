// CarbonSig Build with AI JSON Types

export interface CarbonSigSystem {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  declaration: string | null;
  allocationRules: string | null;
  cutOffRules: string | null;
  calculationMethodology: string | null;
  systemBoundary: string | null;
  complete: boolean;
  isDataPopulated: boolean;
  convertedStartDate: string;
  convertedEndDate: string;
  unresolvedCommentsCount: number | null;
  siteId: number;
  startDate: string;
  endDate: string;
  locked: boolean;
  declared: boolean;
  systemUuid: string;
  runDuration: number | null;
  comments: string | null;
  processes: Process[];
  connections: Connection[];
}

export interface Process {
  id: number;
  title: string;
  description: string | null;
  siteId: number | null;
  economicCategorizationCategoryId: number;
  economicCategorizationSubcategoryId: number;
  positionX: number;
  positionY: number;
  existingItem: boolean;
  allocationCalculated: boolean;
  notes: string | null;
  approved: boolean;
  totalScopeOne: number | null;
  totalEmbodiedEmissions: number | null;
  isReady: boolean | null;
  inputs: Input[];
  outputs: Output[];
  unspecifiedEmissionGroups: UnspecifiedEmissionGroup[];
  connections: any[];
  processDocuments: any[];
}

export interface Input {
  id: number;
  title: string;
  unit: string;
  designation: string;
  carbonIntensity: number | null;
  totalEmbodiedEmissions: number | null;
  existingItem: boolean;
  referenceLibraryId: number | null;
  conversionRatio: number | null;
  referenceLibraryIdFromRegistry: number | null;
  positionX: number;
  positionY: number;
  inventoryId: number | null;
  linkedOutputId: number | null;
  eacId: number | null;
  amount: number;
  notes: string | null;
  approved: boolean;
  inputType: string | null;
  inputDocuments: any[];
}

export interface Output {
  id: number;
  title: string;
  unit: string;
  existingItem: boolean;
  positionX: number;
  positionY: number;
  distribution: number;
  amount: number;
  notes: string | null;
  approved: boolean;
  carbonIntensity: number | null;
  totalEmbodiedEmissions: number | null;
  verificationStatus: string | null;
  outputUuid: string;
  outputDocuments: any[];
  verification: any | null;
}

export interface UnspecifiedEmissionGroup {
  id: number;
  title: string;
  emissionSource: string;
  calculationSource: string;
  referenceLibraryId: number | null;
  referenceLibraryIdFromRegistry: number | null;
  emissionFactorQuantity: number;
  conversionRatio: number | null;
  unitId: number;
  unitTitle: string;
  positionX: number;
  positionY: number;
  approved: boolean;
  existingItem: boolean;
  carbonIntensity: number | null;
  totalEmbodiedEmissions: number | null;
}

export interface Connection {
  outputId: number;
  processId: number;
  amount: number;
}
