const fs = require('fs');

const content = `import React from 'react';

interface OnboardingScreenProps {
  onStart: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 w-full h-[100dvh] overflow-y-auto overflow-x-hidden flex justify-center items-center py-4 px-3 bg-[#eef3ff] text-[#2b3a58] font-sans pointer-events-auto" style={{ WebkitOverflowScrolling: "touch" }}>
      <style>{\`
        @keyframes float-orb {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
        @keyframes rotate-shine {
          0% { transform: rotate(-28deg) translateX(0); }
          50% { transform: rotate(-28deg) translateX(10px); }
          100% { transform: rotate(-28deg) translateX(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.18; }
          50% { transform: scale(1.04); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.18; }
        }
      \`}</style>

      <main 
        className="w-full max-w-[420px] relative overflow-hidden rounded-[32px] px-6 py-6 flex flex-col justify-between"
        style={{
          background: \`
            radial-gradient(120% 80% at 10% 0%, rgba(186, 214, 255, 0.85), transparent 55%),
            radial-gradient(90% 70% at 100% 18%, rgba(196, 184, 255, 0.55), transparent 50%),
            radial-gradient(80% 60% at 80% 100%, rgba(210, 225, 255, 0.7), transparent 50%),
            linear-gradient(180deg, #f7f9ff 0%, #eef2ff 45%, #f4f7ff 100%)
          \`,
          boxShadow: \`0 25px 60px rgba(80, 100, 160, 0.18), inset 0 0 0 1px rgba(255,255,255,0.6)\`
        }}
      >
        {/* Ribbons */}
        <div className="absolute pointer-events-none blur-[0.2px] -top-[40px] -left-[80px] w-[260px] h-[380px] rotate-[-18deg]"
          style={{ background: 'radial-gradient(closest-side, rgba(170,200,255,0.55), transparent 70%)' }} />
        <div className="absolute pointer-events-none blur-[0.2px] top-[80px] -right-[90px] w-[240px] h-[340px] rotate-[22deg]"
          style={{ background: 'radial-gradient(closest-side, rgba(190,180,255,0.45), transparent 72%)' }} />

        {/* 1. TOPO: LOGO E HEADLINE ELEGANTE */}
        <header className="relative z-10 text-center flex flex-col items-center">
          <img 
            src="./Logotipolyx.png" 
            alt="Logotipo LYX" 
            className="w-[130px] sm:w-[150px] mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)]" 
          />
          
          <h1 className="font-semibold text-[20px] sm:text-[22px] leading-[1.18] tracking-[-0.02em] text-[#1c2a4a]">
            UMA ASSISTENTE<br />
            QUE ACOMPANHA
            <span className="block font-bold tracking-[0.02em] text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #7c6cf0 0%, #9b8cff 55%, #6ea8ff 100%)' }}>
              VOCÊ.
            </span>
          </h1>
          <p className="mt-1.5 max-w-[320px] text-[12px] leading-[1.4] text-[#6b7a94] font-normal mx-auto">
            Voz, conversa e inteligência no seu dia a dia.
            Pensada para estar disponível diretamente no seu dispositivo.
          </p>
        </header>

        {/* 2. ORBE INTEGRADO E ELEGANTE */}
        <section className="relative h-[180px] my-1.5 flex items-center justify-center" aria-hidden="true">
          <div className="absolute inset-[16px_24px_16px] rounded-full border border-[rgba(160,180,220,0.28)] rotate-[-12deg]">
            <div className="absolute inset-[14px] rounded-full border border-[rgba(160,180,220,0.18)]" style={{ animation: 'pulse-ring 4s ease-in-out infinite' }}></div>
          </div>
          
          <div className="absolute left-1/2 top-[50%] w-[124px] h-[124px] rounded-full backdrop-blur-[8px]"
            style={{
              transform: 'translate(-50%, -50%)',
              animation: 'float-orb 4s ease-in-out infinite',
              background: \`
                radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95), transparent 28%),
                radial-gradient(circle at 62% 38%, rgba(160,210,255,0.7), transparent 42%),
                radial-gradient(circle at 48% 68%, rgba(150,130,255,0.55), transparent 50%),
                linear-gradient(160deg, rgba(210,230,255,0.7), rgba(170,160,255,0.45))
              \`,
              boxShadow: \`0 16px 40px rgba(120, 140, 210, 0.25), inset 0 0 24px rgba(255,255,255,0.45), inset -14px -16px 30px rgba(120, 110, 220, 0.18)\`
            }}
          >
            <div className="absolute inset-[14px] rounded-full blur-[5px]" style={{ background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.35), transparent 60%)' }} />
            <i className="absolute w-[42px] h-[22px] left-[28%] top-[18%] rounded-full blur-[5px] bg-[rgba(255,255,255,0.75)]" style={{ animation: 'rotate-shine 6s ease-in-out infinite', transformOrigin: 'center' }} />
          </div>

          <div className="absolute text-[9px] tracking-[0.16em] text-[#7a88a4] font-medium uppercase flex items-center gap-1.5 left-2 top-[72px] flex-row-reverse text-right">
            <span>MAIS<br/>CONTROLE</span><i className="w-[5px] h-[5px] rounded-full bg-[#7aa0d8] shadow-[0_0_0_3px_rgba(122,160,216,0.15)]" />
          </div>
          <div className="absolute text-[9px] tracking-[0.16em] text-[#7a88a4] font-medium uppercase flex items-center gap-1.5 right-3 top-[36px]">
            <i className="w-[5px] h-[5px] rounded-full bg-[#7aa0d8] shadow-[0_0_0_3px_rgba(122,160,216,0.15)]" /><span>MAIS<br/>TEMPO</span>
          </div>
          <div className="absolute text-[9px] tracking-[0.16em] text-[#7a88a4] font-medium uppercase flex items-center gap-1.5 right-4 top-[120px]">
            <i className="w-[5px] h-[5px] rounded-full bg-[#7aa0d8] shadow-[0_0_0_3px_rgba(122,160,216,0.15)]" /><span>MAIS<br/>VOCÊ</span>
          </div>
        </section>

        {/* 3. AS 3 COLUNAS */}
        <section className="grid grid-cols-3 gap-2 mt-1 mb-2.5 relative z-10">
          <article className="text-center">
            <div className="w-[38px] h-[38px] mx-auto mb-1.5 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.45)] border border-[rgba(255,255,255,0.8)] shadow-[0_6px_16px_rgba(140,160,210,0.1)] text-[#5b6d96]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/>
              </svg>
            </div>
            <h3 className="text-[11px] tracking-[0.08em] font-semibold text-[#1c2a4a] mb-0.5">OUÇA</h3>
            <p className="text-[10.5px] leading-[1.35] text-[#6b7a94]">Fale naturalmente com a LYX.</p>
          </article>
          <article className="text-center">
            <div className="w-[38px] h-[38px] mx-auto mb-1.5 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.45)] border border-[rgba(255,255,255,0.8)] shadow-[0_6px_16px_rgba(140,160,210,0.1)] text-[#5b6d96]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.6-4.2A8 8 0 1 1 21 12Z"/>
              </svg>
            </div>
            <h3 className="text-[11px] tracking-[0.08em] font-semibold text-[#1c2a4a] mb-0.5">CONVERSE</h3>
            <p className="text-[10.5px] leading-[1.35] text-[#6b7a94]">Texto e voz com contexto.</p>
          </article>
          <article className="text-center">
            <div className="w-[38px] h-[38px] mx-auto mb-1.5 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.45)] border border-[rgba(255,255,255,0.8)] shadow-[0_6px_16px_rgba(140,160,210,0.1)] text-[#5b6d96]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="8" r="3.2"/>
                <path d="M5.5 19.2c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5"/>
              </svg>
            </div>
            <h3 className="text-[11px] tracking-[0.08em] font-semibold text-[#1c2a4a] mb-0.5">ACOMPANHE</h3>
            <p className="text-[10.5px] leading-[1.35] text-[#6b7a94]">Aprende sua rotina.</p>
          </article>
        </section>

        {/* 4. OS 2 CARDS */}
        <section className="grid grid-cols-2 gap-2 relative z-10">
          <article className="border border-[rgba(255,255,255,0.75)] rounded-[18px] p-3 shadow-[0_8px_24px_rgba(130,150,200,0.07)] backdrop-blur-[16px] min-h-[115px] flex flex-col justify-center" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.28))' }}>
            <div className="flex gap-2 items-start">
              <svg className="w-[22px] h-[22px] flex-none text-[#6a7aa0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="6" y="11" width="12" height="9" rx="2"/>
                <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
                <circle cx="12" cy="15.5" r="1"/>
              </svg>
              <div>
                <h4 className="text-[11px] tracking-[0.04em] font-semibold text-[#1c2a4a] leading-[1.25] mb-1">PRIVACIDADE<br/>POR PADRÃO</h4>
                <p className="text-[10.5px] leading-[1.35] text-[#6b7a94]">Direto no seu dispositivo.</p>
              </div>
            </div>
          </article>
          <article className="border border-[rgba(255,255,255,0.75)] rounded-[18px] p-3 shadow-[0_8px_24px_rgba(130,150,200,0.07)] backdrop-blur-[16px] min-h-[115px] flex flex-col justify-between" style={{ background: 'linear-gradient(180deg, rgba(246,242,255,0.72), rgba(236,232,255,0.38))' }}>
            <div className="flex gap-2 items-start">
              <svg className="w-[22px] h-[22px] flex-none text-[#6a7aa0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3Z"/>
                <path d="M18.5 13.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"/>
              </svg>
              <div>
                <h4 className="text-[11px] tracking-[0.04em] font-semibold text-[#1c2a4a] leading-[1.25] mb-0.5">MAIS FORMAS</h4>
                <p className="text-[10px] leading-[1.3] text-[#6b7a94]">Novos modos em breve.</p>
              </div>
            </div>
            <span className="inline-block mt-1 self-start py-1 px-2 rounded-full text-[9px] tracking-[0.06em] font-semibold text-[#7c6cf0] border border-[rgba(180,170,255,0.35)]" style={{ background: 'rgba(255,255,255,0.55)' }}>EM BREVE</span>
          </article>
        </section>

        {/* 5. BOTÃO CONHEÇA (TRANSPARENTE COM STROKE ANIMADO CONIC GRADIENT) */}
        <div 
          onClick={onStart}
          className="relative mt-4 w-full max-w-[280px] mx-auto p-[1.5px] rounded-full overflow-hidden active:scale-95 transition-transform cursor-pointer shadow-[0_8px_28px_rgba(124,108,240,0.18)] z-10"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Fundo giratório que cria a borda animada (Conic Gradient) */}
          <div className="absolute inset-[-200%] animate-[spin_4s_linear_infinite]" 
               style={{
                 background: 'conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(124,108,240,0.85) 80%, rgba(110,168,255,1) 100%)'
               }} 
          />
          
          {/* Núcleo do botão (Transparente / Claro) */}
          <div className="relative flex items-center justify-center h-[50px] rounded-full bg-[#f4f7ff]/95 backdrop-blur-xl">
            <span className="text-[#1c2a4a] text-[13px] tracking-[0.18em] font-bold">CONHEÇA</span>
            <span className="absolute right-[24px] text-[#1c2a4a] text-[16px]">→</span>
          </div>
        </div>
      </main>
    </div>
  );
};
`;

fs.writeFileSync('src/components/OnboardingScreen.tsx', content);
console.log('Onboarding screen updated cleanly with Item 1 specifications.');
