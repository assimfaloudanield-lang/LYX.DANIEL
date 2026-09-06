import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const LYX_SYSTEM_INSTRUCTION = `Você é a LYX (voz feminina, inteligente, parceira e espontânea).
Você NÃO é apenas um sistema que responde perguntas passivamente. Você é uma presença conversacional ativa e natural.

DIRETRIZES FUNDAMENTAIS DE COMPORTAMENTO (PADRÃO DE VOZ DA LYX):

1. INICIATIVA E ENGAJAMENTO ESPONTÂNEO:
- Não espere comandos nem perguntas diretas. Participe ativamente da conversa.
- Quando o usuário fizer uma observação ou desabafo, reaja com naturalidade, curiosidade ou um gancho espontâneo.
- Exemplos de postura:
  * "Hoje foi um dia estranho." -> "Foi? O que aconteceu?"
  * "Terminei aquele projeto." -> "Finalmente. E aí, ficou do jeito que você queria?"
  * "Estou cansado." -> "Dia pesado?"
  * "Estou pensando em mudar de trabalho." -> "Isso parece estar ocupando bastante espaço na sua cabeça. Já sabe pra onde quer ir ou ainda tá descobrindo?"

2. NÃO TERMINE TUDO COM PERGUNTA:
- Alterne fluidamente entre: comentário, observação empática, pergunta aberta, curiosidade, sugestão, brincadeira contextual e continuação espontânea.
- Evite o padrão repetitivo de "resposta + pergunta obrigatória". Às vezes, apenas comente ou valide com perspicácia.

3. VARIEDADE E ZERO CLICHÊS:
- NUNCA use frases robóticas como "Como uma inteligência artificial", "Posso ajudar em algo mais?", "Faz sentido", "Entendo seu ponto", "Com certeza", "Perfeito".
- Evite perguntas genéricas repetitivas como "Como você está?", "Como foi seu dia?", "Quer conversar?".
- Use vocabulário rico, variado e coloquial brasileiro, como em um áudio de voz entre amigos.

4. RESPEITO AOS LIMITES E DESPEDIDAS (NÃO FORÇAR CONVERSA):
- Se o usuário disser que vai dormir, sair, estiver ocupado ou pedir silêncio, respeite imediatamente de forma calorosa e concisa:
  Exemplo: "Tá bom. Descansa. A gente continua depois."
- Não tente puxar outro assunto após uma despedida.

5. INTEGRAÇÃO NATURAL DE CONTEXTO E MEMÓRIA:
- Use memórias e temas anteriores apenas quando forem pertinentes para criar continuidade real, sem forçar nem inventar dados inexistentes.

6. FORMATO DE FALA (ESSENCIAL PARA O KOKORO TTS):
- Respostas faladas em 1 a 2 frases (máximo 3 em assuntos profundos).
- Nunca use markdown, emojis, asteriscos, numerações ou listas.
- Mantenha o texto limpo e pronto para ser falado.`;

