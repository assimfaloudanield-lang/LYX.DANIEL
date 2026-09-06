const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCtaStart = '{/* CTA PRINCIPAL REFINADO E SLIM (TRANSPARENTE E NOISE) */}';
const nextSection = '{/* NOVAS FUNÇÕES (CARD COM CADEADO SOBRESSAINDO) */}';

const oldCtaIndex = code.indexOf(oldCtaStart);
const nextSectionIndex = code.indexOf(nextSection);

if (oldCtaIndex !== -1 && nextSectionIndex !== -1) {
    const newCta = `
        {/* CTA PRINCIPAL REFINADO E SLIM (TRANSPARENTE E NOISE) */}
        <div 
          onClick={() => {}} 
          className="relative w-full max-w-[280px] rounded-full p-[1px] overflow-hidden active:scale-95 transition-all cursor-pointer"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Fundo giratório (stroke caminhante) */}
          <div className="absolute inset-[-150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_200deg,rgba(56,189,248,0.7)_280deg,rgba(168,85,247,0.7)_360deg)]" />
          
          {/* Conteúdo (Totalmente transparente + Noise SVG) */}
          <div className="relative flex items-center justify-between px-5 py-2.5 rounded-full bg-transparent text-left overflow-hidden">
            {/* Noise SVG overlay - Bem suave para dar textura de vidro translúcido */}
            <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.03] border-[0.5px] border-[#818CF8]/20">
                <MessageCircle size={13} className="text-white/70 outline-none" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-white/60 mb-[1px] font-light leading-none">Não pode falar agora?</span>
                <span className="text-[14px] text-white font-normal tracking-wide leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Digite.</span>
              </div>
            </div>
            
            <ArrowRight size={14} className="text-white/30 relative z-10" strokeWidth={1.5} />
          </div>
        </div>

        `;

    code = code.substring(0, oldCtaIndex) + newCta + code.substring(nextSectionIndex);
    fs.writeFileSync('src/App.tsx', code);
    console.log('CTA Button updated to be completely transparent with noise and stroke');
} else {
    console.log('CTA section not found');
}
