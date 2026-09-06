const fs = require('fs');
let code = fs.readFileSync('src/components/OnboardingScreen.tsx', 'utf8');

const oldCta = `<button 
          onClick={onStart}
          className="mt-[22px] w-full h-[58px] border-0 rounded-full text-white text-[13.5px] tracking-[0.18em] font-medium flex items-center justify-center gap-[12px] cursor-pointer shadow-[0_14px_30px_rgba(20,30,60,0.28)] relative z-10 transition-transform active:translate-y-[1px] hover:brightness-110"
          style={{ background: 'linear-gradient(180deg, #243352, #1a2742)' }}
        >
          COMEÇAR
          <span className="absolute right-[28px] text-[18px]">→</span>
        </button>`;

const newCta = `{/* BOTÃO CONHEÇA (TRANSPARENTE COM STROKE ANIMADO CONIC GRADIENT) */}
        <div 
          onClick={onStart}
          className="relative mt-[22px] w-full max-w-[280px] mx-auto p-[1.5px] rounded-full overflow-hidden active:scale-95 transition-transform cursor-pointer shadow-[0_8px_32px_rgba(124,108,240,0.15)] z-10"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Fundo giratório que cria a borda animada (Conic Gradient) */}
          <div className="absolute inset-[-200%] animate-[spin_4s_linear_infinite]" 
               style={{
                 background: 'conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(124,108,240,0.8) 80%, rgba(110,168,255,1) 100%)'
               }} 
          />
          
          {/* Núcleo do botão (Transparente / Claro) para combinar com a tela clara */}
          <div className="relative flex items-center justify-center h-[56px] rounded-full bg-white/70 backdrop-blur-xl">
            <span className="text-[#1c2a4a] text-[13.5px] tracking-[0.18em] font-bold">CONHEÇA</span>
            <span className="absolute right-[28px] text-[#1c2a4a] text-[18px]">→</span>
          </div>
        </div>`;

if (code.includes(oldCta)) {
    code = code.replace(oldCta, newCta);
    fs.writeFileSync('src/components/OnboardingScreen.tsx', code);
    console.log('Onboarding CTA updated to transparent with animated conic gradient stroke.');
} else {
    console.log('Old CTA not found.');
}
