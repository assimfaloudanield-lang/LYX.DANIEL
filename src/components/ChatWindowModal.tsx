import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, Volume2 } from 'lucide-react';
import { renderUserAvatar } from './UserAvatar';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'lyx';
  text: string;
  isAudio?: boolean;
  audioDuration?: string;
  time: string;
}

interface ChatWindowModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendAudioMessage: (audioDuration: string, transcribedText: string) => void;
  userName?: string;
  customAvatarUrl?: string | null;
}

export const ChatWindowModal: React.FC<ChatWindowModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onSendAudioMessage,
  userName = 'Daniel',
  customAvatarUrl = null,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);
  const speechRecRef = useRef<any>(null);

  // Auto scroll para o final das mensagens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages]);

  // Foco no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    } else {
      stopRecording();
    }
  }, [isOpen]);

  const startRecording = () => {
    setIsRecording(true);
    setRecSeconds(0);
    setTranscribedText('');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecSeconds((prev) => prev + 1);
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
          rec.onresult = (e: any) => {
            let str = '';
            for (let i = 0; i < e.results.length; i++) {
              str += e.results[i][0].transcript;
            }
            if (str.trim()) setTranscribedText(str.trim());
          };
          rec.onerror = () => {};
          rec.start();
          speechRecRef.current = rec;
        } catch {}
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {}
      speechRecRef.current = null;
    }
  };

  const handleSend = () => {
    if (isRecording) {
      const durStr = `0:${recSeconds < 10 ? '0' : ''}${Math.max(1, recSeconds)}`;
      const transcript = transcribedText.trim() || 'Mensagem de voz';
      stopRecording();
      onSendAudioMessage(durStr, transcript);
      setRecSeconds(0);
      setTranscribedText('');
      return;
    }

    const trimmed = inputText.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    onSendMessage(trimmed);
    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Janela de Conversa"
    >
      {/* Backdrop fosco */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Janela de Chat Glassmorphism Clean Premium */}
      <div className="relative w-full max-w-lg h-[88%] min-h-[400px] max-h-[640px] rounded-[28px] bg-white/92 backdrop-blur-2xl border border-white/70 shadow-[0_25px_70px_rgba(20,36,93,0.18)] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* CABEÇALHO DO CHAT */}
        <header className="px-5 py-3.5 border-b border-slate-100/90 flex items-center justify-between bg-white/70 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            {/* Foto / Orbe da LYX no cabeçalho */}
            <div className="relative w-9 h-9 rounded-full overflow-hidden p-0.5 bg-gradient-to-br from-blue-400 via-indigo-300 to-purple-400 shadow-sm flex items-center justify-center">
              <img
                src="./orbejuls.png"
                alt="LYX"
                className="w-full h-full object-cover rounded-full"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-semibold text-slate-900 tracking-tight">LYX</h3>
                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  Inteligência Pessoal
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Conversando com {userName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors"
            aria-label="Fechar chat"
          >
            <X size={17} />
          </button>
        </header>

        {/* CORPO DE MENSAGENS COM AUTO-SCROLL */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 scroll-smooth min-h-0">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2.5">
              <div className="w-14 h-14 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-blue-100 via-indigo-50 to-purple-100 shadow-inner flex items-center justify-center">
                <img
                  src="./orbejuls.png"
                  alt="LYX"
                  className="w-full h-full object-cover rounded-full opacity-90"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-700">Olá, {userName}!</p>
                <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto mt-0.5">
                  Estou aqui com você. Digite uma mensagem ou mande um áudio.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in-50 duration-150`}
                >
                  {/* Foto do remetente */}
                  {isUser ? (
                    // Avatar do usuário (degradê ou foto personalizada)
                    <div
                      className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-blue-200/80 shadow-xs flex items-center justify-center bg-slate-50"
                      title={userName}
                    >
                      {renderUserAvatar(customAvatarUrl, 28)}
                    </div>
                  ) : (
                    // Orbe da LYX
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-blue-100 shadow-sm p-0.5 bg-white">
                      <img
                        src="./orbejuls.png"
                        alt="LYX"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  )}

                  {/* Bolha de mensagem */}
                  <div className={`max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-3.5 py-2 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200/70 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.isAudio ? (
                        <div className="flex items-center gap-2">
                          <Volume2 size={13} className={isUser ? 'text-blue-200' : 'text-blue-600'} />
                          <div className="flex items-center gap-0.5 h-3">
                            <span className={`w-0.5 rounded-full ${isUser ? 'bg-white/80' : 'bg-blue-500'}`} style={{ height: '6px' }} />
                            <span className={`w-0.5 rounded-full ${isUser ? 'bg-white/80' : 'bg-blue-500'}`} style={{ height: '12px' }} />
                            <span className={`w-0.5 rounded-full ${isUser ? 'bg-white/80' : 'bg-blue-500'}`} style={{ height: '8px' }} />
                            <span className={`w-0.5 rounded-full ${isUser ? 'bg-white/80' : 'bg-blue-500'}`} style={{ height: '14px' }} />
                            <span className={`w-0.5 rounded-full ${isUser ? 'bg-white/80' : 'bg-blue-500'}`} style={{ height: '5px' }} />
                          </div>
                          <span>{msg.text}</span>
                          <span className={`text-[9px] ml-1 ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                            ({msg.audioDuration})
                          </span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* BARRA DE ENTRADA DO CHAT */}
        <div className="p-3 border-t border-slate-100/90 bg-white/80 backdrop-blur-xl shrink-0">
          <div className="relative flex items-center gap-2 rounded-2xl bg-slate-100/80 border border-slate-200/70 px-3 py-1.5 focus-within:bg-white focus-within:border-blue-400/80 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            
            {/* Botão de Mic */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200'
                  : 'text-slate-400 hover:text-blue-600 hover:bg-white'
              }`}
              title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
              aria-label={isRecording ? 'Parar gravação' : 'Gravar áudio'}
            >
              <Mic size={14} />
            </button>

            {/* Input ou Animação de Áudio */}
            {isRecording ? (
              <div className="flex-1 flex items-center gap-2 py-1">
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 h-2 bg-rose-500 rounded-full animate-pulse" />
                  <span className="w-1 h-3.5 bg-rose-500 rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-rose-500 rounded-full animate-pulse delay-150" />
                </div>
                <span className="text-[11px] font-semibold text-rose-600">
                  0:{recSeconds < 10 ? `0${recSeconds}` : recSeconds}
                </span>
                <span className="text-[10px] text-slate-500 truncate flex-1">
                  {transcribedText ? `"${transcribedText}"` : 'Gravando sua voz...'}
                </span>
              </div>
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escreva uma mensagem..."
                className="flex-1 bg-transparent text-[12px] text-slate-800 placeholder-slate-400 outline-none"
              />
            )}

            {/* Botão de Envio */}
            <button
              type="button"
              onClick={handleSend}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white shadow-sm'
                  : inputText.trim()
                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                  : 'text-slate-300 hover:text-slate-400'
              }`}
              title="Enviar"
              aria-label="Enviar"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
