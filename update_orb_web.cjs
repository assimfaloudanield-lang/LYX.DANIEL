const fs = require('fs');
let code = fs.readFileSync('src/components/IPhonePowerButton.tsx', 'utf8');

// Find and remove the instruction block
const instructionStart = code.indexOf('{/* Instrução */}');
if (instructionStart !== -1) {
  const instructionEnd = code.indexOf('</div>', instructionStart) + 6;
  code = code.slice(0, instructionStart) + code.slice(instructionEnd);
  fs.writeFileSync('src/components/IPhonePowerButton.tsx', code);
  console.log("Removed instruction from Web Orb");
}
