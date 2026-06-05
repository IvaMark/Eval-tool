# CarbonSig Build with AI - Evaluation Tool

A comprehensive evaluation dashboard for analyzing JSON outputs from CarbonSig's "Build with AI" feature.

## Features

### 📊 Complete Node Analysis
- **Calculate** how many nodes are populated vs unpopulated
- **Flag** nodes that lack emission data (carbonIntensity, totalEmbodiedEmissions)
- **Identify** missing fields in inputs, outputs, and direct emissions
- **Detect** inputs with public emission factors (EFs/LCI)

### 📋 D1-D8 Evaluation Criteria
Based on the official "AI Prompt Evaluation Criteria & Test Cases" document:

- **D1 - Output Format Accuracy**: Valid JSON, correct structure, integer IDs
- **D2 - Semantic Correctness**: Appropriate LCI/EF assignments
- **D3 - Completeness**: All required fields populated
- **D4 - Boundary & Edge Case Handling**: Graceful degradation
- **D5 - Consistency**: Stable outputs across runs
- **D6 - Latency & Token Efficiency**: Optimized token usage
- **D7 - Hallucination Control**: No fabricated values
- **D8 - Language & Input Robustness**: Unicode/special character handling

### 📈 Visual Reports
- Interactive charts showing population status
- Color-coded dimension scores
- Production-ready assessment
- Exportable JSON and text reports

## Installation

```bash
# Navigate to project directory
cd /Users/ivanamedojevic/Desktop/Projects/build-ai-eval-tool

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

## Usage

1. **Upload JSON**: Drag and drop or click to upload your Build with AI JSON file
2. **View Results**: Instantly see evaluation results with:
   - Overall score and production-ready status
   - Node analysis with charts
   - D1-D8 dimension scores
   - Detailed tables for unpopulated nodes, missing fields, and public EFs
3. **Export Reports**: Download JSON or text format reports

## JSON Structure Expected

The tool expects JSON files with this structure:

```json
{
  "id": 6151,
  "title": "System Title",
  "processes": [
    {
      "id": 31684,
      "title": "Process Name",
      "inputs": [...],
      "outputs": [...],
      "unspecifiedEmissionGroups": [...]
    }
  ],
  "connections": [...]
}
```

### Key Terminology
- **LCI** = Emission Factor (EF)
- **unspecifiedEmissionGroups** = Direct Emissions (Scope 1)
- **referenceLibraryId** = Public EF indicator
- **inputType: "Reference Emission Factors"** = Public EF

## Production Ready Thresholds

A system is considered production-ready when:
- All D1-D5 dimensions score ≥ 3
- D1 (Format) scores 5 (perfect JSON)
- D7 (Hallucination) scores ≥ 4

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Recharts** for data visualization
- **CSS Modules** for styling

## File Structure

```
src/
├── components/          # React components
│   ├── FileUpload.tsx
│   ├── EvaluationResults.tsx
│   ├── NodeAnalysisSection.tsx
│   ├── EvalDimensionsSection.tsx
│   ├── UnpopulatedNodesTable.tsx
│   ├── MissingFieldsTable.tsx
│   └── PublicEFTable.tsx
├── types/               # TypeScript definitions
│   ├── carbonsig.ts
│   └── evaluation.ts
├── utils/               # Core logic
│   └── evaluator.ts     # Main evaluation engine
├── App.tsx
└── main.tsx
```

## Example Analysis

Given a Saudi Arabia Cement system JSON:

**Node Analysis:**
- 5 Processes
- 22 Total Nodes (18 inputs, 5 outputs, 2 direct emissions)
- 13 inputs with public EFs
- 5 unpopulated outputs flagged

**Dimension Scores:**
- D1 (Format): 5/5 ✓
- D2 (Semantic): 4/5 ✓
- D3 (Completeness): 3/5 ✓
- D7 (Hallucination): 4/5 ✓

**Result:** Production Ready with recommendations to populate remaining outputs.

## Public EF Detection

The tool uses an explicit list of **40,742 internal emission factor IDs** (range 0-96,576) extracted from the `id_from_env` column of the development SQL database to accurately classify public vs internal EFs.

### How It Works
- **Internal EFs**: IDs present in `src/utils/internalEFIds.ts` (from `id_from_env` column)
- **Public EFs**: IDs NOT in the internal list (or null referenceLibraryId)

### Key Statistics
- **Total internal IDs**: 40,742
- **ID range**: 0 - 96,576
- **SQL column used**: `id_from_env` (NOT database primary key `id`)
- **Gaps in sequence**: 55,835 (57.81% of range)
- **Major gap**: 46,806 - 57,121 to 67,158 (10,036 IDs)

### Regenerating the ID List

If the SQL database is updated, regenerate using:

```bash
cd /Users/ivanamedojevic/Desktop/Projects/Eval\ docs\ for\ testing
node generateInternalEFIds.js
cd ../build-ai-eval-tool
npm run build
```

See `IMPLEMENTATION_NOTES.md` in the Eval docs folder for detailed documentation.

## Version

v1.1.1 - June 2026 (Fixed: Now correctly uses `id_from_env` column from SQL)

## Author

Created for CarbonSig by CarbonMetrix

## License

© 2026 CarbonMetrix. All rights reserved.
