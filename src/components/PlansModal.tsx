import React, { useState } from 'react';
import { X, Check, ChevronRight, Gift, Sparkles, Shield, Clock, Lock } from 'lucide-react';

export interface PlanBenefit {
  text: string;
  isBold?: boolean;
}

export interface PlanItem {
  id: 'free' | 'plus';
  productId: string; // ID correspondente para Google Play Console
  badgeCategory: string;
  name: string;
  tagline: string;
  price?: string;
  period?: string;
  benefits: PlanBenefit[];
  isCurrent?: boolean;
  highlight?: boolean;
}

export const PLANS_CONFIG: PlanItem[] = [
  {
    id: 'free',
    productId: 'lyx_plan_free',
    badgeCategory: 'PLANO',
    name: 'Free',
    tagline: 'Conheça a LYX de verdade.',
    benefits: [
      { text: '2 horas de conversa por voz por dia' },
      { text: '1 voz da LYX' },
      { text: 'Conversas por texto' },
      { text: 'Histórico de conversas' },
      { text: 'Memórias e preferências' },
      { text: 'Contexto das conversas' },
    ],
  },
  {
    id: 'plus',
    productId: 'lyx_plus_monthly_3990',
    badgeCategory: 'PLANO',
    name: 'Plus',
    tagline: 'Converse à vontade com a LYX.',
    price: 'R$ 39,90',
    period: '/ mês',
    highlight: true,
    benefits: [
      { text: 'Conversas por voz à vontade', isBold: true },
      { text: 'Conversas por texto à vontade' },
      { text: 'Todas as vozes da LYX' },
      { text: 'Respostas mais longas e detalhadas' },
      { text: 'Suporte prioritário' },
      { text: 'Acesso antecipado a novos recursos' },
    ],
  },
];

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (planId: 'free' | 'plus', isTrial: boolean) => void;
  currentPlanId?: string;
}

