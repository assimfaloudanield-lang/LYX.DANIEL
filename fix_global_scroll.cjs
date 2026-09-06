const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Remove touch-action: none; and overflow: hidden; from global css
css = css.replace('overflow: hidden;', '');
css = css.replace('touch-action: none;', '');

fs.writeFileSync('src/index.css', css);
console.log('Global CSS scroll locks removed');

let code = fs.readFileSync('src/components/OnboardingScreen.tsx', 'utf8');

// Make the onboarding screen a proper scrollable container that fills the screen
const oldWrapper = '<div className="min-h-[100dvh] w-full flex justify-center py-6 px-3 bg-[#eef3ff] text-[#2b3a58] font-sans overflow-y-auto pointer-events-auto" style={{ WebkitOverflowScrolling: "touch" }}>';
const newWrapper = '<div className="absolute inset-0 w-full h-[100dvh] overflow-y-auto overflow-x-hidden flex justify-center py-6 px-3 bg-[#eef3ff] text-[#2b3a58] font-sans pointer-events-auto" style={{ WebkitOverflowScrolling: "touch", touchAction: "auto" }}>';

if (code.includes(oldWrapper)) {
    code = code.replace(oldWrapper, newWrapper);
    fs.writeFileSync('src/components/OnboardingScreen.tsx', code);
    console.log('Onboarding screen made absolutely positioned with internal scroll');
} else {
    console.log('Wrapper not found in OnboardingScreen');
}

// Make sure Auth and Home screens retain their hidden overflow
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
// The Auth and Home screens already use "relative min-h-[100dvh] w-full overflow-hidden" which is good, but let's ensure they fill the screen exactly if needed, or leave them as is since they work.
