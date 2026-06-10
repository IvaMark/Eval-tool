// Evaluation Criteria Types based on the AI Prompt Evaluation document

export type EvalScore = 1 | 2 | 3 | 4 | 5;

export interface EvalDimension {
  dimension: string;
  code: string;
  description: string;
  targetScore: number;
  actualScore: EvalScore;
  details: string;
  passed: boolean;
}

export interface NodeAnalysis {
  totalProcesses: number;
  totalInputs: number;
  totalOutputs: number;
  totalDirectEmissions: number; // unspecifiedEmissionGroups (Scope 1)
  totalNodes: number;

  populatedInputs: number;
  unpopulatedInputs: number;
  populatedOutputs: number;
  unpopulatedOutputs: number;
  populatedDirectEmissions: number;
  unpopulatedDirectEmissions: number;

  inputsWithEF: number; // Inputs with referenceLibraryId (any EF)
  directEmissionsWithEF: number; // Direct emissions with referenceLibraryId
  inputsWithPublicEF: number; // For the public EF table

  unpopulatedNodesList: UnpopulatedNode[];
  missingFieldsList: MissingField[];
  publicEFList: PublicEFItem[];
  nodesNotInDescription: NodeNotInDescription[];
  descriptionMismatches: DescriptionMismatch[];
}

export interface NodeNotInDescription {
  type: 'input' | 'output' | 'directEmission';
  processId: number;
  processTitle: string;
  nodeId: number;
  nodeTitle: string;
  reason: string;
}

export interface DescriptionMismatch {
  processId: number;
  processTitle: string;
  nodeId: number;
  nodeTitle: string;
  field: string;
  expected: string;
  actual: string;
  descriptionMention: string;
}

export interface UnpopulatedNode {
  type: 'input' | 'output' | 'directEmission';
  processId: number;
  processTitle: string;
  nodeId: number;
  nodeTitle: string;
  reason: string;
}

export interface MissingField {
  type: 'input' | 'output' | 'directEmission';
  processId: number;
  processTitle: string;
  nodeId: number;
  nodeTitle: string;
  missingFields: string[];
}

export interface PublicEFItem {
  processId: number;
  processTitle: string;
  inputId: number;
  inputTitle: string;
  referenceLibraryId: number | null;
  inputType: string | null;
  carbonIntensity: number | null;
  isPublic: boolean; // true if referenceLibraryId is NOT in internal EF list
}

export interface EvaluationReport {
  systemId: number;
  systemTitle: string;
  evaluationDate: string;

  // Node Analysis
  nodeAnalysis: NodeAnalysis;

  // D1-D8 Criteria Scores
  evalDimensions: EvalDimension[];

  // Overall Assessment
  overallScore: number;
  productionReady: boolean;
  summary: string;
  recommendations: string[];
}

export const EVAL_DIMENSIONS = {
  D1: {
    code: 'D1',
    dimension: 'Output Format Accuracy',
    description: 'The response matches the exact output format required (valid JSON, correct fields, proper structure)',
    targetScore: 5,
    minScore: 5, // Must be 5 for JSON consumed by API
  },
  D2: {
    code: 'D2',
    dimension: 'Semantic Correctness',
    description: 'AI-selected or generated values are semantically meaningful and aligned with input context',
    targetScore: 4,
  },
  D3: {
    code: 'D3',
    dimension: 'Description Alignment & Completeness',
    description: 'Inputs match the description (amounts, units). All nodes mentioned in description are present with correct values.',
    targetScore: 5,
  },
  D7: {
    code: 'D7',
    dimension: 'Hallucination Control',
    description: 'Flags nodes (inputs/outputs/emissions) that are NOT mentioned in the system description. No invented data.',
    targetScore: 4,
    minScore: 4, // Must be >= 4 for emissions data
  },
  D8: {
    code: 'D8',
    dimension: 'Language & Input Robustness',
    description: 'Handles multilingual titles, special characters, Unicode, accented letters without corruption',
    targetScore: 5,
  },
};

export const MINIMUM_THRESHOLDS = {
  D1_D3_MIN: 3, // D1-D3 must all be >= 3
  D7_MIN: 4,    // D7 must be >= 4 for emissions data
  D1_JSON_MIN: 5, // D1 must be 5 for JSON consumed by API
};
