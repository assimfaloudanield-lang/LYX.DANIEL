// JulsVoiceService & VoiceEngine — Intelligent Voice Processing for LYX + Kokoro PT-BR (pf_dora, SID 42, FP32)
import { KOKORO_PTBR_CONFIG } from './qwenModelManager';
import { lyxStateMachine } from './voiceStateMachine';

interface SpeechRecognitionEventLike extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}


// Módulo 1: Pronúncia Inteligente
// Tratamento de siglas, números, símbolos, abreviações coloquiais e palavras estrangeiras comuns
export function formatTextForTts(raw: string): string {
  if (!raw) return '';

  let text = raw;

  // 1. Remove URLs, códigos e markdown
  text = text.replace(/https?:\/\/\S+/g, '');
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]*`/g, '');
  text = text.replace(/\[.*?\]\(.*?\)/g, '');
  text = text.replace(/[*#_~>|]/g, '');

  // 2. Remove emojis e caracteres gráficos
  text = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}]/gu, '');

  // 3. Regra Fundamental: LYX -> Líquis (exclusivo para síntese sonora)
  text = text.replace(/\blyx\b/gi, 'Líquis');
  text = text.replace(/LYX/g, 'Líquis');
  text = text.replace(/Lyx/g, 'Líquis');
  text = text.replace(/lyx/g, 'Líquis');

  // 4. Tratamento de Siglas Técnicas
  text = text.replace(/\bIA\b/g, 'I-A');
  text = text.replace(/\bAI\b/g, 'Ei-Ai');
  text = text.replace(/\bPDF\b/g, 'P-D-F');
  text = text.replace(/\bAPI\b/g, 'A-P-I');
  text = text.replace(/\bTTS\b/g, 'T-T-S');
  text = text.replace(/\bSTT\b/g, 'S-T-T');
  text = text.replace(/\bLLM\b/g, 'L-L-M');
  text = text.replace(/\bGPS\b/g, 'G-P-S');
  text = text.replace(/\bFAQ\b/g, 'F-A-Q');
  text = text.replace(/\bID\b/g, 'I-D');
  text = text.replace(/\bURL\b/g, 'U-R-L');
  text = text.replace(/\bCCP\b/g, 'C-C-P');

  // 5. Tratamento de Valores, Unidades e Números
  text = text.replace(/R\$\s*(\d+(?:[.,]\d+)?)/gi, '$1 reais');
  text = text.replace(/\$\s*(\d+(?:[.,]\d+)?)/g, '$1 dólares');
  text = text.replace(/(\d+)\s*%/g, '$1 por cento');
  text = text.replace(/(\d+)\s*h\b/gi, '$1 horas');
  text = text.replace(/(\d+)\s*min\b/gi, '$1 minutos');
  text = text.replace(/(\d+)\s*km\b/gi, '$1 quilômetros');
  text = text.replace(/(\d+)\s*kg\b/gi, '$1 quilos');
  text = text.replace(/1[ºª]/g, 'primeiro');
  text = text.replace(/2[ºª]/g, 'segundo');
  text = text.replace(/3[ºª]/g, 'terceiro');

  // 6. Símbolos
  text = text.replace(/&/g, ' e ');
  text = text.replace(/@/g, ' arroba ');
  text = text.replace(/\+/g, ' mais ');
  text = text.replace(/=/g, ' igual ');
  text = text.replace(/\//g, ' barra ');

  // 7. Abreviações coloquiais de texto
  text = text.replace(/\bvc\b/gi, 'você');
  text = text.replace(/\bvcs\b/gi, 'vocês');
  text = text.replace(/\bpq\b/gi, 'porque');
  text = text.replace(/\btbm?\b/gi, 'também');
  text = text.replace(/\bblz\b/gi, 'beleza');
  text = text.replace(/\bmsg\b/gi, 'mensagem');
  text = text.replace(/\bobs\b/gi, 'observação');
  text = text.replace(/\bapp\b/gi, 'aplicativo');

  // 8. Palavras estrangeiras com pronúncia fonética adaptada ao PT-BR
  text = text.replace(/\boffline\b/gi, 'ofláine');
  text = text.replace(/\bonline\b/gi, 'onláine');
  text = text.replace(/\bfeedback\b/gi, 'fidbéc');
  text = text.replace(/\bdownload\b/gi, 'daunlôud');
  text = text.replace(/\bsetup\b/gi, 'setâpi');
  text = text.replace(/\bbackup\b/gi, 'bécap');
  text = text.replace(/\bbug\b/gi, 'bâgui');

  // 9. Normalização de pausas e espaços
  text = text.replace(/\.{4,}/g, '...');
  text = text.replace(/\n+/g, ' ');
  text = text.replace(/\s{2,}/g, ' ');

  return text.trim();
}

export function sanitizeForSpeech(raw: string): string {
  return formatTextForTts(raw);
}

// JulsVoiceService - Text-To-Speech com streaming, fila de sentenças, barge-in e cancelamento
export class JulsVoiceService {
  private tts: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private currentLang = 'pt-BR';
  private currentPitch = 1.0;
  private currentRate = 1.0;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private safetyTimer: any = null;
  private ttsQueue: { text: string; isFinal: boolean; onDone?: () => void }[] = [];
  private isProcessingQueue = false;

  public isSpeaking = false;
  public lastSpokenText = '';
  public speechEndTime = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.tts = window.speechSynthesis;
      this.initVoice();
      if (this.tts.onvoiceschanged !== undefined) {
        this.tts.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  setLanguage(lang: string) {
    this.currentLang = lang;
    this.initVoice();
  }

  setPitchAndRate(pitch: number, rate: number) {
    this.currentPitch = pitch;
    this.currentRate = rate;
  }

  getAvailableVoices(): { id: string; name: string; lang: string }[] {
    if (!this.tts) return [];
    return this.tts.getVoices().map((v) => ({
      id: v.name,
      name: v.name,
      lang: v.lang,
    }));
  }

  setVoiceById(voiceId: string) {
    if (!this.tts) return;
    const found = this.tts.getVoices().find((v) => v.name === voiceId);
    if (found) {
      this.voice = found;
    }
  }

  private initVoice() {
    if (!this.tts) return;
    const voices = this.tts.getVoices();
    if (!voices.length) return;

    const ptVoices = voices.filter(
      (v) => v.lang.startsWith('pt') || v.lang.includes('pt-BR') || v.lang.includes('pt_BR')
    );

    if (ptVoices.length > 0) {
      const femalePt = ptVoices.find(
        (v) =>
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('maria') ||
          v.name.toLowerCase().includes('luciana') ||
          v.name.toLowerCase().includes('leticia') ||
          v.name.toLowerCase().includes('francisca') ||
          v.name.toLowerCase().includes('google português do brasil') ||
          v.name.toLowerCase().includes('google')
      );
      this.voice = femalePt || ptVoices[0];
    } else {
      this.voice = voices[0];
    }
  }

  speak(text: string, onEnd?: () => void) {
    if (!text || text.trim() === '') {
      onEnd?.();
      return;
    }

    this.stop();
    this.enqueueChunk(text, true, onEnd);
  }

  speakChunk(chunk: string, isFirst: boolean, isFinal: boolean, onDone?: () => void) {
    if (!chunk || chunk.trim() === '') {
      if (isFinal) onDone?.();
      return;
    }

    if (isFirst) {
      this.stop();
    }

    this.enqueueChunk(chunk, isFinal, onDone);
  }

  private enqueueChunk(text: string, isFinal: boolean, onDone?: () => void) {
    this.ttsQueue.push({ text, isFinal, onDone });
    if (!this.isProcessingQueue) {
      this.processNextInQueue();
    }
  }

  private processNextInQueue() {
    if (this.ttsQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const current = this.ttsQueue.shift()!;
    const ttsText = formatTextForTts(current.text);

    if (!ttsText) {
      if (current.isFinal && current.onDone) current.onDone();
      this.processNextInQueue();
      return;
    }

    this.isSpeaking = true;
    this.lastSpokenText = ttsText;
    lyxStateMachine.transition('SPEAKING');
    window.onSpeechStart?.();

    const onChunkComplete = () => {
      clearTimeout(this.safetyTimer);
      if (current.isFinal && current.onDone) {
        current.onDone();
      }

      if (this.ttsQueue.length > 0) {
        this.processNextInQueue();
      } else {
        this.isSpeaking = false;
        this.isProcessingQueue = false;
        this.speechEndTime = Date.now();
        window.onSpeechDone?.();
      }
    };

    // Se estiver no Android, delega ao motor nativo
    if (window.AndroidBridge?.speakNativeChunk || window.AndroidBridge?.speakNative) {
      if (window.AndroidBridge.speakNativeChunk) {
        window.AndroidBridge.speakNativeChunk(ttsText, !this.isSpeaking);
      } else if (window.AndroidBridge.speakNative) {
        window.AndroidBridge.speakNative(ttsText);
      }

      const words = ttsText.split(/\s+/).length;
      const duration = Math.max(900, (words / (this.currentRate || 1.0)) * 260);
      clearTimeout(this.safetyTimer);
      this.safetyTimer = setTimeout(onChunkComplete, duration);
      return;
    }

    // Web Speech API
    if (!this.tts) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.tts = window.speechSynthesis;
      } else {
        onChunkComplete();
        return;
      }
    }

    this.initVoice();

    try {
      this.tts.resume();
    } catch {}

    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.lang = this.currentLang;
    utterance.rate = this.currentRate || 1.0;
    utterance.pitch = this.currentPitch || 1.0;
    if (this.voice) {
      utterance.voice = this.voice;
    }

    this.activeUtterance = utterance;

    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      this.activeUtterance = null;
      onChunkComplete();
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    const words = ttsText.split(/\s+/).length;
    const estimatedDurationMs = Math.max(1200, (words / (this.currentRate || 1.0)) * 360) + 1200;
    this.safetyTimer = setTimeout(finish, estimatedDurationMs);

    try {
      this.tts.speak(utterance);
    } catch {
      finish();
    }
  }

  // Interrupção e Cancelamento Imediato (Barge-in / Cancelamento Real)
  stop() {
    clearTimeout(this.safetyTimer);
    this.ttsQueue = [];
    this.isProcessingQueue = false;
    this.isSpeaking = false;
    this.activeUtterance = null;

    if (this.tts) {
      try {
        this.tts.cancel();
      } catch {}
    }
    if (window.AndroidBridge?.stopSpeaking) {
      window.AndroidBridge.stopSpeaking();
    }
  }

  destroy() {
    this.stop();
    this.tts = null;
    this.voice = null;
  }
}

// VoiceEngine - STT com detecção de fala e compatibilidade com navegador
export class VoiceEngine {
  private recognition: any = null;
  private isListening = false;
  private isManuallyStopped = false;
  private onRecognizedText: (text: string) => void;
  private getVoiceService: () => JulsVoiceService | null;
  private accumulatedTranscript = '';
  private silenceTimer: any = null;

  constructor(
    onRecognizedText: (text: string) => void,
    getVoiceService: () => JulsVoiceService | null
  ) {
    this.onRecognizedText = onRecognizedText;
    this.getVoiceService = getVoiceService;
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition não suportado neste navegador.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'pt-BR';

      this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
        // Barge-in: Quando o usuário começa a falar, interrompe imediatamente o áudio atual
        const voiceService = this.getVoiceService();
        if (voiceService?.isSpeaking) {
          voiceService.stop();
          window.onUserInterrupted?.();
        }

        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            this.accumulatedTranscript += ' ' + result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        const currentText = (this.accumulatedTranscript + ' ' + interim).trim();

        if (currentText.length > 0) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = setTimeout(() => {
            const finalQuery = (this.accumulatedTranscript.trim() || interim.trim());
            if (finalQuery.length > 0) {
              this.accumulatedTranscript = '';
              lyxStateMachine.transition('PROCESSING');
              this.onRecognizedText(finalQuery);
            }
          }, 650);
        }
      };

      this.recognition.onerror = (e: any) => {
        console.warn('Erro no reconhecimento de voz:', e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'network') {
          this.stop();
          lyxStateMachine.transition('ERROR');
        }
      };

      this.recognition.onend = () => {
        if (this.isListening && !this.isManuallyStopped) {
          try {
            this.recognition.start();
          } catch {}
        }
      };
    } catch (e) {
      console.warn('Falha ao inicializar SpeechRecognition:', e);
    }
  }

  start() {
    this.isManuallyStopped = false;
    this.isListening = true;
    this.accumulatedTranscript = '';
    clearTimeout(this.silenceTimer);
    lyxStateMachine.transition('LISTENING');

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {}
    }
  }

  stop() {
    this.isManuallyStopped = true;
    this.isListening = false;
    clearTimeout(this.silenceTimer);
    this.accumulatedTranscript = '';

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }

  destroy() {
    this.stop();
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }
  }
}
