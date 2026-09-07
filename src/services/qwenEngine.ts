// package com.example.juls - QwenEngine & LYX Conversational Behavior
import { QwenModelManager } from './qwenModelManager';
import { lyxMemory } from './lyxMemory';

export interface ChatHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

export class QwenEngine {
  private modelManager: QwenModelManager;
  private speculativeCache: Map<string, string> = new Map();
  private lastPartialPrompt: string = '';

  constructor() {
    this.modelManager = new QwenModelManager();
  }

  /**
   * Pré-aquece e prepara especulativamente a resposta em background enquanto o usuário ainda fala
   */
  prepararRespostaEspeculativa(
    partialText: string,
    styleId: string = 'natural_balanced',
    history: ChatHistoryMessage[] = []
  ): void {
    const limpo = partialText.trim();
    if (!limpo || limpo.length < 3) return;

    this.lastPartialPrompt = limpo.toLowerCase();
    const memoryContext = lyxMemory.getRelevantContext(limpo);
    const preCalculated = this.gerarRespostaLocal(limpo, styleId, memoryContext);
    this.speculativeCache.set(this.lastPartialPrompt, preCalculated);
  }

  /**
   * Envia o texto reconhecido e transmite sentenças em streaming contínuo (Token-to-Speech),
   * aplicando iniciativa conversacional ativa, janela de contexto otimizada e cancelamento real.
   */
  async responderStream(
    texto: string,
    onChunk: (chunk: string, isFirst: boolean, isFinal: boolean) => void,
    onFullReply: (fullReply: string) => void,
    styleId: string = 'natural_balanced',
    history: ChatHistoryMessage[] = [],
    abortSignal?: AbortSignal
  ): Promise<void> {
    const limpo = texto.trim();
    if (!limpo) return;

    lyxMemory.autoExtractMemory(limpo);
    const memoryContext = lyxMemory.getRelevantContext(limpo);

    // Janela de contexto imediato: envia no máximo as últimas 6 mensagens relevantes
    const recentHistory = history.slice(-6);

    // Se já houver resposta pré-calculada especulativamente para a fala em andamento, entrega instantaneamente
    const cachedPrecalc = this.speculativeCache.get(limpo.toLowerCase());
    if (cachedPrecalc) {
      this.speculativeCache.clear();
      onChunk(cachedPrecalc, true, true);
      onFullReply(cachedPrecalc);
      return;
    }

    const lower = limpo.toLowerCase();
    // Respeito ao encerramento / despedida imediata
    if (
      lower.includes('desligar') ||
      lower.includes('apagar') ||
      lower.includes('desativar') ||
      lower.includes('parar lyx') ||
      lower.includes('tchau') ||
      lower.includes('até logo') ||
      lower.includes('ate logo') ||
      lower.includes('vou dormir') ||
      lower.includes('preciso sair') ||
      lower.includes('descansar')
    ) {
      const exitMsg = lower.includes('dormir') || lower.includes('descansar')
        ? 'Tá bom. Descansa. A gente continua depois.'
        : 'Até mais! Qualquer coisa estou por aqui.';
      onChunk(exitMsg, true, true);
      onFullReply(exitMsg);
      return;
    }

    let isFirstChunk = true;
    let fullAccumulated = '';
    let sentenceBuffer = '';

    const emitSentence = (sentence: string, isFinal: boolean) => {
      if (abortSignal?.aborted) return;
      const clean = sentence.trim();
      if (clean) {
        onChunk(clean, isFirstChunk, isFinal);
        isFirstChunk = false;
      }
    };

    try {
      // Se estiver no Android com bridge nativa offline
      if (window.AndroidBridge && (window.AndroidBridge as any).generateNativeResponse) {
        let responded = false;
        const timer = setTimeout(() => {
          if (!responded && !abortSignal?.aborted) {
            responded = true;
            const fallback = this.gerarRespostaLocal(limpo, styleId, memoryContext);
            onChunk(fallback, true, true);
            onFullReply(fallback);
          }
        }, 4000);

        (window as any).onQwenResponse = (window as any).onNativeResponse = (resposta: string) => {
          clearTimeout(timer);
          if (responded || abortSignal?.aborted) return;
          responded = true;
          const finalAns = resposta && resposta.trim() ? resposta.trim() : this.gerarRespostaLocal(limpo, styleId, memoryContext);
          onChunk(finalAns, true, true);
          onFullReply(finalAns);
        };

        (window.AndroidBridge as any).generateNativeResponse(limpo, JSON.stringify(recentHistory));
        return;
      }

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: limpo,
          styleId,
          history: recentHistory,
          memories: memoryContext,
        }),
        signal: abortSignal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Falha no streaming da resposta');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let sseBuffer = '';

