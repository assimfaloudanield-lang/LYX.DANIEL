import React, { useState, useRef, useEffect } from 'react';
import { Mic, Volume2 } from 'lucide-react';
import {
  VoiceSettingsModal,
  VoiceStyleOption,
  NativeVoiceOption,
} from './VoiceSettingsModal';
import { ChatWindowModal } from './ChatWindowModal';
import { ProfileModal } from './ProfileModal';
import { PlansModal } from './PlansModal';
import { SetupProgressModal } from './SetupProgressModal';
import { QuotaWarningModal } from './QuotaWarningModal';
import { QuotaLimitModal } from './QuotaLimitModal';
import { QwenDownloadModal } from './QwenDownloadModal';
import { renderUserAvatar } from './UserAvatar';
import { checkVoiceQuotaStatus, addVoiceUsage, loadVoiceQuotaState } from '../services/voiceQuota';

interface ChatMessage {
  id: string;
  sender: 'user' | 'lyx';
  text: string;
  isAudio?: boolean;
  audioDuration?: string;
  time: string;
}

interface HScreenProps {
  onGoHome?: () => void;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
  currentStyleId?: string;
  onSelectStyle?: (style: VoiceStyleOption) => void;
  onPreviewSpeech?: (text: string, pitch: number, rate: number) => void;
  voices?: NativeVoiceOption[];
  currentVoiceId?: string;
  onSelectVoice?: (voiceId: string) => void;
  onRefreshVoices?: () => void;
  modelDownload?: {
    isDownloaded: boolean;
    isDownloading: boolean;
    progressPercent: number;
    downloadedMB: number;
    totalMB: number;
    error: string | null;
  };
  voiceState?: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'INTERRUPTED' | 'ERROR';
  globalMessages?: ChatMessage[];
  onSendMessageGlobal?: (text: string, isAudio?: boolean, audioDuration?: string) => void;
  onToggleListeningGlobal?: () => void;
  onClearHistoryGlobal?: () => void;
}

