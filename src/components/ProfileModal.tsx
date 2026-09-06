import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Sliders,
  Shield,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Check,
  Calendar,
  Sparkles,
  Mail,
  Award,
  Volume2,
  Globe,
  MessageSquare,
  Sparkle,
  History,
  HardDrive,
  Trash2,
  Lock,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  Laptop,
  Clock,
  Radio,
  Power,
  CheckCircle2,
  Smile,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import {
  VOICE_STYLES,
  VoiceStyleOption,
  NativeVoiceOption,
} from './VoiceSettingsModal';
import { renderUserAvatar, renderDefaultGradientAvatar } from './UserAvatar';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
  customAvatarUrl?: string | null;
  onUpdateUser?: (data: { name?: string; email?: string; customAvatarUrl?: string | null }) => void;
  currentStyleId?: string;
  onSelectStyle?: (style: VoiceStyleOption) => void;
  onPreviewSpeech?: (text: string, pitch: number, rate: number) => void;
  voices?: NativeVoiceOption[];
  currentVoiceId?: string;
  onSelectVoice?: (voiceId: string) => void;
  onClearHistory?: () => void;
  onOpenPlans?: () => void;
  userPlan?: string;
}

export interface LanguageOption {
  code: 'pt' | 'en' | 'es' | 'fr';
  name: string;
  nativeName: string;
  flagUrl: string;
}

