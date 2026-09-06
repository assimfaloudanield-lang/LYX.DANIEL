import React, { useState, useRef, useEffect } from 'react';
import { Settings, Check, Sparkles, Zap, Moon, Flame, X } from 'lucide-react';

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
  speed: number;
  pitch: number;
  rate: number;
  icon: string;
  visualSample: string;
  previewTtsSample: string;
}

export const VOICE_STYLES: VoiceStyleOption[] = [
  {
    id: 'young_energetic',
    name: 'Jovem & Enérgica',
    badge: 'VIBRANTE',
    description: 'Fala jovem, viva, espontânea, positiva e energética',
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
    badge: 'RELAXANTE',
    description: 'Fala tranquila, acolhedora, serena e confortável',
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
    badge: 'ÁGIL',
    description: 'Fala segura, objetiva, inteligente e precisa',
    speed: 1.02,
    pitch: 1.00,
    rate: 1.02,
    icon: 'flame',
    visualSample: 'Olá, sou a LYX, feita pra acompanhar você.',
    previewTtsSample: 'Olá. Sou a Líquis, feita pra acompanhar você.',
  },
  {
    id: 'natural_balanced',
    name: 'Natural (Padrão)',
    badge: 'EQUILIBRADA',
    description: 'Fala equilibrada, humana e espontânea',
    speed: 1.00,
    pitch: 1.00,
    rate: 1.00,
    icon: 'sparkles',
    visualSample: 'Olá, sou a LYX, feita pra acompanhar você.',
    previewTtsSample: 'Olá, sou a Líquis, feita pra acompanhar você.',
  },
];

interface LanguageSelectorProps {
  currentStyleId?: string;
  onSelectStyle?: (style: VoiceStyleOption) => void;
  onPreviewSpeech?: (text: string, pitch: number, rate: number) => void;
  dropdownAlign?: 'left' | 'right';
  voices?: NativeVoiceOption[];
  currentVoiceId?: string;
  onSelectVoice?: (voiceId: string) => void;
  currentLanguage?: string;
  onSelectLanguage?: (code: string) => void;
  onRefreshVoices?: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentStyleId = 'natural_balanced',
  onSelectStyle,
  onPreviewSpeech,
  dropdownAlign = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectStyle = (style: VoiceStyleOption) => {
    if (onSelectStyle) {
      onSelectStyle(style);
    }
    if (onPreviewSpeech) {
      onPreviewSpeech(style.previewTtsSample, style.pitch, style.rate);
    }
  };

  const renderStyleIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'moon':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'flame':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'sparkles':
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  const currentStyle = VOICE_STYLES.find((s) => s.id === currentStyleId) || VOICE_STYLES[3];

  return (
    <div ref={containerRef} className="relative z-30 pointer-events-auto">
      {/* Botão Micro de Configuração da Voz (Engrenagem / Estilos) */}
      <button
        id="voice-style-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Configurações de Estilo da Voz"
        aria-expanded={isOpen}
        title={`Estilo de Voz: ${currentStyle.name} (pf_dora)`}
        className="w-11 h-11 rounded-full flex items-center justify-center bg-white/[0.03] border-[0.5px] border-[#818CF8]/30 backdrop-blur-md shadow-[0_0_10px_rgba(129,140,248,0.1)] active:scale-95 transition-all"
      >
        <Settings size={20} className="text-white outline-none" strokeWidth={1.5} />
      </button>

      {/* Dropdown Menu de Estilos de Voz */}
      {isOpen && (
        <div
          id="voice-style-dropdown"
          className={`absolute top-full ${
            dropdownAlign === 'right' ? 'right-0' : 'left-0'
          } mt-2.5 w-76 sm:w-80 py-3 px-3 rounded-2xl bg-[#090814]/98 border border-white/15 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.9),0_0_24px_rgba(168,85,247,0.2)] animate-in fade-in zoom-in-95 duration-200`}
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white tracking-wide">Módulos de Voz</h4>
                <p className="text-[9px] text-white/50">pf_dora · pt-BR (Kokoro Neural)</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/40 hover:text-white p-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lista de Estilos de Fala */}
          <div className="py-2.5 space-y-1.5 max-h-[320px] overflow-y-auto pr-0.5">
            {VOICE_STYLES.map((style) => {
              const isSelected = style.id === currentStyleId;
              return (
                <div
                  key={style.id}
                  id={`voice-style-${style.id}`}
                  onClick={() => handleSelectStyle(style)}
                  className={`group relative p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                  }`}
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded-lg shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-white/5 text-white/60 group-hover:text-white group-hover:bg-white/10'
                    }`}
                  >
                    {renderStyleIcon(style.icon)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <span
                        className={`text-xs font-medium tracking-tight truncate ${
                          isSelected ? 'text-purple-200 font-semibold' : 'text-white/90'
                        }`}
                      >
                        {style.name}
                      </span>
                      <span
                        className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                      >
                        {style.badge}
                      </span>
                    </div>

                    <p className="text-[10px] text-white/50 leading-snug line-clamp-1">
                      {style.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="shrink-0 self-center">
                      <Check className="w-4 h-4 text-purple-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Rodapé Informativo */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-white/40">
            <span>Speaker: pf_dora (24 kHz)</span>
            <span className="text-emerald-400 font-medium">Local / 100% Offline</span>
          </div>
        </div>
      )}
    </div>
  );
};
