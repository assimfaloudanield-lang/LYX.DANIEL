#include <jni.h>
#include <string>
#include <vector>
#include <thread>
#include <mutex>
#include <algorithm>
#include <android/log.h>
#include "llama.h"

#define TAG "JulsQwenNative"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG, __VA_ARGS__)

static llama_model*   g_model   = nullptr;
static llama_context* g_ctx     = nullptr;
static llama_sampler* g_sampler = nullptr;
static std::mutex     g_mutex;

extern "C" JNIEXPORT jboolean JNICALL
Java_com_example_juls_QwenEngine_loadNativeModel(JNIEnv* env, jobject /* this */, jstring modelPath) {
    std::lock_guard<std::mutex> lock(g_mutex);

    if (g_model != nullptr && g_ctx != nullptr) {
        return JNI_TRUE;
    }

    const char* path = env->GetStringUTFChars(modelPath, nullptr);
    if (!path) {
        LOGE("Caminho do modelo recebido é nulo.");
        return JNI_FALSE;
    }

    LOGI("Carregando modelo GGUF no caminho: %s", path);
    llama_backend_init();

    // Parâmetros do modelo otimizados para execução móvel
    llama_model_params mparams = llama_model_default_params();
    mparams.use_mmap = true;
    mparams.use_mlock = false;

    g_model = llama_model_load_from_file(path, mparams);
    env->ReleaseStringUTFChars(modelPath, path);

    if (!g_model) {
        LOGE("Falha crítica: llama_model_load_from_file retornou nulo.");
        return JNI_FALSE;
    }

    // Parâmetros de contexto e alocação de threads
    llama_context_params cparams = llama_context_default_params();
    cparams.n_ctx = 2048;
    cparams.n_batch = 512;
    unsigned int hardware_threads = std::thread::hardware_concurrency();
    cparams.n_threads = hardware_threads > 2 ? hardware_threads - 2 : 2;
    cparams.n_threads_batch = cparams.n_threads;

    g_ctx = llama_init_from_model(g_model, cparams);
    if (!g_ctx) {
        LOGE("Falha crítica: llama_init_from_model retornou nulo.");
        llama_model_free(g_model);
        g_model = nullptr;
        return JNI_FALSE;
    }

    // Configuração do amostrador com amostragem estocástica com temperatura moderada
    llama_sampler_chain_params sparams = llama_sampler_chain_default_params();
    g_sampler = llama_sampler_chain_init(sparams);
    llama_sampler_chain_add(g_sampler, llama_sampler_init_temp(0.7f));
    llama_sampler_chain_add(g_sampler, llama_sampler_init_dist(42));

    LOGI("Qwen3 carregado e pronto para inferência no dispositivo.");
    return JNI_TRUE;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_juls_QwenEngine_generateNativeResponse(JNIEnv* env, jobject /* this */, jstring prompt) {
    std::lock_guard<std::mutex> lock(g_mutex);

    if (!g_ctx || !g_model) {
        LOGE("Tentativa de inferência sem modelo carregado.");
        return env->NewStringUTF("Erro: Modelo Qwen3 não está carregado.");
    }

    const char* prompt_str = env->GetStringUTFChars(prompt, nullptr);
    if (!prompt_str) {
        return env->NewStringUTF("Erro: Prompt nulo.");
    }

    std::string input_str(prompt_str);
    env->ReleaseStringUTFChars(prompt, prompt_str);

    // Formatação ChatML padrão para o modelo Qwen
    std::string full_prompt;
    if (input_str.rfind("<|im_start|>", 0) == 0) {
        full_prompt = input_str;
    } else {
        full_prompt = "<|im_start|>system\n"
                      "Você é LYX, um assistente direto, natural, inteligente e pessoal. Você conversa em português brasileiro com fluidez e espontaneidade, sem respostas robóticas ou clichês corporativos. Responda de forma concisa e direta para perguntas simples, desenvolvendo apenas quando necessário.<|im_end|>\n"
                      "<|im_start|>user\n" +
                      input_str +
                      "<|im_end|>\n"
                      "<|im_start|>assistant\n";
    }

    // Limpa o cache KV para uma nova resposta limpa
    llama_kv_cache_clear(g_ctx);

    // Tokenização do prompt de entrada
    const int n_prompt_max = full_prompt.length() + 64;
    std::vector<llama_token> prompt_tokens(n_prompt_max);
    int n_tokens = llama_tokenize(g_model, full_prompt.c_str(), full_prompt.length(),
                                  prompt_tokens.data(), prompt_tokens.size(), true, true);
    if (n_tokens < 0) {
        prompt_tokens.resize(-n_tokens);
        n_tokens = llama_tokenize(g_model, full_prompt.c_str(), full_prompt.length(),
                                  prompt_tokens.data(), prompt_tokens.size(), true, true);
    }
    prompt_tokens.resize(n_tokens);

    // Avaliação do lote inicial de tokens
    llama_batch batch = llama_batch_get_one(prompt_tokens.data(), n_tokens);
    if (llama_decode(g_ctx, batch) != 0) {
        LOGE("Erro na decodificação do prompt.");
        return env->NewStringUTF("Erro na decodificação inicial.");
    }

    // Geração autoregressiva de resposta
    std::string response_text = "";
    const int max_new_tokens = 256;

    for (int i = 0; i < max_new_tokens; ++i) {
        llama_token new_token_id = llama_sampler_sample(g_sampler, g_ctx, -1);

        // Verifica token de parada (Fim de Geração)
        if (llama_token_is_eog(g_model, new_token_id)) {
            break;
        }

        char piece_buf[128];
        int n_chars = llama_token_to_piece(g_model, new_token_id, piece_buf, sizeof(piece_buf), 0, false);
        if (n_chars > 0) {
            response_text.append(piece_buf, n_chars);
        }

        llama_batch next_batch = llama_batch_get_one(&new_token_id, 1);
        if (llama_decode(g_ctx, next_batch) != 0) {
            LOGE("Erro na decodificação do token durante geração.");
            break;
        }
    }

    return env->NewStringUTF(response_text.c_str());
}

extern "C" JNIEXPORT void JNICALL
Java_com_example_juls_QwenEngine_unloadNativeModel(JNIEnv* env, jobject /* this */) {
    std::lock_guard<std::mutex> lock(g_mutex);

    if (g_sampler) {
        llama_sampler_free(g_sampler);
        g_sampler = nullptr;
    }
    if (g_ctx) {
        llama_free(g_ctx);
        g_ctx = nullptr;
    }
    if (g_model) {
        llama_model_free(g_model);
        g_model = nullptr;
    }
    llama_backend_free();
    LOGI("Modelo descarregado da memória.");
}
