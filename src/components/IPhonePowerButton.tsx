import React from 'react';
import { sounds } from '../utils/audio';

interface IPhonePowerButtonProps {
  isOn: boolean;
  onToggle: () => void;
  statusText?: string;
  isListening?: boolean;
}

export const IPhonePowerButton: React.FC<IPhonePowerButtonProps> = ({
  isOn,
  onToggle,
  statusText,
  isListening = false,
}) => {
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    sounds.playSwitchClick(!isOn);
    onToggle();
  };

  return (
    <div
      id="power-button-container"
      className="relative z-20 flex flex-col items-center select-none w-full"
    >
      <div className="relative flex items-center justify-center w-[160px] h-[160px]">
        {/* Glow animado e pulsante */}
        <div
          className={`absolute rounded-full pointer-events-none transition-all duration-700 ease-in-out ${
            isOn ? 'w-[150px] h-[150px] opacity-90 scale-105' : 'w-[125px] h-[125px] opacity-30 scale-100'
          }`}
          style={{
            background: isOn 
              ? 'radial-gradient(circle, rgba(56,189,248,0.5) 0%, rgba(168,85,247,0.3) 50%, transparent 80%)'
              : 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Círculo neon externo do Orb */}
        <button
          onClick={handleClick}
          className="relative z-10 w-[120px] h-[120px] rounded-full flex items-center justify-center cursor-pointer active:scale-95 focus:outline-none transition-transform duration-300"
          style={{
            background: 'rgba(0,0,0,0.5)',
            padding: '2px', // Espessura da borda gradiente
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400 via-purple-500 to-sky-400 animate-[spin_4s_linear_infinite]" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '1px' }} />
          
          <img
            src="./LyxButtom.png"
            alt="Orb"
            className="w-full h-full object-cover rounded-full select-none pointer-events-none"
          />
        </button>
      </div>

      {/* Indicador minimalista abaixo do botão (Sem caixa/box) */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <span
          className={`w-[6px] h-[6px] rounded-full transition-all duration-300 ${
            isOn
              ? isListening
                ? 'bg-[#38BDF8] shadow-[0_0_8px_#38BDF8] animate-pulse'
                : 'bg-[#38BDF8]/60 shadow-[0_0_4px_#38BDF8]'
              : 'bg-[#38BDF8]/30'
          }`}
        />
        <span className="text-[9px] font-medium tracking-[0.2em] text-[#38BDF8]/80 uppercase">
          {statusText || (isOn ? 'LYX ESTÁ OUVINDO' : 'LYX ESTÁ ESPERANDO')}
        </span>
      </div>
      
      
    </div>
  );
};
