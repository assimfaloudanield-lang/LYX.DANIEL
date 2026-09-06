import React, { useState, useRef, useEffect } from 'react';
import { Settings, Check, Sparkles, Volume2, X, Sliders, ChevronRight, Lock, Crown, ArrowRight } from 'lucide-react';

export interface NativeVoiceOption {
  id: string;
  name: string;
  lang: string;
  isCurrent?: boolean;
}

export interface VoiceStyleOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  speakerId: number;
  isPlusOnly?: boolean;
  speed: number;
  pitch: number;
  rate: number;
  icon: string;
  visualSample: string;
  previewTtsSample: string;
}

export const VOICE_STYLES: VoiceStyleOption[] = [
  {
    id: 'natural_dora',
    name: 'Dora (Voz Padrão)',
    badge: 'FREE & PLUS',
    description: 'Voz feminina oficial, tom equilibrado, elegante e orgânico',
    speakerId: 42,
    isPlusOnly: false,
    speed: 1.00,
    pitch: 1.00,
    rate: 1.00,
    icon: 'sparkles',
    visualSample: 'Olá, sou a LYX, feita pra acompanhar você.',
    previewTtsSample: 'Olá, sou a Líquis, feita pra acompanhar você.',
  },
  {
    id: 'young_energetic',
    name: 'Jovem & Enérgica',
    badge: 'PLUS',
    description: 'Voz feminina espontânea, positiva e com ritmo animado',
    speakerId: 38,
    isPlusOnly: true,
    speed: 1.12,
    pitch: 1.05,
    rate: 1.12,
    icon: 'zap',
    visualSample: 'Olá, sou a LYX, feita pra acompanhar você.',
    previewTtsSample: 'Olá! Sou a Líquis, feita pra acompanhar você.',
  },
  {
    id: 'calm_gentle',
    name: 'Calma & Suave',
    badge: 'PLUS',
    description: 'Voz feminina acolhedora, relaxante e confortável',
    speakerId: 40,
    isPlusOnly: true,
    speed: 0.90,
    pitch: 0.98,
    rate: 0.90,
    icon: 'moon',
    visualSample: 'Olá, sou a LYX, feita pra acompanhar você.',
    previewTtsSample: 'Olá... sou a Líquis, feita pra acompanhar você.',
  },
  {
    id: 'direct_agile',
    name: 'Direta & Focada',
    badge: 'PLUS',
    description: 'Voz feminina objetiva, segura e com foco imediato',
    speakerId: 44,
    isPlusOnly: true,
    speed: 1.02,
    pitch: 1.00,
    rate: 1.02,
    icon: 'flame',
    visualSample: 'Olá, sou a LYX, feita pra acompanhar você.',
    previewTtsSample: 'Olá. Sou a Líquis, feita pra acompanhar você.',
  },
];

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyleId?: string;
  onSelectStyle?: (style: VoiceStyleOption) => void;
  onPreviewSpeech?: (text: string, pitch: number, rate: number) => void;
  voices?: NativeVoiceOption[];
  currentVoiceId?: string;
  onSelectVoice?: (voiceId: string) => void;
  onRefreshVoices?: () => void;
  onOpenPlans?: () => void;
  userPlan?: 'Membro Alpha' | 'LYX Essencial' | 'LYX Plus';
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  currentStyleId = 'natural_dora',
  onSelectStyle,
  onPreviewSpeech,
  voices = [],
  currentVoiceId,
  onSelectVoice,
  onRefreshVoices,
  onOpenPlans,
  userPlan = 'Membro Alpha',
}) => {
  const [activeTab, setActiveTab] = useState<'style' | 'voices'>('style');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && onRefreshVoices) {
      onRefreshVoices();
    }
  }, [isOpen, onRefreshVoices]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isUserPlus = userPlan === 'LYX Plus';
  const currentStyle = VOICE_STYLES.find((s) => s.id === currentStyleId) || VOICE_STYLES[0];

  const handleStyleClick = (style: VoiceStyleOption) => {
    if (style.isPlusOnly && !isUserPlus) {
      if (onPreviewSpeech) {
        onPreviewSpeech(style.previewTtsSample, style.pitch, style.rate);
      }
      if (onOpenPlans) {
        onOpenPlans();
      }
      return;
    }
    if (onSelectStyle) onSelectStyle(style);
    if (onPreviewSpeech) {
      onPreviewSpeech(style.previewTtsSample, style.pitch, style.rate);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-settings-title"
    >
      {/* Backdrop com blur suave */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Card Glass Premium Clean */}
      <div
        ref={modalRef}
        className="relative w-full max-w-sm rounded-[24px] bg-white/90 backdrop-blur-2xl border border-white/60 shadow-[0_20px_60px_rgba(20,36,93,0.12)] p-5 text-slate-800 transition-all transform animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header com estilo elegante */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Sliders size={16} strokeWidth={1.8} />
            </div>
            <div>
              <h3 id="voice-settings-title" className="text-[13px] font-semibold text-slate-900 leading-tight">
                Voz & Síntese
              </h3>
              <p className="text-[10px] text-slate-500">Dora no Free • Vozes Femininas no Plus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Fechar"
          >
            <X size={15} />
          </button>
        </div>

        {/* Abas discretas / Pill selector */}
        <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl my-3.5">
          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-1.5 px-3 text-[11px] font-medium rounded-lg transition-all ${
              activeTab === 'style'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Vozes ({VOICE_STYLES.length})
          </button>
          <button
            onClick={() => setActiveTab('voices')}
            className={`flex-1 py-1.5 px-3 text-[11px] font-medium rounded-lg transition-all ${
              activeTab === 'voices'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Voz Nativa ({voices.length || 'Auto'})
          </button>
        </div>

        {/* Conteúdo Aba: Tom da Voz */}
        {activeTab === 'style' && (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
            {VOICE_STYLES.map((style) => {
              const isSelected = style.id === currentStyleId;
              const isLocked = style.isPlusOnly && !isUserPlus;
              
              return (
                <div
                  key={style.id}
                  onClick={() => handleStyleClick(style)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isLocked
                      ? 'bg-slate-50/50 border-slate-100 opacity-60 grayscale-[0.2]'
                      : isSelected
                        ? 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-blue-200/60 hover:bg-slate-50 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isLocked 
                          ? 'bg-slate-100 text-slate-400' 
                          : isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {isLocked ? <Lock size={14} /> : <span className="text-sm font-semibold">{style.icon}</span>}
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${isSelected && !isLocked ? 'text-blue-950' : 'text-slate-800'}`}>
                            {style.name}
                          </span>
                          {!style.isPlusOnly && (
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold tracking-wide uppercase border border-blue-200/50">
                              Padrão
                            </span>
                          )}
                          {style.isPlusOnly && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold tracking-wide uppercase border border-amber-200/50">
                              Plus
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">{style.description}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onPreviewSpeech) onPreviewSpeech(style.previewTtsSample, style.pitch, style.rate);
                          }}
                          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                        >
                          <Volume2 size={14} />
                        </button>
                      )}
                      
                      {isLocked ? (
                        <div className="w-6 h-6 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-400">
                          <Lock size={12} />
                        </div>
                      ) : (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md scale-100'
                            : 'bg-transparent border-2 border-slate-200 scale-90 opacity-60'
                        }`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Conteúdo Aba: Vozes Nativas (Google / Android / Web) */}
        {activeTab === 'voices' && (
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-0.5">
            {voices.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-[11px]">
                <p>Nenhuma voz nativa adicional detectada.</p>
                <p className="text-[10px] text-slate-400 mt-1">Usando motor neural padrão pt-BR do sistema.</p>
              </div>
            ) : (
              voices.map((voice) => {
                const isSelected = voice.id === currentVoiceId;
                return (
                  <div
                    key={voice.id}
                    onClick={() => onSelectVoice && onSelectVoice(voice.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-200/80'
                        : 'bg-white/60 border-slate-200/60 hover:bg-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-[11px] truncate ${isSelected ? 'text-blue-700 font-semibold' : 'text-slate-700 font-medium'}`}>
                        {voice.name}
                      </p>
                      <p className="text-[9px] text-slate-400">{voice.lang}</p>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <Check size={10} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Rodapé sutil */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <div className="text-slate-400">
            Estilo: <strong className="text-slate-600 font-medium">{currentStyle.name}</strong>
          </div>
          {onOpenPlans ? (
            <button
              type="button"
              onClick={onOpenPlans}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 hover:underline"
            >
              <span>Desbloquear todas no Plus</span>
              <ChevronRight size={10} strokeWidth={2.5} />
            </button>
          ) : (
            <span className="text-emerald-600 font-medium">Motor Ativo</span>
          )}
        </div>
      </div>
    </div>
  );
};