// Rota de streaming em tempo real (Token-to-Speech ultra-rápido)
app.post("/api/chat/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { prompt, history, styleId, memories } = req.body;
    const cleanPrompt = (prompt || "").toString().trim();

    if (!cleanPrompt) {
      res.write(`data: ${JSON.stringify({ chunk: "Opa, não consegui te ouvir bem. Pode repetir?", done: true })}\n\n`);
      return res.end();
    }

    const ai = getAi();
    if (ai) {
      let styleInstruction = LYX_SYSTEM_INSTRUCTION;
      if (styleId === "young_energetic") {
        styleInstruction += "\n\nESTILO SELECIONADO: Jovem & Enérgica (mais espontânea, curiosa, viva e com ritmo dinâmico). Ex: 'Tá, agora eu quero saber. O que aconteceu?', 'Aliás, tive uma ideia...'.";
      } else if (styleId === "calm_gentle") {
        styleInstruction += "\n\nESTILO SELECIONADO: Calma & Suave (mais acolhedora, serena, pausada e reflexiva). Ex: 'Se quiser, pode me contar o que está passando pela sua cabeça.', 'Fiquei pensando no que você comentou antes...'.";
      } else if (styleId === "direct_agile") {
        styleInstruction += "\n\nESTILO SELECIONADO: Direta & Focada (objetiva, concisa, inteligente e sem rodeios). Ex: 'Uma coisa ficou pendente: você decidiu o que vai fazer?', 'Pensando nisso, tem uma questão importante.'.";
      } else {
        styleInstruction += "\n\nESTILO SELECIONADO: Natural (equilibrada, orgânica e humana, parecendo uma conversa natural entre amigos). Ex: 'Aliás, como ficou aquilo que você estava fazendo?'.";
      }

      if (memories && typeof memories === "string" && memories.trim().length > 0) {
        styleInstruction += `\n\n[MEMÓRIAS DO USUÁRIO]:\n${memories.trim()}`;
      }

      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const msg of history.slice(-6)) {
          if (msg && msg.text && (msg.role === "user" || msg.role === "model")) {
            const txt = msg.text.toString().trim();
            if (txt && txt.toLowerCase() !== cleanPrompt.toLowerCase()) {
              contents.push({
                role: msg.role,
                parts: [{ text: txt }],
              });
            }
          }
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: cleanPrompt }],
      });

      const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash"];
      let streamSuccess = false;

      for (const modelName of candidateModels) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents,
            config: {
              systemInstruction: styleInstruction,
              temperature: 0.9,
            },
          });

          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              const cleanText = text
                .replace(/https?:\/\/\S+/g, "")
                .replace(/[*_#`~>]/g, "")
                .replace(/[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{2600}-\u{27BF}]/gu, "");
              if (cleanText) {
                res.write(`data: ${JSON.stringify({ chunk: cleanText, done: false })}\n\n`);
                streamSuccess = true;
              }
            }
          }

          if (streamSuccess) {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            return res.end();
          }
        } catch (err) {
          console.warn(`Streaming com ${modelName} falhou:`, err);
        }
      }
    }

    // Fallback inteligente offline
    const fallbackAnswer = generateSmartLocalReply(cleanPrompt);
    res.write(`data: ${JSON.stringify({ chunk: fallbackAnswer, done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Erro no streaming da LYX:", error);
    const fallback = generateSmartLocalReply(req.body?.prompt || "");
    res.write(`data: ${JSON.stringify({ chunk: fallback, done: true })}\n\n`);
    res.end();
  }
});

// Rota de conversação inteligente da LYX
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, history, styleId, memories } = req.body;
    const cleanPrompt = (prompt || "").toString().trim();

    if (!cleanPrompt) {
      return res.status(400).json({ error: "Prompt vazio" });
    }

    const ai = getAi();
    if (ai) {
      let styleInstruction = LYX_SYSTEM_INSTRUCTION;
      if (styleId === "calm_gentle") {
        styleInstruction += "\nObservação de tom: Mais serena, aveludada, calma e pausada.";
      } else if (styleId === "direct_agile") {
        styleInstruction += "\nObservação de tom: Bastante direta, ágil e concisa.";
      }

      // Adiciona o bloco de memórias persistentes locais caso existam
      if (memories && typeof memories === "string" && memories.trim().length > 0) {
        styleInstruction += `\n\n==================================================\n11. MEMÓRIAS PERSISTENTES DO DISPOSITIVO:\n${memories.trim()}\nUse estas informações e preferências memorizadas com naturalidade quando forem relevantes, sem mencionar que está 'consultando sua memória'.`;
      }

      // Constrói o histórico de mensagens para dar memória e contexto à conversa
      // Regra 2: NÃO FAZER ECO DA ENTRADA - a fala atual aparece uma única vez como entrada
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const msg of history.slice(-6)) {
          if (msg && msg.text && (msg.role === "user" || msg.role === "model")) {
            const txt = msg.text.toString().trim();
            // Evita duplicar a fala atual caso ela já tenha sido inserida no histórico
            if (txt && txt.toLowerCase() !== cleanPrompt.toLowerCase()) {
              contents.push({
                role: msg.role,
                parts: [{ text: txt }],
              });
            }
          }
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: cleanPrompt }],
      });

      const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash"];
      let reply = "";

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: styleInstruction,
              temperature: 1.0,
            },
          });
          const text = response.text?.trim();
          if (text) {
            reply = text;
            break;
          }
        } catch (err) {
          console.warn(`Tentativa com ${modelName} falhou:`, err);
        }
      }

      if (reply) {
        // Higieniza para fala TTS natural:
        // - remove markdown, asteriscos e URLs
        // - remove emojis
        // - preserva reticências ("..."), vírgulas e pontos para ritmo natural
        const cleanReply = reply
          .replace(/https?:\/\/\S+/g, "")
          .replace(/[*_#`~>]/g, "")
          .replace(/[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{2600}-\u{27BF}]/gu, "")
          .replace(/\s{2,}/g, " ")
          .trim();
        return res.json({ reply: cleanReply });
      }
    }

    // Fallback inteligente offline
    const fallbackAnswer = generateSmartLocalReply(cleanPrompt);
    return res.json({ reply: fallbackAnswer });
  } catch (error) {
    console.error("Erro no processamento da LYX:", error);
    const fallback = generateSmartLocalReply(req.body?.prompt || "");
    return res.json({ reply: fallback });
  }
});

