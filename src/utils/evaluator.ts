import type {
  CarbonSigSystem,
  Input,
  Output,
  UnspecifiedEmissionGroup,
  Process,
} from '../types/carbonsig';
import type {
  NodeAnalysis,
  UnpopulatedNode,
  MissingField,
  PublicEFItem,
  NodeNotInDescription,
  DescriptionMismatch,
  EvalDimension,
  EvaluationReport,
  EvalScore,
} from '../types/evaluation';
import { EVAL_DIMENSIONS, MINIMUM_THRESHOLDS } from '../types/evaluation';
import { isPublicEF } from './internalEFIds';

export class CarbonSigEvaluator {
  private system: CarbonSigSystem;

  constructor(system: CarbonSigSystem) {
    this.system = system;
  }

  /**
   * Main evaluation method - performs full analysis
   */
  evaluate(): EvaluationReport {
    const nodeAnalysis = this.analyzeNodes();
    const evalDimensions = this.evaluateDimensions(nodeAnalysis);
    const overallScore = this.calculateOverallScore(evalDimensions);
    const productionReady = this.isProductionReady(evalDimensions);
    const summary = this.generateSummary(nodeAnalysis, evalDimensions, productionReady);
    const recommendations = this.generateRecommendations(nodeAnalysis, evalDimensions);

    return {
      systemId: this.system.id,
      systemTitle: this.system.title,
      evaluationDate: new Date().toISOString(),
      nodeAnalysis,
      evalDimensions,
      overallScore,
      productionReady,
      summary,
      recommendations,
    };
  }

  /**
   * Analyze all nodes in the system
   */
  private analyzeNodes(): NodeAnalysis {
    const unpopulatedNodesList: UnpopulatedNode[] = [];
    const missingFieldsList: MissingField[] = [];
    const publicEFList: PublicEFItem[] = [];

    let totalInputs = 0;
    let totalOutputs = 0;
    let totalDirectEmissions = 0;
    let populatedInputs = 0;
    let unpopulatedInputs = 0;
    let populatedOutputs = 0;
    let unpopulatedOutputs = 0;
    let populatedDirectEmissions = 0;
    let unpopulatedDirectEmissions = 0;
    let inputsWithPublicEF = 0;
    let inputsWithoutEF = 0;

    for (const process of this.system.processes) {
      // Analyze Inputs
      for (const input of process.inputs) {
        totalInputs++;
        const isPopulated = this.isInputPopulated(input);

        if (isPopulated) {
          populatedInputs++;
        } else {
          unpopulatedInputs++;
          unpopulatedNodesList.push({
            type: 'input',
            processId: process.id,
            processTitle: process.title,
            nodeId: input.id,
            nodeTitle: input.title,
            reason: this.getUnpopulatedReason(input),
          });
        }

        // Check for missing fields
        const missing = this.getMissingFields(input, 'input');
        if (missing.length > 0) {
          missingFieldsList.push({
            type: 'input',
            processId: process.id,
            processTitle: process.title,
            nodeId: input.id,
            nodeTitle: input.title,
            missingFields: missing,
          });
        }

        // Check for public EF (LCI)
        if (input.referenceLibraryId !== null) {
          let isPublic: boolean;

          // Check if inputAdditionalData.isPublic exists (new structure)
          if (input.inputAdditionalData && input.inputAdditionalData.isPublic !== undefined) {
            // INVERTED LOGIC: isPublic: true means INTERNAL (not public), false means PUBLIC
            isPublic = !input.inputAdditionalData.isPublic;
          } else {
            // Fall back to old method: check against internal ID list
            isPublic = isPublicEF(input.referenceLibraryId);
          }

          // Only count truly public EFs (not internal)
          if (isPublic) {
            inputsWithPublicEF++;
          }

          // Add all EFs to the list with isPublic flag
          publicEFList.push({
            processId: process.id,
            processTitle: process.title,
            inputId: input.id,
            inputTitle: input.title,
            referenceLibraryId: input.referenceLibraryId,
            inputType: input.inputType,
            carbonIntensity: input.carbonIntensity,
            isPublic: isPublic,
          });
        } else {
          inputsWithoutEF++;
        }
      }

      // Analyze Outputs
      for (const output of process.outputs) {
        totalOutputs++;
        const isPopulated = this.isOutputPopulated(output);

        if (isPopulated) {
          populatedOutputs++;
        } else {
          unpopulatedOutputs++;
          unpopulatedNodesList.push({
            type: 'output',
            processId: process.id,
            processTitle: process.title,
            nodeId: output.id,
            nodeTitle: output.title,
            reason: this.getUnpopulatedReasonOutput(output),
          });
        }

        // Check for missing fields
        const missing = this.getMissingFields(output, 'output');
        if (missing.length > 0) {
          missingFieldsList.push({
            type: 'output',
            processId: process.id,
            processTitle: process.title,
            nodeId: output.id,
            nodeTitle: output.title,
            missingFields: missing,
          });
        }
      }

      // Analyze Direct Emissions (unspecifiedEmissionGroups - Scope 1)
      for (const emission of process.unspecifiedEmissionGroups) {
        totalDirectEmissions++;
        const isPopulated = this.isDirectEmissionPopulated(emission);

        if (isPopulated) {
          populatedDirectEmissions++;
        } else {
          unpopulatedDirectEmissions++;
          unpopulatedNodesList.push({
            type: 'directEmission',
            processId: process.id,
            processTitle: process.title,
            nodeId: emission.id,
            nodeTitle: emission.title,
            reason: this.getUnpopulatedReasonEmission(emission),
          });
        }

        // Check for missing fields
        const missing = this.getMissingFields(emission, 'directEmission');
        if (missing.length > 0) {
          missingFieldsList.push({
            type: 'directEmission',
            processId: process.id,
            processTitle: process.title,
            nodeId: emission.id,
            nodeTitle: emission.title,
            missingFields: missing,
          });
        }
      }
    }

    const totalNodes = totalInputs + totalOutputs + totalDirectEmissions;

    // Analyze description alignment
    const descriptionAnalysis = this.analyzeDescriptionAlignment();

    return {
      totalProcesses: this.system.processes.length,
      totalInputs,
      totalOutputs,
      totalDirectEmissions,
      totalNodes,
      populatedInputs,
      unpopulatedInputs,
      populatedOutputs,
      unpopulatedOutputs,
      populatedDirectEmissions,
      unpopulatedDirectEmissions,
      inputsWithPublicEF,
      inputsWithoutEF,
      unpopulatedNodesList,
      missingFieldsList,
      publicEFList,
      nodesNotInDescription: descriptionAnalysis.nodesNotInDescription,
      descriptionMismatches: descriptionAnalysis.descriptionMismatches,
    };
  }

