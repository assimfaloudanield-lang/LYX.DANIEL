const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const languageSelectorStr = `          <LanguageSelector
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
          />`;

const oldWrapperStart = `        {/* Engrenagem micro com stroke de seleção de vozes e estilos no topo à esquerda */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-30 pointer-events-auto flex items-center gap-2">
${languageSelectorStr}`;

const oldWrapperReplacement = `        {/* Engrenagem micro (Movida para a TOP BAR) */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-30 pointer-events-auto flex items-center gap-2">`;

const oldButtonStr = `          {/* Engrenagem */}
          <button className="w-11 h-11 rounded-full flex items-center justify-center bg-white/[0.03] border-[0.5px] border-[#818CF8]/30 backdrop-blur-md shadow-[0_0_10px_rgba(129,140,248,0.1)] active:scale-95 transition-all">
            <Settings size={20} className="text-white outline-none" strokeWidth={1.5} />
          </button>`;

code = code.replace(oldWrapperStart, oldWrapperReplacement);
code = code.replace(oldButtonStr, languageSelectorStr);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx gear");
