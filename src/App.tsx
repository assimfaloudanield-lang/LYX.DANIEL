import { useState, useEffect, useRef, useCallback } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HScreen } from './components/HScreen';
import { LanguageSelector, NativeVoiceOption, VoiceStyleOption, VOICE_STYLES } from './components/LanguageSelector';
import { JulsVoiceService, VoiceEngine, formatTextForTts } from './services/julsVoice';
import { QwenEngine, ChatHistoryMessage } from './services/qwenEngine';
import { playPowerOnSound, playPowerOffSound } from './services/soundEffects';
import { auth, onAuthStateChanged } from './services/firebase';
import { lyxStateMachine, LyxVoiceState } from './services/voiceStateMachine';

export interface AppChatMessage {
  id: string;
  sender: 'user' | 'lyx';
  text: string;
  isAudio?: boolean;
  audioDuration?: string;
  time: string;
}

declare global {
  interface Window {
    AndroidBridge?: {
      togglePower: (isOn: boolean) => void;
      isServiceActive?: () => boolean;
      selectLanguage?: (lang: string) => void;
      getNativeVoices?: () => string;
      setNativeVoice?: (voiceId: string) => void;
      getSelectedVoice?: () => string;
      setVoiceStyle?: (pitch: number, rate: number) => void;
      setVoiceStyleId?: (styleId: string) => void;
      getMemories?: () => string;
      saveMemory?: (key: string, content: string) => boolean;
      deleteMemory?: (id: string) => boolean;
      clearMemories?: () => boolean;
      getRelevantMemoryContext?: (query: string) => string;
      autoExtractMemory?: (text: string) => void;
      isModelDownloaded?: () => boolean;
      startModelDownload?: () => void;
      generateNativeResponse?: (prompt: string, historyJson: string) => void;
      speakNative?: (text: string) => void;
      speakNativeChunk?: (text: string, isFirstChunk: boolean) => void;
      stopSpeaking?: () => void;
      startListening?: () => void;
      stopListening?: () => void;
      runDiagnosticTests?: () => string;
    };
    onAndroidStateChanged?: (isOn: boolean, isListening: boolean) => void;
    onNativeVoicesLoaded?: (voicesData: unknown) => void;
    onSpeechStart?: () => void;
    onSpeechDone?: () => void;
    onUserInterrupted?: () => void;
    onVoicePartialRecognized?: (text: string) => void;
    onVoiceRecognized?: (text: string) => void;
    onModelDownloadProgress?: (
      downloaded: number,
      total: number,
      percent: number,
      dlMB: number,
      totalMB: number
    ) => void;
    onModelDownloadComplete?: () => void;
    onModelDownloadError?: (error: string) => void;
    onModelStatusChecked?: (isDownloaded: boolean) => void;
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('lyx_authenticated') === 'true';
  });
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('lyx_onboarded') === 'true';
  });
  const [isOn, setIsOn] = useState(false);
  const [voiceState, setVoiceState] = useState<LyxVoiceState>('IDLE');
  
  const [globalMessages, setGlobalMessages] = useState<AppChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('lyx_global_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [language, setLanguage] = useState<string>('pt-BR');
  const [nativeVoices, setNativeVoices] = useState<NativeVoiceOption[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => {
    return localStorage.getItem('lyx_selected_voice') || '';
  });
  const [selectedStyleId, setSelectedStyleId] = useState<string>(() => {
    return localStorage.getItem('lyx_voice_style') || 'natural_balanced';
  });
  const [diagnosticResults, setDiagnosticResults] = useState<Record<string, string> | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  // Estado do download do pacote neural de 1.1GB
  const [modelDownload, setModelDownload] = useState<{
    isDownloaded: boolean;
    isDownloading: boolean;
    progressPercent: number;
    downloadedMB: number;
    totalMB: number;
    error: string | null;
    showNotification: boolean;
  }>({
    isDownloaded: false,
    isDownloading: false,
    progressPercent: 0,
    downloadedMB: 0,
    totalMB: 1125,
    error: null,
    showNotification: true,
  });

  const julsServiceRef = useRef<JulsVoiceService | null>(null);
  const voiceEngineRef = useRef<VoiceEngine | null>(null);
  const qwenEngineRef = useRef<QwenEngine | null>(null);
  const isOnRef = useRef(isOn);
  isOnRef.current = isOn;
  const lastProcessedTextRef = useRef('');
  const lastProcessedTimeRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const hasProactedThisSilenceRef = useRef(false);

  // Sincroniza estado global do VoiceStateMachine
  useEffect(() => {
    const unsub = lyxStateMachine.subscribe((newState) => {
      setVoiceState(newState);
    });
    return unsub;
  }, []);

  // Persiste mensagens no LocalStorage
  useEffect(() => {
    localStorage.setItem('lyx_global_messages', JSON.stringify(globalMessages));
  }, [globalMessages]);

  const addMessage = useCallback((msg: AppChatMessage) => {
    setGlobalMessages((prev) => [...prev, msg]);
  }, []);

  // Mapeia mensagens do App para o ChatHistoryMessage do QwenEngine
  const getConversationHistory = useCallback((): ChatHistoryMessage[] => {
    return globalMessages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text,
    }));
  }, [globalMessages]);

  const refreshNativeVoices = useCallback(() => {
    // 1. Tenta obter diretamente pelo AndroidBridge se estiver no Android
    if (typeof window !== 'undefined' && window.AndroidBridge?.getNativeVoices) {
      try {
        const raw = window.AndroidBridge.getNativeVoices();
        if (raw) {
          const list = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (Array.isArray(list) && list.length > 0) {
            setNativeVoices(list);
            const current = list.find((v: NativeVoiceOption) => v.isCurrent);
            if (current) setSelectedVoiceId(current.id);
            return;
          }
        }
      } catch {
        // Fallback seguro
      }
    }

    // 2. Se estiver no browser, obtém as vozes nativas via Web Speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const browserVoices = window.speechSynthesis.getVoices();
      if (browserVoices.length > 0) {
        const ptVoices = browserVoices.filter((v) => v.lang.startsWith('pt'));
        const targetList = ptVoices.length > 0 ? ptVoices : browserVoices;
        const mapped: NativeVoiceOption[] = targetList.map((v) => ({
          id: v.name,
          name: `${v.name} (${v.lang})`,
          lang: v.lang,
        }));
        setNativeVoices(mapped);
      }
    }
  }, []);

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    localStorage.setItem('lyx_selected_voice', voiceId);
    if (window.AndroidBridge?.setNativeVoice) {
      window.AndroidBridge.setNativeVoice(voiceId);
    }
    julsServiceRef.current?.setVoiceById(voiceId);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    julsServiceRef.current?.setLanguage(newLang);
    voiceEngineRef.current?.setLanguage(newLang);
  };

  const handleStyleSelect = (style: VoiceStyleOption) => {
    setSelectedStyleId(style.id);
    localStorage.setItem('lyx_voice_style', style.id);
    julsServiceRef.current?.setPitchAndRate(style.pitch, style.rate);
    if (window.AndroidBridge?.setVoiceStyle) {
      window.AndroidBridge.setVoiceStyle(style.pitch, style.rate);
    }
    if (window.AndroidBridge?.setVoiceStyleId) {
      window.AndroidBridge.setVoiceStyleId(style.id);
    }
  };

  const handlePreviewSpeech = (text: string, pitch: number, rate: number) => {
    if (window.AndroidBridge?.speakNative) {
      window.AndroidBridge.speakNative(text);
      return;
    }
    if (!julsServiceRef.current) return;
    julsServiceRef.current.setPitchAndRate(pitch, rate);
    julsServiceRef.current.speak(text);
  };

  // Handles speech recognized by VoiceEngine through QwenEngine with loop & echo protection
  const handleVoiceInput = useCallback((texto: string) => {
    const clean = texto.trim();
    if (!clean || !isOnRef.current) return;

    // Cancela o timer de silêncio pois o usuário falou
    console.log('[GATE] input_received: "' + clean + '"');

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    hasProactedThisSilenceRef.current = false;

    // Se já estiver processando ou falando, ignora para não encadear frases
    if (voiceState === 'PROCESSING' || voiceState === 'SPEAKING' || julsServiceRef.current?.isSpeaking) {
      console.log('[GATE] should_respond: false (already processing or speaking)');
      return;
    }

    // Previne repetição imediata da mesma frase capturada duas vezes seguidas
    const now = Date.now();
    if (
      clean.toLowerCase() === lastProcessedTextRef.current.toLowerCase() &&
      now - lastProcessedTimeRef.current < 2500
    ) {
      console.log('[GATE] should_respond: false (duplicate phrase within 2.5s)');
      return;
    }

    console.log('[GATE] should_respond: true');
    console.log('[LLM] prompt_received: "' + clean + '"');

    lastProcessedTextRef.current = clean;
    lastProcessedTimeRef.current = now;
    lyxStateMachine.transition('PROCESSING');

    // Watchdog de segurança resiliente: nunca deixa a LYX travada
    const watchdog = setTimeout(() => {
      if (voiceState === 'PROCESSING') {
        if (voiceState !== 'IDLE') {
          lyxStateMachine.transition('LISTENING');
          if (window.AndroidBridge?.startListening) {
            window.AndroidBridge.startListening();
          } else {
            voiceEngineRef.current?.start();
          }
        }
      }
    }, 4500);

    // Pausa e cancela o reconhecimento para não ouvir a si mesma nem ruído
    voiceEngineRef.current?.stop();

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    let isFirstSpokenChunk = true;

    qwenEngineRef.current?.responderStream(
      clean,
      (sentenceChunk, isFirst, isFinal) => {
        if (voiceState === 'IDLE' || abortControllerRef.current?.signal.aborted) return;
        lyxStateMachine.transition('SPEAKING');
        console.log('[TTS] chunk_sent_to_bridge: "' + sentenceChunk + '" (isFirst: ' + isFirstSpokenChunk + ')');

        if (window.AndroidBridge?.speakNativeChunk) {
          window.AndroidBridge.speakNativeChunk(formatTextForTts(sentenceChunk), isFirstSpokenChunk);
          isFirstSpokenChunk = false;
        } else if (window.AndroidBridge?.speakNative && isFirst) {
          window.AndroidBridge.speakNative(formatTextForTts(sentenceChunk));
          isFirstSpokenChunk = false;
        } else if (!window.AndroidBridge) {
          julsServiceRef.current?.speakChunk(sentenceChunk, isFirstSpokenChunk, isFinal, () => {
            if (voiceState !== 'IDLE' && !abortControllerRef.current?.signal.aborted) {
              voiceEngineRef.current?.start();
            }
          });
          isFirstSpokenChunk = false;
        }
      },
      (fullResposta) => {
        clearTimeout(watchdog);
        console.log('[LLM] response_generated: "' + fullResposta + '"');
        if (voiceState === 'IDLE' || abortControllerRef.current?.signal.aborted) {
          return;
        }

        // Armazena no histórico contínuo para manter memória e contexto real
        addMessage({
          id: (Date.now() + 1).toString(),
          sender: 'lyx',
          text: fullResposta,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        if (fullResposta.toLowerCase().includes('descanso') || fullResposta.toLowerCase().includes('até logo')) {
          const onDone = () => {
            setIsOn(false);
            lyxStateMachine.transition('IDLE');
          };

          if (window.AndroidBridge?.speakNative) {
            window.AndroidBridge.speakNative(formatTextForTts(fullResposta));
            setTimeout(onDone, 2000);
          } else {
            julsServiceRef.current?.speak(fullResposta, onDone);
          }
          return;
        }

        lyxStateMachine.transition('SPEAKING');
        const onDone = () => {
          // Pequeno resguardo para o som do alto-falante cessar completamente antes de reabrir o microfone
          setTimeout(() => {
            if (voiceState !== 'IDLE' && !abortControllerRef.current?.signal.aborted) {
              if (window.AndroidBridge?.startListening) {
                window.AndroidBridge.startListening();
              } else {
                voiceEngineRef.current?.start();
              }

              // Inicia o timer de iniciativa conversacional espontânea após período de silêncio (28s)
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                if (
                  voiceState === 'LISTENING' &&
                  !hasProactedThisSilenceRef.current &&
                  globalMessages.length >= 2
                ) {
                  const lastMsg = globalMessages[globalMessages.length - 1];
                  const lastText = (lastMsg?.text || '').toLowerCase();
                  if (
                    lastText.includes('descansa') ||
                    lastText.includes('até logo') ||
                    lastText.includes('tchau') ||
                    lastText.includes('até mais')
                  ) {
                    return;
                  }

                  hasProactedThisSilenceRef.current = true;
                  const proactiveThought = qwenEngineRef.current?.gerarProactiveThought(
                    selectedStyleId,
                    getConversationHistory()
                  );

                  if (proactiveThought) {
                    lyxStateMachine.transition('PROCESSING');
                    addMessage({
                      id: Date.now().toString(),
                      sender: 'lyx',
                      text: proactiveThought,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });

                    const onProactiveDone = () => {
                      if (voiceState !== 'IDLE') {
                        lyxStateMachine.transition('LISTENING');
                        if (window.AndroidBridge?.startListening) {
                          window.AndroidBridge.startListening();
                        } else {
                          voiceEngineRef.current?.start();
                        }
                      }
                    };

                    lyxStateMachine.transition('SPEAKING');
                    if (window.AndroidBridge?.speakNative) {
                      window.AndroidBridge.speakNative(formatTextForTts(proactiveThought));
                      const words = proactiveThought.split(/\s+/).length;
                      setTimeout(onProactiveDone, Math.max(1500, words * 280));
                    } else {
                      julsServiceRef.current?.speak(proactiveThought, onProactiveDone);
                    }
                  }
                }
              }, 28000);
            }
          }, 200);
        };

        if (window.AndroidBridge?.speakNative) {
          const wordCount = fullResposta.split(/\s+/).length;
          setTimeout(() => {
            if (voiceState !== 'IDLE' && !abortControllerRef.current?.signal.aborted) {
              onDone();
            }
          }, Math.max(1200, wordCount * 280));
        } else if (!window.AndroidBridge) {
          // O último chunk já aciona o callback de done.
        }
      },
      selectedStyleId,
      getConversationHistory(),
      abortControllerRef.current.signal
    );
  }, [selectedStyleId]);

  // Initialize Juls Voice Service, Qwen Engine & Voice Engine
  useEffect(() => {
    julsServiceRef.current = new JulsVoiceService();
    qwenEngineRef.current = new QwenEngine();
    voiceEngineRef.current = new VoiceEngine(
      (texto) => {
        handleVoiceInput(texto);
      },
      () => julsServiceRef.current
    );

    // Aplica o estilo de voz inicial salvo
    const initialStyle = VOICE_STYLES.find((s) => s.id === selectedStyleId) || VOICE_STYLES[0];
    if (initialStyle) {
      julsServiceRef.current.setPitchAndRate(initialStyle.pitch, initialStyle.rate);
      if (window.AndroidBridge?.setVoiceStyle) {
        window.AndroidBridge.setVoiceStyle(initialStyle.pitch, initialStyle.rate);
      }
    }

    return () => {
      voiceEngineRef.current?.destroy();
      julsServiceRef.current?.destroy();
    };
  }, [handleVoiceInput, selectedStyleId]);

  // Handle Power button toggle
  const handleToggle = () => {
    const nextState = !isOn;
    setIsOn(nextState);

    // Notifica a ponte nativa do Android se estiver rodando no APK
    if (window.AndroidBridge?.togglePower) {
      window.AndroidBridge.togglePower(nextState);
    }

    if (nextState) {
      playPowerOnSound();
      lyxStateMachine.transition('LISTENING');
      if (window.AndroidBridge?.startListening) {
        window.AndroidBridge.startListening();
      } else {
        voiceEngineRef.current?.start();
      }
    } else {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      hasProactedThisSilenceRef.current = false;
      playPowerOffSound();
      lyxStateMachine.transition('IDLE');
      if (window.AndroidBridge?.stopListening) {
        window.AndroidBridge.stopListening();
      }
      voiceEngineRef.current?.stop();
      julsServiceRef.current?.stop();
      if (window.AndroidBridge?.stopSpeaking) {
        window.AndroidBridge.stopSpeaking();
      }
    }
  };

  const handleStartModelDownload = () => {
    if (window.AndroidBridge?.startModelDownload) {
      setModelDownload((prev) => ({
        ...prev,
        isDownloading: true,
        error: null,
        showNotification: true,
      }));
      window.AndroidBridge.startModelDownload();
    }
  };

  useEffect(() => {
    // 1. Verifica status do modelo neural local de 1.1GB ao entrar no app
    if (window.AndroidBridge?.isModelDownloaded) {
      try {
        const isDl = window.AndroidBridge.isModelDownloaded();
        setModelDownload((prev) => ({
          ...prev,
          isDownloaded: isDl,
          isDownloading: !isDl,
        }));
        if (!isDl && window.AndroidBridge.startModelDownload) {
          window.AndroidBridge.startModelDownload();
        }
      } catch {
        // Fallback
      }
    }

    // Callbacks do download do modelo pelo AndroidBridge
    window.onModelStatusChecked = (isDownloaded: boolean) => {
      setModelDownload((prev) => ({
        ...prev,
        isDownloaded,
        isDownloading: !isDownloaded,
      }));
      if (!isDownloaded && window.AndroidBridge?.startModelDownload) {
        window.AndroidBridge.startModelDownload();
      }
    };

    window.onModelDownloadProgress = (
      _downloaded: number,
      _total: number,
      percent: number,
      dlMB: number,
      totalMB: number
    ) => {
      setModelDownload((prev) => ({
        ...prev,
        isDownloading: true,
        progressPercent: percent,
        downloadedMB: dlMB,
        totalMB: totalMB > 0 ? totalMB : 1125,
        error: null,
      }));
    };

    window.onModelDownloadComplete = () => {
      setModelDownload((prev) => ({
        ...prev,
        isDownloaded: true,
        isDownloading: false,
        progressPercent: 100,
        error: null,
      }));
      setTimeout(() => {
        setModelDownload((prev) => ({ ...prev, showNotification: false }));
      }, 3500);
    };

    window.onModelDownloadError = (errorMsg: string) => {
      setModelDownload((prev) => ({
        ...prev,
        isDownloading: false,
        error: errorMsg,
      }));
    };

    // 2. Tenta carregar vozes nativas do celular através do AndroidBridge
    if (window.AndroidBridge?.getNativeVoices) {
      try {
        const raw = window.AndroidBridge.getNativeVoices();
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNativeVoices(parsed);
          const current = parsed.find((v: NativeVoiceOption) => v.isCurrent);
          if (current) setSelectedVoiceId(current.id);
        }
      } catch {
        // Fallback
      }
    }

    // Callback invocado pelo Android quando o motor TTS nativo carrega a lista do dispositivo
    window.onNativeVoicesLoaded = (data: unknown) => {
      try {
        const list = typeof data === 'string' ? JSON.parse(data) : data;
        if (Array.isArray(list) && list.length > 0) {
          setNativeVoices(list);
          const current = list.find((v: NativeVoiceOption) => v.isCurrent);
          if (current) setSelectedVoiceId(current.id);
        }
      } catch {
        // Fallback seguro
      }
    };

    // 3. Se estiver rodando em navegador/preview, obtém as vozes nativas do sistema via Web Speech
    const loadBrowserVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const mapped: NativeVoiceOption[] = voices.map((v) => ({
            id: v.name,
            name: `${v.name} (${v.lang})`,
            lang: v.lang,
          }));
          setNativeVoices((prev) => (prev.length > 0 ? prev : mapped));
        }
      }
    };

    loadBrowserVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadBrowserVoices;
    }

    refreshNativeVoices();
    const t1 = setTimeout(refreshNativeVoices, 600);
    const t2 = setTimeout(refreshNativeVoices, 1600);

    // Permite que o serviço nativo do Android sincronize o estado visual do botão/galáxia
    window.onAndroidStateChanged = (androidIsOn: boolean, androidIsListening: boolean) => {
      setIsOn(androidIsOn);
      if (androidIsListening) {
        lyxStateMachine.transition('LISTENING');
      } else {
        lyxStateMachine.transition('IDLE');
      }
    };

    // Sincronização em tempo real com eventos do motor TTS e reconhecimento nativo
    window.onSpeechStart = () => {
      lyxStateMachine.transition('SPEAKING');
    };

    window.onSpeechDone = () => {
      if (isOnRef.current) {
        lyxStateMachine.transition('LISTENING');
        if (window.AndroidBridge?.startListening) {
          window.AndroidBridge.startListening();
        } else {
          voiceEngineRef.current?.start();
        }
      }
    };

    // Barge-in / Interrupção imediata quando o usuário começa a falar
    window.onUserInterrupted = () => {
      julsServiceRef.current?.stop();
      if (window.AndroidBridge?.stopSpeaking) {
        window.AndroidBridge.stopSpeaking();
      }
      if (isOnRef.current) {
        lyxStateMachine.transition('LISTENING');
      }
    };

    // Pré-aquecimento especulativo enquanto o usuário ainda está formulando a frase
    window.onVoicePartialRecognized = (partialText: string) => {
      if (partialText && partialText.trim().length >= 3) {
        qwenEngineRef.current?.prepararRespostaEspeculativa(
          partialText,
          selectedStyleId,
          getConversationHistory()
        );
      }
    };

    window.onVoiceRecognized = (recognizedText: string) => {
      handleVoiceInput(recognizedText);
    };

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      delete window.onAndroidStateChanged;
      delete window.onNativeVoicesLoaded;
      delete window.onModelDownloadProgress;
      delete window.onModelDownloadComplete;
      delete window.onModelDownloadError;
      delete window.onModelStatusChecked;
      delete window.onSpeechStart;
      delete window.onSpeechDone;
      delete window.onUserInterrupted;
      delete window.onVoicePartialRecognized;
      delete window.onVoiceRecognized;
    };
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        localStorage.setItem('lyx_authenticated', 'true');
      }
    });
    return () => unsub();
  }, []);

  // 1. Tela de Login
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLogin={() => {
          setIsAuthenticated(true);
          localStorage.setItem('lyx_authenticated', 'true');
        }}
      />
    );
  }

  // 2. Tela de Onboarding (após login, mas antes de acessar a página h)
  if (isAuthenticated && !isOnboarded) {
    return (
      <OnboardingScreen
        onStart={() => {
          setIsOnboarded(true);
          localStorage.setItem('lyx_onboarded', 'true');
        }}
      />
    );
  }

  // 3. Home definitiva e única da LYX (HScreen)
  return (
    <HScreen
      onGoHome={() => {}}
      onOpenSettings={() => setShowDiagnostic((prev) => !prev)}
      onOpenProfile={() => {}}
      currentStyleId={selectedStyleId}
      onSelectStyle={handleStyleSelect}
      onPreviewSpeech={handlePreviewSpeech}
      voices={nativeVoices}
      currentVoiceId={selectedVoiceId}
      onSelectVoice={handleVoiceSelect}
      onRefreshVoices={refreshNativeVoices}
      modelDownload={modelDownload}
      voiceState={voiceState}
      globalMessages={globalMessages}
      onSendMessageGlobal={(text, isAudio, audioDuration) => {
        addMessage({
          id: Date.now().toString(),
          sender: 'user',
          text,
          isAudio,
          audioDuration,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        
        // Se estiver gravando audio ou texto, force uma resposta da engine
        if (qwenEngineRef.current) {
          handleVoiceInput(text);
        }
      }}
      onClearHistoryGlobal={() => {
        localStorage.removeItem('lyx_global_messages');
        setGlobalMessages([]);
      }}
      onToggleListeningGlobal={() => {
        if (voiceState === 'IDLE') {
          playPowerOnSound();
          if (window.AndroidBridge?.startListening) {
            window.AndroidBridge.startListening();
          } else {
            voiceEngineRef.current?.start();
          }
        } else if (voiceState === 'LISTENING') {
          playPowerOffSound();
          if (window.AndroidBridge?.stopListening) {
            window.AndroidBridge.stopListening();
          }
          voiceEngineRef.current?.stop();
          lyxStateMachine.transition('IDLE');
        } else {
          // Barge-in (interrupts SPEAKING or PROCESSING)
          if (window.AndroidBridge?.stopListening) window.AndroidBridge.stopListening();
          voiceEngineRef.current?.stop();
          julsServiceRef.current?.stop();
          
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
          }
          if (window.AndroidBridge?.stopSpeaking) {
            window.AndroidBridge.stopSpeaking();
          }
          
          lyxStateMachine.transition('INTERRUPTED');
          
          // Starts mic again after the interruption delay
          setTimeout(() => {
            playPowerOnSound();
            if (window.AndroidBridge?.startListening) {
              window.AndroidBridge.startListening();
            } else {
              voiceEngineRef.current?.start();
            }
          }, 350);
        }
      }}
    />
  );
}


