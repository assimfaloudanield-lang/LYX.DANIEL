import React from 'react';
import { Settings } from 'lucide-react';

export interface SetupProgressModalProps {
  isOpen: boolean;
  onClose?: () => void;
  progress?: number; // 0 a 100
  title?: string;
  subtitle?: string;
  statusText?: string;
}

export const SetupProgressModal: React.FC<SetupProgressModalProps> = ({
  isOpen,
  onClose,
  progress = 68,
  title = 'A LYX está fazendo alguns ajustes e logo mais estará tudo pronto.',
  subtitle = 'Estou mexendo nas engrenagens e ajustando sua experiência.',
  statusText = 'Baixando os modelos de voz...',
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Card Glassmorphism correspondente exatamente à imagem */}
      <div 
        className="relative w-full max-w-lg rounded-[32px] bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_20px_60px_rgba(30,58,138,0.14)] p-6 sm:p-8 text-slate-800 transition-all"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -15px rgba(59, 130, 246, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
        }}
      >
        {/* Topo com Ícone da Engrenagem Perolada Dourada + Textos */}
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Círculo Perolado com Engrenagem com Stroke Dourado */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-50/80 via-white to-amber-100/60 p-[1.5px] shadow-[0_4px_16px_rgba(245,158,11,0.15)] flex items-center justify-center shrink-0 border border-amber-200/60">
            <div className="w-full h-full rounded-full bg-white/95 flex items-center justify-center">
              <Settings 
                className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600/90 animate-[spin_10s_linear_infinite]" 
                strokeWidth={1.75}
              />
            </div>
          </div>

          {/* Textos Principais */}
          <div className="flex-1 pt-0.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Barra de Progresso + Porcentagem */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-3.5 sm:h-4 rounded-full bg-slate-100/90 p-[2px] overflow-hidden border border-slate-200/60 shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-sky-400 shadow-[0_2px_8px_rgba(59,130,246,0.35)] transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <span className="text-sm sm:text-base font-semibold text-slate-700 tabular-nums shrink-0 min-w-[36px] text-right">
            {progress}%
          </span>
        </div>

        {/* Status Inferior */}
        <div className="mt-2.5 text-xs text-slate-400 font-medium">
          {statusText}
        </div>
      </div>
    </div>
  );
};
