# 🎯 Evaluation Criteria Redesign

## Summary

Redesigned the evaluation dimensions based on new requirements:
- **Combined D3 & D4** into single "Description Alignment & Completeness" dimension
- **Removed D5 & D6** (Consistency and Token Efficiency)
- **Updated D7** to flag nodes NOT mentioned in description
- **Kept D1, D2, D8** unchanged

## New Evaluation Structure

### D1 - Output Format Accuracy (Unchanged)
**Target**: 5/5

Validates JSON structure and format:
- ✓ Valid JSON format
- ✓ Required fields present (id, title, processes)
- ✓ All IDs are integers

### D2 - Semantic Correctness (Unchanged)
**Target**: 4/5

Checks semantic appropriateness:
- EF coverage: 80%+ = score 4, 50-80% = score 3, <50% = score 2
- Process definitions

### D3 - Description Alignment & Completeness (NEW - Combined D3+D4)
**Target**: 5/5

**Checks two things:**

#### 1. Completeness
- Counts unpopulated nodes (missing carbonIntensity, totalEmbodiedEmissions)
- Calculates overall completeness percentage

#### 2. Description Alignment
- **Parses system description** to extract materials with amounts and units
- **Checks if inputs match** what's mentioned in description
- **Validates amounts and units** align (10% tolerance for amounts)
- **Flags mismatches** between description and actual values

**Example:**

Description says: `"1,050 kg limestone + 250 kg clay"`

- ✅ Input "Limestone" with amount=1050, unit="KG" → **Match**
- ❌ Input "Limestone" with amount=1000, unit="KG" → **Mismatch** (amount)
- ❌ Input "Limestone" with amount=1050, unit="TON" → **Mismatch** (unit)

**Scoring:**
- 5: ≥95% complete + no mismatches
- 4: ≥80% complete + ≤2 mismatches
- 3: ≥60% complete
- 2: ≥40% complete
- 1: <40% complete

### ~~D4 - Removed~~
### ~~D5 - Removed~~
### ~~D6 - Removed~~

### D7 - Hallucination Control (UPDATED)
**Target**: 4/5

**Flags nodes NOT mentioned in description:**

- Checks if node titles (inputs/outputs/emissions) appear in system description
- Uses keyword matching (filters words >3 characters to avoid false positives)
- Flags nodes that don't appear in description as potential hallucinations

**Also checks:**
- Suspicious values (negative carbonIntensity, negative amounts)

**Scoring:**
- 5: All nodes mentioned in description, no suspicious values
- 4: ≤10% nodes not in description
- 3: 10-25% nodes not in description
- 2: 25-50% nodes not in description
- 1: >50% nodes not in description

**Example:**

Description mentions: `"limestone, clay, gypsum, electricity"`

- ✅ Input "Limestone" → **Found** in description
- ✅ Input "Clay" → **Found** in description
- ❌ Input "Iron Ore" → **NOT found** → Flagged as potential hallucination

### D8 - Language & Input Robustness (Unchanged)
**Target**: 5/5

Handles multilingual titles, special characters, Unicode, accented letters.

## Technical Implementation

### New Helper Methods

**`analyzeDescriptionAlignment()`**
- Parses system description text
- Extracts material names, amounts, units using regex
- Compares against actual inputs
- Returns lists of:
  - `nodesNotInDescription[]` - Nodes not mentioned
  - `descriptionMismatches[]` - Amount/unit mismatches

**`checkDescriptionMismatch()`**
- Looks for patterns like: `"1,050 kg limestone"`, `"80 kg HFO"`, `"110 kWh"`
- Extracts: amount, unit, material name
- Compares with actual input values
- Allows 10% tolerance for amounts

### Regex Patterns Used

```typescript
// Pattern: number + unit + material name
// Examples: "1,050 kg limestone", "80 kg HFO", "110 kWh electricity"
const pattern = /([\\d,\\.]+)\\s*(kg|kwh|kw|ton|tonne|g|mg|l|m3|m2)\\s+[\\w\\s]*${materialName}/gi
```

### Keyword Matching

```typescript
// Extract significant words from node title
const titleWords = input.title.toLowerCase().split(/\\s+/);
const keyWords = titleWords.filter(w => w.length > 3);

// Check if any keyword appears in description
const mentionedInDesc = keyWords.some(word => description.includes(word));
```

## Updated Types

### NodeAnalysis Interface

Added two new fields:

```typescript
export interface NodeAnalysis {
  // ... existing fields ...
  nodesNotInDescription: NodeNotInDescription[];
  descriptionMismatches: DescriptionMismatch[];
}
```

### New Type Definitions

```typescript
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
  field: string;           // 'unit' or 'amount'
  expected: string;        // What's in description
  actual: string;          // What's in input
  descriptionMention: string;  // The matched text from description
}
```

## Production Ready Thresholds

**Updated minimum thresholds:**

```typescript
export const MINIMUM_THRESHOLDS = {
  D1_D3_MIN: 3,     // D1-D3 must all be >= 3 (was D1-D5)
  D7_MIN: 4,        // D7 must be >= 4 for emissions data
  D1_JSON_MIN: 5,   // D1 must be 5 for JSON consumed by API
};
```

A system is production-ready when:
- ✅ D1 = 5 (perfect JSON)
- ✅ D2, D3 ≥ 3
- ✅ D7 ≥ 4
- ✅ D8 ≥ 3

## Benefits

### 1. More Accurate Validation
- Actually reads and understands the description
- Catches mismatches between documentation and data
- Identifies hallucinated inputs not mentioned in description

### 2. Better Feedback
Users see:
- Which amounts/units don't match description
- Which nodes aren't mentioned in description
- Specific examples of mismatches

### 3. Simplified Criteria
- Removed dimensions that couldn't be automatically evaluated (D5, D6)
- Combined related checks (D3+D4)
- Focused on what matters: accuracy and alignment

## Limitations

### 1. Natural Language Parsing
- Uses simple regex patterns, not full NLP
- May miss complex phrasings
- Case-sensitive matching (mitigated by lowercase conversion)

### 2. Keyword Matching
- Filters words >3 characters to reduce false positives
- May miss short but important terms
- "HFO" vs "heavy fuel oil" may not match

### 3. Tolerance Settings
- 10% tolerance for amounts (hardcoded)
- Could be made configurable

## Example Evaluation Results

### Saudi Arabia Cement Plant

**D3 - Description Alignment & Completeness**: 4/5
```
Overall completeness: 85.2%
Unpopulated nodes: 5/34

✓ All inputs align with description

Description mismatches found: 0

✓ Good completeness with minor issues
```

**D7 - Hallucination Control**: 4/5
```
⚠ Nodes NOT in description: 3/34 (8.8%)
  • input: Natural Pozzolan (Process: Clinker Production)
  • input: GGBS (Process: Cement Grinding)
  • output: Clinker (Process: Clinker Production)
  ...

⚠ Minor hallucinations detected
```

## Testing

To test the new criteria:

1. **Upload a JSON** with system description
2. **Check D3 scores** for completeness and alignment
3. **Check D7 scores** for hallucinations
4. **Review tables** showing:
   - Description mismatches (D3)
   - Nodes not in description (D7)

---

**Updated**: 2026-06-09
**Version**: v2.0.0
**Files Modified**:
- `src/types/evaluation.ts` - Updated dimension definitions
- `src/utils/evaluator.ts` - Implemented new logic
