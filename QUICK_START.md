# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies (if not already done)
```bash
cd /Users/ivanamedojevic/Desktop/Projects/build-ai-eval-tool
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at: `http://localhost:5173`

### 3. Test with Sample Data

Use your Saudi Arabia Cement system JSON file:
- Located at: `/Users/ivanamedojevic/Desktop/Saudi Arabia Cement system.rtf`
- You'll need to extract the JSON from the RTF file first

Or use any other Build with AI JSON output from CarbonSig.

## 📤 Upload & Analyze

1. Open the browser at `http://localhost:5173`
2. Drag and drop your JSON file into the upload area
3. View instant analysis:
   - Node population statistics
   - Public EF detection
   - D1-D8 dimension scores
   - Production-ready assessment

## 📥 Export Reports

Click the download buttons to export:
- **Download JSON**: Full evaluation report in JSON format
- **Download Report**: Human-readable text report

## 🔍 What Gets Analyzed

### Node Analysis
- ✅ Total processes, inputs, outputs, direct emissions
- ✅ Populated vs unpopulated nodes
- ✅ Inputs with public EFs (referenceLibraryId present)
- ✅ Missing fields detection

### D1-D8 Criteria (from your evaluation document)
- **D1**: JSON format validation
- **D2**: Semantic correctness (EF coverage)
- **D3**: Completeness (population rate)
- **D4**: Edge case handling (manual testing)
- **D5**: Consistency (multiple run comparison)
- **D6**: Token efficiency
- **D7**: Hallucination control
- **D8**: Unicode/special character handling

### Production Ready Check
System passes if:
- D1-D5 all score ≥ 3
- D1 = 5 (perfect JSON)
- D7 ≥ 4 (no hallucinations)

## 🛠️ Build for Production

```bash
npm run build
npm run preview
```

## 💡 Tips

1. **Unpopulated Nodes**: These have `null` values for `carbonIntensity` or `totalEmbodiedEmissions`
2. **Public EFs**: Identified by presence of `referenceLibraryId` field
3. **Direct Emissions**: Found in `unspecifiedEmissionGroups` (Scope 1 emissions)
4. **LCI = EF**: Throughout the tool, LCI (Life Cycle Inventory) means Emission Factor

## 🐛 Troubleshooting

### JSON Upload Fails
- Ensure file is valid JSON (not RTF or other format)
- Check that required fields exist: `id`, `title`, `processes`

### No Data Showing
- Verify JSON structure matches CarbonSig Build with AI output
- Check browser console for errors (F12)

### Port Already in Use
```bash
# Kill existing process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

## 📞 Support

For issues or questions:
- Check the main README.md
- Review the evaluation criteria document
- Contact the CarbonMetrix team

---

**Ready to evaluate your Build with AI outputs!** 🎉
