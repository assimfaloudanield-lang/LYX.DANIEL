import React from 'react';
import { sounds } from '../utils/audio';

interface VintageSwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

export const VintageSwitch: React.FC<VintageSwitchProps> = ({ isOn, onToggle }) => {
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Don't trigger canvas pointer drag
    sounds.playSwitchClick(!isOn);
    onToggle();
  };

  return (
    <div
      id="vintage-switch-container"
      className="relative z-20 flex flex-col items-center select-none"
    >
      {/* Outer Glow when ON */}
      <div
        className={`absolute -inset-8 rounded-3xl transition-opacity duration-700 pointer-events-none ${
          isOn ? 'opacity-50 blur-2xl bg-amber-400/20' : 'opacity-0'
        }`}
      />

      {/* Main Vintage Plate - Elegant Dark Brass & Bakelite */}
      <div
        id="vintage-switch-plate"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={isOn ? 'Desligar energia da galáxia' : 'Ligar energia da galáxia'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as unknown as React.MouseEvent);
          }
        }}
        className="relative w-44 sm:w-48 py-6 px-4 rounded-xl cursor-pointer transition-transform duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a973] bg-gradient-to-b from-[#a38b5d] to-[#7a643d] border border-[#c4a973]/50 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,0.3)] flex flex-col items-center justify-between"
      >
        {/* Top Slotted Screw */}
        <div className="flex justify-center mb-2">
          <div className="w-4 h-4 rounded-full bg-[#4a3b1d] shadow-inner relative flex items-center justify-center">
            <div
              className="w-2.5 h-[1.5px] bg-[#2a200f] shadow-[0_0.5px_0_rgba(255,255,255,0.2)]"
              style={{ transform: 'rotate(28deg)' }}
            />
          </div>
        </div>

        {/* Vintage Embossed Brand Label */}
        <div className="text-center mb-2">
          <span className="text-[9px] tracking-[0.3em] font-serif font-bold uppercase text-[#382b14] drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]">
            VOLT • COSMOS
          </span>
        </div>

        {/* Toggle Switch Section */}
        <div className="flex flex-col items-center justify-center my-1">
          {/* Status Label ON */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className={`text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 ${
                isOn ? 'text-[#2a200f] drop-shadow-[0_0_8px_rgba(255,240,180,0.9)] font-extrabold' : 'text-[#4a3b1d]/70'
              }`}
            >
              ON
            </span>
            {/* Indicator Lamp */}
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isOn
                  ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b,0_0_14px_#d97706]'
                  : 'bg-[#3b2e16] shadow-inner'
              }`}
            />
          </div>

          {/* Toggle Switch Housing */}
          <div className="w-16 h-28 bg-[#1a1a1a] rounded-lg shadow-inner flex items-center justify-center p-1 border border-black/40">
            <div
              className="w-full h-1/2 bg-gradient-to-b from-[#333] to-[#111] rounded-md shadow-lg border-t border-white/10 flex items-center justify-center transition-transform duration-200 ease-out"
              style={{
                transform: isOn ? 'translateY(-30%)' : 'translateY(30%)',
              }}
            >
              <div
                className={`w-6 h-[2px] rounded-full transition-colors duration-300 ${
                  isOn ? 'bg-amber-300/80 shadow-[0_0_4px_#f59e0b]' : 'bg-white/20'
                }`}
              />
            </div>
          </div>

          {/* Status Label OFF */}
          <div className="mt-1.5">
            <span
              className={`text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 ${
                !isOn ? 'text-[#2a200f] drop-shadow-[0_0_4px_rgba(255,240,180,0.6)] font-extrabold' : 'text-[#4a3b1d]/70'
              }`}
            >
              OFF
            </span>
          </div>
        </div>

        {/* Vintage Socket Outlet (Tomada Antiga) Section */}
        <div className="mt-2 pt-2 border-t border-[#68532f]/60 w-full flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center relative bg-[#221a11] shadow-inner border border-[#4a3b1d]"
          >
            {/* Dual round pin holes */}
            <div className="flex gap-3.5 items-center">
              <div className="w-3 h-3 rounded-full bg-[#0a0805] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center border border-[#382b16]">
                <div
                  className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                    isOn ? 'bg-[#c29853] opacity-80 shadow-[0_0_3px_#eab308]' : 'bg-[#473722] opacity-40'
                  }`}
                />
              </div>
              <div className="w-1 h-1 rounded-full bg-[#3d3023]" />
              <div className="w-3 h-3 rounded-full bg-[#0a0805] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center border border-[#382b16]">
                <div
                  className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                    isOn ? 'bg-[#c29853] opacity-80 shadow-[0_0_3px_#eab308]' : 'bg-[#473722] opacity-40'
                  }`}
                />
              </div>
            </div>
          </div>
          <span className="text-[7.5px] tracking-widest uppercase font-mono mt-1 text-[#382b14] font-semibold">
            110V • 1948
          </span>
        </div>

        {/* Bottom Slotted Screw */}
        <div className="flex justify-center mt-2">
          <div className="w-4 h-4 rounded-full bg-[#4a3b1d] shadow-inner relative flex items-center justify-center">
            <div
              className="w-2.5 h-[1.5px] bg-[#2a200f] shadow-[0_0.5px_0_rgba(255,255,255,0.2)]"
              style={{ transform: 'rotate(72deg)' }}
            />
          </div>
        </div>
      </div>

      {/* Elegant Dark Controller Title & Subtitle */}
      <div className="mt-5 text-center pointer-events-none">
        <h1 className="text-white/80 text-sm sm:text-base font-light tracking-[0.4em] uppercase mb-1">
          Cosmos Controller
        </h1>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto" />
        <p className="text-white/40 text-xs mt-2 italic">
          {isOn ? 'Energia ativa • Toque na tela para transformar' : 'Realidade em pausa • Clique para ignição'}
        </p>
      </div>
    </div>
  );
};

