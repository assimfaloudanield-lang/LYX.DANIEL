const fs = require('fs');
let code = fs.readFileSync('src/components/OnboardingScreen.tsx', 'utf8');

const oldWrapper = '<div className="min-h-[100dvh] w-full flex justify-center py-6 px-3 bg-[#eef3ff] text-[#2b3a58] font-sans">';
const newWrapper = '<div className="min-h-[100dvh] w-full flex justify-center py-6 px-3 bg-[#eef3ff] text-[#2b3a58] font-sans overflow-y-auto pointer-events-auto" style={{ WebkitOverflowScrolling: "touch" }}>';

if (code.includes(oldWrapper)) {
    code = code.replace(oldWrapper, newWrapper);
    fs.writeFileSync('src/components/OnboardingScreen.tsx', code);
    console.log('Scroll and pointer events fixed on OnboardingScreen');
} else {
    console.log('Wrapper not found');
}
