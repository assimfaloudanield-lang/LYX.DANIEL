const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const ctaOld = `{/* CTA PRINCIPAL REFINADO */}
        <div 
          onClick={() => {}} 
          className="relative w-full max-w-[310px] rounded-[22px] p-[1px] overflow-hidden active:scale-95 transition-all cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Fundo giratório (stroke caminhante) */}
          <div className="absolute inset-[-150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_200deg,#38BDF8_280deg,#A855F7_360deg)] opacity-70" />
          
          {/* Conteúdo (cobre o fundo, deixando apenas a borda de 1px) */}
          <div className="relative flex items-center justify-between p-4 rounded-[21px] bg-[#0A061C]/90 backdrop-blur-2xl text-left">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.02] border-[0.5px] border-[#818CF8]/20">
                <MessageCircle size={15} className="text-white/70 outline-none" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-white/50 mb-0.5 font-light">Não pode falar agora?</span>
                <span className="text-[16px] text-[#A5B4FC] font-normal tracking-wide">Digite.</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-white/30" strokeWidth={1.5} />
          </div>
        </div>`;

const ctaNew = `{/* CTA PRINCIPAL REFINADO E SLIM */}
        <div 
          onClick={() => {}} 
          className="relative w-full max-w-[280px] rounded-full p-[1px] overflow-hidden active:scale-95 transition-all cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Fundo giratório (stroke caminhante) */}
          <div className="absolute inset-[-150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_200deg,#38BDF8_280deg,#A855F7_360deg)] opacity-70" />
          
          {/* Conteúdo (cobre o fundo, deixando apenas a borda de 1px) */}
          <div className="relative flex items-center justify-between px-5 py-2.5 rounded-full bg-[#0A061C]/90 backdrop-blur-2xl text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.02] border-[0.5px] border-[#818CF8]/20">
                <MessageCircle size={13} className="text-white/70 outline-none" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-white/50 mb-[1px] font-light leading-none">Não pode falar agora?</span>
                <span className="text-[14px] text-[#A5B4FC] font-normal tracking-wide leading-none">Digite.</span>
              </div>
            </div>
            <ArrowRight size={14} className="text-white/30" strokeWidth={1.5} />
          </div>
        </div>`;

if (code.includes(ctaOld)) {
  code = code.replace(ctaOld, ctaNew);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Web CTA Updated to Slim');
} else {
  console.log('Could not find the exact old CTA string in Web');
}
