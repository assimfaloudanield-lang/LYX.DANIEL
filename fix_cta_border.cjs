const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCtaStart = '{/* CTA PRINCIPAL (TRANSPARENTE COM STROKE MINIMALISTA) */}';
const nextSection = '{/* NOVAS FUNÇÕES (CARD COM CADEADO SOBRESSAINDO) */}';

const oldCtaIndex = code.indexOf(oldCtaStart);
const nextSectionIndex = code.indexOf(nextSection);

if (oldCtaIndex !== -1 && nextSectionIndex !== -1) {
    const newCta = `
        {/* CTA PRINCIPAL (BORDA ANIMADA FINA E DEGRADÊ) */}
        <div 
          onClick={() => {}} 
          className="relative w-full max-w-[280px] p-[1px] rounded-full overflow-hidden active:scale-95 transition-transform cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* O fundo real que cria a linha de contorno degradê giratória */}
          <div className="absolute inset-[-200%] animate-[spin_4s_linear_infinite]" 
               style={{
                 background: 'conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(56,189,248,1) 80%, rgba(168,85,247,1) 100%)'
               }} 
          />
          
          {/* O núcleo do botão que esconde o meio do fundo, deixando só a borda */}
          <div className="relative flex items-center justify-between px-5 py-2.5 rounded-full bg-[#030014]/90 backdrop-blur-md">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.05] border-[0.5px] border-white/10">
                <MessageCircle size={13} className="text-white/80" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-white/50 mb-[1px] font-light leading-none">Não pode falar agora?</span>
                <span className="text-[14px] text-white font-normal tracking-wide leading-none">Digite.</span>
              </div>
            </div>
            
            <ArrowRight size={14} className="text-white/30" strokeWidth={1.5} />
          </div>
        </div>

        `;

    code = code.substring(0, oldCtaIndex) + newCta + code.substring(nextSectionIndex);
    fs.writeFileSync('src/App.tsx', code);
    console.log('CTA Button updated to have a true thin animated border');
} else {
    console.log('CTA section not found');
}