export interface ActiveSession {
  id: string;
  name: string;
  type: 'mobile' | 'desktop';
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: 'pt',
    name: 'Português',
    nativeName: 'Português (Brasil)',
    flagUrl: 'https://flagcdn.com/w80/br.png',
  },
  {
    code: 'en',
    name: 'Inglês',
    nativeName: 'English (US)',
    flagUrl: 'https://flagcdn.com/w80/us.png',
  },
  {
    code: 'es',
    name: 'Espanhol',
    nativeName: 'Español',
    flagUrl: 'https://flagcdn.com/w80/es.png',
  },
  {
    code: 'fr',
    name: 'Francês',
    nativeName: 'Français',
    flagUrl: 'https://flagcdn.com/w80/fr.png',
  },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  userName = 'Daniel',
  userEmail = 'assimfaloudanield@gmail.com',
  customAvatarUrl = null,
  onUpdateUser,
  currentStyleId = 'natural_balanced',
  onSelectStyle,
  onPreviewSpeech,
  onClearHistory,
  onOpenPlans,
  userPlan = 'Membro Alpha',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navegação interna do perfil
  const [currentSection, setCurrentSection] = useState<'menu' | 'conta' | 'preferencias' | 'dados' | 'sessao'>('menu');

  // Estados editáveis do tópico 1: CONTA
  const [name, setName] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const [email, setEmail] = useState(userEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(userEmail);

  const [userCustomAvatar, setUserCustomAvatar] = useState<string | null>(customAvatarUrl || null);

  // Plano e data
  const [currentPlan] = useState<'Membro Alpha' | 'LYX Pro' | 'Gratuito'>('Membro Alpha');
  const [memberSince] = useState('05 de Setembro de 2026');

  // Estados do tópico 2: PREFERÊNCIAS
  const [commTone, setCommTone] = useState<'descontraido' | 'equilibrado' | 'formal'>('equilibrado');
  const [responseLength, setResponseLength] = useState<'curtas' | 'diretas' | 'detalhadas'>('diretas');
  const [selectedVoiceStyleId, setSelectedVoiceStyleId] = useState(currentStyleId);
  const [selectedLang, setSelectedLang] = useState<'pt' | 'en' | 'es' | 'fr'>('pt');

  // Estados do tópico 3: DADOS E PRIVACIDADE
  const [isHistoryEnabled, setIsHistoryEnabled] = useState(true);
  const [historyDeletedNotice, setHistoryDeletedNotice] = useState(false);
  const [localDataCleanedNotice, setLocalDataCleanedNotice] = useState(false);
  const [localStorageSize] = useState('1.4 MB');
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [isConfirmingDeleteAll, setIsConfirmingDeleteAll] = useState(false);
  const [allDataDeletedNotice, setAllDataDeletedNotice] = useState(false);

  // Estados do tópico 4: GESTÃO DA SESSÃO
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 'session-1',
      name: 'Navegador Web (Este dispositivo)',
      type: 'desktop',
      location: 'São Paulo, Brasil',
      lastActive: 'Agora (Ativo)',
      isCurrent: true,
    },
    {
      id: 'session-2',
      name: 'iPhone 15 Pro • App LYX',
      type: 'mobile',
      location: 'São Paulo, Brasil',
      lastActive: 'Há 2 horas',
      isCurrent: false,
    },
    {
      id: 'session-3',
      name: 'MacBook Air • Safari',
      type: 'desktop',
      location: 'Rio de Janeiro, Brasil',
      lastActive: 'Ontem às 18:40',
      isCurrent: false,
    },
  ]);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState(false);

  useEffect(() => {
    setName(userName);
    setTempName(userName);
  }, [userName]);

  useEffect(() => {
    setEmail(userEmail);
    setTempEmail(userEmail);
  }, [userEmail]);

  useEffect(() => {
    setUserCustomAvatar(customAvatarUrl || null);
  }, [customAvatarUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUserCustomAvatar(base64);
        if (onUpdateUser) {
          onUpdateUser({ customAvatarUrl: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCustomAvatar = () => {
    setUserCustomAvatar(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onUpdateUser) {
      onUpdateUser({ customAvatarUrl: null });
    }
  };

  useEffect(() => {
    if (currentStyleId) {
      setSelectedVoiceStyleId(currentStyleId);
    }
  }, [currentStyleId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (currentSection !== 'menu') {
          setCurrentSection('menu');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSection, onClose]);

  if (!isOpen) return null;

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setName(trimmed);
      if (onUpdateUser) onUpdateUser({ name: trimmed });
    } else {
      setTempName(name);
    }
    setIsEditingName(false);
  };

  const handleSaveEmail = () => {
    const trimmed = tempEmail.trim();
    if (trimmed && trimmed.includes('@')) {
      setEmail(trimmed);
      if (onUpdateUser) onUpdateUser({ email: trimmed });
    } else {
      setTempEmail(email);
    }
    setIsEditingEmail(false);
  };

  const isUserPlus = userPlan === 'LYX Plus';

  const handleChooseStyle = (style: VoiceStyleOption) => {
    if (style.isPlusOnly && !isUserPlus) {
      if (onPreviewSpeech) {
        onPreviewSpeech(style.previewTtsSample, style.pitch, style.rate);
      }
      if (onOpenPlans) {
        onOpenPlans();
      }
      return;
    }
    setSelectedVoiceStyleId(style.id);
    if (onSelectStyle) onSelectStyle(style);
    if (onPreviewSpeech) {
      onPreviewSpeech(style.previewTtsSample, style.pitch, style.rate);
    }
  };

  // Limpeza de conversas
  const handleClearHistory = () => {
    if (onClearHistory) onClearHistory();
    setHistoryDeletedNotice(true);
    setTimeout(() => setHistoryDeletedNotice(false), 2800);
  };

  // Limpeza de dados locais
  const handleClearLocalData = () => {
    try {
      localStorage.removeItem('lyx_chat_cache');
      localStorage.removeItem('lyx_temp_state');
    } catch (e) {
      // safe fallback
    }
    setLocalDataCleanedNotice(true);
    setTimeout(() => setLocalDataCleanedNotice(false), 2800);
  };

  // Excluir todos os dados
  const handleExecuteDeleteAll = () => {
    if (onClearHistory) onClearHistory();
    try {
      localStorage.clear();
    } catch (e) {
      // safe fallback
    }
    setIsConfirmingDeleteAll(false);
    setAllDataDeletedNotice(true);
    setTimeout(() => setAllDataDeletedNotice(false), 3000);
  };

  // Desconectar sessão individual
  const handleDisconnectSession = (id: string, name: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setSessionNotice(`Sessão de "${name}" desconectada.`);
    setTimeout(() => setSessionNotice(null), 2800);
  };

  // Fazer logout no dispositivo atual
  const handleExecuteLogout = () => {
    setLogoutNotice(true);
    setTimeout(() => {
      if (onLogout) onLogout();
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      {/* Backdrop com desfoque suave */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Card Glass Clean idêntico à identidade visual da LYX */}
      <div
        ref={modalRef}
        className="relative w-full max-w-sm rounded-[24px] bg-white/95 backdrop-blur-2xl border border-white/70 shadow-[0_20px_60px_rgba(20,36,93,0.14)] p-5 text-slate-800 transition-all transform animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header do Perfil */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {currentSection !== 'menu' ? (
              <button
                onClick={() => setCurrentSection('menu')}
                className="w-7 h-7 -ml-1 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Voltar ao menu"
                title="Voltar"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-100 shadow-xs flex items-center justify-center bg-slate-50 shrink-0">
                {renderUserAvatar(userCustomAvatar, 32)}
              </div>
            )}
            <div>
              <h3 id="profile-modal-title" className="text-[13px] font-semibold text-slate-900 leading-tight">
                {currentSection === 'conta'
                  ? 'Conta'
                  : currentSection === 'preferencias'
                  ? 'Preferências'
                  : currentSection === 'dados'
                  ? 'Dados e Privacidade'
                  : currentSection === 'sessao'
                  ? 'Gestão da Sessão'
                  : `Olá, ${name}`}
              </h3>
              <p className="text-[10px] text-slate-500">
                {currentSection === 'conta'
                  ? 'Identidade no ecossistema da LYX'
                  : currentSection === 'preferencias'
                  ? 'Como a LYX se adapta a você'
                  : currentSection === 'dados'
                  ? 'Transparência, controle e segurança'
                  : currentSection === 'sessao'
                  ? 'Dispositivos, acessos e segurança'
                  : 'Perfil e configurações'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100/70 transition-colors"
            aria-label="Fechar perfil"
          >
            <X size={15} />
          </button>
        </div>

        {/* MENU PRINCIPAL */}
        {currentSection === 'menu' && (
          <div className="mt-4 space-y-2.5">
            {/* DESTAQUE PRINCIPAL: ESCOLHA SEU PLANO (LYX PLUS / ESSENCIAL) */}
            {onOpenPlans && (
              <div
                onClick={onOpenPlans}
                className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-blue-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 tracking-tight">
                          LYX Plus
                        </span>
                        <span className="text-[8px] font-bold tracking-wider text-blue-700 bg-blue-100/90 px-1.5 py-0.5 rounded-full border border-blue-200/60 uppercase">
                          10 Dias Grátis
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        Mensagens e voz ilimitadas, modelos avançados.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 shrink-0 ml-1">
                    <span>Ver planos</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            )}

            {/* 1. CONTA */}
            <button
              type="button"
              onClick={() => setCurrentSection('conta')}
              className="w-full text-left p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100/60 text-blue-600 flex items-center justify-center">
                    <User size={13} strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-800 uppercase">
                    Conta
                  </span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 pl-8">
                É a identidade do usuário no ecossistema da LYX.
              </p>
            </button>

            {/* 2. PREFERÊNCIAS */}
            <button
              type="button"
              onClick={() => setCurrentSection('preferencias')}
              className="w-full text-left p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100/60 text-indigo-600 flex items-center justify-center">
                    <Sliders size={13} strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-800 uppercase">
                    Preferências
                  </span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 pl-8">
                Comunicação, estilo de respostas, voz e idioma.
              </p>
            </button>

            {/* 3. DADOS E PRIVACIDADE */}
            <button
              type="button"
              onClick={() => setCurrentSection('dados')}
              className="w-full text-left p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100/60 text-emerald-600 flex items-center justify-center">
                    <Shield size={13} strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-800 uppercase">
                    Dados e Privacidade
                  </span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 pl-8">
                Histórico, armazenamento local e segurança de dados.
              </p>
            </button>

            {/* 4. GESTÃO DA SESSÃO */}
            <button
              type="button"
              onClick={() => setCurrentSection('sessao')}
              className="w-full text-left p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-100/60 text-rose-600 flex items-center justify-center">
                    <LogOut size={13} strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-800 uppercase">
                    Gestão da Sessão
                  </span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 pl-8">
                Dispositivos, atividade recente e encerramento de acesso.
              </p>
            </button>
          </div>
        )}

        {/* TÓPICO 1: CONTA */}
        {currentSection === 'conta' && (
          <div className="mt-3.5 space-y-3 max-h-[75%] min-h-[260px] overflow-y-auto pr-1">
            <div className="text-[11px] text-slate-500 pb-1 border-b border-slate-100">
              É a identidade do usuário no ecossistema da LYX.
            </div>

            {/* Avatar do perfil: padrão degradê neutro e opção de upload */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <User size={12} className="text-blue-600" />
                  Foto de perfil
                </span>
                {userCustomAvatar ? (
                  <button
                    type="button"
                    onClick={handleRemoveCustomAvatar}
                    className="text-[9px] font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full border border-rose-100 transition-colors"
                  >
                    Remover foto
                  </button>
                ) : (
                  <span className="text-[9px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    Degradê padrão
                  </span>
                )}
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Como você quer ser representado?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Avatar neutro em degradê pré-selecionado, com opção de enviar sua foto.
                </div>
              </div>

              {/* Seletor: Avatar Degradê Padrão vs Upload */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                {/* Opção 1: Avatar Degradê Padrão */}
                <button
                  type="button"
                  onClick={() => {
                    handleRemoveCustomAvatar();
                  }}
                  className={`relative p-1 rounded-2xl border transition-all flex items-center justify-center shrink-0 w-11 h-11 ${
                    !userCustomAvatar
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/30 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/50'
                  }`}
                  title="Avatar degradê padrão"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                    {renderDefaultGradientAvatar(32)}
                  </div>
                  {!userCustomAvatar && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Check size={9} strokeWidth={3} />
                    </div>
                  )}
                </button>

                {/* Opção 2: Upload de Foto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="avatar-upload-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative p-1 rounded-2xl border transition-all flex items-center justify-center shrink-0 w-11 h-11 ${
                    userCustomAvatar
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/30 shadow-xs'
                      : 'bg-white border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 text-slate-500 hover:text-blue-600'
                  }`}
                  title="Fazer upload de foto"
                >
                  {userCustomAvatar ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img src={userCustomAvatar} alt="Foto enviada" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <Upload size={16} strokeWidth={2} />
                  )}
                  {userCustomAvatar && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Check size={9} strokeWidth={3} />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Nome de exibição */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <User size={12} className="text-blue-600" />
                  Nome de exibição
                </span>
                {!isEditingName ? (
                  <button
                    onClick={() => {
                      setTempName(name);
                      setIsEditingName(true);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Editar nome"
                    aria-label="Editar nome"
                  >
                    <Edit2 size={12} />
                  </button>
                ) : (
                  <button
                    onClick={handleSaveName}
                    className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                    title="Salvar nome"
                    aria-label="Salvar nome"
                  >
                    <Check size={13} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Como prefere que eu te chame?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Escolha o nome que a LYX usará com você.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                      autoFocus
                      className="w-full text-[12px] font-medium text-slate-900 bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <div className="text-[12px] font-semibold text-slate-900 flex items-center justify-between">
                    <span>{name}</span>
                    <span className="text-[9px] font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100/80">
                      Ativo
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* E-mail cadastrado */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <Mail size={12} className="text-blue-600" />
                  E-mail cadastrado
                </span>
                {!isEditingEmail ? (
                  <button
                    onClick={() => {
                      setTempEmail(email);
                      setIsEditingEmail(true);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Alterar e-mail"
                    aria-label="Alterar e-mail"
                  >
                    <Edit2 size={12} />
                  </button>
                ) : (
                  <button
                    onClick={handleSaveEmail}
                    className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                    title="Salvar e-mail"
                    aria-label="Salvar e-mail"
                  >
                    <Check size={13} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Qual é seu e-mail?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  E-mail usado para acesso e recuperação da conta.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                {isEditingEmail ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="email"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEmail();
                        if (e.key === 'Escape') setIsEditingEmail(false);
                      }}
                      autoFocus
                      className="w-full text-[11px] font-medium text-slate-900 bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <div className="text-[11px] font-medium text-slate-800 break-all flex items-center justify-between">
                    <span>{email}</span>
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Verificado
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Plano / Nível de acesso */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <Award size={12} className="text-amber-500" />
                  Plano / Nível de acesso
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-700 bg-amber-50/90 border border-amber-200/60 px-2 py-0.5 rounded-full">
                  <Sparkles size={10} />
                  {userPlan || currentPlan}
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Qual é o seu plano?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Veja seu nível de acesso e os recursos disponíveis.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-600 font-medium">Acesso Completo & Voz Neural</span>
                {onOpenPlans && (
                  <button
                    type="button"
                    onClick={onOpenPlans}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-full border border-blue-200/60 transition-colors flex items-center gap-1"
                  >
                    <span>Ver planos</span>
                    <ChevronRight size={10} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>

            {/* Membro desde */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar size={12} className="text-indigo-600" />
                  Membro desde
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Quando começamos?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Veja há quanto tempo sua conta está ativa.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                <div className="text-[11px] font-medium text-slate-800">
                  {memberSince}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TÓPICO 2: PREFERÊNCIAS */}
        {currentSection === 'preferencias' && (
          <div className="mt-3.5 space-y-3 max-h-[75%] min-h-[260px] overflow-y-auto pr-1">
            <div className="text-[11px] text-slate-500 pb-1 border-b border-slate-100">
              Defina como a inteligência da LYX interage e se adapta a você.
            </div>

            {/* 1. Como a LYX fala com você */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <Sparkle size={12} className="text-indigo-600" />
                  Como a LYX fala com você
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Como você prefere conversar?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Defina o estilo de comunicação da LYX.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'descontraido', label: 'Descontraído' },
                    { id: 'equilibrado', label: 'Equilibrado' },
                    { id: 'formal', label: 'Formal' },
                  ] as const
                ).map((item) => {
                  const isSelected = commTone === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCommTone(item.id)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-medium transition-all text-center border ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold shadow-xs'
                          : 'bg-white/80 border-slate-200/80 text-slate-600 hover:bg-slate-100/70'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Respostas */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare size={12} className="text-blue-600" />
                  Respostas
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Como você gosta das respostas?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Ajuste a forma como a LYX responde às suas mensagens.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'curtas', label: 'Curtas' },
                    { id: 'diretas', label: 'Diretas' },
                    { id: 'detalhadas', label: 'Detalhadas' },
                  ] as const
                ).map((item) => {
                  const isSelected = responseLength === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setResponseLength(item.id)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-medium transition-all text-center border ${
                        isSelected
                          ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold shadow-xs'
                          : 'bg-white/80 border-slate-200/80 text-slate-600 hover:bg-slate-100/70'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Voz */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <Volume2 size={12} className="text-purple-600" />
                  Voz
                </span>
                <span className="text-[9px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  {VOICE_STYLES.find((s) => s.id === selectedVoiceStyleId)?.name || 'Natural'}
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Como você quer ouvir a LYX?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Escolha as preferências de voz e reprodução.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 space-y-1.5">
                {VOICE_STYLES.map((style) => {
                  const isSelected = selectedVoiceStyleId === style.id;
                  const isLocked = style.isPlusOnly && !isUserPlus;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => handleChooseStyle(style)}
                      className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-200 shadow-xs'
                          : isLocked
                          ? 'bg-slate-50/50 border-slate-200/60 opacity-90 hover:bg-white hover:border-amber-200'
                          : 'bg-white/80 border-slate-200/70 hover:bg-slate-100/60'
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-semibold text-slate-900 flex items-center gap-1.5">
                          {style.name}
                          <span className={`text-[8px] font-mono px-1 py-0.2 rounded ${
                            style.isPlusOnly 
                              ? 'text-amber-700 bg-amber-100/70 font-semibold' 
                              : 'text-emerald-700 bg-emerald-100/70 font-semibold'
                          }`}>
                            {style.badge}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-500 leading-tight">
                          {style.description}
                        </div>
                      </div>
                      {isLocked ? (
                        <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0" title="Exclusivo LYX Plus">
                          <Lock size={10} strokeWidth={2.2} />
                        </div>
                      ) : isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-400 hover:text-purple-600">Testar</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Idioma com bandeiras PNG */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <Globe size={12} className="text-emerald-600" />
                  Idioma
                </span>
                <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {LANGUAGES.find((l) => l.code === selectedLang)?.name}
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Em qual idioma conversamos?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Escolha o idioma principal da sua experiência com a LYX.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1.5">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLang(lang.code)}
                      className={`p-2 rounded-xl border transition-all flex items-center justify-between text-left ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-200 shadow-xs'
                          : 'bg-white/80 border-slate-200/70 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={lang.flagUrl}
                          alt={lang.name}
                          className="w-4 h-3 rounded-xs object-cover shadow-xs border border-black/10 shrink-0"
                          loading="lazy"
                        />
                        <div className="truncate">
                          <div className="text-[11px] font-semibold text-slate-900 leading-none truncate">
                            {lang.name}
                          </div>
                          <div className="text-[9px] text-slate-400 leading-tight truncate mt-0.5">
                            {lang.nativeName}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 ml-1">
                          <Check size={9} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TÓPICO 3: DADOS E PRIVACIDADE */}
        {currentSection === 'dados' && (
          <div className="mt-3.5 space-y-3 max-h-[75%] min-h-[260px] overflow-y-auto pr-1">
            <div className="text-[11px] text-slate-500 pb-1 border-b border-slate-100">
              Controle absoluto e transparente sobre os seus dados e privacidade.
            </div>

            {/* 1. Histórico de conversas */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <History size={12} className="text-emerald-600" />
                  Histórico de conversas
                </span>
                <button
                  type="button"
                  onClick={() => setIsHistoryEnabled(!isHistoryEnabled)}
                  className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isHistoryEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={isHistoryEnabled}
                  title="Ativar/Desativar histórico"
                >
                  <span
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isHistoryEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  O que a LYX deve guardar?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Gerencie o armazenamento do seu histórico de conversas.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div className="text-[10px] text-slate-500">
                  Status:{' '}
                  <span className={`font-semibold ${isHistoryEnabled ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {isHistoryEnabled ? 'Salvando histórico' : 'Histórico pausado'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[10px] font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1"
                  title="Excluir conversas salvas"
                >
                  <Trash2 size={10} />
                  Excluir conversas
                </button>
              </div>

              {historyDeletedNotice && (
                <div className="mt-2 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 text-center animate-in fade-in">
                  Histórico de conversas excluído com sucesso.
                </div>
              )}
            </div>

            {/* 2. Armazenamento local */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <HardDrive size={12} className="text-blue-600" />
                  Armazenamento local
                </span>
                <span className="text-[9px] font-mono text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded">
                  {localStorageSize}
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  O que fica neste aparelho?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Controle os dados armazenados localmente pela LYX.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Cache de voz e dados rápidos</span>
                <button
                  type="button"
                  onClick={handleClearLocalData}
                  className="text-[10px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 border border-slate-200/80"
                >
                  <RefreshCw size={10} />
                  Limpar dados locais
                </button>
              </div>

              {localDataCleanedNotice && (
                <div className="mt-2 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-1.5 text-center animate-in fade-in">
                  Armazenamento local liberado e limpo.
                </div>
              )}
            </div>

            {/* 3. Dados e segurança */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <Lock size={12} className="text-indigo-600" />
                  Dados e segurança
                </span>
                <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  Criptografia Ativa
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Seus dados, suas escolhas.
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Consulte e gerencie as opções relacionadas aos seus dados.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-600">
                  <span>Sincronização em nuvem segura</span>
                  <button
                    type="button"
                    onClick={() => setCloudSyncEnabled(!cloudSyncEnabled)}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    {cloudSyncEnabled ? 'Ativada' : 'Desativada'}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-600">
                  <span>Proteção de ponta a ponta</span>
                  <span className="text-emerald-600 font-medium">Habilitada</span>
                </div>
              </div>
            </div>

            {/* 4. Excluir dados */}
            <div className="p-3 rounded-2xl bg-rose-50/40 border border-rose-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-rose-600" />
                  Excluir dados
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-800">
                  Quer apagar tudo?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Exclua os dados associados à sua experiência na LYX.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-rose-200/60">
                {!isConfirmingDeleteAll ? (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDeleteAll(true)}
                    className="w-full py-1.5 px-3 rounded-xl text-[10px] font-medium text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Trash2 size={11} />
                    Excluir todos os dados
                  </button>
                ) : (
                  <div className="space-y-1.5 animate-in fade-in">
                    <p className="text-[10px] text-rose-700 text-center font-medium">
                      Tem certeza? Essa ação não poderá ser desfeita.
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDeleteAll(false)}
                        className="py-1 px-2 rounded-lg text-[10px] font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteDeleteAll}
                        className="py-1 px-2 rounded-lg text-[10px] font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
                      >
                        Confirmar e apagar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {allDataDeletedNotice && (
                <div className="mt-2 text-[10px] text-rose-700 bg-white border border-rose-200 rounded-lg p-1.5 text-center animate-in fade-in font-medium">
                  Todos os dados foram excluídos com sucesso.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TÓPICO 4: GESTÃO DA SESSÃO COM TODAS AS COPIES E FUNCIONALIDADES */}
        {currentSection === 'sessao' && (
          <div className="mt-3.5 space-y-3 max-h-[75%] min-h-[260px] overflow-y-auto pr-1">
            <div className="text-[11px] text-slate-500 pb-1 border-b border-slate-100">
              Controle de acessos, dispositivos e segurança ativa da conta.
            </div>

            {/* Aviso de feedback de desconexão de sessão */}
            {sessionNotice && (
              <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-center animate-in fade-in">
                {sessionNotice}
              </div>
            )}

            {/* 1. Dispositivos & 3. Encerrar sessões */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <Smartphone size={12} className="text-blue-600" />
                  Dispositivos
                </span>
                <span className="text-[9px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {sessions.length} {sessions.length === 1 ? 'ativo' : 'ativos'}
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Onde sua conta está conectada?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Consulte os dispositivos com acesso à sua conta.
                </div>
              </div>

              {/* Lista de sessões ativas com opção de desconectar individualmente */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                      session.isCurrent
                        ? 'bg-blue-50/70 border-blue-200/80'
                        : 'bg-white border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          session.type === 'mobile'
                            ? 'bg-indigo-100/70 text-indigo-600'
                            : 'bg-blue-100/70 text-blue-600'
                        }`}
                      >
                        {session.type === 'mobile' ? (
                          <Smartphone size={12} />
                        ) : (
                          <Laptop size={12} />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="text-[10px] font-semibold text-slate-900 leading-tight truncate flex items-center gap-1">
                          {session.name}
                        </div>
                        <div className="text-[9px] text-slate-400 leading-tight truncate mt-0.5">
                          {session.location} • {session.lastActive}
                        </div>
                      </div>
                    </div>

                    {session.isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-[8px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                        <Radio size={8} className="text-emerald-500 animate-pulse" />
                        Atual
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDisconnectSession(session.id, session.name)}
                        className="text-[9px] font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors border border-rose-100 shrink-0"
                        title="Desconectar este aparelho"
                      >
                        Desconectar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Atividade */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock size={12} className="text-indigo-600" />
                  Atividade
                </span>
                <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Online agora
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Quando foi seu último acesso?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Consulte a atividade recente da sua conta.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-600 text-[10px]">Sessão iniciada hoje:</span>
                <span className="font-semibold text-slate-900 text-[10px]">05 de Setembro • 11:37</span>
              </div>
            </div>

            {/* 3. Encerrar sessões (bloco explicativo/ação em massa) */}
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                  <Power size={12} className="text-amber-600" />
                  Encerrar sessões
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-700">
                  Quer desconectar algum dispositivo?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Encerre sessões ativas em outros dispositivos.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                {sessions.filter((s) => !s.isCurrent).length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSessions((prev) => prev.filter((s) => s.isCurrent));
                      setSessionNotice('Todas as outras sessões foram desconectadas.');
                      setTimeout(() => setSessionNotice(null), 2800);
                    }}
                    className="w-full py-1.5 px-3 rounded-xl text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100/70 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Power size={11} />
                    Desconectar todas as outras sessões ({sessions.filter((s) => !s.isCurrent).length})
                  </button>
                ) : (
                  <div className="text-[10px] text-slate-500 text-center py-1">
                    Nenhum outro dispositivo conectado no momento.
                  </div>
                )}
              </div>
            </div>

            {/* 4. Sair */}
            <div className="p-3 rounded-2xl bg-rose-50/40 border border-rose-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-800 flex items-center gap-1.5">
                  <LogOut size={12} className="text-rose-600" />
                  Sair
                </span>
              </div>

              <div className="mt-1">
                <div className="text-[11px] font-medium text-slate-800">
                  Quer sair da LYX?
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Encerre sua sessão neste dispositivo.
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-rose-200/60">
                {!isConfirmingLogout ? (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingLogout(true)}
                    className="w-full py-1.5 px-3 rounded-xl text-[10px] font-medium text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <LogOut size={11} />
                    Fazer logout deste aparelho
                  </button>
                ) : (
                  <div className="space-y-1.5 animate-in fade-in">
                    <p className="text-[10px] text-rose-700 text-center font-medium">
                      Confirmar encerramento da sessão neste dispositivo?
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingLogout(false)}
                        className="py-1 px-2 rounded-lg text-[10px] font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteLogout}
                        className="py-1 px-2 rounded-lg text-[10px] font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
                      >
                        Confirmar saída
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {logoutNotice && (
                <div className="mt-2 text-[10px] text-rose-700 bg-white border border-rose-200 rounded-lg p-1.5 text-center animate-in fade-in font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 size={11} />
                  Sessão encerrada com sucesso. Até logo!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rodapé com botão de logout se no menu */}
        {onLogout && currentSection === 'menu' && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={onLogout}
              className="w-full py-2 px-3 text-[11px] font-medium text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut size={12} strokeWidth={2} />
              Sair da conta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
