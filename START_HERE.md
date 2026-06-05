# 🚀 START HERE - CarbonSig Build with AI Evaluation Tool

## Quick Launch (3 Commands)

```bash
# 1. Navigate to project
cd /Users/ivanamedojevic/Desktop/Projects/build-ai-eval-tool

# 2. Install dependencies (if not done)
npm install

# 3. Start the app
npm run dev
```

**Open browser at:** `http://localhost:5173`

---

## 📤 Test with Your Data

Use your existing Saudi Arabia Cement JSON:

1. The RTF file is at: `/Users/ivanamedojevic/Desktop/Saudi Arabia Cement system.rtf`
2. Extract the JSON content (it's embedded in the RTF)
3. Upload to the tool

Or use any other Build with AI JSON output!

---

## 🎯 What This Tool Does

### Analyzes:
✅ **Node Population** - Counts populated vs unpopulated nodes
✅ **Missing Fields** - Flags incomplete data
✅ **Public EFs** - Identifies inputs with emission factors
✅ **D1-D8 Criteria** - Evaluates against your defined criteria
✅ **Production Ready** - Assesses if system meets thresholds

### Reports:
📊 Visual charts with statistics
📋 Detailed tables (4 views)
💾 Exportable reports (JSON & text)
✅ Production-ready assessment
💡 Actionable recommendations

---

## 📚 Documentation

- **README.md** - Full documentation
- **QUICK_START.md** - Quick start guide
- **IMPLEMENTATION_SUMMARY.md** - Complete implementation details

---

## 🎨 What You'll See

1. **Upload Area** - Drag & drop JSON file
2. **Overall Score** - Production-ready status
3. **Node Analysis** - Charts showing population stats
4. **D1-D8 Scores** - All 8 dimensions evaluated
5. **4 Detailed Tables**:
   - Unpopulated Nodes
   - Missing Fields
   - Public EFs
   - Dimension Details

---

## ✨ Key Features

- **No server needed** - Runs entirely in browser
- **Instant results** - Real-time evaluation
- **Visual charts** - Easy-to-understand graphics
- **Export reports** - Download JSON or text
- **Responsive** - Works on desktop & tablet

---

## 💡 Tips

- **Unpopulated nodes** = Missing `carbonIntensity` or `totalEmbodiedEmissions`
- **LCI = EF** = Emission Factor
- **unspecifiedEmissionGroups** = Direct Emissions (Scope 1)
- **referenceLibraryId present** = Has public EF

---

## 🛠️ Commands Reference

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

---

## 🎉 You're All Set!

Just run `npm run dev` and start evaluating your Build with AI outputs!

**Questions?** Check the documentation files or contact the team.

---

**Location:** `/Users/ivanamedojevic/Desktop/Projects/build-ai-eval-tool`
