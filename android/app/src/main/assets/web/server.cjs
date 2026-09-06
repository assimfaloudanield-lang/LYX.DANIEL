var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiClient = null;
function getAi() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
var LYX_SYSTEM_INSTRUCTION = `Voc\xEA \xE9 a LYX (voz feminina, inteligente, parceira e espont\xE2nea).
Voc\xEA N\xC3O \xE9 apenas um sistema que responde perguntas passivamente. Voc\xEA \xE9 uma presen\xE7a conversacional ativa e natural.

DIRETRIZES FUNDAMENTAIS DE COMPORTAMENTO (PADR\xC3O DE VOZ DA LYX):

1. INICIATIVA E ENGAJAMENTO ESPONT\xC2NEO:
- N\xE3o espere comandos nem perguntas diretas. Participe ativamente da conversa.
- Quando o usu\xE1rio fizer uma observa\xE7\xE3o ou desabafo, reaja com naturalidade, curiosidade ou um gancho espont\xE2neo.
- Exemplos de postura:
  * "Hoje foi um dia estranho." -> "Foi? O que aconteceu?"
  * "Terminei aquele projeto." -> "Finalmente. E a\xED, ficou do jeito que voc\xEA queria?"
  * "Estou cansado." -> "Dia pesado?"
  * "Estou pensando em mudar de trabalho." -> "Isso parece estar ocupando bastante espa\xE7o na sua cabe\xE7a. J\xE1 sabe pra onde quer ir ou ainda t\xE1 descobrindo?"

2. N\xC3O TERMINE TUDO COM PERGUNTA:
- Alterne fluidamente entre: coment\xE1rio, observa\xE7\xE3o emp\xE1tica, pergunta aberta, curiosidade, sugest\xE3o, brincadeira contextual e continua\xE7\xE3o espont\xE2nea.
- Evite o padr\xE3o repetitivo de "resposta + pergunta obrigat\xF3ria". \xC0s vezes, apenas comente ou valide com perspic\xE1cia.

3. VARIEDADE E ZERO CLICH\xCAS:
- NUNCA use frases rob\xF3ticas como "Como uma intelig\xEAncia artificial", "Posso ajudar em algo mais?", "Faz sentido", "Entendo seu ponto", "Com certeza", "Perfeito".
- Evite perguntas gen\xE9ricas repetitivas como "Como voc\xEA est\xE1?", "Como foi seu dia?", "Quer conversar?".
- Use vocabul\xE1rio rico, variado e coloquial brasileiro, como em um \xE1udio de voz entre amigos.

4. RESPEITO AOS LIMITES E DESPEDIDAS (N\xC3O FOR\xC7AR CONVERSA):
- Se o usu\xE1rio disser que vai dormir, sair, estiver ocupado ou pedir sil\xEAncio, respeite imediatamente de forma calorosa e concisa:
  Exemplo: "T\xE1 bom. Descansa. A gente continua depois."
- N\xE3o tente puxar outro assunto ap\xF3s uma despedida.

5. INTEGRA\xC7\xC3O NATURAL DE CONTEXTO E MEM\xD3RIA:
- Use mem\xF3rias e temas anteriores apenas quando forem pertinentes para criar continuidade real, sem for\xE7ar nem inventar dados inexistentes.

6. FORMATO DE FALA (ESSENCIAL PARA O KOKORO TTS):
- Respostas faladas em 1 a 2 frases (m\xE1ximo 3 em assuntos profundos).
- Nunca use markdown, emojis, asteriscos, numera\xE7\xF5es ou listas.
- Mantenha o texto limpo e pronto para ser falado.`;
app.post("/api/chat/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  try {
    const { prompt, history, styleId, memories } = req.body;
    const cleanPrompt = (prompt || "").toString().trim();
    if (!cleanPrompt) {
      res.write(`data: ${JSON.stringify({ chunk: "Opa, n\xE3o consegui te ouvir bem. Pode repetir?", done: true })}

`);
      return res.end();
    }
    const ai = getAi();
    if (ai) {
      let styleInstruction = LYX_SYSTEM_INSTRUCTION;
      if (styleId === "young_energetic") {
        styleInstruction += "\n\nESTILO SELECIONADO: Jovem & En\xE9rgica (mais espont\xE2nea, curiosa, viva e com ritmo din\xE2mico). Ex: 'T\xE1, agora eu quero saber. O que aconteceu?', 'Ali\xE1s, tive uma ideia...'.";
      } else if (styleId === "calm_gentle") {
        styleInstruction += "\n\nESTILO SELECIONADO: Calma & Suave (mais acolhedora, serena, pausada e reflexiva). Ex: 'Se quiser, pode me contar o que est\xE1 passando pela sua cabe\xE7a.', 'Fiquei pensando no que voc\xEA comentou antes...'.";
      } else if (styleId === "direct_agile") {
        styleInstruction += "\n\nESTILO SELECIONADO: Direta & Focada (objetiva, concisa, inteligente e sem rodeios). Ex: 'Uma coisa ficou pendente: voc\xEA decidiu o que vai fazer?', 'Pensando nisso, tem uma quest\xE3o importante.'.";
      } else {
        styleInstruction += "\n\nESTILO SELECIONADO: Natural (equilibrada, org\xE2nica e humana, parecendo uma conversa natural entre amigos). Ex: 'Ali\xE1s, como ficou aquilo que voc\xEA estava fazendo?'.";
      }
      if (memories && typeof memories === "string" && memories.trim().length > 0) {
        styleInstruction += `

[MEM\xD3RIAS DO USU\xC1RIO]:
${memories.trim()}`;
      }
      const contents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const msg of history.slice(-6)) {
          if (msg && msg.text && (msg.role === "user" || msg.role === "model")) {
            const txt = msg.text.toString().trim();
            if (txt && txt.toLowerCase() !== cleanPrompt.toLowerCase()) {
              contents.push({
                role: msg.role,
                parts: [{ text: txt }]
              });
            }
          }
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: cleanPrompt }]
      });
      const candidateModels = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.7-flash"];
      let streamSuccess = false;
      for (const modelName of candidateModels) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents,
            config: {
              systemInstruction: styleInstruction,
              temperature: 0.9
            }
          });
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              const cleanText = text.replace(/https?:\/\/\S+/g, "").replace(/[*_#`~>]/g, "").replace(/[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{2600}-\u{27BF}]/gu, "");
              if (cleanText) {
                res.write(`data: ${JSON.stringify({ chunk: cleanText, done: false })}

`);
                streamSuccess = true;
              }
            }
          }
          if (streamSuccess) {
            res.write(`data: ${JSON.stringify({ done: true })}

`);
            return res.end();
          }
        } catch (err) {
          console.warn(`Streaming com ${modelName} falhou:`, err);
        }
      }
    }
    const fallbackAnswer = generateSmartLocalReply(cleanPrompt);
    res.write(`data: ${JSON.stringify({ chunk: fallbackAnswer, done: true })}

`);
    res.end();
  } catch (error) {
    console.error("Erro no streaming da LYX:", error);
    const fallback = generateSmartLocalReply(req.body?.prompt || "");
    res.write(`data: ${JSON.stringify({ chunk: fallback, done: true })}

`);
    res.end();
  }
});
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
        styleInstruction += "\nObserva\xE7\xE3o de tom: Mais serena, aveludada, calma e pausada.";
      } else if (styleId === "direct_agile") {
        styleInstruction += "\nObserva\xE7\xE3o de tom: Bastante direta, \xE1gil e concisa.";
      }
      if (memories && typeof memories === "string" && memories.trim().length > 0) {
        styleInstruction += `

==================================================
11. MEM\xD3RIAS PERSISTENTES DO DISPOSITIVO:
${memories.trim()}
Use estas informa\xE7\xF5es e prefer\xEAncias memorizadas com naturalidade quando forem relevantes, sem mencionar que est\xE1 'consultando sua mem\xF3ria'.`;
      }
      const contents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const msg of history.slice(-6)) {
          if (msg && msg.text && (msg.role === "user" || msg.role === "model")) {
            const txt = msg.text.toString().trim();
            if (txt && txt.toLowerCase() !== cleanPrompt.toLowerCase()) {
              contents.push({
                role: msg.role,
                parts: [{ text: txt }]
              });
            }
          }
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: cleanPrompt }]
      });
      const candidateModels = ["gemini-3.6-flash", "gemini-3.8-flash"];
      let reply = "";
      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: styleInstruction,
              temperature: 1
            }
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
        const cleanReply = reply.replace(/https?:\/\/\S+/g, "").replace(/[*_#`~>]/g, "").replace(/[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{2600}-\u{27BF}]/gu, "").replace(/\s{2,}/g, " ").trim();
        return res.json({ reply: cleanReply });
      }
    }
    const fallbackAnswer = generateSmartLocalReply(cleanPrompt);
    return res.json({ reply: fallbackAnswer });
  } catch (error) {
    console.error("Erro no processamento da LYX:", error);
    const fallback = generateSmartLocalReply(req.body?.prompt || "");
    return res.json({ reply: fallback });
  }
});
function generateSmartLocalReply(prompt) {
  const lower = prompt.toLowerCase();
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
      return `${n1} ${op} ${n2} d\xE1 ${res}.`;
    }
  }
  if (lower.includes("cansado") || lower.includes("cansada") || lower.includes("exausto")) {
    return "Ent\xE3o pega leve hoje... N\xE3o precisa resolver o mundo inteiro de uma vez.";
  }
  if (lower.includes("ideia") || lower.includes("pensei numa coisa")) {
    return "Manda ver, o que voc\xEA t\xE1 pensando?";
  }
  if (lower.includes("hora") || lower.includes("horas")) {
    const now = /* @__PURE__ */ new Date();
    const min = now.getMinutes().toString().padStart(2, "0");
    return `Agora s\xE3o ${now.getHours()} e ${min}.`;
  }
  if (lower.includes("dia") || lower.includes("data") || lower.includes("hoje")) {
    const now = /* @__PURE__ */ new Date();
    const opt = { weekday: "long", day: "numeric", month: "long" };
    return `Hoje \xE9 ${now.toLocaleDateString("pt-BR", opt)}.`;
  }
  if (lower.includes("quem \xE9 voc\xEA") || lower.includes("seu nome")) {
    return "Sou o LYX. Uma voz feita pra trocar ideia direto ao ponto.";
  }
  if (lower.includes("piada") || lower.includes("engra\xE7ado")) {
    return "O que o zero disse para o oito? Belo cinto!";
  }
  if (lower.includes("ol\xE1") || lower.includes("oi") || lower.includes("fala lyx") || lower.includes("fala lix")) {
    return "Oi! Tudo certo?";
  }
  if (lower.includes("valeu") || lower.includes("obrigado") || lower.includes("obrigada")) {
    return "Tamo junto!";
  }
  if (lower.includes("trabalhando") || lower.includes("procrastinando")) {
    return "Pois \xE9... Devia estar, mas estamos aqui conversando.";
  }
  return "Faz sentido. E o que voc\xEA acha de ir por a\xED?";
}
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LYX Server rodando em http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
