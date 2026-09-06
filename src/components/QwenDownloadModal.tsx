import React, { useState, useEffect, useRef } from 'react';
import { Download, CheckCircle2, RefreshCw, HardDrive, Volume2, Trash2, X, Sparkles } from 'lucide-react';
import { QwenModelManager } from '../services/qwenModelManager';

interface QwenDownloadModalProps {
  onModelStatusChange?: (isReady: boolean) => void;
}

export const QwenDownloadModal: React.FC<QwenDownloadModalProps> = ({ onModelStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(() => {
    return localStorage.getItem('lyx_models_ready') === 'true';
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Preparando inteligência e voz...');

  // Progresso individual
  const [ccpProgress, setCcpProgress] = useState({ percent: 0, dlMB: 0, totalMB: 1180 });
  const [kokoroProgress, setKokoroProgress] = useState({ percent: 0, dlMB: 0, totalMB: 345 });
  const [overallProgress, setOverallProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Registra listeners globais para a bridge nativa do Android
    (window as any).onUnifiedModelProgress = (
      ccpPct: number,
      ccpDl: number,
      ccpTot: number,
      kokoroPct: number,
      kokoroDl: number,
      kokoroTot: number,
      status: string
    ) => {
      setIsDownloading(true);
      setCcpProgress({ percent: ccpPct, dlMB: ccpDl, totalMB: ccpTot });
      setKokoroProgress({ percent: kokoroPct, dlMB: kokoroDl, totalMB: kokoroTot });
      setOverallProgress(Math.round((ccpPct + kokoroPct) / 2));
      if (status) setStatusMessage(status);
    };

    (window as any).onUnifiedStatusChecked = (ccpOk: boolean, kokoroOk: boolean, allOk: boolean) => {
      if (allOk) {
        setIsDownloaded(true);
        setIsDownloading(false);
        localStorage.setItem('lyx_models_ready', 'true');
        onModelStatusChange?.(true);
      }
    };

    (window as any).onModelDownloadComplete = () => {
      setIsDownloading(false);
      setIsDownloaded(true);
      setCcpProgress({ percent: 100, dlMB: 1180, totalMB: 1180 });
      setKokoroProgress({ percent: 100, dlMB: 345, totalMB: 345 });
      setOverallProgress(100);
      setStatusMessage('Modelos validados e prontos!');
      localStorage.setItem('lyx_models_ready', 'true');
      onModelStatusChange?.(true);
    };

    (window as any).onModelDownloadError = (err: string) => {
      setIsDownloading(false);
      setStatusMessage(`Erro: ${err}`);
    };
  }, [onModelStatusChange]);

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

  const handleStartDownload = () => {
    setIsDownloading(true);
    setOverallProgress(0);
    setStatusMessage('Iniciando download simultâneo...');

    if (window.AndroidBridge && (window.AndroidBridge as any).startModelDownload) {
      (window.AndroidBridge as any).startModelDownload();
    } else {
      // Simulação de browser para preview web
      let ccpP = 0;
      let kokP = 0;
      const timer = setInterval(() => {
        ccpP = Math.min(100, ccpP + 4);
        kokP = Math.min(100, kokP + 7);
        const overall = Math.round((ccpP + kokP) / 2);

        setCcpProgress({ percent: ccpP, dlMB: Math.round((ccpP / 100) * 1180), totalMB: 1180 });
        setKokoroProgress({ percent: kokP, dlMB: Math.round((kokP / 100) * 345), totalMB: 345 });
        setOverallProgress(overall);
        setStatusMessage(overall < 100 ? 'Baixando CCP/Llama e Kokoro PT-BR...' : 'Inicializando motores neurais...');

        if (overall >= 100) {
          clearInterval(timer);
          setIsDownloading(false);
          setIsDownloaded(true);
          localStorage.setItem('lyx_models_ready', 'true');
          onModelStatusChange?.(true);
        }
      }, 200);
    }
  };

  const handleDeleteModel = () => {
    setIsDownloaded(false);
    setOverallProgress(0);
    setCcpProgress({ percent: 0, dlMB: 0, totalMB: 1180 });
    setKokoroProgress({ percent: 0, dlMB: 0, totalMB: 345 });
    localStorage.removeItem('lyx_models_ready');
    onModelStatusChange?.(false);
  };

  return (
    <div ref={containerRef} className="relative z-30 pointer-events-auto">
      {/* Botão Micro de Status / Preparação dos Modelos */}
      <button
        id="qwen-download-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Status dos Modelos Locais"
        aria-expanded={isOpen}
        title="Modelos Locais: CCP/Llama + Kokoro PT-BR"
        className="group relative p-[1px] rounded-full cursor-pointer transition-transform duration-200 active:scale-90 focus:outline-none bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.4)] hover:shadow-[0_0_14px_rgba(56,189,248,0.6)]"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#080712]/95 backdrop-blur-md flex items-center justify-center transition-colors group-hover:bg-[#080712]/75">
          {isDownloaded ? (
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
          ) : isDownloading ? (
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] transition-transform group-hover:scale-110" />
          )}
        </div>
      </button>

      {/* Modal / Card Unificado de Preparação de Modelos */}
      {isOpen && (
        <div
          id="qwen-download-dropdown"
          className="absolute top-full right-0 mt-2.5 w-80 sm:w-88 py-3.5 px-3.5 rounded-2xl bg-[#090814]/98 border border-white/15 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.9),0_0_24px_rgba(56,189,248,0.2)] animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white tracking-wide">Motores Neurais LYX</h4>
                <p className="text-[9px] text-white/50">CCP/Llama + Kokoro PT-BR (pf_dora)</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/40 hover:text-white p-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Conteúdo do Card */}
          <div className="py-3">
            {isDownloaded ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium text-emerald-300">
                    Modelos 100% Validados e Ativos
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px] text-emerald-200/80">
                  <div className="flex items-center justify-between">
                    <span>• Inteligência: CCP / Llama (1.7B)</span>
                    <span className="text-emerald-400 font-mono">OK</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Voz Neural: Kokoro PT-BR (pf_dora)</span>
                    <span className="text-emerald-400 font-mono">OK</span>
                  </div>
                </div>

                <p className="text-[9.5px] text-emerald-200/60 leading-relaxed pt-1">
                  O LYX processa respostas e sintetiza fala totalmente offline sem depender da nuvem.
                </p>

                <div className="pt-1.5 flex items-center justify-between border-t border-emerald-500/15">
                  <span className="text-[9px] text-white/40">Status: READY</span>
                  <button
                    onClick={handleDeleteModel}
                    className="text-[9px] text-rose-400/80 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    Limpar cache
                  </button>
                </div>
              </div>
            ) : isDownloading ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cyan-300 font-medium">{statusMessage}</span>
                  <span className="text-white font-mono font-semibold">{overallProgress}%</span>
                </div>

                {/* Barra de Progresso Geral */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>

                {/* Detalhes de Cada Modelo */}
                <div className="space-y-2 pt-1 border-t border-white/5">
                  {/* CCP/Llama */}
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/80 flex items-center gap-1.5">
                        <HardDrive className="w-3 h-3 text-cyan-400" />
                        CCP / Llama (1.7B)
                      </span>
                      <span className="text-cyan-300 font-mono">{ccpProgress.percent}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-200"
                        style={{ width: `${ccpProgress.percent}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-white/40 text-right">
                      {ccpProgress.dlMB} / {ccpProgress.totalMB} MB
                    </div>
                  </div>

                  {/* Kokoro PT-BR */}
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/80 flex items-center gap-1.5">
                        <Volume2 className="w-3 h-3 text-purple-400" />
                        Kokoro PT-BR (pf_dora)
                      </span>
                      <span className="text-purple-300 font-mono">{kokoroProgress.percent}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-purple-400 transition-all duration-200"
                        style={{ width: `${kokoroProgress.percent}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-white/40 text-right">
                      {kokoroProgress.dlMB} / {kokoroProgress.totalMB} MB
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Prepare os motores neurais <strong className="text-white">CCP/Llama</strong> e{' '}
                  <strong className="text-purple-300">Kokoro PT-BR (pf_dora)</strong> para funcionamento 100% autônomo.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[9px] text-white/60">
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-1.5">
                    <HardDrive className="w-3 h-3 text-cyan-400" />
                    <span>Llama 1.7B (1.1 GB)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-1.5">
                    <Volume2 className="w-3 h-3 text-purple-400" />
                    <span>Kokoro 24k (345 MB)</span>
                  </div>
                </div>

                <button
                  id="start-qwen-download"
                  onClick={handleStartDownload}
                  className="mt-1 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 shadow-[0_0_14px_rgba(168,85,247,0.4)] active:scale-95 transition-all cursor-pointer hover:opacity-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  Preparar Modelos (1.5 GB)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
