
import React, { useState, useEffect } from 'react';
import { Settings, Check, Sparkles, Volume2, X, Sliders, ChevronRight, Lock, Crown, ArrowRight } from 'lucide-react';

export interface NativeVoiceOption {
  id: string;
  name: string;
  lang: string;
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
  previewTtsSample: string;
}

export const VOICE_STYLES: VoiceStyleOption[] = [
  {
    id: 'jovem',
    name: 'Jovem & Enérgica',
    badge: 'Padrão',
    description: 'Espontânea, positiva e com ritmo animado',
    speakerId: 0,
    isPlusOnly: false,
    speed: 1.15,
    pitch: 1.20,
    rate: 1.15,
    icon: '⚡',
    previewTtsSample: 'Oi! Que bom ter você aqui. Vamos conversar e fazer coisas incríveis hoje!'
  },
  {
    id: 'calma',
    name: 'Calma & Suave',
    badge: 'Plus',
    description: 'Acolhedora, relaxante e confortável',
    speakerId: 1,
    isPlusOnly: true,
    speed: 0.90,
    pitch: 0.95,
    rate: 0.90,
    icon: '🍃',
    previewTtsSample: 'Olá. Estou aqui para te ajudar, no seu tempo e com toda a tranquilidade.'
  },
  {
    id: 'focada',
    name: 'Direta & Focada',
    badge: 'Plus',
    description: 'Objetiva, segura e com foco imediato',
    speakerId: 2,
    isPlusOnly: true,
    speed: 1.10,
    pitch: 1.05,
    rate: 1.10,
    icon: '🎯',
    previewTtsSample: 'Pronto. Vamos focar nos resultados e resolver isso de forma eficiente.'
  },
  {
    id: 'natural',
    name: 'Natural (Padrão)',
    badge: 'Plus',
    description: 'Tom equilibrado, elegante e orgânico',
    speakerId: 3,
    isPlusOnly: true,
    speed: 1.00,
    pitch: 1.00,
    rate: 1.00,
    icon: '✨',
    previewTtsSample: 'Olá. É um prazer falar com você. Estou pronta para começarmos.'
  }
];

export interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewSpeech?: (text: string, pitch: number, rate: number) => void;
  onOpenPlans?: () => void;
  userPlan?: string;
  currentStyleId?: string;
  onChangeStyle?: (styleId: string) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  onPreviewSpeech,
  onOpenPlans,
  userPlan = 'Membro Alpha',
  currentStyleId = 'jovem',
  onChangeStyle
}) => {
  const [activeTab, setActiveTab] = useState<'style' | 'voices'>('style');
  const [nativeVoices, setNativeVoices] = useState<NativeVoiceOption[]>([]);
  
  // Local state for the modal until save is clicked
  const [selectedStyleId, setSelectedStyleId] = useState<string>(currentStyleId);
  const [selectedNativeVoiceId, setSelectedNativeVoiceId] = useState<string>('lyx_nativa');

  const isUserPlus = userPlan === 'LYX Plus';

  useEffect(() => {
    setSelectedStyleId(currentStyleId);
  }, [currentStyleId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchVoices = () => {
      let synthVoices = window.speechSynthesis.getVoices();
      
      // Filter for pt-BR voices, ideally female sounding names or just generic pt-br
      let ptbr = synthVoices.filter(v => {
        const langMatch = v.lang.toLowerCase().includes('pt-br');
        const isMale = /thiago|antonio|ricardo|daniel|pedro|joão|joao/i.test(v.name);
        return langMatch && !isMale;
      });
      
      const formatted = ptbr.map(v => ({
        id: v.voiceURI,
        name: v.name,
        lang: v.lang
      }));
      setNativeVoices(formatted);
    };

    fetchVoices();
    window.speechSynthesis.onvoiceschanged = fetchVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onChangeStyle) {
      onChangeStyle(selectedStyleId);
    }
    onClose();
  };

  const activeStyle = VOICE_STYLES.find(s => s.id === selectedStyleId) || VOICE_STYLES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[440px] bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_60px_rgba(20,36,93,0.15)] border border-white/80 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">Voz & Síntese</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tom de voz e motor nativo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* TABS */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="flex gap-1.5 p-1 bg-slate-100/70 rounded-xl shadow-inner">
            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'style'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Tom da Voz
            </button>
            <button
              onClick={() => setActiveTab('voices')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'voices'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Voz Nativa ({nativeVoices.length > 0 ? nativeVoices.length + 1 : 2})
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 custom-scrollbar">
          
          {/* ABA: TOM DA VOZ */}
          {activeTab === 'style' && (
            <div className="space-y-3 px-2">
              {VOICE_STYLES.map((style) => {
                const isSelected = selectedStyleId === style.id;
                const isLocked = !isUserPlus && style.isPlusOnly;
                
                return (
                  <div
                    key={style.id}
                    onClick={() => {
                      if (isLocked) {
                        if (onOpenPlans) onOpenPlans();
                      } else {
                        setSelectedStyleId(style.id);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isLocked
                        ? 'bg-slate-50/40 border-slate-100/50 opacity-60 grayscale-[0.3]'
                        : isSelected
                          ? 'bg-blue-50/60 border-blue-200/80 shadow-sm'
                          : 'bg-white border-slate-100 hover:border-blue-200/60 hover:bg-slate-50 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm truncate ${isSelected && !isLocked ? 'text-blue-900' : 'text-slate-700'}`}>
                          {style.name}
                        </span>
                        
                        {!style.isPlusOnly ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700 text-[9px] font-bold tracking-wide uppercase border border-blue-200/40">
                            Padrão
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-700 text-[9px] font-bold tracking-wide uppercase border border-amber-200/40 shadow-sm">
                            Plus
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] leading-relaxed ${isSelected && !isLocked ? 'text-blue-700/80' : 'text-slate-500'}`}>
                        {style.description}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onPreviewSpeech) onPreviewSpeech(style.previewTtsSample, style.pitch, style.rate);
                          }}
                          className="w-8 h-8 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-blue-600 transition-colors"
                        >
                          <Volume2 size={16} />
                        </button>
                      )}
                      
                      {isLocked ? (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 opacity-80">
                          <Lock size={15} strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md scale-100'
                            : 'bg-transparent border-2 border-slate-200 scale-90 opacity-40'
                        }`}>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ABA: VOZ NATIVA */}
          {activeTab === 'voices' && (
            <div className="space-y-3 px-2">
              
              {/* Voz LYX Padrão (Sempre Liberada) */}
              <div
                onClick={() => setSelectedNativeVoiceId('lyx_nativa')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedNativeVoiceId === 'lyx_nativa'
                    ? 'bg-blue-50/60 border-blue-200/80 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-blue-200/60 hover:bg-slate-50 hover:shadow-xs'
                }`}
              >
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <span className={`font-bold text-sm truncate ${selectedNativeVoiceId === 'lyx_nativa' ? 'text-blue-900' : 'text-slate-700'}`}>
                    LYX (pt-BR)
                  </span>
                  <span className={`text-[11px] leading-relaxed ${selectedNativeVoiceId === 'lyx_nativa' ? 'text-blue-700/80' : 'text-slate-500'}`}>
                    pt-BR · Voz natural expressiva
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPreviewSpeech) onPreviewSpeech('Oi. Essa é a voz padrão do sistema.', 1, 1);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-blue-600 transition-colors"
                  >
                    <Volume2 size={16} />
                  </button>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    selectedNativeVoiceId === 'lyx_nativa'
                      ? 'bg-blue-600 text-white shadow-md scale-100'
                      : 'bg-transparent border-2 border-slate-200 scale-90 opacity-40'
                  }`}>
                    {selectedNativeVoiceId === 'lyx_nativa' && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              </div>

              {/* Vozes Nativas Detectadas (Fortemente Desfocadas no Free) */}
              {(nativeVoices.length > 0 ? nativeVoices : [
                  {id: 'mock1', name: 'Joana (pt-PT)', lang: 'pt-PT · Suave e elegante'},
                  {id: 'mock2', name: 'Ricardo (pt-BR)', lang: 'pt-BR · Grave e formal'}
              ]).map((voice) => {
                const isSelected = selectedNativeVoiceId === voice.id;
                const isLocked = !isUserPlus; // Todas as outras são PLUS
                
                return (
                  <div
                    key={voice.id}
                    onClick={() => {
                      if (isLocked) {
                        if (onOpenPlans) onOpenPlans();
                      } else {
                        setSelectedNativeVoiceId(voice.id);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isLocked
                        ? 'bg-slate-50/20 border-slate-100/30 blur-[2.5px] opacity-60 hover:blur-[1px] grayscale-[0.2]'
                        : isSelected
                          ? 'bg-blue-50/60 border-blue-200/80 shadow-sm'
                          : 'bg-white border-slate-100 hover:border-blue-200/60 hover:bg-slate-50 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm truncate ${isSelected && !isLocked ? 'text-blue-900' : 'text-slate-700'}`}>
                          {voice.name}
                        </span>
                        {isLocked && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-700 text-[9px] font-bold tracking-wide uppercase border border-amber-200/40 shadow-sm">
                            Plus
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] leading-relaxed ${isSelected && !isLocked ? 'text-blue-700/80' : 'text-slate-500'}`}>
                        {voice.lang}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onPreviewSpeech) onPreviewSpeech('Testando a voz selecionada.', 1, 1);
                          }}
                          className="w-8 h-8 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-blue-600 transition-colors"
                        >
                          <Volume2 size={16} />
                        </button>
                      )}
                      
                      {isLocked ? (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500/80">
                          <Lock size={15} strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md scale-100'
                            : 'bg-transparent border-2 border-slate-200 scale-90 opacity-40'
                        }`}>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-slate-100/80 bg-white/60 flex items-center justify-between shrink-0 rounded-b-[32px]">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <span className="text-slate-400">{activeTab === 'style' ? 'Estilo:' : 'Voz:'}</span> 
            <span className="text-blue-600">
              {activeTab === 'style' 
                ? activeStyle.name.split(' &')[0]
                : (selectedNativeVoiceId === 'lyx_nativa' ? 'LYX (pt-BR)' : nativeVoices.find(v => v.id === selectedNativeVoiceId)?.name || 'Nativa')
              }
            </span>
          </span>

          {!isUserPlus ? (
            <button
              onClick={() => onOpenPlans && onOpenPlans()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white text-[13px] font-bold shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 border border-indigo-400/30"
            >
              <Crown size={15} className="text-amber-300 fill-amber-300/20" />
              Desbloquear todas no Plus
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              Confirmar
              <ArrowRight size={14} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
