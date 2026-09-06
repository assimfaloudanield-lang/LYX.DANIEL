const fs = require('fs');
let code = fs.readFileSync('src/components/OnboardingScreen.tsx', 'utf8');

const oldLogo = `<img src="./Logotipolyx.png" alt="Logotipo LYX" className="w-[140px] mb-8 brightness-0 opacity-80" style={{ filter: 'brightness(0) saturate(100%) invert(14%) sepia(30%) saturate(1476%) hue-rotate(188deg) brightness(97%) contrast(92%)' }} />`;
const newLogo = `<img src="./Logotipolyx.png" alt="Logotipo LYX" className="w-[200px] sm:w-[240px] mb-8 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]" />`;

if (code.includes(oldLogo)) {
    code = code.replace(oldLogo, newLogo);
    fs.writeFileSync('src/components/OnboardingScreen.tsx', code);
    console.log('Logo updated to match Home without dark filters');
} else {
    console.log('Old logo tag not found in OnboardingScreen.tsx');
}