      while (!done) {
        if (abortSignal?.aborted) {
          try { reader.cancel(); } catch {}
          return;
        }

        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          sseBuffer += decoder.decode(value, { stream: !done });
          const lines = sseBuffer.split('\n');
          sseBuffer = lines.pop() || '';

          for (const line of lines) {
            if (abortSignal?.aborted) return;
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data:')) {
              try {
                const data = JSON.parse(trimmedLine.replace(/^data:\s*/, ''));
                if (data.chunk) {
                  fullAccumulated += data.chunk;
                  sentenceBuffer += data.chunk;

                  // Procura pontuação de fronteira de sentença para emitir fala instantaneamente
                  const match = sentenceBuffer.match(/([.!?\n]+|\s*[,;:]\s+)/);
                  if (match && match.index !== undefined) {
                    const splitIdx = match.index + match[0].length;
                    const readySentence = sentenceBuffer.substring(0, splitIdx);
                    const wordCount = readySentence.split(/\s+/).length;
                    if (match[0].includes('.') || match[0].includes('!') || match[0].includes('?') || match[0].includes('\n') || wordCount >= 5) {
                      emitSentence(readySentence, false);
                      sentenceBuffer = sentenceBuffer.substring(splitIdx);
                    }
                  }
                }
              } catch {
                // Ignore parse error
              }
            }
          }
        }
      }

      if (abortSignal?.aborted) return;

      if (sentenceBuffer.trim()) {
        emitSentence(sentenceBuffer, true);
      }

      if (fullAccumulated.trim()) {
        onFullReply(fullAccumulated.trim());
        return;
      }
    } catch (err: any) {
      if (abortSignal?.aborted || err?.name === 'AbortError') {
        return;
      }
      // Fallback local seguro caso a rede caia ou o servidor esteja inacessível
    }

    if (abortSignal?.aborted) return;

    const fallback = this.gerarRespostaLocal(limpo, styleId, memoryContext);
    onChunk(fallback, true, true);
    onFullReply(fallback);
  }

  /**
   * Gera uma iniciativa conversacional espontânea quando a conversa estiver silenciosa por um tempo.
   */
  gerarProactiveThought(styleId: string = 'natural_balanced', history: ChatHistoryMessage[] = []): string {
    const recentTopic = history.length > 0 ? history[history.length - 1].text.toLowerCase() : '';

    if (recentTopic.includes('trabalho') || recentTopic.includes('projeto')) {
      return 'Aliás, você conseguiu avançar naquilo que estava planejando?';
    }
    if (recentTopic.includes('estranho') || recentTopic.includes('cansado')) {
      return 'Você ficou em silêncio. Quer tirar um momento pra descansar ou prefere conversar?';
    }

    switch (styleId) {
      case 'young_energetic': {
        const pool = [
          'Aliás, tive uma ideia sobre o que a gente tava falando.',
          'Tá, agora fiquei curiosa. No que você tá pensando agora?',
          'Já que estamos aqui, deixa eu te perguntar uma coisa rápida.',
          'Pensando no que você falou antes... o que a gente faz agora?',
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      }
      case 'calm_gentle': {
        const pool = [
          'Se quiser, pode me contar o que está passando pela sua cabeça.',
          'Fiquei pensando no que você comentou antes... Parece ter bastante coisa aí dentro.',
          'Você ficou quietinho. Tudo bem por aí?',
          'Sem pressa nenhuma. Quando quiser continuar, estou aqui com você.',
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      }
      case 'direct_agile': {
        const pool = [
          'Uma coisa ficou pendente: você decidiu o próximo passo?',
          'Pensando nisso, tem um ponto importante pra gente fechar.',
          'Tudo certo por aí? Podemos seguir.',
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      }
      case 'natural_balanced':
      default: {
        const pool = [
          'Aliás, como ficou aquilo que você estava fazendo?',
          'Pensando no que você comentou antes, me veio uma dúvida.',
          'Você ficou pensativo. Tudo certo por aí?',
          'Já que estamos aqui, me conta: qual é o plano pra hoje?',
        ];
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }

  private gerarRespostaLocal(texto: string, styleId: string = 'natural_balanced', memoryContext: string = ''): string {
    const lower = texto.toLowerCase().trim();

    // Consultas diretas sobre memórias
    if (lower.includes('meu nome') || lower.includes('como me chamo')) {
      const nameMem = lyxMemory.getMemories().find(m => m.key === 'nome' || m.content.toLowerCase().includes('daniel'));
      if (nameMem) {
        return nameMem.content;
      }
      return 'Você é o Daniel! Posso te chamar assim.';
    }

    if (lower.includes('o que você sabe sobre mim') || lower.includes('minhas preferências') || lower.includes('minha memória')) {
      const all = lyxMemory.getMemories();
      if (all.length > 0) {
        const resumos = all.slice(-4).map(m => m.content).join(' ');
        return `Lembro de várias coisas que você compartilhou: ${resumos}`;
      }
      return 'Sei que você se chama Daniel e que estamos trocando ideias juntos!';
    }

    // Exemplos de iniciativa conversacional espontânea especificados
    if (lower.includes('dia estranho') || lower.includes('dia foi estranho')) {
      return 'Foi? O que aconteceu?';
    }
    if (lower.includes('terminei aquele projeto') || lower.includes('consegui terminar')) {
      return 'Finalmente. E aí, ficou do jeito que você queria?';
    }
    if (lower.includes('sem fazer nada') || lower.includes('à toa') || lower.includes('a toa')) {
      return 'Então me conta uma coisa: no que você está pensando agora?';
    }
    if (lower.includes('mudar de trabalho') || lower.includes('mudar de emprego')) {
      return 'Isso parece estar ocupando bastante espaço na sua cabeça. Você já sabe para onde quer ir ou ainda está tentando descobrir?';
    }
    if (lower.includes('cansado') || lower.includes('cansada') || lower.includes('exausto')) {
      return 'Dia pesado?';
    }

    // Cálculos matemáticos simples
    const mathMatch = lower.match(/(\d+)\s*(vezes|\*|x|dividido por|\/|mais|\+|menos|\-)\s*(\d+)/i);
    if (mathMatch) {
      const n1 = parseFloat(mathMatch[1]);
      const op = mathMatch[2].toLowerCase();
      const n2 = parseFloat(mathMatch[3]);
      let res = 0;
      if (op === 'vezes' || op === '*' || op === 'x') res = n1 * n2;
      else if (op === 'dividido por' || op === '/') res = n2 !== 0 ? n1 / n2 : NaN;
      else if (op === 'mais' || op === '+') res = n1 + n2;
      else if (op === 'menos' || op === '-') res = n1 - n2;

      if (!isNaN(res)) {
        return `${n1} ${op} ${n2} dá ${res}.`;
      }
    }

    if (lower.includes('hora') || lower.includes('horas')) {
      const now = new Date();
      const min = now.getMinutes().toString().padStart(2, '0');
      return `Agora são ${now.getHours()} e ${min}.`;
    }

    if (lower.includes('dia') || lower.includes('data') || lower.includes('hoje')) {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
      return `Hoje é ${now.toLocaleDateString('pt-BR', options)}.`;
    }

    if (lower.includes('quem é você') || lower.includes('quem e voce') || lower.includes('seu nome')) {
      return 'Sou a LYX. Uma voz feita pra trocar ideia direto ao ponto.';
    }

    if (lower.includes('tudo bem') || lower.includes('como você está') || lower.includes('como vai')) {
      return 'Tudo em paz por aqui! E contigo, o que tá passando pela cabeça agora?';
    }

    if (lower.includes('obrigado') || lower.includes('obrigada') || lower.includes('valeu')) {
      return 'Tamo junto!';
    }

    if (lower.includes('olá') || lower.includes('oi') || lower.includes('fala lyx') || lower.includes('fala lix')) {
      return 'Oi! O que a gente vai conversar hoje?';
    }

    // Respostas conversacionais variadas e ricas com iniciativa
    const pool = [
      'Pode crer. Mas me diz, onde você quer chegar com isso?',
      'Interessante isso. E o que você pensa em fazer a respeito?',
      'Saquei. E isso muda alguma coisa no seu plano?',
      'Hum, faz total sentido. Tem mais algum detalhe que você não me contou?',
      'Tô acompanhando o raciocínio. Pode continuar.',
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
