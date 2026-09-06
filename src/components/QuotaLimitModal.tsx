import React from 'react';
import { Crown, Sparkles, ChevronRight } from 'lucide-react';

export interface QuotaLimitModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onOpenPlans?: () => void;
  title?: string;
  subtitle?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
}

export const QuotaLimitModal: React.FC<QuotaLimitModalProps> = ({
  isOpen,
  onClose,
  onOpenPlans,
  title = 'Você atingiu sua cota diária',
  subtitle = 'Você já utilizou todas as suas interações de hoje. Sua cota será renovada amanhã às 5h.',
  ctaTitle = 'Conheça o LYX Plus',
  ctaSubtitle = 'Tenha uso ilimitado, mais vozes e recursos exclusivos.',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Card Glassmorphism correspondente exatamente à imagem */}
      <div
        className="relative w-full max-w-lg rounded-[32px] bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_20px_60px_rgba(30,58,138,0.14)] p-6 sm:p-8 text-slate-800 transition-all overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -15px rgba(245, 158, 11, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
        }}
      >
        {/* Glow Dourado Orgânico no Canto Direito */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-tl from-amber-200/40 via-yellow-100/25 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Topo: Ícone Coroa Dourada + Textos */}
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Círculo Perolado com Coroa Dourada */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-100/80 via-white to-amber-200/60 p-[1.5px] shadow-[0_4px_16px_rgba(217,119,6,0.2)] flex items-center justify-center shrink-0 border border-amber-200/70">
            <div className="w-full h-full rounded-full bg-white/95 flex items-center justify-center">
              <Crown
                className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 drop-shadow-xs fill-amber-500/20"
                strokeWidth={1.8}
              />
            </div>
          </div>

          {/* Textos Principais */}
          <div className="flex-1 pt-0.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Card CTA Inferior: Conheça o LYX Plus */}
        <div
          onClick={() => {
            if (onOpenPlans) onOpenPlans();
          }}
          className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-amber-100/40 to-yellow-50/80 border border-amber-200/60 flex items-center gap-3.5 cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all group"
        >
          {/* Círculo com Estrela/Brilho */}
          <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-amber-200/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>

          {/* Texto do CTA */}
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
              {ctaTitle}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 font-normal truncate sm:whitespace-normal">
              {ctaSubtitle}
            </div>
          </div>

          <ChevronRight size={18} className="text-amber-600/70 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
        </div>
      </div>
    </div>
  );
};
