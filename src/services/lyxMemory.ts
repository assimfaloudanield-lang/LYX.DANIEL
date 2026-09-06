// Local persistent memory service for LYX
// Adheres strictly to: 100% on-device local storage, no external memory server, survives restarts

export interface LyxMemoryItem {
  id: string;
  key: string;
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'lyx_persistent_memories';

export class LyxMemoryService {
  private static instance: LyxMemoryService | null = null;
  private memories: LyxMemoryItem[] = [];

  constructor() {
    this.load();
  }

  public static getInstance(): LyxMemoryService {
    if (!LyxMemoryService.instance) {
      LyxMemoryService.instance = new LyxMemoryService();
    }
    return LyxMemoryService.instance;
  }

  public load(): LyxMemoryItem[] {
    // 1. Tenta carregar da bridge nativa do Android (arquivo JSON no sandbox privado)
    if (typeof window !== 'undefined' && window.AndroidBridge?.getMemories) {
      try {
        const nativeJson = window.AndroidBridge.getMemories();
        if (nativeJson && nativeJson.trim()) {
          const parsed = JSON.parse(nativeJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.memories = parsed;
            this.syncToLocalStorage();
            return this.memories;
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar memórias do AndroidBridge:', e);
      }
    }

    // 2. Fallback de persistência no localStorage local
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.memories = parsed;
            return this.memories;
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar memórias do localStorage:', e);
      }
    }

    // Memória inicial padrão estável
    if (this.memories.length === 0) {
      this.memories = [
        {
          id: 'user_name_default',
          key: 'nome',
          content: 'O usuário se chama Daniel.',
          timestamp: Date.now(),
        },
      ];
      this.syncToLocalStorage();
    }

    return this.memories;
  }

  private syncToLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memories));
      } catch {
        // Falha segura
      }
    }
  }

  public getMemories(): LyxMemoryItem[] {
    return [...this.memories];
  }

  public saveMemory(key: string, content: string): boolean {
    const trimmedContent = content.trim();
    if (!trimmedContent) return false;

    // Notifica AndroidBridge se disponível
    if (typeof window !== 'undefined' && window.AndroidBridge?.saveMemory) {
      try {
        window.AndroidBridge.saveMemory(key, trimmedContent);
      } catch (e) {
        console.warn('Erro ao salvar no AndroidBridge:', e);
      }
    }

    const existingIndex = this.memories.findIndex(
      (m) => m.key.toLowerCase() === key.toLowerCase()
    );

    const newItem: LyxMemoryItem = {
      id: `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      key: key.trim(),
      content: trimmedContent,
      timestamp: Date.now(),
    };

    if (existingIndex >= 0) {
      this.memories[existingIndex] = newItem;
    } else {
      this.memories.push(newItem);
    }

    this.syncToLocalStorage();
    return true;
  }

  public getRelevantContext(query: string): string {
    // 1. Tenta obter contexto compilado pelo motor Android nativo
    if (typeof window !== 'undefined' && window.AndroidBridge?.getRelevantMemoryContext) {
      try {
        const ctx = window.AndroidBridge.getRelevantMemoryContext(query);
        if (ctx && ctx.trim()) return ctx.trim();
      } catch {
        // Segue para processamento local
      }
    }

    if (this.memories.length === 0) return '';

    const queryWords = query
      .toLowerCase()
      .split(/[^a-záàâãéèêíïóôõöúçñ0-9]+/i)
      .filter((w) => w.length > 2);

    const relevant: LyxMemoryItem[] = [];

    // Nome e preferências básicas sempre têm prioridade se pertinentes
    const nameItem = this.memories.find(
      (m) => m.key === 'nome' || m.content.toLowerCase().includes('daniel')
    );
    if (nameItem) {
      relevant.push(nameItem);
    }

    for (const item of this.memories) {
      if (relevant.includes(item)) continue;
      const lower = item.content.toLowerCase();
      if (queryWords.some((word) => lower.includes(word))) {
        relevant.push(item);
      }
      if (relevant.length >= 8) break;
    }

    if (relevant.length < 4) {
      const remaining = this.memories.filter((m) => !relevant.includes(m)).slice(-4);
      relevant.push(...remaining);
    }

    if (relevant.length === 0) return '';

    const lines = relevant.map((item) => `- ${item.content}`);
    return `Informações e preferências memorizadas sobre o usuário:\n${lines.join('\n')}`;
  }

  /**
   * Extrai fatos duráveis do usuário automaticamente sem poluir o histórico
   */
  public autoExtractMemory(userInput: string) {
    const raw = userInput.trim();
    if (!raw) return;

    if (typeof window !== 'undefined' && window.AndroidBridge?.autoExtractMemory) {
      try {
        window.AndroidBridge.autoExtractMemory(raw);
      } catch {
        // Fallback para lógica JS
      }
    }

    const lower = raw.toLowerCase();

    // 1. Nome do usuário
    const nomeMatch = raw.match(/(?:meu nome é|me chamo|sou o|pode me chamar de)\s+([A-ZÀ-Úa-zà-ú]+)/i);
    if (nomeMatch && nomeMatch[1]) {
      const nome = nomeMatch[1].charAt(0).toUpperCase() + nomeMatch[1].slice(1).toLowerCase();
      this.saveMemory('nome', `O usuário se chama ${nome}.`);
      return;
    }

    // 2. Preferências
    if (
      lower.startsWith('eu gosto de ') ||
      lower.startsWith('eu adoro ') ||
      lower.startsWith('minha preferência é ') ||
      lower.startsWith('eu prefiro ')
    ) {
      this.saveMemory(`pref_${Date.now()}`, `Preferência do usuário: ${raw}`);
      return;
    }

    // 3. Profissão / Trabalho
    if (
      lower.includes('eu trabalho com ') ||
      lower.includes('minha profissão é ') ||
      lower.includes('sou programador') ||
      lower.includes('sou desenvolvedor')
    ) {
      this.saveMemory('trabalho', `Profissão/Trabalho do usuário: ${raw}`);
      return;
    }

    // 4. Projetos
    if (
      lower.includes('meu projeto é ') ||
      lower.includes('estou desenvolvendo ') ||
      lower.includes('estou criando ') ||
      lower.includes('estou programando ')
    ) {
      this.saveMemory('projeto', `Projeto atual do usuário: ${raw}`);
      return;
    }

    // 5. Instruções explícitas de memorização ("lembre que...", "anote que...")
    const lembreMatch = raw.match(/(?:lembre(?:-se)?\s+que|lembre\s+de|guarde\s+que|memorize\s+que|anote\s+que)\s+(.+)/i);
    if (lembreMatch && lembreMatch[1]) {
      const fato = lembreMatch[1].trim();
      this.saveMemory(`fato_${Date.now()}`, fato);
      return;
    }
  }
}

export const lyxMemory = LyxMemoryService.getInstance();
