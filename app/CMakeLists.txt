cmake_minimum_required(VERSION 3.4.1)

set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY BOTH)
set(EXECUTABLE_OUTPUT_PATH "${CMAKE_SOURCE_DIR}/src/main/assets/core/")

add_executable(pokemod-injector src/main/jni/${ANDROID_ABI}/pokemod-injector.c)
find_library(frida-core NAMES libfrida-core.a libfrida-core PATHS src/main/jni/${ANDROID_ABI}/)
add_custom_target(pokemod-server)
add_custom_command(TARGET pokemod-server POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
            ${CMAKE_SOURCE_DIR}/src/main/jni/${ANDROID_ABI}/pokemod-server
                ${CMAKE_SOURCE_DIR}/src/main/assets/core/pokemod-server)
add_custom_target(delScripts)
add_custom_command(TARGET delScripts POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E remove_directory
            ${CMAKE_SOURCE_DIR}/src/main/assets/scripts)
add_custom_target(cpScripts)
add_custom_command(TARGET cpScripts POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
            ${CMAKE_SOURCE_DIR}/src/main/jni/${ANDROID_ABI}/scripts/
                ${CMAKE_SOURCE_DIR}/src/main/assets/scripts)
include_directories(src/main/jni/${ANDROID_ABI}/include/)
target_link_libraries(pokemod-injector ${frida-core} android log)

add_dependencies(cpScripts delScripts)
add_dependencies(pokemod-server cpScripts)
add_dependencies(pokemod-injector pokemod-server)