  /**
   * Analyze description alignment - check if nodes are mentioned in description
   * and if amounts/units match what's mentioned
   */
  private analyzeDescriptionAlignment(): {
    nodesNotInDescription: NodeNotInDescription[];
    descriptionMismatches: DescriptionMismatch[];
  } {
    const nodesNotInDescription: NodeNotInDescription[] = [];
    const descriptionMismatches: DescriptionMismatch[] = [];

    const description = (this.system.description || '').toLowerCase();

    if (!description || description.trim().length === 0) {
      // No description to compare against
      return { nodesNotInDescription, descriptionMismatches };
    }

    // Check all nodes against description
    for (const process of this.system.processes) {
      // Check inputs
      for (const input of process.inputs) {
        const titleWords = input.title.toLowerCase().split(/\s+/);
        const keyWords = titleWords.filter(w => w.length > 3); // Filter out short words like "the", "and"

        // Check if any significant word from the title appears in description
        const mentionedInDesc = keyWords.some(word => description.includes(word));

        if (!mentionedInDesc && keyWords.length > 0) {
          nodesNotInDescription.push({
            type: 'input',
            processId: process.id,
            processTitle: process.title,
            nodeId: input.id,
            nodeTitle: input.title,
            reason: 'Not mentioned in system description',
          });
        } else {
          // Check for amount/unit mismatches if mentioned
          const mismatch = this.checkDescriptionMismatch(input, process, description);
          if (mismatch) {
            descriptionMismatches.push(mismatch);
          }
        }
      }

      // Check outputs
      for (const output of process.outputs) {
        const titleWords = output.title.toLowerCase().split(/\s+/);
        const keyWords = titleWords.filter(w => w.length > 3);

        const mentionedInDesc = keyWords.some(word => description.includes(word));

        if (!mentionedInDesc && keyWords.length > 0) {
          nodesNotInDescription.push({
            type: 'output',
            processId: process.id,
            processTitle: process.title,
            nodeId: output.id,
            nodeTitle: output.title,
            reason: 'Not mentioned in system description',
          });
        }
      }

      // Check direct emissions
      for (const emission of process.unspecifiedEmissionGroups) {
        const titleWords = emission.title.toLowerCase().split(/\s+/);
        const keyWords = titleWords.filter(w => w.length > 3);

        const mentionedInDesc = keyWords.some(word => description.includes(word));

        if (!mentionedInDesc && keyWords.length > 0) {
          nodesNotInDescription.push({
            type: 'directEmission',
            processId: process.id,
            processTitle: process.title,
            nodeId: emission.id,
            nodeTitle: emission.title,
            reason: 'Not mentioned in system description',
          });
        }
      }
    }

    return { nodesNotInDescription, descriptionMismatches };
  }

