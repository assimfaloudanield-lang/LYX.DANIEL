const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const returnStart = code.lastIndexOf('  return (');
const oldLayout = code.slice(returnStart);

const newLayout = `  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black font-sans flex flex-col justify-between py-6 px-5 sm:px-8">
      {/* BACKGROUND DA TELA */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="./Galaxy.png"
          alt="Galaxy Background"
          className="absolute inset-0 w-full h-full object-cover object-[center_top] opacity-80"
        />
        <div className="absolute inset-0 bg-[#010006]/40 bg-gradient-to-b from-[#010006]/55 via-black/25 to-[#010006]/70 backdrop-brightness-[0.75]" />
      </div>

      {/* Dynamic Galaxy Simulation Canvas */}
      <GalaxyCanvas isOn={isOn} />
      <CosmicFloatingParticles />

      {/* 1. HEADER */}
      <header className="relative z-50 flex items-center justify-between pointer-events-auto">
        <LanguageSelector
          voices={nativeVoices}
          currentVoiceId={selectedVoiceId}
          onSelectVoice={handleVoiceSelect}
          currentLanguage={language}
          onSelectLanguage={handleLanguageChange}
          currentStyleId={selectedStyleId}
          onSelectStyle={handleStyleSelect}
          onPreviewSpeech={handlePreviewSpeech}
          onRefreshVoices={refreshNativeVoices}
          dropdownAlign="left"
        />

        <button className="flex items-center gap-3 px-3.5 py-2 rounded-full bg-white/[0.03] border-[0.5px] border-[#818CF8]/30 backdrop-blur-md shadow-[0_0_10px_rgba(129,140,248,0.1)] active:scale-95 transition-all">
          <div className="w-8 h-8 rounded-full border border-sky-400 flex items-center justify-center bg-transparent">
            <User size={16} className="text-sky-400 outline-none" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col items-start pr-1">
            <span className="text-[13px] font-medium text-white leading-tight">Olá, Daniel</span>
            <span className="text-[10px] text-white/50 leading-tight">Bom te ver aqui.</span>
          </div>
        </button>
      </header>

      {/* 2. ESPAÇO E LOGO */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center pointer-events-none mt-8 mb-4">
        <img
          id="app-main-logo"
          src="./Logotipolyx.png"
          alt="Logotipo LYX"
          className="w-[260px] sm:w-[300px] max-w-[80%] h-auto object-contain drop-shadow-[0_10px_32px_rgba(0,0,0,0.85)] select-none mb-10"
        />
        
        {/* 3. ORBE (AVATAR) E STATUS */}
        <div className="flex flex-col items-center justify-center pointer-events-auto">
          <IPhonePowerButton
            isOn={isOn}
            onToggle={handleToggle}
            statusText={voiceStatus}
            isListening={isListening}
          />
        </div>
      </div>

      {/* 4. CTA E INFERIOR */}
      <div className="relative z-30 flex flex-col items-center w-full pointer-events-auto gap-5 pb-2">
        
        {/* CTA PRINCIPAL */}
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
        </button>

        {/* NOVAS FUNÇÕES */}
        <div className="flex items-center gap-2 mt-1">
          <Star size={14} className="text-sky-400 outline-none" strokeWidth={1.5} />
          <span className="text-[10px] tracking-[0.1em] text-white/70">NOVAS FUNÇÕES</span>
          <span className="ml-1 px-2.5 py-1 rounded-full border-[0.5px] border-white/20 text-white/50 text-[8px] tracking-widest bg-white/[0.02]">
            EM BREVE
          </span>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full max-w-[400px] mt-2 mb-4 p-4 rounded-[16px] bg-white/[0.02] border-[0.5px] border-white/10 backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-semibold tracking-widest text-white/60">LYX ESTÁ SE PREPARANDO</span>
            <span className="text-[10px] font-mono text-sky-400">0%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-sky-400 w-0 rounded-full shadow-[0_0_10px_#38BDF8]" />
          </div>
        </div>

        {/* FOOTER */}
        <div className="w-full flex items-center justify-center gap-4 mt-2 pointer-events-none">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-sky-400/40" />
          <span className="text-[9px] tracking-[0.25em] font-light text-sky-400/80">DEVELOPED BY WRLD</span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-sky-400/40" />
        </div>

      </div>
    </div>
  );
};

export default App;
`;

code = code.substring(0, returnStart) + newLayout;
fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated properly');
