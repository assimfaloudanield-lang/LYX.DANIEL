const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = '{/* 2. ESPAÇO E LOGO */}';
const startIdx = code.indexOf(startStr);
const endStr = '    </div>\n  );\n}';
const endIdx = code.lastIndexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const newBlock = `{/* 2. ESPAÇO E LOGO */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center pointer-events-none mt-2 mb-2">
        <img
          id="app-main-logo"
          src="./Logotipolyx.png"
          alt="Logotipo LYX"
          className="w-[260px] sm:w-[300px] max-w-[80%] h-auto object-contain drop-shadow-[0_10px_32px_rgba(0,0,0,0.85)] select-none mb-4"
        />
      </div>

      {/* 3. INFERIOR: ORBE, CTA E FUNÇÕES */}
      <div className="relative z-30 flex flex-col items-center w-full pointer-events-auto gap-4 pb-2">
        
        {/* ORBE (AVATAR) E STATUS */}
        <div className="flex flex-col items-center justify-center pointer-events-auto mb-2">
          <IPhonePowerButton
            isOn={isOn}
            onToggle={handleToggle}
            statusText={voiceStatus}
            isListening={isListening}
          />
        </div>

        {/* CTA PRINCIPAL REFINADO E SLIM (TRANSPARENTE E NOISE) */}
        <div 
          onClick={() => {}} 
          className="relative w-full max-w-[280px] rounded-full p-[1px] overflow-hidden active:scale-95 transition-all cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Fundo giratório (stroke caminhante) */}
          <div className="absolute inset-[-150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_200deg,#38BDF8_280deg,#A855F7_360deg)] opacity-70" />
          
          {/* Conteúdo (Transparente + Noise SVG) */}
          <div className="relative flex items-center justify-between px-5 py-2.5 rounded-full bg-[#0A061C]/40 backdrop-blur-xl text-left overflow-hidden">
            {/* Noise SVG overlay */}
            <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.05] border-[0.5px] border-[#818CF8]/20">
                <MessageCircle size={13} className="text-white/80 outline-none" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-white/70 mb-[1px] font-light leading-none">Não pode falar agora?</span>
                <span className="text-[14px] text-[#A5B4FC] font-normal tracking-wide leading-none">Digite.</span>
              </div>
            </div>
            <ArrowRight size={14} className="text-white/40 relative z-10" strokeWidth={1.5} />
          </div>
        </div>

        {/* NOVAS FUNÇÕES (CARD COM CADEADO SOBRESSAINDO) */}
        <div className="relative mt-4 w-full max-w-[280px]">
          {/* Cadeado sobressaindo o glass */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-b from-slate-800 to-black border border-white/10 flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
             <Lock size={12} className="text-white/70" strokeWidth={2} />
          </div>
          
          {/* Card Glass */}
          <div className="w-full rounded-[18px] bg-[#0A061C]/30 border-[0.5px] border-white/10 backdrop-blur-xl pt-5 pb-3 px-4 flex flex-col items-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden">
             {/* Noise SVG */}
             <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
             
             <div className="flex items-center gap-2 relative z-10 mb-1">
                <Star size={12} className="text-sky-400" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.15em] text-white/80 font-medium">NOVAS FUNÇÕES</span>
             </div>
             <span className="relative z-10 text-[9px] text-white/40 text-center leading-tight max-w-[200px]">
                Integração visual e novos módulos de produtividade estarão disponíveis em breve.
             </span>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full max-w-[280px] mt-2 mb-2 p-3.5 rounded-[16px] bg-[#0A061C]/20 border-[0.5px] border-white/10 backdrop-blur-md flex flex-col gap-2.5">
          <div className="flex items-center justify-between w-full">
            <span className="text-[9px] font-semibold tracking-widest text-white/60">LYX ESTÁ SE PREPARANDO</span>
            <span className="text-[9px] font-mono text-sky-400">0%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-sky-400 w-0 rounded-full shadow-[0_0_10px_#38BDF8]" />
          </div>
        </div>

        {/* FOOTER */}
        <div className="w-full flex items-center justify-center gap-4 mt-1 pointer-events-none">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-sky-400/40" />
          <span className="text-[8px] tracking-[0.25em] font-light text-sky-400/80">DEVELOPED BY WRLD</span>
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-sky-400/40" />
        </div>

`;
  
  code = code.substring(0, startIdx) + newBlock + code.substring(endIdx);
  if (!code.includes('Lock')) {
    code = code.replace('User, MessageCircle, ArrowRight, Star', 'User, MessageCircle, ArrowRight, Star, Lock');
  }
  fs.writeFileSync('src/App.tsx', code);
  console.log('Update success alt');
} else {
  console.log('Could not find boundaries');
}
