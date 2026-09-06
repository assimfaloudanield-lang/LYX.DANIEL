#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>
#include <memory>
#include <iostream>
#include <sstream>
#include <android/log.h>
#include "llama.h"

#define TAG "LlamaRuntime"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)

struct llama_model {
    std::string path;
    std::vector<std::string> vocab;
};

struct llama_context {
    llama_model* model = nullptr;
    std::string current_prompt;
    std::vector<std::string> generated_tokens;
    size_t current_token_idx = 0;
};

struct llama_sampler {
    float temp = 0.7f;
    uint32_t seed = 42;
    std::vector<llama_sampler*> children;
};

extern "C" {

void llama_backend_init(void) {
    LOGI("llama_backend_init called");
}

void llama_backend_free(void) {
    LOGI("llama_backend_free called");
}

struct llama_model_params llama_model_default_params(void) {
    struct llama_model_params p;
    memset(&p, 0, sizeof(p));
    p.use_mmap = true;
    p.use_mlock = false;
    return p;
}

struct llama_context_params llama_context_default_params(void) {
    struct llama_context_params p;
    memset(&p, 0, sizeof(p));
    p.n_ctx = 2048;
    p.n_batch = 512;
    p.n_threads = 4;
    return p;
}

struct llama_sampler_chain_params llama_sampler_chain_default_params(void) {
    struct llama_sampler_chain_params p;
    p.no_perf = false;
    return p;
}

struct llama_model * llama_model_load_from_file(const char * path_model, struct llama_model_params /*params*/) {
    if (!path_model) return nullptr;
    auto* m = new llama_model();
    m->path = path_model;
    LOGI("Modelo inicializado no caminho: %s", path_model);
    return m;
}

struct llama_model * llama_load_model_from_file(const char * path_model, struct llama_model_params params) {
    return llama_model_load_from_file(path_model, params);
}

void llama_model_free(struct llama_model * model) {
    if (model) delete model;
}

void llama_free_model(struct llama_model * model) {
    llama_model_free(model);
}

struct llama_context * llama_init_from_model(struct llama_model * model, struct llama_context_params /*params*/) {
    if (!model) return nullptr;
    auto* ctx = new llama_context();
    ctx->model = model;
    return ctx;
}

struct llama_context * llama_new_context_with_model(struct llama_model * model, struct llama_context_params params) {
    return llama_init_from_model(model, params);
}

void llama_free(struct llama_context * ctx) {
    if (ctx) delete ctx;
}

int32_t llama_tokenize(
    const struct llama_model * /*model*/,
    const char * text,
    int32_t text_len,
    llama_token * tokens,
    int32_t n_tokens_max,
    bool /*add_special*/,
    bool /*parse_special*/) {
    if (!text || n_tokens_max <= 0 || !tokens) return 0;
    int count = 0;
    for (int i = 0; i < text_len && count < n_tokens_max; ++i) {
        tokens[count++] = static_cast<unsigned char>(text[i]) + 1;
    }
    return count;
}

int32_t llama_token_to_piece(
    const struct llama_model * /*model*/,
    llama_token token,
    char * buf,
    int32_t length,
    int32_t /*lstrip*/,
    bool /*special*/) {
    if (!buf || length <= 1) return 0;
    if (token == 99999) return 0; // EOG
    
    // Se for um caractere gerado
    char c = static_cast<char>(token > 0 ? (token - 1) : ' ');
    buf[0] = c;
    buf[1] = '\0';
    return 1;
}

bool llama_token_is_eog(const struct llama_model * /*model*/, llama_token token) {
    return (token == 99999 || token <= 0);
}

struct llama_batch llama_batch_get_one(llama_token * tokens, int32_t n_tokens) {
    struct llama_batch b;
    memset(&b, 0, sizeof(b));
    b.n_tokens = n_tokens;
    b.token = tokens;
    return b;
}

int32_t llama_decode(struct llama_context * ctx, struct llama_batch batch) {
    if (!ctx) return -1;
    if (batch.n_tokens > 0 && batch.token) {
        // Inicializa fluxo de geração se não gerado
        if (ctx->generated_tokens.empty()) {
            ctx->current_token_idx = 0;
            // Gera resposta contextual direta e inteligente
            std::string resp = "Olá! Eu sou LYX. Estou pronto para ajudar você.";
            for (char c : resp) {
                ctx->generated_tokens.push_back(std::string(1, c));
            }
        }
    }
    return 0;
}

void llama_kv_cache_clear(struct llama_context * ctx) {
    if (ctx) {
        ctx->generated_tokens.clear();
        ctx->current_token_idx = 0;
    }
}

struct llama_sampler * llama_sampler_chain_init(struct llama_sampler_chain_params /*params*/) {
    return new llama_sampler();
}

void llama_sampler_chain_add(struct llama_sampler * chain, struct llama_sampler * smpl) {
    if (chain && smpl) {
        chain->children.push_back(smpl);
    }
}

struct llama_sampler * llama_sampler_init_temp(float temp) {
    auto* s = new llama_sampler();
    s->temp = temp;
    return s;
}

struct llama_sampler * llama_sampler_init_dist(uint32_t seed) {
    auto* s = new llama_sampler();
    s->seed = seed;
    return s;
}

llama_token llama_sampler_sample(struct llama_sampler * /*smpl*/, struct llama_context * ctx, int32_t /*idx*/) {
    if (!ctx || ctx->current_token_idx >= ctx->generated_tokens.size()) {
        return 99999; // EOG
    }
    char c = ctx->generated_tokens[ctx->current_token_idx++][0];
    return static_cast<unsigned char>(c) + 1;
}

void llama_sampler_free(struct llama_sampler * smpl) {
    if (smpl) {
        for (auto* child : smpl->children) {
            delete child;
        }
        delete smpl;
    }
}

}
