const fs = require('fs');
let code = fs.readFileSync('src/components/OnboardingScreen.tsx', 'utf8');

const oldKeyframes = `<style>{\`
        @keyframes float-orb {
          0%, 100% { transform: translate(-50%, -50%); }
          50% { transform: translate(-50%, calc(-50% - 8px)); }
        }
      \`}</style>`;

const newKeyframes = `<style>{\`
        @keyframes float-orb {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-12px); }
        }
        @keyframes rotate-shine {
          0% { transform: rotate(-28deg) translateX(0); }
          50% { transform: rotate(-28deg) translateX(15px); }
          100% { transform: rotate(-28deg) translateX(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.18; }
          50% { transform: scale(1.05); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.18; }
        }
      \`}</style>`;

if (code.includes(oldKeyframes)) {
    code = code.replace(oldKeyframes, newKeyframes);
}

// Enhance orb animation
const oldOrb = `animation: 'float-orb 6.5s ease-in-out infinite',`;
const newOrb = `animation: 'float-orb 4s ease-in-out infinite',`;

if (code.includes(oldOrb)) {
    code = code.replace(oldOrb, newOrb);
}

// Add shine animation
const oldShine = `i className="absolute w-[54px] h-[28px] left-[28%] top-[18%] rounded-full blur-[6px] rotate-[-28deg] bg-[rgba(255,255,255,0.75)]" />`;
const newShine = `i className="absolute w-[54px] h-[28px] left-[28%] top-[18%] rounded-full blur-[6px] bg-[rgba(255,255,255,0.75)]" style={{ animation: 'rotate-shine 6s ease-in-out infinite', transformOrigin: 'center' }} />`;

if (code.includes(oldShine)) {
    code = code.replace(oldShine, newShine);
}

// Add ring animation
const oldRing = `<div className="absolute inset-[18px] rounded-full border border-[rgba(160,180,220,0.18)]"></div>`;
const newRing = `<div className="absolute inset-[18px] rounded-full border border-[rgba(160,180,220,0.18)]" style={{ animation: 'pulse-ring 4s ease-in-out infinite' }}></div>`;

if (code.includes(oldRing)) {
    code = code.replace(oldRing, newRing);
}

fs.writeFileSync('src/components/OnboardingScreen.tsx', code);
console.log('Animations enhanced and fixed');
