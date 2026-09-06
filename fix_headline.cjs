const fs = require('fs');
let code = fs.readFileSync('src/components/OnboardingScreen.tsx', 'utf8');

const oldHeadline = `<h1 className="font-normal text-[34px] leading-[1.12] tracking-[-0.03em] text-[#1c2a4a]">`;
const newHeadline = `<h1 className="font-semibold text-[28px] leading-[1.15] tracking-[-0.02em] text-[#1c2a4a]">`;

const oldAccent = `<span className="block font-medium tracking-[0.02em] text-transparent bg-clip-text"`;
const newAccent = `<span className="block font-bold tracking-[0.02em] text-transparent bg-clip-text"`;

if (code.includes(oldHeadline) && code.includes(oldAccent)) {
    code = code.replace(oldHeadline, newHeadline);
    code = code.replace(oldAccent, newAccent);
    fs.writeFileSync('src/components/OnboardingScreen.tsx', code);
    console.log('Headline updated to be slightly smaller and thicker.');
} else {
    console.log('Headline not found');
}