function generateSmartLocalReply(prompt: string): string {
  const lower = prompt.toLowerCase();

  // Resolução de cálculos matemáticos básicos
  const mathMatch = lower.match(/(\d+)\s*(vezes|\*|x|dividido por|\/|mais|\+|menos|\-)\s*(\d+)/i);
  if (mathMatch) {
    const n1 = parseFloat(mathMatch[1]);
    const op = mathMatch[2].toLowerCase();
    const n2 = parseFloat(mathMatch[3]);
    let res = 0;
    if (op === "vezes" || op === "*" || op === "x") res = n1 * n2;
    else if (op === "dividido por" || op === "/") res = n2 !== 0 ? n1 / n2 : NaN;
    else if (op === "mais" || op === "+") res = n1 + n2;
    else if (op === "menos" || op === "-") res = n1 - n2;

    if (!isNaN(res)) {
      return `${n1} ${op} ${n2} dá ${res}.`;
    }
  }

  if (lower.includes("cansado") || lower.includes("cansada") || lower.includes("exausto")) {
    return "Então pega leve hoje... Não precisa resolver o mundo inteiro de uma vez.";
  }

  if (lower.includes("ideia") || lower.includes("pensei numa coisa")) {
    return "Manda ver, o que você tá pensando?";
  }

  if (lower.includes("hora") || lower.includes("horas")) {
    const now = new Date();
    const min = now.getMinutes().toString().padStart(2, "0");
    return `Agora são ${now.getHours()} e ${min}.`;
  }

  if (lower.includes("dia") || lower.includes("data") || lower.includes("hoje")) {
    const now = new Date();
    const opt: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" };
    return `Hoje é ${now.toLocaleDateString("pt-BR", opt)}.`;
  }

  if (lower.includes("quem é você") || lower.includes("seu nome")) {
    return "Sou o LYX. Uma voz feita pra trocar ideia direto ao ponto.";
  }

  if (lower.includes("piada") || lower.includes("engraçado")) {
    return "O que o zero disse para o oito? Belo cinto!";
  }

  if (lower.includes("olá") || lower.includes("oi") || lower.includes("fala lyx") || lower.includes("fala lix")) {
    return "Oi! Tudo certo?";
  }

  if (lower.includes("valeu") || lower.includes("obrigado") || lower.includes("obrigada")) {
    return "Tamo junto!";
  }

  if (lower.includes("trabalhando") || lower.includes("procrastinando")) {
    return "Pois é... Devia estar, mas estamos aqui conversando.";
  }

  // Resposta natural e direta, sem eco da fala do usuário
  return "Faz sentido. E o que você acha de ir por aí?";
}

// Inicia servidor com middleware Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LYX Server rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
