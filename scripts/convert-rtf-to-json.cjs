/**
 * Helper script to extract JSON from RTF file
 *
 * Usage: node scripts/convert-rtf-to-json.js input.rtf output.json
 */

const fs = require('fs');
const path = require('path');

function extractJsonFromRtf(rtfPath, outputPath) {
  try {
    // Read RTF file
    const rtfContent = fs.readFileSync(rtfPath, 'utf8');

    // Extract JSON between { and }
    // Find the first { and last } to capture the entire JSON object
    const firstBrace = rtfContent.indexOf('{', rtfContent.indexOf('\\{'));
    const lastBrace = rtfContent.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('Could not find JSON content in RTF file');
    }

    // Extract the JSON string
    let jsonString = rtfContent.substring(firstBrace, lastBrace + 1);

    // Clean up RTF escape sequences
    jsonString = jsonString
      .replace(/\\\\/g, '\\')  // Handle escaped backslashes
      .replace(/\\'/g, "'")     // Handle escaped single quotes
      .replace(/\\"/g, '"')     // Handle escaped double quotes
      .replace(/\\\n/g, '')     // Remove escaped newlines
      .replace(/\\\r/g, '');    // Remove escaped carriage returns

    // Parse to validate
    const jsonData = JSON.parse(jsonString);

    // Write to output file
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

    console.log('✓ Successfully converted RTF to JSON');
    console.log(`  Input:  ${rtfPath}`);
    console.log(`  Output: ${outputPath}`);
    console.log(`  System: ${jsonData.title} (ID: ${jsonData.id})`);
    console.log(`  Processes: ${jsonData.processes.length}`);

    return jsonData;
  } catch (error) {
    console.error('✗ Error converting RTF to JSON:', error.message);
    process.exit(1);
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node convert-rtf-to-json.js <input.rtf> <output.json>');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/convert-rtf-to-json.js');
    console.log('    "/Users/ivanamedojevic/Desktop/Saudi Arabia Cement system.rtf"');
    console.log('    "sample-data/saudi-cement.json"');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  extractJsonFromRtf(inputPath, outputPath);
}

module.exports = { extractJsonFromRtf };
