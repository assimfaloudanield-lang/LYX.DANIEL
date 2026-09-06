const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCtaStart = '{/* CTA PRINCIPAL REFINADO E SLIM (TRANSPARENTE E NOISE) */}';
const nextSection = '{/* NOVAS FUNÇÕES (CARD COM CADEADO SOBRESSAINDO) */}';

const oldCtaIndex = code.indexOf(oldCtaStart);
const nextSectionIndex = code.indexOf(nextSection);

if (oldCtaIndex !== -1 && nextSectionIndex !== -1) {
    const newCta = `
        {/* CTA PRINCIPAL (TRANSPARENTE COM STROKE MINIMALISTA) */}
        <div 
          onClick={() => {}} 
          className="relative w-full max-w-[280px] rounded-full p-[1px] overflow-hidden active:scale-95 transition-all cursor-pointer"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Fundo escuro sutil para garantir leitura (sem blur exagerado) */}
          <div className="absolute inset-0 bg-black/40 rounded-full" />
          
          {/* Borda (stroke) giratória sutil, não como um radar denso */}
          <div className="absolute inset-[-100%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_120deg,rgba(56,189,248,0.8)_180deg,transparent_240deg)] opacity-80" />
          
          {/* Conteúdo limpo (Sem noise, sem fundos adicionais) */}
          <div className="relative flex items-center justify-between px-5 py-2.5 rounded-full bg-[#030014]/60 text-left overflow-hidden">
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border-[0.5px] border-white/20">
                <MessageCircle size={13} className="text-white/80 outline-none" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-white/60 mb-[1px] font-light leading-none">Não pode falar agora?</span>
                <span className="text-[14px] text-white font-normal tracking-wide leading-none">Digite.</span>
              </div>
            </div>
            
            <ArrowRight size={14} className="text-white/30 relative z-10" strokeWidth={1.5} />
          </div>
        </div>

        `;

    code = code.substring(0, oldCtaIndex) + newCta + code.substring(nextSectionIndex);
    fs.writeFileSync('src/App.tsx', code);
    console.log('CTA Button updated to elegant minimal stroke');
} else {
    console.log('CTA section not found');
}