  /**
   * Check if input's amount/unit matches what's in description
   */
  private checkDescriptionMismatch(
    input: Input,
    process: Process,
    description: string
  ): DescriptionMismatch | null {
    // Extract patterns like "1,050 kg limestone" or "250 kg clay"
    const inputName = input.title.toLowerCase();

    // Look for patterns: number + unit + material name
    // Example: "1,050 kg limestone", "80 kg HFO", "110 kWh"
    const pattern = new RegExp(`([\\d,\\.]+)\\s*(kg|kwh|kw|ton|tonne|g|mg|l|m3|m2)\\s+[\\w\\s]*${inputName.split(' ')[0]}`, 'gi');
    const matches = description.match(pattern);

    if (matches && matches.length > 0) {
      const match = matches[0];
      const amountMatch = match.match(/[\d,\.]+/);
      const unitMatch = match.match(/kg|kwh|kw|ton|tonne|g|mg|l|m3|m2/i);

      if (amountMatch && unitMatch) {
        const descAmount = parseFloat(amountMatch[0].replace(/,/g, ''));
        const descUnit = unitMatch[0].toLowerCase();
        const actualUnit = (input.unit || '').toLowerCase();

        // Check unit mismatch
        if (descUnit && actualUnit && descUnit !== actualUnit) {
          return {
            processId: process.id,
            processTitle: process.title,
            nodeId: input.id,
            nodeTitle: input.title,
            field: 'unit',
            expected: descUnit,
            actual: actualUnit,
            descriptionMention: match,
          };
        }

        // Check amount mismatch (allow 10% tolerance)
        if (!isNaN(descAmount) && input.amount !== null) {
          const tolerance = 0.1;
          const diff = Math.abs(descAmount - input.amount) / descAmount;
          if (diff > tolerance) {
            return {
              processId: process.id,
              processTitle: process.title,
              nodeId: input.id,
              nodeTitle: input.title,
              field: 'amount',
              expected: descAmount.toString(),
              actual: input.amount.toString(),
              descriptionMention: match,
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Check if input is populated (has emission factor data)
   */
  private isInputPopulated(input: Input): boolean {
    // An input is populated if it has carbonIntensity and totalEmbodiedEmissions
    return input.carbonIntensity !== null && input.totalEmbodiedEmissions !== null;
  }

  /**
   * Check if output is populated
   */
  private isOutputPopulated(output: Output): boolean {
    // An output is populated if it has carbonIntensity and totalEmbodiedEmissions
    return output.carbonIntensity !== null && output.totalEmbodiedEmissions !== null;
  }

  /**
   * Check if direct emission is populated
   */
  private isDirectEmissionPopulated(emission: UnspecifiedEmissionGroup): boolean {
    // Direct emission is populated if it has carbonIntensity and totalEmbodiedEmissions
    return emission.carbonIntensity !== null && emission.totalEmbodiedEmissions !== null;
  }

  /**
   * Get reason why input is unpopulated
   */
  private getUnpopulatedReason(input: Input): string {
    const reasons: string[] = [];
    if (input.carbonIntensity === null) reasons.push('Missing carbonIntensity');
    if (input.totalEmbodiedEmissions === null) reasons.push('Missing totalEmbodiedEmissions');
    if (input.referenceLibraryId === null) reasons.push('No EF/LCI assigned');
    return reasons.join(', ');
  }

  /**
   * Get reason why output is unpopulated
   */
  private getUnpopulatedReasonOutput(output: Output): string {
    const reasons: string[] = [];
    if (output.carbonIntensity === null) reasons.push('Missing carbonIntensity');
    if (output.totalEmbodiedEmissions === null) reasons.push('Missing totalEmbodiedEmissions');
    return reasons.join(', ');
  }

  /**
   * Get reason why direct emission is unpopulated
   */
  private getUnpopulatedReasonEmission(emission: UnspecifiedEmissionGroup): string {
    const reasons: string[] = [];
    if (emission.carbonIntensity === null) reasons.push('Missing carbonIntensity');
    if (emission.totalEmbodiedEmissions === null) reasons.push('Missing totalEmbodiedEmissions');
    return reasons.join(', ');
  }

  /**
   * Get missing fields for a node
   */
  private getMissingFields(
    node: Input | Output | UnspecifiedEmissionGroup,
    type: 'input' | 'output' | 'directEmission'
  ): string[] {
    const missing: string[] = [];

    // Common fields
    if (!node.title || node.title.trim() === '') missing.push('title');
    if (node.carbonIntensity === null) missing.push('carbonIntensity');
    if (node.totalEmbodiedEmissions === null) missing.push('totalEmbodiedEmissions');

    // Type-specific fields
    if (type === 'input') {
      const input = node as Input;
      if (!input.unit) missing.push('unit');
      if (!input.designation) missing.push('designation');
      if (input.amount === null || input.amount === undefined) missing.push('amount');
      if (input.conversionRatio === null || input.conversionRatio === undefined) missing.push('conversionRatio');
    } else if (type === 'output') {
      const output = node as Output;
      if (!output.unit) missing.push('unit');
      if (output.amount === null || output.amount === undefined) missing.push('amount');
    } else if (type === 'directEmission') {
      const emission = node as UnspecifiedEmissionGroup;
      if (!emission.emissionSource) missing.push('emissionSource');
      if (emission.emissionFactorQuantity === null || emission.emissionFactorQuantity === undefined) {
        missing.push('emissionFactorQuantity');
      }
      if (emission.conversionRatio === null || emission.conversionRatio === undefined) {
        missing.push('conversionRatio');
      }
    }

    return missing;
  }

  /**
   * Evaluate D1, D2, D3, D7, D8 criteria (D4, D5, D6 removed)
   */
  private evaluateDimensions(nodeAnalysis: NodeAnalysis): EvalDimension[] {
    return [
      this.evaluateD1(),
      this.evaluateD2(nodeAnalysis),
      this.evaluateD3(nodeAnalysis),
      this.evaluateD7(nodeAnalysis),
      this.evaluateD8(),
    ];
  }

  /**
   * D1 - Output Format Accuracy
   */
  private evaluateD1(): EvalDimension {
    let score: EvalScore = 5;
    const details: string[] = [];

    // Check if JSON is valid (already parsed, so it's valid)
    details.push('✓ Valid JSON format');

    // Check required top-level fields
    const requiredFields = ['id', 'title', 'processes'];
    for (const field of requiredFields) {
      if (!(field in this.system)) {
        score = 1;
        details.push(`✗ Missing required field: ${field}`);
      }
    }

    // Check processes structure
    if (!Array.isArray(this.system.processes)) {
      score = 1;
      details.push('✗ processes must be an array');
    } else {
      details.push(`✓ Valid processes array (${this.system.processes.length} processes)`);
    }

    // Check that IDs are integers
    const allIds = [
      this.system.id,
      ...this.system.processes.map(p => p.id),
      ...this.system.processes.flatMap(p => p.inputs.map(i => i.id)),
      ...this.system.processes.flatMap(p => p.outputs.map(o => o.id)),
    ];

    const nonIntegerIds = allIds.filter(id => !Number.isInteger(id));
    if (nonIntegerIds.length > 0) {
      score = Math.min(score, 3) as EvalScore;
      details.push(`⚠ Found ${nonIntegerIds.length} non-integer IDs`);
    } else {
      details.push('✓ All IDs are integers');
    }

    return {
      dimension: EVAL_DIMENSIONS.D1.dimension,
      code: EVAL_DIMENSIONS.D1.code,
      description: EVAL_DIMENSIONS.D1.description,
      targetScore: EVAL_DIMENSIONS.D1.targetScore,
      actualScore: score,
      details: details.join('\n'),
      passed: score >= EVAL_DIMENSIONS.D1.minScore,
    };
  }

  /**
   * D2 - Semantic Correctness
   */
  private evaluateD2(nodeAnalysis: NodeAnalysis): EvalDimension {
    let score: EvalScore = 4;
    const details: string[] = [];

    // Check if inputs have appropriate LCI/EF
    const inputsWithEF = nodeAnalysis.inputsWithPublicEF;
    const totalInputs = nodeAnalysis.totalInputs;

    if (totalInputs > 0) {
      const efCoverage = (inputsWithEF / totalInputs) * 100;
      details.push(`EF coverage: ${efCoverage.toFixed(1)}% (${inputsWithEF}/${totalInputs} inputs)`);

      if (efCoverage >= 80) {
        details.push('✓ Good EF coverage');
      } else if (efCoverage >= 50) {
        score = 3;
        details.push('⚠ Moderate EF coverage');
      } else {
        score = 2;
        details.push('✗ Low EF coverage');
      }
    }

    // Check if process titles are meaningful
    const processes = this.system.processes;
    if (processes.length > 0) {
      details.push(`✓ ${processes.length} processes defined`);
    }

    return {
      dimension: EVAL_DIMENSIONS.D2.dimension,
      code: EVAL_DIMENSIONS.D2.code,
      description: EVAL_DIMENSIONS.D2.description,
      targetScore: EVAL_DIMENSIONS.D2.targetScore,
      actualScore: score,
      details: details.join('\n'),
      passed: score >= MINIMUM_THRESHOLDS.D1_D3_MIN,
    };
  }

  /**
   * D3 - Description Alignment & Completeness (Combined with old D4)
   * Checks if inputs match description (amounts, units) and overall completeness
   */
  private evaluateD3(nodeAnalysis: NodeAnalysis): EvalDimension {
    let score: EvalScore = 5;
    const details: string[] = [];

    // 1. Completeness check
    const totalNodes = nodeAnalysis.totalNodes;
    const unpopulatedTotal =
      nodeAnalysis.unpopulatedInputs +
      nodeAnalysis.unpopulatedOutputs +
      nodeAnalysis.unpopulatedDirectEmissions;

    const completeness = totalNodes > 0 ? ((totalNodes - unpopulatedTotal) / totalNodes) * 100 : 100;

    details.push(`Overall completeness: ${completeness.toFixed(1)}%`);
    details.push(`Unpopulated nodes: ${unpopulatedTotal}/${totalNodes}`);

    // 2. Description alignment check
    const mismatches = nodeAnalysis.descriptionMismatches.length;
    if (mismatches > 0) {
      details.push(`\n⚠ Description mismatches found: ${mismatches}`);
      for (const mismatch of nodeAnalysis.descriptionMismatches.slice(0, 5)) {
        details.push(`  • ${mismatch.nodeTitle}: ${mismatch.field} (expected: ${mismatch.expected}, actual: ${mismatch.actual})`);
      }
      if (nodeAnalysis.descriptionMismatches.length > 5) {
        details.push(`  ... and ${nodeAnalysis.descriptionMismatches.length - 5} more`);
      }
      score = Math.min(score, 3) as EvalScore;
    } else {
      details.push('\n✓ All inputs align with description');
    }

    // 3. Score based on completeness
    if (completeness >= 95 && mismatches === 0) {
      score = Math.min(score, 5) as EvalScore;
      details.push('✓ Excellent completeness and alignment');
    } else if (completeness >= 80 && mismatches <= 2) {
      score = Math.min(score, 4) as EvalScore;
      details.push('✓ Good completeness with minor issues');
    } else if (completeness >= 60) {
      score = Math.min(score, 3) as EvalScore;
      details.push('⚠ Acceptable completeness');
    } else if (completeness >= 40) {
      score = Math.min(score, 2) as EvalScore;
      details.push('✗ Poor completeness');
    } else {
      score = 1;
      details.push('✗ Very poor completeness');
    }

    return {
      dimension: EVAL_DIMENSIONS.D3.dimension,
      code: EVAL_DIMENSIONS.D3.code,
      description: EVAL_DIMENSIONS.D3.description,
      targetScore: EVAL_DIMENSIONS.D3.targetScore,
      actualScore: score,
      details: details.join('\n'),
      passed: score >= MINIMUM_THRESHOLDS.D1_D3_MIN,
    };
  }

  /**
   * D7 - Hallucination Control (Updated)
   * Flags nodes (inputs/outputs/emissions) NOT mentioned in description
   */
  private evaluateD7(nodeAnalysis: NodeAnalysis): EvalDimension {
    let score: EvalScore = 5;
    const details: string[] = [];

    // 1. Check for nodes not mentioned in description
    const nodesNotInDesc = nodeAnalysis.nodesNotInDescription.length;
    const totalNodes = nodeAnalysis.totalNodes;

    if (nodesNotInDesc === 0) {
      details.push('✓ All nodes are mentioned in description');
      score = 5;
    } else {
      const percentage = (nodesNotInDesc / totalNodes) * 100;
      details.push(`⚠ Nodes NOT in description: ${nodesNotInDesc}/${totalNodes} (${percentage.toFixed(1)}%)`);

      // Show first 5 examples
      for (const node of nodeAnalysis.nodesNotInDescription.slice(0, 5)) {
        details.push(`  • ${node.type}: ${node.nodeTitle} (Process: ${node.processTitle})`);
      }
      if (nodeAnalysis.nodesNotInDescription.length > 5) {
        details.push(`  ... and ${nodeAnalysis.nodesNotInDescription.length - 5} more`);
      }

      // Score based on percentage of hallucinated nodes
      if (percentage <= 10) {
        score = 4;
        details.push('⚠ Minor hallucinations detected');
      } else if (percentage <= 25) {
        score = 3;
        details.push('⚠ Moderate hallucinations detected');
      } else if (percentage <= 50) {
        score = 2;
        details.push('✗ Significant hallucinations detected');
      } else {
        score = 1;
        details.push('✗ Severe hallucinations detected');
      }
    }

    // 2. Check for suspiciously invalid values
    const suspiciousValues: string[] = [];
    for (const process of this.system.processes) {
      for (const input of process.inputs) {
        if (input.carbonIntensity !== null && input.carbonIntensity < 0) {
          suspiciousValues.push(`${input.title}: negative carbonIntensity`);
        }
        if (input.amount !== null && input.amount < 0) {
          suspiciousValues.push(`${input.title}: negative amount`);
        }
      }
    }

    if (suspiciousValues.length > 0) {
      score = Math.min(score, 2) as EvalScore;
      details.push(`\n✗ Found ${suspiciousValues.length} suspicious values:`);
      details.push(...suspiciousValues.slice(0, 3));
    }

    return {
      dimension: EVAL_DIMENSIONS.D7.dimension,
      code: EVAL_DIMENSIONS.D7.code,
      description: EVAL_DIMENSIONS.D7.description,
      targetScore: EVAL_DIMENSIONS.D7.targetScore,
      actualScore: score,
      details: details.join('\n'),
      passed: score >= MINIMUM_THRESHOLDS.D7_MIN,
    };
  }

  /**
   * D8 - Language & Input Robustness
   */
  private evaluateD8(): EvalDimension {
    let score: EvalScore = 5;
    const details: string[] = [];

    // Check if special characters are preserved
    const allTitles = [
      this.system.title,
      ...this.system.processes.map(p => p.title),
      ...this.system.processes.flatMap(p => [
        ...p.inputs.map(i => i.title),
        ...p.outputs.map(o => o.title),
        ...p.unspecifiedEmissionGroups.map(e => e.title),
      ]),
    ].filter(Boolean);

    const hasSpecialChars = allTitles.some(title =>
      /[^\x00-\x7F]/.test(title) || // Non-ASCII
      /[àáâãäåèéêëìíîïòóôõöùúûüýÿñç]/i.test(title) // Accented
    );

    if (hasSpecialChars) {
      details.push('✓ Special characters detected and preserved');
    } else {
      details.push('○ No special characters to test (ASCII only)');
    }

    details.push('Full Unicode/multilingual testing requires specific test cases');

    return {
      dimension: EVAL_DIMENSIONS.D8.dimension,
      code: EVAL_DIMENSIONS.D8.code,
      description: EVAL_DIMENSIONS.D8.description,
      targetScore: EVAL_DIMENSIONS.D8.targetScore,
      actualScore: score,
      details: details.join('\n'),
      passed: score >= MINIMUM_THRESHOLDS.D1_D3_MIN,
    };
  }

  /**
   * Calculate overall score (average of all dimensions)
   */
  private calculateOverallScore(evalDimensions: EvalDimension[]): number {
    const sum = evalDimensions.reduce((acc, dim) => acc + dim.actualScore, 0);
    return Math.round((sum / evalDimensions.length) * 10) / 10;
  }

  /**
   * Check if system is production ready based on minimum thresholds
   */
  private isProductionReady(evalDimensions: EvalDimension[]): boolean {
    // All dimensions must pass their minimum thresholds
    return evalDimensions.every(dim => dim.passed);
  }

  /**
   * Generate summary text
   */
  private generateSummary(
    nodeAnalysis: NodeAnalysis,
    _evalDimensions: EvalDimension[],
    productionReady: boolean
  ): string {
    const lines: string[] = [];

    lines.push(`System: ${this.system.title}`);
    lines.push(`Processes: ${nodeAnalysis.totalProcesses}`);
    lines.push(`Total Nodes: ${nodeAnalysis.totalNodes} (${nodeAnalysis.totalInputs} inputs, ${nodeAnalysis.totalOutputs} outputs, ${nodeAnalysis.totalDirectEmissions} direct emissions)`);

    const unpopulatedTotal =
      nodeAnalysis.unpopulatedInputs +
      nodeAnalysis.unpopulatedOutputs +
      nodeAnalysis.unpopulatedDirectEmissions;

    lines.push(`Populated Nodes: ${nodeAnalysis.totalNodes - unpopulatedTotal}/${nodeAnalysis.totalNodes} (${((1 - unpopulatedTotal / nodeAnalysis.totalNodes) * 100).toFixed(1)}%)`);
    lines.push(`Inputs with Public EF: ${nodeAnalysis.inputsWithPublicEF}/${nodeAnalysis.totalInputs} (${((nodeAnalysis.inputsWithPublicEF / nodeAnalysis.totalInputs) * 100).toFixed(1)}%)`);
    lines.push('');
    lines.push(`Production Ready: ${productionReady ? '✓ YES' : '✗ NO'}`);

    return lines.join('\n');
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    nodeAnalysis: NodeAnalysis,
    evalDimensions: EvalDimension[]
  ): string[] {
    const recommendations: string[] = [];

    // Check unpopulated nodes
    if (nodeAnalysis.unpopulatedInputs > 0) {
      recommendations.push(`Populate ${nodeAnalysis.unpopulatedInputs} unpopulated inputs with emission factors`);
    }
    if (nodeAnalysis.unpopulatedOutputs > 0) {
      recommendations.push(`Calculate carbon intensity for ${nodeAnalysis.unpopulatedOutputs} outputs`);
    }
    if (nodeAnalysis.unpopulatedDirectEmissions > 0) {
      recommendations.push(`Complete ${nodeAnalysis.unpopulatedDirectEmissions} direct emission entries`);
    }

    // Check missing fields
    if (nodeAnalysis.missingFieldsList.length > 0) {
      recommendations.push(`Fill in missing fields for ${nodeAnalysis.missingFieldsList.length} nodes`);
    }

    // Check failing dimensions
    for (const dim of evalDimensions) {
      if (!dim.passed) {
        recommendations.push(`Improve ${dim.code} (${dim.dimension}) - currently at ${dim.actualScore}, needs ${dim.code === 'D1' ? '5' : '>=3'}`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('System meets all evaluation criteria!');
    }

    return recommendations;
  }
}
