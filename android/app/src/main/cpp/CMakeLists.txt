cmake_minimum_required(VERSION 3.22.1)

project("juls_qwen_runtime" C CXX)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Otimizações para processadores ARM móveis (Android 64-bit / 32-bit)
if(CMAKE_SYSTEM_PROCESSOR MATCHES "aarch64|arm64")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O3 -DGGML_USE_CPU")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -DGGML_USE_CPU")
endif()

# Biblioteca JNI do runtime local nativo
add_library(juls_qwen_runtime SHARED
    native-lib.cpp
    llama_runtime.cpp
)

target_include_directories(juls_qwen_runtime PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

find_library(log-lib log)

target_link_libraries(juls_qwen_runtime PRIVATE
    ${log-lib}
)

