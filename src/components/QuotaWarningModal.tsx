import React from 'react';
import { BarChart3, ChevronRight } from 'lucide-react';

export interface QuotaWarningModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onOpenPlans?: () => void;
  percentage?: number;
  title?: string;
  subtitle?: string;
}

export const QuotaWarningModal: React.FC<QuotaWarningModalProps> = ({
  isOpen,
  onClose,
  onOpenPlans,
  percentage = 80,
  title = 'Você já utilizou 80% da sua cota',
  subtitle = 'Ainda há interações disponíveis, sua cota será renovada todo dia às 5h',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Card Glassmorphism correspondente exatamente à imagem */}
      <div
        className="relative w-full max-w-lg rounded-[32px] bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_20px_60px_rgba(30,58,138,0.14)] p-6 sm:p-8 text-slate-800 transition-all cursor-pointer group"
        onClick={(e) => {
          e.stopPropagation();
          if (onOpenPlans) onOpenPlans();
        }}
        style={{
          boxShadow: '0 25px 60px -15px rgba(59, 130, 246, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
        }}
      >
        {/* Topo com Ícone Gráfico de Barras Dourado + Textos + Seta Direita */}
        <div className="flex items-center gap-4 sm:gap-5 justify-between">
          <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
            {/* Círculo Perolado com Gráfico de Barras com Stroke Dourado */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-50/80 via-white to-amber-100/60 p-[1.5px] shadow-[0_4px_16px_rgba(245,158,11,0.15)] flex items-center justify-center shrink-0 border border-amber-200/60">
              <div className="w-full h-full rounded-full bg-white/95 flex items-center justify-center">
                <BarChart3
                  className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600/90 group-hover:scale-105 transition-transform"
                  strokeWidth={1.75}
                />
              </div>
            </div>

            {/* Textos Principais */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Seta Chevron Right indicando clique para abrir Planos */}
          <div className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0 pl-2">
            <ChevronRight size={22} />
          </div>
        </div>

        {/* Barra de Progresso + Porcentagem de 80% */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-3.5 sm:h-4 rounded-full bg-slate-100/90 p-[2px] overflow-hidden border border-slate-200/60 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-sky-400 shadow-[0_2px_8px_rgba(59,130,246,0.35)] transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
          <span className="text-sm sm:text-base font-semibold text-slate-700 tabular-nums shrink-0 min-w-[36px] text-right">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};
