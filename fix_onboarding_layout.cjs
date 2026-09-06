const fs = require('fs');
let code = fs.readFileSync('src/components/OnboardingScreen.tsx', 'utf8');

// 1. Reduzir ainda mais o tamanho da Headline e subtítulo, e margens do header
const oldHeader = `<header className="relative z-10 text-center flex flex-col items-center">
          <img src="./Logotipolyx.png" alt="Logotipo LYX" className="w-[200px] sm:w-[240px] mb-8 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]" />
          
          <h1 className="font-semibold text-[28px] leading-[1.15] tracking-[-0.02em] text-[#1c2a4a]">
            UMA ASSISTENTE<br />
            QUE ACOMPANHA
            <span className="block font-bold tracking-[0.02em] text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #7c6cf0 0%, #9b8cff 55%, #6ea8ff 100%)' }}>
              VOCÊ.
            </span>
          </h1>
          <p className="mt-[18px] max-w-[340px] text-[14.5px] leading-[1.55] text-[#6b7a94] font-normal mx-auto">
            Voz, conversa e inteligência no seu dia a dia.
            Pensada para estar disponível quando você precisar,
            diretamente no seu dispositivo.
          </p>
        </header>`;

const newHeader = `<header className="relative z-10 text-center flex flex-col items-center">
          <img src="./Logotipolyx.png" alt="Logotipo LYX" className="w-[160px] sm:w-[180px] mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]" />
          
          <h1 className="font-semibold text-[22px] leading-[1.15] tracking-[-0.02em] text-[#1c2a4a]">
            UMA ASSISTENTE<br />
            QUE ACOMPANHA
            <span className="block font-bold tracking-[0.02em] text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #7c6cf0 0%, #9b8cff 55%, #6ea8ff 100%)' }}>
              VOCÊ.
            </span>
          </h1>
          <p className="mt-[10px] max-w-[320px] text-[12.5px] leading-[1.4] text-[#6b7a94] font-normal mx-auto">
            Voz, conversa e inteligência no seu dia a dia.
            Pensada para estar disponível diretamente no seu dispositivo.
          </p>
        </header>`;

if (code.includes(oldHeader)) {
    code = code.replace(oldHeader, newHeader);
}

// 2. Diminuir a altura do Orbe para ele subir
const oldOrbWrap = `<section className="relative h-[280px] my-[18px]" aria-hidden="true">`;
const newOrbWrap = `<section className="relative h-[220px] my-[12px] flex items-center justify-center scale-[0.85]" aria-hidden="true">`;

if (code.includes(oldOrbWrap)) {
    code = code.replace(oldOrbWrap, newOrbWrap);
}

// 3. Compactar as margens das sections de features
const oldFeatSection = `<section className="grid grid-cols-3 gap-[10px] mt-[6px] mb-[22px] relative z-10">`;
const newFeatSection = `<section className="grid grid-cols-3 gap-[10px] mt-[4px] mb-[12px] relative z-10">`;

if (code.includes(oldFeatSection)) {
    code = code.replace(oldFeatSection, newFeatSection);
}

// 4. Garantir que o container principal tenha espaço extra embaixo para o botão não ficar escondido pela borda arredondada do celular
const oldMain = `className="w-full max-w-[430px] min-h-[920px] relative overflow-hidden rounded-[36px] px-7 pt-[52px] pb-7"`;
const newMain = `className="w-full max-w-[430px] min-h-[100dvh] sm:min-h-[920px] relative overflow-hidden sm:rounded-[36px] px-6 pt-[40px] pb-[120px] flex flex-col"`;

if (code.includes(oldMain)) {
    code = code.replace(oldMain, newMain);
}

// 5. O CTA precisa ficar grudado na base inferior da tela (fixed ou absolute bottom) para estar sempre visível
const oldCta = `{/* BOTÃO CONHEÇA (TRANSPARENTE COM STROKE ANIMADO CONIC GRADIENT) */}
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

const newCta = `{/* BOTÃO CONHEÇA - FIXO NA BASE PARA GARANTIR VISIBILIDADE */}
        <div className="absolute bottom-[40px] left-0 right-0 w-full flex justify-center px-6 z-50 pointer-events-auto">
          <div 
            onClick={onStart}
            className="relative w-full max-w-[320px] p-[1.5px] rounded-full overflow-hidden active:scale-95 transition-transform cursor-pointer shadow-[0_12px_40px_rgba(124,108,240,0.25)]"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="absolute inset-[-200%] animate-[spin_4s_linear_infinite]" 
                 style={{
                   background: 'conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(124,108,240,0.8) 80%, rgba(110,168,255,1) 100%)'
                 }} 
            />
            <div className="relative flex items-center justify-center h-[60px] rounded-full bg-white/85 backdrop-blur-2xl">
              <span className="text-[#1c2a4a] text-[14px] tracking-[0.2em] font-bold">CONHEÇA</span>
              <span className="absolute right-[32px] text-[#1c2a4a] text-[18px]">→</span>
            </div>
          </div>
        </div>`;

if (code.includes(oldCta)) {
    code = code.replace(oldCta, newCta);
}

fs.writeFileSync('src/components/OnboardingScreen.tsx', code);
console.log('Layout compacted and CTA button fixed to bottom.');
