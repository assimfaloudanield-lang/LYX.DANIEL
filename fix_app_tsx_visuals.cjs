const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Swap background images order so the new image is the base and galaxy is the overlay, with gradient
const oldBgStr = `<div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="./Galaxy.png"
          alt="Galaxy Background"
          className="absolute inset-0 w-full h-full object-cover object-[center_top] opacity-80"
        />
        {/* Nova imagem adicionada (50% opacidade) abaixo do overlay de gradiente */}
        <img
          src="./EDA55B6A-2D3E.png"
          alt="Custom Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[#010006]/40 bg-gradient-to-b from-[#010006]/55 via-black/25 to-[#010006]/70 backdrop-brightness-[0.75]" />
      </div>`;

const newBgStr = `<div className="absolute inset-0 pointer-events-none z-0">
        {/* Imagem do usuário como fundo base */}
        <img
          src="./EDA55B6A-2D3E.png"
          alt="Custom Background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        {/* Overlay de galáxia */}
        <img
          src="./Galaxy.png"
          alt="Galaxy Background"
          className="absolute inset-0 w-full h-full object-cover object-[center_top] opacity-50 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[#010006]/60 bg-gradient-to-b from-[#010006]/70 via-black/40 to-[#010006]/90 backdrop-brightness-[0.75]" />
      </div>`;

if (code.includes(oldBgStr)) {
    code = code.replace(oldBgStr, newBgStr);
} else {
    console.log("Could not find background block exact match. Trying fallback.");
    // Fallback: replace everything between {/* BACKGROUND DA TELA */} and {/* Dynamic Galaxy
    const bgStart = code.indexOf('{/* BACKGROUND DA TELA */}');
    const bgEnd = code.indexOf('{/* Dynamic Galaxy');
    if(bgStart !== -1 && bgEnd !== -1) {
        code = code.substring(0, bgStart) + `{/* BACKGROUND DA TELA */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Imagem do usuário como fundo base */}
        <img
          src="./EDA55B6A-2D3E.png"
          alt="Custom Background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        {/* Overlay de galáxia */}
        <img
          src="./Galaxy.png"
          alt="Galaxy Background"
          className="absolute inset-0 w-full h-full object-cover object-[center_top] opacity-50 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[#010006]/60 bg-gradient-to-b from-[#010006]/70 via-black/40 to-[#010006]/90 backdrop-brightness-[0.75]" />
      </div>

      ` + code.substring(bgEnd);
    }
}

// 2. Change Lock Icon to Gold Background + Blue Icon
const oldLockStr = `<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-b from-slate-900 to-black border-[0.5px] border-[#818CF8]/40 flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
             <Lock size={12} className="text-white/70 outline-none" strokeWidth={2} />
          </div>`;

const newLockStr = `<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-b from-[#B48529]/20 to-[#785311]/60 border-[1px] border-[#D4AF37]/50 backdrop-blur-md flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.3)]">
             <Lock size={12} className="text-sky-400 outline-none" strokeWidth={2.5} />
          </div>`;

if(code.includes(oldLockStr)) {
    code = code.replace(oldLockStr, newLockStr);
}

// 3. Move CTA and Novas Funções up by ~20%
// We can change the padding-bottom of the bottom wrapper from pb-2 to pb-10 or pb-12.
const oldBottomWrapper = `<div className="relative z-30 flex flex-col items-center w-full pointer-events-auto gap-4 pb-2">`;
const newBottomWrapper = `<div className="relative z-30 flex flex-col items-center w-full pointer-events-auto gap-4 pb-8 sm:pb-12">`;

if (code.includes(oldBottomWrapper)) {
    code = code.replace(oldBottomWrapper, newBottomWrapper);
}

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx visual changes applied');
