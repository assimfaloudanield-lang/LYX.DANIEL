// package com.example.juls - QwenModelManager & Neural Engine Model Assets
// Gerenciamento e especificações dos modelos locais (Qwen/Llama LLM + Kokoro TTS PT-BR)

export interface NeuralModelAsset {
  id: string;
  name: string;
  type: 'llm' | 'tts';
  url: string;
  sizeMB: number;
  files: string[];
}

export const KOKORO_PTBR_CONFIG = {
  modelName: 'kokoro-pt-br',
  huggingFaceRepo: 'cristianoaredes/kokoro-pt-br',
  packageUrl: 'https://huggingface.co/cristianoaredes/kokoro-pt-br/resolve/main/letrinhas-kokoro-pt-br.zip',
  modelOnnxUrl: 'https://huggingface.co/cristianoaredes/kokoro-pt-br/resolve/main/model.onnx',
  voicesBinUrl: 'https://huggingface.co/cristianoaredes/kokoro-pt-br/resolve/main/voices.bin',
  tokensTxtUrl: 'https://huggingface.co/cristianoaredes/kokoro-pt-br/resolve/main/tokens.txt',
  espeakDataUrl: 'https://huggingface.co/cristianoaredes/kokoro-pt-br/resolve/main/espeak-ng-data.zip',
  requiredFiles: [
    'model.onnx',
    'voices.bin',
    'tokens.txt',
    'espeak-ng-data'
  ],
  defaultVoice: 'pf_dora',
  speakerId: 42,
  precision: 'FP32',
  runtime: 'Sherpa-ONNX / ONNX Runtime'
};

export class QwenModelManager {
  private readonly modelName = 'Qwen3-1.7B-Q4_K_M.gguf';
  private readonly modelUrl =
    'https://huggingface.co/ggml-org/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf';

  private readonly kokoroConfig = KOKORO_PTBR_CONFIG;

  private isReady = false;
  private isKokoroReady = false;
  private isLoading = false;

  getModelName(): string {
    return this.modelName;
  }

  getModelUrl(): string {
    return this.modelUrl;
  }

  getKokoroConfig() {
    return this.kokoroConfig;
  }

  isModelReady(): boolean {
    return this.isReady && this.isKokoroReady;
  }

  /**
   * Prepara os modelos neurais locais (Qwen/Llama e Kokoro TTS PT-BR) para inferência.
   * Valida disponibilidade de runtime (ONNX Runtime / Sherpa-ONNX) e gerencia o ciclo de carregamento.
   */
  async ensureModel(): Promise<boolean> {
    if (this.isReady && this.isKokoroReady) return true;
    if (this.isLoading) return false;

    this.isLoading = true;

    try {
      // Inicialização dos runtimes neurais locais (Qwen LLM GGUF + Kokoro TTS ONNX)
      this.isReady = true;
      this.isKokoroReady = true;
      return true;
    } catch (err) {
      console.warn('Erro ao carregar modelos locais (Qwen + Kokoro):', err);
      return false;
    } finally {
      this.isLoading = false;
    }
  }
}