export const PlansModal: React.FC<PlansModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  currentPlanId = 'free',
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'free' | 'plus'>('plus');

  if (!isOpen) return null;

  const handleStartTrial = (planId: 'free' | 'plus' = 'plus') => {
    if (onSelectPlan) {
      onSelectPlan(planId, true);
    }
  };

  const handleDirectSubscribe = () => {
    if (onSelectPlan) {
      onSelectPlan('plus', false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/45 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[88%] min-h-[420px] overflow-y-auto rounded-[32px] bg-gradient-to-b from-white via-white/95 to-slate-50 border border-white/80 p-5 sm:p-8 text-slate-800 transition-all flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 70px -15px rgba(30, 58, 138, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
          maxHeight: '88%',
          minHeight: '400px',
        }}
      >
        {/* Glows Decorativos de Fundo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-200/25 via-yellow-100/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-200/25 via-indigo-100/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20 cursor-pointer"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {/* Cabeçalho Principal */}
        <div className="text-center max-w-xl mx-auto pt-2 pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Escolha seu{' '}
            <span className="bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-700 bg-clip-text text-transparent">
              plano
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Mais liberdade e inteligência no seu dia a dia com a LYX.
          </p>
        </div>

        {/* Banner Top: 5 dias de teste gratuito */}
        <div
          onClick={() => handleStartTrial('plus')}
          className="max-w-2xl mx-auto mb-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-yellow-50/80 to-amber-100/80 border border-amber-300/70 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-xs border border-amber-200/80 group-hover:scale-105 transition-transform">
              <Gift size={20} className="text-amber-600" />
            </div>
            <div className="text-left">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                Ganhe 5 dias de teste gratuito no Plus
              </div>
              <div className="text-[11px] sm:text-xs text-slate-600">
                Sem cobrança imediata. Experimente todos os recursos da LYX.
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </div>

        {/* Grid dos Cards de Planos: Free vs Plus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch justify-center">
          
          {/* 1. PLANO FREE */}
          <div
            onClick={() => setSelectedPlanId('free')}
            className={`relative rounded-[28px] p-[1.5px] overflow-hidden transition-all duration-300 cursor-pointer ${
              selectedPlanId === 'free'
                ? 'shadow-[0_12px_35px_rgba(59,130,246,0.18)] scale-[1.01]'
                : 'hover:shadow-md'
            }`}
          >
            {/* Borda Dinâmica / Stroke Azul Suave */}
            <div className="absolute inset-[-100%] animate-rotate-slow bg-[conic-gradient(from_0deg,#93C5FD,#3B82F6,#60A5FA,#BFDBFE,#93C5FD)] opacity-70 pointer-events-none" />

            {/* Conteúdo Interno do Card Free */}
            <div className="relative w-full h-full rounded-[26.5px] p-6 sm:p-7 bg-white flex flex-col justify-between z-10">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  PLANO
                </div>
                <h3 className="text-3xl font-extrabold text-slate-950 mt-0.5 tracking-tight">
                  Free
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500 mt-1 leading-relaxed font-normal">
                  Conheça a LYX de verdade.
                </p>

                <div className="my-5 border-t border-slate-100" />

                {/* Lista de Benefícios Free */}
                <ul className="space-y-3">
                  {PLANS_CONFIG[0].benefits.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-[12.5px] text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="leading-snug">{b.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botão Status Free */}
              <div className="mt-8 pt-2">
                <div className="w-full py-3 px-4 rounded-2xl bg-slate-100/90 border border-slate-200/80 text-center">
                  <span className="text-xs font-bold text-slate-700 block">
                    Plano atual
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Você está no plano Free
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. PLANO PLUS (COM STROKE DOURADO IMPERIAL METÁLICO & BRONZE COM ALTO CONTRASTE) */}
          <div
            onClick={() => setSelectedPlanId('plus')}
            className={`relative rounded-[28px] p-[2.5px] overflow-hidden transition-all duration-300 cursor-pointer ${
              selectedPlanId === 'plus'
                ? 'shadow-[0_18px_50px_rgba(245,158,11,0.32)] scale-[1.02]'
                : 'hover:shadow-lg'
            }`}
          >
            {/* Borda Dinâmica / Stroke Dourado Imperial Metálico com reflexos escuros e claros de alto contraste */}
            <div className="absolute inset-[-100%] animate-rotate-slow bg-[conic-gradient(from_0deg,#B45309,#F59E0B,#FEF08A,#78350F,#D97706,#FEF9C3,#B45309,#F59E0B,#78350F,#FEF08A,#B45309)] opacity-100 pointer-events-none" />

            {/* Conteúdo Interno do Card Plus - com iluminação e degradê dinâmico dourado em movimento */}
            <div className="relative w-full h-full rounded-[25.5px] p-6 sm:p-7 bg-white overflow-hidden flex flex-col justify-between z-10">
              
              {/* Efeito de Degradê Dourado Dinâmico em Movimento Fluido Interno */}
              <div 
                className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] pointer-events-none opacity-40 animate-rotate-slow"
                style={{
                  background: 'radial-gradient(circle at 40% 40%, rgba(251, 191, 36, 0.45), rgba(245, 158, 11, 0.25) 35%, rgba(254, 243, 199, 0.15) 55%, transparent 70%)',
                }}
              />
              <div 
                className="absolute inset-0 pointer-events-none bg-gradient-to-b from-amber-50/40 via-transparent to-amber-50/30"
              />

              <div className="relative z-10">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  PLANO
                </div>
                <h3 className="text-3xl font-extrabold text-slate-950 mt-0.5 tracking-tight">
                  Plus
                </h3>
                <p className="text-xs sm:text-[13px] text-amber-900 font-bold mt-1 leading-relaxed">
                  Converse à vontade com a LYX.
                </p>

                <div className="my-5 border-t border-amber-100/80" />

                {/* Lista de Benefícios Plus */}
                <ul className="space-y-3">
                  {PLANS_CONFIG[1].benefits.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-[12.5px] text-slate-800">
                      <div className="w-5 h-5 rounded-full bg-amber-200/90 text-amber-900 flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className={`leading-snug ${b.isBold ? 'font-bold text-slate-950' : 'text-slate-800'}`}>
                        {b.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Preço Plus */}
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                    R$ 39,90
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 font-medium">/ mês</span>
                </div>
              </div>

              {/* Botão Ação Plus com Dourado Vibrante */}
              <div className="mt-6 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectSubscribe();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:brightness-105 active:scale-[0.99] text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(245,158,11,0.4)] cursor-pointer"
                >
                  <span>Assinar plano Plus</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Botão Secundário: Testar por 5 dias */}
        <div className="text-center max-w-xs mx-auto mt-6">
          <button
            type="button"
            onClick={() => handleStartTrial('plus')}
            className="w-full py-2.5 px-4 rounded-full bg-amber-50 hover:bg-amber-100/90 border border-amber-300/80 text-amber-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Iniciar 5 dias de teste grátis</span>
            <ChevronRight size={13} className="text-amber-700" />
          </button>
        </div>

        {/* Selos de Confiança e Garantias Inferiores */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center">
          <div className="flex items-center gap-2 text-left">
            <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Lock size={12} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-800 leading-tight">
                5 dias grátis
              </div>
              <div className="text-[9px] text-slate-400">Sem compromisso.</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-left">
            <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={12} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-800 leading-tight">
                Cancele quando quiser
              </div>
              <div className="text-[9px] text-slate-400">Direto na Play Store.</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-left">
            <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Shield size={12} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-800 leading-tight">
                Google Play Billing
              </div>
              <div className="text-[9px] text-slate-400">Pagamento 100% seguro.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
