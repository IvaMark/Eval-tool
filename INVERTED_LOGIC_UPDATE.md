# 🔄 Inverted isPublic Logic Update

## Summary

Updated the system to support the new `inputAdditionalData` structure with **INVERTED** `isPublic` logic.

## The Inverted Logic

⚠️ **IMPORTANT**: The `isPublic` field has inverted logic:

```
inputAdditionalData.isPublic = true  → INTERNAL EF (NOT public)
inputAdditionalData.isPublic = false → PUBLIC EF
```

Yes, this is counterintuitive, but it's how the backend developers implemented it.

## Changes Made

### 1. TypeScript Types (`src/types/carbonsig.ts`)

Added new interface:

```typescript
export interface InputAdditionalData {
  title: string;
  intensity: number;
  inputType: string;
  isPublic: boolean;        // ⚠️ INVERTED LOGIC!
  attestationBy: string;
  attestationCompany: string;
}
```

Updated `Input` interface:

```typescript
export interface Input {
  // ... existing fields ...
  inputAdditionalData?: InputAdditionalData;  // NEW
}
```

### 2. Evaluator Logic (`src/utils/evaluator.ts`)

Updated the public EF detection logic (lines 103-133):

```typescript
// Check if inputAdditionalData.isPublic exists (new structure)
if (input.inputAdditionalData && input.inputAdditionalData.isPublic !== undefined) {
  // INVERTED LOGIC: isPublic: true means INTERNAL (not public), false means PUBLIC
  isPublic = !input.inputAdditionalData.isPublic;
} else {
  // Fall back to old method: check against internal ID list
  isPublic = isPublicEF(input.referenceLibraryId);
}
```

## Classification Examples

From `Saudi_Arabia_Cement_Plant_new.json`:

| Material | inputAdditionalData.isPublic | Interpreted As | Correct? |
|----------|----------------------------|----------------|----------|
| Limestone | `true` | INTERNAL | ✅ |
| Clay | `true` | INTERNAL | ✅ |
| Heavy Fuel Oil | `true` | INTERNAL | ✅ |
| Gypsum | `true` | INTERNAL | ✅ |
| Electricity - Raw Mill | `false` | PUBLIC | ✅ |
| Electricity - Kiln Auxiliaries | `false` | PUBLIC | ✅ |
| Natural Pozzolan | `false` | PUBLIC | ✅ |

## Backward Compatibility

✅ **Fully backward compatible**

The system checks for `inputAdditionalData` first:
- **If present**: Uses the inverted `isPublic` field
- **If missing**: Falls back to checking against the internal ID list (`id_from_env`)

Old JSON files without `inputAdditionalData` will continue to work as before.

## JSON Structure

### New Format (with inputAdditionalData)

```json
{
  "inputs": [
    {
      "id": 69547,
      "title": "Limestone",
      "referenceLibraryId": 43980,
      "inputAdditionalData": {
        "title": "limestone, unprocessed; market for limestone, unprocessed",
        "intensity": 0.0023379459090473475,
        "inputType": "Reference Emission Factors",
        "isPublic": true,              ← INVERTED: true = INTERNAL
        "attestationBy": "[System]",
        "attestationCompany": "Ecoinvent"
      }
    }
  ]
}
```

### Old Format (still supported)

```json
{
  "inputs": [
    {
      "id": 69547,
      "title": "Limestone",
      "referenceLibraryId": 43980
      // No inputAdditionalData → uses internal ID list
    }
  ]
}
```

## Dev Server

✅ **Running at http://localhost:5173/**

## Testing

Test with:
- **New format**: `/Users/ivanamedojevic/Desktop/Projects/Eval docs for testing/Saudi_Arabia_Cement_Plant_new.json`
- **Old format**: `/Users/ivanamedojevic/Desktop/Projects/Eval docs for testing/Saudi_Arabia_Cement_Plant.json`

Both should work correctly!

## Why Inverted?

The backend developers used `isPublic` to mean "is in the public/internal database" rather than "is from a public source". This resulted in the counterintuitive logic where:

- `isPublic: true` = "Yes, it's in our internal database" = INTERNAL
- `isPublic: false` = "No, it's not in our internal database" = PUBLIC (external source)

---

**Updated**: 2026-06-09
**Version**: v1.2.0