export const HScreen: React.FC<HScreenProps> = ({
  onGoHome,
  onOpenSettings,
  onOpenProfile,
  currentStyleId,
  onSelectStyle,
  onPreviewSpeech,
  voices = [],
  currentVoiceId,
  onSelectVoice,
  onRefreshVoices,
  modelDownload,
  voiceState = 'IDLE',
  globalMessages = [],
  onSendMessageGlobal,
  onToggleListeningGlobal,
  onClearHistoryGlobal,
}) => {
  const [message, setMessage] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(0);
  const [transcribedAudioText, setTranscribedAudioText] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [activeSpecialModal, setActiveSpecialModal] = useState<'setup' | 'quota_warning' | 'quota_limit' | null>(null);
  const [userPlan, setUserPlan] = useState<'Membro Alpha' | 'LYX Essencial' | 'LYX Plus'>(() => {
    return (localStorage.getItem('lyx_user_plan') as any) || 'Membro Alpha';
  });

  // Modal 1: Download de Arquivos no início
  useEffect(() => {
    const hasSeenSetup = sessionStorage.getItem('lyx_setup_shown');
    if (!hasSeenSetup && userPlan !== 'LYX Plus') {
      const timer = setTimeout(() => {
        // Dispara o download dos modelos ao abrir
        window.dispatchEvent(new CustomEvent('open-qwen-download'));
        sessionStorage.setItem('lyx_setup_shown', 'true');
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [userPlan]);



  

  const [userName, setUserName] = useState('Daniel');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

  const isListening = voiceState !== 'IDLE';

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioTimerRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);
  const voiceSessionTimerRef = useRef<any>(null);

  // Monitora a cota de voz em tempo real durante a conversa ativa com a LYX
  useEffect(() => {
    if (isListening && userPlan !== 'LYX Plus') {
      if (voiceSessionTimerRef.current) clearInterval(voiceSessionTimerRef.current);
      voiceSessionTimerRef.current = setInterval(() => {
        const quota = addVoiceUsage(1);
        if (quota.shouldWarn80) {
          setActiveSpecialModal('quota_warning');
        }
        if (quota.isExceeded) {
          if (onToggleListeningGlobal && voiceState !== 'IDLE') {
            onToggleListeningGlobal();
          }
          setActiveSpecialModal('quota_limit');
          if (voiceSessionTimerRef.current) {
            clearInterval(voiceSessionTimerRef.current);
            voiceSessionTimerRef.current = null;
          }
        }
      }, 1000);
    } else {
      if (voiceSessionTimerRef.current) {
        clearInterval(voiceSessionTimerRef.current);
        voiceSessionTimerRef.current = null;
      }
    }

    return () => {
      if (voiceSessionTimerRef.current) {
        clearInterval(voiceSessionTimerRef.current);
        voiceSessionTimerRef.current = null;
      }
    };
  }, [isListening, userPlan, voiceState, onToggleListeningGlobal]);

  // Auto-scroll para baixo conforme a conversa vai descendo de acordo com os textos
  useEffect(() => {
    if (globalMessages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [globalMessages]);

  // Teclado não sobressair o texto no mobile
  const handleInputFocus = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
      chatBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 250);
  };

  // Parallax suave
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (isListening || !orbRef.current) return;
      if (window.matchMedia('(pointer:fine)').matches) {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        orbRef.current.style.transform = `translate(${x * 3}px, ${y * 3}px)`;
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [isListening]);

  const handleOrbClick = () => {
    if (voiceState === 'IDLE') {
      const quotaCheck = checkVoiceQuotaStatus(userPlan);
      if (!quotaCheck.canStartVoice) {
        setActiveSpecialModal('quota_limit');
        return;
      }
      if (onToggleListeningGlobal) {
        onToggleListeningGlobal();
      }
    } else {
      if (onToggleListeningGlobal) {
        onToggleListeningGlobal();
      }
    }
  };

  const startAudioRecording = () => {
    const quotaCheck = checkVoiceQuotaStatus(userPlan);
    if (!quotaCheck.canStartVoice) {
      setActiveSpecialModal('quota_limit');
      return;
    }

    setIsRecordingAudio(true);
    setAudioSeconds(0);
    setTranscribedAudioText('');

    if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    audioTimerRef.current = setInterval(() => {
      setAudioSeconds((prev) => {
        const next = prev + 1;
        if (userPlan !== 'LYX Plus') {
          const quota = addVoiceUsage(1);
          if (quota.shouldWarn80) {
            setActiveSpecialModal('quota_warning');
          }
          if (quota.isExceeded) {
            stopAudioRecording();
            setActiveSpecialModal('quota_limit');
          }
        }
        return next;
      });
    }, 1000);

    if (typeof window !== 'undefined') {
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.lang = 'pt-BR';
          rec.continuous = true;
          rec.interimResults = true;
          rec.onresult = (event: any) => {
            let str = '';
            for (let i = 0; i < event.results.length; i++) {
              str += event.results[i][0].transcript;
            }
            if (str.trim()) {
              setTranscribedAudioText(str.trim());
            }
          };
          rec.onerror = () => {};
          rec.start();
          speechRecognitionRef.current = rec;
        } catch {}
      }
    }
  };

  const stopAudioRecording = () => {
    setIsRecordingAudio(false);
    if (audioTimerRef.current) {
      clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
  };

  const handleToggleMic = () => {
    if (isRecordingAudio) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

  const handleSendMessage = () => {
    if (isRecordingAudio) {
      const durationStr = `0:${audioSeconds < 10 ? '0' : ''}${Math.max(1, audioSeconds)}`;
      const audioSpeech = transcribedAudioText.trim() || 'Mensagem de voz';
      stopAudioRecording();

      if (onSendMessageGlobal) {
        onSendMessageGlobal(audioSpeech, true, durationStr);
      }

      setAudioSeconds(0);
      setTranscribedAudioText('');
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    if (onSendMessageGlobal) {
      onSendMessageGlobal(trimmed, false);
    }
    setMessage('');

    if (chatBoxRef.current) {
      chatBoxRef.current.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(0.985)' },
          { transform: 'scale(1)' },
        ],
        { duration: 200, easing: 'ease-out' }
      );
    }
  };

  const handleModalSendText = (text: string) => {
    if (onSendMessageGlobal) {
      onSendMessageGlobal(text, false);
    }
  };

  const handleModalSendAudio = (audioDuration: string, transcribedText: string) => {
    if (onSendMessageGlobal) {
      onSendMessageGlobal(transcribedText, true, audioDuration);
    }
  };

  return (
    <div id="lyx-app" className={isListening ? 'is-listening' : ''}>
      <style>{`
        #lyx-app,
        #lyx-app * {
          box-sizing: border-box;
        }

        #lyx-app {
          --blue: #087dff;
          --cyan: #16dfff;
          --violet: #7548ff;
          --pink: #e83cff;

          --ink: #14245b;
          --muted: #7885a6;

          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;

          color: var(--ink);
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

          background: #ffffff;

          -webkit-font-smoothing: antialiased;
        }

        #lyx-app .lyx-arc {
          position: absolute;
          pointer-events: none;
          border: 1px solid rgba(102,142,255,.14);
          border-right-color: rgba(229,92,255,.16);
          border-bottom-color: rgba(30,213,255,.15);
          border-radius: 50%;
          z-index: 0;
        }

        #lyx-app .arc-1 {
          width: 600px;
          height: 600px;
          left: -350px;
          top: -280px;
          transform: rotate(25deg);
        }

        #lyx-app .arc-2 {
          width: 750px;
          height: 380px;
          right: -420px;
          bottom: -150px;
          transform: rotate(-17deg);
        }

        #lyx-app .arc-3 {
          width: 600px;
          height: 240px;
          left: -260px;
          bottom: -120px;
          transform: rotate(15deg);
        }

        #lyx-app .lyx-bubble {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(
            circle at 30% 25%,
            rgba(255,255,255,.98),
            rgba(125,200,255,.12) 35%,
            rgba(220,91,255,.06) 58%,
            transparent 74%
          );
          border: 1px solid rgba(112,155,255,.08);
          box-shadow: none;
        }

        #lyx-app .bubble-1 {
          width: 140px;
          height: 140px;
          right: -60px;
          top: 40%;
        }

        #lyx-app .bubble-2 {
          width: 220px;
          height: 220px;
          left: -120px;
          bottom: -120px;
        }

        /* CONTAINER FIXO DE 1 PÁGINA COM FLEX DISTRIBUÍDO */
        #lyx-app .lyx-container {
          position: relative;
          z-index: 2;
          width: min(1080px, 94vw);
          height: 100%;
          max-height: 100%;
          margin: 0 auto;
          padding: 10px 0 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* HEADER REDUZIDO */
        #lyx-app .lyx-header {
          position: relative;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
        }

        #lyx-app .lyx-settings {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid rgba(61,100,218,.20);
          background: rgba(255,255,255,.85);
          box-shadow: none;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          cursor: pointer;
          transition: transform .25s ease;
        }

        #lyx-app .lyx-settings:hover {
          transform: translateY(-1px) rotate(8deg);
          box-shadow: none;
        }

        #lyx-app .lyx-settings svg {
          width: 21px;
          height: 21px;
          fill: none;
          stroke: #14245d;
          stroke-width: 1.55;
        }

        #lyx-app .lyx-profile {
          min-width: 0;
          max-width: 230px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 12px 5px 6px;
          border-radius: 28px;
          border: 1px solid rgba(65,103,217,.18);
          background: rgba(255,255,255,.85);
          box-shadow: none;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          cursor: pointer;
        }

        #lyx-app .profile-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 50%;
          border: 1px solid rgba(44,103,239,.2);
          background: linear-gradient(145deg, #fff, #f0f4ff);
        }

        #lyx-app .profile-icon svg {
          width: 20px;
          height: 20px;
          fill: none;
          stroke: #1458dc;
          stroke-width: 1.55;
        }

        #lyx-app .profile-name {
          font-size: 13px;
          font-weight: 600;
          color: #14245b;
          line-height: 1.15;
        }

        #lyx-app .profile-sub {
          margin-top: 1px;
          font-size: 10px;
          color: #8793b2;
          line-height: 1.15;
        }

        #lyx-app .profile-arrow {
          margin-left: auto;
          font-size: 20px;
          font-weight: 300;
          color: #8793b2;
        }

        /* HERO REDUZIDO */
        #lyx-app .lyx-hero {
          position: relative;
          text-align: center;
          margin-top: 0px;
        }

        #lyx-app .lyx-brand-logo {
          height: clamp(120px, 16.5vh, 172px);
          width: auto;
          max-width: min(540px, 88vw);
          margin: 0 auto;
          display: block;
          object-fit: contain;
          filter: none;
          transition: transform .25s ease;
        }

        #lyx-app .lyx-brand-logo:hover {
          transform: scale(1.02);
        }

        #lyx-app .lyx-tagline {
          margin-top: 4px;
          font-size: 8px;
          font-weight: 500;
          letter-spacing: .38em;
          padding-left: .38em;
          color: #475569;
        }

        /* VOICE AREA COMPACTA */
        #lyx-app .voice-area {
          text-align: center;
          margin-top: 6px;
        }

        #lyx-app .voice-instruction {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          font-size: 9.5px;
          font-weight: 500;
          letter-spacing: .22em;
          padding-left: .22em;
          color: #475569;
          text-transform: uppercase;
          margin-top: 18px;
          margin-bottom: 6px;
        }

        #lyx-app .voice-instruction::before,
        #lyx-app .voice-instruction::after {
          content: "";
          width: 32px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(71, 85, 105, 0.35),
            transparent
          );
        }

        /* ORBE COM A IMAGEM ORBEJULS - AUMENTADA E SEM SHADOW */
        #lyx-app .lyx-orb {
          position: relative;
          width: clamp(210px, 29vh, 275px);
          aspect-ratio: 1;
          margin: 6px auto 0;
          border-radius: 50%;
          cursor: pointer;
          display: grid;
          place-items: center;
          background: transparent;
          box-shadow: none;
          border: none;
          padding: 0;
          transition: transform .35s cubic-bezier(.22,.61,.36,1);
          filter: none;
        }

        #lyx-app .lyx-orb-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
          pointer-events: none;
          user-select: none;
          display: block;
          transition: transform .35s ease;
          filter: none;
        }

        #lyx-app .lyx-orb:hover {
          transform: scale(1.03);
          filter: none;
        }

        #lyx-app .lyx-orb.listening {
          transform: scale(1.04);
          filter: none;
        }

        #lyx-app .lyx-orb.listening .lyx-orb-img {
          animation: lyx-core-pulse 1.4s ease-in-out infinite;
        }

        /* ANIMAÇÃO DOS ESTADOS: LYX ESTÁ DESCANSANDO / OUVINDO */
        #lyx-app .voice-status {
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        #lyx-app .voice-state {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #20346f;
          font-size: 8px;
          letter-spacing: .14em;
          text-transform: uppercase;
          transition: opacity .35s ease, color .35s ease;
        }

        #lyx-app .voice-dot {
          position: relative;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16dfff;
          box-shadow: none;
          display: inline-block;
          flex-shrink: 0;
        }

        #lyx-app .voice-dot-ring {
          position: absolute;
          inset: -2.5px;
          border-radius: 50%;
          border: 1.2px solid #16dfff;
          opacity: 0;
        }

        /* ESTADO: ESPERANDO ATIVO */
        #lyx-app .waiting-state .voice-dot {
          background: #16dfff;
          box-shadow: none;
          animation: lyx-dot-waiting 2.2s ease-in-out infinite;
        }

        #lyx-app .waiting-state .voice-dot-ring {
          border-color: #16dfff;
          animation: lyx-ripple 2.2s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
        }

        #lyx-app .waiting-state .voice-text {
          animation: lyx-text-waiting 2.2s ease-in-out infinite;
        }

        #lyx-app .listening-state {
          opacity: .35;
        }

        #lyx-app .listening-state .voice-dot {
          background: #ed38ff;
          box-shadow: none;
        }

        /* ONDAS EQUALIZADORAS */
        #lyx-app .voice-waves {
          display: none;
          align-items: center;
          gap: 2.5px;
          height: 10px;
          margin-left: 2px;
        }

        #lyx-app .wave-bar {
          width: 2px;
          height: 100%;
          border-radius: 2px;
          background: linear-gradient(180deg, #16dfff, #ed38ff);
        }

        /* QUANDO IS-LISTENING ATIVO */
        #lyx-app.is-listening .waiting-state {
          opacity: .35;
        }

        #lyx-app.is-listening .waiting-state .voice-dot,
        #lyx-app.is-listening .waiting-state .voice-dot-ring,
        #lyx-app.is-listening .waiting-state .voice-text {
          animation: none;
        }

        #lyx-app.is-listening .listening-state {
          opacity: 1;
          color: #7b269d;
          font-weight: 600;
        }

        #lyx-app.is-listening .listening-state .voice-dot {
          background: #ed38ff;
          box-shadow: none;
          animation: lyx-dot-listening .9s ease-in-out infinite;
        }

        #lyx-app.is-listening .listening-state .voice-dot-ring {
          border-color: #ed38ff;
          animation: lyx-ripple .9s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
        }

        #lyx-app.is-listening .voice-waves {
          display: inline-flex;
        }

        #lyx-app.is-listening .wave-bar.bar-1 {
          animation: lyx-equalizer 0.75s ease-in-out infinite;
        }

        #lyx-app.is-listening .wave-bar.bar-2 {
          animation: lyx-equalizer 0.75s ease-in-out 0.25s infinite;
        }

        #lyx-app.is-listening .wave-bar.bar-3 {
          animation: lyx-equalizer 0.75s ease-in-out 0.5s infinite;
        }

        #lyx-app .voice-divider {
          width: 1px;
          height: 10px;
          background: rgba(48,77,151,.18);
        }

        /* CHAT CARD: GLASS COMPACTO, CENTRALIZADO E COM STROKE GRADIENTE CORRENTE */
        #lyx-app .chat-area {
          width: min(340px, 86vw);
          margin: 6px auto 0;
          position: relative;
        }

        #lyx-app .chat-box {
          position: relative;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px 10px 3px 14px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          box-shadow: none;
          cursor: pointer;
          transition: transform .25s ease, background .25s ease;
        }

        /* STROKE GRADIENTE CORRENTE */
        #lyx-app .chat-box::before {
          content: "";
          position: absolute;
          inset: -1.5px;
          border-radius: inherit;
          padding: 1.5px;
          background: linear-gradient(
            90deg,
            #38bdf8,
            #818cf8,
            #c084fc,
            #f472b6,
            #38bdf8
          );
          background-size: 300% 100%;
          animation: lyxFlowStroke 4s linear infinite;
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes lyxFlowStroke {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 300% 50%;
          }
        }

        #lyx-app .chat-box:focus-within {
          background: rgba(255, 255, 255, 0.88);
          box-shadow: none;
        }

        /* CONVERSA QUE VAI DESCENDO DE ACORDO COM OS TEXTOS (AUTO ROOL) */
        #lyx-app .chat-messages-wrap {
          width: 100%;
          max-height: 86px;
          overflow-y: auto;
          scroll-behavior: smooth;
          overscroll-behavior: contain;
          margin-bottom: 6px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 0 4px;
          scrollbar-width: none;
        }

        #lyx-app .chat-messages-wrap::-webkit-scrollbar {
          display: none;
        }

        #lyx-app .chat-msg-row {
          display: flex;
          width: 100%;
        }

        #lyx-app .chat-msg-row.user {
          justify-content: flex-end;
        }

        #lyx-app .chat-msg-row.lyx {
          justify-content: flex-start;
        }

        #lyx-app .chat-bubble {
          max-width: 86%;
          padding: 5px 10px;
          border-radius: 13px;
          font-size: 11px;
          line-height: 1.35;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: lyxBubbleIn .2s ease-out;
          word-break: break-word;
        }

        @keyframes lyxBubbleIn {
          from { opacity: 0; transform: translateY(4px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        #lyx-app .chat-bubble.user {
          background: rgba(238, 242, 255, 0.92);
          border: 1px solid rgba(129, 140, 248, 0.3);
          color: #1e1b4b;
          border-bottom-right-radius: 3px;
        }

        #lyx-app .chat-bubble.lyx {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(226, 232, 240, 0.85);
          color: #0f172a;
          border-bottom-left-radius: 3px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }

        #lyx-app .chat-bubble-audio {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        #lyx-app .chat-bubble-audio svg {
          color: #4f46e5;
          width: 13px;
          height: 13px;
        }

        #lyx-app .chat-audio-wave {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 11px;
        }

        #lyx-app .chat-audio-bar {
          width: 2px;
          border-radius: 1px;
          background: #6366f1;
        }

        /* BOTÃO DE MIC DENTRO DO CHAT */
        #lyx-app .chat-mic {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid rgba(84, 115, 219, 0.18);
          background: rgba(255, 255, 255, 0.85);
          cursor: pointer;
          flex-shrink: 0;
          margin-right: 5px;
          position: relative;
          z-index: 2;
          transition: all .2s ease;
          color: #475569;
        }

        #lyx-app .chat-mic:hover {
          background: #ffffff;
          color: #0284c7;
        }

        #lyx-app .chat-bubble {
          cursor: pointer;
        }

        #lyx-app .chat-bubble:hover {
          filter: brightness(0.97);
        }

        #lyx-app .chat-mic.recording {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.4);
          color: #ef4444;
          animation: micPulse 1.2s infinite alternate;
        }

        @keyframes micPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          100% { transform: scale(1.08); box-shadow: 0 0 8px 2px rgba(239, 68, 68, 0.25); }
        }

        /* ANIMAÇÃO DE ÁUDIO QUANDO ATIVADO */
        #lyx-app .audio-live-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex: 1;
          pointer-events: none;
        }

        #lyx-app .audio-live-bars {
          display: flex;
          align-items: center;
          gap: 2.5px;
          height: 16px;
        }

        #lyx-app .live-bar {
          width: 2.5px;
          border-radius: 2px;
          background: linear-gradient(180deg, #38bdf8, #a855f7);
          animation: liveBarEqualizer 0.7s ease-in-out infinite alternate;
        }

        #lyx-app .live-bar:nth-child(1) { height: 6px; animation-delay: 0.1s; }
        #lyx-app .live-bar:nth-child(2) { height: 14px; animation-delay: 0.3s; }
        #lyx-app .live-bar:nth-child(3) { height: 10px; animation-delay: 0.15s; }
        #lyx-app .live-bar:nth-child(4) { height: 16px; animation-delay: 0.4s; }
        #lyx-app .live-bar:nth-child(5) { height: 8px; animation-delay: 0.25s; }

        @keyframes liveBarEqualizer {
          0% { transform: scaleY(0.3); opacity: 0.5; }
          100% { transform: scaleY(1); opacity: 1; }
        }

        #lyx-app .audio-live-info {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        #lyx-app .audio-live-time {
          font-size: 11px;
          font-weight: 600;
          color: #ef4444;
          font-variant-numeric: tabular-nums;
        }

        #lyx-app .audio-live-label {
          font-size: 10px;
          color: #64748b;
          font-weight: 500;
        }

        #lyx-app .chat-content-center {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          flex: 1;
          cursor: pointer;
          position: relative;
          z-index: 2;
          user-select: none;
        }

        #lyx-app .chat-content-center:hover .chat-type {
          color: #4f46e5;
        }

        #lyx-app .chat-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        #lyx-app .chat-icon svg {
          width: 15px;
          height: 15px;
          fill: none;
          stroke: #334155;
          stroke-width: 1.5;
          opacity: .85;
        }

        #lyx-app .chat-text {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        #lyx-app .chat-question {
          color: #64748b;
          font-size: 10px;
          font-weight: 400;
          line-height: 1;
          white-space: nowrap;
        }

        #lyx-app .chat-type {
          font-size: 11px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1;
          white-space: nowrap;
          transition: color .15s ease;
        }

        #lyx-app .chat-send {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid rgba(84, 115, 219, 0.18);
          background: rgba(255, 255, 255, 0.85);
          box-shadow: none;
          cursor: pointer;
          flex-shrink: 0;
          margin-left: 6px;
          position: relative;
          z-index: 2;
          transition: transform .2s ease, background .2s ease;
        }

        #lyx-app .chat-send:hover {
          transform: translateX(1px);
          background: #ffffff;
          box-shadow: none;
        }

        #lyx-app .chat-send svg {
          width: 12px;
          height: 12px;
          fill: none;
          stroke: #183594;
          stroke-width: 1.7;
        }

        #lyx-app .chat-input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 1;
          pointer-events: none;
        }

        /* FEATURES EM 1 LINHA / COMPACTAS */
        #lyx-app .features {
          width: min(780px, 94vw);
          margin: 6px auto 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }

        #lyx-app .feature {
          position: relative;
          min-height: 62px;
          padding: 0 10px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        #lyx-app .feature + .feature::before {
          content: "";
          position: absolute;
          left: 0;
          top: 10%;
          width: 1px;
          height: 75%;
          background: linear-gradient(
            transparent,
            rgba(58,87,159,.22),
            transparent
          );
        }

        #lyx-app .feature-icon {
          height: 24px;
          margin-bottom: 3px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        #lyx-app .feature-icon svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: url(#lyxGradient);
          stroke-width: 1.45;
        }

        #lyx-app .feature h3 {
          color: #17275e;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: .10em;
          line-height: 1.2;
        }

        #lyx-app .feature p {
          margin-top: 2px;
          color: #7885a6;
          font-size: 8.5px;
          line-height: 1.2;
        }

        /* FOOTER ENXUTO */
        #lyx-app .lyx-footer {
          width: min(600px, 86vw);
          margin: 4px auto 0;
          padding-top: 4px;
          border-top: 1px solid rgba(69,97,174,.12);
          text-align: center;
          color: #6e7d9f;
          font-size: 8.5px;
          letter-spacing: .18em;
          padding-left: .18em;
        }

        #lyx-app .bottom-copy {
          display: none;
        }

        @keyframes lyx-orb-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes lyx-core-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes lyx-dot-waiting {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.22);
          }
        }

        @keyframes lyx-text-waiting {
          0%, 100% {
            opacity: 0.88;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes lyx-dot-listening {
          0%, 100% {
            transform: scale(0.9);
          }
          50% {
            transform: scale(1.3);
          }
        }

        @keyframes lyx-ripple {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        @keyframes lyx-equalizer {
          0%, 100% {
            height: 3px;
          }
          50% {
            height: 11px;
          }
        }

        @media (max-height: 700px) {
          #lyx-app .lyx-brand-logo { height: 98px; }
          #lyx-app .lyx-orb { width: clamp(170px, 24vh, 215px); }
          #lyx-app .features { margin-top: 2px; }
          #lyx-app .feature { min-height: 48px; }
          #lyx-app .chat-area { margin-top: 3px; }
          #lyx-app .voice-area { margin-top: 3px; }
          #lyx-app .lyx-hero { margin-top: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          #lyx-app *,
          #lyx-app *::before,
          #lyx-app *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      {/* SVG DEFINITIONS */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="lyxGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#16dfff" />
            <stop offset="50%" stopColor="#2470ff" />
            <stop offset="100%" stopColor="#df3cff" />
          </linearGradient>
        </defs>
      </svg>

      <div className="lyx-arc arc-1"></div>
      <div className="lyx-arc arc-2"></div>
      <div className="lyx-arc arc-3"></div>

      <div className="lyx-bubble bubble-1"></div>
      <div className="lyx-bubble bubble-2"></div>

      <div className="lyx-container">
        {/* HEADER */}
        <header className="lyx-header">
          <button
            className="lyx-settings"
            id="lyxSettings"
            aria-label="Configurações de Voz"
            onClick={() => setIsVoiceModalOpen(true)}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 8.2 a3.8 3.8 0 1 0 0 7.6 a3.8 3.8 0 0 0 0-7.6Z" />
              <path d="M19.2 13.2 a7.5 7.5 0 0 0 .05-1.2 a7.5 7.5 0 0 0-.05-1.2 l2-1.5 -2-3.4 -2.35.95 a7.9 7.9 0 0 0-2.1-1.2 L14.4 3 H9.6 l-.35 2.65 a7.9 7.9 0 0 0-2.1 1.2 L4.8 5.9 l-2 3.4 2 1.5 a7.5 7.5 0 0 0 0 2.4 l-2 1.5 2 3.4 2.35-.95 a7.9 7.9 0 0 0 2.1 1.2 L9.6 21 h4.8 l.35-2.65 a7.9 7.9 0 0 0 2.1-1.2 l2.35.95 2-3.4 -2-1.5Z" />
            </svg>
          </button>

          {/* Grupo de Perfil com Botão de Planos Logo Abaixo */}
          <div className="flex flex-col items-end gap-1.5">
            <button
              className="lyx-profile"
              id="lyxProfile"
              onClick={() => {
                if (onOpenProfile) onOpenProfile();
                setIsProfileModalOpen(true);
              }}
            >
              <div className="profile-icon" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderUserAvatar(customAvatarUrl, 22)}
              </div>

              <div className="profile-name">Olá, {userName}</div>
            </button>

            {/* Botão de Planos com Stroke Dourado e Fundo Glass */}
            <button
              type="button"
              onClick={() => setIsPlansModalOpen(true)}
              className="h-6 px-2.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-amber-400/80 shadow-[0_2px_8px_rgba(245,158,11,0.14)] hover:shadow-[0_2px_12px_rgba(245,158,11,0.25)] transition-all flex items-center gap-1.5 text-slate-700 hover:text-amber-950 cursor-pointer active:scale-95"
              title="Escolha seu plano"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${userPlan === 'LYX Plus' ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-[10px] font-semibold tracking-tight">
                {userPlan === 'LYX Plus' ? 'LYX Plus' : userPlan === 'LYX Essencial' ? 'LYX Essencial' : 'Planos & Teste Grátis'}
              </span>
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="lyx-hero">
          <img
            src="./Logotipolyx.png"
            alt="LYX"
            className="lyx-brand-logo"
          />
          <div className="lyx-tagline">SEMPRE COM VOCÊ</div>
        </section>

        {/* VOICE */}
        <section className="voice-area">
          {/* ORBE COM LYX */}
          <button
            ref={orbRef}
            className={`lyx-orb ${isListening ? 'listening' : ''}`}
            id="lyxOrb"
            aria-label="Conversar com a LYX"
            aria-pressed={isListening}
            onClick={handleOrbClick}
          >
            <img
              src="./orbejuls.png"
              alt="Orbe LYX"
              className="lyx-orb-img"
            />
          </button>

          {/* STATUS ANIMADO */}
          <div className="voice-status">
            <div className={`voice-state ${voiceState === 'IDLE' ? 'waiting-state' : 'listening-state'}`}>
              {voiceState === 'IDLE' ? (
                <>
                  <span className="voice-dot">
                    <span className="voice-dot-ring"></span>
                  </span>
                  <span className="voice-text">LYX ESTÁ DESCANSANDO</span>
                </>
              ) : (
                <>
                  <span className="voice-dot">
                    <span className="voice-dot-ring"></span>
                  </span>
                  <span className="voice-text">
                    {voiceState === 'LISTENING' ? 'LYX ESTÁ OUVINDO' : voiceState === 'PROCESSING' ? 'LYX PROCESSANDO' : voiceState === 'ERROR' ? 'FALHA NO MICROFONE' : voiceState === 'INTERRUPTED' ? 'INTERROMPIDA' : 'LYX'}
                  </span>
                  {voiceState === 'LISTENING' && (
                    <span className="voice-waves">
                      <span className="wave-bar bar-1"></span>
                      <span className="wave-bar bar-2"></span>
                      <span className="wave-bar bar-3"></span>
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="voice-instruction">CLIQUE NA ORBE PRA CONVERSAR</div>
        </section>

        {/* CHAT - CARD GLASS COM STROKE GRADIENTE CORRENTE */}
        <section className="chat-area">
          {/* CONVERSA COM AUTO-SCROLL (ALTO ROOL) */}
          {globalMessages.length > 0 && (
            <div
              ref={messagesContainerRef}
              className="chat-messages-wrap"
              onClick={() => setIsChatWindowOpen(true)}
              title="Clique para abrir a conversa completa"
            >
              {globalMessages.map((msg) => (
                <div key={msg.id} className={`chat-msg-row ${msg.sender}`}>
                  <div
                    className={`chat-bubble ${msg.sender}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsChatWindowOpen(true);
                    }}
                  >
                    {msg.isAudio ? (
                      <div className="chat-bubble-audio">
                        <Volume2 size={12} />
                        <span className="chat-audio-wave">
                          <span className="chat-audio-bar" style={{ height: '5px' }} />
                          <span className="chat-audio-bar" style={{ height: '11px' }} />
                          <span className="chat-audio-bar" style={{ height: '8px' }} />
                          <span className="chat-audio-bar" style={{ height: '12px' }} />
                          <span className="chat-audio-bar" style={{ height: '6px' }} />
                        </span>
                        <span>{msg.text}</span>
                        <span style={{ fontSize: '9px', opacity: 0.6, marginLeft: '3px' }}>({msg.audioDuration})</span>
                      </div>
                    ) : (
                      <span>{msg.text}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            ref={chatBoxRef}
            className="chat-box cursor-pointer"
            id="lyxChat"
            onClick={() => {
              if (!isRecordingAudio) {
                setIsChatWindowOpen(true);
              }
            }}
          >
            {/* BOTÃO DE MICROFONE PRA MANDAR ÁUDIO */}
            <button
              className={`chat-mic ${isRecordingAudio ? 'recording' : ''}`}
              id="lyxMic"
              type="button"
              aria-label={isRecordingAudio ? 'Parar gravação' : 'Gravar áudio'}
              title={isRecordingAudio ? 'Gravando áudio... Clique para cancelar' : 'Gravar áudio'}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMic();
              }}
            >
              <Mic size={13} strokeWidth={2} />
            </button>

            {/* SE ATIVADO: ANIMAÇÃO DE ÁUDIO */}
            {isRecordingAudio ? (
              <div className="audio-live-container">
                <div className="audio-live-bars">
                  <span className="live-bar" />
                  <span className="live-bar" />
                  <span className="live-bar" />
                  <span className="live-bar" />
                  <span className="live-bar" />
                </div>
                <div className="audio-live-info">
                  <span className="audio-live-time">
                    0:{audioSeconds < 10 ? `0${audioSeconds}` : audioSeconds}
                  </span>
                  <span className="audio-live-label">
                    {transcribedAudioText ? `"${transcribedAudioText.slice(-18)}"` : 'Gravando áudio...'}
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="chat-content-center"
                role="button"
                tabIndex={0}
                title="Clique para abrir a conversa"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChatWindowOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsChatWindowOpen(true);
                  }
                }}
              >
                <div className="chat-icon">
                  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="M6 8h.01" />
                    <path d="M10 8h.01" />
                    <path d="M14 8h.01" />
                    <path d="M18 8h.01" />
                    <path d="M6 12h.01" />
                    <path d="M10 12h.01" />
                    <path d="M14 12h.01" />
                    <path d="M18 12h.01" />
                    <path d="M7 16h10" />
                  </svg>
                </div>

                <div className="chat-text">
                  <span className="chat-question">Não pode falar agora?</span>
                  <span className="chat-type">{message ? message : 'Digite.'}</span>
                </div>
              </div>
            )}

            {/* BOTÃO DE ENVIAR (CLICOU NO ENVIAR O ÁUDIO É ENVIADO) */}
            <button
              className="chat-send"
              id="lyxSend"
              aria-label={isRecordingAudio ? 'Enviar áudio' : 'Enviar'}
              title={isRecordingAudio ? 'Enviar áudio' : 'Enviar'}
              onClick={(e) => {
                e.stopPropagation();
                handleSendMessage();
              }}
            >
              <svg viewBox="0 0 24 24">
                <path d="M4 12h15" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </button>

            <input
              ref={inputRef}
              className={`chat-input ${isRecordingAudio ? 'pointer-events-none' : ''}`}
              id="lyxInput"
              type="text"
              autoComplete="off"
              aria-label="Digite uma mensagem"
              value={message}
              onFocus={handleInputFocus}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
        </section>

        {/* FEATURES */}
        <section className="features">
          {/* 01 */}
          <article className="feature">
            <div className="feature-icon">
              <svg viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="8" />
                <path d="M24 5v7 M24 36v7 M5 24h7 M36 24h7 M10.6 10.6l5 5 M32.4 32.4l5 5 M37.4 10.6l-5 5 M15.6 32.4l-5 5" />
              </svg>
            </div>
            <h3>
              ACOMPANHO
              <br />
              VOCÊ
            </h3>
            <p>
              Durante o seu
              <br />
              dia a dia.
            </p>
          </article>

          {/* 02 */}
          <article className="feature">
            <div className="feature-icon">
              <svg viewBox="0 0 48 48">
                <path d="M24 8 c-6.5 0-11 5-10 11 c-5 1-7 8-2.5 11.5 c2 1.5 4.3 1.7 6.2.8 C18 36 21 40 24 40 s6-4 6.3-8.7 c1.9.9 4.2.7 6.2-.8 C41 27 39 20 34 19 c1-6-3.5-11-10-11Z" />
                <path d="M24 13v22 M19 20c2-2 4-2 5 0 M29 20c-2-2-4-2-5 0 M19 28c2-2 4-2 5 0 M29 28c-2-2-4-2-5 0" />
              </svg>
            </div>
            <h3>
              TE AJUDO
              <br />A PENSAR MELHOR
            </h3>
            <p>
              Questões, ideias,
              <br />
              planos e muito mais.
            </p>
          </article>

          {/* 03 */}
          <article className="feature">
            <div className="feature-icon">
              <svg viewBox="0 0 48 48">
                <ellipse
                  cx="24"
                  cy="24"
                  rx="20"
                  ry="8"
                  transform="rotate(-28 24 24)"
                />
                <circle cx="24" cy="24" r="4" />
              </svg>
            </div>
            <h3>
              SEMPRE
              <br />
              AQUI
            </h3>
            <p>
              No seu ritmo,
              <br />
              quando você precisar.
            </p>
          </article>
        </section>

        {/* FOOTER */}
        <footer className="lyx-footer" id="lyxFooter">
          construído por WRLD e Antigravity
        </footer>
      </div>

      {/* MODAL CLEAN PREMIUM: TOM DE VOZ E VOZ NATIVA */}
      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentStyleId={currentStyleId}
        onChangeStyle={(id) => {
          if (onSelectStyle) onSelectStyle(id);
        }}
        onPreviewSpeech={onPreviewSpeech}
        userPlan={userPlan}
        onOpenPlans={() => {
          setIsVoiceModalOpen(false);
          setIsPlansModalOpen(true);
        }}
      />

      {/* JANELA DE CHAT COMPLETA COM HISTÓRICO, ORBE DA LYX E FOTO DA PESSOA */}
      <ChatWindowModal
        isOpen={isChatWindowOpen}
        onClose={() => setIsChatWindowOpen(false)}
        messages={globalMessages}
        onSendMessage={handleModalSendText}
        onSendAudioMessage={handleModalSendAudio}
        userName={userName}
        customAvatarUrl={customAvatarUrl}
      />

      {/* MODAL DE PERFIL: CONTA, PREFERÊNCIAS, DADOS E PRIVACIDADE, GESTÃO DA SESSÃO */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userName={userName}
        customAvatarUrl={customAvatarUrl}
        onUpdateUser={(data) => {
          if (data.name) setUserName(data.name);
          if (data.customAvatarUrl !== undefined) setCustomAvatarUrl(data.customAvatarUrl);
        }}
        currentStyleId={currentStyleId}
        onSelectStyle={onSelectStyle}
        onPreviewSpeech={onPreviewSpeech}
        onClearHistory={() => {
          if (onClearHistoryGlobal) onClearHistoryGlobal();
        }}
        onOpenPlans={() => {
          setIsProfileModalOpen(false);
          setIsPlansModalOpen(true);
        }}
        userPlan={userPlan}
      />

      {/* MODAL DE ESCOLHA DE PLANOS (DESIGN LIQUID GLASSMORPHISM) */}
      <PlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        currentPlanId={userPlan === 'LYX Plus' ? 'plus' : 'free'}
        onSelectPlan={(planId) => {
          const newPlan = planId === 'plus' ? 'LYX Plus' : 'Membro Alpha';
          setUserPlan(newPlan);
          try {
            localStorage.setItem('lyx_user_plan', newPlan);
          } catch {}
          setIsPlansModalOpen(false);
        }}
      />

      {/* 1. MODAL: AJUSTES & ENGRENAGENS (SETUP PROGRESS) */}
      <QwenDownloadModal onModelStatusChange={() => {}} />

      {/* 2. MODAL: COTA 80% (QUOTA WARNING) */}
      <QuotaWarningModal
        isOpen={activeSpecialModal === 'quota_warning'}
        percentage={
          loadVoiceQuotaState().usedSeconds > 0
            ? Math.min(100, Math.round((loadVoiceQuotaState().usedSeconds / 7200) * 100))
            : 75
        }
        onClose={() => setActiveSpecialModal(null)}
        onOpenPlans={() => {
          setActiveSpecialModal(null);
          setIsPlansModalOpen(true);
        }}
      />

      {/* 3. MODAL: LIMITE DIÁRIO ATINGIDO / COROA (QUOTA LIMIT) */}
      <QuotaLimitModal
        isOpen={activeSpecialModal === 'quota_limit'}
        onClose={() => setActiveSpecialModal(null)}
        onOpenPlans={() => {
          setActiveSpecialModal(null);
          setIsPlansModalOpen(true);
        }}
      />
    </div>
  );
};
