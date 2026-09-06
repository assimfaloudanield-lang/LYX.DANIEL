const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const ctaOld = `{/* CTA PRINCIPAL */}
        <button className="w-full max-w-[400px] flex items-center justify-between p-5 rounded-[24px] bg-gradient-to-r from-indigo-950/40 to-indigo-900/20 backdrop-blur-xl border-[0.5px] border-[#818CF8]/40 shadow-[0_8px_32px_rgba(0,0,0,0.2)] active:scale-95 transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white/[0.05] border-[0.5px] border-[#818CF8]/30">
              <MessageCircle size={18} className="text-white/80 outline-none" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-white/60 mb-0.5">Não pode falar agora?</span>
              <span className="text-[19px] text-[#A5B4FC] font-normal tracking-wide">Digite.</span>
            </div>
          </div>
          <ArrowRight size={20} className="text-white/50" strokeWidth={1.5} />
        </button>`;

const ctaNew = `{/* CTA PRINCIPAL REFINADO */}
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

code = code.replace(ctaOld, ctaNew);
fs.writeFileSync('src/App.tsx', code);
console.log('Web CTA Updated');
