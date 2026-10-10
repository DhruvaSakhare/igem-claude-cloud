/* auto-generated on 2025-12-17 20:32:36 -0500. version 4.2.4 Do not edit! */
/* including simdjson.h:  */
/* begin file simdjson.h */
#ifndef SIMDJSON_H
#define SIMDJSON_H

/**
 * @mainpage
 *
 * Check the [README.md](https://github.com/simdjson/simdjson/blob/master/README.md#simdjson--parsing-gigabytes-of-json-per-second).
 *
 * Sample code. See https://github.com/simdjson/simdjson/blob/master/doc/basics.md for more examples.

    #include "simdjson.h"

    int main(void) {
      // load from `twitter.json` file:
      simdjson::dom::parser parser;
      simdjson::dom::element tweets = parser.load("twitter.json");
      std::cout << tweets["search_metadata"]["count"] << " results." << std::endl;

      // Parse and iterate through an array of objects
      auto abstract_json = R"( [
        {  "12345" : {"a":12.34, "b":56.78, "c": 9998877}   },
        {  "12545" : {"a":11.44, "b":12.78, "c": 11111111}  }
        ] )"_padded;

      for (simdjson::dom::object obj : parser.parse(abstract_json)) {
        for(const auto key_value : obj) {
          cout << "key: " << key_value.key << " : ";
          simdjson::dom::object innerobj = key_value.value;
          cout << "a: " << double(innerobj["a"]) << ", ";
          cout << "b: " << double(innerobj["b"]) << ", ";
          cout << "c: " << int64_t(innerobj["c"]) << endl;
        }
      }
    }
 */

/* including simdjson/common_defs.h: #include "simdjson/common_defs.h" */
/* begin file simdjson/common_defs.h */
#ifndef SIMDJSON_COMMON_DEFS_H
#define SIMDJSON_COMMON_DEFS_H

#include <cassert>
/* including simdjson/compiler_check.h: #include "simdjson/compiler_check.h" */
/* begin file simdjson/compiler_check.h */
#ifndef SIMDJSON_COMPILER_CHECK_H
#define SIMDJSON_COMPILER_CHECK_H

#ifndef __cplusplus
#error simdjson requires a C++ compiler
#endif

#ifndef SIMDJSON_CPLUSPLUS
#if defined(_MSVC_LANG) && !defined(__clang__)
#define SIMDJSON_CPLUSPLUS (_MSC_VER == 1900 ? 201103L : _MSVC_LANG)
#else
#define SIMDJSON_CPLUSPLUS __cplusplus
#endif
#endif

// C++ 26
#if !defined(SIMDJSON_CPLUSPLUS26) && (SIMDJSON_CPLUSPLUS >= 202402L) // update when the standard is finalized
#define SIMDJSON_CPLUSPLUS26 1
#endif

// C++ 23
#if !defined(SIMDJSON_CPLUSPLUS23) && (SIMDJSON_CPLUSPLUS >= 202302L)
#define SIMDJSON_CPLUSPLUS23 1
#endif

// C++ 20
#if !defined(SIMDJSON_CPLUSPLUS20) && (SIMDJSON_CPLUSPLUS >= 202002L)
#define SIMDJSON_CPLUSPLUS20 1
#endif

// C++ 17
#if !defined(SIMDJSON_CPLUSPLUS17) && (SIMDJSON_CPLUSPLUS >= 201703L)
#define SIMDJSON_CPLUSPLUS17 1
#endif

// C++ 14
#if !defined(SIMDJSON_CPLUSPLUS14) && (SIMDJSON_CPLUSPLUS >= 201402L)
#define SIMDJSON_CPLUSPLUS14 1
#endif

// C++ 11
#if !defined(SIMDJSON_CPLUSPLUS11) && (SIMDJSON_CPLUSPLUS >= 201103L)
#define SIMDJSON_CPLUSPLUS11 1
#endif

#ifndef SIMDJSON_CPLUSPLUS11
#error simdjson requires a compiler compliant with the C++11 standard
#endif

#ifndef SIMDJSON_IF_CONSTEXPR
#if SIMDJSON_CPLUSPLUS17
#define SIMDJSON_IF_CONSTEXPR if constexpr
#else
#define SIMDJSON_IF_CONSTEXPR if
#endif
#endif

#ifndef SIMDJSON_CONSTEXPR_LAMBDA
#if SIMDJSON_CPLUSPLUS17
#define SIMDJSON_CONSTEXPR_LAMBDA constexpr
#else
#define SIMDJSON_CONSTEXPR_LAMBDA
#endif
#endif



#ifdef __has_include
#if __has_include(<version>)
#include <version>
#endif
#endif

// The current specification is unclear on how we detect
// static reflection, both __cpp_lib_reflection and
// __cpp_impl_reflection are proposed in the draft specification.
// For now, we disable static reflect by default. It must be
// specified at compiler time.
#ifndef SIMDJSON_STATIC_REFLECTION
#define SIMDJSON_STATIC_REFLECTION 0 // disabled by default.
#endif

#if defined(__apple_build_version__)
#if __apple_build_version__ < 14000000
#define SIMDJSON_CONCEPT_DISABLED 1 // apple-clang/13 doesn't support std::convertible_to
#endif
#endif

#if defined(__cpp_lib_ranges) && __cpp_lib_ranges >= 201911L
#include <ranges>
#define SIMDJSON_SUPPORTS_RANGES 1
#else
#define SIMDJSON_SUPPORTS_RANGES 0
#endif

#if defined(__cpp_concepts) && !defined(SIMDJSON_CONCEPT_DISABLED)
#if __cpp_concepts >= 201907L
#include <utility>
#define SIMDJSON_SUPPORTS_CONCEPTS 1
#else
#define SIMDJSON_SUPPORTS_CONCEPTS 0
#endif
#else // defined(__cpp_concepts) && !defined(SIMDJSON_CONCEPT_DISABLED)
#define SIMDJSON_SUPPORTS_CONCEPTS 0
#endif // defined(__cpp_concepts) && !defined(SIMDJSON_CONCEPT_DISABLED)

// copy SIMDJSON_SUPPORTS_CONCEPTS to SIMDJSON_SUPPORTS_DESERIALIZATION.
#if SIMDJSON_SUPPORTS_CONCEPTS
#define SIMDJSON_SUPPORTS_DESERIALIZATION 1
#else
#define SIMDJSON_SUPPORTS_DESERIALIZATION 0
#endif


#if !defined(SIMDJSON_CONSTEVAL)
#if defined(__cpp_consteval) && __cpp_consteval >= 201811L && defined(__cpp_lib_constexpr_string) && __cpp_lib_constexpr_string >= 201907L
#define SIMDJSON_CONSTEVAL 1
#else
#define SIMDJSON_CONSTEVAL 0
#endif // defined(__cpp_consteval) && __cpp_consteval >= 201811L && defined(__cpp_lib_constexpr_string) && __cpp_lib_constexpr_string >= 201907L
#endif // !defined(SIMDJSON_CONSTEVAL)

#endif // SIMDJSON_COMPILER_CHECK_H
/* end file simdjson/compiler_check.h */
/* including simdjson/portability.h: #include "simdjson/portability.h" */
/* begin file simdjson/portability.h */
#ifndef SIMDJSON_PORTABILITY_H
#define SIMDJSON_PORTABILITY_H

#include <cstddef>
#include <cstdint>
#include <cstdlib>
#include <cfloat>
#include <cassert>
#include <climits>
#ifndef _WIN32
// strcasecmp, strncasecmp
#include <strings.h>
#endif

static_assert(CHAR_BIT == 8, "simdjson requires 8-bit bytes");


// We are using size_t without namespace std:: throughout the project
using std::size_t;

#ifdef _MSC_VER
#define SIMDJSON_VISUAL_STUDIO 1
/**
 * We want to differentiate carefully between
 * clang under visual studio and regular visual
 * studio.
 *
 * Under clang for Windows, we enable:
 *  * target pragmas so that part and only part of the
 *     code gets compiled for advanced instructions.
 *
 */
#ifdef __clang__
// clang under visual studio
#define SIMDJSON_CLANG_VISUAL_STUDIO 1
#else
// just regular visual studio (best guess)
#define SIMDJSON_REGULAR_VISUAL_STUDIO 1
#endif // __clang__
#endif // _MSC_VER

#if (defined(__x86_64__) || defined(_M_AMD64)) && !defined(_M_ARM64EC)
#define SIMDJSON_IS_X86_64 1
#elif defined(__aarch64__) || defined(_M_ARM64) || defined(_M_ARM64EC)
#define SIMDJSON_IS_ARM64 1
#elif defined(__riscv) && __riscv_xlen == 64
#define SIMDJSON_IS_RISCV64 1
  #if __riscv_v_intrinsic >= 11000
    #define SIMDJSON_HAS_RVV_INTRINSICS 1
  #endif

  #define SIMDJSON_HAS_ZVBB_INTRINSICS                                          \
    0 // there is currently no way to detect this

  #if SIMDJSON_HAS_RVV_INTRINSICS && __riscv_vector &&                          \
      __riscv_v_min_vlen >= 128 && __riscv_v_elen >= 64
    // RISC-V V extension
    #define SIMDJSON_IS_RVV 1
    #if SIMDJSON_HAS_ZVBB_INTRINSICS && __riscv_zvbb >= 1000000
      // RISC-V Vector Basic Bit-manipulation
      #define SIMDJSON_IS_ZVBB 1
    #endif
  #endif
#elif defined(__loongarch_lp64)
#define SIMDJSON_IS_LOONGARCH64 1
#elif defined(__PPC64__) || defined(_M_PPC64)
#define SIMDJSON_IS_PPC64 1
#if defined(__ALTIVEC__)
#define SIMDJSON_IS_PPC64_VMX 1
#endif // defined(__ALTIVEC__)
#else
#define SIMDJSON_IS_32BITS 1

#if defined(_M_IX86) || defined(__i386__)
#define SIMDJSON_IS_X86_32BITS 1
#elif defined(__arm__) || defined(_M_ARM)
#define SIMDJSON_IS_ARM_32BITS 1
#elif defined(__PPC__) || defined(_M_PPC)
#define SIMDJSON_IS_PPC_32BITS 1
#endif

#endif // defined(__x86_64__) || defined(_M_AMD64)
#ifndef SIMDJSON_IS_32BITS
#define SIMDJSON_IS_32BITS 0
#endif

#if SIMDJSON_IS_32BITS
#ifndef SIMDJSON_NO_PORTABILITY_WARNING
// In the future, we should allow programmers
// to get warning.
#endif // SIMDJSON_NO_PORTABILITY_WARNING
#endif // SIMDJSON_IS_32BITS

#define SIMDJSON_CAT_IMPLEMENTATION_(a,...) a ## __VA_ARGS__
#define SIMDJSON_CAT(a,...) SIMDJSON_CAT_IMPLEMENTATION_(a, __VA_ARGS__)

#define SIMDJSON_STRINGIFY_IMPLEMENTATION_(a,...) #a SIMDJSON_STRINGIFY(__VA_ARGS__)
#define SIMDJSON_STRINGIFY(a,...) SIMDJSON_CAT_IMPLEMENTATION_(a, __VA_ARGS__)

// this is almost standard?
#undef SIMDJSON_STRINGIFY_IMPLEMENTATION_
#undef SIMDJSON_STRINGIFY
#define SIMDJSON_STRINGIFY_IMPLEMENTATION_(a) #a
#define SIMDJSON_STRINGIFY(a) SIMDJSON_STRINGIFY_IMPLEMENTATION_(a)

// Our fast kernels require 64-bit systems.
//
// On 32-bit x86, we lack 64-bit popcnt, lzcnt, blsr instructions.
// Furthermore, the number of SIMD registers is reduced.
//
// On 32-bit ARM, we would have smaller registers.
//
// The simdjson users should still have the fallback kernel. It is
// slower, but it should run everywhere.

//
// Enable valid runtime implementations, and select SIMDJSON_BUILTIN_IMPLEMENTATION
//

// We are going to use runtime dispatch.
#if SIMDJSON_IS_X86_64
#ifdef __clang__
// clang does not have GCC push pop
// warning: clang attribute push can't be used within a namespace in clang up
// til 8.0 so SIMDJSON_TARGET_REGION and SIMDJSON_UNTARGET_REGION must be *outside* of a
// namespace.
#define SIMDJSON_TARGET_REGION(T)                                                       \
  _Pragma(SIMDJSON_STRINGIFY(                                                           \
      clang attribute push(__attribute__((target(T))), apply_to = function)))
#define SIMDJSON_UNTARGET_REGION _Pragma("clang attribute pop")
#elif defined(__GNUC__)
// GCC is easier
#define SIMDJSON_TARGET_REGION(T)                                                       \
  _Pragma("GCC push_options") _Pragma(SIMDJSON_STRINGIFY(GCC target(T)))
#define SIMDJSON_UNTARGET_REGION _Pragma("GCC pop_options")
#endif // clang then gcc

#endif // x86

// Default target region macros don't do anything.
#ifndef SIMDJSON_TARGET_REGION
#define SIMDJSON_TARGET_REGION(T)
#define SIMDJSON_UNTARGET_REGION
#endif

// Is threading enabled?
#if defined(_REENTRANT) || defined(_MT)
#ifndef SIMDJSON_THREADS_ENABLED
#define SIMDJSON_THREADS_ENABLED
#endif
#endif

// workaround for large stack sizes under -O0.
// https://github.com/simdjson/simdjson/issues/691
#ifdef __APPLE__
#ifndef __OPTIMIZE__
// Apple systems have small stack sizes in secondary threads.
// Lack of compiler optimization may generate high stack usage.
// Users may want to disable threads for safety, but only when
// in debug mode which we detect by the fact that the __OPTIMIZE__
// macro is not defined.
#undef SIMDJSON_THREADS_ENABLED
#endif
#endif


#if defined(__clang__)
#define SIMDJSON_NO_SANITIZE_UNDEFINED __attribute__((no_sanitize("undefined")))
#elif defined(__GNUC__)
#define SIMDJSON_NO_SANITIZE_UNDEFINED __attribute__((no_sanitize_undefined))
#else
#define SIMDJSON_NO_SANITIZE_UNDEFINED
#endif

#if defined(__clang__) || defined(__GNUC__)
#define simdjson_pure [[gnu::pure]]
#else
#define simdjson_pure
#endif

#if defined(__clang__) || defined(__GNUC__)
#if defined(__has_feature)
#  if __has_feature(memory_sanitizer)
#define SIMDJSON_NO_SANITIZE_MEMORY __attribute__((no_sanitize("memory")))
#  endif // if __has_feature(memory_sanitizer)
#endif // defined(__has_feature)
#endif
// make sure it is defined as 'nothing' if it is unapplicable.
#ifndef SIMDJSON_NO_SANITIZE_MEMORY
#define SIMDJSON_NO_SANITIZE_MEMORY
#endif

#if SIMDJSON_VISUAL_STUDIO
// This is one case where we do not distinguish between
// regular visual studio and clang under visual studio.
// clang under Windows has _stricmp (like visual studio) but not strcasecmp (as clang normally has)
#define simdjson_strcasecmp _stricmp
#define simdjson_strncasecmp _strnicmp
#else
// The strcasecmp, strncasecmp, and strcasestr functions do not work with multibyte strings (e.g. UTF-8).
// So they are only useful for ASCII in our context.
// https://www.gnu.org/software/libunistring/manual/libunistring.html#char-_002a-strings
#define simdjson_strcasecmp strcasecmp
#define simdjson_strncasecmp strncasecmp
#endif

#if defined(NDEBUG) || defined(__OPTIMIZE__) || (defined(_MSC_VER) && !defined(_DEBUG))
// If NDEBUG is set, or __OPTIMIZE__ is set, or we are under MSVC in release mode,
// then do away with asserts and use __assume.
// We still recommend that our users set NDEBUG in release mode.
#if SIMDJSON_VISUAL_STUDIO
#define SIMDJSON_UNREACHABLE() __assume(0)
#define SIMDJSON_ASSUME(COND) __assume(COND)
#else
#define SIMDJSON_UNREACHABLE() __builtin_unreachable();
#define SIMDJSON_ASSUME(COND) do { if (!(COND)) __builtin_unreachable(); } while (0)
#endif

#else // defined(NDEBUG) || defined(__OPTIMIZE__) || (defined(_MSC_VER) && !defined(_DEBUG))
// This should only ever be enabled in debug mode.
#define SIMDJSON_UNREACHABLE() assert(0);
#define SIMDJSON_ASSUME(COND) assert(COND)

#endif



#if defined __BYTE_ORDER__ && defined __ORDER_BIG_ENDIAN__
#define SIMDJSON_IS_BIG_ENDIAN (__BYTE_ORDER__ == __ORDER_BIG_ENDIAN__)
#elif defined _WIN32
#define SIMDJSON_IS_BIG_ENDIAN 0
#else
#if defined(__APPLE__) || defined(__FreeBSD__)
#include <machine/endian.h>
#elif defined(sun) || defined(__sun)
#include <sys/byteorder.h>
#elif defined(__MVS__)
#include <sys/endian.h>
#else
#ifdef __has_include
#if __has_include(<endian.h>)
#include <endian.h>
#endif //__has_include(<endian.h>)
#endif //__has_include
#endif
#
#ifndef __BYTE_ORDER__
// safe choice
#define SIMDJSON_IS_BIG_ENDIAN 0
#endif
#
#ifndef __ORDER_LITTLE_ENDIAN__
// safe choice
#define SIMDJSON_IS_BIG_ENDIAN 0
#endif
#
#if __BYTE_ORDER__ == __ORDER_LITTLE_ENDIAN__
#define SIMDJSON_IS_BIG_ENDIAN 0
#else
#define SIMDJSON_IS_BIG_ENDIAN 1
#endif
#endif


#endif // SIMDJSON_PORTABILITY_H
/* end file simdjson/portability.h */

namespace simdjson {
namespace internal {
/**
 * @private
 * Our own implementation of the C++17 to_chars function.
 * Defined in src/to_chars
 */
char *to_chars(char *first, const char *last, double value);
/**
 * @private
 * A number parsing routine.
 * Defined in src/from_chars
 */
double from_chars(const char *first) noexcept;
double from_chars(const char *first, const char* end) noexcept;
}

#ifndef SIMDJSON_EXCEPTIONS
#if defined(__cpp_exceptions) || defined(_CPPUNWIND)
#define SIMDJSON_EXCEPTIONS 1
#else
#define SIMDJSON_EXCEPTIONS 0
#endif
#endif

} // namespace simdjson

#if defined(__GNUC__)
  // Marks a block with a name so that MCA analysis can see it.
  #define SIMDJSON_BEGIN_DEBUG_BLOCK(name) __asm volatile("# LLVM-MCA-BEGIN " #name);
  #define SIMDJSON_END_DEBUG_BLOCK(name) __asm volatile("# LLVM-MCA-END " #name);
  #define SIMDJSON_DEBUG_BLOCK(name, block) BEGIN_DEBUG_BLOCK(name); block; END_DEBUG_BLOCK(name);
#else
  #define SIMDJSON_BEGIN_DEBUG_BLOCK(name)
  #define SIMDJSON_END_DEBUG_BLOCK(name)
  #define SIMDJSON_DEBUG_BLOCK(name, block)
#endif

// Align to N-byte boundary
#define SIMDJSON_ROUNDUP_N(a, n) (((a) + ((n)-1)) & ~((n)-1))
#define SIMDJSON_ROUNDDOWN_N(a, n) ((a) & ~((n)-1))

#define SIMDJSON_ISALIGNED_N(ptr, n) (((uintptr_t)(ptr) & ((n)-1)) == 0)

#if SIMDJSON_REGULAR_VISUAL_STUDIO
  // We could use [[deprecated]] but it requires C++14
  #define simdjson_deprecated __declspec(deprecated)

  #define simdjson_really_inline __forceinline
  #define simdjson_never_inline __declspec(noinline)

  #define simdjson_unused
  #define simdjson_warn_unused

  #ifndef simdjson_likely
  #define simdjson_likely(x) x
  #endif
  #ifndef simdjson_unlikely
  #define simdjson_unlikely(x) x
  #endif

  #define SIMDJSON_PUSH_DISABLE_WARNINGS __pragma(warning( push ))
  #define SIMDJSON_PUSH_DISABLE_ALL_WARNINGS __pragma(warning( push, 0 ))
  #define SIMDJSON_DISABLE_VS_WARNING(WARNING_NUMBER) __pragma(warning( disable : WARNING_NUMBER ))
  // Get rid of Intellisense-only warnings (Code Analysis)
  // Though __has_include is C++17, it is supported in Visual Studio 2017 or better (_MSC_VER>=1910).
  #ifdef __has_include
  #if __has_include(<CppCoreCheck\Warnings.h>)
  #include <CppCoreCheck\Warnings.h>
  #define SIMDJSON_DISABLE_UNDESIRED_WARNINGS SIMDJSON_DISABLE_VS_WARNING(ALL_CPPCORECHECK_WARNINGS)
  #endif
  #endif

  #ifndef SIMDJSON_DISABLE_UNDESIRED_WARNINGS
  #define SIMDJSON_DISABLE_UNDESIRED_WARNINGS
  #endif

  #define SIMDJSON_DISABLE_DEPRECATED_WARNING SIMDJSON_DISABLE_VS_WARNING(4996)
  #define SIMDJSON_DISABLE_STRICT_OVERFLOW_WARNING
  #define SIMDJSON_POP_DISABLE_WARNINGS __pragma(warning( pop ))

  #define SIMDJSON_PUSH_DISABLE_UNUSED_WARNINGS
  #define SIMDJSON_POP_DISABLE_UNUSED_WARNINGS

#else // SIMDJSON_REGULAR_VISUAL_STUDIO
  // We could use [[deprecated]] but it requires C++14
  #define simdjson_deprecated __attribute__((deprecated))

  #define simdjson_really_inline inline __attribute__((always_inline))
  #define simdjson_never_inline inline __attribute__((noinline))

  #define simdjson_unused __attribute__((unused))
  #define simdjson_warn_unused __attribute__((warn_unused_result))

  #ifndef simdjson_likely
  #define simdjson_likely(x) __builtin_expect(!!(x), 1)
  #endif
  #ifndef simdjson_unlikely
  #define simdjson_unlikely(x) __builtin_expect(!!(x), 0)
  #endif

  #define SIMDJSON_PUSH_DISABLE_WARNINGS _Pragma("GCC diagnostic push")
  // gcc doesn't seem to disable all warnings with all and extra, add warnings here as necessary
  // We do it separately for clang since it has different warnings.
  #ifdef __clang__
  // clang is missing -Wmaybe-uninitialized.
  #define SIMDJSON_PUSH_DISABLE_ALL_WARNINGS SIMDJSON_PUSH_DISABLE_WARNINGS \
    SIMDJSON_DISABLE_GCC_WARNING(-Weffc++) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wall) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wconversion) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wextra) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wattributes) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wimplicit-fallthrough) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wnon-virtual-dtor) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wreturn-type) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wshadow) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wunused-parameter) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wunused-variable)
  #else // __clang__
  #define SIMDJSON_PUSH_DISABLE_ALL_WARNINGS SIMDJSON_PUSH_DISABLE_WARNINGS \
    SIMDJSON_DISABLE_GCC_WARNING(-Weffc++) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wall) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wconversion) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wextra) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wattributes) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wimplicit-fallthrough) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wnon-virtual-dtor) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wreturn-type) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wshadow) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wunused-parameter) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wunused-variable) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wmaybe-uninitialized) \
    SIMDJSON_DISABLE_GCC_WARNING(-Wformat-security)
  #endif // __clang__

  #define SIMDJSON_PRAGMA(P) _Pragma(#P)
  #define SIMDJSON_DISABLE_GCC_WARNING(WARNING) SIMDJSON_PRAGMA(GCC diagnostic ignored #WARNING)
  #if SIMDJSON_CLANG_VISUAL_STUDIO
  #define SIMDJSON_DISABLE_UNDESIRED_WARNINGS SIMDJSON_DISABLE_GCC_WARNING(-Wmicrosoft-include)
  #else
  #define SIMDJSON_DISABLE_UNDESIRED_WARNINGS
  #endif
  #define SIMDJSON_DISABLE_DEPRECATED_WARNING SIMDJSON_DISABLE_GCC_WARNING(-Wdeprecated-declarations)
  #define SIMDJSON_DISABLE_STRICT_OVERFLOW_WARNING SIMDJSON_DISABLE_GCC_WARNING(-Wstrict-overflow)
  #define SIMDJSON_POP_DISABLE_WARNINGS _Pragma("GCC diagnostic pop")

  #define SIMDJSON_PUSH_DISABLE_UNUSED_WARNINGS SIMDJSON_PUSH_DISABLE_WARNINGS \
    SIMDJSON_DISABLE_GCC_WARNING(-Wunused)
  #define SIMDJSON_POP_DISABLE_UNUSED_WARNINGS SIMDJSON_POP_DISABLE_WARNINGS



#endif // MSC_VER

#if defined(simdjson_inline)
  // Prefer the user's definition of simdjson_inline; don't define it ourselves.
#elif defined(__GNUC__) && !defined(__OPTIMIZE__)
  // If optimizations are disabled, forcing inlining can lead to significant
  // code bloat and high compile times. Don't use simdjson_really_inline for
  // unoptimized builds.
  #define simdjson_inline inline
#else
  // Force inlining for most simdjson functions.
  #define simdjson_inline simdjson_really_inline
#endif

#if SIMDJSON_VISUAL_STUDIO
    /**
     * Windows users need to do some extra work when building
     * or using a dynamic library (DLL). When building, we need
     * to set SIMDJSON_DLLIMPORTEXPORT to __declspec(dllexport).
     * When *using* the DLL, the user needs to set
     * SIMDJSON_DLLIMPORTEXPORT __declspec(dllimport).
     *
     * Static libraries not need require such work.
     *
     * It does not matter here whether you are using
     * the regular visual studio or clang under visual
     * studio, you still need to handle these issues.
     *
     * Non-Windows systems do not have this complexity.
     */
    #if SIMDJSON_BUILDING_WINDOWS_DYNAMIC_LIBRARY
    // We set SIMDJSON_BUILDING_WINDOWS_DYNAMIC_LIBRARY when we build a DLL under Windows.
    // It should never happen that both SIMDJSON_BUILDING_WINDOWS_DYNAMIC_LIBRARY and
    // SIMDJSON_USING_WINDOWS_DYNAMIC_LIBRARY are set.
    #define SIMDJSON_DLLIMPORTEXPORT __declspec(dllexport)
    #elif SIMDJSON_USING_WINDOWS_DYNAMIC_LIBRARY
    // Windows user who call a dynamic library should set SIMDJSON_USING_WINDOWS_DYNAMIC_LIBRARY to 1.
    #define SIMDJSON_DLLIMPORTEXPORT __declspec(dllimport)
    #else
    // We assume by default static linkage
    #define SIMDJSON_DLLIMPORTEXPORT
    #endif
#else
    #define SIMDJSON_DLLIMPORTEXPORT
#endif

// C++17 requires string_view.
#if SIMDJSON_CPLUSPLUS17
#define SIMDJSON_HAS_STRING_VIEW
#include <string_view> // by the standard, this has to be safe.
#endif

// This macro (__cpp_lib_string_view) has to be defined
// for C++17 and better, but if it is otherwise defined,
// we are going to assume that string_view is available
// even if we do not have C++17 support.
#ifdef __cpp_lib_string_view
#define SIMDJSON_HAS_STRING_VIEW
#include <string_view>
#endif

// Some systems have string_view even if we do not have C++17 support,
// and even if __cpp_lib_string_view is undefined, it is the case
// with Apple clang version 11.
// We must handle it. *This is important.*
#ifndef _MSC_VER
#ifndef SIMDJSON_HAS_STRING_VIEW
#if defined __has_include
// do not combine the next #if with the previous one (unsafe)
#if __has_include (<string_view>)
// now it is safe to trigger the include
#include <string_view> // though the file is there, it does not follow that we got the implementation
#if defined(_LIBCPP_STRING_VIEW)
// Ah! So we under libc++ which under its Library Fundamentals Technical Specification, which preceded C++17,
// included string_view.
// This means that we have string_view *even though* we may not have C++17.
#define SIMDJSON_HAS_STRING_VIEW
#endif // _LIBCPP_STRING_VIEW
#endif // __has_include (<string_view>)
#endif // defined __has_include
#endif // def SIMDJSON_HAS_STRING_VIEW
#endif // def _MSC_VER
// end of complicated but important routine to try to detect string_view.

//
// Backfill std::string_view using nonstd::string_view on systems where
// we expect that string_view is missing. Important: if we get this wrong,
// we will end up with two string_view definitions and potential trouble.
// That is why we work so hard above to avoid it.
//
#ifndef SIMDJSON_HAS_STRING_VIEW
SIMDJSON_PUSH_DISABLE_ALL_WARNINGS
/* including simdjson/nonstd/string_view.hpp: #include "simdjson/nonstd/string_view.hpp" */
/* begin file simdjson/nonstd/string_view.hpp */
// Copyright 2017-2020 by Martin Moene
//
// string-view lite, a C++17-like string_view for C++98 and later.
// For more information see https://github.com/martinmoene/string-view-lite
//
// Distributed under the Boost Software License, Version 1.0.
// (See accompanying file LICENSE.txt or copy at http://www.boost.org/LICENSE_1_0.txt)


#ifndef NONSTD_SV_LITE_H_INCLUDED
#define NONSTD_SV_LITE_H_INCLUDED

#define string_view_lite_MAJOR  1
#define string_view_lite_MINOR  8
#define string_view_lite_PATCH  0

#define string_view_lite_VERSION  nssv_STRINGIFY(string_view_lite_MAJOR) "." nssv_STRINGIFY(string_view_lite_MINOR) "." nssv_STRINGIFY(string_view_lite_PATCH)

#define nssv_STRINGIFY(  x )  nssv_STRINGIFY_( x )
#define nssv_STRINGIFY_( x )  #x

// string-view lite configuration:

#define nssv_STRING_VIEW_DEFAULT  0
#define nssv_STRING_VIEW_NONSTD   1
#define nssv_STRING_VIEW_STD      2

// tweak header support:

#ifdef __has_include
# if __has_include(<nonstd/string_view.tweak.hpp>)
#  include <nonstd/string_view.tweak.hpp>
# endif
#define nssv_HAVE_TWEAK_HEADER  1
#else
#define nssv_HAVE_TWEAK_HEADER  0
//# pragma message("string_view.hpp: Note: Tweak header not supported.")
#endif

// string_view selection and configuration:

#if !defined( nssv_CONFIG_SELECT_STRING_VIEW )
# define nssv_CONFIG_SELECT_STRING_VIEW  ( nssv_HAVE_STD_STRING_VIEW ? nssv_STRING_VIEW_STD : nssv_STRING_VIEW_NONSTD )
#endif

#ifndef  nssv_CONFIG_STD_SV_OPERATOR
# define nssv_CONFIG_STD_SV_OPERATOR  0
#endif

#ifndef  nssv_CONFIG_USR_SV_OPERATOR
# define nssv_CONFIG_USR_SV_OPERATOR  1
#endif

#ifdef   nssv_CONFIG_CONVERSION_STD_STRING
# define nssv_CONFIG_CONVERSION_STD_STRING_CLASS_METHODS   nssv_CONFIG_CONVERSION_STD_STRING
# define nssv_CONFIG_CONVERSION_STD_STRING_FREE_FUNCTIONS  nssv_CONFIG_CONVERSION_STD_STRING
#endif

#ifndef  nssv_CONFIG_CONVERSION_STD_STRING_CLASS_METHODS
# define nssv_CONFIG_CONVERSION_STD_STRING_CLASS_METHODS  1
#endif

#ifndef  nssv_CONFIG_CONVERSION_STD_STRING_FREE_FUNCTIONS
# define nssv_CONFIG_CONVERSION_STD_STRING_FREE_FUNCTIONS  1
#endif

#ifndef  nssv_CONFIG_NO_STREAM_INSERTION
# define nssv_CONFIG_NO_STREAM_INSERTION  0
#endif

#ifndef  nssv_CONFIG_CONSTEXPR11_STD_SEARCH
# define nssv_CONFIG_CONSTEXPR11_STD_SEARCH  1
#endif

// Control presence of exception handling (try and auto discover):

#ifndef nssv_CONFIG_NO_EXCEPTIONS
# if defined(_MSC_VER)
#  include <cstddef>    // for _HAS_EXCEPTIONS
# endif
# if defined(__cpp_exceptions) || defined(__EXCEPTIONS) || (_HAS_EXCEPTIONS)
#  define nssv_CONFIG_NO_EXCEPTIONS  0
# else
#  define nssv_CONFIG_NO_EXCEPTIONS  1
# endif
#endif

// C++ language version detection (C++23 is speculative):
// Note: VC14.0/1900 (VS2015) lacks too much from C++14.

#ifndef   nssv_CPLUSPLUS
# if defined(_MSVC_LANG ) && !defined(__clang__)
#  define nssv_CPLUSPLUS  (_MSC_VER == 1900 ? 201103L : _MSVC_LANG )
# else
#  define nssv_CPLUSPLUS  __cplusplus
# endif
#endif

#define nssv_CPP98_OR_GREATER  ( nssv_CPLUSPLUS >= 199711L )
#define nssv_CPP11_OR_GREATER  ( nssv_CPLUSPLUS >= 201103L )
#define nssv_CPP11_OR_GREATER_ ( nssv_CPLUSPLUS >= 201103L )
#define nssv_CPP14_OR_GREATER  ( nssv_CPLUSPLUS >= 201402L )
#define nssv_CPP17_OR_GREATER  ( nssv_CPLUSPLUS >= 201703L )
#define nssv_CPP20_OR_GREATER  ( nssv_CPLUSPLUS >= 202002L )
#define nssv_CPP23_OR_GREATER  ( nssv_CPLUSPLUS >= 202300L )

// use C++17 std::string_view if available and requested:

#if nssv_CPP17_OR_GREATER && defined(__has_include )
# if __has_include( <string_view> )
#  define nssv_HAVE_STD_STRING_VIEW  1
# else
#  define nssv_HAVE_STD_STRING_VIEW  0
# endif
#else
# define  nssv_HAVE_STD_STRING_VIEW  0
#endif

#define  nssv_USES_STD_STRING_VIEW  ( (nssv_CONFIG_SELECT_STRING_VIEW == nssv_STRING_VIEW_STD) || ((nssv_CONFIG_SELECT_STRING_VIEW == nssv_STRING_VIEW_DEFAULT) && nssv_HAVE_STD_STRING_VIEW) )

#define nssv_HAVE_STARTS_WITH ( nssv_CPP20_OR_GREATER || !nssv_USES_STD_STRING_VIEW )
#define nssv_HAVE_ENDS_WITH     nssv_HAVE_STARTS_WITH

//
// Use C++17 std::string_view:
//

#if nssv_USES_STD_STRING_VIEW

#include <string_view>

// Extensions for std::string:

#if nssv_CONFIG_CONVERSION_STD_STRING_FREE_FUNCTIONS

#include <string>

namespace nonstd {

template< class CharT, class Traits, class Allocator = std::allocator<CharT> >
std::basic_string<CharT, Traits, Allocator>
to_string( std::basic_string_view<CharT, Traits> v, Allocator const & a = Allocator() )
{
    return std::basic_string<CharT,Traits, Allocator>( v.begin(), v.end(), a );
}

template< class CharT, class Traits, class Allocator >
std::basic_string_view<CharT, Traits>
to_string_view( std::basic_string<CharT, Traits, Allocator> const & s )
{
    return std::basic_string_view<CharT, Traits>( s.data(), s.size() );
}

// Literal operators sv and _sv:

#if nssv_CONFIG_STD_SV_OPERATOR

using namespace std::literals::string_view_literals;

#endif

#if nssv_CONFIG_USR_SV_OPERATOR

inline namespace literals {
inline namespace string_view_literals {


constexpr std::string_view operator ""_sv( const char* str, size_t len ) noexcept  // (1)
{
    return std::string_view{ str, len };
}

constexpr std::u16string_view operator ""_sv( const char16_t* str, size_t len ) noexcept  // (2)
{
    return std::u16string_view{ str, len };
}

constexpr std::u32string_view operator ""_sv( const char32_t* str, size_t len ) noexcept  // (3)
{
    return std::u32string_view{ str, len };
}

constexpr std::wstring_view operator ""_sv( const wchar_t* str, size_t len ) noexcept  // (4)
{
    return std::wstring_view{ str, len };
}

}} // namespace literals::string_view_literals

#endif // nssv_CONFIG_USR_SV_OPERATOR

} // namespace nonstd

#endif // nssv_CONFIG_CONVERSION_STD_STRING_FREE_FUNCTIONS

namespace nonstd {

using std::string_view;
using std::wstring_view;
using std::u16string_view;
using std::u32string_view;
using std::basic_string_view;

// literal "sv" and "_sv", see above

using std::operator==;
using std::operator!=;
using std::operator<;
using std::operator<=;
using std::operator>;
using std::operator>=;

using std::operator<<;

} // namespace nonstd

#else // nssv_HAVE_STD_STRING_VIEW

//
// Before C++17: use string_view lite:
//

// Compiler versions:
//
// MSVC++  6.0  _MSC_VER == 1200  nssv_COMPILER_MSVC_VERSION ==  60  (Visual Studio 6.0)
// MSVC++  7.0  _MSC_VER == 1300  nssv_COMPILER_MSVC_VERSION ==  70  (Visual Studio .NET 2002)
// MSVC++  7.1  _MSC_VER == 1310  nssv_COMPILER_MSVC_VERSION ==  71  (Visual Studio .NET 2003)
// MSVC++  8.0  _MSC_VER == 1400  nssv_COMPILER_MSVC_VERSION ==  80  (Visual Studio 2005)
// MSVC++  9.0  _MSC_VER == 1500  nssv_COMPILER_MSVC_VERSION ==  90  (Visual Studio 2008)
// MSVC++ 10.0  _MSC_VER == 1600  nssv_COMPILER_MSVC_VERSION == 100  (Visual Studio 2010)
// MSVC++ 11.0  _MSC_VER == 1700  nssv_COMPILER_MSVC_VERSION == 110  (Visual Studio 2012)
// MSVC++ 12.0  _MSC_VER == 1800  nssv_COMPILER_MSVC_VERSION == 120  (Visual Studio 2013)
// MSVC++ 14.0  _MSC_VER == 1900  nssv_COMPILER_MSVC_VERSION == 140  (Visual Studio 2015)
// MSVC++ 14.1  _MSC_VER >= 1910  nssv_COMPILER_MSVC_VERSION == 141  (Visual Studio 2017)
// MSVC++ 14.2  _MSC_VER >= 1920  nssv_COMPILER_MSVC_VERSION == 142  (Visual Studio 2019)

#if defined(_MSC_VER ) && !defined(__clang__)
# define nssv_COMPILER_MSVC_VER      (_MSC_VER )
# define nssv_COMPILER_MSVC_VERSION  (_MSC_VER / 10 - 10 * ( 5 + (_MSC_VER < 1900 ) ) )
#else
# define nssv_COMPILER_MSVC_VER      0
# define nssv_COMPILER_MSVC_VERSION  0
#endif

#define nssv_COMPILER_VERSION( major, minor, patch )  ( 10 * ( 10 * (major) + (minor) ) + (patch) )

#if defined( __apple_build_version__ )
# define nssv_COMPILER_APPLECLANG_VERSION  nssv_COMPILER_VERSION(__clang_major__, __clang_minor__, __clang_patchlevel__)
# define nssv_COMPILER_CLANG_VERSION       0
#elif defined( __clang__ )
# define nssv_COMPILER_APPLECLANG_VERSION  0
# define nssv_COMPILER_CLANG_VERSION       nssv_COMPILER_VERSION(__clang_major__, __clang_minor__, __clang_patchlevel__)
#else
# define nssv_COMPILER_APPLECLANG_VERSION  0
# define nssv_COMPILER_CLANG_VERSION       0
#endif

#if defined(__GNUC__) && !defined(__clang__)
# define nssv_COMPILER_GNUC_VERSION  nssv_COMPILER_VERSION(__GNUC__, __GNUC_MINOR__, __GNUC_PATCHLEVEL__)
#else
# define nssv_COMPILER_GNUC_VERSION  0
#endif

// half-open range [lo..hi):
#define nssv_BETWEEN( v, lo, hi ) ( (lo) <= (v) && (v) < (hi) )

// Presence of language and library features:

#ifdef _HAS_CPP0X
# define nssv_HAS_CPP0X  _HAS_CPP0X
#else
# define nssv_HAS_CPP0X  0
#endif

// Unless defined otherwise below, consider VC14 as C++11 for string-view-lite:

#if nssv_COMPILER_MSVC_VER >= 1900
# undef  nssv_CPP11_OR_GREATER
# define nssv_CPP11_OR_GREATER  1
#endif

#define nssv_CPP11_90   (nssv_CPP11_OR_GREATER_ || nssv_COMPILER_MSVC_VER >= 1500)
#define nssv_CPP11_100  (nssv_CPP11_OR_GREATER_ || nssv_COMPILER_MSVC_VER >= 1600)
#define nssv_CPP11_110  (nssv_CPP11_OR_GREATER_ || nssv_COMPILER_MSVC_VER >= 1700)
#define nssv_CPP11_120  (nssv_CPP11_OR_GREATER_ || nssv_COMPILER_MSVC_VER >= 1800)
#define nssv_CPP11_140  (nssv_CPP11_OR_GREATER_ || nssv_COMPILER_MSVC_VER >= 1900)
#define nssv_CPP11_141  (nssv_CPP11_OR_GREATER_ || nssv_COMPILER_MSVC_VER >= 1910)

#define nssv_CPP14_000  (nssv_CPP14_OR_GREATER)
#define nssv_CPP17_000  (nssv_CPP17_OR_GREATER)

// Presence of C++11 language features:

#define nssv_HAVE_CONSTEXPR_11          nssv_CPP11_140
#define nssv_HAVE_EXPLICIT_CONVERSION   nssv_CPP11_140
#define nssv_HAVE_INLINE_NAMESPACE      nssv_CPP11_140
#define nssv_HAVE_IS_DEFAULT            nssv_CPP11_140
#define nssv_HAVE_IS_DELETE             nssv_CPP11_140
#define nssv_HAVE_NOEXCEPT              nssv_CPP11_140
#define nssv_HAVE_NULLPTR               nssv_CPP11_100
#define nssv_HAVE_REF_QUALIFIER         nssv_CPP11_140
#define nssv_HAVE_UNICODE_LITERALS      nssv_CPP11_140
#define nssv_HAVE_USER_DEFINED_LITERALS nssv_CPP11_140
#define nssv_HAVE_WCHAR16_T             nssv_CPP11_100
#define nssv_HAVE_WCHAR32_T             nssv_CPP11_100

#if ! ( ( nssv_CPP11_OR_GREATER && nssv_COMPILER_CLANG_VERSION ) || nssv_BETWEEN( nssv_COMPILER_CLANG_VERSION, 300, 400 ) )
# define nssv_HAVE_STD_DEFINED_LITERALS  nssv_CPP11_140
#else
# define nssv_HAVE_STD_DEFINED_LITERALS  0
#endif

// Presence of C++14 language features:

#define nssv_HAVE_CONSTEXPR_14          nssv_CPP14_000

// Presence of C++17 language features:

#define nssv_HAVE_NODISCARD             nssv_CPP17_000

// Presence of C++ library features:

#define nssv_HAVE_STD_HASH              nssv_CPP11_120

// Presence of compiler intrinsics:

// Providing char-type specializations for compare() and length() that
// use compiler intrinsics can improve compile- and run-time performance.
//
// The challenge is in using the right combinations of builtin availability
// and its constexpr-ness.
//
// | compiler | __builtin_memcmp (constexpr) | memcmp  (constexpr) |
// |----------|------------------------------|---------------------|
// | clang    | 4.0              (>= 4.0   ) | any     (?        ) |
// | clang-a  | 9.0              (>= 9.0   ) | any     (?        ) |
// | gcc      | any              (constexpr) | any     (?        ) |
// | msvc     | >= 14.2 C++17    (>= 14.2  ) | any     (?        ) |

#define nssv_HAVE_BUILTIN_VER     ( (nssv_CPP17_000 && nssv_COMPILER_MSVC_VERSION >= 142) || nssv_COMPILER_GNUC_VERSION > 0 || nssv_COMPILER_CLANG_VERSION >= 400 || nssv_COMPILER_APPLECLANG_VERSION >= 900 )
#define nssv_HAVE_BUILTIN_CE      (  nssv_HAVE_BUILTIN_VER )

#define nssv_HAVE_BUILTIN_MEMCMP  ( (nssv_HAVE_CONSTEXPR_14 && nssv_HAVE_BUILTIN_CE) || !nssv_HAVE_CONSTEXPR_14 )
#define nssv_HAVE_BUILTIN_STRLEN  ( (nssv_HAVE_CONSTEXPR_11 && nssv_HAVE_BUILTIN_CE) || !nssv_HAVE_CONSTEXPR_11 )

#ifdef __has_builtin
# define nssv_HAVE_BUILTIN( x )  __has_builtin( x )
#else
# define nssv_HAVE_BUILTIN( x )  0
#endif

#if nssv_HAVE_BUILTIN(__builtin_memcmp) || nssv_HAVE_BUILTIN_VER
# define nssv_BUILTIN_MEMCMP  __builtin_memcmp
#else
# define nssv_BUILTIN_MEMCMP  memcmp
#endif

#if nssv_HAVE_BUILTIN(__builtin_strlen) || nssv_HAVE_BUILTIN_VER
# define nssv_BUILTIN_STRLEN  __builtin_strlen
#else
# define nssv_BUILTIN_STRLEN  strlen
#endif

// C++ feature usage:

#if nssv_HAVE_CONSTEXPR_11
# define nssv_constexpr  constexpr
#else
# define nssv_constexpr  /*constexpr*/
#endif

#if  nssv_HAVE_CONSTEXPR_14
# define nssv_constexpr14  constexpr
#else
# define nssv_constexpr14  /*constexpr*/
#endif

#if nssv_HAVE_EXPLICIT_CONVERSION
# define nssv_explicit  explicit
#else
# define nssv_explicit  /*explicit*/
#endif

#if nssv_HAVE_INLINE_NAMESPACE
# define nssv_inline_ns  inline
#else
# define nssv_inline_ns  /*inline*/
#endif

#if nssv_HAVE_NOEXCEPT
# define nssv_noexcept  noexcept
#else
# define nssv_noexcept  /*noexcept*/
#endif

//#if nssv_HAVE_REF_QUALIFIER
//# define nssv_ref_qual  &
//# define nssv_refref_qual  &&
//#else
//# define nssv_ref_qual  /*&*/
//# define nssv_refref_qual  /*&&*/
//#endif

#if nssv_HAVE_NULLPTR
# define nssv_nullptr  nullptr
#else
# define nssv_nullptr  NULL
#endif

#if nssv_HAVE_NODISCARD
# define nssv_nodiscard  simdjson_warn_unused
#else
# define nssv_nodiscard  /*simdjson_warn_unused*/
#endif

// Additional includes:

#include <algorithm>
#include <cassert>
#include <iterator>
#include <limits>
#include <string>   // std::char_traits<>

#if ! nssv_CONFIG_NO_STREAM_INSERTION
# include <ostream>
#endif

#if ! nssv_CONFIG_NO_EXCEPTIONS
# include <stdexcept>
#endif

#if nssv_CPP11_OR_GREATER
# include <type_traits>
#endif

// Clang, GNUC, MSVC warning suppression macros:

#if defined(__clang__)
# pragma clang diagnostic ignored "-Wreserved-user-defined-literal"
# pragma clang diagnostic push
# pragma clang diagnostic ignored "-Wuser-defined-literals"
#elif nssv_COMPILER_GNUC_VERSION >= 480
#  pragma  GCC  diagnostic push
#  pragma  GCC  diagnostic ignored "-Wliteral-suffix"
#endif // __clang__

#if nssv_COMPILER_MSVC_VERSION >= 140
# define nssv_SUPPRESS_MSGSL_WARNING(expr)        [[gsl::suppress(expr)]]
# define nssv_SUPPRESS_MSVC_WARNING(code, descr)  __pragma(warning(suppress: code) )
# define nssv_DISABLE_MSVC_WARNINGS(codes)        __pragma(warning(push))  __pragma(warning(disable: codes))
#else
# define nssv_SUPPRESS_MSGSL_WARNING(expr)
# define nssv_SUPPRESS_MSVC_WARNING(code, descr)
# define nssv_DISABLE_MSVC_WARNINGS(codes)
#endif

#if defined(__clang__)
# define nssv_RESTORE_WARNINGS()  _Pragma("clang diagnostic pop")
#elif nssv_COMPILER_GNUC_VERSION >= 480
#  define nssv_RESTORE_WARNINGS()  _Pragma("GCC diagnostic pop")
#elif nssv_COMPILER_MSVC_VERSION >= 140
# define nssv_RESTORE_WARNINGS()  __pragma(warning(pop ))
#else
# define nssv_RESTORE_WARNINGS()
#endif

// Suppress the following MSVC (GSL) warnings:
// - C4455, non-gsl   : 'operator ""sv': literal suffix identifiers that do not
//                      start with an underscore are reserved
// - C26472, gsl::t.1 : don't use a static_cast for arithmetic conversions;
//                      use brace initialization, gsl::narrow_cast or gsl::narow
// - C26481: gsl::b.1 : don't use pointer arithmetic. Use span instead

nssv_DISABLE_MSVC_WARNINGS( 4455 26481 26472 )
//nssv_DISABLE_CLANG_WARNINGS( "-Wuser-defined-literals" )
//nssv_DISABLE_GNUC_WARNINGS( -Wliteral-suffix )

namespace nonstd { namespace sv_lite {

//
// basic_string_view declaration:
//

template
<
    class CharT,
    class Traits = std::char_traits<CharT>
>
class basic_string_view;

namespace detail {

// support constexpr comparison in C++14;
// for C++17 and later, use provided traits:

template< typename CharT >
inline nssv_constexpr14 int compare( CharT const * s1, CharT const * s2, std::size_t count )
{
    while ( count-- != 0 )
    {
        if ( *s1 < *s2 ) return -1;
        if ( *s1 > *s2 ) return +1;
        ++s1; ++s2;
    }
    return 0;
}

#if nssv_HAVE_BUILTIN_MEMCMP

// specialization of compare() for char, see also generic compare() above:

inline nssv_constexpr14 int compare( char const * s1, char const * s2, std::size_t count )
{
    return nssv_BUILTIN_MEMCMP( s1, s2, count );
}

#endif

#if nssv_HAVE_BUILTIN_STRLEN

// specialization of length() for char, see also generic length() further below:

inline nssv_constexpr std::size_t length( char const * s )
{
    return nssv_BUILTIN_STRLEN( s );
}

#endif

#if defined(__OPTIMIZE__)

// gcc, clang provide __OPTIMIZE__
// Expect tail call optimization to make length() non-recursive:

template< typename CharT >
inline nssv_constexpr std::size_t length( CharT * s, std::size_t result = 0 )
{
    return *s == '\0' ? result : length( s + 1, result + 1 );
}

#else // OPTIMIZE

// non-recursive:

template< typename CharT >
inline nssv_constexpr14 std::size_t length( CharT * s )
{
    std::size_t result = 0;
    while ( *s++ != '\0' )
    {
       ++result;
    }
    return result;
}

#endif // OPTIMIZE

#if nssv_CPP11_OR_GREATER && ! nssv_CPP17_OR_GREATER
#if defined(__OPTIMIZE__)

// gcc, clang provide __OPTIMIZE__
// Expect tail call optimization to make search() non-recursive:

template< class CharT, class Traits = std::char_traits<CharT> >
constexpr const CharT* search( basic_string_view<CharT, Traits> haystack, basic_string_view<CharT, Traits> needle )
{
    return haystack.starts_with( needle ) ? haystack.begin() :
        haystack.empty() ? haystack.end() : search( haystack.substr(1), needle );
}

#else // OPTIMIZE

// non-recursive:

#if nssv_CONFIG_CONSTEXPR11_STD_SEARCH

template< class CharT, class Traits = std::char_traits<CharT> >
constexpr const CharT* search( basic_string_view<CharT, Traits> haystack, basic_string_view<CharT, Traits> needle )
{
    return std::search( haystack.begin(), haystack.end(), needle.begin(), needle.end() );
}

#else // nssv_CONFIG_CONSTEXPR11_STD_SEARCH

template< class CharT, class Traits = std::char_traits<CharT> >
nssv_constexpr14 const CharT* search( basic_string_view<CharT, Traits> haystack, basic_string_view<CharT, Traits> needle )
{
    while ( needle.size() <= haystack.size() )
    {
        if  ( haystack.starts_with(needle) )
        {
            return haystack.cbegin();
        }
        haystack = basic_string_view<CharT, Traits>{ haystack.begin() + 1, haystack.size() - 1U };
    }
    return haystack.cend();
}
#endif // nssv_CONFIG_CONSTEXPR11_STD_SEARCH

#endif // OPTIMIZE
#endif // nssv_CPP11_OR_GREATER && ! nssv_CPP17_OR_GREATER

} // namespace detail

//
// basic_string_view:
//

template
<
    class CharT,
    class Traits /* = std::char_traits<CharT> */
>
class basic_string_view
{
public:
    // Member types:

    typedef Traits traits_type;
    typedef CharT  value_type;

    typedef CharT       * pointer;
    typedef CharT const * const_pointer;
    typedef CharT       & reference;
    typedef CharT const & const_reference;

    typedef const_pointer iterator;
    typedef const_pointer const_iterator;
    typedef std::reverse_iterator< const_iterator > reverse_iterator;
    typedef std::reverse_iterator< const_iterator > const_reverse_iterator;

    typedef std::size_t     size_type;
    typedef std::ptrdiff_t  difference_type;

    // 24.4.2.1 Construction and assignment:

    nssv_constexpr basic_string_view() nssv_noexcept
        : data_( nssv_nullptr )
        , size_( 0 )
    {}

#if nssv_CPP11_OR_GREATER
    nssv_constexpr basic_string_view( basic_string_view const & other ) nssv_noexcept = default;
#else
    nssv_constexpr basic_string_view( basic_string_view const & other ) nssv_noexcept
        : data_( other.data_)
        , size_( other.size_)
    {}
#endif

    nssv_constexpr basic_string_view( CharT const * s, size_type count ) nssv_noexcept // non-standard noexcept
        : data_( s )
        , size_( count )
    {}

    nssv_constexpr basic_string_view( CharT const * s) nssv_noexcept // non-standard noexcept
        : data_( s )
#if nssv_CPP17_OR_GREATER
        , size_( Traits::length(s) )
#elif nssv_CPP11_OR_GREATER
        , size_( detail::length(s) )
#else
        , size_( Traits::length(s) )
#endif
    {}

#if  nssv_HAVE_NULLPTR
# if nssv_HAVE_IS_DELETE
    nssv_constexpr basic_string_view( std::nullptr_t ) nssv_noexcept = delete;
# else
    private: nssv_constexpr basic_string_view( std::nullptr_t ) nssv_noexcept; public:
# endif
#endif

    // Assignment:

#if nssv_CPP11_OR_GREATER
    nssv_constexpr14 basic_string_view & operator=( basic_string_view const & other ) nssv_noexcept = default;
#else
    nssv_constexpr14 basic_string_view & operator=( basic_string_view const & other ) nssv_noexcept
    {
        data_ = other.data_;
        size_ = other.size_;
        return *this;
    }
#endif

    // 24.4.2.2 Iterator support:

    nssv_constexpr const_iterator begin()  const nssv_noexcept { return data_;         }
    nssv_constexpr const_iterator end()    const nssv_noexcept { return data_ + size_; }

    nssv_constexpr const_iterator cbegin() const nssv_noexcept { return begin(); }
    nssv_constexpr const_iterator cend()   const nssv_noexcept { return end();   }

    nssv_constexpr const_reverse_iterator rbegin()  const nssv_noexcept { return const_reverse_iterator( end() );   }
    nssv_constexpr const_reverse_iterator rend()    const nssv_noexcept { return const_reverse_iterator( begin() ); }

    nssv_constexpr const_reverse_iterator crbegin() const nssv_noexcept { return rbegin(); }
    nssv_constexpr const_reverse_iterator crend()   const nssv_noexcept { return rend();   }

    // 24.4.2.3 Capacity:

    nssv_constexpr size_type size()     const nssv_noexcept { return size_; }
    nssv_constexpr size_type length()   const nssv_noexcept { return size_; }
    nssv_constexpr size_type max_size() const nssv_noexcept { return (std::numeric_limits< size_type >::max)(); }

    // since C++20
    nssv_nodiscard nssv_constexpr bool empty() const nssv_noexcept
    {
        return 0 == size_;
    }

    // 24.4.2.4 Element access:

    nssv_constexpr const_reference operator[]( size_type pos ) const
    {
        return data_at( pos );
    }

    nssv_constexpr14 const_reference at( size_type pos ) const
    {
#if nssv_CONFIG_NO_EXCEPTIONS
        assert( pos < size() );
#else
        if ( pos >= size() )
        {
            throw std::out_of_range("nonstd::string_view::at()");
        }
#endif
        return data_at( pos );
    }

    nssv_constexpr const_reference front() const { return data_at( 0 );          }
    nssv_constexpr const_reference back()  const { return data_at( size() - 1 ); }

    nssv_constexpr const_pointer   data()  const nssv_noexcept { return data_; }

    // 24.4.2.5 Modifiers:

    nssv_constexpr14 void remove_prefix( size_type n )
    {
        assert( n <= size() );
        data_ += n;
        size_ -= n;
    }

    nssv_constexpr14 void remove_suffix( size_type n )
    {
        assert( n <= size() );
        size_ -= n;
    }

    nssv_constexpr14 void swap( basic_string_view & other ) nssv_noexcept
    {
        const basic_string_view tmp(other);
        other = *this;
        *this = tmp;
    }

    // 24.4.2.6 String operations:

    size_type copy( CharT * dest, size_type n, size_type pos = 0 ) const
    {
#if nssv_CONFIG_NO_EXCEPTIONS
        assert( pos <= size() );
#else
        if ( pos > size() )
        {
            throw std::out_of_range("nonstd::string_view::copy()");
        }
#endif
        const size_type rlen = (std::min)( n, size() - pos );

        (void) Traits::copy( dest, data() + pos, rlen );

        return rlen;
    }

    nssv_constexpr14 basic_string_view substr( size_type pos = 0, size_type n = npos ) const
    {
#if nssv_CONFIG_NO_EXCEPTIONS
        assert( pos <= size() );
#else
        if ( pos > size() )
        {
            throw std::out_of_range("nonstd::string_view::substr()");
        }
#endif
        return basic_string_view( data() + pos, (std::min)( n, size() - pos ) );
    }

    // compare(), 6x:

    nssv_constexpr14 int compare( basic_string_view other ) const nssv_noexcept // (1)
    {
#if nssv_CPP17_OR_GREATER
        if ( const int result = Traits::compare( data(), other.data(), (std::min)( size(), other.size() ) ) )
#else
        if ( const int result = detail::compare( data(), other.data(), (std::min)( size(), other.size() ) ) )
#endif
        {
            return result;
        }

        return size() == other.size() ? 0 : size() < other.size() ? -1 : 1;
    }

    nssv_constexpr int compare( size_type pos1, size_type n1, basic_string_view other ) const // (2)
    {
        return substr( pos1, n1 ).compare( other );
    }

    nssv_constexpr int compare( size_type pos1, size_type n1, basic_string_view other, size_type pos2, size_type n2 ) const // (3)
    {
        return substr( pos1, n1 ).compare( other.substr( pos2, n2 ) );
    }

    nssv_constexpr int compare( CharT const * s ) const // (4)
    {
        return compare( basic_string_view( s ) );
    }

    nssv_constexpr int compare( size_type pos1, size_type n1, CharT const * s ) const // (5)
    {
        return substr( pos1, n1 ).compare( basic_string_view( s ) );
    }

    nssv_constexpr int compare( size_type pos1, size_type n1, CharT const * s, size_type n2 ) const // (6)
    {
        return substr( pos1, n1 ).compare( basic_string_view( s, n2 ) );
    }

    // 24.4.2.7 Searching:

    // starts_with(), 3x, since C++20:

    nssv_constexpr bool starts_with( basic_string_view v ) const nssv_noexcept  // (1)
    {
        return size() >= v.size() && compare( 0, v.size(), v ) == 0;
    }

    nssv_constexpr bool starts_with( CharT c ) const nssv_noexcept  // (2)
    {
        return starts_with( basic_string_view( &c, 1 ) );
    }

    nssv_constexpr bool starts_with( CharT const * s ) const  // (3)
    {
        return starts_with( basic_string_view( s ) );
    }

    // ends_with(), 3x, since C++20:

    nssv_constexpr bool ends_with( basic_string_view v ) const nssv_noexcept  // (1)
    {
        return size() >= v.size() && compare( size() - v.size(), npos, v ) == 0;
    }

    nssv_constexpr bool ends_with( CharT c ) const nssv_noexcept  // (2)
    {
        return ends_with( basic_string_view( &c, 1 ) );
    }

    nssv_constexpr bool ends_with( CharT const * s ) const  // (3)
    {
        return ends_with( basic_string_view( s ) );
    }

    // find(), 4x:

    nssv_constexpr14 size_type find( basic_string_view v, size_type pos = 0 ) const nssv_noexcept  // (1)
    {
        return assert( v.size() == 0 || v.data() != nssv_nullptr )
            , pos >= size()
            ? npos : to_pos(
#if nssv_CPP11_OR_GREATER && ! nssv_CPP17_OR_GREATER
                detail::search( substr(pos), v )
#else
                std::search( cbegin() + pos, cend(), v.cbegin(), v.cend(), Traits::eq )
#endif
            );
    }

    nssv_constexpr size_type find( CharT c, size_type pos = 0 ) const nssv_noexcept  // (2)
    {
        return find( basic_string_view( &c, 1 ), pos );
    }

    nssv_constexpr size_type find( CharT const * s, size_type pos, size_type n ) const  // (3)
    {
        return find( basic_string_view( s, n ), pos );
    }

    nssv_constexpr size_type find( CharT const * s, size_type pos = 0 ) const  // (4)
    {
        return find( basic_string_view( s ), pos );
    }

    // rfind(), 4x:

    nssv_constexpr14 size_type rfind( basic_string_view v, size_type pos = npos ) const nssv_noexcept  // (1)
    {
        if ( size() < v.size() )
        {
            return npos;
        }

        if ( v.empty() )
        {
            return (std::min)( size(), pos );
        }

        const_iterator last   = cbegin() + (std::min)( size() - v.size(), pos ) + v.size();
        const_iterator result = std::find_end( cbegin(), last, v.cbegin(), v.cend(), Traits::eq );

        return result != last ? size_type( result - cbegin() ) : npos;
    }

    nssv_constexpr14 size_type rfind( CharT c, size_type pos = npos ) const nssv_noexcept  // (2)
    {
        return rfind( basic_string_view( &c, 1 ), pos );
    }

    nssv_constexpr14 size_type rfind( CharT const * s, size_type pos, size_type n ) const  // (3)
    {
        return rfind( basic_string_view( s, n ), pos );
    }

    nssv_constexpr14 size_type rfind( CharT const * s, size_type pos = npos ) const  // (4)
    {
        return rfind( basic_string_view( s ), pos );
    }

    // find_first_of(), 4x:

    nssv_constexpr size_type find_first_of( basic_string_view v, size_type pos = 0 ) const nssv_noexcept  // (1)
    {
        return pos >= size()
            ? npos
            : to_pos( std::find_first_of( cbegin() + pos, cend(), v.cbegin(), v.cend(), Traits::eq ) );
    }

    nssv_constexpr size_type find_first_of( CharT c, size_type pos = 0 ) const nssv_noexcept  // (2)
    {
        return find_first_of( basic_string_view( &c, 1 ), pos );
    }

    nssv_constexpr size_type find_first_of( CharT const * s, size_type pos, size_type n ) const  // (3)
    {
        return find_first_of( basic_string_view( s, n ), pos );
    }

    nssv_constexpr size_type find_first_of(  CharT const * s, size_type pos = 0 ) const  // (4)
    {
        return find_first_of( basic_string_view( s ), pos );
    }

    // find_last_of(), 4x:

    nssv_constexpr size_type find_last_of( basic_string_view v, size_type pos = npos ) const nssv_noexcept  // (1)
    {
        return empty()
            ? npos
            : pos >= size()
            ? find_last_of( v, size() - 1 )
            : to_pos( std::find_first_of( const_reverse_iterator( cbegin() + pos + 1 ), crend(), v.cbegin(), v.cend(), Traits::eq ) );
    }

    nssv_constexpr size_type find_last_of( CharT c, size_type pos = npos ) const nssv_noexcept  // (2)
    {
        return find_last_of( basic_string_view( &c, 1 ), pos );
    }

    nssv_constexpr size_type find_last_of( CharT const * s, size_type pos, size_type count ) const  // (3)
    {
        return find_last_of( basic_string_view( s, count ), pos );
    }

    nssv_constexpr size_type find_last_of( CharT const * s, size_type pos = npos ) const  // (4)
    {
        return find_last_of( basic_string_view( s ), pos );
    }

    // find_first_not_of(), 4x:

    nssv_constexpr size_type find_first_not_of( basic_string_view v, size_type pos = 0 ) const nssv_noexcept  // (1)
    {
        return pos >= size()
            ? npos
            : to_pos( std::find_if( cbegin() + pos, cend(), not_in_view( v ) ) );
    }

    nssv_constexpr size_type find_first_not_of( CharT c, size_type pos = 0 ) const nssv_noexcept  // (2)
    {
        return find_first_not_of( basic_string_view( &c, 1 ), pos );
    }

    nssv_constexpr size_type find_first_not_of( CharT const * s, size_type pos, size_type count ) const  // (3)
    {
        return find_first_not_of( basic_string_view( s, count ), pos );
    }

    nssv_constexpr size_type find_first_not_of( CharT const * s, size_type pos = 0 ) const  // (4)
    {
        return find_first_not_of( basic_string_view( s ), pos );
    }

    // find_last_not_of(), 4x:

    nssv_constexpr size_type find_last_not_of( basic_string_view v, size_type pos = npos ) const nssv_noexcept  // (1)
    {
        return empty()
            ? npos
            : pos >= size()
            ? find_last_not_of( v, size() - 1 )
            : to_pos( std::find_if( const_reverse_iterator( cbegin() + pos + 1 ), crend(), not_in_view( v ) ) );
    }

    nssv_constexpr size_type find_last_not_of( CharT c, size_type pos = npos ) const nssv_noexcept  // (2)
    {
        return find_last_not_of( basic_string_view( &c, 1 ), pos );
    }

    nssv_constexpr size_type find_last_not_of( CharT const * s, size_type pos, size_type count ) const  // (3)
    {
        return find_last_not_of( basic_string_view( s, count ), pos );
    }

    nssv_constexpr size_type find_last_not_of( CharT const * s, size_type pos = npos ) const  // (4)
    {
        return find_last_not_of( basic_string_view( s ), pos );
    }

    // Constants:

#if nssv_CPP17_OR_GREATER
    static nssv_constexpr size_type npos = size_type(-1);
#elif nssv_CPP11_OR_GREATER
    enum : size_type { npos = size_type(-1) };
#else
    enum { npos = size_type(-1) };
#endif

private:
    struct not_in_view
    {
        const basic_string_view v;

        nssv_constexpr explicit not_in_view( basic_string_view v_ ) : v( v_ ) {}

        nssv_constexpr bool operator()( CharT c ) const
        {
            return npos == v.find_first_of( c );
        }
    };

    nssv_constexpr size_type to_pos( const_iterator it ) const
    {
        return it == cend() ? npos : size_type( it - cbegin() );
    }

    nssv_constexpr size_type to_pos( const_reverse_iterator it ) const
    {
        return it == crend() ? npos : size_type( crend() - it - 1 );
    }

    nssv_constexpr const_reference data_at( size_type pos ) const
    {
#if nssv_BETWEEN( nssv_COMPILER_GNUC_VERSION, 1, 500 )
        return data_[pos];
#else
        return assert( pos < size() ), data_[pos];
#endif
    }

private:
    const_pointer data_;
    size_type     size_;

public:
#if nssv_CONFIG_CONVERSION_STD_STRING_CLASS_METHODS

    template< class Allocator >
    basic_string_view( std::basic_string<CharT, Traits, Allocator> const & s ) nssv_noexcept
        : data_( s.data() )
        , size_( s.size() )
    {}

#if nssv_HAVE_EXPLICIT_CONVERSION

    template< class Allocator >
    explicit operator std::basic_string<CharT, Traits, Allocator>() const
    {
        return to_string( Allocator() );
    }

#endif // nssv_HAVE_EXPLICIT_CONVERSION

#if nssv_CPP11_OR_GREATER

    template< class Allocator = std::allocator<CharT> >
    std::basic_string<CharT, Traits, Allocator>
    to_string( Allocator const & a = Allocator() ) const
    {
        return std::basic_string<CharT, Traits, Allocator>( begin(), end(), a );
    }

#else

    std::basic_string<CharT, Traits>
    to_string() const
    {
        return std::basic_string<CharT, Traits>( begin(), end() );
    }

    template< class Allocator >
    std::basic_string<CharT, Traits, Allocator>
    to_string( Allocator const & a ) const
    {
        return std::basic_string<CharT, Traits, Allocator>( begin(), end(), a );
    }

#endif // nssv_CPP11_OR_GREATER

#endif // nssv_CONFIG_CONVERSION_STD_STRING_CLASS_METHODS
};

//
// Non-member functions:
//

// 24.4.3 Non-member comparison functions:
// lexicographically compare two string views (function template):

template< class CharT, class Traits >
nssv_constexpr bool operator== (
    basic_string_view <CharT, Traits> lhs,
    basic_string_view <CharT, Traits> rhs ) nssv_noexcept
{ return lhs.size() == rhs.size() && lhs.compare( rhs ) == 0; }

template< class CharT, class Traits >
nssv_constexpr bool operator!= (
    basic_string_view <CharT, Traits> lhs,
    basic_string_view <CharT, Traits> rhs ) nssv_noexcept
{ return !( lhs == rhs ); }

template< class CharT, class Traits >
nssv_constexpr bool operator< (
    basic_string_view <CharT, Traits> lhs,
    basic_string_view <CharT, Traits> rhs ) nssv_noexcept
{ return lhs.compare( rhs ) < 0; }

template< class CharT, class Traits >
nssv_constexpr bool operator<= (
    basic_string_view <CharT, Traits> lhs,
    basic_string_view <CharT, Traits> rhs ) nssv_noexcept
{ return lhs.compare( rhs ) <= 0; }

template< class CharT, class Traits >
nssv_constexpr bool operator> (
    basic_string_view <CharT, Traits> lhs,
    basic_string_view <CharT, Traits> rhs ) nssv_noexcept
{ return lhs.compare( rhs ) > 0; }

template< class CharT, class Traits >
nssv_constexpr bool operator>= (
    basic_string_view <CharT, Traits> lhs,
    basic_string_view <CharT, Traits> rhs ) nssv_noexcept
{ return lhs.compare( rhs ) >= 0; }

// Let S be basic_string_view<CharT, Traits>, and sv be an instance of S.
// Implementations shall provide sufficient additional overloads marked
// constexpr and noexcept so that an object t with an implicit conversion
// to S can be compared according to Table 67.

#if ! nssv_CPP11_OR_GREATER || nssv_BETWEEN( nssv_COMPILER_MSVC_VERSION, 100, 141 )

// accommodate for older compilers:

// ==

template< class CharT, class Traits>
nssv_constexpr bool operator==(
    basic_string_view<CharT, Traits> lhs,
    CharT const * rhs ) nssv_noexcept
{ return lhs.size() == detail::length( rhs ) && lhs.compare( rhs ) == 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator==(
    CharT const * lhs,
    basic_string_view<CharT, Traits> rhs ) nssv_noexcept
{ return detail::length( lhs ) == rhs.size() && rhs.compare( lhs ) == 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator==(
    basic_string_view<CharT, Traits> lhs,
    std::basic_string<CharT, Traits> rhs ) nssv_noexcept
{ return lhs.size() == rhs.size() && lhs.compare( rhs ) == 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator==(
    std::basic_string<CharT, Traits> rhs,
    basic_string_view<CharT, Traits> lhs ) nssv_noexcept
{ return lhs.size() == rhs.size() && lhs.compare( rhs ) == 0; }

// !=

template< class CharT, class Traits>
nssv_constexpr bool operator!=(
    basic_string_view<CharT, Traits> lhs,
    CharT const * rhs ) nssv_noexcept
{ return !( lhs == rhs ); }

template< class CharT, class Traits>
nssv_constexpr bool operator!=(
    CharT const * lhs,
    basic_string_view<CharT, Traits> rhs ) nssv_noexcept
{ return !( lhs == rhs ); }

template< class CharT, class Traits>
nssv_constexpr bool operator!=(
    basic_string_view<CharT, Traits> lhs,
    std::basic_string<CharT, Traits> rhs ) nssv_noexcept
{ return !( lhs == rhs ); }

template< class CharT, class Traits>
nssv_constexpr bool operator!=(
    std::basic_string<CharT, Traits> rhs,
    basic_string_view<CharT, Traits> lhs ) nssv_noexcept
{ return !( lhs == rhs ); }

// <

template< class CharT, class Traits>
nssv_constexpr bool operator<(
    basic_string_view<CharT, Traits> lhs,
    CharT const * rhs ) nssv_noexcept
{ return lhs.compare( rhs ) < 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator<(
    CharT const * lhs,
    basic_string_view<CharT, Traits> rhs ) nssv_noexcept
{ return rhs.compare( lhs ) > 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator<(
    basic_string_view<CharT, Traits> lhs,
    std::basic_string<CharT, Traits> rhs ) nssv_noexcept
{ return lhs.compare( rhs ) < 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator<(
    std::basic_string<CharT, Traits> rhs,
    basic_string_view<CharT, Traits> lhs ) nssv_noexcept
{ return rhs.compare( lhs ) > 0; }

// <=

template< class CharT, class Traits>
nssv_constexpr bool operator<=(
    basic_string_view<CharT, Traits> lhs,
    CharT const * rhs ) nssv_noexcept
{ return lhs.compare( rhs ) <= 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator<=(
    CharT const * lhs,
    basic_string_view<CharT, Traits> rhs ) nssv_noexcept
{ return rhs.compare( lhs ) >= 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator<=(
    basic_string_view<CharT, Traits> lhs,
    std::basic_string<CharT, Traits> rhs ) nssv_noexcept
{ return lhs.compare( rhs ) <= 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator<=(
    std::basic_string<CharT, Traits> rhs,
    basic_string_view<CharT, Traits> lhs ) nssv_noexcept
{ return rhs.compare( lhs ) >= 0; }

// >

template< class CharT, class Traits>
nssv_constexpr bool operator>(
    basic_string_view<CharT, Traits> lhs,
    CharT const * rhs ) nssv_noexcept
{ return lhs.compare( rhs ) > 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator>(
    CharT const * lhs,
    basic_string_view<CharT, Traits> rhs ) nssv_noexcept
{ return rhs.compare( lhs ) < 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator>(
    basic_string_view<CharT, Traits> lhs,
    std::basic_string<CharT, Traits> rhs ) nssv_noexcept
{ return lhs.compare( rhs ) > 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator>(
    std::basic_string<CharT, Traits> rhs,
    basic_string_view<CharT, Traits> lhs ) nssv_noexcept
{ return rhs.compare( lhs ) < 0; }

// >=

template< class CharT, class Traits>
nssv_constexpr bool operator>=(
    basic_string_view<CharT, Traits> lhs,
    CharT const * rhs ) nssv_noexcept
{ return lhs.compare( rhs ) >= 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator>=(
    CharT const * lhs,
    basic_string_view<CharT, Traits> rhs ) nssv_noexcept
{ return rhs.compare( lhs ) <= 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator>=(
    basic_string_view<CharT, Traits> lhs,
    std::basic_string<CharT, Traits> rhs ) nssv_noexcept
{ return lhs.compare( rhs ) >= 0; }

template< class CharT, class Traits>
nssv_constexpr bool operator>=(
    std::basic_string<CharT, Traits> rhs,
    basic_string_view<CharT, Traits> lhs ) nssv_noexcept
{ return rhs.compare( lhs ) <= 0; }

#else // newer compilers:

#define nssv_BASIC_STRING_VIEW_I(T,U)  typename std::decay< basic_string_view<T,U> >::type

#if defined(_MSC_VER)       // issue 40
# define nssv_MSVC_ORDER(x)  , int=x
#else
# define nssv_MSVC_ORDER(x)  /*, int=x*/
#endif

// ==

template< class CharT, class Traits  nssv_MSVC_ORDER(1) >
nssv_constexpr bool operator==(
         basic_string_view  <CharT, Traits> lhs,
    nssv_BASIC_STRING_VIEW_I(CharT, Traits) rhs ) nssv_noexcept
{ return lhs.size() == rhs.size() && lhs.compare( rhs ) == 0; }

template< class CharT, class Traits  nssv_MSVC_ORDER(2) >
nssv_constexpr bool operator==(
    nssv_BASIC_STRING_VIEW_I(CharT, Traits) lhs,
         basic_string_view  <CharT, Traits> rhs ) nssv_noexcept
{ return lhs.size() == rhs.size() && lhs.compare( rhs ) == 0; }

// !=

template< class CharT, class Traits  nssv_MSVC_ORDER(1) >
nssv_constexpr bool operator!= (
         basic_string_view  < CharT, Traits > lhs,
    nssv_BASIC_STRING_VIEW_I( CharT, Traits ) rhs ) nssv_noexcept
{ return !( lhs == rhs ); }

template< class CharT, class Traits  nssv_MSVC_ORDER(2) >
nssv_constexpr bool operator!= (
    nssv_BASIC_STRING_VIEW_I( CharT, Traits ) lhs,
         basic_string_view  < CharT, Traits > rhs ) nssv_noexcept
{ return !( lhs == rhs ); }

// <

template< class CharT, class Traits  nssv_MSVC_ORDER(1) >
nssv_constexpr bool operator< (
         basic_string_view  < CharT, Traits > lhs,
    nssv_BASIC_STRING_VIEW_I( CharT, Traits ) rhs ) nssv_noexcept
{ return lhs.compare( rhs ) < 0; }

template< class CharT, class Traits  nssv_MSVC_ORDER(2) >
nssv_constexpr bool operator< (
    nssv_BASIC_STRING_VIEW_I( CharT, Traits ) lhs,
         basic_string_view  < CharT, Traits > rhs ) nssv_noexcept
{ return lhs.compare( rhs ) < 0; }

// <=

template< class CharT, class Traits  nssv_MSVC_ORDER(1) >
nssv_constexpr bool operator<= (
         basic_string_view  < CharT, Traits > lhs,
    nssv_BASIC_STRING_VIEW_I( CharT, Traits ) rhs ) nssv_noexcept
{ return lhs.compare( rhs ) <= 0; }

template< class CharT, class Traits  nssv_MSVC_ORDER(2) >
nssv_constexpr bool operator<= (
    nssv_BASIC_STRING_VIEW_I( CharT, Traits ) lhs,
         basic_string_view  < CharT, Traits > rhs ) nssv_noexcept
{ return lhs.compare( rhs ) <= 0; }

// >

template< class CharT, class Traits  nssv_MSVC_ORDER(1) >
nssv_constexpr bool operator> (
         basic_string_view  < CharT, Traits > lhs,
    nssv_BASIC_STRING_VIEW_I( CharT, Traits ) rhs ) nssv_noexcept
{ return lhs.compare( rhs ) > 0; }

template< class CharT, class Traits  nssv_MSVC_ORDER(2) >
nssv_constexpr bool operator> (
    nssv_BASIC_STRING_VIEW_I( CharT, Traits ) lhs,
         basic_string_view  < CharT, Traits > rhs ) nssv_noexcept
{ return lhs.compare( rhs ) > 0; }

// >=

template< class CharT, class Traits  nssv_MSVC_ORDER(1) >
nssv_constexpr bool operator>= (
         basic_string_view  < CharT, Traits > lhs,
    nssv_BASIC_STRING_VIEW_I( CharT, Traits ) rhs ) nssv_noexcept
{ return lhs.compare( rhs ) >= 0; }

template< class CharT, class Traits  nssv_MSVC_ORDER(2) >
nssv_constexpr bool operator>= (
    nssv_BASIC_STRING_VIEW_I( CharT, Traits ) lhs,
         basic_string_view  < CharT, Traits > rhs ) nssv_noexcept
{ return lhs.compare( rhs ) >= 0; }

#undef nssv_MSVC_ORDER
#undef nssv_BASIC_STRING_VIEW_I

#endif // compiler-dependent approach to comparisons

// 24.4.4 Inserters and extractors:

#if ! nssv_CONFIG_NO_STREAM_INSERTION

namespace detail {

template< class Stream >
void write_padding( Stream & os, std::streamsize n )
{
    for ( std::streamsize i = 0; i < n; ++i )
        os.rdbuf()->sputc( os.fill() );
}

template< class Stream, class View >
Stream & write_to_stream( Stream & os, View const & sv )
{
    typename Stream::sentry sentry( os );

    if ( !sentry )
        return os;

    const std::streamsize length = static_cast<std::streamsize>( sv.length() );

    // Whether, and how, to pad:
    const bool      pad = ( length < os.width() );
    const bool left_pad = pad && ( os.flags() & std::ios_base::adjustfield ) == std::ios_base::right;

    if ( left_pad )
        write_padding( os, os.width() - length );

    // Write span characters:
    os.rdbuf()->sputn( sv.begin(), length );

    if ( pad && !left_pad )
        write_padding( os, os.width() - length );

    // Reset output stream width:
    os.width( 0 );

    return os;
}

} // namespace detail

template< class CharT, class Traits >
std::basic_ostream<CharT, Traits> &
operator<<(
    std::basic_ostream<CharT, Traits>& os,
    basic_string_view <CharT, Traits> sv )
{
    return detail::write_to_stream( os, sv );
}

#endif // nssv_CONFIG_NO_STREAM_INSERTION

// Several typedefs for common character types are provided:

typedef basic_string_view<char>      string_view;
typedef basic_string_view<wchar_t>   wstring_view;
#if nssv_HAVE_WCHAR16_T
typedef basic_string_view<char16_t>  u16string_view;
typedef basic_string_view<char32_t>  u32string_view;
#endif

}} // namespace nonstd::sv_lite

//
// 24.4.6 Suffix for basic_string_view literals:
//

#if nssv_HAVE_USER_DEFINED_LITERALS

namespace nonstd {
nssv_inline_ns namespace literals {
nssv_inline_ns namespace string_view_literals {

#if nssv_CONFIG_STD_SV_OPERATOR && nssv_HAVE_STD_DEFINED_LITERALS

nssv_constexpr nonstd::sv_lite::string_view operator ""sv( const char* str, size_t len ) nssv_noexcept  // (1)
{
    return nonstd::sv_lite::string_view{ str, len };
}

nssv_constexpr nonstd::sv_lite::u16string_view operator ""sv( const char16_t* str, size_t len ) nssv_noexcept  // (2)
{
    return nonstd::sv_lite::u16string_view{ str, len };
}

nssv_constexpr nonstd::sv_lite::u32string_view operator ""sv( const char32_t* str, size_t len ) nssv_noexcept  // (3)
{
    return nonstd::sv_lite::u32string_view{ str, len };
}

nssv_constexpr nonstd::sv_lite::wstring_view operator ""sv( const wchar_t* str, size_t len ) nssv_noexcept  // (4)
{
    return nonstd::sv_lite::wstring_view{ str, len };
}

#endif // nssv_CONFIG_STD_SV_OPERATOR && nssv_HAVE_STD_DEFINED_LITERALS

#if nssv_CONFIG_USR_SV_OPERATOR

nssv_constexpr nonstd::sv_lite::string_view operator ""_sv( const char* str, size_t len ) nssv_noexcept  // (1)
{
    return nonstd::sv_lite::string_view{ str, len };
}

nssv_constexpr nonstd::sv_lite::u16string_view operator ""_sv( const char16_t* str, size_t len ) nssv_noexcept  // (2)
{
    return nonstd::sv_lite::u16string_view{ str, len };
}

nssv_constexpr nonstd::sv_lite::u32string_view operator ""_sv( const char32_t* str, size_t len ) nssv_noexcept  // (3)
{
    return nonstd::sv_lite::u32string_view{ str, len };
}

nssv_constexpr nonstd::sv_lite::wstring_view operator ""_sv( const wchar_t* str, size_t len ) nssv_noexcept  // (4)
{
    return nonstd::sv_lite::wstring_view{ str, len };
}

#endif // nssv_CONFIG_USR_SV_OPERATOR

}}} // namespace nonstd::literals::string_view_literals

#endif

//
// Extensions for std::string:
//

#if nssv_CONFIG_CONVERSION_STD_STRING_FREE_FUNCTIONS

namespace nonstd {
namespace sv_lite {

// Exclude MSVC 14 (19.00): it yields ambiguous to_string():

#if nssv_CPP11_OR_GREATER && nssv_COMPILER_MSVC_VERSION != 140

template< class CharT, class Traits, class Allocator = std::allocator<CharT> >
std::basic_string<CharT, Traits, Allocator>
to_string( basic_string_view<CharT, Traits> v, Allocator const & a = Allocator() )
{
    return std::basic_string<CharT,Traits, Allocator>( v.begin(), v.end(), a );
}

#else

template< class CharT, class Traits >
std::basic_string<CharT, Traits>
to_string( basic_string_view<CharT, Traits> v )
{
    return std::basic_string<CharT, Traits>( v.begin(), v.end() );
}

template< class CharT, class Traits, class Allocator >
std::basic_string<CharT, Traits, Allocator>
to_string( basic_string_view<CharT, Traits> v, Allocator const & a )
{
    return std::basic_string<CharT, Traits, Allocator>( v.begin(), v.end(), a );
}

#endif // nssv_CPP11_OR_GREATER

template< class CharT, class Traits, class Allocator >
basic_string_view<CharT, Traits>
to_string_view( std::basic_string<CharT, Traits, Allocator> const & s )
{
    return basic_string_view<CharT, Traits>( s.data(), s.size() );
}

}} // namespace nonstd::sv_lite

#endif // nssv_CONFIG_CONVERSION_STD_STRING_FREE_FUNCTIONS

//
// make types and algorithms available in namespace nonstd:
//

namespace nonstd {

using sv_lite::basic_string_view;
using sv_lite::string_view;
using sv_lite::wstring_view;

#if nssv_HAVE_WCHAR16_T
using sv_lite::u16string_view;
#endif
#if nssv_HAVE_WCHAR32_T
using sv_lite::u32string_view;
#endif

// literal "sv"

using sv_lite::operator==;
using sv_lite::operator!=;
using sv_lite::operator<;
using sv_lite::operator<=;
using sv_lite::operator>;
using sv_lite::operator>=;

#if ! nssv_CONFIG_NO_STREAM_INSERTION
using sv_lite::operator<<;
#endif

#if nssv_CONFIG_CONVERSION_STD_STRING_FREE_FUNCTIONS
using sv_lite::to_string;
using sv_lite::to_string_view;
#endif

} // namespace nonstd

// 24.4.5 Hash support (C++11):

// Note: The hash value of a string view object is equal to the hash value of
// the corresponding string object.

#if nssv_HAVE_STD_HASH

#include <functional>

namespace std {

template<>
struct hash< nonstd::string_view >
{
public:
    std::size_t operator()( nonstd::string_view v ) const nssv_noexcept
    {
        return std::hash<std::string>()( std::string( v.data(), v.size() ) );
    }
};

template<>
struct hash< nonstd::wstring_view >
{
public:
    std::size_t operator()( nonstd::wstring_view v ) const nssv_noexcept
    {
        return std::hash<std::wstring>()( std::wstring( v.data(), v.size() ) );
    }
};

template<>
struct hash< nonstd::u16string_view >
{
public:
    std::size_t operator()( nonstd::u16string_view v ) const nssv_noexcept
    {
        return std::hash<std::u16string>()( std::u16string( v.data(), v.size() ) );
    }
};

template<>
struct hash< nonstd::u32string_view >
{
public:
    std::size_t operator()( nonstd::u32string_view v ) const nssv_noexcept
    {
        return std::hash<std::u32string>()( std::u32string( v.data(), v.size() ) );
    }
};

} // namespace std

#endif // nssv_HAVE_STD_HASH

nssv_RESTORE_WARNINGS()

#endif // nssv_HAVE_STD_STRING_VIEW
#endif // NONSTD_SV_LITE_H_INCLUDED
/* end file simdjson/nonstd/string_view.hpp */
SIMDJSON_POP_DISABLE_WARNINGS

namespace std {
  using string_view = nonstd::string_view;
}
#endif // SIMDJSON_HAS_STRING_VIEW
#undef SIMDJSON_HAS_STRING_VIEW // We are not going to need this macro anymore.

/// If EXPR is an error, returns it.
#define SIMDJSON_TRY(EXPR) { auto _err = (EXPR); if (_err) { return _err; } }

// Unless the programmer has already set SIMDJSON_DEVELOPMENT_CHECKS,
// we want to set it under debug builds. We detect a debug build
// under Visual Studio when the _DEBUG macro is set. Under the other
// compilers, we use the fact that they define __OPTIMIZE__ whenever
// they allow optimizations.
// It is possible that this could miss some cases where SIMDJSON_DEVELOPMENT_CHECKS
// is helpful, but the programmer can set the macro SIMDJSON_DEVELOPMENT_CHECKS.
// It could also wrongly set SIMDJSON_DEVELOPMENT_CHECKS (e.g., if the programmer
// sets _DEBUG in a release build under Visual Studio, or if some compiler fails to
// set the __OPTIMIZE__ macro).
// We make it so that if NDEBUG is defined, then SIMDJSON_DEVELOPMENT_CHECKS
// is not defined, irrespective of the compiler.
// We recommend that users set NDEBUG in release builds, so that
// SIMDJSON_DEVELOPMENT_CHECKS is not defined in release builds by default,
// irrespective of the compiler.
#ifndef SIMDJSON_DEVELOPMENT_CHECKS
#ifdef _MSC_VER
// Visual Studio seems to set _DEBUG for debug builds.
// We set SIMDJSON_DEVELOPMENT_CHECKS to 1 if _DEBUG is defined
// and NDEBUG is not defined.
#if defined(_DEBUG) && !defined(NDEBUG)
#define SIMDJSON_DEVELOPMENT_CHECKS 1
#endif // _DEBUG
#else // _MSC_VER
// All other compilers appear to set __OPTIMIZE__ to a positive integer
// when the compiler is optimizing.
// We only set SIMDJSON_DEVELOPMENT_CHECKS if both __OPTIMIZE__
// and NDEBUG are not defined.
#if !defined(__OPTIMIZE__) && !defined(NDEBUG)
#define SIMDJSON_DEVELOPMENT_CHECKS 1
#endif // __OPTIMIZE__
#endif // _MSC_VER
#endif // SIMDJSON_DEVELOPMENT_CHECKS

// The SIMDJSON_CHECK_EOF macro is a feature flag for the "don't require padding"
// feature.

#if SIMDJSON_CPLUSPLUS17
// if we have C++, then fallthrough is a default attribute
# define simdjson_fallthrough [[fallthrough]]
// check if we have __attribute__ support
#elif defined(__has_attribute)
// check if we have the __fallthrough__ attribute
#if __has_attribute(__fallthrough__)
// we are good to go:
# define simdjson_fallthrough                    __attribute__((__fallthrough__))
#endif // __has_attribute(__fallthrough__)
#endif // SIMDJSON_CPLUSPLUS17
// on some systems, we simply do not have support for fallthrough, so use a default:
#ifndef simdjson_fallthrough
# define simdjson_fallthrough do {} while (0)  /* fallthrough */
#endif // simdjson_fallthrough

#if SIMDJSON_DEVELOPMENT_CHECKS
#define SIMDJSON_DEVELOPMENT_ASSERT(expr) do { assert ((expr)); } while (0)
#else
#define SIMDJSON_DEVELOPMENT_ASSERT(expr) do { } while (0)
#endif

#ifndef SIMDJSON_UTF8VALIDATION
#define SIMDJSON_UTF8VALIDATION 1
#endif

#ifdef __has_include
// How do we detect that a compiler supports vbmi2?
// For sure if the following header is found, we are ok?
#if __has_include(<avx512vbmi2intrin.h>)
#define SIMDJSON_COMPILER_SUPPORTS_VBMI2 1
#endif
#endif

#ifdef _MSC_VER
#if _MSC_VER >= 1920
// Visual Studio 2019 and up support VBMI2 under x64 even if the header
// avx512vbmi2intrin.h is not found.
#define SIMDJSON_COMPILER_SUPPORTS_VBMI2 1
#endif
#endif

// By default, we allow AVX512.
#ifndef SIMDJSON_AVX512_ALLOWED
#define SIMDJSON_AVX512_ALLOWED 1
#endif


#ifndef __has_cpp_attribute
#define simdjson_lifetime_bound
#elif __has_cpp_attribute(msvc::lifetimebound)
#define simdjson_lifetime_bound [[msvc::lifetimebound]]
#elif __has_cpp_attribute(clang::lifetimebound)
#define simdjson_lifetime_bound [[clang::lifetimebound]]
#elif __has_cpp_attribute(lifetimebound)
#define simdjson_lifetime_bound [[lifetimebound]]
#else
#define simdjson_lifetime_bound
#endif
#endif // SIMDJSON_COMMON_DEFS_H
/* end file simdjson/common_defs.h */

// This provides the public API for simdjson.
// DOM and ondemand are amalgamated separately, in simdjson.h
/* including simdjson/simdjson_version.h: #include "simdjson/simdjson_version.h" */
/* begin file simdjson/simdjson_version.h */
// /include/simdjson/simdjson_version.h automatically generated by release.py,
// do not change by hand
#ifndef SIMDJSON_SIMDJSON_VERSION_H
#define SIMDJSON_SIMDJSON_VERSION_H

/** The version of simdjson being used (major.minor.revision) */
#define SIMDJSON_VERSION "4.2.4"

namespace simdjson {
enum {
  /**
   * The major version (MAJOR.minor.revision) of simdjson being used.
   */
  SIMDJSON_VERSION_MAJOR = 4,
  /**
   * The minor version (major.MINOR.revision) of simdjson being used.
   */
  SIMDJSON_VERSION_MINOR = 2,
  /**
   * The revision (major.minor.REVISION) of simdjson being used.
   */
  SIMDJSON_VERSION_REVISION = 4
};
} // namespace simdjson

#endif // SIMDJSON_SIMDJSON_VERSION_H
/* end file simdjson/simdjson_version.h */

/* including simdjson/base.h: #include "simdjson/base.h" */
/* begin file simdjson/base.h */
/**
 * @file Base declarations for all simdjson headers
 * @private
 */
#ifndef SIMDJSON_BASE_H
#define SIMDJSON_BASE_H

/* skipped duplicate #include "simdjson/common_defs.h" */
/* skipped duplicate #include "simdjson/compiler_check.h" */
/* including simdjson/error.h: #include "simdjson/error.h" */
/* begin file simdjson/error.h */
#ifndef SIMDJSON_ERROR_H
#define SIMDJSON_ERROR_H

/* skipped duplicate #include "simdjson/base.h" */

#include <string>
#include <ostream>

namespace simdjson {

/**
 * All possible errors returned by simdjson. These error codes are subject to change
 * and not all simdjson kernel returns the same error code given the same input: it is not
 * well defined which error a given input should produce.
 *
 * Only SUCCESS evaluates to false as a Boolean. All other error codes will evaluate
 * to true as a Boolean.
 */
enum error_code {
  SUCCESS = 0,                ///< No error
  CAPACITY,                   ///< This parser can't support a document that big
  MEMALLOC,                   ///< Error allocating memory, most likely out of memory
  TAPE_ERROR,                 ///< Something went wrong, this is a generic error. Fatal/unrecoverable error.
  DEPTH_ERROR,                ///< Your document exceeds the user-specified depth limitation
  STRING_ERROR,               ///< Problem while parsing a string
  T_ATOM_ERROR,               ///< Problem while parsing an atom starting with the letter 't'
  F_ATOM_ERROR,               ///< Problem while parsing an atom starting with the letter 'f'
  N_ATOM_ERROR,               ///< Problem while parsing an atom starting with the letter 'n'
  NUMBER_ERROR,               ///< Problem while parsing a number
  BIGINT_ERROR,               ///< The integer value exceeds 64 bits
  UTF8_ERROR,                 ///< the input is not valid UTF-8
  UNINITIALIZED,              ///< unknown error, or uninitialized document
  EMPTY,                      ///< no structural element found
  UNESCAPED_CHARS,            ///< found unescaped characters in a string.
  UNCLOSED_STRING,            ///< missing quote at the end
  UNSUPPORTED_ARCHITECTURE,   ///< unsupported architecture
  INCORRECT_TYPE,             ///< JSON element has a different type than user expected
  NUMBER_OUT_OF_RANGE,        ///< JSON number does not fit in 64 bits
  INDEX_OUT_OF_BOUNDS,        ///< JSON array index too large
  NO_SUCH_FIELD,              ///< JSON field not found in object
  IO_ERROR,                   ///< Error reading a file
  INVALID_JSON_POINTER,       ///< Invalid JSON pointer syntax
  INVALID_URI_FRAGMENT,       ///< Invalid URI fragment
  UNEXPECTED_ERROR,           ///< indicative of a bug in simdjson
  PARSER_IN_USE,              ///< parser is already in use.
  OUT_OF_ORDER_ITERATION,     ///< tried to iterate an array or object out of order (checked when SIMDJSON_DEVELOPMENT_CHECKS=1)
  INSUFFICIENT_PADDING,       ///< The JSON doesn't have enough padding for simdjson to safely parse it.
  INCOMPLETE_ARRAY_OR_OBJECT, ///< The document ends early. Fatal/unrecoverable error.
  SCALAR_DOCUMENT_AS_VALUE,   ///< A scalar document is treated as a value.
  OUT_OF_BOUNDS,              ///< Attempted to access location outside of document.
  TRAILING_CONTENT,           ///< Unexpected trailing content in the JSON input
  OUT_OF_CAPACITY,            ///< The capacity was exceeded, we cannot allocate enough memory.
  NUM_ERROR_CODES             ///< Placeholder for end of error code list.
};

/**
 * Some errors are fatal and invalidate the document. This function returns true if the
 * error is fatal. It returns true for TAPE_ERROR and INCOMPLETE_ARRAY_OR_OBJECT.
 * Once a fatal error is encountered, the on-demand document is no longer valid and
 * processing should stop.
 */
 inline bool is_fatal(error_code error) noexcept;

/**
 * It is the convention throughout the code that  the macro SIMDJSON_DEVELOPMENT_CHECKS determines whether
 * we check for OUT_OF_ORDER_ITERATION. The logic behind it is that these errors only occurs when the code
 * that was written while breaking some simdjson::ondemand requirement. They should not occur in released
 * code after these issues were fixed.
 */

/**
 * Get the error message for the given error code.
 *
 *   dom::parser parser;
 *   dom::element doc;
 *   auto error = parser.parse("foo",3).get(doc);
 *   if (error) { printf("Error: %s\n", error_message(error)); }
 *
 * @return The error message.
 */
inline const char *error_message(error_code error) noexcept;

/**
 * Write the error message to the output stream
 */
inline std::ostream& operator<<(std::ostream& out, error_code error) noexcept;

/**
 * Exception thrown when an exception-supporting simdjson method is called
 */
struct simdjson_error : public std::exception {
  /**
   * Create an exception from a simdjson error code.
   * @param error The error code
   */
  simdjson_error(error_code error) noexcept : _error{error} { }
  /** The error message */
  const char *what() const noexcept override { return error_message(error()); }
  /** The error code */
  error_code error() const noexcept { return _error; }
private:
  /** The error code that was used */
  error_code _error;
};

namespace internal {

/**
 * The result of a simdjson operation that could fail.
 *
 * IMPORTANT: For the ondemand API, we use implementation_simdjson_result_base<T> as a base class
 * to avoid some compilation issue. Thus, if you modify this class, please ensure that the ondemand
 * implementation_simdjson_result_base<T> is also modified.
 *
 * Gives the option of reading error codes, or throwing an exception by casting to the desired result.
 *
 * This is a base class for implementations that want to add functions to the result type for
 * chaining.
 *
 * Override like:
 *
 *   struct simdjson_result<T> : public internal::simdjson_result_base<T> {
 *     simdjson_result() noexcept : internal::simdjson_result_base<T>() {}
 *     simdjson_result(error_code error) noexcept : internal::simdjson_result_base<T>(error) {}
 *     simdjson_result(T &&value) noexcept : internal::simdjson_result_base<T>(std::forward(value)) {}
 *     simdjson_result(T &&value, error_code error) noexcept : internal::simdjson_result_base<T>(value, error) {}
 *     // Your extra methods here
 *   }
 *
 * Then any method returning simdjson_result<T> will be chainable with your methods.
 */
template<typename T>
struct simdjson_result_base : protected std::pair<T, error_code> {

  /**
   * Create a new empty result with error = UNINITIALIZED.
   */
  simdjson_inline simdjson_result_base() noexcept;

  /**
   * Create a new error result.
   */
  simdjson_inline simdjson_result_base(error_code error) noexcept;

  /**
   * Create a new successful result.
   */
  simdjson_inline simdjson_result_base(T &&value) noexcept;

  /**
   * Create a new result with both things (use if you don't want to branch when creating the result).
   */
  simdjson_inline simdjson_result_base(T &&value, error_code error) noexcept;

  /**
   * Move the value and the error to the provided variables.
   *
   * @param value The variable to assign the value to. May not be set if there is an error.
   * @param error The variable to assign the error to. Set to SUCCESS if there is no error.
   */
  simdjson_inline void tie(T &value, error_code &error) && noexcept;

  /**
   * Move the value to the provided variable.
   *
   * @param value The variable to assign the value to. May not be set if there is an error.
   */
  simdjson_inline error_code get(T &value) && noexcept;

  /**
   * The error.
   */
  simdjson_inline error_code error() const noexcept;

  /**
   * Whether there is a value.
   */
  simdjson_inline bool has_value() const noexcept;
#if SIMDJSON_EXCEPTIONS

  /**
   * Dereference operator to access the contained value.
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline T& operator*() &  noexcept(false);
  simdjson_inline T&& operator*() &&  noexcept(false);
  /**
   * Arrow operator to access members of the contained value.
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline T* operator->() noexcept(false);
  simdjson_inline const T* operator->() const noexcept(false);

  /**
   * Get the result value.
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline T& value() & noexcept(false);

  /**
   * Take the result value (move it).
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline T&& value() && noexcept(false);

  /**
   * Take the result value (move it).
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline T&& take_value() && noexcept(false);

  /**
   * Cast to the value (will throw on error).
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline operator T&&() && noexcept(false);

#endif // SIMDJSON_EXCEPTIONS

  /**
   * Get the result value. This function is safe if and only
   * the error() method returns a value that evaluates to false.
   * We discourage the use of value_unsafe().
   *
   * The recommended pattern is:
   *
   * T value; // where T is the type
   * auto error = result.get(value);
   * if (error) {
   *   // handle error
   * }
   *
   * Or you may call 'value()' which will raise an exception
   * in case of error:
   *
   * T value = result.value();
   */
  simdjson_inline const T& value_unsafe() const& noexcept;

  /**
   * Take the result value (move it). This function is safe if and only
   * the error() method returns a value that evaluates to false.
   * We discourage the use of value_unsafe().
   *
   * The recommended pattern is:
   *
   * T value; // where T is the type
   * auto error = result.get(value);
   * if (error) {
   *   // handle error, return, exit, abort
   * } else {
   *   // use value here.
   * }
   *
   * Or you may call 'value()' which will raise an exception
   * in case of error:
   *
   * T value = result.value();
   */
  simdjson_inline T&& value_unsafe() && noexcept;

  using value_type = T;
  using error_type = error_code;
}; // struct simdjson_result_base

} // namespace internal

/**
 * The result of a simdjson operation that could fail.
 *
 * Gives the option of reading error codes, or throwing an exception by casting to the desired result.
 */
template<typename T>
struct simdjson_result : public internal::simdjson_result_base<T> {

  /**
   * @private Create a new empty result with error = UNINITIALIZED.
   */
  simdjson_inline simdjson_result() noexcept;
  /**
   * @private Create a new successful result.
   */
  simdjson_inline simdjson_result(T &&value) noexcept;
  /**
   * @private Create a new error result.
   */
  simdjson_inline simdjson_result(error_code error_code) noexcept;
  /**
   * @private Create a new result with both things (use if you don't want to branch when creating the result).
   */
  simdjson_inline simdjson_result(T &&value, error_code error) noexcept;

  /**
   * Move the value and the error to the provided variables.
   *
   * @param value The variable to assign the value to. May not be set if there is an error.
   * @param error The variable to assign the error to. Set to SUCCESS if there is no error.
   */
  simdjson_inline void tie(T &value, error_code &error) && noexcept;

  /**
   * Move the value to the provided variable.
   *
   * @param value The variable to assign the value to. May not be set if there is an error.
   */
  simdjson_warn_unused simdjson_inline error_code get(T &value) && noexcept;

  /**
   * Copy the value to a provided std::string, only enabled for std::string_view.
   *
   * @param value The variable to assign the value to. May not be set if there is an error.
   */
  template <typename U = T>
  simdjson_warn_unused simdjson_inline error_code get(std::string &value) && noexcept {
    static_assert(std::is_same<U, std::string_view>::value, "SFINAE");
    std::string_view v;
    error_code error = std::forward<simdjson_result<T>>(*this).get(v);
    if (!error) {
      value.assign(v.data(), v.size());
    }
    return error;
  }

  /**
   * The error.
   */
  simdjson_inline error_code error() const noexcept;



#if SIMDJSON_EXCEPTIONS
  using internal::simdjson_result_base<T>::operator*;
  using internal::simdjson_result_base<T>::operator->;
  /**
   * Get the result value.
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline T& value() & noexcept(false);

  /**
   * Take the result value (move it).
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline T&& value() && noexcept(false);

  /**
   * Take the result value (move it).
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline T&& take_value() && noexcept(false);

  /**
   * Cast to the value (will throw on error).
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline operator T&&() && noexcept(false);
#endif // SIMDJSON_EXCEPTIONS

  /**
   * Get the result value. This function is safe if and only
   * the error() method returns a value that evaluates to false.
   */
  simdjson_inline const T& value_unsafe() const& noexcept;

  /**
   * Take the result value (move it). This function is safe if and only
   * the error() method returns a value that evaluates to false.
   */
  simdjson_inline T&& value_unsafe() && noexcept;

  using value_type = T;
  using error_type = error_code;
}; // struct simdjson_result

#if SIMDJSON_EXCEPTIONS

template<typename T>
inline std::ostream& operator<<(std::ostream& out, simdjson_result<T> value) { return out << value.value(); }
#endif // SIMDJSON_EXCEPTIONS

#ifndef SIMDJSON_DISABLE_DEPRECATED_API
/**
 * @deprecated This is an alias and will be removed, use error_code instead
 */
using ErrorValues [[deprecated("This is an alias and will be removed, use error_code instead")]] = error_code;

/**
 * @deprecated Error codes should be stored and returned as `error_code`, use `error_message()` instead.
 */
[[deprecated("Error codes should be stored and returned as `error_code`, use `error_message()` instead.")]]
inline const std::string error_message(int error) noexcept;
#endif // SIMDJSON_DISABLE_DEPRECATED_API
} // namespace simdjson

#endif // SIMDJSON_ERROR_H
/* end file simdjson/error.h */
/* skipped duplicate #include "simdjson/portability.h" */
/* including simdjson/concepts.h: #include "simdjson/concepts.h" */
/* begin file simdjson/concepts.h */
#ifndef SIMDJSON_CONCEPTS_H
#define SIMDJSON_CONCEPTS_H
#if SIMDJSON_SUPPORTS_CONCEPTS

#include <concepts>
#include <type_traits>

namespace simdjson {
namespace concepts {

namespace details {
#define SIMDJSON_IMPL_CONCEPT(name, method)                                    \
  template <typename T>                                                        \
  concept supports_##name = !std::is_const_v<T> && requires {                  \
    typename std::remove_cvref_t<T>::value_type;                               \
    requires requires(typename std::remove_cvref_t<T>::value_type &&val,       \
                      T obj) {                                                 \
      obj.method(std::move(val));                                              \
      requires !requires { obj = std::move(val); };                            \
    };                                                                         \
  };

SIMDJSON_IMPL_CONCEPT(emplace_back, emplace_back)
SIMDJSON_IMPL_CONCEPT(emplace, emplace)
SIMDJSON_IMPL_CONCEPT(push_back, push_back)
SIMDJSON_IMPL_CONCEPT(add, add)
SIMDJSON_IMPL_CONCEPT(push, push)
SIMDJSON_IMPL_CONCEPT(append, append)
SIMDJSON_IMPL_CONCEPT(insert, insert)
SIMDJSON_IMPL_CONCEPT(op_append, operator+=)

#undef SIMDJSON_IMPL_CONCEPT
} // namespace details

template <typename T>
concept is_pair = requires { typename T::first_type; typename T::second_type; } &&
                  std::same_as<T, std::pair<typename T::first_type, typename T::second_type>>;
template <typename T>
concept string_view_like = std::is_convertible_v<T, std::string_view> &&
                           !std::is_convertible_v<T, const char*>;

template<typename T>
concept constructible_from_string_view = std::is_constructible_v<T, std::string_view>
                                        && !std::is_same_v<T, std::string_view>
                                        && std::is_default_constructible_v<T>;

template<typename M>
concept string_view_keyed_map = string_view_like<typename M::key_type>
              && requires(std::remove_cvref_t<M>& m, typename M::key_type sv, typename M::mapped_type v) {
    { m.emplace(sv, v) } -> std::same_as<std::pair<typename M::iterator, bool>>;
};

/// Check if T is a container that we can append to, including:
///   std::vector, std::deque, std::list, std::string, ...
template <typename T>
concept appendable_containers =
    (details::supports_emplace_back<T> || details::supports_emplace<T> ||
    details::supports_push_back<T> || details::supports_push<T> ||
    details::supports_add<T> || details::supports_append<T> ||
    details::supports_insert<T>) && !string_view_keyed_map<T>;

/// Insert into the container however possible
template <appendable_containers T, typename... Args>
constexpr decltype(auto) emplace_one(T &vec, Args &&...args) {
  if constexpr (details::supports_emplace_back<T>) {
    return vec.emplace_back(std::forward<Args>(args)...);
  } else if constexpr (details::supports_emplace<T>) {
    return vec.emplace(std::forward<Args>(args)...);
  } else if constexpr (details::supports_push_back<T>) {
    return vec.push_back(std::forward<Args>(args)...);
  } else if constexpr (details::supports_push<T>) {
    return vec.push(std::forward<Args>(args)...);
  } else if constexpr (details::supports_add<T>) {
    return vec.add(std::forward<Args>(args)...);
  } else if constexpr (details::supports_append<T>) {
    return vec.append(std::forward<Args>(args)...);
  } else if constexpr (details::supports_insert<T>) {
    return vec.insert(std::forward<Args>(args)...);
  } else if constexpr (details::supports_op_append<T> && sizeof...(Args) == 1) {
    return vec.operator+=(std::forward<Args>(args)...);
  } else {
    static_assert(!sizeof(T *),
                  "We don't know how to add things to this container");
  }
}

/// This checks if the container will return a reference to the newly added
/// element after an insert which for example `std::vector::emplace_back` does
/// since C++17; this will allow some optimizations.
template <typename T>
concept returns_reference = appendable_containers<T> && requires {
  typename std::remove_cvref_t<T>::reference;
  requires requires(typename std::remove_cvref_t<T>::value_type &&val, T obj) {
    {
      emplace_one(obj, std::move(val))
    } -> std::same_as<typename std::remove_cvref_t<T>::reference>;
  };
};

template <typename T>
concept smart_pointer = requires(std::remove_cvref_t<T> ptr) {
  // Check if T has a member type named element_type
  typename std::remove_cvref_t<T>::element_type;

  // Check if T has a get() member function
  {
    ptr.get()
  } -> std::same_as<typename std::remove_cvref_t<T>::element_type *>;

  // Check if T can be dereferenced
  { *ptr } -> std::same_as<typename std::remove_cvref_t<T>::element_type &>;
};

template <typename T>
concept optional_type = requires(std::remove_cvref_t<T> obj) {
  typename std::remove_cvref_t<T>::value_type;
  { obj.value() } -> std::same_as<typename std::remove_cvref_t<T>::value_type&>;
  requires requires(typename std::remove_cvref_t<T>::value_type &&val) {
    obj.emplace(std::move(val));
    {
      obj.value_or(val)
    } -> std::convertible_to<typename std::remove_cvref_t<T>::value_type>;
  };
  { static_cast<bool>(obj) } -> std::same_as<bool>; // convertible to bool
  { obj.reset() } noexcept -> std::same_as<void>;
};



// Types we serialize as JSON strings (not as containers)
template <typename T>
concept string_like =
  std::is_same_v<std::remove_cvref_t<T>, std::string> ||
  std::is_same_v<std::remove_cvref_t<T>, std::string_view> ||
  std::is_same_v<std::remove_cvref_t<T>, const char*> ||
  std::is_same_v<std::remove_cvref_t<T>, char*>;

// Concept that checks if a type is a container but not a string (because
// strings handling must be handled differently)
// Now uses iterator-based approach for broader container support
template <typename T>
concept container_but_not_string =
  std::ranges::input_range<T> && !string_like<T> && !concepts::string_view_keyed_map<T>;



// Concept: Indexable container that is not a string or associative container
// Accepts: std::vector, std::array, std::deque (have operator[], value_type, not string_like)
// Rejects: std::string (string_like), std::list (no operator[]), std::map (has key_type)
template<typename Container>
concept indexable_container = requires {
  typename Container::value_type;
  requires !concepts::string_like<Container>;
  requires !requires { typename Container::key_type; };  // Reject maps/sets
  requires requires(Container& c, std::size_t i) {
    { c[i] } -> std::convertible_to<typename Container::value_type>;
  };
};


// Variable template to use with std::meta::substitute
template<typename Container>
constexpr bool indexable_container_v = indexable_container<Container>;

} // namespace concepts


/**
 * We use tag_invoke as our customization point mechanism.
 */
template <typename Tag, typename... Args>
concept tag_invocable = requires(Tag tag, Args... args) {
  tag_invoke(std::forward<Tag>(tag), std::forward<Args>(args)...);
};

template <typename Tag, typename... Args>
concept nothrow_tag_invocable =
    tag_invocable<Tag, Args...> && requires(Tag tag, Args... args) {
      {
        tag_invoke(std::forward<Tag>(tag), std::forward<Args>(args)...)
      } noexcept;
    };

} // namespace simdjson
#endif // SIMDJSON_SUPPORTS_CONCEPTS
#endif // SIMDJSON_CONCEPTS_H
/* end file simdjson/concepts.h */
/* including simdjson/constevalutil.h: #include "simdjson/constevalutil.h" */
/* begin file simdjson/constevalutil.h */
#ifndef SIMDJSON_CONSTEVALUTIL_H
#define SIMDJSON_CONSTEVALUTIL_H

#include <string>
#include <string_view>
#include <array>

namespace simdjson {
namespace constevalutil {
#if SIMDJSON_CONSTEVAL

constexpr static std::array<uint8_t, 256> json_quotable_character = {
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
constexpr static std::array<std::string_view, 32> control_chars = {
    "\\u0000", "\\u0001", "\\u0002", "\\u0003", "\\u0004", "\\u0005", "\\u0006",
    "\\u0007", "\\b", "\\t",     "\\n",     "\\u000b", "\\f",     "\\r",
    "\\u000e", "\\u000f", "\\u0010", "\\u0011", "\\u0012", "\\u0013", "\\u0014",
    "\\u0015", "\\u0016", "\\u0017", "\\u0018", "\\u0019", "\\u001a", "\\u001b",
    "\\u001c", "\\u001d", "\\u001e", "\\u001f"};
// unoptimized, meant for compile-time execution
consteval std::string consteval_to_quoted_escaped(std::string_view input) {
  std::string out = "\"";
  for (char c : input) {
    if (json_quotable_character[uint8_t(c)]) {
      if (c == '"') {
        out.append("\\\"");
      } else if (c == '\\') {
        out.append("\\\\");
      } else {
        std::string_view v = control_chars[uint8_t(c)];
        out.append(v);
      }
    } else {
      out.push_back(c);
    }
  }
  out.push_back('"');
  return out;
}
#endif  // SIMDJSON_CONSTEVAL


#if SIMDJSON_SUPPORTS_CONCEPTS
template <size_t N>
struct fixed_string {
    constexpr fixed_string(const char (&str)[N])  {
        for (std::size_t i = 0; i < N; ++i) {
            data[i] = str[i];
        }
    }
    char data[N];
    constexpr std::string_view view() const { return {data, N - 1}; }
    constexpr size_t size() const { return N ; }
    constexpr operator std::string_view() const { return view(); }
    constexpr char operator[](std::size_t index) const { return data[index]; }
    constexpr bool operator==(const fixed_string& other) const {
        if (N != other.size()) {
            return false;
        }
        for (std::size_t i = 0; i < N; ++i) {
            if (data[i] != other.data[i]) {
                return false;
            }
        }
        return true;
    }
};
template <std::size_t N>
fixed_string(const char (&)[N]) -> fixed_string<N>;

template <fixed_string str>
struct string_constant {
    static constexpr std::string_view value = str.view();
};
#endif // SIMDJSON_SUPPORTS_CONCEPTS

} // namespace constevalutil
} // namespace simdjson
#endif // SIMDJSON_CONSTEVALUTIL_H
/* end file simdjson/constevalutil.h */

/**
 * @brief The top level simdjson namespace, containing everything the library provides.
 */
namespace simdjson {

SIMDJSON_PUSH_DISABLE_UNUSED_WARNINGS

/** The maximum document size supported by simdjson. */
constexpr size_t SIMDJSON_MAXSIZE_BYTES = 0xFFFFFFFF;

/**
 * The amount of padding needed in a buffer to parse JSON.
 *
 * The input buf should be readable up to buf + SIMDJSON_PADDING
 * this is a stopgap; there should be a better description of the
 * main loop and its behavior that abstracts over this
 * See https://github.com/simdjson/simdjson/issues/174
 */
constexpr size_t SIMDJSON_PADDING = 64;

/**
 * By default, simdjson supports this many nested objects and arrays.
 *
 * This is the default for parser::max_depth().
 */
constexpr size_t DEFAULT_MAX_DEPTH = 1024;

SIMDJSON_POP_DISABLE_UNUSED_WARNINGS

class implementation;
struct padded_string;
class padded_string_view;
enum class stage1_mode;

namespace internal {

template<typename T>
class atomic_ptr;
class dom_parser_implementation;
class escape_json_string;
class tape_ref;
struct value128;
enum class tape_type;

} // namespace internal
} // namespace simdjson

#endif // SIMDJSON_BASE_H
/* end file simdjson/base.h */

/* skipped duplicate #include "simdjson/error.h" */
/* including simdjson/error-inl.h: #include "simdjson/error-inl.h" */
/* begin file simdjson/error-inl.h */
#ifndef SIMDJSON_ERROR_INL_H
#define SIMDJSON_ERROR_INL_H

/* skipped duplicate #include "simdjson/error.h" */

#include <iostream>

namespace simdjson {

inline bool is_fatal(error_code error) noexcept {
  return error == TAPE_ERROR || error == INCOMPLETE_ARRAY_OR_OBJECT;
}

namespace internal {
  // We store the error code so we can validate the error message is associated with the right code
  struct error_code_info {
    error_code code;
    const char* message; // do not use a fancy std::string where a simple C string will do (no alloc, no destructor)
  };
  // These MUST match the codes in error_code. We check this constraint in basictests.
  extern SIMDJSON_DLLIMPORTEXPORT const error_code_info error_codes[];
} // namespace internal


inline const char *error_message(error_code error) noexcept {
  // If you're using error_code, we're trusting you got it from the enum.
  return internal::error_codes[int(error)].message;
}

// deprecated function
#ifndef SIMDJSON_DISABLE_DEPRECATED_API
inline const std::string error_message(int error) noexcept {
  if (error < 0 || error >= error_code::NUM_ERROR_CODES) {
    return internal::error_codes[UNEXPECTED_ERROR].message;
  }
  return internal::error_codes[error].message;
}
#endif // SIMDJSON_DISABLE_DEPRECATED_API

inline std::ostream& operator<<(std::ostream& out, error_code error) noexcept {
  return out << error_message(error);
}

namespace internal {

//
// internal::simdjson_result_base<T> inline implementation
//

template<typename T>
simdjson_inline void simdjson_result_base<T>::tie(T &value, error_code &error) && noexcept {
  error = this->second;
  if (!error) {
    value = std::forward<simdjson_result_base<T>>(*this).first;
  }
}

template<typename T>
simdjson_warn_unused simdjson_inline error_code simdjson_result_base<T>::get(T &value) && noexcept {
  error_code error;
  std::forward<simdjson_result_base<T>>(*this).tie(value, error);
  return error;
}

template<typename T>
simdjson_inline error_code simdjson_result_base<T>::error() const noexcept {
  return this->second;
}


template<typename T>
simdjson_inline bool simdjson_result_base<T>::has_value() const noexcept {
  return this->error() == SUCCESS;
}

#if SIMDJSON_EXCEPTIONS


template<typename T>
simdjson_inline T& simdjson_result_base<T>::operator*() &  noexcept(false) {
  return this->value();
}

template<typename T>
simdjson_inline T&& simdjson_result_base<T>::operator*() &&  noexcept(false) {
  return std::forward<internal::simdjson_result_base<T>>(*this).value();
}

template<typename T>
simdjson_inline T* simdjson_result_base<T>::operator->() noexcept(false) {
  if (this->error()) { throw simdjson_error(this->error()); }
  return &this->first;
}


template<typename T>
simdjson_inline const T* simdjson_result_base<T>::operator->() const noexcept(false) {
  if (this->error()) { throw simdjson_error(this->error()); }
  return &this->first;
}

template<typename T>
simdjson_inline T& simdjson_result_base<T>::value() & noexcept(false) {
  if (error()) { throw simdjson_error(error()); }
  return this->first;
}

template<typename T>
simdjson_inline T&& simdjson_result_base<T>::value() && noexcept(false) {
  return std::forward<simdjson_result_base<T>>(*this).take_value();
}

template<typename T>
simdjson_inline T&& simdjson_result_base<T>::take_value() && noexcept(false) {
  if (error()) { throw simdjson_error(error()); }
  return std::forward<T>(this->first);
}

template<typename T>
simdjson_inline simdjson_result_base<T>::operator T&&() && noexcept(false) {
  return std::forward<simdjson_result_base<T>>(*this).take_value();
}

#endif // SIMDJSON_EXCEPTIONS


template<typename T>
simdjson_inline const T& simdjson_result_base<T>::value_unsafe() const& noexcept {
  return this->first;
}

template<typename T>
simdjson_inline T&& simdjson_result_base<T>::value_unsafe() && noexcept {
  return std::forward<T>(this->first);
}

template<typename T>
simdjson_inline simdjson_result_base<T>::simdjson_result_base(T &&value, error_code error) noexcept
    : std::pair<T, error_code>(std::forward<T>(value), error) {}
template<typename T>
simdjson_inline simdjson_result_base<T>::simdjson_result_base(error_code error) noexcept
    : simdjson_result_base(T{}, error) {}
template<typename T>
simdjson_inline simdjson_result_base<T>::simdjson_result_base(T &&value) noexcept
    : simdjson_result_base(std::forward<T>(value), SUCCESS) {}
template<typename T>
simdjson_inline simdjson_result_base<T>::simdjson_result_base() noexcept
    : simdjson_result_base(T{}, UNINITIALIZED) {}

} // namespace internal

///
/// simdjson_result<T> inline implementation
///

template<typename T>
simdjson_inline void simdjson_result<T>::tie(T &value, error_code &error) && noexcept {
  std::forward<internal::simdjson_result_base<T>>(*this).tie(value, error);
}

template<typename T>
simdjson_warn_unused simdjson_inline error_code
simdjson_result<T>::get(T &value) && noexcept {
  return std::forward<internal::simdjson_result_base<T>>(*this).get(value);
}

template<typename T>
simdjson_inline error_code simdjson_result<T>::error() const noexcept {
  return internal::simdjson_result_base<T>::error();
}

#if SIMDJSON_EXCEPTIONS

template<typename T>
simdjson_inline T& simdjson_result<T>::value() & noexcept(false) {
  return internal::simdjson_result_base<T>::value();
}

template<typename T>
simdjson_inline T&& simdjson_result<T>::value() && noexcept(false) {
  return std::forward<internal::simdjson_result_base<T>>(*this).value();
}

template<typename T>
simdjson_inline T&& simdjson_result<T>::take_value() && noexcept(false) {
  return std::forward<internal::simdjson_result_base<T>>(*this).take_value();
}

template<typename T>
simdjson_inline simdjson_result<T>::operator T&&() && noexcept(false) {
  return std::forward<internal::simdjson_result_base<T>>(*this).take_value();
}

#endif // SIMDJSON_EXCEPTIONS

template<typename T>
simdjson_inline const T& simdjson_result<T>::value_unsafe() const& noexcept {
  return internal::simdjson_result_base<T>::value_unsafe();
}

template<typename T>
simdjson_inline T&& simdjson_result<T>::value_unsafe() && noexcept {
  return std::forward<internal::simdjson_result_base<T>>(*this).value_unsafe();
}

template<typename T>
simdjson_inline simdjson_result<T>::simdjson_result(T &&value, error_code error) noexcept
    : internal::simdjson_result_base<T>(std::forward<T>(value), error) {}
template<typename T>
simdjson_inline simdjson_result<T>::simdjson_result(error_code error) noexcept
    : internal::simdjson_result_base<T>(error) {}
template<typename T>
simdjson_inline simdjson_result<T>::simdjson_result(T &&value) noexcept
    : internal::simdjson_result_base<T>(std::forward<T>(value)) {}
template<typename T>
simdjson_inline simdjson_result<T>::simdjson_result() noexcept
    : internal::simdjson_result_base<T>() {}

} // namespace simdjson

#endif // SIMDJSON_ERROR_INL_H
/* end file simdjson/error-inl.h */
/* including simdjson/implementation.h: #include "simdjson/implementation.h" */
/* begin file simdjson/implementation.h */
#ifndef SIMDJSON_IMPLEMENTATION_H
#define SIMDJSON_IMPLEMENTATION_H

/* including simdjson/internal/atomic_ptr.h: #include "simdjson/internal/atomic_ptr.h" */
/* begin file simdjson/internal/atomic_ptr.h */
#ifndef SIMDJSON_INTERNAL_ATOMIC_PTR_H
#define SIMDJSON_INTERNAL_ATOMIC_PTR_H

/* skipped duplicate #include "simdjson/base.h" */
#include <atomic>

namespace simdjson {
namespace internal {

template<typename T>
class atomic_ptr {
public:
  atomic_ptr(T *_ptr) : ptr{_ptr} {}

  operator const T*() const { return ptr.load(); }
  const T& operator*() const { return *ptr; }
  const T* operator->() const { return ptr.load(); }

  operator T*() { return ptr.load(); }
  T& operator*() { return *ptr; }
  T* operator->() { return ptr.load(); }
  atomic_ptr& operator=(T *_ptr) { ptr = _ptr; return *this; }

private:
  std::atomic<T*> ptr;
};

} // namespace internal
} // namespace simdjson

#endif // SIMDJSON_INTERNAL_ATOMIC_PTR_H
/* end file simdjson/internal/atomic_ptr.h */
/* including simdjson/internal/dom_parser_implementation.h: #include "simdjson/internal/dom_parser_implementation.h" */
/* begin file simdjson/internal/dom_parser_implementation.h */
#ifndef SIMDJSON_INTERNAL_DOM_PARSER_IMPLEMENTATION_H
#define SIMDJSON_INTERNAL_DOM_PARSER_IMPLEMENTATION_H

/* skipped duplicate #include "simdjson/base.h" */
/* skipped duplicate #include "simdjson/error.h" */
#include <memory>

namespace simdjson {

namespace dom {
class document;
} // namespace dom

/**
* This enum is used with the dom_parser_implementation::stage1 function.
* 1) The regular mode expects a fully formed JSON document.
* 2) The streaming_partial mode expects a possibly truncated
* input within a stream on JSON documents.
* 3) The stream_final mode allows us to truncate final
* unterminated strings. It is useful in conjunction with streaming_partial.
*/
enum class stage1_mode { regular, streaming_partial, streaming_final};

/**
 * Returns true if mode == streaming_partial or mode == streaming_final
 */
inline bool is_streaming(stage1_mode mode) {
  // performance note: it is probably faster to check that mode is different
  // from regular than checking that it is either streaming_partial or streaming_final.
  return (mode != stage1_mode::regular);
  // return (mode == stage1_mode::streaming_partial || mode == stage1_mode::streaming_final);
}


namespace internal {


/**
 * An implementation of simdjson's DOM parser for a particular CPU architecture.
 *
 * This class is expected to be accessed only by pointer, and never move in memory (though the
 * pointer can move).
 */
class dom_parser_implementation {
public:

  /**
   * @private For internal implementation use
   *
   * Run a full JSON parse on a single document (stage1 + stage2).
   *
   * Guaranteed only to be called when capacity > document length.
   *
   * Overridden by each implementation.
   *
   * @param buf The json document to parse. *MUST* be allocated up to len + SIMDJSON_PADDING bytes.
   * @param len The length of the json document.
   * @return The error code, or SUCCESS if there was no error.
   */
  simdjson_warn_unused virtual error_code parse(const uint8_t *buf, size_t len, dom::document &doc) noexcept = 0;

  /**
   * @private For internal implementation use
   *
   * Stage 1 of the document parser.
   *
   * Guaranteed only to be called when capacity > document length.
   *
   * Overridden by each implementation.
   *
   * @param buf The json document to parse.
   * @param len The length of the json document.
   * @param streaming Whether this is being called by parser::parse_many.
   * @return The error code, or SUCCESS if there was no error.
   */
  simdjson_warn_unused virtual error_code stage1(const uint8_t *buf, size_t len, stage1_mode streaming) noexcept = 0;

  /**
   * @private For internal implementation use
   *
   * Stage 2 of the document parser.
   *
   * Called after stage1().
   *
   * Overridden by each implementation.
   *
   * @param doc The document to output to.
   * @return The error code, or SUCCESS if there was no error.
   */
  simdjson_warn_unused virtual error_code stage2(dom::document &doc) noexcept = 0;

  /**
   * @private For internal implementation use
   *
   * Stage 2 of the document parser for parser::parse_many.
   *
   * Guaranteed only to be called after stage1().
   * Overridden by each implementation.
   *
   * @param doc The document to output to.
   * @return The error code, SUCCESS if there was no error, or EMPTY if all documents have been parsed.
   */
  simdjson_warn_unused virtual error_code stage2_next(dom::document &doc) noexcept = 0;

  /**
   * Unescape a valid UTF-8 string from src to dst, stopping at a final unescaped quote. There
   * must be an unescaped quote terminating the string. It returns the final output
   * position as pointer. In case of error (e.g., the string has bad escaped codes),
   * then null_ptr is returned. It is assumed that the output buffer is large
   * enough. E.g., if src points at 'joe"', then dst needs to have four free bytes +
   * SIMDJSON_PADDING bytes.
   *
   * Overridden by each implementation.
   *
   * @param str pointer to the beginning of a valid UTF-8 JSON string, must end with an unescaped quote.
   * @param dst pointer to a destination buffer, it must point a region in memory of sufficient size.
   * @param allow_replacement whether we allow a replacement character when the UTF-8 contains unmatched surrogate pairs.
   * @return end of the of the written region (exclusive) or nullptr in case of error.
   */
  simdjson_warn_unused virtual uint8_t *parse_string(const uint8_t *src, uint8_t *dst, bool allow_replacement) const noexcept = 0;

  /**
   * Unescape a NON-valid UTF-8 string from src to dst, stopping at a final unescaped quote. There
   * must be an unescaped quote terminating the string. It returns the final output
   * position as pointer. In case of error (e.g., the string has bad escaped codes),
   * then null_ptr is returned. It is assumed that the output buffer is large
   * enough. E.g., if src points at 'joe"', then dst needs to have four free bytes +
   * SIMDJSON_PADDING bytes.
   *
   * Overridden by each implementation.
   *
   * @param str pointer to the beginning of a possibly invalid UTF-8 JSON string, must end with an unescaped quote.
   * @param dst pointer to a destination buffer, it must point a region in memory of sufficient size.
   * @return end of the of the written region (exclusive) or nullptr in case of error.
   */
  simdjson_warn_unused virtual uint8_t *parse_wobbly_string(const uint8_t *src, uint8_t *dst) const noexcept = 0;

  /**
   * Change the capacity of this parser.
   *
   * The capacity can never exceed SIMDJSON_MAXSIZE_BYTES (e.g., 4 GB)
   * and an CAPACITY error is returned if it is attempted.
   *
   * Generally used for reallocation.
   *
   * @param capacity The new capacity.
   * @param max_depth The new max_depth.
   * @return The error code, or SUCCESS if there was no error.
   */
  virtual error_code set_capacity(size_t capacity) noexcept = 0;

  /**
   * Change the max depth of this parser.
   *
   * Generally used for reallocation.
   *
   * @param capacity The new capacity.
   * @param max_depth The new max_depth.
   * @return The error code, or SUCCESS if there was no error.
   */
  virtual error_code set_max_depth(size_t max_depth) noexcept = 0;

  /**
   * Deallocate this parser.
   */
  virtual ~dom_parser_implementation() = default;

  /** Number of structural indices passed from stage 1 to stage 2 */
  uint32_t n_structural_indexes{0};
  /** Structural indices passed from stage 1 to stage 2 */
  std::unique_ptr<uint32_t[]> structural_indexes{};
  /** Next structural index to parse */
  uint32_t next_structural_index{0};

  /**
   * The largest document this parser can support without reallocating.
   *
   * @return Current capacity, in bytes.
   */
  simdjson_pure simdjson_inline size_t capacity() const noexcept;

  /**
   * The maximum level of nested object and arrays supported by this parser.
   *
   * @return Maximum depth, in bytes.
   */
  simdjson_pure simdjson_inline size_t max_depth() const noexcept;

  /**
   * Ensure this parser has enough memory to process JSON documents up to `capacity` bytes in length
   * and `max_depth` depth.
   *
   * @param capacity The new capacity.
   * @param max_depth The new max_depth. Defaults to DEFAULT_MAX_DEPTH.
   * @return The error, if there is one.
   */
  simdjson_warn_unused inline error_code allocate(size_t capacity, size_t max_depth) noexcept;


protected:
  /**
   * The maximum document length this parser supports.
   *
   * Buffers are large enough to handle any document up to this length.
   */
  size_t _capacity{0};

  /**
   * The maximum depth (number of nested objects and arrays) supported by this parser.
   *
   * Defaults to DEFAULT_MAX_DEPTH.
   */
  size_t _max_depth{0};

  // Declaring these so that subclasses can use them to implement their constructors.
  simdjson_inline dom_parser_implementation() noexcept;
  simdjson_inline dom_parser_implementation(dom_parser_implementation &&other) noexcept;
  simdjson_inline dom_parser_implementation &operator=(dom_parser_implementation &&other) noexcept;

  simdjson_inline dom_parser_implementation(const dom_parser_implementation &) noexcept = delete;
  simdjson_inline dom_parser_implementation &operator=(const dom_parser_implementation &other) noexcept = delete;
}; // class dom_parser_implementation

simdjson_inline dom_parser_implementation::dom_parser_implementation() noexcept = default;
simdjson_inline dom_parser_implementation::dom_parser_implementation(dom_parser_implementation &&other) noexcept = default;
simdjson_inline dom_parser_implementation &dom_parser_implementation::operator=(dom_parser_implementation &&other) noexcept = default;

simdjson_pure simdjson_inline size_t dom_parser_implementation::capacity() const noexcept {
  return _capacity;
}

simdjson_pure simdjson_inline size_t dom_parser_implementation::max_depth() const noexcept {
  return _max_depth;
}

simdjson_warn_unused
inline error_code dom_parser_implementation::allocate(size_t capacity, size_t max_depth) noexcept {
  if (this->max_depth() != max_depth) {
    error_code err = set_max_depth(max_depth);
    if (err) { return err; }
  }
  if (_capacity != capacity) {
    error_code err = set_capacity(capacity);
    if (err) { return err; }
  }
  return SUCCESS;
}

} // namespace internal
} // namespace simdjson

#endif // SIMDJSON_INTERNAL_DOM_PARSER_IMPLEMENTATION_H
/* end file simdjson/internal/dom_parser_implementation.h */

#include <memory>

namespace simdjson {

/**
 * Validate the UTF-8 string.
 *
 * @param buf the string to validate.
 * @param len the length of the string in bytes.
 * @return true if the string is valid UTF-8.
 */
simdjson_warn_unused bool validate_utf8(const char * buf, size_t len) noexcept;
/**
 * Validate the UTF-8 string.
 *
 * @param sv the string_view to validate.
 * @return true if the string is valid UTF-8.
 */
simdjson_inline simdjson_warn_unused bool validate_utf8(const std::string_view sv) noexcept {
  return validate_utf8(sv.data(), sv.size());
}

/**
 * Validate the UTF-8 string.
 *
 * @param p the string to validate.
 * @return true if the string is valid UTF-8.
 */
simdjson_inline simdjson_warn_unused bool validate_utf8(const std::string& s) noexcept {
  return validate_utf8(s.data(), s.size());
}

/**
 * An implementation of simdjson for a particular CPU architecture.
 *
 * Also used to maintain the currently active implementation. The active implementation is
 * automatically initialized on first use to the most advanced implementation supported by the host.
 */
class implementation {
public:

  /**
   * The name of this implementation.
   *
   *     const implementation *impl = simdjson::get_active_implementation();
   *     cout << "simdjson is optimized for " << impl->name() << "(" << impl->description() << ")" << endl;
   *
   * @return the name of the implementation, e.g. "haswell", "westmere", "arm64".
   */
  virtual std::string name() const { return std::string(_name); }

  /**
   * The description of this implementation.
   *
   *     const implementation *impl = simdjson::get_active_implementation();
   *     cout << "simdjson is optimized for " << impl->name() << "(" << impl->description() << ")" << endl;
   *
   * @return the description of the implementation, e.g. "Intel/AMD AVX2", "Intel/AMD SSE4.2", "ARM NEON".
   */
  virtual std::string description() const { return std::string(_description); }

  /**
   * The instruction sets this implementation is compiled against
   * and the current CPU match. This function may poll the current CPU/system
   * and should therefore not be called too often if performance is a concern.
   *
   * @return true if the implementation can be safely used on the current system (determined at runtime).
   */
  bool supported_by_runtime_system() const;

  /**
   * @private For internal implementation use
   *
   * The instruction sets this implementation is compiled against.
   *
   * @return a mask of all required `internal::instruction_set::` values.
   */
  virtual uint32_t required_instruction_sets() const { return _required_instruction_sets; }

  /**
   * @private For internal implementation use
   *
   *     const implementation *impl = simdjson::get_active_implementation();
   *     cout << "simdjson is optimized for " << impl->name() << "(" << impl->description() << ")" << endl;
   *
   * @param capacity The largest document that will be passed to the parser.
   * @param max_depth The maximum JSON object/array nesting this parser is expected to handle.
   * @param dst The place to put the resulting parser implementation.
   * @return the error code, or SUCCESS if there was no error.
   */
  virtual error_code create_dom_parser_implementation(
    size_t capacity,
    size_t max_depth,
    std::unique_ptr<internal::dom_parser_implementation> &dst
  ) const noexcept = 0;

  /**
   * @private For internal implementation use
   *
   * Minify the input string assuming that it represents a JSON string, does not parse or validate.
   *
   * Overridden by each implementation.
   *
   * @param buf the json document to minify.
   * @param len the length of the json document.
   * @param dst the buffer to write the minified document to. *MUST* be allocated up to len + SIMDJSON_PADDING bytes.
   * @param dst_len the number of bytes written. Output only.
   * @return the error code, or SUCCESS if there was no error.
   */
  simdjson_warn_unused virtual error_code minify(const uint8_t *buf, size_t len, uint8_t *dst, size_t &dst_len) const noexcept = 0;


  /**
   * Validate the UTF-8 string.
   *
   * Overridden by each implementation.
   *
   * @param buf the string to validate.
   * @param len the length of the string in bytes.
   * @return true if and only if the string is valid UTF-8.
   */
  simdjson_warn_unused virtual bool validate_utf8(const char *buf, size_t len) const noexcept = 0;

protected:
  /** @private Construct an implementation with the given name and description. For subclasses. */
  simdjson_inline implementation(
    std::string_view name,
    std::string_view description,
    uint32_t required_instruction_sets
  ) :
    _name(name),
    _description(description),
    _required_instruction_sets(required_instruction_sets)
  {
  }
protected:
  ~implementation() = default;

private:
  /**
   * The name of this implementation.
   */
  std::string_view _name;

  /**
   * The description of this implementation.
   */
  std::string_view _description;

  /**
   * Instruction sets required for this implementation.
   */
  const uint32_t _required_instruction_sets;
};

/** @private */
namespace internal {

/**
 * The list of available implementations compiled into simdjson.
 */
class available_implementation_list {
public:
  /** Get the list of available implementations compiled into simdjson */
  simdjson_inline available_implementation_list() {}
  /** Number of implementations */
  size_t size() const noexcept;
  /** STL const begin() iterator */
  const implementation * const *begin() const noexcept;
  /** STL const end() iterator */
  const implementation * const *end() const noexcept;

  /**
   * Get the implementation with the given name.
   *
   * Case sensitive.
   *
   *     const implementation *impl = simdjson::get_available_implementations()["westmere"];
   *     if (!impl) { exit(1); }
   *     if (!imp->supported_by_runtime_system()) { exit(1); }
   *     simdjson::get_active_implementation() = impl;
   *
   * @param name the implementation to find, e.g. "westmere", "haswell", "arm64"
   * @return the implementation, or nullptr if the parse failed.
   */
  const implementation * operator[](const std::string_view &name) const noexcept {
    for (const implementation * impl : *this) {
      if (impl->name() == name) { return impl; }
    }
    return nullptr;
  }

  /**
   * Detect the most advanced implementation supported by the current host.
   *
   * This is used to initialize the implementation on startup.
   *
   *     const implementation *impl = simdjson::available_implementation::detect_best_supported();
   *     simdjson::get_active_implementation() = impl;
   *
   * @return the most advanced supported implementation for the current host, or an
   *         implementation that returns UNSUPPORTED_ARCHITECTURE if there is no supported
   *         implementation. Will never return nullptr.
   */
  const implementation *detect_best_supported() const noexcept;
};

} // namespace internal

/**
 * The list of available implementations compiled into simdjson.
 */
extern SIMDJSON_DLLIMPORTEXPORT const internal::available_implementation_list& get_available_implementations();

/**
  * The active implementation.
  *
  * Automatically initialized on first use to the most advanced implementation supported by this hardware.
  */
extern SIMDJSON_DLLIMPORTEXPORT internal::atomic_ptr<const implementation>& get_active_implementation();

} // namespace simdjson

#endif // SIMDJSON_IMPLEMENTATION_H
/* end file simdjson/implementation.h */
/* including simdjson/minify.h: #include "simdjson/minify.h" */
/* begin file simdjson/minify.h */
#ifndef SIMDJSON_MINIFY_H
#define SIMDJSON_MINIFY_H

/* skipped duplicate #include "simdjson/base.h" */
/* including simdjson/padded_string.h: #include "simdjson/padded_string.h" */
/* begin file simdjson/padded_string.h */
#ifndef SIMDJSON_PADDED_STRING_H
#define SIMDJSON_PADDED_STRING_H

/* skipped duplicate #include "simdjson/base.h" */
/* skipped duplicate #include "simdjson/error.h" */

/* skipped duplicate #include "simdjson/error-inl.h" */

#include <cstring>
#include <memory>
#include <string>
#include <ostream>

namespace simdjson {

class padded_string_view;

/**
 * String with extra allocation for ease of use with parser::parse()
 *
 * This is a move-only class, it cannot be copied.
 */
struct padded_string final {

  /**
   * Create a new, empty padded string.
   */
  explicit inline padded_string() noexcept;
  /**
   * Create a new padded string buffer.
   *
   * @param length the size of the string.
   */
  explicit inline padded_string(size_t length) noexcept;
  /**
   * Create a new padded string by copying the given input.
   *
   * @param data the buffer to copy
   * @param length the number of bytes to copy
   */
  explicit inline padded_string(const char *data, size_t length) noexcept;
#ifdef __cpp_char8_t
  explicit inline padded_string(const char8_t *data, size_t length) noexcept;
#endif
  /**
   * Create a new padded string by copying the given input.
   *
   * @param str_ the string to copy
   */
  inline padded_string(const std::string & str_ ) noexcept;
  /**
   * Create a new padded string by copying the given input.
   *
   * @param sv_ the string to copy
   */
  inline padded_string(std::string_view sv_) noexcept;
  /**
   * Move one padded string into another.
   *
   * The original padded string will be reduced to zero capacity.
   *
   * @param o the string to move.
   */
  inline padded_string(padded_string &&o) noexcept;
  /**
   * Move one padded string into another.
   *
   * The original padded string will be reduced to zero capacity.
   *
   * @param o the string to move.
   */
  inline padded_string &operator=(padded_string &&o) noexcept;
  inline void swap(padded_string &o) noexcept;
  ~padded_string() noexcept;

  /**
   * The length of the string.
   *
   * Does not include padding.
   */
  size_t size() const noexcept;

  /**
   * The length of the string.
   *
   * Does not include padding.
   */
  size_t length() const noexcept;

  /**
   * The string data.
   **/
  const char *data() const noexcept;
  const uint8_t *u8data() const noexcept { return static_cast<const uint8_t*>(static_cast<const void*>(data_ptr));}

  /**
   * The string data.
   **/
  char *data() noexcept;

  /**
   * Create a std::string_view with the same content.
   */
  operator std::string_view() const;

  /**
   * Create a padded_string_view with the same content.
   */
  operator padded_string_view() const noexcept;

  /**
   * Load this padded string from a file.
   *
   * ## Windows and Unicode
   *
   * Windows users who need to read files with non-ANSI characters in the
   * name should set their code page to UTF-8 (65001) before calling this
   * function. This should be the default with Windows 11 and better.
   * Further, they may use the AreFileApisANSI function to determine whether
   * the filename is interpreted using the ANSI or the system default OEM
   * codepage, and they may call SetFileApisToOEM accordingly.
   *
   * @return IO_ERROR on error. Be mindful that on some 32-bit systems,
   * the file size might be limited to 2 GB.
   *
   * @param path the path to the file.
   **/
  inline static simdjson_result<padded_string> load(std::string_view path) noexcept;

    #if defined(_WIN32) && SIMDJSON_CPLUSPLUS17
  /**
   * This function accepts a wide string path (UTF-16) and converts it to
   * UTF-8 before loading the file. This allows windows users to work
   * with unicode file paths without manually converting the paths everytime.
   *
   * @return IO_ERROR on error, including conversion failures.
   *
   * @param path the path to the file as a wide string.
  **/
    inline static simdjson_result<padded_string> load(std::wstring_view path) noexcept;
  #endif

private:
  padded_string &operator=(const padded_string &o) = delete;
  padded_string(const padded_string &o) = delete;

  size_t viable_size{0};
  char *data_ptr{nullptr};

}; // padded_string

/**
 * Send padded_string instance to an output stream.
 *
 * @param out The output stream.
 * @param s The padded_string instance.
 * @throw if there is an error with the underlying output stream. simdjson itself will not throw.
 */
inline std::ostream& operator<<(std::ostream& out, const padded_string& s) { return out << s.data(); }

#if SIMDJSON_EXCEPTIONS
/**
 * Send padded_string instance to an output stream.
 *
 * @param out The output stream.
 * @param s The padded_string instance.
  * @throw simdjson_error if the result being printed has an error. If there is an error with the
 *        underlying output stream, that error will be propagated (simdjson_error will not be
 *        thrown).
 */
inline std::ostream& operator<<(std::ostream& out, simdjson_result<padded_string> &s) noexcept(false) { return out << s.value(); }
#endif

} // namespace simdjson

// This is deliberately outside of simdjson so that people get it without having to use the namespace
inline simdjson::padded_string operator ""_padded(const char *str, size_t len);
#ifdef __cpp_char8_t
inline simdjson::padded_string operator ""_padded(const char8_t *str, size_t len);
#endif

namespace simdjson {
namespace internal {

// The allocate_padded_buffer function is a low-level function to allocate memory
// with padding so we can read past the "length" bytes safely. It is used by
// the padded_string class automatically. It returns nullptr in case
// of error: the caller should check for a null pointer.
// The length parameter is the maximum size in bytes of the string.
// The caller is responsible to free the memory (e.g., delete[] (...)).
inline char *allocate_padded_buffer(size_t length) noexcept;

} // namespace internal
} // namespace simdjson

#endif // SIMDJSON_PADDED_STRING_H
/* end file simdjson/padded_string.h */
#include <string>
#include <ostream>
#include <sstream>

namespace simdjson {

/**
 *
 * Minify the input string assuming that it represents a JSON string, does not parse or validate.
 * This function is much faster than parsing a JSON string and then writing a minified version of it.
 * However, it does not validate the input. It will merely return an error in simple cases (e.g., if
 * there is a string that was never terminated).
 *
 *
 * @param buf the json document to minify.
 * @param len the length of the json document.
 * @param dst the buffer to write the minified document to. *MUST* be allocated up to len bytes.
 * @param dst_len the number of bytes written. Output only.
 * @return the error code, or SUCCESS if there was no error.
 */
simdjson_warn_unused error_code minify(const char *buf, size_t len, char *dst, size_t &dst_len) noexcept;

} // namespace simdjson

#endif // SIMDJSON_MINIFY_H
/* end file simdjson/minify.h */
/* skipped duplicate #include "simdjson/padded_string.h" */
/* including simdjson/padded_string-inl.h: #include "simdjson/padded_string-inl.h" */
/* begin file simdjson/padded_string-inl.h */
#ifndef SIMDJSON_PADDED_STRING_INL_H
#define SIMDJSON_PADDED_STRING_INL_H

/* skipped duplicate #include "simdjson/padded_string.h" */
/* including simdjson/padded_string_view.h: #include "simdjson/padded_string_view.h" */
/* begin file simdjson/padded_string_view.h */
#ifndef SIMDJSON_PADDED_STRING_VIEW_H
#define SIMDJSON_PADDED_STRING_VIEW_H

/* skipped duplicate #include "simdjson/portability.h" */
/* skipped duplicate #include "simdjson/base.h" // for SIMDJSON_PADDING */
/* skipped duplicate #include "simdjson/error.h" */

#include <cstring>
#include <memory>
#include <string>
#include <ostream>

namespace simdjson {

/**
 * User-provided string that promises it has extra padded bytes at the end for use with parser::parse().
 */
class padded_string_view : public std::string_view {
private:
  size_t _capacity;

public:
  /** Create an empty padded_string_view. */
  inline padded_string_view() noexcept = default;

  /**
   * Promise the given buffer has at least SIMDJSON_PADDING extra bytes allocated to it.
   *
   * @param s The string.
   * @param len The length of the string (not including padding).
   * @param capacity The allocated length of the string, including padding. If the capacity is less
   *       than the length, the capacity will be set to the length.
   */
  explicit inline padded_string_view(const char* s, size_t len, size_t capacity) noexcept;
  /** overload explicit inline padded_string_view(const char* s, size_t len) noexcept */
  explicit inline padded_string_view(const uint8_t* s, size_t len, size_t capacity) noexcept;
#ifdef __cpp_char8_t
  explicit inline padded_string_view(const char8_t* s, size_t len, size_t capacity) noexcept;
#endif
  /**
   * Promise the given string has at least SIMDJSON_PADDING extra bytes allocated to it.
   *
   * The capacity of the string will be used to determine its padding.
   *
   * @param s The string.
   */
  explicit inline padded_string_view(const std::string &s) noexcept;

  /**
   * Promise the given string_view has at least SIMDJSON_PADDING extra bytes allocated to it.
   *
   * @param s The string.
   * @param capacity The allocated length of the string, including padding. If the capacity is less
   *      than the length, the capacity will be set to the length.
   */
  explicit inline padded_string_view(std::string_view s, size_t capacity) noexcept;

  /** The number of allocated bytes. */
  inline size_t capacity() const noexcept;

  /** check that the view has sufficient padding */
  inline bool has_sufficient_padding() const noexcept;

  /**
   * Remove the UTF-8 Byte Order Mark (BOM) if it exists.
   *
   * @return whether a BOM was found and removed
   */
  inline bool remove_utf8_bom() noexcept;

  /** The amount of padding on the string (capacity() - length()) */
  inline size_t padding() const noexcept;

}; // padded_string_view

#if SIMDJSON_EXCEPTIONS
/**
 * Send padded_string instance to an output stream.
 *
 * @param out The output stream.
 * @param s The padded_string_view.
 * @throw simdjson_error if the result being printed has an error. If there is an error with the
 *        underlying output stream, that error will be propagated (simdjson_error will not be
 *        thrown).
 */
inline std::ostream& operator<<(std::ostream& out, simdjson_result<padded_string_view> &s) noexcept(false);
#endif

/**
 * Create a padded_string_view from a string. The string will be padded with up to SIMDJSON_PADDING
 * space characters. The resulting padded_string_view will have a length equal to the original
 * string, except maybe for trailing white space characters.
 *
 * @param s The string.
 * @return The padded string.
 */
inline padded_string_view pad(std::string& s) noexcept;

/**
 * Create a padded_string_view from a string. The capacity of the string will be padded with SIMDJSON_PADDING
 * characters. The resulting padded_string_view will have a length equal to the original
 * string.
 *
 * @param s The string.
 * @return The padded string.
 */
inline padded_string_view pad_with_reserve(std::string& s) noexcept;
} // namespace simdjson

#endif // SIMDJSON_PADDED_STRING_VIEW_H
/* end file simdjson/padded_string_view.h */

/* skipped duplicate #include "simdjson/error-inl.h" */
/* including simdjson/padded_string_view-inl.h: #include "simdjson/padded_string_view-inl.h" */
/* begin file simdjson/padded_string_view-inl.h */
#ifndef SIMDJSON_PADDED_STRING_VIEW_INL_H
#define SIMDJSON_PADDED_STRING_VIEW_INL_H

/* skipped duplicate #include "simdjson/padded_string_view.h" */
/* skipped duplicate #include "simdjson/error-inl.h" */

#include <cstring> /* memcmp */

namespace simdjson {

inline padded_string_view::padded_string_view(const char* s, size_t len, size_t capacity) noexcept
  : std::string_view(s, len), _capacity(capacity)
{
  if(_capacity < len) { _capacity = len; }
}

inline padded_string_view::padded_string_view(const uint8_t* s, size_t len, size_t capacity) noexcept
  : padded_string_view(reinterpret_cast<const char*>(s), len, capacity)
{
}
#ifdef __cpp_char8_t
inline padded_string_view::padded_string_view(const char8_t* s, size_t len, size_t capacity) noexcept
  : padded_string_view(reinterpret_cast<const char*>(s), len, capacity)
{
}
#endif
inline padded_string_view::padded_string_view(const std::string &s) noexcept
  : std::string_view(s), _capacity(s.capacity())
{
}

inline padded_string_view::padded_string_view(std::string_view s, size_t capacity) noexcept
  : std::string_view(s), _capacity(capacity)
{
  if(_capacity < s.length()) { _capacity = s.length(); }
}

inline bool padded_string_view::has_sufficient_padding() const noexcept {
  if (padding() >= SIMDJSON_PADDING) {
    return true;
  }
  size_t missing_padding = SIMDJSON_PADDING - padding();
  if(length() < missing_padding) { return false; }

  for (size_t i = length() - missing_padding; i < length(); i++) {
    char c = data()[i];
    if (c != ' ' && c != '\t' && c != '\n' && c != '\r') {
      return false;
    }
  }
  return true;
}

inline size_t padded_string_view::capacity() const noexcept { return _capacity; }

inline size_t padded_string_view::padding() const noexcept { return capacity() - length(); }

inline bool padded_string_view::remove_utf8_bom() noexcept {
  if(length() < 3) { return false; }
  if (std::memcmp(data(), "\xEF\xBB\xBF", 3) == 0) {
    remove_prefix(3);
    _capacity -= 3;
    return true;
  }
  return false;
}

#if SIMDJSON_EXCEPTIONS
inline std::ostream& operator<<(std::ostream& out, simdjson_result<padded_string_view> &s) noexcept(false) { return out << s.value(); }
#endif

inline padded_string_view pad(std::string& s) noexcept {
  size_t existing_padding = 0;
  for (size_t i = s.size(); i > 0; i--) {
    char c = s[i - 1];
    if (c == ' ' || c == '\t' || c == '\n' || c == '\r') {
      existing_padding++;
    } else {
      break;
    }
  }
  size_t needed_padding = 0;
  if (existing_padding < SIMDJSON_PADDING) {
    needed_padding = SIMDJSON_PADDING - existing_padding;
    s.append(needed_padding, ' ');
  }

  return padded_string_view(s.data(), s.size() - needed_padding, s.size());
}

inline padded_string_view pad_with_reserve(std::string& s) noexcept {
  if (s.capacity() - s.size() < SIMDJSON_PADDING) {
    s.reserve(s.size() + SIMDJSON_PADDING );
  }
  return padded_string_view(s.data(), s.size(), s.capacity());
}



} // namespace simdjson


#endif // SIMDJSON_PADDED_STRING_VIEW_INL_H
/* end file simdjson/padded_string_view-inl.h */

#include <climits>
#include <cwchar>

namespace simdjson {
namespace internal {

// The allocate_padded_buffer function is a low-level function to allocate memory
// with padding so we can read past the "length" bytes safely. It is used by
// the padded_string class automatically. It returns nullptr in case
// of error: the caller should check for a null pointer.
// The length parameter is the maximum size in bytes of the string.
// The caller is responsible to free the memory (e.g., delete[] (...)).
inline char *allocate_padded_buffer(size_t length) noexcept {
  const size_t totalpaddedlength = length + SIMDJSON_PADDING;
  if(totalpaddedlength<length) {
    // overflow
    return nullptr;
  }
#ifdef FUZZING_BUILD_MODE_UNSAFE_FOR_PRODUCTION
  // avoid getting out of memory
  if (totalpaddedlength>(1UL<<20)) {
    return nullptr;
  }
#endif

  char *padded_buffer = new (std::nothrow) char[totalpaddedlength];
  if (padded_buffer == nullptr) {
    return nullptr;
  }
  // We write nulls in the padded region to avoid having uninitialized
  // content which may trigger warning for some sanitizers
  std::memset(padded_buffer + length, 0, totalpaddedlength - length);
  return padded_buffer;
} // allocate_padded_buffer()

} // namespace internal


inline padded_string::padded_string() noexcept = default;
inline padded_string::padded_string(size_t length) noexcept
    : viable_size(length), data_ptr(internal::allocate_padded_buffer(length)) {
}
inline padded_string::padded_string(const char *data, size_t length) noexcept
    : viable_size(length), data_ptr(internal::allocate_padded_buffer(length)) {
  if ((data != nullptr) && (data_ptr != nullptr)) {
    std::memcpy(data_ptr, data, length);
  }
  if (data_ptr == nullptr) {
    viable_size = 0;
  }
}
#ifdef __cpp_char8_t
inline padded_string::padded_string(const char8_t *data, size_t length) noexcept
    : viable_size(length), data_ptr(internal::allocate_padded_buffer(length)) {
  if ((data != nullptr) && (data_ptr != nullptr)) {
    std::memcpy(data_ptr, reinterpret_cast<const char *>(data), length);
  }
  if (data_ptr == nullptr) {
    viable_size = 0;
  }
}
#endif
// note: do not pass std::string arguments by value
inline padded_string::padded_string(const std::string & str_ ) noexcept
    : viable_size(str_.size()), data_ptr(internal::allocate_padded_buffer(str_.size())) {
  if (data_ptr == nullptr) {
    viable_size = 0;
  } else {
    std::memcpy(data_ptr, str_.data(), str_.size());
  }
}
// note: do pass std::string_view arguments by value
inline padded_string::padded_string(std::string_view sv_) noexcept
    : viable_size(sv_.size()), data_ptr(internal::allocate_padded_buffer(sv_.size())) {
  if(simdjson_unlikely(!data_ptr)) {
    //allocation failed or zero size
    viable_size = 0;
    return;
  }
  if (sv_.size()) {
    std::memcpy(data_ptr, sv_.data(), sv_.size());
  }
}
inline padded_string::padded_string(padded_string &&o) noexcept
    : viable_size(o.viable_size), data_ptr(o.data_ptr) {
  o.data_ptr = nullptr; // we take ownership
  o.viable_size = 0;
}

inline padded_string &padded_string::operator=(padded_string &&o) noexcept {
  delete[] data_ptr;
  data_ptr = o.data_ptr;
  viable_size = o.viable_size;
  o.data_ptr = nullptr; // we take ownership
  o.viable_size = 0;
  return *this;
}

inline void padded_string::swap(padded_string &o) noexcept {
  size_t tmp_viable_size = viable_size;
  char *tmp_data_ptr = data_ptr;
  viable_size = o.viable_size;
  data_ptr = o.data_ptr;
  o.data_ptr = tmp_data_ptr;
  o.viable_size = tmp_viable_size;
}

inline padded_string::~padded_string() noexcept {
  delete[] data_ptr;
}

inline size_t padded_string::size() const noexcept { return viable_size; }

inline size_t padded_string::length() const noexcept { return viable_size; }

inline const char *padded_string::data() const noexcept { return data_ptr; }

inline char *padded_string::data() noexcept { return data_ptr; }

inline padded_string::operator std::string_view() const simdjson_lifetime_bound { return std::string_view(data(), length()); }

inline padded_string::operator padded_string_view() const noexcept simdjson_lifetime_bound {
  return padded_string_view(data(), length(), length() + SIMDJSON_PADDING);
}

inline simdjson_result<padded_string> padded_string::load(std::string_view filename) noexcept {
  // Open the file
  SIMDJSON_PUSH_DISABLE_WARNINGS
  SIMDJSON_DISABLE_DEPRECATED_WARNING // Disable CRT_SECURE warning on MSVC: manually verified this is safe
  std::FILE *fp = std::fopen(filename.data(), "rb");
  SIMDJSON_POP_DISABLE_WARNINGS

  if (fp == nullptr) {
    return IO_ERROR;
  }

  // Get the file size
  int ret;
#if SIMDJSON_VISUAL_STUDIO && !SIMDJSON_IS_32BITS
  ret = _fseeki64(fp, 0, SEEK_END);
#else
  ret = std::fseek(fp, 0, SEEK_END);
#endif // _WIN64
  if(ret < 0) {
    std::fclose(fp);
    return IO_ERROR;
  }
#if SIMDJSON_VISUAL_STUDIO && !SIMDJSON_IS_32BITS
  __int64 llen = _ftelli64(fp);
  if(llen == -1L) {
    std::fclose(fp);
    return IO_ERROR;
  }
#else
  long llen = std::ftell(fp);
  if((llen < 0) || (llen == LONG_MAX)) {
    std::fclose(fp);
    return IO_ERROR;
  }
#endif

  // Allocate the padded_string
  size_t len = static_cast<size_t>(llen);
  padded_string s(len);
  if (s.data() == nullptr) {
    std::fclose(fp);
    return MEMALLOC;
  }

  // Read the padded_string
  std::rewind(fp);
  size_t bytes_read = std::fread(s.data(), 1, len, fp);
  if (std::fclose(fp) != 0 || bytes_read != len) {
    return IO_ERROR;
  }

  return s;
}

#if defined(_WIN32) && SIMDJSON_CPLUSPLUS17
inline simdjson_result<padded_string> padded_string::load(std::wstring_view filename) noexcept {
  // Open the file using the wide characters
  SIMDJSON_PUSH_DISABLE_WARNINGS
  SIMDJSON_DISABLE_DEPRECATED_WARNING // Disable CRT_SECURE warning on MSVC: manually verified this is safe
  std::FILE *fp = _wfopen(filename.data(), L"rb");
  SIMDJSON_POP_DISABLE_WARNINGS

  if (fp == nullptr) {
    return IO_ERROR;
  }

  // Get the file size
  int ret;
#if SIMDJSON_VISUAL_STUDIO && !SIMDJSON_IS_32BITS
  ret = _fseeki64(fp, 0, SEEK_END);
#else
  ret = std::fseek(fp, 0, SEEK_END);
#endif // _WIN64
  if(ret < 0) {
    std::fclose(fp);
    return IO_ERROR;
  }
#if SIMDJSON_VISUAL_STUDIO && !SIMDJSON_IS_32BITS
  __int64 llen = _ftelli64(fp);
  if(llen == -1L) {
    std::fclose(fp);
    return IO_ERROR;
  }
#else
  long llen = std::ftell(fp);
  if((llen < 0) || (llen == LONG_MAX)) {
    std::fclose(fp);
    return IO_ERROR;
  }
#endif

  // Allocate the padded_string
  size_t len = static_cast<size_t>(llen);
  padded_string s(len);
  if (s.data() == nullptr) {
    std::fclose(fp);
    return MEMALLOC;
  }

  // Read the padded_string
  std::rewind(fp);
  size_t bytes_read = std::fread(s.data(), 1, len, fp);
  if (std::fclose(fp) != 0 || bytes_read != len) {
    return IO_ERROR;
  }

  return s;
}
#endif

} // namespace simdjson

inline simdjson::padded_string operator ""_padded(const char *str, size_t len) {
  return simdjson::padded_string(str, len);
}
#ifdef __cpp_char8_t
inline simdjson::padded_string operator ""_padded(const char8_t *str, size_t len) {
  return simdjson::padded_string(reinterpret_cast<const char *>(str), len);
}
#endif
#endif // SIMDJSON_PADDED_STRING_INL_H
/* end file simdjson/padded_string-inl.h */
/* skipped duplicate #include "simdjson/padded_string_view.h" */
/* skipped duplicate #include "simdjson/padded_string_view-inl.h" */

/* including simdjson/dom.h: #include "simdjson/dom.h" */
/* begin file simdjson/dom.h */
#ifndef SIMDJSON_DOM_H
#define SIMDJSON_DOM_H

/* including simdjson/dom/base.h: #include "simdjson/dom/base.h" */
/* begin file simdjson/dom/base.h */
#ifndef SIMDJSON_DOM_BASE_H
#define SIMDJSON_DOM_BASE_H

/* skipped duplicate #include "simdjson/base.h" */

namespace simdjson {

/**
 * @brief A DOM API on top of the simdjson parser.
 */
namespace dom {

/** The default batch size for parser.parse_many() and parser.load_many() */
static constexpr size_t DEFAULT_BATCH_SIZE = 1000000;
/**
 * Some adversary might try to set the batch size to 0 or 1, which might cause problems.
 * We set a minimum of 32B since anything else is highly likely to be an error. In practice,
 * most users will want a much larger batch size.
 *
 * All non-negative MINIMAL_BATCH_SIZE values should be 'safe' except that, obviously, no JSON
 * document can ever span 0 or 1 byte and that very large values would create memory allocation issues.
 */
static constexpr size_t MINIMAL_BATCH_SIZE = 32;

/**
 * It is wasteful to allocate memory for tiny documents (e.g., 4 bytes).
 */
static constexpr size_t MINIMAL_DOCUMENT_CAPACITY = 32;

class array;
class document;
class document_stream;
class element;
class key_value_pair;
class object;
class parser;

#ifdef SIMDJSON_THREADS_ENABLED
struct stage1_worker;
#endif // SIMDJSON_THREADS_ENABLED

} // namespace dom

namespace internal {

template<typename T>
class string_builder;
class tape_ref;

} // namespace internal

} // namespace simdjson

#endif // SIMDJSON_DOM_BASE_H
/* end file simdjson/dom/base.h */
/* including simdjson/dom/array.h: #include "simdjson/dom/array.h" */
/* begin file simdjson/dom/array.h */
#ifndef SIMDJSON_DOM_ARRAY_H
#define SIMDJSON_DOM_ARRAY_H

#include <vector>

/* skipped duplicate #include "simdjson/dom/base.h" */
/* including simdjson/internal/tape_ref.h: #include "simdjson/internal/tape_ref.h" */
/* begin file simdjson/internal/tape_ref.h */
#ifndef SIMDJSON_INTERNAL_TAPE_REF_H
#define SIMDJSON_INTERNAL_TAPE_REF_H

/* skipped duplicate #include "simdjson/base.h" */

namespace simdjson {
namespace dom {
class document;
} // namespace dom

namespace internal {

/**
 * A reference to an element on the tape. Internal only.
 */
class tape_ref {
public:
  simdjson_inline tape_ref() noexcept;
  simdjson_inline tape_ref(const dom::document *doc, size_t json_index) noexcept;
  inline size_t after_element() const noexcept;
  simdjson_inline tape_type tape_ref_type() const noexcept;
  simdjson_inline uint64_t tape_value() const noexcept;
  simdjson_inline bool is_double() const noexcept;
  simdjson_inline bool is_int64() const noexcept;
  simdjson_inline bool is_uint64() const noexcept;
  simdjson_inline bool is_false() const noexcept;
  simdjson_inline bool is_true() const noexcept;
  simdjson_inline bool is_null_on_tape() const noexcept;// different name to avoid clash with is_null.
  simdjson_inline uint32_t matching_brace_index() const noexcept;
  simdjson_inline uint32_t scope_count() const noexcept;
  template<typename T>
  simdjson_inline T next_tape_value() const noexcept;
  simdjson_inline uint32_t get_string_length() const noexcept;
  simdjson_inline const char * get_c_str() const noexcept;
  inline std::string_view get_string_view() const noexcept;
  simdjson_inline bool is_document_root() const noexcept;
  simdjson_inline bool usable() const noexcept;

  /** The document this element references. */
  const dom::document *doc;

  /** The index of this element on `doc.tape[]` */
  size_t json_index;
};

} // namespace internal
} // namespace simdjson

#endif // SIMDJSON_INTERNAL_TAPE_REF_H
/* end file simdjson/internal/tape_ref.h */

namespace simdjson {
namespace dom {

/**
 * JSON array.
 */
class array {
public:
  /** Create a new, invalid array */
  simdjson_inline array() noexcept;

  class iterator {
  public:
    using value_type = element;
    using difference_type = std::ptrdiff_t;
    using pointer = void;
    using reference = value_type;
    using iterator_category = std::forward_iterator_tag;

    /**
     * Get the actual value
     */
    inline reference operator*() const noexcept;
    /**
     * Get the next value.
     *
     * Part of the std::iterator interface.
     */
    inline iterator& operator++() noexcept;
    /**
     * Get the next value.
     *
     * Part of the  std::iterator interface.
     */
    inline iterator operator++(int) noexcept;
    /**
     * Check if these values come from the same place in the JSON.
     *
     * Part of the std::iterator interface.
     */
    inline bool operator!=(const iterator& other) const noexcept;
    inline bool operator==(const iterator& other) const noexcept;

    inline bool operator<(const iterator& other) const noexcept;
    inline bool operator<=(const iterator& other) const noexcept;
    inline bool operator>=(const iterator& other) const noexcept;
    inline bool operator>(const iterator& other) const noexcept;

    iterator() noexcept = default;
    iterator(const iterator&) noexcept = default;
    iterator& operator=(const iterator&) noexcept = default;
  private:
    simdjson_inline iterator(const internal::tape_ref &tape) noexcept;
    internal::tape_ref tape{};
    friend class array;
  };

  /**
   * Return the first array element.
   *
   * Part of the std::iterable interface.
   */
  inline iterator begin() const noexcept;
  /**
   * One past the last array element.
   *
   * Part of the std::iterable interface.
   */
  inline iterator end() const noexcept;
  /**
   * Get the size of the array (number of immediate children).
   * It is a saturated value with a maximum of 0xFFFFFF: if the value
   * is 0xFFFFFF then the size is 0xFFFFFF or greater.
   */
  inline size_t size() const noexcept;
  /**
   * Get the total number of slots used by this array on the tape.
   *
   * Note that this is not the same thing as `size()`, which reports the
   * number of actual elements within an array (not counting its children).
   *
   * Since an element can use 1 or 2 slots on the tape, you can only use this
   * to figure out the total size of an array (including its children,
   * recursively) if you know its structure ahead of time.
   **/
  inline size_t number_of_slots() const noexcept;
  /**
   * Get the value associated with the given JSON pointer.  We use the RFC 6901
   * https://tools.ietf.org/html/rfc6901 standard, interpreting the current node
   * as the root of its own JSON document.
   *
   *   dom::parser parser;
   *   array a = parser.parse(R"([ { "foo": { "a": [ 10, 20, 30 ] }} ])"_padded);
   *   a.at_pointer("/0/foo/a/1") == 20
   *   a.at_pointer("0")["foo"]["a"].at(1) == 20
   *
   * @return The value associated with the given JSON pointer, or:
   *         - NO_SUCH_FIELD if a field does not exist in an object
   *         - INDEX_OUT_OF_BOUNDS if an array index is larger than an array length
   *         - INCORRECT_TYPE if a non-integer is used to access an array
   *         - INVALID_JSON_POINTER if the JSON pointer is invalid and cannot be parsed
   */
  inline simdjson_result<element> at_pointer(std::string_view json_pointer) const noexcept;

  /**
   * Recursive function which processes the JSON path of each child element
   */
  inline void process_json_path_of_child_elements(std::vector<element>::iterator& current, std::vector<element>::iterator& end, const std::string_view& path_suffix, std::vector<element>& accumulator) const noexcept;


  /**
   * Adds support for JSONPath expression with wildcards '*'
   */
  inline simdjson_result<std::vector<element>> at_path_with_wildcard(std::string_view json_path) const noexcept;

  /**
   * Get the value associated with the given JSONPath expression. We only support
   * JSONPath queries that trivially convertible to JSON Pointer queries: key
   * names and array indices.
   *
   * https://www.rfc-editor.org/rfc/rfc9535 (RFC 9535)
   *
   * @return The value associated with the given JSONPath expression, or:
   *         - INVALID_JSON_POINTER if the JSONPath to JSON Pointer conversion fails
   *         - NO_SUCH_FIELD if a field does not exist in an object
   *         - INDEX_OUT_OF_BOUNDS if an array index is larger than an array length
   *         - INCORRECT_TYPE if a non-integer is used to access an array
  */
  inline simdjson_result<element> at_path(std::string_view json_path) const noexcept;

  /**
   * Get the value at the given index. This function has linear-time complexity and
   * is equivalent to the following:
   *
   *    size_t i=0;
   *    for (auto element : *this) {
   *      if (i == index) { return element; }
   *      i++;
   *    }
   *    return INDEX_OUT_OF_BOUNDS;
   *
   * Avoid calling the at() function repeatedly.
   *
   * @return The value at the given index, or:
   *         - INDEX_OUT_OF_BOUNDS if the array index is larger than an array length
   */
  inline simdjson_result<element> at(size_t index) const noexcept;

  /**
   * Gets the values of items in an array element
   * This function has linear-time complexity: the values are checked one by one.
   *
   * @return The child elements of an array
   */

  inline std::vector<element>& get_values(std::vector<element>& out) const noexcept;

  /**
   * Implicitly convert object to element
   */
  inline operator element() const noexcept;

private:
  simdjson_inline array(const internal::tape_ref &tape) noexcept;
  internal::tape_ref tape{};
  friend class element;
  friend struct simdjson_result<element>;
  template<typename T>
  friend class simdjson::internal::string_builder;
};


} // namespace dom

/** The result of a JSON conversion that may fail. */
template<>
struct simdjson_result<dom::array> : public internal::simdjson_result_base<dom::array> {
public:
  simdjson_inline simdjson_result() noexcept; ///< @private
  simdjson_inline simdjson_result(dom::array value) noexcept; ///< @private
  simdjson_inline simdjson_result(error_code error) noexcept; ///< @private

  inline simdjson_result<dom::element> at_pointer(std::string_view json_pointer) const noexcept;
  inline void process_json_path_of_child_elements(std::vector<dom::element>::iterator& current, std::vector<dom::element>::iterator& end, const std::string_view& path_suffix, std::vector<dom::element>& accumulator) const noexcept;
  inline simdjson_result<std::vector<dom::element>> at_path_with_wildcard(std::string_view json_path) const noexcept;
  inline simdjson_result<dom::element> at_path(std::string_view json_path) const noexcept;
  inline simdjson_result<dom::element> at(size_t index) const noexcept;
  inline std::vector<dom::element>& get_values(std::vector<dom::element>& out) const noexcept;

#if SIMDJSON_EXCEPTIONS
  inline dom::array::iterator begin() const noexcept(false);
  inline dom::array::iterator end() const noexcept(false);
  inline size_t size() const noexcept(false);
#endif // SIMDJSON_EXCEPTIONS
};



} // namespace simdjson

#if SIMDJSON_SUPPORTS_RANGES
namespace std {
namespace ranges {
template<>
inline constexpr bool enable_view<simdjson::dom::array> = true;
#if SIMDJSON_EXCEPTIONS
template<>
inline constexpr bool enable_view<simdjson::simdjson_result<simdjson::dom::array>> = true;
#endif // SIMDJSON_EXCEPTIONS
} // namespace ranges
} // namespace std
#endif // SIMDJSON_SUPPORTS_RANGES

#endif // SIMDJSON_DOM_ARRAY_H
/* end file simdjson/dom/array.h */
/* including simdjson/dom/document_stream.h: #include "simdjson/dom/document_stream.h" */
/* begin file simdjson/dom/document_stream.h */
#ifndef SIMDJSON_DOCUMENT_STREAM_H
#define SIMDJSON_DOCUMENT_STREAM_H

/* skipped duplicate #include "simdjson/dom/base.h" */
/* including simdjson/dom/parser.h: #include "simdjson/dom/parser.h" */
/* begin file simdjson/dom/parser.h */
#ifndef SIMDJSON_DOM_PARSER_H
#define SIMDJSON_DOM_PARSER_H

/* skipped duplicate #include "simdjson/dom/base.h" */
/* including simdjson/dom/document.h: #include "simdjson/dom/document.h" */
/* begin file simdjson/dom/document.h */
#ifndef SIMDJSON_DOM_DOCUMENT_H
#define SIMDJSON_DOM_DOCUMENT_H

/* skipped duplicate #include "simdjson/dom/base.h" */

#include <memory>

namespace simdjson {
namespace dom {

/**
 * A parsed JSON document.
 *
 * This class cannot be copied, only moved, to avoid unintended allocations.
 */
class document {
public:
  /**
   * Create a document container with zero capacity.
   *
   * The parser will allocate capacity as needed.
   */
  document() noexcept = default;
  ~document() noexcept = default;

  /**
   * Take another document's buffers.
   *
   * @param other The document to take. Its capacity is zeroed and it is invalidated.
   */
  document(document &&other) noexcept = default;
  /** @private */
  document(const document &) = delete; // Disallow copying
  /**
   * Take another document's buffers.
   *
   * @param other The document to take. Its capacity is zeroed.
   */
  document &operator=(document &&other) noexcept = default;
  /** @private */
  document &operator=(const document &) = delete; // Disallow copying

  /**
   * Get the root element of this document as a JSON array.
   */
  element root() const noexcept;

  /**
   * @private Dump the raw tape for debugging.
   *
   * @param os the stream to output to.
   * @return false if the tape is likely wrong (e.g., you did not parse a valid JSON).
   */
  bool dump_raw_tape(std::ostream &os) const noexcept;

  /** @private Structural values. */
  std::unique_ptr<uint64_t[]> tape{};

  /** @private String values.
   *
   * Should be at least byte_capacity.
   */
  std::unique_ptr<uint8_t[]> string_buf{};
  /** @private Allocate memory to support
   * input JSON documents of up to len bytes.
   *
   * When calling this function, you lose
   * all the data.
   *
   * The memory allocation is strict: you
   * can you use this function to increase
   * or lower the amount of allocated memory.
   * Passing zero clears the memory.
   */
  error_code allocate(size_t len) noexcept;
  /** @private Capacity in bytes, in terms
   * of how many bytes of input JSON we can
   * support.
   */
  size_t capacity() const noexcept;


private:
  size_t allocated_capacity{0};
  friend class parser;
}; // class document

} // namespace dom
} // namespace simdjson

#endif // SIMDJSON_DOM_DOCUMENT_H
/* end file simdjson/dom/document.h */

namespace simdjson {

namespace dom {

/**
 * A persistent document parser.
 *
 * The parser is designed to be reused, holding the internal buffers necessary to do parsing,
 * as well as memory for a single document. The parsed document is overwritten on each parse.
 *
 * This class cannot be copied, only moved, to avoid unintended allocations.
 *
 * @note Moving a parser instance may invalidate "dom::element" instances. If you need to
 * preserve both the "dom::element" instances and the parser, consider wrapping the parser
 * instance in a std::unique_ptr instance:
 *
 *   std::unique_ptr<dom::parser> parser(new dom::parser{});
 *   auto error = parser->load(f).get(root);
 *
 * You can then move std::unique_ptr safely.
 *
 * @note This is not thread safe: one parser cannot produce two documents at the same time!
 */
class parser {
public:
  /**
   * Create a JSON parser.
   *
   * The new parser will have zero capacity.
   *
   * @param max_capacity The maximum document length the parser can automatically handle. The parser
   *    will allocate more capacity on an as needed basis (when it sees documents too big to handle)
   *    up to this amount. The parser still starts with zero capacity no matter what this number is:
   *    to allocate an initial capacity, call allocate() after constructing the parser.
   *    Defaults to SIMDJSON_MAXSIZE_BYTES (the largest single document simdjson can process).
   */
  simdjson_inline explicit parser(size_t max_capacity = SIMDJSON_MAXSIZE_BYTES) noexcept;
  /**
   * Take another parser's buffers and state.
   *
   * @param other The parser to take. Its capacity is zeroed.
   */
  simdjson_inline parser(parser &&other) noexcept;
  parser(const parser &) = delete; ///< @private Disallow copying
  /**
   * Take another parser's buffers and state.
   *
   * @param other The parser to take. Its capacity is zeroed.
   */
  simdjson_inline parser &operator=(parser &&other) noexcept;
  parser &operator=(const parser &) = delete; ///< @private Disallow copying

  /** Deallocate the JSON parser. */
  ~parser()=default;

  /**
   * Load a JSON document from a file and return a reference to it.
   *
   *   dom::parser parser;
   *   const element doc = parser.load("jsonexamples/twitter.json");
   *
   * The function is eager: the file's content is loaded in memory inside the parser instance
   * and immediately parsed. The file can be deleted after the  `parser.load` call.
   *
   * ### IMPORTANT: Document Lifetime
   *
   * The JSON document still lives in the parser: this is the most efficient way to parse JSON
   * documents because it reuses the same buffers, but you *must* use the document before you
   * destroy the parser or call parse() again.
   *
   * Moving the parser instance is safe, but it invalidates the element instances. You may store
   * the parser instance without moving it by wrapping it inside an `unique_ptr` instance like
   * so: `std::unique_ptr<dom::parser> parser(new dom::parser{});`.
   *
   * ### Parser Capacity
   *
   * If the parser's current capacity is less than the file length, it will allocate enough capacity
   * to handle it (up to max_capacity).
   *
   * ## Windows and Unicode
   *
   * Windows users who need to read files with non-ANSI characters in the
   * name should set their code page to UTF-8 (65001) before calling this
   * function. This should be the default with Windows 11 and better.
   * Further, they may use the AreFileApisANSI function to determine whether
   * the filename is interpreted using the ANSI or the system default OEM
   * codepage, and they may call SetFileApisToOEM accordingly.
   *
   * @param path The path to load.
   * @return The document, or an error:
   *         - IO_ERROR if there was an error opening or reading the file.
   *           Be mindful that on some 32-bit systems,
   *           the file size might be limited to 2 GB.
   *         - MEMALLOC if the parser does not have enough capacity and memory allocation fails.
   *         - CAPACITY if the parser does not have enough capacity and len > max_capacity.
   *         - other json errors if parsing fails. You should not rely on these errors to always the same for the
   *           same document: they may vary under runtime dispatch (so they may vary depending on your system and hardware).
   */
  inline simdjson_result<element> load(std::string_view path) & noexcept;
  inline simdjson_result<element> load(std::string_view path) &&  = delete ;

  /**
   * Load a JSON document from a file into a provide document instance and return a temporary reference to it.
   * It is similar to the function `load` except that instead of parsing into the internal
   * `document` instance associated with the parser, it allows the user to provide a document
   * instance.
   *
   *   dom::parser parser;
   *   dom::document doc;
   *   element doc_root = parser.load_into_document(doc, "jsonexamples/twitter.json");
   *
   * The function is eager: the file's content is loaded in memory inside the parser instance
   * and immediately parsed. The file can be deleted after the `parser.load_into_document` call.
   *
   * ### IMPORTANT: Document Lifetime
   *
   * After the call to load_into_document, the parser is no longer needed.
   *
   * The JSON document lives in the document instance: you must keep the document
   * instance alive while you navigate through it (i.e., used the returned value from
   * load_into_document). You are encourage to reuse the document instance
   * many times with new data to avoid reallocations:
   *
   *   dom::document doc;
   *   element doc_root1 = parser.load_into_document(doc, "jsonexamples/twitter.json");
   *   //... doc_root1 is a pointer inside doc
   *   element doc_root2 = parser.load_into_document(doc, "jsonexamples/twitter.json");
   *   //... doc_root2 is a pointer inside doc
   *   // at this point doc_root1 is no longer safe
   *
   * Moving the document instance is safe, but it invalidates the element instances. After
   * moving a document, you can recover safe access to the document root with its `root()` method.
   *
   * @param doc The document instance where the parsed data will be stored (on success).
   * @param path The path to load.
   * @return The document, or an error:
   *         - IO_ERROR if there was an error opening or reading the file.
   *           Be mindful that on some 32-bit systems,
   *           the file size might be limited to 2 GB.
   *         - MEMALLOC if the parser does not have enough capacity and memory allocation fails.
   *         - CAPACITY if the parser does not have enough capacity and len > max_capacity.
   *         - other json errors if parsing fails. You should not rely on these errors to always the same for the
   *           same document: they may vary under runtime dispatch (so they may vary depending on your system and hardware).
   */
  inline simdjson_result<element> load_into_document(document& doc, std::string_view path) & noexcept;
  inline simdjson_result<element> load_into_document(document& doc, std::string_view path) && =delete;

  /**
   * Parse a JSON document and return a temporary reference to it.
   *
   *   dom::parser parser;
   *   element doc_root = parser.parse(buf, len);
   *
   * The function eagerly parses the input: the input can be modified and discarded after
   * the `parser.parse(buf, len)` call has completed.
   *
   * ### IMPORTANT: Document Lifetime
   *
   * The JSON document still lives in the parser: this is the most efficient way to parse JSON
   * documents because it reuses the same buffers, but you *must* use the document before you
   * destroy the parser or call parse() again.
   *
   * Moving the parser instance is safe, but it invalidates the element instances. You may store
   * the parser instance without moving it by wrapping it inside an `unique_ptr` instance like
   * so: `std::unique_ptr<dom::parser> parser(new dom::parser{});`.
   *
   * ### REQUIRED: Buffer Padding
   *
   * The buffer must have at least SIMDJSON_PADDING extra allocated bytes. It does not matter what
   * those bytes are initialized to, as long as they are allocated. These bytes will be read: if you
   * using a sanitizer that verifies that no uninitialized byte is read, then you should initialize the
   * SIMDJSON_PADDING bytes to avoid runtime warnings.
   *
   * If realloc_if_needed is true (the default), it is assumed that the buffer does *not* have enough padding,
   * and it is copied into an enlarged temporary buffer before parsing. Thus the following is safe:
   *
   *   const char *json      = R"({"key":"value"})";
   *   const size_t json_len = std::strlen(json);
   *   simdjson::dom::parser parser;
   *   simdjson::dom::element element = parser.parse(json, json_len);
   *
   * If you set realloc_if_needed to false (e.g., parser.parse(json, json_len, false)),
   * you must provide a buffer with at least SIMDJSON_PADDING extra bytes at the end.
   * The benefit of setting realloc_if_needed to false is that you avoid a temporary
   * memory allocation and a copy.
   *
   * The padded bytes may be read. It is not important how you initialize
   * these bytes though we recommend a sensible default like null character values or spaces.
   * For example, the following low-level code is safe:
   *
   *   const char *json      = R"({"key":"value"})";
   *   const size_t json_len = std::strlen(json);
   *   std::unique_ptr<char[]> padded_json_copy{new char[json_len + SIMDJSON_PADDING]};
   *   std::memcpy(padded_json_copy.get(), json, json_len);
   *   std::memset(padded_json_copy.get() + json_len, '\0', SIMDJSON_PADDING);
   *   simdjson::dom::parser parser;
   *   simdjson::dom::element element = parser.parse(padded_json_copy.get(), json_len, false);
   *
   * ### std::string references
   *
   * Whenever you pass an std::string reference, the parser may access the bytes beyond the end of
   * the string but before the end of the allocated memory (std::string::capacity()).
   * If you are using a sanitizer that checks for reading uninitialized bytes or std::string's
   * container-overflow checks, you may encounter sanitizer warnings.
   * You can safely ignore these warnings. Or you can call simdjson::pad(std::string&) to pad the
   * string with SIMDJSON_PADDING spaces: this function returns a simdjson::padding_string_view
   * which can be be passed to the parser's parse function:
   *
   *    std::string json = R"({ "foo": 1 } { "foo": 2 } { "foo": 3 } )";
   *    element doc = parser.parse(simdjson::pad(json));
   *
   * ### Parser Capacity
   *
   * If the parser's current capacity is less than len, it will allocate enough capacity
   * to handle it (up to max_capacity).
   *
   * @param buf The JSON to parse. Must have at least len + SIMDJSON_PADDING allocated bytes, unless
   *            realloc_if_needed is true.
   * @param len The length of the JSON.
   * @param realloc_if_needed Whether to reallocate and enlarge the JSON buffer to add padding.
   * @return An element pointing at the root of the document, or an error:
   *         - MEMALLOC if realloc_if_needed is true or the parser does not have enough capacity,
   *           and memory allocation fails.
   *         - CAPACITY if the parser does not have enough capacity and len > max_capacity.
   *         - other json errors if parsing fails. You should not rely on these errors to always the same for the
   *           same document: they may vary under runtime dispatch (so they may vary depending on your system and hardware).
   */
  inline simdjson_result<element> parse(const uint8_t *buf, size_t len, bool realloc_if_needed = true) & noexcept;
  inline simdjson_result<element> parse(const uint8_t *buf, size_t len, bool realloc_if_needed = true) && =delete;
  /** @overload parse(const uint8_t *buf, size_t len, bool realloc_if_needed) */
  simdjson_inline simdjson_result<element> parse(const char *buf, size_t len, bool realloc_if_needed = true) & noexcept;
  simdjson_inline simdjson_result<element> parse(const char *buf, size_t len, bool realloc_if_needed = true) && =delete;
  /** @overload parse(const std::string &) */
  simdjson_inline simdjson_result<element> parse(const std::string &s) & noexcept;
  simdjson_inline simdjson_result<element> parse(const std::string &s) && =delete;
  /** @overload parse(const uint8_t *buf, size_t len, bool realloc_if_needed) */
  simdjson_inline simdjson_result<element> parse(const padded_string &s) & noexcept;
  simdjson_inline simdjson_result<element> parse(const padded_string &s) && =delete;
  /** @overload parse(const uint8_t *buf, size_t len, bool realloc_if_needed) */
  simdjson_inline simdjson_result<element> parse(const padded_string_view &v) & noexcept;
  simdjson_inline simdjson_result<element> parse(const padded_string_view &v) && =delete;

  /** @private We do not want to allow implicit conversion from C string to std::string. */
  simdjson_inline simdjson_result<element> parse(const char *buf) noexcept = delete;

  /**
   * Parse a JSON document into a provide document instance and return a temporary reference to it.
   * It is similar to the function `parse` except that instead of parsing into the internal
   * `document` instance associated with the parser, it allows the user to provide a document
   * instance.
   *
   *   dom::parser parser;
   *   dom::document doc;
   *   element doc_root = parser.parse_into_document(doc, buf, len);
   *
   * The function eagerly parses the input: the input can be modified and discarded after
   * the `parser.parse(buf, len)` call has completed.
   *
   * ### IMPORTANT: Document Lifetime
   *
   * After the call to parse_into_document, the parser is no longer needed.
   *
   * The JSON document lives in the document instance: you must keep the document
   * instance alive while you navigate through it (i.e., used the returned value from
   * parse_into_document). You are encourage to reuse the document instance
   * many times with new data to avoid reallocations:
   *
   *   dom::document doc;
   *   element doc_root1 = parser.parse_into_document(doc, buf1, len);
   *   //... doc_root1 is a pointer inside doc
   *   element doc_root2 = parser.parse_into_document(doc, buf1, len);
   *   //... doc_root2 is a pointer inside doc
   *   // at this point doc_root1 is no longer safe
   *
   * Moving the document instance is safe, but it invalidates the element instances. After
   * moving a document, you can recover safe access to the document root with its `root()` method.
   *
   * @param doc The document instance where the parsed data will be stored (on success).
   * @param buf The JSON to parse. Must have at least len + SIMDJSON_PADDING allocated bytes, unless
   *            realloc_if_needed is true.
   * @param len The length of the JSON.
   * @param realloc_if_needed Whether to reallocate and enlarge the JSON buffer to add padding.
   * @return An element pointing at the root of document, or an error:
   *         - MEMALLOC if realloc_if_needed is true or the parser does not have enough capacity,
   *           and memory allocation fails.
   *         - CAPACITY if the parser does not have enough capacity and len > max_capacity.
   *         - other json errors if parsing fails. You should not rely on these errors to always the same for the
   *           same document: they may vary under runtime dispatch (so they may vary depending on your system and hardware).
   */
  inline simdjson_result<element> parse_into_document(document& doc, const uint8_t *buf, size_t len, bool realloc_if_needed = true) & noexcept;
  inline simdjson_result<element> parse_into_document(document& doc, const uint8_t *buf, size_t len, bool realloc_if_needed = true) && =delete;
  /** @overload parse_into_document(const uint8_t *buf, size_t len, bool realloc_if_needed) */
  simdjson_inline simdjson_result<element> parse_into_document(document& doc, const char *buf, size_t len, bool realloc_if_needed = true) & noexcept;
  simdjson_inline simdjson_result<element> parse_into_document(document& doc, const char *buf, size_t len, bool realloc_if_needed = true) && =delete;
  /** @overload parse_into_document(const uint8_t *buf, size_t len, bool realloc_if_needed) */
  simdjson_inline simdjson_result<element> parse_into_document(document& doc, const std::string &s) & noexcept;
  simdjson_inline simdjson_result<element> parse_into_document(document& doc, const std::string &s) && =delete;
  /** @overload parse_into_document(const uint8_t *buf, size_t len, bool realloc_if_needed) */
  simdjson_inline simdjson_result<element> parse_into_document(document& doc, const padded_string &s) & noexcept;
  simdjson_inline simdjson_result<element> parse_into_document(document& doc, const padded_string &s) && =delete;

  /** @private We do not want to allow implicit conversion from C string to std::string. */
  simdjson_inline simdjson_result<element> parse_into_document(document& doc, const char *buf) noexcept = delete;

  /**
   * Load a file containing many JSON documents.
   *
   *   dom::parser parser;
   *   for (const element doc : parser.load_many(path)) {
   *     cout << std::string(doc["title"]) << endl;
   *   }
   *
   * The file is loaded in memory and can be safely deleted after the `parser.load_many(path)`
   * function has returned. The memory is held by the `parser` instance.
   *
   * The function is lazy: it may be that no more than one JSON document at a time is parsed.
   * And, possibly, no document many have been parsed when the `parser.load_many(path)` function
   * returned.
   *
   * If there is a UTF-8 BOM, the parser skips it.
   *
   * ### Format
   *
   * The file must contain a series of one or more JSON documents, concatenated into a single
   * buffer, separated by whitespace. It effectively parses until it has a fully valid document,
   * then starts parsing the next document at that point. (It does this with more parallelism and
   * lookahead than you might think, though.)
   *
   * Documents that consist of an object or array may omit the whitespace between them, concatenating
   * with no separator. documents that consist of a single primitive (i.e. documents that are not
   * arrays or objects) MUST be separated with whitespace.
   *
   * The documents must not exceed batch_size bytes (by default 1MB) or they will fail to parse.
   * Setting batch_size to excessively large or excessively small values may impact negatively the
   * performance.
   *
   * ### Error Handling
   *
   * All errors are returned during iteration: if there is a global error such as memory allocation,
   * it will be yielded as the first result. Iteration always stops after the first error.
   *
   * As with all other simdjson methods, non-exception error handling is readily available through
   * the same interface, requiring you to check the error before using the document:
   *
   *   dom::parser parser;
   *   dom::document_stream docs;
   *   auto error = parser.load_many(path).get(docs);
   *   if (error) { cerr << error << endl; exit(1); }
   *   for (auto doc : docs) {
   *     std::string_view title;
   *     if ((error = doc["title"].get(title)) { cerr << error << endl; exit(1); }
   *     cout << title << endl;
   *   }
   *
   * ### Threads
   *
   * When compiled with SIMDJSON_THREADS_ENABLED, this method will use a single thread under the
   * hood to do some lookahead.
   *
   * ### Parser Capacity
   *
   * If the parser's current capacity is less than batch_size, it will allocate enough capacity
   * to handle it (up to max_capacity).
   *
   * @param path File name pointing at the concatenated JSON to parse.
   * @param batch_size The batch size to use. MUST be larger than the largest document. The sweet
   *                   spot is cache-related: small enough to fit in cache, yet big enough to
   *                   parse as many documents as possible in one tight loop.
   *                   Defaults to 1MB (as simdjson::dom::DEFAULT_BATCH_SIZE), which has been a reasonable sweet
   *                   spot in our tests.
   *                   If you set the batch_size to a value smaller than simdjson::dom::MINIMAL_BATCH_SIZE
   *                   (currently 32B), it will be replaced by simdjson::dom::MINIMAL_BATCH_SIZE.
   * @return The stream, or an error. An empty input will yield 0 documents rather than an EMPTY error. Errors:
   *         - IO_ERROR if there was an error opening or reading the file.
   *         - MEMALLOC if the parser does not have enough capacity and memory allocation fails.
   *         - CAPACITY if the parser does not have enough capacity and batch_size > max_capacity.
   *         - other json errors if parsing fails. You should not rely on these errors to always the same for the
   *           same document: they may vary under runtime dispatch (so they may vary depending on your system and hardware).
   */
  inline simdjson_result<document_stream> load_many(std::string_view path, size_t batch_size = dom::DEFAULT_BATCH_SIZE) noexcept;

  /**
   * Parse a buffer containing many JSON documents.
   *
   *   dom::parser parser;
   *   for (element doc : parser.parse_many(buf, len)) {
   *     cout << std::string(doc["title"]) << endl;
   *   }
   *
   * No copy of the input buffer is made.
   *
   * The function is lazy: it may be that no more than one JSON document at a time is parsed.
   * And, possibly, no document many have been parsed when the `parser.load_many(path)` function
   * returned.
   *
   * The caller is responsabile to ensure that the input string data remains unchanged and is
   * not deleted during the loop. In particular, the following is unsafe and will not compile:
   *
   *   auto docs = parser.parse_many("[\"temporary data\"]"_padded);
   *   // here the string "[\"temporary data\"]" may no longer exist in memory
   *   // the parser instance may not have even accessed the input yet
   *   for (element doc : docs) {
   *     cout << std::string(doc["title"]) << endl;
   *   }
   *
   * The following is safe:
   *
   *   auto json = "[\"temporary data\"]"_padded;
   *   auto docs = parser.parse_many(json);
   *   for (element doc : docs) {
   *     cout << std::string(doc["title"]) << endl;
   *   }
   *
   * If there is a UTF-8 BOM, the parser skips it.
   *
   * ### Format
   *
   * The buffer must contain a series of one or more JSON documents, concatenated into a single
   * buffer, separated by whitespace. It effectively parses until it has a fully valid document,
   * then starts parsing the next document at that point. (It does this with more parallelism and
   * lookahead than you might think, though.)
   *
   * documents that consist of an object or array may omit the whitespace between them, concatenating
   * with no separator. documents that consist of a single primitive (i.e. documents that are not
   * arrays or objects) MUST be separated with whitespace.
   *
   * The documents must not exceed batch_size bytes (by default 1MB) or they will fail to parse.
   * Setting batch_size to excessively large or excessively small values may impact negatively the
   * performance.
   *
   * ### Error Handling
   *
   * All errors are returned during iteration: if there is a global error such as memory allocation,
   * it will be yielded as the first result. Iteration always stops after the first error.
   *
   * As with all other simdjson methods, non-exception error handling is readily available through
   * the same interface, requiring you to check the error before using the document:
   *
   *   dom::parser parser;
   *   dom::document_stream docs;
   *   auto error = parser.load_many(path).get(docs);
   *   if (error) { cerr << error << endl; exit(1); }
   *   for (auto doc : docs) {
   *     std::string_view title;
   *     if ((error = doc["title"].get(title)) { cerr << error << endl; exit(1); }
   *     cout << title << endl;
   *   }
   *
   * ### REQUIRED: Buffer Padding
   *
   * The buffer must have at least SIMDJSON_PADDING extra allocated bytes. It does not matter what
   * those bytes are initialized to, as long as they are allocated. These bytes will be read: if you
   * using a sanitizer that verifies that no uninitialized byte is read, then you should initialize the
   * SIMDJSON_PADDING bytes to avoid runtime warnings.
   *
   * ### Threads
   *
   * When compiled with SIMDJSON_THREADS_ENABLED, this method will use a single thread under the
   * hood to do some lookahead.
   *
   * ### Parser Capacity
   *
   * If the parser's current capacity is less than batch_size, it will allocate enough capacity
   * to handle it (up to max_capacity).
   *
   * @param buf The concatenated JSON to parse. Must have at least len + SIMDJSON_PADDING allocated bytes.
   * @param len The length of the concatenated JSON.
   * @param batch_size The batch size to use. MUST be larger than the largest document. The sweet
   *                   spot is cache-related: small enough to fit in cache, yet big enough to
   *                   parse as many documents as possible in one tight loop.
   *                   Defaults to 10MB, which has been a reasonable sweet spot in our tests.
   * @return The stream, or an error. An empty input will yield 0 documents rather than an EMPTY error. Errors:
   *         - MEMALLOC if the parser does not have enough capacity and memory allocation fails
   *         - CAPACITY if the parser does not have enough capacity and batch_size > max_capacity.
   *         - other json errors if parsing fails. You should not rely on these errors to always the same for the
   *           same document: they may vary under runtime dispatch (so they may vary depending on your system and hardware).
   */
  inline simdjson_result<document_stream> parse_many(const uint8_t *buf, size_t len, size_t batch_size = dom::DEFAULT_BATCH_SIZE) noexcept;
  /** @overload parse_many(const uint8_t *buf, size_t len, size_t batch_size) */
  inline simdjson_result<document_stream> parse_many(const char *buf, size_t len, size_t batch_size = dom::DEFAULT_BATCH_SIZE) noexcept;
  /** @overload parse_many(const uint8_t *buf, size_t len, size_t batch_size) */
  inline simdjson_result<document_stream> parse_many(const std::string &s, size_t batch_size = dom::DEFAULT_BATCH_SIZE) noexcept;
  inline simdjson_result<document_stream> parse_many(const std::string &&s, size_t batch_size) = delete;// unsafe
  /** @overload parse_many(const uint8_t *buf, size_t len, size_t batch_size) */
  inline simdjson_result<document_stream> parse_many(const padded_string &s, size_t batch_size = dom::DEFAULT_BATCH_SIZE) noexcept;
  inline simdjson_result<document_stream> parse_many(const padded_string &&s, size_t batch_size) = delete;// unsafe

  /** @private We do not want to allow implicit conversion from C string to std::string. */
  simdjson_result<document_stream> parse_many(const char *buf, size_t batch_size = dom::DEFAULT_BATCH_SIZE) noexcept = delete;

  /**
   * Ensure this parser has enough memory to process JSON documents up to `capacity` bytes in length
   * and `max_depth` depth.
   *
   * @param capacity The new capacity.
   * @param max_depth The new max_depth. Defaults to DEFAULT_MAX_DEPTH.
   * @return The error, if there is one.
   */
  simdjson_warn_unused inline error_code allocate(size_t capacity, size_t max_depth = DEFAULT_MAX_DEPTH) noexcept;

#ifndef SIMDJSON_DISABLE_DEPRECATED_API
  /**
   * @private deprecated because it returns bool instead of error_code, which is our standard for
   * failures. Use allocate() instead.
   *
   * Ensure this parser has enough memory to process JSON documents up to `capacity` bytes in length
   * and `max_depth` depth.
   *
   * @param capacity The new capacity.
   * @param max_depth The new max_depth. Defaults to DEFAULT_MAX_DEPTH.
   * @return true if successful, false if allocation failed.
   */
  [[deprecated("Use allocate() instead.")]]
  simdjson_warn_unused inline bool allocate_capacity(size_t capacity, size_t max_depth = DEFAULT_MAX_DEPTH) noexcept;
#endif // SIMDJSON_DISABLE_DEPRECATED_API
  /**
   * The largest document this parser can support without reallocating.
   *
   * @return Current capacity, in bytes.
   */
  simdjson_inline size_t capacity() const noexcept;

  /**
   * The largest document this parser can automatically support.
   *
   * The parser may reallocate internal buffers as needed up to this amount.
   *
   * @return Maximum capacity, in bytes.
   */
  simdjson_inline size_t max_capacity() const noexcept;

  /**
   * The maximum level of nested object and arrays supported by this parser.
   *
   * @return Maximum depth, in bytes.
   */
  simdjson_pure simdjson_inline size_t max_depth() const noexcept;

  /**
   * Set max_capacity. This is the largest document this parser can automatically support.
   *
   * The parser may reallocate internal buffers as needed up to this amount as documents are passed
   * to it.
   *
   * Note: To avoid limiting the memory to an absurd value, such as zero or two bytes,
   * iff you try to set max_capacity to a value lower than MINIMAL_DOCUMENT_CAPACITY,
   * then the maximal capacity is set to MINIMAL_DOCUMENT_CAPACITY.
   *
   * This call will not allocate or deallocate, even if capacity is currently above max_capacity.
   *
   * @param max_capacity The new maximum capacity, in bytes.
   */
  simdjson_inline void set_max_capacity(size_t max_capacity) noexcept;

#ifdef SIMDJSON_THREADS_ENABLED
  /**
   * The parser instance can use threads when they are available to speed up some
   * operations. It is enabled by default. Changing this attribute will change the
   * behavior of the parser for future operations. Set to true by default.
   */
  bool threaded{true};
#else
  /**
   * When SIMDJSON_THREADS_ENABLED is not defined, the parser instance cannot use threads.
   */
  bool threaded{false};
#endif
  /** @private Use the new DOM API instead */
  class Iterator;
  /** @private Use simdjson_error instead */
  using InvalidJSON [[deprecated("Use simdjson_error instead")]] = simdjson_error;

  /** @private [for benchmarking access] The implementation to use */
  std::unique_ptr<internal::dom_parser_implementation> implementation{};

  /** @private Use `if (parser.parse(...).error())` instead */
  bool valid{false};
  /** @private Use `parser.parse(...).error()` instead */
  error_code error{UNINITIALIZED};

  /** @private Use `parser.parse(...).value()` instead */
  document doc{};

  /** @private returns true if the document parsed was valid */
  [[deprecated("Use the result of parser.parse() instead")]]
  inline bool is_valid() const noexcept;

  /**
   * @private return an error code corresponding to the last parsing attempt, see
   * simdjson.h will return UNINITIALIZED if no parsing was attempted
   */
  [[deprecated("Use the result of parser.parse() instead")]]
  inline int get_error_code() const noexcept;

  /** @private return the string equivalent of "get_error_code" */
  [[deprecated("Use error_message() on the result of parser.parse() instead, or cout << error")]]
  inline std::string get_error_message() const noexcept;

  /** @private */
  [[deprecated("Use cout << on the result of parser.parse() instead")]]
  inline bool print_json(std::ostream &os) const noexcept;

  /** @private Private and deprecated: use `parser.parse(...).doc.dump_raw_tape()` instead */
  inline bool dump_raw_tape(std::ostream &os) const noexcept;


private:
  /**
   * The maximum document length this parser will automatically support.
   *
   * The parser will not be automatically allocated above this amount.
   */
  size_t _max_capacity;

  /**
   * The loaded buffer (reused each time load() is called)
   */
  std::unique_ptr<char[]> loaded_bytes;

  /** Capacity of loaded_bytes buffer. */
  size_t _loaded_bytes_capacity{0};

  // all nodes are stored on the doc.tape using a 64-bit word.
  //
  // strings, double and ints are stored as
  //  a 64-bit word with a pointer to the actual value
  //
  //
  //
  // for objects or arrays, store [ or {  at the beginning and } and ] at the
  // end. For the openings ([ or {), we annotate them with a reference to the
  // location on the doc.tape of the end, and for then closings (} and ]), we
  // annotate them with a reference to the location of the opening
  //
  //

  /**
   * Ensure we have enough capacity to handle at least desired_capacity bytes,
   * and auto-allocate if not. This also allocates memory if needed in the
   * internal document.
   */
  inline error_code ensure_capacity(size_t desired_capacity) noexcept;
  /**
   * Ensure we have enough capacity to handle at least desired_capacity bytes,
   * and auto-allocate if not. This also allocates memory if needed in the
   * provided document.
   */
  inline error_code ensure_capacity(document& doc, size_t desired_capacity) noexcept;

  /** Read the file into loaded_bytes */
  inline simdjson_result<size_t> read_file(std::string_view path) noexcept;

  friend class parser::Iterator;
  friend class document_stream;


}; // class parser

} // namespace dom
} // namespace simdjson

#endif // SIMDJSON_DOM_PARSER_H
/* end file simdjson/dom/parser.h */

#ifdef SIMDJSON_THREADS_ENABLED
#include <thread>
#include <mutex>
#include <condition_variable>
#endif

namespace simdjson {
namespace dom {

#ifdef SIMDJSON_THREADS_ENABLED
/** @private Custom worker class **/
struct stage1_worker {
  stage1_worker() noexcept = default;
  stage1_worker(const stage1_worker&) = delete;
  stage1_worker(stage1_worker&&) = delete;
  stage1_worker operator=(const stage1_worker&) = delete;
  ~stage1_worker();
  /**
   * We only start the thread when it is needed, not at object construction, this may throw.
   * You should only call this once.
   **/
  void start_thread();
  /**
   * Start a stage 1 job. You should first call 'run', then 'finish'.
   * You must call start_thread once before.
   */
  void run(document_stream * ds, dom::parser * stage1, size_t next_batch_start);
  /** Wait for the run to finish (blocking). You should first call 'run', then 'finish'. **/
  void finish();

private:

  /**
   * Normally, we would never stop the thread. But we do in the destructor.
   * This function is only safe assuming that you are not waiting for results. You
   * should have called run, then finish, and be done.
   **/
  void stop_thread();

  std::thread thread{};
  /** These three variables define the work done by the thread. **/
  dom::parser * stage1_thread_parser{};
  size_t _next_batch_start{};
  document_stream * owner{};
  /**
   * We have two state variables. This could be streamlined to one variable in the future but
   * we use two for clarity.
   */
  bool has_work{false};
  bool can_work{true};

  /**
   * We lock using a mutex.
   */
  std::mutex locking_mutex{};
  std::condition_variable cond_var{};
};
#endif

/**
 * A forward-only stream of documents.
 *
 * Produced by parser::parse_many.
 *
 */
class document_stream {
public:
  /**
   * Construct an uninitialized document_stream.
   *
   *  ```cpp
   *  document_stream docs;
   *  error = parser.parse_many(json).get(docs);
   *  ```
   */
  simdjson_inline document_stream() noexcept;
  /** Move one document_stream to another. */
  simdjson_inline document_stream(document_stream &&other) noexcept = default;
  /** Move one document_stream to another. */
  simdjson_inline document_stream &operator=(document_stream &&other) noexcept = default;

  simdjson_inline ~document_stream() noexcept;
  /**
   * Returns the input size in bytes.
   */
  inline size_t size_in_bytes() const noexcept;
  /**
   * After iterating through the stream, this method
   * returns the number of bytes that were not parsed at the end
   * of the stream. If truncated_bytes() differs from zero,
   * then the input was truncated maybe because incomplete JSON
   * documents were found at the end of the stream. You
   * may need to process the bytes in the interval [size_in_bytes()-truncated_bytes(), size_in_bytes()).
   *
   * You should only call truncated_bytes() after streaming through all
   * documents, like so:
   *
   *   document_stream stream = parser.parse_many(json,window);
   *   for(auto doc : stream) {
   *      // do something with doc
   *   }
   *   size_t truncated = stream.truncated_bytes();
   *
   */
  inline size_t truncated_bytes() const noexcept;
  /**
   * An iterator through a forward-only stream of documents.
   */
  class iterator {
  public:
    using value_type = simdjson_result<element>;
    using reference  = value_type;

    using difference_type   = std::ptrdiff_t;

    using iterator_category = std::input_iterator_tag;

    /**
     * Default constructor.
     */
    simdjson_inline iterator() noexcept;
    /**
     * Get the current document (or error).
     */
    simdjson_inline reference operator*() noexcept;
    /**
     * Advance to the next document (prefix).
     */
    inline iterator& operator++() noexcept;
    /**
     * Check if we're at the end yet.
     * @param other the end iterator to compare to.
     */
    simdjson_inline bool operator!=(const iterator &other) const noexcept;
    /**
     * @private
     *
     * Gives the current index in the input document in bytes.
     *
     *   document_stream stream = parser.parse_many(json,window);
     *   for(auto i = stream.begin(); i != stream.end(); ++i) {
     *      auto doc = *i;
     *      size_t index = i.current_index();
     *   }
     *
     * This function (current_index()) is experimental and the usage
     * may change in future versions of simdjson: we find the API somewhat
     * awkward and we would like to offer something friendlier.
     */
     simdjson_inline size_t current_index() const noexcept;
    /**
     * @private
     *
     * Gives a view of the current document.
     *
     *   document_stream stream = parser.parse_many(json,window);
     *   for(auto i = stream.begin(); i != stream.end(); ++i) {
     *      auto doc = *i;
     *      std::string_view v = i->source();
     *   }
     *
     * The returned string_view instance is simply a map to the (unparsed)
     * source string: it may thus include white-space characters and all manner
     * of padding.
     *
     * This function (source()) is experimental and the usage
     * may change in future versions of simdjson: we find the API somewhat
     * awkward and we would like to offer something friendlier.
     */
     simdjson_inline std::string_view source() const noexcept;

  private:
    simdjson_inline iterator(document_stream *s, bool finished) noexcept;
    /** The document_stream we're iterating through. */
    document_stream* stream;
    /** Whether we're finished or not. */
    bool finished;
    friend class document_stream;
  };

  /**
   * Start iterating the documents in the stream.
   */
  simdjson_inline iterator begin() noexcept;
  /**
   * The end of the stream, for iterator comparison purposes.
   */
  simdjson_inline iterator end() noexcept;

private:

  document_stream &operator=(const document_stream &) = delete; // Disallow copying
  document_stream(const document_stream &other) = delete; // Disallow copying

  /**
   * Construct a document_stream. Does not allocate or parse anything until the iterator is
   * used.
   *
   * @param parser is a reference to the parser instance used to generate this document_stream
   * @param buf is the raw byte buffer we need to process
   * @param len is the length of the raw byte buffer in bytes
   * @param batch_size is the size of the windows (must be strictly greater or equal to the largest JSON document)
   */
  simdjson_inline document_stream(
    dom::parser &parser,
    const uint8_t *buf,
    size_t len,
    size_t batch_size
  ) noexcept;

  /**
   * Parse the first document in the buffer. Used by begin(), to handle allocation and
   * initialization.
   */
  inline void start() noexcept;

  /**
   * Parse the next document found in the buffer previously given to document_stream.
   *
   * The content should be a valid JSON document encoded as UTF-8. If there is a
   * UTF-8 BOM, the parser skips it.
   *
   * You do NOT need to pre-allocate a parser.  This function takes care of
   * pre-allocating a capacity defined by the batch_size defined when creating the
   * document_stream object.
   *
   * The function returns simdjson::EMPTY if there is no more data to be parsed.
   *
   * The function returns simdjson::SUCCESS (as integer = 0) in case of success
   * and indicates that the buffer has successfully been parsed to the end.
   * Every document it contained has been parsed without error.
   *
   * The function returns an error code from simdjson/simdjson.h in case of failure
   * such as simdjson::CAPACITY, simdjson::MEMALLOC, simdjson::DEPTH_ERROR and so forth;
   * the simdjson::error_message function converts these error codes into a string).
   *
   * You can also check validity by calling parser.is_valid(). The same parser can
   * and should be reused for the other documents in the buffer.
   */
  inline void next() noexcept;

  /**
   * Pass the next batch through stage 1 and return when finished.
   * When threads are enabled, this may wait for the stage 1 thread to finish.
   */
  inline void load_batch() noexcept;

  /** Get the next document index. */
  inline size_t next_batch_start() const noexcept;

  /** Pass the next batch through stage 1 with the given parser. */
  inline error_code run_stage1(dom::parser &p, size_t batch_start) noexcept;

  dom::parser *parser;
  const uint8_t *buf;
  size_t len;
  size_t batch_size;
  /** The error (or lack thereof) from the current document. */
  error_code error;
  size_t batch_start{0};
  size_t doc_index{};
#ifdef SIMDJSON_THREADS_ENABLED
  /** Indicates whether we use threads. Note that this needs to be a constant during the execution of the parsing. */
  bool use_thread;

  inline void load_from_stage1_thread() noexcept;

  /** Start a thread to run stage 1 on the next batch. */
  inline void start_stage1_thread() noexcept;

  /** Wait for the stage 1 thread to finish and capture the results. */
  inline void finish_stage1_thread() noexcept;

  /** The error returned from the stage 1 thread. */
  error_code stage1_thread_error{UNINITIALIZED};
  /** The thread used to run stage 1 against the next batch in the background. */
  friend struct stage1_worker;
  std::unique_ptr<stage1_worker> worker{new(std::nothrow) stage1_worker()};
  /**
   * The parser used to run stage 1 in the background. Will be swapped
   * with the regular parser when finished.
   */
  dom::parser stage1_thread_parser{};
#endif // SIMDJSON_THREADS_ENABLED

  friend class dom::parser;
  friend struct simdjson_result<dom::document_stream>;
  friend struct internal::simdjson_result_base<dom::document_stream>;

}; // class document_stream

} // namespace dom

template<>
struct simdjson_result<dom::document_stream> : public internal::simdjson_result_base<dom::document_stream> {
public:
  simdjson_inline simdjson_result() noexcept; ///< @private
  simdjson_inline simdjson_result(error_code error) noexcept; ///< @private
  simdjson_inline simdjson_result(dom::document_stream &&value) noexcept; ///< @private

#if SIMDJSON_EXCEPTIONS
  simdjson_inline dom::document_stream::iterator begin() noexcept(false);
  simdjson_inline dom::document_stream::iterator end() noexcept(false);
#else // SIMDJSON_EXCEPTIONS
#ifndef SIMDJSON_DISABLE_DEPRECATED_API
  [[deprecated("parse_many() and load_many() may return errors. Use document_stream stream; error = parser.parse_many().get(doc); instead.")]]
  simdjson_inline dom::document_stream::iterator begin() noexcept;
  [[deprecated("parse_many() and load_many() may return errors. Use document_stream stream; error = parser.parse_many().get(doc); instead.")]]
  simdjson_inline dom::document_stream::iterator end() noexcept;
#endif // SIMDJSON_DISABLE_DEPRECATED_API
#endif // SIMDJSON_EXCEPTIONS
}; // struct simdjson_result<dom::document_stream>

} // namespace simdjson

#endif // SIMDJSON_DOCUMENT_STREAM_H
/* end file simdjson/dom/document_stream.h */
/* skipped duplicate #include "simdjson/dom/document.h" */
/* including simdjson/dom/element.h: #include "simdjson/dom/element.h" */
/* begin file simdjson/dom/element.h */
#ifndef SIMDJSON_DOM_ELEMENT_H
#define SIMDJSON_DOM_ELEMENT_H

#include <vector>

/* skipped duplicate #include "simdjson/dom/base.h" */
/* skipped duplicate #include "simdjson/dom/array.h" */

namespace simdjson {
namespace dom {

/**
 * The actual concrete type of a JSON element
 * This is the type it is most easily cast to with get<>.
 */
enum class element_type {
  ARRAY = '[',     ///< dom::array
  OBJECT = '{',    ///< dom::object
  INT64 = 'l',     ///< int64_t
  UINT64 = 'u',    ///< uint64_t: any integer that fits in uint64_t but *not* int64_t
  DOUBLE = 'd',    ///< double: Any number with a "." or "e" that fits in double.
  STRING = '"',    ///< std::string_view
  BOOL = 't',      ///< bool
  NULL_VALUE = 'n' ///< null
};

/**
 * A JSON element.
 *
 * References an element in a JSON document, representing a JSON null, boolean, string, number,
 * array or object.
 */
class element {
public:
  /** Create a new, invalid element. */
  simdjson_inline element() noexcept;

  /** The type of this element. */
  simdjson_inline element_type type() const noexcept;

  /**
   * Cast this element to an array.
   *
   * @returns An object that can be used to iterate the array, or:
   *          INCORRECT_TYPE if the JSON element is not an array.
   */
  inline simdjson_result<array> get_array() const noexcept;
  /**
   * Cast this element to an object.
   *
   * @returns An object that can be used to look up or iterate the object's fields, or:
   *          INCORRECT_TYPE if the JSON element is not an object.
   */
  inline simdjson_result<object> get_object() const noexcept;
  /**
   * Cast this element to a null-terminated C string.
   *
   * The string is guaranteed to be valid UTF-8.
   *
   * The length of the string is given by get_string_length(). Because JSON strings
   * may contain null characters, it may be incorrect to use strlen to determine the
   * string length.
   *
   * It is possible to get a single string_view instance which represents both the string
   * content and its length: see get_string().
   *
   * @returns A pointer to a null-terminated UTF-8 string. This string is stored in the parser and will
   *          be invalidated the next time it parses a document or when it is destroyed.
   *          Returns INCORRECT_TYPE if the JSON element is not a string.
   */
  inline simdjson_result<const char *> get_c_str() const noexcept;
  /**
   * Gives the length in bytes of the string.
   *
   * It is possible to get a single string_view instance which represents both the string
   * content and its length: see get_string().
   *
   * @returns A string length in bytes.
   *          Returns INCORRECT_TYPE if the JSON element is not a string.
   */
  inline simdjson_result<size_t> get_string_length() const noexcept;
  /**
   * Cast this element to a string.
   *
   * The string is guaranteed to be valid UTF-8.
   *
   * @returns An UTF-8 string. The string is stored in the parser and will be invalidated the next time it
   *          parses a document or when it is destroyed.
   *          Returns INCORRECT_TYPE if the JSON element is not a string.
   */
  inline simdjson_result<std::string_view> get_string() const noexcept;
  /**
   * Cast this element to a signed integer.
   *
   * @returns A signed 64-bit integer.
   *          Returns INCORRECT_TYPE if the JSON element is not an integer, or NUMBER_OUT_OF_RANGE
   *          if it is negative.
   */
  inline simdjson_result<int64_t> get_int64() const noexcept;
  /**
   * Cast this element to an unsigned integer.
   *
   * @returns An unsigned 64-bit integer.
   *          Returns INCORRECT_TYPE if the JSON element is not an integer, or NUMBER_OUT_OF_RANGE
   *          if it is too large.
   */
  inline simdjson_result<uint64_t> get_uint64() const noexcept;
  /**
   * Cast this element to a double floating-point.
   *
   * @returns A double value.
   *          Returns INCORRECT_TYPE if the JSON element is not a number.
   */
  inline simdjson_result<double> get_double() const noexcept;
  /**
   * Cast this element to a bool.
   *
   * @returns A bool value.
   *          Returns INCORRECT_TYPE if the JSON element is not a boolean.
   */
  inline simdjson_result<bool> get_bool() const noexcept;

  /**
   * Whether this element is a json array.
   *
   * Equivalent to is<array>().
   */
  inline bool is_array() const noexcept;
  /**
   * Whether this element is a json object.
   *
   * Equivalent to is<object>().
   */
  inline bool is_object() const noexcept;
  /**
   * Whether this element is a json string.
   *
   * Equivalent to is<std::string_view>() or is<const char *>().
   */
  inline bool is_string() const noexcept;
  /**
   * Whether this element is a json number that fits in a signed 64-bit integer.
   *
   * Equivalent to is<int64_t>().
   */
  inline bool is_int64() const noexcept;
  /**
   * Whether this element is a json number that fits in an unsigned 64-bit integer.
   *
   * Equivalent to is<uint64_t>().
   */
  inline bool is_uint64() const noexcept;
  /**
   * Whether this element is a json number that fits in a double.
   *
   * Equivalent to is<double>().
   */
  inline bool is_double() const noexcept;

  /**
   * Whether this element is a json number.
   *
   * Both integers and floating points will return true.
   */
  inline bool is_number() const noexcept;

  /**
   * Whether this element is a json `true` or `false`.
   *
   * Equivalent to is<bool>().
   */
  inline bool is_bool() const noexcept;
  /**
   * Whether this element is a json `null`.
   */
  inline bool is_null() const noexcept;

  /**
   * Tell whether the value can be cast to provided type (T).
   *
   * Supported types:
   * - Boolean: bool
   * - Number: double, uint64_t, int64_t
   * - String: std::string_view, const char *
   * - Array: dom::array
   * - Object: dom::object
   *
   * @tparam T bool, double, uint64_t, int64_t, std::string_view, const char *, dom::array, dom::object
   */
  template<typename T>
  simdjson_inline bool is() const noexcept;

  /**
   * Get the value as the provided type (T).
   *
   * Supported types:
   * - Boolean: bool
   * - Number: double, uint64_t, int64_t
   * - String: std::string_view, const char *
   * - Array: dom::array
   * - Object: dom::object
   *
   * You may use get_double(), get_bool(), get_uint64(), get_int64(),
   * get_object(), get_array() or get_string() instead.
   *
   * @tparam T bool, double, uint64_t, int64_t, std::string_view, const char *, dom::array, dom::object
   *
   * @returns The value cast to the given type, or:
   *          INCORRECT_TYPE if the value cannot be cast to the given type.
   */

  template<typename T>
  inline simdjson_result<T> get() const noexcept {
    // Unless the simdjson library provides an inline implementation, calling this method should
    // immediately fail.
    static_assert(!sizeof(T), "The get method with given type is not implemented by the simdjson library. "
      "The supported types are Boolean (bool), numbers (double, uint64_t, int64_t), "
      "strings (std::string_view, const char *), arrays (dom::array) and objects (dom::object). "
      "We recommend you use get_double(), get_bool(), get_uint64(), get_int64(), "
      "get_object(), get_array() or get_string() instead of the get template.");
  }

  /**
   * Get the value as the provided type (T).
   *
   * Supported types:
   * - Boolean: bool
   * - Number: double, uint64_t, int64_t
   * - String: std::string_view, const char *
   * - Array: dom::array
   * - Object: dom::object
   *
   * @tparam T bool, double, uint64_t, int64_t, std::string_view, const char *, dom::array, dom::object
   *
   * @param value The variable to set to the value. May not be set if there is an error.
   *
   * @returns The error that occurred, or SUCCESS if there was no error.
   */
  template<typename T>
  simdjson_warn_unused simdjson_inline error_code get(T &value) const noexcept;

  /**
   * Get the value as the provided type (T), setting error if it's not the given type.
   *
   * Supported types:
   * - Boolean: bool
   * - Number: double, uint64_t, int64_t
   * - String: std::string_view, const char *
   * - Array: dom::array
   * - Object: dom::object
   *
   * @tparam T bool, double, uint64_t, int64_t, std::string_view, const char *, dom::array, dom::object
   *
   * @param value The variable to set to the given type. value is undefined if there is an error.
   * @param error The variable to store the error. error is set to error_code::SUCCEED if there is an error.
   */
  template<typename T>
  inline void tie(T &value, error_code &error) && noexcept;

#if SIMDJSON_EXCEPTIONS
  /**
   * Read this element as a boolean.
   *
   * @return The boolean value
   * @exception simdjson_error(INCORRECT_TYPE) if the JSON element is not a boolean.
   */
  inline operator bool() const noexcept(false);

  /**
   * Read this element as a null-terminated UTF-8 string.
   *
   * Be mindful that JSON allows strings to contain null characters.
   *
   * Does *not* convert other types to a string; requires that the JSON type of the element was
   * an actual string.
   *
   * @return The string value.
   * @exception simdjson_error(INCORRECT_TYPE) if the JSON element is not a string.
   */
  inline explicit operator const char*() const noexcept(false);

  /**
   * Read this element as a null-terminated UTF-8 string.
   *
   * Does *not* convert other types to a string; requires that the JSON type of the element was
   * an actual string.
   *
   * @return The string value.
   * @exception simdjson_error(INCORRECT_TYPE) if the JSON element is not a string.
   */
  inline operator std::string_view() const noexcept(false);

  /**
   * Read this element as an unsigned integer.
   *
   * @return The integer value.
   * @exception simdjson_error(INCORRECT_TYPE) if the JSON element is not an integer
   * @exception simdjson_error(NUMBER_OUT_OF_RANGE) if the integer does not fit in 64 bits or is negative
   */
  inline operator uint64_t() const noexcept(false);
  /**
   * Read this element as an signed integer.
   *
   * @return The integer value.
   * @exception simdjson_error(INCORRECT_TYPE) if the JSON element is not an integer
   * @exception simdjson_error(NUMBER_OUT_OF_RANGE) if the integer does not fit in 64 bits
   */
  inline operator int64_t() const noexcept(false);
  /**
   * Read this element as an double.
   *
   * @return The double value.
   * @exception simdjson_error(INCORRECT_TYPE) if the JSON element is not a number
   */
  inline operator double() const noexcept(false);
  /**
   * Read this element as a JSON array.
   *
   * @return The JSON array.
   * @exception simdjson_error(INCORRECT_TYPE) if the JSON element is not an array
   */
  inline operator array() const noexcept(false);
  /**
   * Read this element as a JSON object (key/value pairs).
   *
   * @return The JSON object.
   * @exception simdjson_error(INCORRECT_TYPE) if the JSON element is not an object
   */
  inline operator object() const noexcept(false);

  /**
   * Iterate over each element in this array.
   *
   * @return The beginning of the iteration.
   * @exception simdjson_error(INCORRECT_TYPE) if the JSON element is not an array
   */
  inline dom::array::iterator begin() const noexcept(false);

  /**
   * Iterate over each element in this array.
   *
   * @return The end of the iteration.
   * @exception simdjson_error(INCORRECT_TYPE) if the JSON element is not an array
   */
  inline dom::array::iterator end() const noexcept(false);
#endif // SIMDJSON_EXCEPTIONS

  /**
   * Get the value associated with the given key.
   *
   * The key will be matched against **unescaped** JSON:
   *
   *   dom::parser parser;
   *   int64_t(parser.parse(R"({ "a\n": 1 })"_padded)["a\n"]) == 1
   *   parser.parse(R"({ "a\n": 1 })"_padded)["a\\n"].get_uint64().error() == NO_SUCH_FIELD
   *
   * @return The value associated with this field, or:
   *         - NO_SUCH_FIELD if the field does not exist in the object
   *         - INCORRECT_TYPE if this is not an object
   */
  inline simdjson_result<element> operator[](std::string_view key) const noexcept;

  /**
   * Get the value associated with the given key.
   *
   * The key will be matched against **unescaped** JSON:
   *
   *   dom::parser parser;
   *   int64_t(parser.parse(R"({ "a\n": 1 })"_padded)["a\n"]) == 1
   *   parser.parse(R"({ "a\n": 1 })"_padded)["a\\n"].get_uint64().error() == NO_SUCH_FIELD
   *
   * @return The value associated with this field, or:
   *         - NO_SUCH_FIELD if the field does not exist in the object
   *         - INCORRECT_TYPE if this is not an object
   */
  inline simdjson_result<element> operator[](const char *key) const noexcept;
  simdjson_result<element> operator[](int) const noexcept = delete;


  /**
   * Get the value associated with the given JSON pointer.  We use the RFC 6901
   * https://tools.ietf.org/html/rfc6901 standard.
   *
   *   dom::parser parser;
   *   element doc = parser.parse(R"({ "foo": { "a": [ 10, 20, 30 ] }})"_padded);
   *   doc.at_pointer("/foo/a/1") == 20
   *   doc.at_pointer("/foo")["a"].at(1) == 20
   *   doc.at_pointer("")["foo"]["a"].at(1) == 20
   *
   * It is allowed for a key to be the empty string:
   *
   *   dom::parser parser;
   *   object obj = parser.parse(R"({ "": { "a": [ 10, 20, 30 ] }})"_padded);
   *   obj.at_pointer("//a/1") == 20
   *
   * @return The value associated with the given JSON pointer, or:
   *         - NO_SUCH_FIELD if a field does not exist in an object
   *         - INDEX_OUT_OF_BOUNDS if an array index is larger than an array length
   *         - INCORRECT_TYPE if a non-integer is used to access an array
   *         - INVALID_JSON_POINTER if the JSON pointer is invalid and cannot be parsed
   */
  inline simdjson_result<element> at_pointer(const std::string_view json_pointer) const noexcept;

  inline simdjson_result<std::vector<element>> at_path_with_wildcard(const std::string_view json_path) const noexcept;

  /**
   * Get the value associated with the given JSONPath expression. We only support
   * JSONPath queries that trivially convertible to JSON Pointer queries: key
   * names and array indices.
   *
   * https://www.rfc-editor.org/rfc/rfc9535 (RFC 9535)
   *
   * @return The value associated with the given JSONPath expression, or:
   *         - INVALID_JSON_POINTER if the JSONPath to JSON Pointer conversion fails
   *         - NO_SUCH_FIELD if a field does not exist in an object
   *         - INDEX_OUT_OF_BOUNDS if an array index is larger than an array length
   *         - INCORRECT_TYPE if a non-integer is used to access an array
  */
  inline simdjson_result<element> at_path(std::string_view json_path) const noexcept;

#ifndef SIMDJSON_DISABLE_DEPRECATED_API
  /**
   *
   * Version 0.4 of simdjson used an incorrect interpretation of the JSON Pointer standard
   * and allowed the following :
   *
   *   dom::parser parser;
   *   element doc = parser.parse(R"({ "foo": { "a": [ 10, 20, 30 ] }})"_padded);
   *   doc.at("foo/a/1") == 20
   *
   * Though it is intuitive, it is not compliant with RFC 6901
   * https://tools.ietf.org/html/rfc6901
   *
   * For standard compliance, use the at_pointer function instead.
   *
   * @return The value associated with the given JSON pointer, or:
   *         - NO_SUCH_FIELD if a field does not exist in an object
   *         - INDEX_OUT_OF_BOUNDS if an array index is larger than an array length
   *         - INCORRECT_TYPE if a non-integer is used to access an array
   *         - INVALID_JSON_POINTER if the JSON pointer is invalid and cannot be parsed
   */
  [[deprecated("For standard compliance, use at_pointer instead, and prefix your pointers with a slash '/', see RFC6901 ")]]
  inline simdjson_result<element> at(const std::string_view json_pointer) const noexcept;
#endif // SIMDJSON_DISABLE_DEPRECATED_API

  /**
   * Get the value at the given index.
   *
   * @return The value at the given index, or:
   *         - INDEX_OUT_OF_BOUNDS if the array index is larger than an array length
   */
  inline simdjson_result<element> at(size_t index) const noexcept;

  /**
   * Get the value associated with the given key.
   *
   * The key will be matched against **unescaped** JSON:
   *
   *   dom::parser parser;
   *   int64_t(parser.parse(R"({ "a\n": 1 })"_padded)["a\n"]) == 1
   *   parser.parse(R"({ "a\n": 1 })"_padded)["a\\n"].get_uint64().error() == NO_SUCH_FIELD
   *
   * @return The value associated with this field, or:
   *         - NO_SUCH_FIELD if the field does not exist in the object
   */
  inline simdjson_result<element> at_key(std::string_view key) const noexcept;

  /**
   * Get the value associated with the given key in a case-insensitive manner.
   *
   * Note: The key will be matched against **unescaped** JSON.
   *
   * @return The value associated with this field, or:
   *         - NO_SUCH_FIELD if the field does not exist in the object
   */
  inline simdjson_result<element> at_key_case_insensitive(std::string_view key) const noexcept;

  /**
   * operator< defines a total order for element allowing to use them in
   * ordered C++ STL containers
   *
   * @return TRUE if the key appears before the other one in the tape
   */
  inline bool operator<(const element &other) const noexcept;

  /**
   * operator== allows to verify if two element values reference the
   * same JSON item
   *
   * @return TRUE if the two values references the same JSON element
   */
  inline bool operator==(const element &other) const noexcept;

  /** @private for debugging. Prints out the root element. */
  inline bool dump_raw_tape(std::ostream &out) const noexcept;

private:
  simdjson_inline element(const internal::tape_ref &tape) noexcept;
  internal::tape_ref tape{};
  friend class document;
  friend class object;
  friend class array;
  friend struct simdjson_result<element>;
  template<typename T>
  friend class simdjson::internal::string_builder;

};

} // namespace dom

/** The result of a JSON navigation that may fail. */
template<>
struct simdjson_result<dom::element> : public internal::simdjson_result_base<dom::element> {
public:
  simdjson_inline simdjson_result() noexcept; ///< @private
  simdjson_inline simdjson_result(dom::element &&value) noexcept; ///< @private
  simdjson_inline simdjson_result(error_code error) noexcept; ///< @private

  simdjson_inline simdjson_result<dom::element_type> type() const noexcept;
  template<typename T>
  simdjson_inline bool is() const noexcept;
  template<typename T>
  simdjson_inline simdjson_result<T> get() const noexcept;
  template<typename T>
  simdjson_warn_unused simdjson_inline error_code get(T &value) const noexcept;

  simdjson_inline simdjson_result<dom::array> get_array() const noexcept;
  simdjson_inline simdjson_result<dom::object> get_object() const noexcept;
  simdjson_inline simdjson_result<const char *> get_c_str() const noexcept;
  simdjson_inline simdjson_result<size_t> get_string_length() const noexcept;
  simdjson_inline simdjson_result<std::string_view> get_string() const noexcept;
  simdjson_inline simdjson_result<int64_t> get_int64() const noexcept;
  simdjson_inline simdjson_result<uint64_t> get_uint64() const noexcept;
  simdjson_inline simdjson_result<double> get_double() const noexcept;
  simdjson_inline simdjson_result<bool> get_bool() const noexcept;

  simdjson_inline bool is_array() const noexcept;
  simdjson_inline bool is_object() const noexcept;
  simdjson_inline bool is_string() const noexcept;
  simdjson_inline bool is_int64() const noexcept;
  simdjson_inline bool is_uint64() const noexcept;
  simdjson_inline bool is_double() const noexcept;
  simdjson_inline bool is_number() const noexcept;
  simdjson_inline bool is_bool() const noexcept;
  simdjson_inline bool is_null() const noexcept;

  simdjson_inline simdjson_result<dom::element> operator[](std::string_view key) const noexcept;
  simdjson_inline simdjson_result<dom::element> operator[](const char *key) const noexcept;
  simdjson_result<dom::element> operator[](int) const noexcept = delete;
  simdjson_inline simdjson_result<dom::element> at_pointer(const std::string_view json_pointer) const noexcept;
  simdjson_inline simdjson_result<std::vector<dom::element>> at_path_with_wildcard(const std::string_view json_path) const noexcept;
  simdjson_inline simdjson_result<dom::element> at_path(const std::string_view json_path) const noexcept;
  [[deprecated("For standard compliance, use at_pointer instead, and prefix your pointers with a slash '/', see RFC6901 ")]]
  simdjson_inline simdjson_result<dom::element> at(const std::string_view json_pointer) const noexcept;
  simdjson_inline simdjson_result<dom::element> at(size_t index) const noexcept;
  simdjson_inline simdjson_result<dom::element> at_key(std::string_view key) const noexcept;
  simdjson_inline simdjson_result<dom::element> at_key_case_insensitive(std::string_view key) const noexcept;

#if SIMDJSON_EXCEPTIONS
  simdjson_inline operator bool() const noexcept(false);
  simdjson_inline explicit operator const char*() const noexcept(false);
  simdjson_inline operator std::string_view() const noexcept(false);
  simdjson_inline operator uint64_t() const noexcept(false);
  simdjson_inline operator int64_t() const noexcept(false);
  simdjson_inline operator double() const noexcept(false);
  simdjson_inline operator dom::array() const noexcept(false);
  simdjson_inline operator dom::object() const noexcept(false);

  simdjson_inline dom::array::iterator begin() const noexcept(false);
  simdjson_inline dom::array::iterator end() const noexcept(false);
#endif // SIMDJSON_EXCEPTIONS
};

} // namespace simdjson

#endif // SIMDJSON_DOM_DOCUMENT_H
/* end file simdjson/dom/element.h */
/* including simdjson/dom/object.h: #include "simdjson/dom/object.h" */
/* begin file simdjson/dom/object.h */
#ifndef SIMDJSON_DOM_OBJECT_H
#define SIMDJSON_DOM_OBJECT_H

#include <vector>

/* skipped duplicate #include "simdjson/dom/base.h" */
/* skipped duplicate #include "simdjson/dom/element.h" */
/* skipped duplicate #include "simdjson/internal/tape_ref.h" */

namespace simdjson {
namespace dom {

/**
 * JSON object.
 */
class object {
public:
  /** Create a new, invalid object */
  simdjson_inline object() noexcept;

  class iterator {
  public:
    using value_type = const key_value_pair;
    using difference_type = std::ptrdiff_t;
    using pointer = void;
    using reference = value_type;
    using iterator_category = std::forward_iterator_tag;

    /**
     * Get the actual key/value pair
     */
    inline reference operator*() const noexcept;
    /**
     * Get the next key/value pair.
     *
     * Part of the std::iterator interface.
     *
     */
    inline iterator& operator++() noexcept;
    /**
     * Get the next key/value pair.
     *
     * Part of the std::iterator interface.
     *
     */
    inline iterator operator++(int) noexcept;
    /**
     * Check if these values come from the same place in the JSON.
     *
     * Part of the std::iterator interface.
     */
    inline bool operator!=(const iterator& other) const noexcept;
    inline bool operator==(const iterator& other) const noexcept;

    inline bool operator<(const iterator& other) const noexcept;
    inline bool operator<=(const iterator& other) const noexcept;
    inline bool operator>=(const iterator& other) const noexcept;
    inline bool operator>(const iterator& other) const noexcept;
    /**
     * Get the key of this key/value pair.
     */
    inline std::string_view key() const noexcept;
    /**
     * Get the length (in bytes) of the key in this key/value pair.
     * You should expect this function to be faster than key().size().
     */
    inline uint32_t key_length() const noexcept;
    /**
     * Returns true if the key in this key/value pair is equal
     * to the provided string_view.
     */
    inline bool key_equals(std::string_view o) const noexcept;
    /**
     * Returns true if the key in this key/value pair is equal
     * to the provided string_view in a case-insensitive manner.
     * Case comparisons may only be handled correctly for ASCII strings.
     */
    inline bool key_equals_case_insensitive(std::string_view o) const noexcept;
    /**
     * Get the key of this key/value pair.
     */
    inline const char *key_c_str() const noexcept;
    /**
     * Get the value of this key/value pair.
     */
    inline element value() const noexcept;

    iterator() noexcept = default;
    iterator(const iterator&) noexcept = default;
    iterator& operator=(const iterator&) noexcept = default;
  private:
    simdjson_inline iterator(const internal::tape_ref &tape) noexcept;

    internal::tape_ref tape{};

    friend class object;
  };

  /**
   * Return the first key/value pair.
   *
   * Part of the std::iterable interface.
   */
  inline iterator begin() const noexcept;
  /**
   * One past the last key/value pair.
   *
   * Part of the std::iterable interface.
   */
  inline iterator end() const noexcept;
  /**
   * Get the size of the object (number of keys).
   * It is a saturated value with a maximum of 0xFFFFFF: if the value
   * is 0xFFFFFF then the size is 0xFFFFFF or greater.
   */
  inline size_t size() const noexcept;
  /**
   * Get the value associated with the given key.
   *
   * The key will be matched against **unescaped** JSON:
   *
   *   dom::parser parser;
   *   int64_t(parser.parse(R"({ "a\n": 1 })"_padded)["a\n"]) == 1
   *   parser.parse(R"({ "a\n": 1 })"_padded)["a\\n"].get_uint64().error() == NO_SUCH_FIELD
   *
   * This function has linear-time complexity: the keys are checked one by one.
   *
   * @return The value associated with this field, or:
   *         - NO_SUCH_FIELD if the field does not exist in the object
   *         - INCORRECT_TYPE if this is not an object
   */
  inline simdjson_result<element> operator[](std::string_view key) const noexcept;

  /**
   * Get the value associated with the given key.
   *
   * The key will be matched against **unescaped** JSON:
   *
   *   dom::parser parser;
   *   int64_t(parser.parse(R"({ "a\n": 1 })"_padded)["a\n"]) == 1
   *   parser.parse(R"({ "a\n": 1 })"_padded)["a\\n"].get_uint64().error() == NO_SUCH_FIELD
   *
   * This function has linear-time complexity: the keys are checked one by one.
   *
   * @return The value associated with this field, or:
   *         - NO_SUCH_FIELD if the field does not exist in the object
   *         - INCORRECT_TYPE if this is not an object
   */
  inline simdjson_result<element> operator[](const char *key) const noexcept;
  simdjson_result<element> operator[](int) const noexcept = delete;

  /**
   * Get the value associated with the given JSON pointer. We use the RFC 6901
   * https://tools.ietf.org/html/rfc6901 standard, interpreting the current node
   * as the root of its own JSON document.
   *
   *   dom::parser parser;
   *   object obj = parser.parse(R"({ "foo": { "a": [ 10, 20, 30 ] }})"_padded);
   *   obj.at_pointer("/foo/a/1") == 20
   *   obj.at_pointer("/foo")["a"].at(1) == 20
   *
   * It is allowed for a key to be the empty string:
   *
   *   dom::parser parser;
   *   object obj = parser.parse(R"({ "": { "a": [ 10, 20, 30 ] }})"_padded);
   *   obj.at_pointer("//a/1") == 20
   *   obj.at_pointer("/")["a"].at(1) == 20
   *
   * @return The value associated with the given JSON pointer, or:
   *         - NO_SUCH_FIELD if a field does not exist in an object
   *         - INDEX_OUT_OF_BOUNDS if an array index is larger than an array length
   *         - INCORRECT_TYPE if a non-integer is used to access an array
   *         - INVALID_JSON_POINTER if the JSON pointer is invalid and cannot be parsed
   */
  inline simdjson_result<element> at_pointer(std::string_view json_pointer) const noexcept;

  /**
   * Recursive function which processes the JSON path of each child element
   */
  inline void process_json_path_of_child_elements(std::vector<element>::iterator& current, std::vector<element>::iterator& end, const std::string_view& path_suffix, std::vector<element>& accumulator) const noexcept;

  /**
   * Adds support for JSONPath expression with wildcards '*'
   */
  inline simdjson_result<std::vector<element>> at_path_with_wildcard(std::string_view json_path) const noexcept;

  /**
   * Get the value associated with the given JSONPath expression. We only support
   * JSONPath queries that trivially convertible to JSON Pointer queries: key
   * names and array indices.
   *
   * https://www.rfc-editor.org/rfc/rfc9535 (RFC 9535)
   *
   * @return The value associated with the given JSONPath expression, or:
   *         - INVALID_JSON_POINTER if the JSONPath to JSON Pointer conversion fails
   *         - NO_SUCH_FIELD if a field does not exist in an object
   *         - INDEX_OUT_OF_BOUNDS if an array index is larger than an array length
   *         - INCORRECT_TYPE if a non-integer is used to access an array
  */
  inline simdjson_result<element> at_path(std::string_view json_path) const noexcept;

  /**
   * Get the value associated with the given key.
   *
   * The key will be matched against **unescaped** JSON:
   *
   *   dom::parser parser;
   *   int64_t(parser.parse(R"({ "a\n": 1 })"_padded)["a\n"]) == 1
   *   parser.parse(R"({ "a\n": 1 })"_padded)["a\\n"].get_uint64().error() == NO_SUCH_FIELD
   *
   * This function has linear-time complexity: the keys are checked one by one.
   *
   * @return The value associated with this field, or:
   *         - NO_SUCH_FIELD if the field does not exist in the object
   */
  inline simdjson_result<element> at_key(std::string_view key) const noexcept;

  /**
   * Gets the values associated with keys of an object
   * This function has linear-time complexity: the keys are checked one by one.
   *
   * @return the values associated with each key of an object
   */
  inline std::vector<element>& get_values(std::vector<element>& out) const noexcept;

  /**
   * Get the value associated with the given key in a case-insensitive manner.
   * It is only guaranteed to work over ASCII inputs.
   *
   * Note: The key will be matched against **unescaped** JSON.
   *
   * This function has linear-time complexity: the keys are checked one by one.
   *
   * @return The value associated with this field, or:
   *         - NO_SUCH_FIELD if the field does not exist in the object
   */
  inline simdjson_result<element> at_key_case_insensitive(std::string_view key) const noexcept;

  /**
   * Implicitly convert object to element
   */
  inline operator element() const noexcept;

private:
  simdjson_inline object(const internal::tape_ref &tape) noexcept;

  internal::tape_ref tape{};

  friend class element;
  friend struct simdjson_result<element>;
  template<typename T>
  friend class simdjson::internal::string_builder;
};

/**
 * Key/value pair in an object.
 */
class key_value_pair {
public:
  /** key in the key-value pair **/
  std::string_view key;
  /** value in the key-value pair **/
  element value;

private:
  simdjson_inline key_value_pair(std::string_view _key, element _value) noexcept;
  friend class object;
};

} // namespace dom

/** The result of a JSON conversion that may fail. */
template<>
struct simdjson_result<dom::object> : public internal::simdjson_result_base<dom::object> {
public:
  simdjson_inline simdjson_result() noexcept; ///< @private
  simdjson_inline simdjson_result(dom::object value) noexcept; ///< @private
  simdjson_inline simdjson_result(error_code error) noexcept; ///< @private

  inline simdjson_result<dom::element> operator[](std::string_view key) const noexcept;
  inline simdjson_result<dom::element> operator[](const char *key) const noexcept;
  simdjson_result<dom::element> operator[](int) const noexcept = delete;
  inline simdjson_result<dom::element> at_pointer(std::string_view json_pointer) const noexcept;
  inline void process_json_path_of_child_elements(std::vector<dom::element>::iterator& current, std::vector<dom::element>::iterator& end, const std::string_view& path_suffix, std::vector<dom::element>& accumulator) const noexcept;
  inline simdjson_result<std::vector<dom::element>> at_path_with_wildcard(std::string_view json_path_new) const noexcept;
  inline simdjson_result<dom::element> at_path(std::string_view json_path) const noexcept;
  inline simdjson_result<dom::element> at_key(std::string_view key) const noexcept;
  inline std::vector<dom::element>& get_values(std::vector<dom::element>& out) const noexcept;
  inline simdjson_result<dom::element> at_key_case_insensitive(std::string_view key) const noexcept;

#if SIMDJSON_EXCEPTIONS
  inline dom::object::iterator begin() const noexcept(false);
  inline dom::object::iterator end() const noexcept(false);
  inline size_t size() const noexcept(false);
#endif // SIMDJSON_EXCEPTIONS
};

} // namespace simdjson

#if SIMDJSON_SUPPORTS_RANGES
namespace std {
namespace ranges {
template<>
inline constexpr bool enable_view<simdjson::dom::object> = true;
#if SIMDJSON_EXCEPTIONS
template<>
inline constexpr bool enable_view<simdjson::simdjson_result<simdjson::dom::object>> = true;
#endif // SIMDJSON_EXCEPTIONS
} // namespace ranges
} // namespace std
#endif // SIMDJSON_SUPPORTS_RANGES

#endif // SIMDJSON_DOM_OBJECT_H
/* end file simdjson/dom/object.h */
/* skipped duplicate #include "simdjson/dom/parser.h" */
/* including simdjson/dom/serialization.h: #include "simdjson/dom/serialization.h" */
/* begin file simdjson/dom/serialization.h */
#ifndef SIMDJSON_SERIALIZATION_H
#define SIMDJSON_SERIALIZATION_H

/* skipped duplicate #include "simdjson/dom/base.h" */
/* skipped duplicate #include "simdjson/dom/element.h" */
/* skipped duplicate #include "simdjson/dom/object.h" */

namespace simdjson {

/**
 * The string_builder template and mini_formatter class
 * are not part of  our public API and are subject to change
 * at any time!
 */
namespace internal {

template <class formatter> class base_formatter {
public:
  /** Add a comma **/
  simdjson_inline void comma();
  /** Start an array, prints [ **/
  simdjson_inline void start_array();
  /** End an array, prints ] **/
  simdjson_inline void end_array();
  /** Start an array, prints { **/
  simdjson_inline void start_object();
  /** Start an array, prints } **/
  simdjson_inline void end_object();
  /** Prints a true **/
  simdjson_inline void true_atom();
  /** Prints a false **/
  simdjson_inline void false_atom();
  /** Prints a null **/
  simdjson_inline void null_atom();
  /** Prints a number **/
  simdjson_inline void number(int64_t x);
  /** Prints a number **/
  simdjson_inline void number(uint64_t x);
  /** Prints a number **/
  simdjson_inline void number(double x);
  /** Prints a key (string + colon) **/
  simdjson_inline void key(std::string_view unescaped);
  /** Prints a string. The string is escaped as needed. **/
  simdjson_inline void string(std::string_view unescaped);
  /** Clears out the content. **/
  simdjson_inline void clear();
  /**
   * Get access to the buffer, it is owned by the instance, but
   * the user can make a copy.
   **/
  simdjson_inline std::string_view str() const;

  /** Prints one character **/
  simdjson_inline void one_char(char c);

  /** Prints characters in [begin, end) verbatim. **/
  simdjson_inline void chars(const char *begin, const char *end);

  simdjson_inline void call_print_newline() {
    static_cast<formatter *>(this)->print_newline();
  }

  simdjson_inline void call_print_indents(size_t depth) {
    static_cast<formatter *>(this)->print_indents(depth);
  }

  simdjson_inline void call_print_space() {
    static_cast<formatter *>(this)->print_space();
  }

protected:
  // implementation details (subject to change)
  /** Backing buffer **/
  struct vector_with_small_buffer {
    vector_with_small_buffer() = default;
    ~vector_with_small_buffer() { free_buffer(); }

    vector_with_small_buffer(const vector_with_small_buffer &) = delete;
    vector_with_small_buffer &
    operator=(const vector_with_small_buffer &) = delete;

    void clear() {
      size = 0;
      capacity = StaticCapacity;
      free_buffer();
      buffer = array;
    }

    simdjson_inline void push_back(char c) {
      if (capacity < size + 1)
        grow(capacity * 2);
      buffer[size++] = c;
    }

    simdjson_inline void append(const char *begin, const char *end) {
      const size_t new_size = size + (end - begin);
      if (capacity < new_size)
        // std::max(new_size, capacity * 2); is broken in tests on Windows
        grow(new_size < capacity * 2 ? capacity * 2 : new_size);
      std::copy(begin, end, buffer + size);
      size = new_size;
    }

    std::string_view str() const { return std::string_view(buffer, size); }

  private:
    void free_buffer() {
      if (buffer != array)
        delete[] buffer;
    }
    void grow(size_t new_capacity) {
      auto new_buffer = new char[new_capacity];
      std::copy(buffer, buffer + size, new_buffer);
      free_buffer();
      buffer = new_buffer;
      capacity = new_capacity;
    }

    static const size_t StaticCapacity = 64;
    char array[StaticCapacity];
    char *buffer = array;
    size_t size = 0;
    size_t capacity = StaticCapacity;
  } buffer{};
};

/**
 * @private This is the class that we expect to use with the string_builder
 * template. It tries to produce a compact version of the JSON element
 * as quickly as possible.
 */
class mini_formatter : public base_formatter<mini_formatter> {
public:
  simdjson_inline void print_newline();

  simdjson_inline void print_indents(size_t depth);

  simdjson_inline void print_space();
};

class pretty_formatter : public base_formatter<pretty_formatter> {
public:
  simdjson_inline void print_newline();

  simdjson_inline void print_indents(size_t depth);

  simdjson_inline void print_space();

protected:
  int indent_step = 4;
};

/**
 * @private The string_builder template allows us to construct
 * a string from a document element. It is parametrized
 * by a "formatter" which handles the details. Thus
 * the string_builder template could support both minification
 * and prettification, and various other tradeoffs.
 *
 * This is not to be confused with the simdjson::builder::string_builder
 * which is a different class.
 */
template <class formatter = mini_formatter> class string_builder {
public:
  /** Construct an initially empty builder, would print the empty string **/
  string_builder() = default;
  /** Append an element to the builder (to be printed) **/
  inline void append(simdjson::dom::element value);
  /** Append an array to the builder (to be printed) **/
  inline void append(simdjson::dom::array value);
  /** Append an object to the builder (to be printed) **/
  inline void append(simdjson::dom::object value);
  /** Reset the builder (so that it would print the empty string) **/
  simdjson_inline void clear();
  /**
   * Get access to the string. The string_view is owned by the builder
   * and it is invalid to use it after the string_builder has been
   * destroyed.
   * However you can make a copy of the string_view on memory that you
   * own.
   */
  simdjson_inline std::string_view str() const;
  /** Append a key_value_pair to the builder (to be printed) **/
  simdjson_inline void append(simdjson::dom::key_value_pair value);

private:
  formatter format{};
};

} // namespace internal

namespace dom {

/**
 * Print JSON to an output stream.
 *
 * @param out The output stream.
 * @param value The element.
 * @throw if there is an error with the underlying output stream. simdjson
 * itself will not throw.
 */
inline std::ostream &operator<<(std::ostream &out,
                                simdjson::dom::element value);
#if SIMDJSON_EXCEPTIONS
inline std::ostream &
operator<<(std::ostream &out,
           simdjson::simdjson_result<simdjson::dom::element> x);
#endif
/**
 * Print JSON to an output stream.
 *
 * @param out The output stream.
 * @param value The array.
 * @throw if there is an error with the underlying output stream. simdjson
 * itself will not throw.
 */
inline std::ostream &operator<<(std::ostream &out, simdjson::dom::array value);
#if SIMDJSON_EXCEPTIONS
inline std::ostream &
operator<<(std::ostream &out,
           simdjson::simdjson_result<simdjson::dom::array> x);
#endif
/**
 * Print JSON to an output stream.
 *
 * @param out The output stream.
 * @param value The object.
 * @throw if there is an error with the underlying output stream. simdjson
 * itself will not throw.
 */
inline std::ostream &operator<<(std::ostream &out, simdjson::dom::object value);
#if SIMDJSON_EXCEPTIONS
inline std::ostream &
operator<<(std::ostream &out,
           simdjson::simdjson_result<simdjson::dom::object> x);
#endif
} // namespace dom

/**
 * Converts JSON to a string.
 *
 *   dom::parser parser;
 *   element doc = parser.parse("   [ 1 , 2 , 3 ] "_padded);
 *   cout << to_string(doc) << endl; // prints [1,2,3]
 *
 */
template <class T> std::string to_string(T x) {
  // in C++, to_string is standard:
  // http://www.cplusplus.com/reference/string/to_string/ Currently minify and
  // to_string are identical but in the future, they may differ.
  simdjson::internal::string_builder<> sb;
  sb.append(x);
  std::string_view answer = sb.str();
  return std::string(answer.data(), answer.size());
}
#if SIMDJSON_EXCEPTIONS
template <class T> std::string to_string(simdjson_result<T> x) {
  if (x.error()) {
    throw simdjson_error(x.error());
  }
  return to_string(x.value());
}
#endif

/**
 * Minifies a JSON element or document, printing the smallest possible valid
 * JSON.
 *
 *   dom::parser parser;
 *   element doc = parser.parse("   [ 1 , 2 , 3 ] "_padded);
 *   cout << minify(doc) << endl; // prints [1,2,3]
 *
 */
template <class T> std::string minify(T x) { return to_string(x); }

#if SIMDJSON_EXCEPTIONS
template <class T> std::string minify(simdjson_result<T> x) {
  if (x.error()) {
    throw simdjson_error(x.error());
  }
  return to_string(x.value());
}
#endif

/**
 * Prettifies a JSON element or document, printing the valid JSON with
 * indentation.
 *
 *   dom::parser parser;
 *   element doc = parser.parse("   [ 1 , 2 , 3 ] "_padded);
 *
 *   // Prints:
 *   // {
 *   //     [
 *   //         1,
 *   //         2,
 *   //         3
 *   //     ]
 *   // }
 *   cout << prettify(doc) << endl;
 *
 */
template <class T> std::string prettify(T x) {
  simdjson::internal::string_builder<simdjson::internal::pretty_formatter> sb;
  sb.append(x);
  std::string_view answer = sb.str();
  return std::string(answer.data(), answer.size());
}

#if SIMDJSON_EXCEPTIONS
template <class T> std::string prettify(simdjson_result<T> x) {
  if (x.error()) {
    throw simdjson_error(x.error());
  }
  return to_string(x.value());
}
#endif

} // namespace simdjson

#endif
/* end file simdjson/dom/serialization.h */

// Inline functions
/* including simdjson/dom/array-inl.h: #include "simdjson/dom/array-inl.h" */
/* begin file simdjson/dom/array-inl.h */
#ifndef SIMDJSON_ARRAY_INL_H
#define SIMDJSON_ARRAY_INL_H

#include <utility>

/* skipped duplicate #include "simdjson/dom/base.h" */
/* skipped duplicate #include "simdjson/dom/array.h" */
/* skipped duplicate #include "simdjson/dom/element.h" */
/* skipped duplicate #include "simdjson/error-inl.h" */
/* including simdjson/jsonpathutil.h: #include "simdjson/jsonpathutil.h" */
/* begin file simdjson/jsonpathutil.h */
#ifndef SIMDJSON_JSONPATHUTIL_H
#define SIMDJSON_JSONPATHUTIL_H

#include <string>
/* skipped duplicate #include "simdjson/common_defs.h" */

#include <utility>

namespace simdjson {
/**
 * Converts JSONPath to JSON Pointer.
 * @param json_path The JSONPath string to be converted.
 * @return A string containing the equivalent JSON Pointer.
 */
inline std::string json_path_to_pointer_conversion(std::string_view json_path) {
  size_t i = 0;
  // if JSONPath starts with $, skip it
   // json_path.starts_with('$') requires C++20.
  if (!json_path.empty() && json_path.front() == '$') {
    i = 1;
  }
  if (i >= json_path.size() || (json_path[i] != '.' &&
      json_path[i] != '[')) {
    return "-1"; // This is just a sentinel value, the caller should check for this and return an error.
  }

  std::string result;
  // Reserve space to reduce allocations, adjusting for potential increases due
  // to escaping.
  result.reserve(json_path.size() * 2);

  while (i < json_path.length()) {
    if (json_path[i] == '.') {
      result += '/';
    } else if (json_path[i] == '[') {
      result += '/';
      ++i; // Move past the '['
      while (i < json_path.length() && json_path[i] != ']') {
          if (json_path[i] == '~') {
            result += "~0";
          } else if (json_path[i] == '/') {
            result += "~1";
          } else {
            result += json_path[i];
          }
          ++i;
      }
      if (i == json_path.length() || json_path[i] != ']') {
          return "-1"; // Using sentinel value that will be handled as an error by the caller.
      }
    } else {
      if (json_path[i] == '~') {
          result += "~0";
      } else if (json_path[i] == '/') {
          result += "~1";
      } else {
          result += json_path[i];
      }
    }
    ++i;
  }

  return result;
}

inline std::pair<std::string_view, std::string_view> get_next_key_and_json_path(std::string_view& json_path) {
  std::string_view key;

  if (json_path.empty()) {
    return {key, json_path};
  }
  size_t i = 0;

  // if JSONPath starts with $, skip it
  if (json_path.front() == '$') {
    i = 1;
  }


  if (i < json_path.length() && json_path[i] == '.') {
    i += 1;
    size_t key_start = i;

    while (i < json_path.length() && json_path[i] != '[' && json_path[i] != '.') {
      ++i;
    }

    key = json_path.substr(key_start, i - key_start);
  } else if ((i+1 < json_path.size()) && json_path[i] == '[' && (json_path[i+1] == '\'' || json_path[i+1] == '"')) {
    i += 2;
    size_t key_start = i;
    while (i < json_path.length() && json_path[i] != '\'' && json_path[i] != '"') {
      ++i;
    }

    key = json_path.substr(key_start, i - key_start);

    i += 2;
  } else if ((i+2 < json_path.size()) && json_path[i] == '[' && json_path[i+1] == '*' && json_path[i+2] == ']') { // i.e [*].additional_keys or [*]["additional_keys"]
    key = "*";
    i += 3;
  }


  return std::make_pair(key, json_path.substr(i));
}

} // namespace simdjson
#endif // SIMDJSON_JSONPATHUTIL_H
/* end file simdjson/jsonpathutil.h */
/* including simdjson/internal/tape_ref-inl.h: #include "simdjson/internal/tape_ref-inl.h" */
/* begin file simdjson/internal/tape_ref-inl.h */
#ifndef SIMDJSON_TAPE_REF_INL_H
#define SIMDJSON_TAPE_REF_INL_H

/* skipped duplicate #include "simdjson/dom/document.h" */
/* skipped duplicate #include "simdjson/internal/tape_ref.h" */
/* including simdjson/internal/tape_type.h: #include "simdjson/internal/tape_type.h" */
/* begin file simdjson/internal/tape_type.h */
#ifndef SIMDJSON_INTERNAL_TAPE_TYPE_H
#define SIMDJSON_INTERNAL_TAPE_TYPE_H

namespace simdjson {
namespace internal {

/**
 * The possible types in the tape.
 */
enum class tape_type {
  ROOT = 'r',
  START_ARRAY = '[',
  START_OBJECT = '{',
  END_ARRAY = ']',
  END_OBJECT = '}',
  STRING = '"',
  INT64 = 'l',
  UINT64 = 'u',
  DOUBLE = 'd',
  TRUE_VALUE = 't',
  FALSE_VALUE = 'f',
  NULL_VALUE = 'n'
}; // enum class tape_type

} // namespace internal
} // namespace simdjson

#endif // SIMDJSON_INTERNAL_TAPE_TYPE_H
/* end file simdjson/internal/tape_type.h */

#include <cstring>

namespace simdjson {
namespace internal {

constexpr const uint64_t JSON_VALUE_MASK = 0x00FFFFFFFFFFFFFF;
constexpr const uint32_t JSON_COUNT_MASK = 0xFFFFFF;

//
// tape_ref inline implementation
//
simdjson_inline tape_ref::tape_ref() noexcept : doc{nullptr}, json_index{0} {}
simdjson_inline tape_ref::tape_ref(const dom::document *_doc, size_t _json_index) noexcept : doc{_doc}, json_index{_json_index} {}


simdjson_inline bool tape_ref::is_document_root() const noexcept {
  return json_index == 1; // should we ever change the structure of the tape, this should get updated.
}
simdjson_inline bool tape_ref::usable() const noexcept {
  return doc != nullptr; // when the document pointer is null, this tape_ref is uninitialized (should not be accessed).
}
// Some value types have a specific on-tape word value. It can be faster
// to check the type by doing a word-to-word comparison instead of extracting the
// most significant 8 bits.

simdjson_inline bool tape_ref::is_double() const noexcept {
  constexpr uint64_t tape_double = uint64_t(tape_type::DOUBLE)<<56;
  return doc->tape[json_index] == tape_double;
}
simdjson_inline bool tape_ref::is_int64() const noexcept {
  constexpr uint64_t tape_int64 = uint64_t(tape_type::INT64)<<56;
  return doc->tape[json_index] == tape_int64;
}
simdjson_inline bool tape_ref::is_uint64() const noexcept {
  constexpr uint64_t tape_uint64 = uint64_t(tape_type::UINT64)<<56;
  return doc->tape[json_index] == tape_uint64;
}
simdjson_inline bool tape_ref::is_false() const noexcept {
  constexpr uint64_t tape_false = uint64_t(tape_type::FALSE_VALUE)<<56;
  return doc->tape[json_index] == tape_false;
}
simdjson_inline bool tape_ref::is_true() const noexcept {
  constexpr uint64_t tape_true = uint64_t(tape_type::TRUE_VALUE)<<56;
  return doc->tape[json_index] == tape_true;
}
simdjson_inline bool tape_ref::is_null_on_tape() const noexcept {
  constexpr uint64_t tape_null = uint64_t(tape_type::NULL_VALUE)<<56;
  return doc->tape[json_index] == tape_null;
}

inline size_t tape_ref::after_element() const noexcept {
  switch (tape_ref_type()) {
    case tape_type::START_ARRAY:
    case tape_type::START_OBJECT:
      return matching_brace_index();
    case tape_type::UINT64:
    case tape_type::INT64:
    case tape_type::DOUBLE:
      return json_index + 2;
    default:
      return json_index + 1;
  }
}
simdjson_inline tape_type tape_ref::tape_ref_type() const noexcept {
  return static_cast<tape_type>(doc->tape[json_index] >> 56);
}
simdjson_inline uint64_t internal::tape_ref::tape_value() const noexcept {
  return doc->tape[json_index] & internal::JSON_VALUE_MASK;
}
simdjson_inline uint32_t internal::tape_ref::matching_brace_index() const noexcept {
  return uint32_t(doc->tape[json_index]);
}
simdjson_inline uint32_t internal::tape_ref::scope_count() const noexcept {
  return uint32_t((doc->tape[json_index] >> 32) & internal::JSON_COUNT_MASK);
}

template<typename T>
simdjson_inline T tape_ref::next_tape_value() const noexcept {
  static_assert(sizeof(T) == sizeof(uint64_t), "next_tape_value() template parameter must be 64-bit");
  // Though the following is tempting...
  //  return *reinterpret_cast<const T*>(&doc->tape[json_index + 1]);
  // It is not generally safe. It is safer, and often faster to rely
  // on memcpy. Yes, it is uglier, but it is also encapsulated.
  T x;
  std::memcpy(&x,&doc->tape[json_index + 1],sizeof(uint64_t));
  return x;
}

simdjson_inline uint32_t internal::tape_ref::get_string_length() const noexcept {
  size_t string_buf_index = size_t(tape_value());
  uint32_t len;
  std::memcpy(&len, &doc->string_buf[string_buf_index], sizeof(len));
  return len;
}

simdjson_inline const char * internal::tape_ref::get_c_str() const noexcept {
  size_t string_buf_index = size_t(tape_value());
  return reinterpret_cast<const char *>(&doc->string_buf[string_buf_index + sizeof(uint32_t)]);
}

inline std::string_view internal::tape_ref::get_string_view() const noexcept {
  return std::string_view(
      get_c_str(),
      get_string_length()
  );
}

} // namespace internal
} // namespace simdjson

#endif // SIMDJSON_TAPE_REF_INL_H
/* end file simdjson/internal/tape_ref-inl.h */

#include <limits>

namespace simdjson {

//
// simdjson_result<dom::array> inline implementation
//
simdjson_inline simdjson_result<dom::array>::simdjson_result() noexcept
    : internal::simdjson_result_base<dom::array>() {}
simdjson_inline simdjson_result<dom::array>::simdjson_result(dom::array value) noexcept
    : internal::simdjson_result_base<dom::array>(std::forward<dom::array>(value)) {}
simdjson_inline simdjson_result<dom::array>::simdjson_result(error_code error) noexcept
    : internal::simdjson_result_base<dom::array>(error) {}

#if SIMDJSON_EXCEPTIONS

inline dom::array::iterator simdjson_result<dom::array>::begin() const noexcept(false) {
  if (error()) { throw simdjson_error(error()); }
  return first.begin();
}
inline dom::array::iterator simdjson_result<dom::array>::end() const noexcept(false) {
  if (error()) { throw simdjson_error(error()); }
  return first.end();
}
inline size_t simdjson_result<dom::array>::size() const noexcept(false) {
  if (error()) { throw simdjson_error(error()); }
  return first.size();
}

#endif // SIMDJSON_EXCEPTIONS

inline simdjson_result<dom::element> simdjson_result<dom::array>::at_pointer(std::string_view json_pointer) const noexcept {
  if (error()) { return error(); }
  return first.at_pointer(json_pointer);
}

 inline simdjson_result<dom::element> simdjson_result<dom::array>::at_path(std::string_view json_path) const noexcept {
  auto json_pointer = json_path_to_pointer_conversion(json_path);
  if (json_pointer == "-1") { return INVALID_JSON_POINTER; }
  return at_pointer(json_pointer);
 }

inline simdjson_result<std::vector<dom::element>> simdjson_result<dom::array>::at_path_with_wildcard(std::string_view json_path) const noexcept {
  if (error()) {
    return error();
  }
  return first.at_path_with_wildcard(json_path);
}

inline simdjson_result<dom::element> simdjson_result<dom::array>::at(size_t index) const noexcept {
  if (error()) { return error(); }
  return first.at(index);
}

inline std::vector<dom::element>& simdjson_result<dom::array>::get_values(std::vector<dom::element>& out) const noexcept {
  return first.get_values(out);
}

namespace dom {

//
// array inline implementation
//
simdjson_inline array::array() noexcept : tape{} {}
simdjson_inline array::array(const internal::tape_ref &_tape) noexcept : tape{_tape} {}
inline array::iterator array::begin() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  return internal::tape_ref(tape.doc, tape.json_index + 1);
}
inline array::iterator array::end() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  return internal::tape_ref(tape.doc, tape.after_element() - 1);
}
inline size_t array::size() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  return tape.scope_count();
}
inline size_t array::number_of_slots() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  return tape.matching_brace_index() - tape.json_index;
}
inline simdjson_result<element> array::at_pointer(std::string_view json_pointer) const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  if(json_pointer.empty()) { // an empty string means that we return the current node
      return element(this->tape); // copy the current node
  } else if(json_pointer[0] != '/') { // otherwise there is an error
      return INVALID_JSON_POINTER;
  }
  json_pointer = json_pointer.substr(1);
  // - means "the append position" or "the element after the end of the array"
  // We don't support this, because we're returning a real element, not a position.
  if (json_pointer == "-") { return INDEX_OUT_OF_BOUNDS; }

  // Read the array index
  size_t array_index = 0;
  size_t i;
  for (i = 0; i < json_pointer.length() && json_pointer[i] != '/'; i++) {
    uint8_t digit = uint8_t(json_pointer[i] - '0');
    // Check for non-digit in array index. If it's there, we're trying to get a field in an object
    if (digit > 9) { return INCORRECT_TYPE; }
    array_index = array_index*10 + digit;
  }

  // 0 followed by other digits is invalid
  if (i > 1 && json_pointer[0] == '0') { return INVALID_JSON_POINTER; } // "JSON pointer array index has other characters after 0"

  // Empty string is invalid; so is a "/" with no digits before it
  if (i == 0) { return INVALID_JSON_POINTER; } // "Empty string in JSON pointer array index"

  // Get the child
  auto child = array(tape).at(array_index);
  // If there is an error, it ends here
  if(child.error()) {
    return child;
  }
  // If there is a /, we're not done yet, call recursively.
  if (i < json_pointer.length()) {
    child = child.at_pointer(json_pointer.substr(i));
  }
  return child;
}

inline simdjson_result<element> array::at_path(std::string_view json_path) const noexcept {
  auto json_pointer = json_path_to_pointer_conversion(json_path);
  if (json_pointer == "-1") { return INVALID_JSON_POINTER; }
  return at_pointer(json_pointer);
}

inline void array::process_json_path_of_child_elements(std::vector<element>::iterator& current, std::vector<element>::iterator& end, const std::string_view& path_suffix, std::vector<element>& accumulator) const noexcept {
  if (current == end) {
    return;
  }

  simdjson_result<std::vector<element>> result;


  for (auto it = current; it != end; ++it) {
    std::vector<element> child_result;
    auto error = it->at_path_with_wildcard(path_suffix).get(child_result);
    if(error) {
      continue;
    }
    accumulator.reserve(accumulator.size() + child_result.size());
    accumulator.insert(accumulator.end(),
                        std::make_move_iterator(child_result.begin()),
                        std::make_move_iterator(child_result.end()));
  }
}

inline simdjson_result<std::vector<element>> array::at_path_with_wildcard(std::string_view json_path) const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914

  size_t i = 0;
   // json_path.starts_with('$') requires C++20.
  if (!json_path.empty() && json_path.front() == '$') {
    i = 1;
  }

  if (i >= json_path.size() || (json_path[i] != '.' && json_path[i] != '[')) {
    return INVALID_JSON_POINTER;
  }

  if (json_path.find("*") != std::string::npos) {
    std::vector<element> child_values;

    if (
      (json_path.compare(i, 3, "[*]") == 0 && json_path.size() == i + 3) ||
      (json_path.compare(i, 2,".*") == 0 && json_path.size() == i + 2)
    ) {
      get_values(child_values);
      return child_values;
    }

    std::pair<std::string_view, std::string_view> key_and_json_path = get_next_key_and_json_path(json_path);

    std::string_view key = key_and_json_path.first;
    json_path = key_and_json_path.second;

    if (key.size() > 0) {
      if (key == "*") {
        get_values(child_values);
      } else {
        element pointer_result;
        std::string json_pointer = std::string("/") + std::string(key);
        auto error = at_pointer(json_pointer).get(pointer_result);

        if (!error) {
          child_values.emplace_back(pointer_result);
        }
      }

      std::vector<element> result = {};

      if (child_values.size() > 0) {
        std::vector<element>::iterator child_values_begin = child_values.begin();
        std::vector<element>::iterator child_values_end = child_values.end();

        process_json_path_of_child_elements(child_values_begin, child_values_end, json_path, result);
      }

      return result;
    } else {
      return INVALID_JSON_POINTER;
    }
  } else {
    element result;
    auto error = at_path(json_path).get(result);
    if (error) {
      return error;
    }

    return std::vector<element>{std::move(result)};
  }
}

inline simdjson_result<element> array::at(size_t index) const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  size_t i=0;
  for (auto element : *this) {
    if (i == index) { return element; }
    i++;
  }
  return INDEX_OUT_OF_BOUNDS;
}

inline std::vector<element>& array::get_values(std::vector<element>& out) const noexcept {
  out.reserve(this->size());
  for (auto element : *this) {
    out.emplace_back(element);
  }

  return out;
}

inline array::operator element() const noexcept {
	return element(tape);
}

//
// array::iterator inline implementation
//
simdjson_inline array::iterator::iterator(const internal::tape_ref &_tape) noexcept : tape{_tape} { }
inline element array::iterator::operator*() const noexcept {
  return element(tape);
}
inline array::iterator& array::iterator::operator++() noexcept {
  tape.json_index = tape.after_element();
  return *this;
}
inline array::iterator array::iterator::operator++(int) noexcept {
  array::iterator out = *this;
  ++*this;
  return out;
}
inline bool array::iterator::operator!=(const array::iterator& other) const noexcept {
  return tape.json_index != other.tape.json_index;
}
inline bool array::iterator::operator==(const array::iterator& other) const noexcept {
  return tape.json_index == other.tape.json_index;
}
inline bool array::iterator::operator<(const array::iterator& other) const noexcept {
  return tape.json_index < other.tape.json_index;
}
inline bool array::iterator::operator<=(const array::iterator& other) const noexcept {
  return tape.json_index <= other.tape.json_index;
}
inline bool array::iterator::operator>=(const array::iterator& other) const noexcept {
  return tape.json_index >= other.tape.json_index;
}
inline bool array::iterator::operator>(const array::iterator& other) const noexcept {
  return tape.json_index > other.tape.json_index;
}

} // namespace dom


} // namespace simdjson

/* including simdjson/dom/element-inl.h: #include "simdjson/dom/element-inl.h" */
/* begin file simdjson/dom/element-inl.h */
#ifndef SIMDJSON_ELEMENT_INL_H
#define SIMDJSON_ELEMENT_INL_H

/* skipped duplicate #include "simdjson/dom/base.h" */
/* skipped duplicate #include "simdjson/dom/element.h" */
/* skipped duplicate #include "simdjson/dom/document.h" */
/* skipped duplicate #include "simdjson/dom/object.h" */
/* skipped duplicate #include "simdjson/internal/tape_type.h" */

/* including simdjson/dom/object-inl.h: #include "simdjson/dom/object-inl.h" */
/* begin file simdjson/dom/object-inl.h */
#ifndef SIMDJSON_OBJECT_INL_H
#define SIMDJSON_OBJECT_INL_H

/* skipped duplicate #include "simdjson/dom/base.h" */
/* skipped duplicate #include "simdjson/dom/object.h" */
/* skipped duplicate #include "simdjson/dom/document.h" */

/* skipped duplicate #include "simdjson/dom/element-inl.h" */
/* skipped duplicate #include "simdjson/error-inl.h" */
/* skipped duplicate #include "simdjson/jsonpathutil.h" */

#include <cstring>

namespace simdjson {

//
// simdjson_result<dom::object> inline implementation
//
simdjson_inline simdjson_result<dom::object>::simdjson_result() noexcept
    : internal::simdjson_result_base<dom::object>() {}
simdjson_inline simdjson_result<dom::object>::simdjson_result(dom::object value) noexcept
    : internal::simdjson_result_base<dom::object>(std::forward<dom::object>(value)) {}
simdjson_inline simdjson_result<dom::object>::simdjson_result(error_code error) noexcept
    : internal::simdjson_result_base<dom::object>(error) {}

inline simdjson_result<dom::element> simdjson_result<dom::object>::operator[](std::string_view key) const noexcept {
  if (error()) { return error(); }
  return first[key];
}
inline simdjson_result<dom::element> simdjson_result<dom::object>::operator[](const char *key) const noexcept {
  if (error()) { return error(); }
  return first[key];
}
inline simdjson_result<dom::element> simdjson_result<dom::object>::at_pointer(std::string_view json_pointer) const noexcept {
  if (error()) { return error(); }
  return first.at_pointer(json_pointer);
}
inline simdjson_result<dom::element> simdjson_result<dom::object>::at_path(std::string_view json_path) const noexcept {
  auto json_pointer = json_path_to_pointer_conversion(json_path);
  if (json_pointer == "-1") { return INVALID_JSON_POINTER; }
  return at_pointer(json_pointer);
}
inline simdjson_result<std::vector<dom::element>> simdjson_result<dom::object>::at_path_with_wildcard(std::string_view json_path) const noexcept {
  if (error()) {
    return error();
  }
  return first.at_path_with_wildcard(json_path);
}
inline simdjson_result<dom::element> simdjson_result<dom::object>::at_key(std::string_view key) const noexcept {
  if (error()) { return error(); }
  return first.at_key(key);
}
inline std::vector<dom::element>& simdjson_result<dom::object>::get_values(std::vector<dom::element>& out) const noexcept {
  return first.get_values(out);
}
inline simdjson_result<dom::element> simdjson_result<dom::object>::at_key_case_insensitive(std::string_view key) const noexcept {
  if (error()) { return error(); }
  return first.at_key_case_insensitive(key);
}

#if SIMDJSON_EXCEPTIONS

inline dom::object::iterator simdjson_result<dom::object>::begin() const noexcept(false) {
  if (error()) { throw simdjson_error(error()); }
  return first.begin();
}
inline dom::object::iterator simdjson_result<dom::object>::end() const noexcept(false) {
  if (error()) { throw simdjson_error(error()); }
  return first.end();
}
inline size_t simdjson_result<dom::object>::size() const noexcept(false) {
  if (error()) { throw simdjson_error(error()); }
  return first.size();
}

#endif // SIMDJSON_EXCEPTIONS

namespace dom {

//
// object inline implementation
//
simdjson_inline object::object() noexcept : tape{} {}
simdjson_inline object::object(const internal::tape_ref &_tape) noexcept : tape{_tape} { }
inline object::iterator object::begin() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  return internal::tape_ref(tape.doc, tape.json_index + 1);
}
inline object::iterator object::end() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  return internal::tape_ref(tape.doc, tape.after_element() - 1);
}
inline size_t object::size() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  return tape.scope_count();
}

inline simdjson_result<element> object::operator[](std::string_view key) const noexcept {
  return at_key(key);
}
inline simdjson_result<element> object::operator[](const char *key) const noexcept {
  return at_key(key);
}
inline simdjson_result<element> object::at_pointer(std::string_view json_pointer) const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  if(json_pointer.empty()) { // an empty string means that we return the current node
      return element(this->tape); // copy the current node
  } else if(json_pointer[0] != '/') { // otherwise there is an error
      return INVALID_JSON_POINTER;
  }
  json_pointer = json_pointer.substr(1);
  size_t slash = json_pointer.find('/');
  std::string_view key = json_pointer.substr(0, slash);
  // Grab the child with the given key
  simdjson_result<element> child;

  // If there is an escape character in the key, unescape it and then get the child.
  size_t escape = key.find('~');
  if (escape != std::string_view::npos) {
    // Unescape the key
    std::string unescaped(key);
    do {
      switch (unescaped[escape+1]) {
        case '0':
          unescaped.replace(escape, 2, "~");
          break;
        case '1':
          unescaped.replace(escape, 2, "/");
          break;
        default:
          return INVALID_JSON_POINTER; // "Unexpected ~ escape character in JSON pointer");
      }
      escape = unescaped.find('~', escape+1);
    } while (escape != std::string::npos);
    child = at_key(unescaped);
  } else {
    child = at_key(key);
  }
  if(child.error()) {
    return child; // we do not continue if there was an error
  }
  // If there is a /, we have to recurse and look up more of the path
  if (slash != std::string_view::npos) {
    child = child.at_pointer(json_pointer.substr(slash));
  }
  return child;
}

inline simdjson_result<element> object::at_path(std::string_view json_path) const noexcept {
  auto json_pointer = json_path_to_pointer_conversion(json_path);
  if (json_pointer == "-1") { return INVALID_JSON_POINTER; }
  return at_pointer(json_pointer);
}

inline void object::process_json_path_of_child_elements(std::vector<element>::iterator& current, std::vector<element>::iterator& end, const std::string_view& path_suffix, std::vector<element>& accumulator) const noexcept {
  if (current == end) {
    return;
  }

  simdjson_result<std::vector<element>> result;

  for (auto it = current; it != end; ++it) {
    std::vector<element> child_result;
    auto error = it->at_path_with_wildcard(path_suffix).get(child_result);
    if(error) {
      continue;
    }
    accumulator.reserve(accumulator.size() + child_result.size());
    accumulator.insert(accumulator.end(),
                        std::make_move_iterator(child_result.begin()),
                        std::make_move_iterator(child_result.end()));
  }
}

inline simdjson_result<std::vector<element>> object::at_path_with_wildcard(std::string_view json_path) const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914

  size_t i = 0;
  if (json_path.empty()) {
    return INVALID_JSON_POINTER;
  }
  // if JSONPath starts with $, skip it
  // json_path.starts_with('$') requires C++20.
  if (json_path.front() == '$') {
    i = 1;
  }

  if (i >= json_path.size() || (json_path[i] != '.' && json_path[i] != '[')) {
    // expect JSONPath expressions to always start with $ but this isn't currently
    // expected in jsonpathutil.h.
    return INVALID_JSON_POINTER;
  }

  if (json_path.find("*") != std::string::npos) {

    std::vector<element> child_values;

    if (
      (json_path.compare(i, 3, "[*]") == 0 && json_path.size() == i + 3) ||
      (json_path.compare(i, 2,".*") == 0 && json_path.size() == i + 2)
    ) {
      get_values(child_values);
      return child_values;
    }

    std::pair<std::string_view, std::string_view> key_and_json_path = get_next_key_and_json_path(json_path);

    std::string_view key = key_and_json_path.first;
    json_path = key_and_json_path.second;

    if (key.size() > 0) {
      if (key == "*") {
        get_values(child_values);
      } else {
        element pointer_result;
        auto error = at_pointer(std::string("/") + std::string(key)).get(pointer_result);

        if (!error) {
          child_values.emplace_back(pointer_result);
        }
      }

      std::vector<element> result = {};
      if (child_values.size() > 0) {

        std::vector<element>::iterator child_values_begin = child_values.begin();
        std::vector<element>::iterator child_values_end = child_values.end();

        process_json_path_of_child_elements(child_values_begin, child_values_end, json_path, result);
      }

      return result;
    } else {
      return INVALID_JSON_POINTER;
    }
  } else {
    element result;
    auto error = this->at_path(json_path).get(result);
    if (error) {
      return error;
    }
    return std::vector<element>{std::move(result)};
  }
}

inline simdjson_result<element> object::at_key(std::string_view key) const noexcept {
  iterator end_field = end();
  for (iterator field = begin(); field != end_field; ++field) {
    if (field.key_equals(key)) {
      return field.value();
    }
  }
  return NO_SUCH_FIELD;
}

inline std::vector<element>& object::get_values(std::vector<element>& out) const noexcept {
  iterator end_field = end();
  iterator begin_field = begin();

  out.reserve(std::distance(begin_field, end_field));
  for (iterator field = begin_field; field != end_field; ++field) {
    out.emplace_back(field.value());
  }

  return out;
}
// In case you wonder why we need this, please see
// https://github.com/simdjson/simdjson/issues/323
// People do seek keys in a case-insensitive manner.
inline simdjson_result<element> object::at_key_case_insensitive(std::string_view key) const noexcept {
  iterator end_field = end();
  for (iterator field = begin(); field != end_field; ++field) {
    if (field.key_equals_case_insensitive(key)) {
      return field.value();
    }
  }
  return NO_SUCH_FIELD;
}

inline object::operator element() const noexcept {
	return element(tape);
}

//
// object::iterator inline implementation
//
simdjson_inline object::iterator::iterator(const internal::tape_ref &_tape) noexcept : tape{_tape} { }
inline const key_value_pair object::iterator::operator*() const noexcept {
  return key_value_pair(key(), value());
}
inline bool object::iterator::operator!=(const object::iterator& other) const noexcept {
  return tape.json_index != other.tape.json_index;
}
inline bool object::iterator::operator==(const object::iterator& other) const noexcept {
  return tape.json_index == other.tape.json_index;
}
inline bool object::iterator::operator<(const object::iterator& other) const noexcept {
  return tape.json_index < other.tape.json_index;
}
inline bool object::iterator::operator<=(const object::iterator& other) const noexcept {
  return tape.json_index <= other.tape.json_index;
}
inline bool object::iterator::operator>=(const object::iterator& other) const noexcept {
  return tape.json_index >= other.tape.json_index;
}
inline bool object::iterator::operator>(const object::iterator& other) const noexcept {
  return tape.json_index > other.tape.json_index;
}
inline object::iterator& object::iterator::operator++() noexcept {
  tape.json_index++;
  tape.json_index = tape.after_element();
  return *this;
}
inline object::iterator object::iterator::operator++(int) noexcept {
  object::iterator out = *this;
  ++*this;
  return out;
}
inline std::string_view object::iterator::key() const noexcept {
  return tape.get_string_view();
}
inline uint32_t object::iterator::key_length() const noexcept {
  return tape.get_string_length();
}
inline const char* object::iterator::key_c_str() const noexcept {
  return reinterpret_cast<const char *>(&tape.doc->string_buf[size_t(tape.tape_value()) + sizeof(uint32_t)]);
}
inline element object::iterator::value() const noexcept {
  return element(internal::tape_ref(tape.doc, tape.json_index + 1));
}

/**
 * Design notes:
 * Instead of constructing a string_view and then comparing it with a
 * user-provided strings, it is probably more performant to have dedicated
 * functions taking as a parameter the string we want to compare against
 * and return true when they are equal. That avoids the creation of a temporary
 * std::string_view. Though it is possible for the compiler to avoid entirely
 * any overhead due to string_view, relying too much on compiler magic is
 * problematic: compiler magic sometimes fail, and then what do you do?
 * Also, enticing users to rely on high-performance function is probably better
 * on the long run.
 */

inline bool object::iterator::key_equals(std::string_view o) const noexcept {
  // We use the fact that the key length can be computed quickly
  // without access to the string buffer.
  const uint32_t len = key_length();
  if(o.size() == len) {
    // We avoid construction of a temporary string_view instance.
    return (memcmp(o.data(), key_c_str(), len) == 0);
  }
  return false;
}

inline bool object::iterator::key_equals_case_insensitive(std::string_view o) const noexcept {
  // We use the fact that the key length can be computed quickly
  // without access to the string buffer.
  const uint32_t len = key_length();
  if(o.size() == len) {
      // See For case-insensitive string comparisons, avoid char-by-char functions
      // https://lemire.me/blog/2020/04/30/for-case-insensitive-string-comparisons-avoid-char-by-char-functions/
      // Note that it might be worth rolling our own strncasecmp function, with vectorization.
      return (simdjson_strncasecmp(o.data(), key_c_str(), len) == 0);
  }
  return false;
}
//
// key_value_pair inline implementation
//
inline key_value_pair::key_value_pair(std::string_view _key, element _value) noexcept :
  key(_key), value(_value) {}

} // namespace dom

} // namespace simdjson

#if SIMDJSON_SUPPORTS_RANGES
static_assert(std::ranges::view<simdjson::dom::object>);
static_assert(std::ranges::sized_range<simdjson::dom::object>);
#if SIMDJSON_EXCEPTIONS
static_assert(std::ranges::view<simdjson::simdjson_result<simdjson::dom::object>>);
static_assert(std::ranges::sized_range<simdjson::simdjson_result<simdjson::dom::object>>);
#endif // SIMDJSON_EXCEPTIONS
#endif // SIMDJSON_SUPPORTS_RANGES

#endif // SIMDJSON_OBJECT_INL_H
/* end file simdjson/dom/object-inl.h */
/* skipped duplicate #include "simdjson/error-inl.h" */
/* skipped duplicate #include "simdjson/jsonpathutil.h" */

#include <ostream>
#include <limits>

namespace simdjson {

//
// simdjson_result<dom::element> inline implementation
//
simdjson_inline simdjson_result<dom::element>::simdjson_result() noexcept
    : internal::simdjson_result_base<dom::element>() {}
simdjson_inline simdjson_result<dom::element>::simdjson_result(dom::element &&value) noexcept
    : internal::simdjson_result_base<dom::element>(std::forward<dom::element>(value)) {}
simdjson_inline simdjson_result<dom::element>::simdjson_result(error_code error) noexcept
    : internal::simdjson_result_base<dom::element>(error) {}
inline simdjson_result<dom::element_type> simdjson_result<dom::element>::type() const noexcept {
  if (error()) { return error(); }
  return first.type();
}

template<typename T>
simdjson_inline bool simdjson_result<dom::element>::is() const noexcept {
  return !error() && first.is<T>();
}
template<typename T>
simdjson_inline simdjson_result<T> simdjson_result<dom::element>::get() const noexcept {
  if (error()) { return error(); }
  return first.get<T>();
}
template<typename T>
simdjson_warn_unused simdjson_inline error_code simdjson_result<dom::element>::get(T &value) const noexcept {
  if (error()) { return error(); }
  return first.get<T>(value);
}

simdjson_inline simdjson_result<dom::array> simdjson_result<dom::element>::get_array() const noexcept {
  if (error()) { return error(); }
  return first.get_array();
}
simdjson_inline simdjson_result<dom::object> simdjson_result<dom::element>::get_object() const noexcept {
  if (error()) { return error(); }
  return first.get_object();
}
simdjson_inline simdjson_result<const char *> simdjson_result<dom::element>::get_c_str() const noexcept {
  if (error()) { return error(); }
  return first.get_c_str();
}
simdjson_inline simdjson_result<size_t> simdjson_result<dom::element>::get_string_length() const noexcept {
  if (error()) { return error(); }
  return first.get_string_length();
}
simdjson_inline simdjson_result<std::string_view> simdjson_result<dom::element>::get_string() const noexcept {
  if (error()) { return error(); }
  return first.get_string();
}
simdjson_inline simdjson_result<int64_t> simdjson_result<dom::element>::get_int64() const noexcept {
  if (error()) { return error(); }
  return first.get_int64();
}
simdjson_inline simdjson_result<uint64_t> simdjson_result<dom::element>::get_uint64() const noexcept {
  if (error()) { return error(); }
  return first.get_uint64();
}
simdjson_inline simdjson_result<double> simdjson_result<dom::element>::get_double() const noexcept {
  if (error()) { return error(); }
  return first.get_double();
}
simdjson_inline simdjson_result<bool> simdjson_result<dom::element>::get_bool() const noexcept {
  if (error()) { return error(); }
  return first.get_bool();
}

simdjson_inline bool simdjson_result<dom::element>::is_array() const noexcept {
  return !error() && first.is_array();
}
simdjson_inline bool simdjson_result<dom::element>::is_object() const noexcept {
  return !error() && first.is_object();
}
simdjson_inline bool simdjson_result<dom::element>::is_string() const noexcept {
  return !error() && first.is_string();
}
simdjson_inline bool simdjson_result<dom::element>::is_int64() const noexcept {
  return !error() && first.is_int64();
}
simdjson_inline bool simdjson_result<dom::element>::is_uint64() const noexcept {
  return !error() && first.is_uint64();
}
simdjson_inline bool simdjson_result<dom::element>::is_double() const noexcept {
  return !error() && first.is_double();
}
simdjson_inline bool simdjson_result<dom::element>::is_number() const noexcept {
  return !error() && first.is_number();
}
simdjson_inline bool simdjson_result<dom::element>::is_bool() const noexcept {
  return !error() && first.is_bool();
}

simdjson_inline bool simdjson_result<dom::element>::is_null() const noexcept {
  return !error() && first.is_null();
}

simdjson_inline simdjson_result<dom::element> simdjson_result<dom::element>::operator[](std::string_view key) const noexcept {
  if (error()) { return error(); }
  return first[key];
}
simdjson_inline simdjson_result<dom::element> simdjson_result<dom::element>::operator[](const char *key) const noexcept {
  if (error()) { return error(); }
  return first[key];
}
simdjson_inline simdjson_result<dom::element> simdjson_result<dom::element>::at_pointer(const std::string_view json_pointer) const noexcept {
  if (error()) { return error(); }
  return first.at_pointer(json_pointer);
}
simdjson_inline simdjson_result<dom::element> simdjson_result<dom::element>::at_path(const std::string_view json_path) const noexcept {
  auto json_pointer = json_path_to_pointer_conversion(json_path);
  if (json_pointer == "-1") { return INVALID_JSON_POINTER; }
  return at_pointer(json_pointer);
}

simdjson_inline simdjson_result<std::vector<dom::element>> simdjson_result<dom::element>::at_path_with_wildcard(const std::string_view json_path) const noexcept {
  if (error()) { return error(); }
  return first.at_path_with_wildcard(json_path);
}

#ifndef SIMDJSON_DISABLE_DEPRECATED_API
[[deprecated("For standard compliance, use at_pointer instead, and prefix your pointers with a slash '/', see RFC6901 ")]]
simdjson_inline simdjson_result<dom::element> simdjson_result<dom::element>::at(const std::string_view json_pointer) const noexcept {
SIMDJSON_PUSH_DISABLE_WARNINGS
SIMDJSON_DISABLE_DEPRECATED_WARNING
  if (error()) { return error(); }
  return first.at(json_pointer);
SIMDJSON_POP_DISABLE_WARNINGS
}
#endif // SIMDJSON_DISABLE_DEPRECATED_API
simdjson_inline simdjson_result<dom::element> simdjson_result<dom::element>::at(size_t index) const noexcept {
  if (error()) { return error(); }
  return first.at(index);
}
simdjson_inline simdjson_result<dom::element> simdjson_result<dom::element>::at_key(std::string_view key) const noexcept {
  if (error()) { return error(); }
  return first.at_key(key);
}
simdjson_inline simdjson_result<dom::element> simdjson_result<dom::element>::at_key_case_insensitive(std::string_view key) const noexcept {
  if (error()) { return error(); }
  return first.at_key_case_insensitive(key);
}

#if SIMDJSON_EXCEPTIONS

simdjson_inline simdjson_result<dom::element>::operator bool() const noexcept(false) {
  return get<bool>();
}
simdjson_inline simdjson_result<dom::element>::operator const char *() const noexcept(false) {
  return get<const char *>();
}
simdjson_inline simdjson_result<dom::element>::operator std::string_view() const noexcept(false) {
  return get<std::string_view>();
}
simdjson_inline simdjson_result<dom::element>::operator uint64_t() const noexcept(false) {
  return get<uint64_t>();
}
simdjson_inline simdjson_result<dom::element>::operator int64_t() const noexcept(false) {
  return get<int64_t>();
}
simdjson_inline simdjson_result<dom::element>::operator double() const noexcept(false) {
  return get<double>();
}
simdjson_inline simdjson_result<dom::element>::operator dom::array() const noexcept(false) {
  return get<dom::array>();
}
simdjson_inline simdjson_result<dom::element>::operator dom::object() const noexcept(false) {
  return get<dom::object>();
}

simdjson_inline dom::array::iterator simdjson_result<dom::element>::begin() const noexcept(false) {
  if (error()) { throw simdjson_error(error()); }
  return first.begin();
}
simdjson_inline dom::array::iterator simdjson_result<dom::element>::end() const noexcept(false) {
  if (error()) { throw simdjson_error(error()); }
  return first.end();
}

#endif // SIMDJSON_EXCEPTIONS

namespace dom {

//
// element inline implementation
//
simdjson_inline element::element() noexcept : tape{} {}
simdjson_inline element::element(const internal::tape_ref &_tape) noexcept : tape{_tape} { }

inline element_type element::type() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  auto tape_type = tape.tape_ref_type();
  return tape_type == internal::tape_type::FALSE_VALUE ? element_type::BOOL : static_cast<element_type>(tape_type);
}

inline simdjson_result<bool> element::get_bool() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  if(tape.is_true()) {
    return true;
  } else if(tape.is_false()) {
    return false;
  }
  return INCORRECT_TYPE;
}
inline simdjson_result<const char *> element::get_c_str() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  switch (tape.tape_ref_type()) {
    case internal::tape_type::STRING: {
      return tape.get_c_str();
    }
    default:
      return INCORRECT_TYPE;
  }
}
inline simdjson_result<size_t> element::get_string_length() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  switch (tape.tape_ref_type()) {
    case internal::tape_type::STRING: {
      return tape.get_string_length();
    }
    default:
      return INCORRECT_TYPE;
  }
}
inline simdjson_result<std::string_view> element::get_string() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  switch (tape.tape_ref_type()) {
    case internal::tape_type::STRING:
      return tape.get_string_view();
    default:
      return INCORRECT_TYPE;
  }
}
inline simdjson_result<uint64_t> element::get_uint64() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  if(simdjson_unlikely(!tape.is_uint64())) { // branch rarely taken
    if(tape.is_int64()) {
      int64_t result = tape.next_tape_value<int64_t>();
      if (result < 0) {
        return NUMBER_OUT_OF_RANGE;
      }
      return uint64_t(result);
    }
    return INCORRECT_TYPE;
  }
  return tape.next_tape_value<int64_t>();
}
inline simdjson_result<int64_t> element::get_int64() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  if(simdjson_unlikely(!tape.is_int64())) { // branch rarely taken
    if(tape.is_uint64()) {
      uint64_t result = tape.next_tape_value<uint64_t>();
      // Wrapping max in parens to handle Windows issue: https://stackoverflow.com/questions/11544073/how-do-i-deal-with-the-max-macro-in-windows-h-colliding-with-max-in-std
      if (result > uint64_t((std::numeric_limits<int64_t>::max)())) {
        return NUMBER_OUT_OF_RANGE;
      }
      return static_cast<int64_t>(result);
    }
    return INCORRECT_TYPE;
  }
  return tape.next_tape_value<int64_t>();
}
inline simdjson_result<double> element::get_double() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  // Performance considerations:
  // 1. Querying tape_ref_type() implies doing a shift, it is fast to just do a straight
  //   comparison.
  // 2. Using a switch-case relies on the compiler guessing what kind of code generation
  //    we want... But the compiler cannot know that we expect the type to be "double"
  //    most of the time.
  // We can expect get<double> to refer to a double type almost all the time.
  // It is important to craft the code accordingly so that the compiler can use this
  // information. (This could also be solved with profile-guided optimization.)
  if(simdjson_unlikely(!tape.is_double())) { // branch rarely taken
    if(tape.is_uint64()) {
      return double(tape.next_tape_value<uint64_t>());
    } else if(tape.is_int64()) {
      return double(tape.next_tape_value<int64_t>());
    }
    return INCORRECT_TYPE;
  }
  // this is common:
  return tape.next_tape_value<double>();
}
inline simdjson_result<array> element::get_array() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  switch (tape.tape_ref_type()) {
    case internal::tape_type::START_ARRAY:
      return array(tape);
    default:
      return INCORRECT_TYPE;
  }
}
inline simdjson_result<object> element::get_object() const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  switch (tape.tape_ref_type()) {
    case internal::tape_type::START_OBJECT:
      return object(tape);
    default:
      return INCORRECT_TYPE;
  }
}

template<typename T>
simdjson_warn_unused simdjson_inline error_code element::get(T &value) const noexcept {
  return get<T>().get(value);
}
// An element-specific version prevents recursion with simdjson_result::get<element>(value)
template<>
simdjson_warn_unused simdjson_inline error_code element::get<element>(element &value) const noexcept {
  value = element(tape);
  return SUCCESS;
}
template<typename T>
inline void element::tie(T &value, error_code &error) && noexcept {
  error = get<T>(value);
}

template<typename T>
simdjson_inline bool element::is() const noexcept {
  auto result = get<T>();
  return !result.error();
}

template<> inline simdjson_result<array> element::get<array>() const noexcept { return get_array(); }
template<> inline simdjson_result<object> element::get<object>() const noexcept { return get_object(); }
template<> inline simdjson_result<const char *> element::get<const char *>() const noexcept { return get_c_str(); }
template<> inline simdjson_result<std::string_view> element::get<std::string_view>() const noexcept { return get_string(); }
template<> inline simdjson_result<int64_t> element::get<int64_t>() const noexcept { return get_int64(); }
template<> inline simdjson_result<uint64_t> element::get<uint64_t>() const noexcept { return get_uint64(); }
template<> inline simdjson_result<double> element::get<double>() const noexcept { return get_double(); }
template<> inline simdjson_result<bool> element::get<bool>() const noexcept { return get_bool(); }

inline bool element::is_array() const noexcept { return is<array>(); }
inline bool element::is_object() const noexcept { return is<object>(); }
inline bool element::is_string() const noexcept { return is<std::string_view>(); }
inline bool element::is_int64() const noexcept { return is<int64_t>(); }
inline bool element::is_uint64() const noexcept { return is<uint64_t>(); }
inline bool element::is_double() const noexcept { return is<double>(); }
inline bool element::is_bool() const noexcept { return is<bool>(); }
inline bool element::is_number() const noexcept { return is_int64() || is_uint64() || is_double(); }

inline bool element::is_null() const noexcept {
  return tape.is_null_on_tape();
}

#if SIMDJSON_EXCEPTIONS

inline element::operator bool() const noexcept(false) { return get<bool>(); }
inline element::operator const char*() const noexcept(false) { return get<const char *>(); }
inline element::operator std::string_view() const noexcept(false) { return get<std::string_view>(); }
inline element::operator uint64_t() const noexcept(false) { return get<uint64_t>(); }
inline element::operator int64_t() const noexcept(false) { return get<int64_t>(); }
inline element::operator double() const noexcept(false) { return get<double>(); }
inline element::operator array() const noexcept(false) { return get<array>(); }
inline element::operator object() const noexcept(false) { return get<object>(); }

inline array::iterator element::begin() const noexcept(false) {
  return get<array>().begin();
}
inline array::iterator element::end() const noexcept(false) {
  return get<array>().end();
}

#endif // SIMDJSON_EXCEPTIONS

inline simdjson_result<element> element::operator[](std::string_view key) const noexcept {
  return at_key(key);
}
inline simdjson_result<element> element::operator[](const char *key) const noexcept {
  return at_key(key);
}

inline bool is_pointer_well_formed(std::string_view json_pointer) noexcept {
  if (simdjson_unlikely(json_pointer[0] != '/')) {
    return false;
  }
  size_t escape = json_pointer.find('~');
  if (escape == std::string_view::npos) {
    return true;
  }
  if (escape == json_pointer.size() - 1) {
    return false;
  }
  if (json_pointer[escape + 1] != '0' && json_pointer[escape + 1] != '1') {
    return false;
  }
  return true;
}

inline simdjson_result<element> element::at_pointer(std::string_view json_pointer) const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  switch (tape.tape_ref_type()) {
    case internal::tape_type::START_OBJECT:
      return object(tape).at_pointer(json_pointer);
    case internal::tape_type::START_ARRAY:
      return array(tape).at_pointer(json_pointer);
    default: {
      if (!json_pointer.empty()) { // a non-empty string can be invalid, or accessing a primitive (issue 2154)
        if (is_pointer_well_formed(json_pointer)) {
          return NO_SUCH_FIELD;
        }
        return INVALID_JSON_POINTER;
      }
      // an empty string means that we return the current node
      dom::element copy(*this);
      return simdjson_result<element>(std::move(copy));
    }
  }
}

inline simdjson_result<std::vector<element>> element::at_path_with_wildcard(std::string_view json_path) const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914

  switch (tape.tape_ref_type()) {
    case internal::tape_type::START_OBJECT:
      return object(tape).at_path_with_wildcard(json_path);
    case internal::tape_type::START_ARRAY:
      return array(tape).at_path_with_wildcard(json_path);
    default:
      return std::vector<element>{};
  }
}

inline simdjson_result<element> element::at_path(std::string_view json_path) const noexcept {
  auto json_pointer = json_path_to_pointer_conversion(json_path);
  if (json_pointer == "-1") { return INVALID_JSON_POINTER; }
  return at_pointer(json_pointer);
}
#ifndef SIMDJSON_DISABLE_DEPRECATED_API
[[deprecated("For standard compliance, use at_pointer instead, and prefix your pointers with a slash '/', see RFC6901 ")]]
inline simdjson_result<element> element::at(std::string_view json_pointer) const noexcept {
  // version 0.4 of simdjson allowed non-compliant pointers
  auto std_pointer = (json_pointer.empty() ? "" : "/") + std::string(json_pointer.begin(), json_pointer.end());
  return at_pointer(std_pointer);
}
#endif // SIMDJSON_DISABLE_DEPRECATED_API

inline simdjson_result<element> element::at(size_t index) const noexcept {
  return get<array>().at(index);
}
inline simdjson_result<element> element::at_key(std::string_view key) const noexcept {
  return get<object>().at_key(key);
}
inline simdjson_result<element> element::at_key_case_insensitive(std::string_view key) const noexcept {
  return get<object>().at_key_case_insensitive(key);
}
inline bool element::operator<(const element &other) const noexcept {
  return tape.json_index < other.tape.json_index;
}
inline bool element::operator==(const element &other) const noexcept {
  return tape.json_index == other.tape.json_index;
}

inline bool element::dump_raw_tape(std::ostream &out) const noexcept {
  SIMDJSON_DEVELOPMENT_ASSERT(tape.usable()); // https://github.com/simdjson/simdjson/issues/1914
  return tape.doc->dump_raw_tape(out);
}


inline std::ostream& operator<<(std::ostream& out, element_type type) {
  switch (type) {
    case element_type::ARRAY:
      return out << "array";
    case element_type::OBJECT:
      return out << "object";
    case element_type::INT64:
      return out << "int64_t";
    case element_type::UINT64:
      return out << "uint64_t";
    case element_type::DOUBLE:
      return out << "double";
    case element_type::STRING:
      return out << "string";
    case element_type::BOOL:
      return out << "bool";
    case element_type::NULL_VALUE:
      return out << "null";
    default:
      return out << "unexpected content!!!"; // abort() usage is forbidden in the library
  }
}

} // namespace dom

} // namespace simdjson

#endif // SIMDJSON_ELEMENT_INL_H
/* end file simdjson/dom/element-inl.h */

#if SIMDJSON_SUPPORTS_RANGES
static_assert(std::ranges::view<simdjson::dom::array>);
static_assert(std::ranges::sized_range<simdjson::dom::array>);
#if SIMDJSON_EXCEPTIONS
static_assert(std::ranges::view<simdjson::simdjson_result<simdjson::dom::array>>);
static_assert(std::ranges::sized_range<simdjson::simdjson_result<simdjson::dom::array>>);
#endif // SIMDJSON_EXCEPTIONS
#endif // SIMDJSON_SUPPORTS_RANGES

#endif // SIMDJSON_ARRAY_INL_H
/* end file simdjson/dom/array-inl.h */
/* including simdjson/dom/document_stream-inl.h: #include "simdjson/dom/document_stream-inl.h" */
/* begin file simdjson/dom/document_stream-inl.h */
#ifndef SIMDJSON_DOCUMENT_STREAM_INL_H
#define SIMDJSON_DOCUMENT_STREAM_INL_H

/* skipped duplicate #include "simdjson/dom/base.h" */
/* skipped duplicate #include "simdjson/dom/document_stream.h" */
/* skipped duplicate #include "simdjson/dom/element-inl.h" */
/* including simdjson/dom/parser-inl.h: #include "simdjson/dom/parser-inl.h" */
/* begin file simdjson/dom/parser-inl.h */
#ifndef SIMDJSON_PARSER_INL_H
#define SIMDJSON_PARSER_INL_H

/* skipped duplicate #include "simdjson/dom/base.h" */
/* skipped duplicate #include "simdjson/dom/document_stream.h" */
/* skipped duplicate #include "simdjson/implementation.h" */
/* skipped duplicate #include "simdjson/internal/dom_parser_implementation.h" */

/* skipped duplicate #include "simdjson/error-inl.h" */
/* skipped duplicate #include "simdjson/padded_string-inl.h" */
/* skipped duplicate #include "simdjson/dom/document_stream-inl.h" */
/* skipped duplicate #include "simdjson/dom/element-inl.h" */

#include <climits>
#include <cstring> /* memcmp */

namespace simdjson {
namespace dom {

//
// parser inline implementation
//
simdjson_inline parser::parser(size_t max_capacity) noexcept
  : _max_capacity{max_capacity},
    loaded_bytes(nullptr) {
}
simdjson_inline parser::parser(parser &&other) noexcept = default;
simdjson_inline parser &parser::operator=(parser &&other) noexcept = default;

inline bool parser::is_valid() const noexcept { return valid; }
inline int parser::get_error_code() const noexcept { return error; }
inline std::string parser::get_error_message() const noexcept { return error_message(error); }

inline bool parser::dump_raw_tape(std::ostream &os) const noexcept {
  return valid ? doc.dump_raw_tape(os) : false;
}

inline simdjson_result<size_t> parser::read_file(std::string_view path) noexcept {
  // Open the file
  SIMDJSON_PUSH_DISABLE_WARNINGS
  SIMDJSON_DISABLE_DEPRECATED_WARNING // Disable CRT_SECURE warning on MSVC: manually verified this is safe
  std::FILE *fp = std::fopen(path.data(), "rb");
  SIMDJSON_POP_DISABLE_WARNINGS

  if (fp == nullptr) {
    return IO_ERROR;
  }

  // Get the file size
  int ret;
#if SIMDJSON_VISUAL_STUDIO && !SIMDJSON_IS_32BITS
  ret = _fseeki64(fp, 0, SEEK_END);
#else
  ret = std::fseek(fp, 0, SEEK_END);
#endif // _WIN64
  if(ret < 0) {
    std::fclose(fp);
    return IO_ERROR;
  }
#if SIMDJSON_VISUAL_STUDIO && !SIMDJSON_IS_32BITS
  __int64 len = _ftelli64(fp);
  if(len == -1L) {
    std::fclose(fp);
    return IO_ERROR;
  }
#else
  long len = std::ftell(fp);
  if((len < 0) || (len == LONG_MAX)) {
    std::fclose(fp);
    return IO_ERROR;
  }
#endif

  // Make sure we have enough capacity to load the file
  if (_loaded_bytes_capacity < size_t(len)) {
    loaded_bytes.reset( internal::allocate_padded_buffer(len) );
    if (!loaded_bytes) {
      std::fclose(fp);
      return MEMALLOC;
    }
    _loaded_bytes_capacity = len;
  }

  // Read the string
  std::rewind(fp);
  size_t bytes_read = std::fread(loaded_bytes.get(), 1, len, fp);
  if (std::fclose(fp) != 0 || bytes_read != size_t(len)) {
    return IO_ERROR;
  }

  return bytes_read;
}

inline simdjson_result<element> parser::load(std::string_view path) & noexcept {
  return load_into_document(doc, path);
}

inline simdjson_result<element> parser::load_into_document(document& provided_doc, std::string_view path) & noexcept {
  size_t len;
  auto _error = read_file(path).get(len);
  if (_error) { return _error; }
  return parse_into_document(provided_doc, loaded_bytes.get(), len, false);
}

inline simdjson_result<document_stream> parser::load_many(std::string_view path, size_t batch_size) noexcept {
  size_t len;
  auto _error = read_file(path).get(len);
  if (_error) { return _error; }
  if(batch_size < MINIMAL_BATCH_SIZE) { batch_size = MINIMAL_BATCH_SIZE; }
  return document_stream(*this, reinterpret_cast<const uint8_t*>(loaded_bytes.get()), len, batch_size);
}

inline simdjson_result<element> parser::parse_into_document(document& provided_doc, const uint8_t *buf, size_t len, bool realloc_if_needed) & noexcept {
  // Important: we need to ensure that document has enough capacity.
  // Important: It is possible that provided_doc is actually the internal 'doc' within the parser!!!
  error_code _error = ensure_capacity(provided_doc, len);
  if (_error) { return _error; }
  if (realloc_if_needed) {
    // Make sure we have enough capacity to copy len bytes
    if (!loaded_bytes || _loaded_bytes_capacity < len) {
      loaded_bytes.reset( internal::allocate_padded_buffer(len) );
      if (!loaded_bytes) {
        return MEMALLOC;
      }
      _loaded_bytes_capacity = len;
    }
    std::memcpy(static_cast<void *>(loaded_bytes.get()), buf, len);
    buf = reinterpret_cast<const uint8_t*>(loaded_bytes.get());
  }

  if((len >= 3) && (std::memcmp(buf, "\xEF\xBB\xBF", 3) == 0)) {
    buf += 3;
    len -= 3;
  }
  _error = implementation->parse(buf, len, provided_doc);

  if (_error) { return _error; }

  return provided_doc.root();
}

simdjson_inline simdjson_result<element> parser::parse_into_document(document& provided_doc, const char *buf, size_t len, bool realloc_if_needed) & noexcept {
  return parse_into_document(provided_doc, reinterpret_cast<const uint8_t *>(buf), len, realloc_if_needed);
}
simdjson_inline simdjson_result<element> parser::parse_into_document(document& provided_doc, const std::string &s) & noexcept {
  return parse_into_document(provided_doc, s.data(), s.length(), s.capacity() - s.length() < SIMDJSON_PADDING);
}
simdjson_inline simdjson_result<element> parser::parse_into_document(document& provided_doc, const padded_string &s) & noexcept {
  return parse_into_document(provided_doc, s.data(), s.length(), false);
}


inline simdjson_result<element> parser::parse(const uint8_t *buf, size_t len, bool realloc_if_needed) & noexcept {
  return parse_into_document(doc, buf, len, realloc_if_needed);
}

simdjson_inline simdjson_result<element> parser::parse(const char *buf, size_t len, bool realloc_if_needed) & noexcept {
  return parse(reinterpret_cast<const uint8_t *>(buf), len, realloc_if_needed);
}
simdjson_inline simdjson_result<element> parser::parse(const std::string &s) & noexcept {
  return parse(s.data(), s.length(), s.capacity() - s.length() < SIMDJSON_PADDING);
}
simdjson_inline simdjson_result<element> parser::parse(const padded_string &s) & noexcept {
  return parse(s.data(), s.length(), false);
}
simdjson_inline simdjson_result<element> parser::parse(const padded_string_view &v) & noexcept {
  return parse(v.data(), v.length(), false);
}

inline simdjson_result<document_stream> parser::parse_many(const uint8_t *buf, size_t len, size_t batch_size) noexcept {
  if(batch_size < MINIMAL_BATCH_SIZE) { batch_size = MINIMAL_BATCH_SIZE; }
  if((len >= 3) && (std::memcmp(buf, "\xEF\xBB\xBF", 3) == 0)) {
    buf += 3;
    len -= 3;
  }
  return document_stream(*this, buf, len, batch_size);
}
inline simdjson_result<document_stream> parser::parse_many(const char *buf, size_t len, size_t batch_size) noexcept {
  return parse_many(reinterpret_cast<const uint8_t *>(buf), len, batch_size);
}
inline simdjson_result<document_stream> parser::parse_many(const std::string &s, size_t batch_size) noexcept {
  return parse_many(s.data(), s.length(), batch_size);
}
inline simdjson_result<document_stream> parser::parse_many(const padded_string &s, size_t batch_size) noexcept {
  return parse_many(s.data(), s.length(), batch_size);
}

simdjson_inline size_t parser::capacity() const noexcept {
  return implementation ? implementation->capacity() : 0;
}
simdjson_inline size_t parser::max_capacity() const noexcept {
  return _max_capacity;
}
simdjson_pure simdjson_inline size_t parser::max_depth() const noexcept {
  return implementation ? implementation->max_depth() : DEFAULT_MAX_DEPTH;
}

simdjson_warn_unused
inline error_code parser::allocate(size_t capacity, size_t max_depth) noexcept {
  //
  // Reallocate implementation if needed
  //
  error_code err;
  if (implementation) {
    err = implementation->allocate(capacity, max_depth);
  } else {
    err = simdjson::get_active_implementation()->create_dom_parser_implementation(capacity, max_depth, implementation);
  }
  if (err) { return err; }
  return SUCCESS;
}

#ifndef SIMDJSON_DISABLE_DEPRECATED_API
simdjson_warn_unused
inline bool parser::allocate_capacity(size_t capacity, size_t max_depth) noexcept {
  return !allocate(capacity, max_depth);
}
#endif // SIMDJSON_DISABLE_DEPRECATED_API

inline error_code parser::ensure_capacity(size_t desired_capacity) noexcept {
  return ensure_capacity(doc, desired_capacity);
}


inline error_code parser::ensure_capacity(document& target_document, size_t desired_capacity) noexcept {
  // 1. It is wasteful to allocate a document and a parser for documents spanning less than MINIMAL_DOCUMENT_CAPACITY bytes.
  // 2. If we allow desired_capacity = 0 then it is possible to exit this function with implementation == nullptr.
  if(desired_capacity < MINIMAL_DOCUMENT_CAPACITY) { desired_capacity = MINIMAL_DOCUMENT_CAPACITY; }
  // If we don't have enough capacity, (try to) automatically bump it.
  // If the document needs allocation, do it too.
  // Both in one if statement to minimize unlikely branching.
  //
  // Note: we must make sure that this function is called if capacity() == 0. We do so because we
  // ensure that desired_capacity > 0.
  if (simdjson_unlikely(capacity() < desired_capacity || target_document.capacity() < desired_capacity)) {
    if (desired_capacity > max_capacity()) {
      return error = CAPACITY;
    }
    error_code err1 = target_document.capacity() < desired_capacity ? target_document.allocate(desired_capacity) : SUCCESS;
    error_code err2 = capacity() < desired_capacity ? allocate(desired_capacity, max_depth()) : SUCCESS;
    if(err1 != SUCCESS) { return error = err1; }
    if(err2 != SUCCESS) { return error = err2; }
  }
  return SUCCESS;
}

simdjson_inline void parser::set_max_capacity(size_t max_capacity) noexcept {
  if(max_capacity > MINIMAL_DOCUMENT_CAPACITY) {
    _max_capacity = max_capacity;
  } else {
    _max_capacity = MINIMAL_DOCUMENT_CAPACITY;
  }
}

} // namespace dom
} // namespace simdjson

#endif // SIMDJSON_PARSER_INL_H
/* end file simdjson/dom/parser-inl.h */
/* skipped duplicate #include "simdjson/error-inl.h" */
/* skipped duplicate #include "simdjson/internal/dom_parser_implementation.h" */

namespace simdjson {
namespace dom {

#ifdef SIMDJSON_THREADS_ENABLED

inline void stage1_worker::finish() {
  // After calling "run" someone would call finish() to wait
  // for the end of the processing.
  // This function will wait until either the thread has done
  // the processing or, else, the destructor has been called.
  std::unique_lock<std::mutex> lock(locking_mutex);
  cond_var.wait(lock, [this]{return has_work == false;});
}

inline stage1_worker::~stage1_worker() {
  // The thread may never outlive the stage1_worker instance
  // and will always be stopped/joined before the stage1_worker
  // instance is gone.
  stop_thread();
}

inline void stage1_worker::start_thread() {
  std::unique_lock<std::mutex> lock(locking_mutex);
  if(thread.joinable()) {
    return; // This should never happen but we never want to create more than one thread.
  }
  thread = std::thread([this]{
      while(true) {
        std::unique_lock<std::mutex> thread_lock(locking_mutex);
        // We wait for either "run" or "stop_thread" to be called.
        cond_var.wait(thread_lock, [this]{return has_work || !can_work;});
        // If, for some reason, the stop_thread() method was called (i.e., the
        // destructor of stage1_worker is called, then we want to immediately destroy
        // the thread (and not do any more processing).
        if(!can_work) {
          break;
        }
        this->owner->stage1_thread_error = this->owner->run_stage1(*this->stage1_thread_parser,
              this->_next_batch_start);
        this->has_work = false;
        // The condition variable call should be moved after thread_lock.unlock() for performance
        // reasons but thread sanitizers may report it as a data race if we do.
        // See https://stackoverflow.com/questions/35775501/c-should-condition-variable-be-notified-under-lock
        cond_var.notify_one(); // will notify "finish"
        thread_lock.unlock();
      }
    }
  );
}


inline void stage1_worker::stop_thread() {
  std::unique_lock<std::mutex> lock(locking_mutex);
  // We have to make sure that all locks can be released.
  can_work = false;
  has_work = false;
  cond_var.notify_all();
  lock.unlock();
  if(thread.joinable()) {
    thread.join();
  }
}

inline void stage1_worker::run(document_stream * ds, dom::parser * stage1, size_t next_batch_start) {
  std::unique_lock<std::mutex> lock(locking_mutex);
  owner = ds;
  _next_batch_start = next_batch_start;
  stage1_thread_parser = stage1;
  has_work = true;
  // The condition variable call should be moved after thread_lock.unlock() for performance
  // reasons but thread sanitizers may report it as a data race if we do.
  // See https://stackoverflow.com/questions/35775501/c-should-condition-variable-be-notified-under-lock
  cond_var.notify_one(); // will notify the thread lock that we have work
  lock.unlock();
}
#endif

simdjson_inline document_stream::document_stream(
  dom::parser &_parser,
  const uint8_t *_buf,
  size_t _len,
  size_t _batch_size
) noexcept
  : parser{&_parser},
    buf{_buf},
    len{_len},
    batch_size{_batch_size <= MINIMAL_BATCH_SIZE ? MINIMAL_BATCH_SIZE : _batch_size},
    error{SUCCESS}
#ifdef SIMDJSON_THREADS_ENABLED
    , use_thread(_parser.threaded) // we need to make a copy because _parser.threaded can change
#endif
{
#ifdef SIMDJSON_THREADS_ENABLED
  if(worker.get() == nullptr) {
    error = MEMALLOC;
  }
#endif
}

simdjson_inline document_stream::document_stream() noexcept
  : parser{nullptr},
    buf{nullptr},
    len{0},
    batch_size{0},
    error{UNINITIALIZED}
#ifdef SIMDJSON_THREADS_ENABLED
    , use_thread(false)
#endif
{
}

simdjson_inline document_stream::~document_stream() noexcept {
#ifdef SIMDJSON_THREADS_ENABLED
  worker.reset();
#endif
}

simdjson_inline document_stream::iterator::iterator() noexcept
  : stream{nullptr}, finished{true} {
}

simdjson_inline document_stream::iterator document_stream::begin() noexcept {
  start();
  // If there are no documents, we're finished.
  return iterator(this, error == EMPTY);
}

simdjson_inline document_stream::iterator document_stream::end() noexcept {
  return iterator(this, true);
}

simdjson_inline document_stream::iterator::iterator(document_stream* _stream, bool is_end) noexcept
  : stream{_stream}, finished{is_end} {
}

simdjson_inline document_stream::iterator::reference document_stream::iterator::operator*() noexcept {
  // Note that in case of error, we do not yet mark
  // the iterator as "finished": this detection is done
  // in the operator++ function since it is possible
  // to call operator++ repeatedly while omitting
  // calls to operator*.
  if (stream->error) { return stream->error; }
  return stream->parser->doc.root();
}

simdjson_inline document_stream::iterator& document_stream::iterator::operator++() noexcept {
  // If there is an error, then we want the iterator
  // to be finished, no matter what. (E.g., we do not
  // keep generating documents with errors, or go beyond
  // a document with errors.)
  //
  // Users do not have to call "operator*()" when they use operator++,
  // so we need to end the stream in the operator++ function.
  //
  // Note that setting finished = true is essential otherwise
  // we would enter an infinite loop.
  if (stream->error) { finished = true; }
  // Note that stream->error() is guarded against error conditions
  // (it will immediately return if stream->error casts to false).
  // In effect, this next function does nothing when (stream->error)
  // is true (hence the risk of an infinite loop).
  stream->next();
  // If that was the last document, we're finished.
  // It is the only type of error we do not want to appear
  // in operator*.
  if (stream->error == EMPTY) { finished = true; }
  // If we had any other kind of error (not EMPTY) then we want
  // to pass it along to the operator* and we cannot mark the result
  // as "finished" just yet.
  return *this;
}

simdjson_inline bool document_stream::iterator::operator!=(const document_stream::iterator &other) const noexcept {
  return finished != other.finished;
}

inline void document_stream::start() noexcept {
  if (error) { return; }
  error = parser->ensure_capacity(batch_size);
  if (error) { return; }
  // Always run the first stage 1 parse immediately
  batch_start = 0;
  error = run_stage1(*parser, batch_start);
  while(error == EMPTY) {
    // In exceptional cases, we may start with an empty block
    batch_start = next_batch_start();
    if (batch_start >= len) { return; }
    error = run_stage1(*parser, batch_start);
  }
  if (error) { return; }
#ifdef SIMDJSON_THREADS_ENABLED
  if (use_thread && next_batch_start() < len) {
    // Kick off the first thread if needed
    error = stage1_thread_parser.ensure_capacity(batch_size);
    if (error) { return; }
    worker->start_thread();
    start_stage1_thread();
    if (error) { return; }
  }
#endif // SIMDJSON_THREADS_ENABLED
  next();
}

simdjson_inline size_t document_stream::iterator::current_index() const noexcept {
  return stream->doc_index;
}

simdjson_inline std::string_view document_stream::iterator::source() const noexcept {
  const char* start = reinterpret_cast<const char*>(stream->buf) + current_index();
  bool object_or_array = ((*start == '[') || (*start == '{'));
  if(object_or_array) {
    size_t next_doc_index = stream->batch_start + stream->parser->implementation->structural_indexes[stream->parser->implementation->next_structural_index - 1];
    return std::string_view(start, next_doc_index - current_index() + 1);
  } else {
    size_t next_doc_index = stream->batch_start + stream->parser->implementation->structural_indexes[stream->parser->implementation->next_structural_index];
    size_t svlen = next_doc_index - current_index();
    while(svlen > 1 && (std::isspace(start[svlen-1]) || start[svlen-1] == '\0')) {
      svlen--;
    }
    return std::string_view(start, svlen);
  }
}


inline void document_stream::next() noexcept {
  // We always exit at once, once in an error condition.
  if (error) { return; }

  // Load the next document from the batch
  doc_index = batch_start + parser->implementation->structural_indexes[parser->implementation->next_structural_index];
  error = parser->implementation->stage2_next(parser->doc);
  // If that was the last document in the batch, load another batch (if available)
  while (error == EMPTY) {
    batch_start = next_batch_start();
    if (batch_start >= len) { break; }

#ifdef SIMDJSON_THREADS_ENABLED
    if(use_thread) {
      load_from_stage1_thread();
    } else {
      error = run_stage1(*parser, batch_start);
    }
#else
    error = run_stage1(*parser, batch_start);
#endif
    if (error) { continue; } // If the error was EMPTY, we may want to load another batch.
    // Run stage 2 on the first document in the batch
    doc_index = batch_start + parser->implementation->structural_indexes[parser->implementation->next_structural_index];
    error = parser->implementation->stage2_next(parser->doc);
  }
}
inline size_t document_stream::size_in_bytes() const noexcept {
  return len;
}

inline size_t document_stream::truncated_bytes() const noexcept {
  if(error == CAPACITY) { return len - batch_start; }
  return parser->implementation->structural_indexes[parser->implementation->n_structural_indexes] - parser->implementation->structural_indexes[parser->implementation->n_structural_indexes + 1];
}

inline size_t document_stream::next_batch_start() const noexcept {
  return batch_start + parser->implementation->structural_indexes[parser->implementation->n_structural_indexes];
}

inline error_code document_stream::run_stage1(dom::parser &p, size_t _batch_start) noexcept {
  size_t remaining = len - _batch_start;
  if (remaining <= batch_size) {
    return p.implementation->stage1(&buf[_batch_start], remaining, stage1_mode::streaming_final);
  } else {
    return p.implementation->stage1(&buf[_batch_start], batch_size, stage1_mode::streaming_partial);
  }
}

#ifdef SIMDJSON_THREADS_ENABLED

inline void document_stream::load_from_stage1_thread() noexcept {
  worker->finish();
  // Swap to the parser that was loaded up in the thread. Make sure the parser has
  // enough memory to swap to, as well.
  std::swap(*parser, stage1_thread_parser);
  error = stage1_thread_error;
  if (error) { return; }

  // If there's anything left, start the stage 1 thread!
  if (next_batch_start() < len) {
    start_stage1_thread();
  }
}

inline void document_stream::start_stage1_thread() noexcept {
  // we call the thread on a lambda that will update
  // this->stage1_thread_error
  // there is only one thread that may write to this value
  // TODO this is NOT exception-safe.
  this->stage1_thread_error = UNINITIALIZED; // In case something goes wrong, make sure it's an error
  size_t _next_batch_start = this->next_batch_start();

  worker->run(this, & this->stage1_thread_parser, _next_batch_start);
}

#endif // SIMDJSON_THREADS_ENABLED

} // namespace dom

simdjson_inline simdjson_result<dom::document_stream>::simdjson_result() noexcept
  : simdjson_result_base() {
}
simdjson_inline simdjson_result<dom::document_stream>::simdjson_result(error_code error) noexcept
  : simdjson_result_base(error) {
}
simdjson_inline simdjson_result<dom::document_stream>::simdjson_result(dom::document_stream &&value) noexcept
  : simdjson_result_base(std::forward<dom::document_stream>(value)) {
}

#if SIMDJSON_EXCEPTIONS
simdjson_inline dom::document_stream::iterator simdjson_result<dom::document_stream>::begin() noexcept(false) {
  if (error()) { throw simdjson_error(error()); }
  return first.begin();
}
simdjson_inline dom::document_stream::iterator simdjson_result<dom::document_stream>::end() noexcept(false) {
  if (error()) { throw simdjson_error(error()); }
  return first.end();
}
#else // SIMDJSON_EXCEPTIONS
#ifndef SIMDJSON_DISABLE_DEPRECATED_API
simdjson_inline dom::document_stream::iterator simdjson_result<dom::document_stream>::begin() noexcept {
  first.error = error();
  return first.begin();
}
simdjson_inline dom::document_stream::iterator simdjson_result<dom::document_stream>::end() noexcept {
  first.error = error();
  return first.end();
}
#endif // SIMDJSON_DISABLE_DEPRECATED_API
#endif // SIMDJSON_EXCEPTIONS

} // namespace simdjson
#endif // SIMDJSON_DOCUMENT_STREAM_INL_H
/* end file simdjson/dom/document_stream-inl.h */
/* including simdjson/dom/document-inl.h: #include "simdjson/dom/document-inl.h" */
/* begin file simdjson/dom/document-inl.h */
#ifndef SIMDJSON_DOCUMENT_INL_H
#define SIMDJSON_DOCUMENT_INL_H

// Inline implementations go in here.

/* skipped duplicate #include "simdjson/dom/base.h" */
/* skipped duplicate #include "simdjson/dom/document.h" */
/* skipped duplicate #include "simdjson/dom/element-inl.h" */
/* skipped duplicate #include "simdjson/internal/tape_ref-inl.h" */
/* including simdjson/internal/jsonformatutils.h: #include "simdjson/internal/jsonformatutils.h" */
/* begin file simdjson/internal/jsonformatutils.h */
#ifndef SIMDJSON_INTERNAL_JSONFORMATUTILS_H
#define SIMDJSON_INTERNAL_JSONFORMATUTILS_H

/* skipped duplicate #include "simdjson/base.h" */
#include <iomanip>
#include <ostream>
#include <sstream>

namespace simdjson {
namespace internal {

inline std::ostream& operator<<(std::ostream& out, const escape_json_string &str);

class escape_json_string {
public:
  escape_json_string(std::string_view _str) noexcept : str{_str} {}
  operator std::string() const noexcept { std::stringstream s; s << *this; return s.str(); }
private:
  std::string_view str;
  friend std::ostream& operator<<(std::ostream& out, const escape_json_string &unescaped);
};

inline std::ostream& operator<<(std::ostream& out, const escape_json_string &unescaped) {
  for (size_t i=0; i<unescaped.str.length(); i++) {
    switch (unescaped.str[i]) {
    case '\b':
      out << "\\b";
      break;
    case '\f':
      out << "\\f";
      break;
    case '\n':
      out << "\\n";
      break;
    case '\r':
      out << "\\r";
      break;
    case '\"':
      out << "\\\"";
      break;
    case '\t':
      out << "\\t";
      break;
    case '\\':
      out << "\\\\";
      break;
    default:
      if (static_cast<unsigned char>(unescaped.str[i]) <= 0x1F) {
        // TODO can this be done once at the beginning, or will it mess up << char?
        std::ios::fmtflags f(out.flags());
        out << "\\u" << std::hex << std::setw(4) << std::setfill('0') << int(unescaped.str[i]);
        out.flags(f);
      } else {
        out << unescaped.str[i];
      }
    }
  }
  return out;
}

} // namespace internal
} // namespace simdjson

#endif // SIMDJSON_INTERNAL_JSONFORMATUTILS_H
/* end file simdjson/internal/jsonformatutils.h */

#include <cstring>

namespace simdjson {
namespace dom {

//
// document inline implementation
//
inline element document::root() const noexcept {
  return element(internal::tape_ref(this, 1));
}
simdjson_warn_unused
inline size_t document::capacity() const noexcept {
  return allocated_capacity;
}

simdjson_warn_unused
inline error_code document::allocate(size_t capacity) noexcept {
  if (capacity == 0) {
    string_buf.reset();
    tape.reset();
    allocated_capacity = 0;
    return SUCCESS;
  }

  // a pathological input like "[[[[..." would generate capacity tape elements, so
  // need a capacity of at least capacity + 1, but it is also possible to do
  // worse with "[7,7,7,7,6,7,7,7,6,7,7,6,[7,7,7,7,6,7,7,7,6,7,7,6,7,7,7,7,7,7,6"
  //where capacity + 1 tape elements are
  // generated, see issue https://github.com/simdjson/simdjson/issues/345
  size_t tape_capacity = SIMDJSON_ROUNDUP_N(capacity + 3, 64);
  // a document with only zero-length strings... could have capacity/3 string
  // and we would need capacity/3 * 5 bytes on the string buffer
  size_t string_capacity = SIMDJSON_ROUNDUP_N(5 * capacity / 3 + SIMDJSON_PADDING, 64);
  string_buf.reset( new (std::nothrow) uint8_t[string_capacity]);
  tape.reset(new (std::nothrow) uint64_t[tape_capacity]);
  if(!(string_buf && tape)) {
    allocated_capacity = 0;
    string_buf.reset();
    tape.reset();
    return MEMALLOC;
  }
  // Technically the allocated_capacity might be larger than capacity
  // so the next line is pessimistic.
  allocated_capacity = capacity;
  return SUCCESS;
}

inline bool document::dump_raw_tape(std::ostream &os) const noexcept {
  uint32_t string_length;
  size_t tape_idx = 0;
  uint64_t tape_val = tape[tape_idx];
  uint8_t type = uint8_t(tape_val >> 56);
  os << tape_idx << " : " << type;
  tape_idx++;
  size_t how_many = 0;
  if (type == 'r') {
    how_many = size_t(tape_val & internal::JSON_VALUE_MASK);
  } else {
    // Error: no starting root node?
    return false;
  }
  os << "\t// pointing to " << how_many << " (right after last node)\n";
  uint64_t payload;
  for (; tape_idx < how_many; tape_idx++) {
    os << tape_idx << " : ";
    tape_val = tape[tape_idx];
    payload = tape_val & internal::JSON_VALUE_MASK;
    type = uint8_t(tape_val >> 56);
    switch (type) {
    case '"': // we have a string
      os << "string \"";
      std::memcpy(&string_length, string_buf.get() + payload, sizeof(uint32_t));
      os << internal::escape_json_string(std::string_view(
        reinterpret_cast<const char *>(string_buf.get() + payload + sizeof(uint32_t)),
        string_length
      ));
      os << '"';
      os << '\n';
      break;
    case 'l': // we have a long int
      if (tape_idx + 1 >= how_many) {
        return false;
      }
      os << "integer " << static_cast<int64_t>(tape[++tape_idx]) << "\n";
      break;
    case 'u': // we have a long uint
      if (tape_idx + 1 >= how_many) {
        return false;
      }
      os << "unsigned integer " << tape[++tape_idx] << "\n";
      break;
    case 'd': // we have a double
      os << "float ";
      if (tape_idx + 1 >= how_many) {
        return false;
      }
      double answer;
      std::memcpy(&answer, &tape[++tape_idx], sizeof(answer));
      os << answer << '\n';
      break;
    case 'n': // we have a null
      os << "null\n";
      break;
    case 't': // we have a true
      os << "true\n";
      break;
    case 'f': // we have a false
      os << "false\n";
      break;
    case '{': // we have an object
      os << "{\t// pointing to next tape location " << uint32_t(payload)
         << " (first node after the scope), "
         << " saturated count "
         << ((payload >> 32) & internal::JSON_COUNT_MASK)<< "\n";
      break;    case '}': // we end an object
      os << "}\t// pointing to previous tape location " << uint32_t(payload)
         << " (start of the scope)\n";
      break;
    case '[': // we start an array
      os << "[\t// pointing to next tape location " << uint32_t(payload)
         << " (first node after the scope), "
         << " saturated count "
         << ((payload >> 32) & internal::JSON_COUNT_MASK)<< "\n";
      break;
    case ']': // we end an array
      os << "]\t// pointing to previous tape location " << uint32_t(payload)
         << " (start of the scope)\n";
      break;
    case 'r': // we start and end with the root node
      // should we be hitting the root node?
      return false;
    default:
      return false;
    }
  }
  tape_val = tape[tape_idx];
  payload = tape_val & internal::JSON_VALUE_MASK;
  type = uint8_t(tape_val >> 56);
  os << tape_idx << " : " << type << "\t// pointing to " << payload
     << " (start root)\n";
  return true;
}

} // namespace dom
} // namespace simdjson

#endif // SIMDJSON_DOCUMENT_INL_H
/* end file simdjson/dom/document-inl.h */
/* skipped duplicate #include "simdjson/dom/element-inl.h" */
/* skipped duplicate #include "simdjson/dom/object-inl.h" */
/* skipped duplicate #include "simdjson/dom/parser-inl.h" */
/* skipped duplicate #include "simdjson/internal/tape_ref-inl.h" */
/* including simdjson/dom/serialization-inl.h: #include "simdjson/dom/serialization-inl.h" */
/* begin file simdjson/dom/serialization-inl.h */

#ifndef SIMDJSON_SERIALIZATION_INL_H
#define SIMDJSON_SERIALIZATION_INL_H

/* skipped duplicate #include "simdjson/dom/base.h" */
/* skipped duplicate #include "simdjson/dom/parser.h" */
/* skipped duplicate #include "simdjson/dom/serialization.h" */
/* skipped duplicate #include "simdjson/internal/tape_type.h" */

/* skipped duplicate #include "simdjson/dom/array-inl.h" */
/* skipped duplicate #include "simdjson/dom/object-inl.h" */
/* skipped duplicate #include "simdjson/internal/tape_ref-inl.h" */

#include <cstring>

namespace simdjson {
namespace dom {
inline bool parser::print_json(std::ostream &os) const noexcept {
  if (!valid) {
    return false;
  }
  simdjson::internal::string_builder<> sb;
  sb.append(doc.root());
  std::string_view answer = sb.str();
  os << answer;
  return true;
}

inline std::ostream &operator<<(std::ostream &out,
                                simdjson::dom::element value) {
  simdjson::internal::string_builder<> sb;
  sb.append(value);
  return (out << sb.str());
}
#if SIMDJSON_EXCEPTIONS
inline std::ostream &
operator<<(std::ostream &out,
           simdjson::simdjson_result<simdjson::dom::element> x) {
  if (x.error()) {
    throw simdjson::simdjson_error(x.error());
  }
  return (out << x.value());
}
#endif
inline std::ostream &operator<<(std::ostream &out, simdjson::dom::array value) {
  simdjson::internal::string_builder<> sb;
  sb.append(value);
  return (out << sb.str());
}
#if SIMDJSON_EXCEPTIONS
inline std::ostream &
operator<<(std::ostream &out,
           simdjson::simdjson_result<simdjson::dom::array> x) {
  if (x.error()) {
    throw simdjson::simdjson_error(x.error());
  }
  return (out << x.value());
}
#endif
inline std::ostream &operator<<(std::ostream &out,
                                simdjson::dom::object value) {
  simdjson::internal::string_builder<> sb;
  sb.append(value);
  return (out << sb.str());
}
#if SIMDJSON_EXCEPTIONS
inline std::ostream &
operator<<(std::ostream &out,
           simdjson::simdjson_result<simdjson::dom::object> x) {
  if (x.error()) {
    throw simdjson::simdjson_error(x.error());
  }
  return (out << x.value());
}
#endif

} // namespace dom

/***
 * Number utility functions
 **/
namespace {
/**@private
 * Escape sequence like \b or \u0001
 * We expect that most compilers will use 8 bytes for this data structure.
 **/
struct escape_sequence {
  uint8_t length;
  const char
      string[7]; // technically, we only ever need 6 characters, we pad to 8
};
/**@private
 * This converts a signed integer into a character sequence.
 * The caller is responsible for providing enough memory (at least
 * 20 characters.)
 * Though various runtime libraries provide itoa functions,
 * it is not part of the C++ standard. The C++17 standard
 * adds the to_chars functions which would do as well, but
 * we want to support C++11.
 */
static char *fast_itoa(char *output, int64_t value) noexcept {
  // This is a standard implementation of itoa.
  char buffer[20];
  uint64_t value_positive;
  // In general, negating a signed integer is unsafe.
  if (value < 0) {
    *output++ = '-';
    // Doing value_positive = -value; while avoiding
    // undefined behavior warnings.
    // It assumes two complement's which is universal at this
    // point in time.
    std::memcpy(&value_positive, &value, sizeof(value));
    value_positive = (~value_positive) + 1; // this is a negation
  } else {
    value_positive = value;
  }
  // We work solely with value_positive. It *might* be easier
  // for an optimizing compiler to deal with an unsigned variable
  // as far as performance goes.
  const char *const end_buffer = buffer + 20;
  char *write_pointer = buffer + 19;
  // A faster approach is possible if we expect large integers:
  // unroll the loop (work in 100s, 1000s) and use some kind of
  // memoization.
  while (value_positive >= 10) {
    *write_pointer-- = char('0' + (value_positive % 10));
    value_positive /= 10;
  }
  *write_pointer = char('0' + value_positive);
  size_t len = end_buffer - write_pointer;
  std::memcpy(output, write_pointer, len);
  return output + len;
}
/**@private
 * This converts an unsigned integer into a character sequence.
 * The caller is responsible for providing enough memory (at least
 * 19 characters.)
 * Though various runtime libraries provide itoa functions,
 * it is not part of the C++ standard. The C++17 standard
 * adds the to_chars functions which would do as well, but
 * we want to support C++11.
 */
static char *fast_itoa(char *output, uint64_t value) noexcept {
  // This is a standard implementation of itoa.
  char buffer[20];
  const char *const end_buffer = buffer + 20;
  char *write_pointer = buffer + 19;
  // A faster approach is possible if we expect large integers:
  // unroll the loop (work in 100s, 1000s) and use some kind of
  // memoization.
  while (value >= 10) {
    *write_pointer-- = char('0' + (value % 10));
    value /= 10;
  };
  *write_pointer = char('0' + value);
  size_t len = end_buffer - write_pointer;
  std::memcpy(output, write_pointer, len);
  return output + len;
}

} // anonymous namespace
namespace internal {

/***
 * Minifier/formatter code.
 **/

template <class formatter>
simdjson_inline void base_formatter<formatter>::number(uint64_t x) {
  char number_buffer[24];
  char *newp = fast_itoa(number_buffer, x);
  chars(number_buffer, newp);
}

template <class formatter>
simdjson_inline void base_formatter<formatter>::number(int64_t x) {
  char number_buffer[24];
  char *newp = fast_itoa(number_buffer, x);
  chars(number_buffer, newp);
}

template <class formatter>
simdjson_inline void base_formatter<formatter>::number(double x) {
  char number_buffer[24];
  // Currently, passing the nullptr to the second argument is
  // safe because our implementation does not check the second
  // argument.
  char *newp = internal::to_chars(number_buffer, nullptr, x);
  chars(number_buffer, newp);
}

template <class formatter>
simdjson_inline void base_formatter<formatter>::start_array() {
  one_char('[');
}

template <class formatter>
simdjson_inline void base_formatter<formatter>::end_array() {
  one_char(']');
}

template <class formatter>
simdjson_inline void base_formatter<formatter>::start_object() {
  one_char('{');
}

template <class formatter>
simdjson_inline void base_formatter<formatter>::end_object() {
  one_char('}');
}

template <class formatter>
simdjson_inline void base_formatter<formatter>::comma() {
  one_char(',');
}

template <class formatter>
simdjson_inline void base_formatter<formatter>::true_atom() {
  const char *s = "true";
  chars(s, s + 4);
}

template <class formatter>
simdjson_inline void base_formatter<formatter>::false_atom() {
  const char *s = "false";
  chars(s, s + 5);
}

template <class formatter>
simdjson_inline void base_formatter<formatter>::null_atom() {
  const char *s = "null";
  chars(s, s + 4);
}

template <class formatter>
simdjson_inline void base_formatter<formatter>::one_char(char c) {
  buffer.push_back(c);
}

template <class formatter>
simdjson_inline void base_formatter<formatter>::chars(const char *begin,
                                                      const char *end) {
  buffer.append(begin, end);
}

template <class formatter>
simdjson_inline void
base_formatter<formatter>::key(std::string_view unescaped) {
  string(unescaped);
  one_char(':');
}

template <class formatter>
simdjson_inline void
base_formatter<formatter>::string(std::string_view unescaped) {
  one_char('\"');
  size_t i = 0;
  // Fast path for the case where we have no control character, no ", and no
  // backslash. This should include most keys.
  //
  // We would like to use 'bool' but some compilers take offense to bitwise
  // operation with bool types.
  constexpr static char needs_escaping[] = {
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
  for (; i + 8 <= unescaped.length(); i += 8) {
    // Poor's man vectorization. This could get much faster if we used SIMD.
    //
    // It is not the case that replacing '|' with '||' would be neutral
    // performance-wise.
    if (needs_escaping[uint8_t(unescaped[i])] |
        needs_escaping[uint8_t(unescaped[i + 1])] |
        needs_escaping[uint8_t(unescaped[i + 2])] |
        needs_escaping[uint8_t(unescaped[i + 3])] |
        needs_escaping[uint8_t(unescaped[i + 4])] |
        needs_escaping[uint8_t(unescaped[i + 5])] |
        needs_escaping[uint8_t(unescaped[i + 6])] |
        needs_escaping[uint8_t(unescaped[i + 7])]) {
      break;
    }
  }
  for (; i < unescaped.length(); i++) {
    if (needs_escaping[uint8_t(unescaped[i])]) {
      break;
    }
  }
  // The following is also possible and omits a 256-byte table, but it is
  // slower: for (; (i < unescaped.length()) && (uint8_t(unescaped[i]) > 0x1F)
  //      && (unescaped[i] != '\"') && (unescaped[i] != '\\'); i++) {}

  // At least for long strings, the following should be fast. We could
  // do better by integrating the checks and the insertion.
  chars(unescaped.data(), unescaped.data() + i);
  // We caught a control character if we enter this loop (slow).
  // Note that we are do not restart from the beginning, but rather we continue
  // from the point where we encountered something that requires escaping.
  for (; i < unescaped.length(); i++) {
    switch (unescaped[i]) {
    case '\"': {
      const char *s = "\\\"";
      chars(s, s + 2);
    } break;
    case '\\': {
      const char *s = "\\\\";
      chars(s, s + 2);
    } break;
    default:
      if (uint8_t(unescaped[i]) <= 0x1F) {
        // If packed, this uses 8 * 32 bytes.
        // Note that we expect most compilers to embed this code in the data
        // section.
        constexpr static escape_sequence escaped[32] = {
            {6, "\\u0000"}, {6, "\\u0001"}, {6, "\\u0002"}, {6, "\\u0003"},
            {6, "\\u0004"}, {6, "\\u0005"}, {6, "\\u0006"}, {6, "\\u0007"},
            {2, "\\b"},     {2, "\\t"},     {2, "\\n"},     {6, "\\u000b"},
            {2, "\\f"},     {2, "\\r"},     {6, "\\u000e"}, {6, "\\u000f"},
            {6, "\\u0010"}, {6, "\\u0011"}, {6, "\\u0012"}, {6, "\\u0013"},
            {6, "\\u0014"}, {6, "\\u0015"}, {6, "\\u0016"}, {6, "\\u0017"},
            {6, "\\u0018"}, {6, "\\u0019"}, {6, "\\u001a"}, {6, "\\u001b"},
            {6, "\\u001c"}, {6, "\\u001d"}, {6, "\\u001e"}, {6, "\\u001f"}};
        auto u = escaped[uint8_t(unescaped[i])];
        chars(u.string, u.string + u.length);
      } else {
        one_char(unescaped[i]);
      }
    } // switch
  } // for
  one_char('\"');
}

template <class formatter> inline void base_formatter<formatter>::clear() {
  buffer.clear();
}

template <class formatter>
simdjson_inline std::string_view base_formatter<formatter>::str() const {
  return buffer.str();
}

simdjson_inline void mini_formatter::print_newline() { return; }

simdjson_inline void mini_formatter::print_indents(size_t depth) {
  (void)depth;
  return;
}

simdjson_inline void mini_formatter::print_space() { return; }

simdjson_inline void pretty_formatter::print_newline() { one_char('\n'); }

simdjson_inline void pretty_formatter::print_indents(size_t depth) {
  if (this->indent_step <= 0) {
    return;
  }
  for (size_t i = 0; i < this->indent_step * depth; i++) {
    one_char(' ');
  }
}

simdjson_inline void pretty_formatter::print_space() { one_char(' '); }

/***
 * String building code.
 **/

template <class serializer>
inline void string_builder<serializer>::append(simdjson::dom::element value) {
  // using tape_type = simdjson::internal::tape_type;
  size_t depth = 0;
  constexpr size_t MAX_DEPTH = 16;
  bool is_object[MAX_DEPTH];
  is_object[0] = false;
  bool after_value = false;

  internal::tape_ref iter(value.tape);
  do {
    // print commas after each value
    if (after_value) {
      format.comma();
      format.print_newline();
    }

    format.print_indents(depth);

    // If we are in an object, print the next key and :, and skip to the next
    // value.
    if (is_object[depth]) {
      format.key(iter.get_string_view());
      format.print_space();
      iter.json_index++;
    }
    switch (iter.tape_ref_type()) {

    // Arrays
    case tape_type::START_ARRAY: {
      // If we're too deep, we need to recurse to go deeper.
      depth++;
      if (simdjson_unlikely(depth >= MAX_DEPTH)) {
        append(simdjson::dom::array(iter));
        iter.json_index = iter.matching_brace_index() - 1; // Jump to the ]
        depth--;
        break;
      }

      // Output start [
      format.start_array();
      iter.json_index++;

      // Handle empty [] (we don't want to come back around and print commas)
      if (iter.tape_ref_type() == tape_type::END_ARRAY) {
        format.end_array();
        depth--;
        break;
      }

      is_object[depth] = false;
      after_value = false;
      format.print_newline();
      continue;
    }

    // Objects
    case tape_type::START_OBJECT: {
      // If we're too deep, we need to recurse to go deeper.
      depth++;
      if (simdjson_unlikely(depth >= MAX_DEPTH)) {
        append(simdjson::dom::object(iter));
        iter.json_index = iter.matching_brace_index() - 1; // Jump to the }
        depth--;
        break;
      }

      // Output start {
      format.start_object();
      iter.json_index++;

      // Handle empty {} (we don't want to come back around and print commas)
      if (iter.tape_ref_type() == tape_type::END_OBJECT) {
        format.end_object();
        depth--;
        break;
      }

      is_object[depth] = true;
      after_value = false;
      format.print_newline();
      continue;
    }

    // Scalars
    case tape_type::STRING:
      format.string(iter.get_string_view());
      break;
    case tape_type::INT64:
      format.number(iter.next_tape_value<int64_t>());
      iter.json_index++; // numbers take up 2 spots, so we need to increment
                         // extra
      break;
    case tape_type::UINT64:
      format.number(iter.next_tape_value<uint64_t>());
      iter.json_index++; // numbers take up 2 spots, so we need to increment
                         // extra
      break;
    case tape_type::DOUBLE:
      format.number(iter.next_tape_value<double>());
      iter.json_index++; // numbers take up 2 spots, so we need to increment
                         // extra
      break;
    case tape_type::TRUE_VALUE:
      format.true_atom();
      break;
    case tape_type::FALSE_VALUE:
      format.false_atom();
      break;
    case tape_type::NULL_VALUE:
      format.null_atom();
      break;

    // These are impossible
    case tape_type::END_ARRAY:
    case tape_type::END_OBJECT:
    case tape_type::ROOT:
      SIMDJSON_UNREACHABLE();
    }
    iter.json_index++;
    after_value = true;

    // Handle multiple ends in a row
    while (depth != 0 && (iter.tape_ref_type() == tape_type::END_ARRAY ||
                          iter.tape_ref_type() == tape_type::END_OBJECT)) {
      format.print_newline();
      depth--;
      format.print_indents(depth);
      if (iter.tape_ref_type() == tape_type::END_ARRAY) {
        format.end_array();
      } else {
        format.end_object();
      }
      iter.json_index++;
    }

    // Stop when we're at depth 0
  } while (depth != 0);

  format.print_newline();
}

template <class serializer>
inline void string_builder<serializer>::append(simdjson::dom::object value) {
  format.start_object();
  auto pair = value.begin();
  auto end = value.end();
  if (pair != end) {
    append(*pair);
    for (++pair; pair != end; ++pair) {
      format.comma();
      append(*pair);
    }
  }
  format.end_object();
}

template <class serializer>
inline void string_builder<serializer>::append(simdjson::dom::array value) {
  format.start_array();
  auto iter = value.begin();
  auto end = value.end();
  if (iter != end) {
    append(*iter);
    for (++iter; iter != end; ++iter) {
      format.comma();
      append(*iter);
    }
  }
  format.end_array();
}

template <class serializer>
simdjson_inline void
string_builder<serializer>::append(simdjson::dom::key_value_pair kv) {
  format.key(kv.key);
  append(kv.value);
}

template <class serializer>
simdjson_inline void string_builder<serializer>::clear() {
  format.clear();
}

template <class serializer>
simdjson_inline std::string_view string_builder<serializer>::str() const {
  return format.str();
}

} // namespace internal
} // namespace simdjson

#endif
/* end file simdjson/dom/serialization-inl.h */

#endif // SIMDJSON_DOM_H
/* end file simdjson/dom.h */
/* including simdjson/ondemand.h: #include "simdjson/ondemand.h" */
/* begin file simdjson/ondemand.h */
#ifndef SIMDJSON_ONDEMAND_H
#define SIMDJSON_ONDEMAND_H

/* including simdjson/builtin/ondemand.h: #include "simdjson/builtin/ondemand.h" */
/* begin file simdjson/builtin/ondemand.h */
#ifndef SIMDJSON_BUILTIN_ONDEMAND_H
#define SIMDJSON_BUILTIN_ONDEMAND_H

/* including simdjson/builtin.h: #include "simdjson/builtin.h" */
/* begin file simdjson/builtin.h */
#ifndef SIMDJSON_BUILTIN_H
#define SIMDJSON_BUILTIN_H

/* including simdjson/builtin/base.h: #include "simdjson/builtin/base.h" */
/* begin file simdjson/builtin/base.h */
#ifndef SIMDJSON_BUILTIN_BASE_H
#define SIMDJSON_BUILTIN_BASE_H

/* skipped duplicate #include "simdjson/base.h" */
/* including simdjson/implementation_detection.h: #include "simdjson/implementation_detection.h" */
/* begin file simdjson/implementation_detection.h */
#ifndef SIMDJSON_IMPLEMENTATION_DETECTION_H
#define SIMDJSON_IMPLEMENTATION_DETECTION_H

/* skipped duplicate #include "simdjson/base.h" */

// 0 is reserved, because undefined SIMDJSON_IMPLEMENTATION equals 0 in preprocessor macros.
#define SIMDJSON_IMPLEMENTATION_ID_arm64 1
#define SIMDJSON_IMPLEMENTATION_ID_fallback 2
#define SIMDJSON_IMPLEMENTATION_ID_haswell 3
#define SIMDJSON_IMPLEMENTATION_ID_icelake 4
#define SIMDJSON_IMPLEMENTATION_ID_ppc64 5
#define SIMDJSON_IMPLEMENTATION_ID_westmere 6
#define SIMDJSON_IMPLEMENTATION_ID_lsx 7
#define SIMDJSON_IMPLEMENTATION_ID_lasx 8

#define SIMDJSON_IMPLEMENTATION_ID_FOR(IMPL) SIMDJSON_CAT(SIMDJSON_IMPLEMENTATION_ID_, IMPL)
#define SIMDJSON_IMPLEMENTATION_ID SIMDJSON_IMPLEMENTATION_ID_FOR(SIMDJSON_IMPLEMENTATION)

#define SIMDJSON_IMPLEMENTATION_IS(IMPL) SIMDJSON_IMPLEMENTATION_ID == SIMDJSON_IMPLEMENTATION_ID_FOR(IMPL)

//
// First, figure out which implementations can be run. Doing it here makes it so we don't have to worry about the order
// in which we include them.
//

#ifndef SIMDJSON_IMPLEMENTATION_ARM64
#define SIMDJSON_IMPLEMENTATION_ARM64 (SIMDJSON_IS_ARM64)
#endif
#if SIMDJSON_IMPLEMENTATION_ARM64 && SIMDJSON_IS_ARM64
#define SIMDJSON_CAN_ALWAYS_RUN_ARM64 1
#else
#define SIMDJSON_CAN_ALWAYS_RUN_ARM64 0
#endif

// Default Icelake to on if this is x86-64. Even if we're not compiled for it, it could be selected
// at runtime.
#ifndef SIMDJSON_IMPLEMENTATION_ICELAKE
#define SIMDJSON_IMPLEMENTATION_ICELAKE ((SIMDJSON_IS_X86_64) && (SIMDJSON_AVX512_ALLOWED) && (SIMDJSON_COMPILER_SUPPORTS_VBMI2))
#endif

#ifdef _MSC_VER
// To see why  (__BMI__) && (__PCLMUL__) && (__LZCNT__) are not part of this next line, see
// https://github.com/simdjson/simdjson/issues/1247
#if ((SIMDJSON_IMPLEMENTATION_ICELAKE) && (__AVX2__) && (__AVX512F__) && (__AVX512DQ__) && (__AVX512CD__) && (__AVX512BW__) && (__AVX512VL__) && (__AVX512VBMI2__))
#define SIMDJSON_CAN_ALWAYS_RUN_ICELAKE 1
#else
#define SIMDJSON_CAN_ALWAYS_RUN_ICELAKE 0
#endif

#else

#if ((SIMDJSON_IMPLEMENTATION_ICELAKE) && (__AVX2__) && (__BMI__) && (__PCLMUL__) && (__LZCNT__) && (__AVX512F__) && (__AVX512DQ__) && (__AVX512CD__) && (__AVX512BW__) && (__AVX512VL__) && (__AVX512VBMI2__))
#define SIMDJSON_CAN_ALWAYS_RUN_ICELAKE 1
#else
#define SIMDJSON_CAN_ALWAYS_RUN_ICELAKE 0
#endif

#endif

// Default Haswell to on if this is x86-64. Even if we're not compiled for it, it could be selected
// at runtime.
#ifndef SIMDJSON_IMPLEMENTATION_HASWELL
#if SIMDJSON_CAN_ALWAYS_RUN_ICELAKE
// if icelake is always available, never enable haswell.
#define SIMDJSON_IMPLEMENTATION_HASWELL 0
#else
#define SIMDJSON_IMPLEMENTATION_HASWELL SIMDJSON_IS_X86_64
#endif
#endif
#ifdef _MSC_VER
// To see why  (__BMI__) && (__PCLMUL__) && (__LZCNT__) are not part of this next line, see
// https://github.com/simdjson/simdjson/issues/1247
#if ((SIMDJSON_IMPLEMENTATION_HASWELL) && (SIMDJSON_IS_X86_64) && (__AVX2__))
#define SIMDJSON_CAN_ALWAYS_RUN_HASWELL 1
#else
#define SIMDJSON_CAN_ALWAYS_RUN_HASWELL 0
#endif

#else

#if ((SIMDJSON_IMPLEMENTATION_HASWELL) && (SIMDJSON_IS_X86_64) && (__AVX2__) && (__BMI__) && (__PCLMUL__) && (__LZCNT__))
#define SIMDJSON_CAN_ALWAYS_RUN_HASWELL 1
#else
#define SIMDJSON_CAN_ALWAYS_RUN_HASWELL 0
#endif

#endif

// Default Westmere to on if this is x86-64.
#ifndef SIMDJSON_IMPLEMENTATION_WESTMERE
#if SIMDJSON_CAN_ALWAYS_RUN_ICELAKE || SIMDJSON_CAN_ALWAYS_RUN_HASWELL
// if icelake or haswell are always available, never enable westmere.
#define SIMDJSON_IMPLEMENTATION_WESTMERE 0
#else
#define SIMDJSON_IMPLEMENTATION_WESTMERE SIMDJSON_IS_X86_64
#endif
#endif

#if (SIMDJSON_IMPLEMENTATION_WESTMERE && SIMDJSON_IS_X86_64 && __SSE4_2__ && __PCLMUL__)
#define SIMDJSON_CAN_ALWAYS_RUN_WESTMERE 1
#else
#define SIMDJSON_CAN_ALWAYS_RUN_WESTMERE 0
#endif


#ifndef SIMDJSON_IMPLEMENTATION_PPC64
#define SIMDJSON_IMPLEMENTATION_PPC64 (SIMDJSON_IS_PPC64 && SIMDJSON_IS_PPC64_VMX)
#endif
#if SIMDJSON_IMPLEMENTATION_PPC64 && SIMDJSON_IS_PPC64 && SIMDJSON_IS_PPC64_VMX
#define SIMDJSON_CAN_ALWAYS_RUN_PPC64 1
#else
#define SIMDJSON_CAN_ALWAYS_RUN_PPC64 0
#endif

#ifndef SIMDJSON_IMPLEMENTATION_LASX
#define SIMDJSON_IMPLEMENTATION_LASX (SIMDJSON_IS_LOONGARCH64 && __loongarch_asx)
#endif
#define SIMDJSON_CAN_ALWAYS_RUN_LASX (SIMDJSON_IMPLEMENTATION_LASX)

#ifndef SIMDJSON_IMPLEMENTATION_LSX
#if SIMDJSON_CAN_ALWAYS_RUN_LASX
#define SIMDJSON_IMPLEMENTATION_LSX 0
#else
#define SIMDJSON_IMPLEMENTATION_LSX (SIMDJSON_IS_LOONGARCH64 && __loongarch_sx)
#endif
#endif
#define SIMDJSON_CAN_ALWAYS_RUN_LSX (SIMDJSON_IMPLEMENTATION_LSX)

// Default Fallback to on unless a builtin implementation has already been selected.
#ifndef SIMDJSON_IMPLEMENTATION_FALLBACK
#if SIMDJSON_CAN_ALWAYS_RUN_ARM64 || SIMDJSON_CAN_ALWAYS_RUN_ICELAKE || SIMDJSON_CAN_ALWAYS_RUN_HASWELL || SIMDJSON_CAN_ALWAYS_RUN_WESTMERE || SIMDJSON_CAN_ALWAYS_RUN_PPC64 || SIMDJSON_CAN_ALWAYS_RUN_LSX || SIMDJSON_CAN_ALWAYS_RUN_LASX
// if anything at all except fallback can always run, then disable fallback.
#define SIMDJSON_IMPLEMENTATION_FALLBACK 0
#else
#define SIMDJSON_IMPLEMENTATION_FALLBACK 1
#endif
#endif
#define SIMDJSON_CAN_ALWAYS_RUN_FALLBACK SIMDJSON_IMPLEMENTATION_FALLBACK

// Determine the best builtin implementation
#ifndef SIMDJSON_BUILTIN_IMPLEMENTATION

#if SIMDJSON_CAN_ALWAYS_RUN_ICELAKE
#define SIMDJSON_BUILTIN_IMPLEMENTATION icelake
#elif SIMDJSON_CAN_ALWAYS_RUN_HASWELL
#define SIMDJSON_BUILTIN_IMPLEMENTATION haswell
#elif SIMDJSON_CAN_ALWAYS_RUN_WESTMERE
#define SIMDJSON_BUILTIN_IMPLEMENTATION westmere
#elif SIMDJSON_CAN_ALWAYS_RUN_ARM64
#define SIMDJSON_BUILTIN_IMPLEMENTATION arm64
#elif SIMDJSON_CAN_ALWAYS_RUN_PPC64
#define SIMDJSON_BUILTIN_IMPLEMENTATION ppc64
#elif SIMDJSON_CAN_ALWAYS_RUN_LSX
#define SIMDJSON_BUILTIN_IMPLEMENTATION lsx
#elif SIMDJSON_CAN_ALWAYS_RUN_LASX
#define SIMDJSON_BUILTIN_IMPLEMENTATION lasx
#elif SIMDJSON_CAN_ALWAYS_RUN_FALLBACK
#define SIMDJSON_BUILTIN_IMPLEMENTATION fallback
#else
#error "All possible implementations (including fallback) have been disabled! simdjson will not run."
#endif

#endif // SIMDJSON_BUILTIN_IMPLEMENTATION

#define SIMDJSON_BUILTIN_IMPLEMENTATION_ID SIMDJSON_IMPLEMENTATION_ID_FOR(SIMDJSON_BUILTIN_IMPLEMENTATION)
#define SIMDJSON_BUILTIN_IMPLEMENTATION_IS(IMPL) SIMDJSON_BUILTIN_IMPLEMENTATION_ID == SIMDJSON_IMPLEMENTATION_ID_FOR(IMPL)

#endif // SIMDJSON_IMPLEMENTATION_DETECTION_H
/* end file simdjson/implementation_detection.h */

namespace simdjson {
#if SIMDJSON_BUILTIN_IMPLEMENTATION_IS(arm64)
  namespace arm64 {}
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(fallback)
  namespace fallback {}
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(haswell)
  namespace haswell {}
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(icelake)
  namespace icelake {}
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(ppc64)
  namespace ppc64 {}
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(westmere)
  namespace westmere {}
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(lsx)
  namespace lsx {}
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(lasx)
  namespace lasx {}
#else
#error Unknown SIMDJSON_BUILTIN_IMPLEMENTATION
#endif

  /**
   * Represents the best statically linked simdjson implementation that can be used by the compiling
   * program.
   *
   * Detects what options the program is compiled against, and picks the minimum implementation that
   * will work on any computer that can run the program. For example, if you compile with g++
   * -march=westmere, it will pick the westmere implementation. The haswell implementation will
   * still be available, and can be selected at runtime, but the builtin implementation (and any
   * code that uses it) will use westmere.
   */
  namespace builtin = SIMDJSON_BUILTIN_IMPLEMENTATION;
} // namespace simdjson

#endif // SIMDJSON_BUILTIN_BASE_H
/* end file simdjson/builtin/base.h */
/* including simdjson/builtin/implementation.h: #include "simdjson/builtin/implementation.h" */
/* begin file simdjson/builtin/implementation.h */
#ifndef SIMDJSON_BUILTIN_IMPLEMENTATION_H
#define SIMDJSON_BUILTIN_IMPLEMENTATION_H

/* skipped duplicate #include "simdjson/builtin/base.h" */

/* including simdjson/generic/dependencies.h: #include "simdjson/generic/dependencies.h" */
/* begin file simdjson/generic/dependencies.h */
#ifdef SIMDJSON_CONDITIONAL_INCLUDE
#error simdjson/generic/dependencies.h must be included before defining SIMDJSON_CONDITIONAL_INCLUDE!
#endif

#ifndef SIMDJSON_GENERIC_DEPENDENCIES_H
#define SIMDJSON_GENERIC_DEPENDENCIES_H

// Internal headers needed for generics.
// All includes referencing simdjson headers *not* under simdjson/generic must be here!
// Otherwise, amalgamation will fail.
/* skipped duplicate #include "simdjson/base.h" */
/* skipped duplicate #include "simdjson/implementation.h" */
/* skipped duplicate #include "simdjson/implementation_detection.h" */
/* including simdjson/internal/instruction_set.h: #include "simdjson/internal/instruction_set.h" */
/* begin file simdjson/internal/instruction_set.h */
/* From
https://github.com/endorno/pytorch/blob/master/torch/lib/TH/generic/simd/simd.h
Highly modified.

Copyright (c) 2016-     Facebook, Inc            (Adam Paszke)
Copyright (c) 2014-     Facebook, Inc            (Soumith Chintala)
Copyright (c) 2011-2014 Idiap Research Institute (Ronan Collobert)
Copyright (c) 2012-2014 Deepmind Technologies    (Koray Kavukcuoglu)
Copyright (c) 2011-2012 NEC Laboratories America (Koray Kavukcuoglu)
Copyright (c) 2011-2013 NYU                      (Clement Farabet)
Copyright (c) 2006-2010 NEC Laboratories America (Ronan Collobert, Leon Bottou,
Iain Melvin, Jason Weston) Copyright (c) 2006      Idiap Research Institute
(Samy Bengio) Copyright (c) 2001-2004 Idiap Research Institute (Ronan Collobert,
Samy Bengio, Johnny Mariethoz)

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

3. Neither the names of Facebook, Deepmind Technologies, NYU, NEC Laboratories
America and IDIAP Research Institute nor the names of its contributors may be
   used to endorse or promote products derived from this software without
   specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
*/

#ifndef SIMDJSON_INTERNAL_INSTRUCTION_SET_H
#define SIMDJSON_INTERNAL_INSTRUCTION_SET_H

namespace simdjson {
namespace internal {

enum instruction_set {
  DEFAULT = 0x0,
  NEON = 0x1,
  AVX2 = 0x4,
  SSE42 = 0x8,
  PCLMULQDQ = 0x10,
  BMI1 = 0x20,
  BMI2 = 0x40,
  ALTIVEC = 0x80,
  AVX512F = 0x100,
  AVX512DQ = 0x200,
  AVX512IFMA = 0x400,
  AVX512PF = 0x800,
  AVX512ER = 0x1000,
  AVX512CD = 0x2000,
  AVX512BW = 0x4000,
  AVX512VL = 0x8000,
  AVX512VBMI2 = 0x10000,
  LSX = 0x20000,
  LASX = 0x40000,
};

} // namespace internal
} // namespace simdjson

#endif // SIMDJSON_INTERNAL_INSTRUCTION_SET_H
/* end file simdjson/internal/instruction_set.h */
/* skipped duplicate #include "simdjson/internal/dom_parser_implementation.h" */
/* including simdjson/internal/jsoncharutils_tables.h: #include "simdjson/internal/jsoncharutils_tables.h" */
/* begin file simdjson/internal/jsoncharutils_tables.h */
#ifndef SIMDJSON_INTERNAL_JSONCHARUTILS_TABLES_H
#define SIMDJSON_INTERNAL_JSONCHARUTILS_TABLES_H

/* skipped duplicate #include "simdjson/base.h" */

#ifdef JSON_TEST_STRINGS
void found_string(const uint8_t *buf, const uint8_t *parsed_begin,
                  const uint8_t *parsed_end);
void found_bad_string(const uint8_t *buf);
#endif

namespace simdjson {
namespace internal {
// structural chars here are
// they are { 0x7b } 0x7d : 0x3a [ 0x5b ] 0x5d , 0x2c (and NULL)
// we are also interested in the four whitespace characters
// space 0x20, linefeed 0x0a, horizontal tab 0x09 and carriage return 0x0d

extern SIMDJSON_DLLIMPORTEXPORT const bool structural_or_whitespace_negated[256];
extern SIMDJSON_DLLIMPORTEXPORT const bool structural_or_whitespace[256];
extern SIMDJSON_DLLIMPORTEXPORT const uint32_t digit_to_val32[886];

} // namespace internal
} // namespace simdjson

#endif // SIMDJSON_INTERNAL_JSONCHARUTILS_TABLES_H
/* end file simdjson/internal/jsoncharutils_tables.h */
/* including simdjson/internal/numberparsing_tables.h: #include "simdjson/internal/numberparsing_tables.h" */
/* begin file simdjson/internal/numberparsing_tables.h */
#ifndef SIMDJSON_INTERNAL_NUMBERPARSING_TABLES_H
#define SIMDJSON_INTERNAL_NUMBERPARSING_TABLES_H

/* skipped duplicate #include "simdjson/base.h" */

namespace simdjson {
namespace internal {
/**
 * The smallest non-zero float (binary64) is 2^-1074.
 * We take as input numbers of the form w x 10^q where w < 2^64.
 * We have that w * 10^-343  <  2^(64-344) 5^-343 < 2^-1076.
 * However, we have that
 * (2^64-1) * 10^-342 =  (2^64-1) * 2^-342 * 5^-342 > 2^-1074.
 * Thus it is possible for a number of the form w * 10^-342 where
 * w is a 64-bit value to be a non-zero floating-point number.
 *********
 * Any number of form w * 10^309 where w>= 1 is going to be
 * infinite in binary64 so we never need to worry about powers
 * of 5 greater than 308.
 */
constexpr int smallest_power = -342;
constexpr int largest_power = 308;

/**
 * Represents a 128-bit value.
 * low: least significant 64 bits.
 * high: most significant 64 bits.
 */
struct value128 {
  uint64_t low;
  uint64_t high;
};


// Precomputed powers of ten from 10^0 to 10^22. These
// can be represented exactly using the double type.
extern SIMDJSON_DLLIMPORTEXPORT const double power_of_ten[];


/**
 * When mapping numbers from decimal to binary,
 * we go from w * 10^q to m * 2^p but we have
 * 10^q = 5^q * 2^q, so effectively
 * we are trying to match
 * w * 2^q * 5^q to m * 2^p. Thus the powers of two
 * are not a concern since they can be represented
 * exactly using the binary notation, only the powers of five
 * affect the binary significand.
 */


// The truncated powers of five from 5^-342 all the way to 5^308
// The mantissa is truncated to 128 bits, and
// never rounded up. Uses about 10KB.
// We use the template trick to allow inclusion in multiple translation units.
#if SIMDJSON_STATIC_REFLECTION
template <typename unused = void>  struct powers_template {
constexpr static uint64_t power_of_five_128[651*2]= {
        0xeef453d6923bd65a,0x113faa2906a13b3f,
        0x9558b4661b6565f8,0x4ac7ca59a424c507,
        0xbaaee17fa23ebf76,0x5d79bcf00d2df649,
        0xe95a99df8ace6f53,0xf4d82c2c107973dc,
        0x91d8a02bb6c10594,0x79071b9b8a4be869,
        0xb64ec836a47146f9,0x9748e2826cdee284,
        0xe3e27a444d8d98b7,0xfd1b1b2308169b25,
        0x8e6d8c6ab0787f72,0xfe30f0f5e50e20f7,
        0xb208ef855c969f4f,0xbdbd2d335e51a935,
        0xde8b2b66b3bc4723,0xad2c788035e61382,
        0x8b16fb203055ac76,0x4c3bcb5021afcc31,
        0xaddcb9e83c6b1793,0xdf4abe242a1bbf3d,
        0xd953e8624b85dd78,0xd71d6dad34a2af0d,
        0x87d4713d6f33aa6b,0x8672648c40e5ad68,
        0xa9c98d8ccb009506,0x680efdaf511f18c2,
        0xd43bf0effdc0ba48,0x212bd1b2566def2,
        0x84a57695fe98746d,0x14bb630f7604b57,
        0xa5ced43b7e3e9188,0x419ea3bd35385e2d,
        0xcf42894a5dce35ea,0x52064cac828675b9,
        0x818995ce7aa0e1b2,0x7343efebd1940993,
        0xa1ebfb4219491a1f,0x1014ebe6c5f90bf8,
        0xca66fa129f9b60a6,0xd41a26e077774ef6,
        0xfd00b897478238d0,0x8920b098955522b4,
        0x9e20735e8cb16382,0x55b46e5f5d5535b0,
        0xc5a890362fddbc62,0xeb2189f734aa831d,
        0xf712b443bbd52b7b,0xa5e9ec7501d523e4,
        0x9a6bb0aa55653b2d,0x47b233c92125366e,
        0xc1069cd4eabe89f8,0x999ec0bb696e840a,
        0xf148440a256e2c76,0xc00670ea43ca250d,
        0x96cd2a865764dbca,0x380406926a5e5728,
        0xbc807527ed3e12bc,0xc605083704f5ecf2,
        0xeba09271e88d976b,0xf7864a44c633682e,
        0x93445b8731587ea3,0x7ab3ee6afbe0211d,
        0xb8157268fdae9e4c,0x5960ea05bad82964,
        0xe61acf033d1a45df,0x6fb92487298e33bd,
        0x8fd0c16206306bab,0xa5d3b6d479f8e056,
        0xb3c4f1ba87bc8696,0x8f48a4899877186c,
        0xe0b62e2929aba83c,0x331acdabfe94de87,
        0x8c71dcd9ba0b4925,0x9ff0c08b7f1d0b14,
        0xaf8e5410288e1b6f,0x7ecf0ae5ee44dd9,
        0xdb71e91432b1a24a,0xc9e82cd9f69d6150,
        0x892731ac9faf056e,0xbe311c083a225cd2,
        0xab70fe17c79ac6ca,0x6dbd630a48aaf406,
        0xd64d3d9db981787d,0x92cbbccdad5b108,
        0x85f0468293f0eb4e,0x25bbf56008c58ea5,
        0xa76c582338ed2621,0xaf2af2b80af6f24e,
        0xd1476e2c07286faa,0x1af5af660db4aee1,
        0x82cca4db847945ca,0x50d98d9fc890ed4d,
        0xa37fce126597973c,0xe50ff107bab528a0,
        0xcc5fc196fefd7d0c,0x1e53ed49a96272c8,
        0xff77b1fcbebcdc4f,0x25e8e89c13bb0f7a,
        0x9faacf3df73609b1,0x77b191618c54e9ac,
        0xc795830d75038c1d,0xd59df5b9ef6a2417,
        0xf97ae3d0d2446f25,0x4b0573286b44ad1d,
        0x9becce62836ac577,0x4ee367f9430aec32,
        0xc2e801fb244576d5,0x229c41f793cda73f,
        0xf3a20279ed56d48a,0x6b43527578c1110f,
        0x9845418c345644d6,0x830a13896b78aaa9,
        0xbe5691ef416bd60c,0x23cc986bc656d553,
        0xedec366b11c6cb8f,0x2cbfbe86b7ec8aa8,
        0x94b3a202eb1c3f39,0x7bf7d71432f3d6a9,
        0xb9e08a83a5e34f07,0xdaf5ccd93fb0cc53,
        0xe858ad248f5c22c9,0xd1b3400f8f9cff68,
        0x91376c36d99995be,0x23100809b9c21fa1,
        0xb58547448ffffb2d,0xabd40a0c2832a78a,
        0xe2e69915b3fff9f9,0x16c90c8f323f516c,
        0x8dd01fad907ffc3b,0xae3da7d97f6792e3,
        0xb1442798f49ffb4a,0x99cd11cfdf41779c,
        0xdd95317f31c7fa1d,0x40405643d711d583,
        0x8a7d3eef7f1cfc52,0x482835ea666b2572,
        0xad1c8eab5ee43b66,0xda3243650005eecf,
        0xd863b256369d4a40,0x90bed43e40076a82,
        0x873e4f75e2224e68,0x5a7744a6e804a291,
        0xa90de3535aaae202,0x711515d0a205cb36,
        0xd3515c2831559a83,0xd5a5b44ca873e03,
        0x8412d9991ed58091,0xe858790afe9486c2,
        0xa5178fff668ae0b6,0x626e974dbe39a872,
        0xce5d73ff402d98e3,0xfb0a3d212dc8128f,
        0x80fa687f881c7f8e,0x7ce66634bc9d0b99,
        0xa139029f6a239f72,0x1c1fffc1ebc44e80,
        0xc987434744ac874e,0xa327ffb266b56220,
        0xfbe9141915d7a922,0x4bf1ff9f0062baa8,
        0x9d71ac8fada6c9b5,0x6f773fc3603db4a9,
        0xc4ce17b399107c22,0xcb550fb4384d21d3,
        0xf6019da07f549b2b,0x7e2a53a146606a48,
        0x99c102844f94e0fb,0x2eda7444cbfc426d,
        0xc0314325637a1939,0xfa911155fefb5308,
        0xf03d93eebc589f88,0x793555ab7eba27ca,
        0x96267c7535b763b5,0x4bc1558b2f3458de,
        0xbbb01b9283253ca2,0x9eb1aaedfb016f16,
        0xea9c227723ee8bcb,0x465e15a979c1cadc,
        0x92a1958a7675175f,0xbfacd89ec191ec9,
        0xb749faed14125d36,0xcef980ec671f667b,
        0xe51c79a85916f484,0x82b7e12780e7401a,
        0x8f31cc0937ae58d2,0xd1b2ecb8b0908810,
        0xb2fe3f0b8599ef07,0x861fa7e6dcb4aa15,
        0xdfbdcece67006ac9,0x67a791e093e1d49a,
        0x8bd6a141006042bd,0xe0c8bb2c5c6d24e0,
        0xaecc49914078536d,0x58fae9f773886e18,
        0xda7f5bf590966848,0xaf39a475506a899e,
        0x888f99797a5e012d,0x6d8406c952429603,
        0xaab37fd7d8f58178,0xc8e5087ba6d33b83,
        0xd5605fcdcf32e1d6,0xfb1e4a9a90880a64,
        0x855c3be0a17fcd26,0x5cf2eea09a55067f,
        0xa6b34ad8c9dfc06f,0xf42faa48c0ea481e,
        0xd0601d8efc57b08b,0xf13b94daf124da26,
        0x823c12795db6ce57,0x76c53d08d6b70858,
        0xa2cb1717b52481ed,0x54768c4b0c64ca6e,
        0xcb7ddcdda26da268,0xa9942f5dcf7dfd09,
        0xfe5d54150b090b02,0xd3f93b35435d7c4c,
        0x9efa548d26e5a6e1,0xc47bc5014a1a6daf,
        0xc6b8e9b0709f109a,0x359ab6419ca1091b,
        0xf867241c8cc6d4c0,0xc30163d203c94b62,
        0x9b407691d7fc44f8,0x79e0de63425dcf1d,
        0xc21094364dfb5636,0x985915fc12f542e4,
        0xf294b943e17a2bc4,0x3e6f5b7b17b2939d,
        0x979cf3ca6cec5b5a,0xa705992ceecf9c42,
        0xbd8430bd08277231,0x50c6ff782a838353,
        0xece53cec4a314ebd,0xa4f8bf5635246428,
        0x940f4613ae5ed136,0x871b7795e136be99,
        0xb913179899f68584,0x28e2557b59846e3f,
        0xe757dd7ec07426e5,0x331aeada2fe589cf,
        0x9096ea6f3848984f,0x3ff0d2c85def7621,
        0xb4bca50b065abe63,0xfed077a756b53a9,
        0xe1ebce4dc7f16dfb,0xd3e8495912c62894,
        0x8d3360f09cf6e4bd,0x64712dd7abbbd95c,
        0xb080392cc4349dec,0xbd8d794d96aacfb3,
        0xdca04777f541c567,0xecf0d7a0fc5583a0,
        0x89e42caaf9491b60,0xf41686c49db57244,
        0xac5d37d5b79b6239,0x311c2875c522ced5,
        0xd77485cb25823ac7,0x7d633293366b828b,
        0x86a8d39ef77164bc,0xae5dff9c02033197,
        0xa8530886b54dbdeb,0xd9f57f830283fdfc,
        0xd267caa862a12d66,0xd072df63c324fd7b,
        0x8380dea93da4bc60,0x4247cb9e59f71e6d,
        0xa46116538d0deb78,0x52d9be85f074e608,
        0xcd795be870516656,0x67902e276c921f8b,
        0x806bd9714632dff6,0xba1cd8a3db53b6,
        0xa086cfcd97bf97f3,0x80e8a40eccd228a4,
        0xc8a883c0fdaf7df0,0x6122cd128006b2cd,
        0xfad2a4b13d1b5d6c,0x796b805720085f81,
        0x9cc3a6eec6311a63,0xcbe3303674053bb0,
        0xc3f490aa77bd60fc,0xbedbfc4411068a9c,
        0xf4f1b4d515acb93b,0xee92fb5515482d44,
        0x991711052d8bf3c5,0x751bdd152d4d1c4a,
        0xbf5cd54678eef0b6,0xd262d45a78a0635d,
        0xef340a98172aace4,0x86fb897116c87c34,
        0x9580869f0e7aac0e,0xd45d35e6ae3d4da0,
        0xbae0a846d2195712,0x8974836059cca109,
        0xe998d258869facd7,0x2bd1a438703fc94b,
        0x91ff83775423cc06,0x7b6306a34627ddcf,
        0xb67f6455292cbf08,0x1a3bc84c17b1d542,
        0xe41f3d6a7377eeca,0x20caba5f1d9e4a93,
        0x8e938662882af53e,0x547eb47b7282ee9c,
        0xb23867fb2a35b28d,0xe99e619a4f23aa43,
        0xdec681f9f4c31f31,0x6405fa00e2ec94d4,
        0x8b3c113c38f9f37e,0xde83bc408dd3dd04,
        0xae0b158b4738705e,0x9624ab50b148d445,
        0xd98ddaee19068c76,0x3badd624dd9b0957,
        0x87f8a8d4cfa417c9,0xe54ca5d70a80e5d6,
        0xa9f6d30a038d1dbc,0x5e9fcf4ccd211f4c,
        0xd47487cc8470652b,0x7647c3200069671f,
        0x84c8d4dfd2c63f3b,0x29ecd9f40041e073,
        0xa5fb0a17c777cf09,0xf468107100525890,
        0xcf79cc9db955c2cc,0x7182148d4066eeb4,
        0x81ac1fe293d599bf,0xc6f14cd848405530,
        0xa21727db38cb002f,0xb8ada00e5a506a7c,
        0xca9cf1d206fdc03b,0xa6d90811f0e4851c,
        0xfd442e4688bd304a,0x908f4a166d1da663,
        0x9e4a9cec15763e2e,0x9a598e4e043287fe,
        0xc5dd44271ad3cdba,0x40eff1e1853f29fd,
        0xf7549530e188c128,0xd12bee59e68ef47c,
        0x9a94dd3e8cf578b9,0x82bb74f8301958ce,
        0xc13a148e3032d6e7,0xe36a52363c1faf01,
        0xf18899b1bc3f8ca1,0xdc44e6c3cb279ac1,
        0x96f5600f15a7b7e5,0x29ab103a5ef8c0b9,
        0xbcb2b812db11a5de,0x7415d448f6b6f0e7,
        0xebdf661791d60f56,0x111b495b3464ad21,
        0x936b9fcebb25c995,0xcab10dd900beec34,
        0xb84687c269ef3bfb,0x3d5d514f40eea742,
        0xe65829b3046b0afa,0xcb4a5a3112a5112,
        0x8ff71a0fe2c2e6dc,0x47f0e785eaba72ab,
        0xb3f4e093db73a093,0x59ed216765690f56,
        0xe0f218b8d25088b8,0x306869c13ec3532c,
        0x8c974f7383725573,0x1e414218c73a13fb,
        0xafbd2350644eeacf,0xe5d1929ef90898fa,
        0xdbac6c247d62a583,0xdf45f746b74abf39,
        0x894bc396ce5da772,0x6b8bba8c328eb783,
        0xab9eb47c81f5114f,0x66ea92f3f326564,
        0xd686619ba27255a2,0xc80a537b0efefebd,
        0x8613fd0145877585,0xbd06742ce95f5f36,
        0xa798fc4196e952e7,0x2c48113823b73704,
        0xd17f3b51fca3a7a0,0xf75a15862ca504c5,
        0x82ef85133de648c4,0x9a984d73dbe722fb,
        0xa3ab66580d5fdaf5,0xc13e60d0d2e0ebba,
        0xcc963fee10b7d1b3,0x318df905079926a8,
        0xffbbcfe994e5c61f,0xfdf17746497f7052,
        0x9fd561f1fd0f9bd3,0xfeb6ea8bedefa633,
        0xc7caba6e7c5382c8,0xfe64a52ee96b8fc0,
        0xf9bd690a1b68637b,0x3dfdce7aa3c673b0,
        0x9c1661a651213e2d,0x6bea10ca65c084e,
        0xc31bfa0fe5698db8,0x486e494fcff30a62,
        0xf3e2f893dec3f126,0x5a89dba3c3efccfa,
        0x986ddb5c6b3a76b7,0xf89629465a75e01c,
        0xbe89523386091465,0xf6bbb397f1135823,
        0xee2ba6c0678b597f,0x746aa07ded582e2c,
        0x94db483840b717ef,0xa8c2a44eb4571cdc,
        0xba121a4650e4ddeb,0x92f34d62616ce413,
        0xe896a0d7e51e1566,0x77b020baf9c81d17,
        0x915e2486ef32cd60,0xace1474dc1d122e,
        0xb5b5ada8aaff80b8,0xd819992132456ba,
        0xe3231912d5bf60e6,0x10e1fff697ed6c69,
        0x8df5efabc5979c8f,0xca8d3ffa1ef463c1,
        0xb1736b96b6fd83b3,0xbd308ff8a6b17cb2,
        0xddd0467c64bce4a0,0xac7cb3f6d05ddbde,
        0x8aa22c0dbef60ee4,0x6bcdf07a423aa96b,
        0xad4ab7112eb3929d,0x86c16c98d2c953c6,
        0xd89d64d57a607744,0xe871c7bf077ba8b7,
        0x87625f056c7c4a8b,0x11471cd764ad4972,
        0xa93af6c6c79b5d2d,0xd598e40d3dd89bcf,
        0xd389b47879823479,0x4aff1d108d4ec2c3,
        0x843610cb4bf160cb,0xcedf722a585139ba,
        0xa54394fe1eedb8fe,0xc2974eb4ee658828,
        0xce947a3da6a9273e,0x733d226229feea32,
        0x811ccc668829b887,0x806357d5a3f525f,
        0xa163ff802a3426a8,0xca07c2dcb0cf26f7,
        0xc9bcff6034c13052,0xfc89b393dd02f0b5,
        0xfc2c3f3841f17c67,0xbbac2078d443ace2,
        0x9d9ba7832936edc0,0xd54b944b84aa4c0d,
        0xc5029163f384a931,0xa9e795e65d4df11,
        0xf64335bcf065d37d,0x4d4617b5ff4a16d5,
        0x99ea0196163fa42e,0x504bced1bf8e4e45,
        0xc06481fb9bcf8d39,0xe45ec2862f71e1d6,
        0xf07da27a82c37088,0x5d767327bb4e5a4c,
        0x964e858c91ba2655,0x3a6a07f8d510f86f,
        0xbbe226efb628afea,0x890489f70a55368b,
        0xeadab0aba3b2dbe5,0x2b45ac74ccea842e,
        0x92c8ae6b464fc96f,0x3b0b8bc90012929d,
        0xb77ada0617e3bbcb,0x9ce6ebb40173744,
        0xe55990879ddcaabd,0xcc420a6a101d0515,
        0x8f57fa54c2a9eab6,0x9fa946824a12232d,
        0xb32df8e9f3546564,0x47939822dc96abf9,
        0xdff9772470297ebd,0x59787e2b93bc56f7,
        0x8bfbea76c619ef36,0x57eb4edb3c55b65a,
        0xaefae51477a06b03,0xede622920b6b23f1,
        0xdab99e59958885c4,0xe95fab368e45eced,
        0x88b402f7fd75539b,0x11dbcb0218ebb414,
        0xaae103b5fcd2a881,0xd652bdc29f26a119,
        0xd59944a37c0752a2,0x4be76d3346f0495f,
        0x857fcae62d8493a5,0x6f70a4400c562ddb,
        0xa6dfbd9fb8e5b88e,0xcb4ccd500f6bb952,
        0xd097ad07a71f26b2,0x7e2000a41346a7a7,
        0x825ecc24c873782f,0x8ed400668c0c28c8,
        0xa2f67f2dfa90563b,0x728900802f0f32fa,
        0xcbb41ef979346bca,0x4f2b40a03ad2ffb9,
        0xfea126b7d78186bc,0xe2f610c84987bfa8,
        0x9f24b832e6b0f436,0xdd9ca7d2df4d7c9,
        0xc6ede63fa05d3143,0x91503d1c79720dbb,
        0xf8a95fcf88747d94,0x75a44c6397ce912a,
        0x9b69dbe1b548ce7c,0xc986afbe3ee11aba,
        0xc24452da229b021b,0xfbe85badce996168,
        0xf2d56790ab41c2a2,0xfae27299423fb9c3,
        0x97c560ba6b0919a5,0xdccd879fc967d41a,
        0xbdb6b8e905cb600f,0x5400e987bbc1c920,
        0xed246723473e3813,0x290123e9aab23b68,
        0x9436c0760c86e30b,0xf9a0b6720aaf6521,
        0xb94470938fa89bce,0xf808e40e8d5b3e69,
        0xe7958cb87392c2c2,0xb60b1d1230b20e04,
        0x90bd77f3483bb9b9,0xb1c6f22b5e6f48c2,
        0xb4ecd5f01a4aa828,0x1e38aeb6360b1af3,
        0xe2280b6c20dd5232,0x25c6da63c38de1b0,
        0x8d590723948a535f,0x579c487e5a38ad0e,
        0xb0af48ec79ace837,0x2d835a9df0c6d851,
        0xdcdb1b2798182244,0xf8e431456cf88e65,
        0x8a08f0f8bf0f156b,0x1b8e9ecb641b58ff,
        0xac8b2d36eed2dac5,0xe272467e3d222f3f,
        0xd7adf884aa879177,0x5b0ed81dcc6abb0f,
        0x86ccbb52ea94baea,0x98e947129fc2b4e9,
        0xa87fea27a539e9a5,0x3f2398d747b36224,
        0xd29fe4b18e88640e,0x8eec7f0d19a03aad,
        0x83a3eeeef9153e89,0x1953cf68300424ac,
        0xa48ceaaab75a8e2b,0x5fa8c3423c052dd7,
        0xcdb02555653131b6,0x3792f412cb06794d,
        0x808e17555f3ebf11,0xe2bbd88bbee40bd0,
        0xa0b19d2ab70e6ed6,0x5b6aceaeae9d0ec4,
        0xc8de047564d20a8b,0xf245825a5a445275,
        0xfb158592be068d2e,0xeed6e2f0f0d56712,
        0x9ced737bb6c4183d,0x55464dd69685606b,
        0xc428d05aa4751e4c,0xaa97e14c3c26b886,
        0xf53304714d9265df,0xd53dd99f4b3066a8,
        0x993fe2c6d07b7fab,0xe546a8038efe4029,
        0xbf8fdb78849a5f96,0xde98520472bdd033,
        0xef73d256a5c0f77c,0x963e66858f6d4440,
        0x95a8637627989aad,0xdde7001379a44aa8,
        0xbb127c53b17ec159,0x5560c018580d5d52,
        0xe9d71b689dde71af,0xaab8f01e6e10b4a6,
        0x9226712162ab070d,0xcab3961304ca70e8,
        0xb6b00d69bb55c8d1,0x3d607b97c5fd0d22,
        0xe45c10c42a2b3b05,0x8cb89a7db77c506a,
        0x8eb98a7a9a5b04e3,0x77f3608e92adb242,
        0xb267ed1940f1c61c,0x55f038b237591ed3,
        0xdf01e85f912e37a3,0x6b6c46dec52f6688,
        0x8b61313bbabce2c6,0x2323ac4b3b3da015,
        0xae397d8aa96c1b77,0xabec975e0a0d081a,
        0xd9c7dced53c72255,0x96e7bd358c904a21,
        0x881cea14545c7575,0x7e50d64177da2e54,
        0xaa242499697392d2,0xdde50bd1d5d0b9e9,
        0xd4ad2dbfc3d07787,0x955e4ec64b44e864,
        0x84ec3c97da624ab4,0xbd5af13bef0b113e,
        0xa6274bbdd0fadd61,0xecb1ad8aeacdd58e,
        0xcfb11ead453994ba,0x67de18eda5814af2,
        0x81ceb32c4b43fcf4,0x80eacf948770ced7,
        0xa2425ff75e14fc31,0xa1258379a94d028d,
        0xcad2f7f5359a3b3e,0x96ee45813a04330,
        0xfd87b5f28300ca0d,0x8bca9d6e188853fc,
        0x9e74d1b791e07e48,0x775ea264cf55347e,
        0xc612062576589dda,0x95364afe032a81a0,
        0xf79687aed3eec551,0x3a83ddbd83f52210,
        0x9abe14cd44753b52,0xc4926a9672793580,
        0xc16d9a0095928a27,0x75b7053c0f178400,
        0xf1c90080baf72cb1,0x5324c68b12dd6800,
        0x971da05074da7bee,0xd3f6fc16ebca8000,
        0xbce5086492111aea,0x88f4bb1ca6bd0000,
        0xec1e4a7db69561a5,0x2b31e9e3d0700000,
        0x9392ee8e921d5d07,0x3aff322e62600000,
        0xb877aa3236a4b449,0x9befeb9fad487c3,
        0xe69594bec44de15b,0x4c2ebe687989a9b4,
        0x901d7cf73ab0acd9,0xf9d37014bf60a11,
        0xb424dc35095cd80f,0x538484c19ef38c95,
        0xe12e13424bb40e13,0x2865a5f206b06fba,
        0x8cbccc096f5088cb,0xf93f87b7442e45d4,
        0xafebff0bcb24aafe,0xf78f69a51539d749,
        0xdbe6fecebdedd5be,0xb573440e5a884d1c,
        0x89705f4136b4a597,0x31680a88f8953031,
        0xabcc77118461cefc,0xfdc20d2b36ba7c3e,
        0xd6bf94d5e57a42bc,0x3d32907604691b4d,
        0x8637bd05af6c69b5,0xa63f9a49c2c1b110,
        0xa7c5ac471b478423,0xfcf80dc33721d54,
        0xd1b71758e219652b,0xd3c36113404ea4a9,
        0x83126e978d4fdf3b,0x645a1cac083126ea,
        0xa3d70a3d70a3d70a,0x3d70a3d70a3d70a4,
        0xcccccccccccccccc,0xcccccccccccccccd,
        0x8000000000000000,0x0,
        0xa000000000000000,0x0,
        0xc800000000000000,0x0,
        0xfa00000000000000,0x0,
        0x9c40000000000000,0x0,
        0xc350000000000000,0x0,
        0xf424000000000000,0x0,
        0x9896800000000000,0x0,
        0xbebc200000000000,0x0,
        0xee6b280000000000,0x0,
        0x9502f90000000000,0x0,
        0xba43b74000000000,0x0,
        0xe8d4a51000000000,0x0,
        0x9184e72a00000000,0x0,
        0xb5e620f480000000,0x0,
        0xe35fa931a0000000,0x0,
        0x8e1bc9bf04000000,0x0,
        0xb1a2bc2ec5000000,0x0,
        0xde0b6b3a76400000,0x0,
        0x8ac7230489e80000,0x0,
        0xad78ebc5ac620000,0x0,
        0xd8d726b7177a8000,0x0,
        0x878678326eac9000,0x0,
        0xa968163f0a57b400,0x0,
        0xd3c21bcecceda100,0x0,
        0x84595161401484a0,0x0,
        0xa56fa5b99019a5c8,0x0,
        0xcecb8f27f4200f3a,0x0,
        0x813f3978f8940984,0x4000000000000000,
        0xa18f07d736b90be5,0x5000000000000000,
        0xc9f2c9cd04674ede,0xa400000000000000,
        0xfc6f7c4045812296,0x4d00000000000000,
        0x9dc5ada82b70b59d,0xf020000000000000,
        0xc5371912364ce305,0x6c28000000000000,
        0xf684df56c3e01bc6,0xc732000000000000,
        0x9a130b963a6c115c,0x3c7f400000000000,
        0xc097ce7bc90715b3,0x4b9f100000000000,
        0xf0bdc21abb48db20,0x1e86d40000000000,
        0x96769950b50d88f4,0x1314448000000000,
        0xbc143fa4e250eb31,0x17d955a000000000,
        0xeb194f8e1ae525fd,0x5dcfab0800000000,
        0x92efd1b8d0cf37be,0x5aa1cae500000000,
        0xb7abc627050305ad,0xf14a3d9e40000000,
        0xe596b7b0c643c719,0x6d9ccd05d0000000,
        0x8f7e32ce7bea5c6f,0xe4820023a2000000,
        0xb35dbf821ae4f38b,0xdda2802c8a800000,
        0xe0352f62a19e306e,0xd50b2037ad200000,
        0x8c213d9da502de45,0x4526f422cc340000,
        0xaf298d050e4395d6,0x9670b12b7f410000,
        0xdaf3f04651d47b4c,0x3c0cdd765f114000,
        0x88d8762bf324cd0f,0xa5880a69fb6ac800,
        0xab0e93b6efee0053,0x8eea0d047a457a00,
        0xd5d238a4abe98068,0x72a4904598d6d880,
        0x85a36366eb71f041,0x47a6da2b7f864750,
        0xa70c3c40a64e6c51,0x999090b65f67d924,
        0xd0cf4b50cfe20765,0xfff4b4e3f741cf6d,
        0x82818f1281ed449f,0xbff8f10e7a8921a4,
        0xa321f2d7226895c7,0xaff72d52192b6a0d,
        0xcbea6f8ceb02bb39,0x9bf4f8a69f764490,
        0xfee50b7025c36a08,0x2f236d04753d5b4,
        0x9f4f2726179a2245,0x1d762422c946590,
        0xc722f0ef9d80aad6,0x424d3ad2b7b97ef5,
        0xf8ebad2b84e0d58b,0xd2e0898765a7deb2,
        0x9b934c3b330c8577,0x63cc55f49f88eb2f,
        0xc2781f49ffcfa6d5,0x3cbf6b71c76b25fb,
        0xf316271c7fc3908a,0x8bef464e3945ef7a,
        0x97edd871cfda3a56,0x97758bf0e3cbb5ac,
        0xbde94e8e43d0c8ec,0x3d52eeed1cbea317,
        0xed63a231d4c4fb27,0x4ca7aaa863ee4bdd,
        0x945e455f24fb1cf8,0x8fe8caa93e74ef6a,
        0xb975d6b6ee39e436,0xb3e2fd538e122b44,
        0xe7d34c64a9c85d44,0x60dbbca87196b616,
        0x90e40fbeea1d3a4a,0xbc8955e946fe31cd,
        0xb51d13aea4a488dd,0x6babab6398bdbe41,
        0xe264589a4dcdab14,0xc696963c7eed2dd1,
        0x8d7eb76070a08aec,0xfc1e1de5cf543ca2,
        0xb0de65388cc8ada8,0x3b25a55f43294bcb,
        0xdd15fe86affad912,0x49ef0eb713f39ebe,
        0x8a2dbf142dfcc7ab,0x6e3569326c784337,
        0xacb92ed9397bf996,0x49c2c37f07965404,
        0xd7e77a8f87daf7fb,0xdc33745ec97be906,
        0x86f0ac99b4e8dafd,0x69a028bb3ded71a3,
        0xa8acd7c0222311bc,0xc40832ea0d68ce0c,
        0xd2d80db02aabd62b,0xf50a3fa490c30190,
        0x83c7088e1aab65db,0x792667c6da79e0fa,
        0xa4b8cab1a1563f52,0x577001b891185938,
        0xcde6fd5e09abcf26,0xed4c0226b55e6f86,
        0x80b05e5ac60b6178,0x544f8158315b05b4,
        0xa0dc75f1778e39d6,0x696361ae3db1c721,
        0xc913936dd571c84c,0x3bc3a19cd1e38e9,
        0xfb5878494ace3a5f,0x4ab48a04065c723,
        0x9d174b2dcec0e47b,0x62eb0d64283f9c76,
        0xc45d1df942711d9a,0x3ba5d0bd324f8394,
        0xf5746577930d6500,0xca8f44ec7ee36479,
        0x9968bf6abbe85f20,0x7e998b13cf4e1ecb,
        0xbfc2ef456ae276e8,0x9e3fedd8c321a67e,
        0xefb3ab16c59b14a2,0xc5cfe94ef3ea101e,
        0x95d04aee3b80ece5,0xbba1f1d158724a12,
        0xbb445da9ca61281f,0x2a8a6e45ae8edc97,
        0xea1575143cf97226,0xf52d09d71a3293bd,
        0x924d692ca61be758,0x593c2626705f9c56,
        0xb6e0c377cfa2e12e,0x6f8b2fb00c77836c,
        0xe498f455c38b997a,0xb6dfb9c0f956447,
        0x8edf98b59a373fec,0x4724bd4189bd5eac,
        0xb2977ee300c50fe7,0x58edec91ec2cb657,
        0xdf3d5e9bc0f653e1,0x2f2967b66737e3ed,
        0x8b865b215899f46c,0xbd79e0d20082ee74,
        0xae67f1e9aec07187,0xecd8590680a3aa11,
        0xda01ee641a708de9,0xe80e6f4820cc9495,
        0x884134fe908658b2,0x3109058d147fdcdd,
        0xaa51823e34a7eede,0xbd4b46f0599fd415,
        0xd4e5e2cdc1d1ea96,0x6c9e18ac7007c91a,
        0x850fadc09923329e,0x3e2cf6bc604ddb0,
        0xa6539930bf6bff45,0x84db8346b786151c,
        0xcfe87f7cef46ff16,0xe612641865679a63,
        0x81f14fae158c5f6e,0x4fcb7e8f3f60c07e,
        0xa26da3999aef7749,0xe3be5e330f38f09d,
        0xcb090c8001ab551c,0x5cadf5bfd3072cc5,
        0xfdcb4fa002162a63,0x73d9732fc7c8f7f6,
        0x9e9f11c4014dda7e,0x2867e7fddcdd9afa,
        0xc646d63501a1511d,0xb281e1fd541501b8,
        0xf7d88bc24209a565,0x1f225a7ca91a4226,
        0x9ae757596946075f,0x3375788de9b06958,
        0xc1a12d2fc3978937,0x52d6b1641c83ae,
        0xf209787bb47d6b84,0xc0678c5dbd23a49a,
        0x9745eb4d50ce6332,0xf840b7ba963646e0,
        0xbd176620a501fbff,0xb650e5a93bc3d898,
        0xec5d3fa8ce427aff,0xa3e51f138ab4cebe,
        0x93ba47c980e98cdf,0xc66f336c36b10137,
        0xb8a8d9bbe123f017,0xb80b0047445d4184,
        0xe6d3102ad96cec1d,0xa60dc059157491e5,
        0x9043ea1ac7e41392,0x87c89837ad68db2f,
        0xb454e4a179dd1877,0x29babe4598c311fb,
        0xe16a1dc9d8545e94,0xf4296dd6fef3d67a,
        0x8ce2529e2734bb1d,0x1899e4a65f58660c,
        0xb01ae745b101e9e4,0x5ec05dcff72e7f8f,
        0xdc21a1171d42645d,0x76707543f4fa1f73,
        0x899504ae72497eba,0x6a06494a791c53a8,
        0xabfa45da0edbde69,0x487db9d17636892,
        0xd6f8d7509292d603,0x45a9d2845d3c42b6,
        0x865b86925b9bc5c2,0xb8a2392ba45a9b2,
        0xa7f26836f282b732,0x8e6cac7768d7141e,
        0xd1ef0244af2364ff,0x3207d795430cd926,
        0x8335616aed761f1f,0x7f44e6bd49e807b8,
        0xa402b9c5a8d3a6e7,0x5f16206c9c6209a6,
        0xcd036837130890a1,0x36dba887c37a8c0f,
        0x802221226be55a64,0xc2494954da2c9789,
        0xa02aa96b06deb0fd,0xf2db9baa10b7bd6c,
        0xc83553c5c8965d3d,0x6f92829494e5acc7,
        0xfa42a8b73abbf48c,0xcb772339ba1f17f9,
        0x9c69a97284b578d7,0xff2a760414536efb,
        0xc38413cf25e2d70d,0xfef5138519684aba,
        0xf46518c2ef5b8cd1,0x7eb258665fc25d69,
        0x98bf2f79d5993802,0xef2f773ffbd97a61,
        0xbeeefb584aff8603,0xaafb550ffacfd8fa,
        0xeeaaba2e5dbf6784,0x95ba2a53f983cf38,
        0x952ab45cfa97a0b2,0xdd945a747bf26183,
        0xba756174393d88df,0x94f971119aeef9e4,
        0xe912b9d1478ceb17,0x7a37cd5601aab85d,
        0x91abb422ccb812ee,0xac62e055c10ab33a,
        0xb616a12b7fe617aa,0x577b986b314d6009,
        0xe39c49765fdf9d94,0xed5a7e85fda0b80b,
        0x8e41ade9fbebc27d,0x14588f13be847307,
        0xb1d219647ae6b31c,0x596eb2d8ae258fc8,
        0xde469fbd99a05fe3,0x6fca5f8ed9aef3bb,
        0x8aec23d680043bee,0x25de7bb9480d5854,
        0xada72ccc20054ae9,0xaf561aa79a10ae6a,
        0xd910f7ff28069da4,0x1b2ba1518094da04,
        0x87aa9aff79042286,0x90fb44d2f05d0842,
        0xa99541bf57452b28,0x353a1607ac744a53,
        0xd3fa922f2d1675f2,0x42889b8997915ce8,
        0x847c9b5d7c2e09b7,0x69956135febada11,
        0xa59bc234db398c25,0x43fab9837e699095,
        0xcf02b2c21207ef2e,0x94f967e45e03f4bb,
        0x8161afb94b44f57d,0x1d1be0eebac278f5,
        0xa1ba1ba79e1632dc,0x6462d92a69731732,
        0xca28a291859bbf93,0x7d7b8f7503cfdcfe,
        0xfcb2cb35e702af78,0x5cda735244c3d43e,
        0x9defbf01b061adab,0x3a0888136afa64a7,
        0xc56baec21c7a1916,0x88aaa1845b8fdd0,
        0xf6c69a72a3989f5b,0x8aad549e57273d45,
        0x9a3c2087a63f6399,0x36ac54e2f678864b,
        0xc0cb28a98fcf3c7f,0x84576a1bb416a7dd,
        0xf0fdf2d3f3c30b9f,0x656d44a2a11c51d5,
        0x969eb7c47859e743,0x9f644ae5a4b1b325,
        0xbc4665b596706114,0x873d5d9f0dde1fee,
        0xeb57ff22fc0c7959,0xa90cb506d155a7ea,
        0x9316ff75dd87cbd8,0x9a7f12442d588f2,
        0xb7dcbf5354e9bece,0xc11ed6d538aeb2f,
        0xe5d3ef282a242e81,0x8f1668c8a86da5fa,
        0x8fa475791a569d10,0xf96e017d694487bc,
        0xb38d92d760ec4455,0x37c981dcc395a9ac,
        0xe070f78d3927556a,0x85bbe253f47b1417,
        0x8c469ab843b89562,0x93956d7478ccec8e,
        0xaf58416654a6babb,0x387ac8d1970027b2,
        0xdb2e51bfe9d0696a,0x6997b05fcc0319e,
        0x88fcf317f22241e2,0x441fece3bdf81f03,
        0xab3c2fddeeaad25a,0xd527e81cad7626c3,
        0xd60b3bd56a5586f1,0x8a71e223d8d3b074,
        0x85c7056562757456,0xf6872d5667844e49,
        0xa738c6bebb12d16c,0xb428f8ac016561db,
        0xd106f86e69d785c7,0xe13336d701beba52,
        0x82a45b450226b39c,0xecc0024661173473,
        0xa34d721642b06084,0x27f002d7f95d0190,
        0xcc20ce9bd35c78a5,0x31ec038df7b441f4,
        0xff290242c83396ce,0x7e67047175a15271,
        0x9f79a169bd203e41,0xf0062c6e984d386,
        0xc75809c42c684dd1,0x52c07b78a3e60868,
        0xf92e0c3537826145,0xa7709a56ccdf8a82,
        0x9bbcc7a142b17ccb,0x88a66076400bb691,
        0xc2abf989935ddbfe,0x6acff893d00ea435,
        0xf356f7ebf83552fe,0x583f6b8c4124d43,
        0x98165af37b2153de,0xc3727a337a8b704a,
        0xbe1bf1b059e9a8d6,0x744f18c0592e4c5c,
        0xeda2ee1c7064130c,0x1162def06f79df73,
        0x9485d4d1c63e8be7,0x8addcb5645ac2ba8,
        0xb9a74a0637ce2ee1,0x6d953e2bd7173692,
        0xe8111c87c5c1ba99,0xc8fa8db6ccdd0437,
        0x910ab1d4db9914a0,0x1d9c9892400a22a2,
        0xb54d5e4a127f59c8,0x2503beb6d00cab4b,
        0xe2a0b5dc971f303a,0x2e44ae64840fd61d,
        0x8da471a9de737e24,0x5ceaecfed289e5d2,
        0xb10d8e1456105dad,0x7425a83e872c5f47,
        0xdd50f1996b947518,0xd12f124e28f77719,
        0x8a5296ffe33cc92f,0x82bd6b70d99aaa6f,
        0xace73cbfdc0bfb7b,0x636cc64d1001550b,
        0xd8210befd30efa5a,0x3c47f7e05401aa4e,
        0x8714a775e3e95c78,0x65acfaec34810a71,
        0xa8d9d1535ce3b396,0x7f1839a741a14d0d,
        0xd31045a8341ca07c,0x1ede48111209a050,
        0x83ea2b892091e44d,0x934aed0aab460432,
        0xa4e4b66b68b65d60,0xf81da84d5617853f,
        0xce1de40642e3f4b9,0x36251260ab9d668e,
        0x80d2ae83e9ce78f3,0xc1d72b7c6b426019,
        0xa1075a24e4421730,0xb24cf65b8612f81f,
        0xc94930ae1d529cfc,0xdee033f26797b627,
        0xfb9b7cd9a4a7443c,0x169840ef017da3b1,
        0x9d412e0806e88aa5,0x8e1f289560ee864e,
        0xc491798a08a2ad4e,0xf1a6f2bab92a27e2,
        0xf5b5d7ec8acb58a2,0xae10af696774b1db,
        0x9991a6f3d6bf1765,0xacca6da1e0a8ef29,
        0xbff610b0cc6edd3f,0x17fd090a58d32af3,
        0xeff394dcff8a948e,0xddfc4b4cef07f5b0,
        0x95f83d0a1fb69cd9,0x4abdaf101564f98e,
        0xbb764c4ca7a4440f,0x9d6d1ad41abe37f1,
        0xea53df5fd18d5513,0x84c86189216dc5ed,
        0x92746b9be2f8552c,0x32fd3cf5b4e49bb4,
        0xb7118682dbb66a77,0x3fbc8c33221dc2a1,
        0xe4d5e82392a40515,0xfabaf3feaa5334a,
        0x8f05b1163ba6832d,0x29cb4d87f2a7400e,
        0xb2c71d5bca9023f8,0x743e20e9ef511012,
        0xdf78e4b2bd342cf6,0x914da9246b255416,
        0x8bab8eefb6409c1a,0x1ad089b6c2f7548e,
        0xae9672aba3d0c320,0xa184ac2473b529b1,
        0xda3c0f568cc4f3e8,0xc9e5d72d90a2741e,
        0x8865899617fb1871,0x7e2fa67c7a658892,
        0xaa7eebfb9df9de8d,0xddbb901b98feeab7,
        0xd51ea6fa85785631,0x552a74227f3ea565,
        0x8533285c936b35de,0xd53a88958f87275f,
        0xa67ff273b8460356,0x8a892abaf368f137,
        0xd01fef10a657842c,0x2d2b7569b0432d85,
        0x8213f56a67f6b29b,0x9c3b29620e29fc73,
        0xa298f2c501f45f42,0x8349f3ba91b47b8f,
        0xcb3f2f7642717713,0x241c70a936219a73,
        0xfe0efb53d30dd4d7,0xed238cd383aa0110,
        0x9ec95d1463e8a506,0xf4363804324a40aa,
        0xc67bb4597ce2ce48,0xb143c6053edcd0d5,
        0xf81aa16fdc1b81da,0xdd94b7868e94050a,
        0x9b10a4e5e9913128,0xca7cf2b4191c8326,
        0xc1d4ce1f63f57d72,0xfd1c2f611f63a3f0,
        0xf24a01a73cf2dccf,0xbc633b39673c8cec,
        0x976e41088617ca01,0xd5be0503e085d813,
        0xbd49d14aa79dbc82,0x4b2d8644d8a74e18,
        0xec9c459d51852ba2,0xddf8e7d60ed1219e,
        0x93e1ab8252f33b45,0xcabb90e5c942b503,
        0xb8da1662e7b00a17,0x3d6a751f3b936243,
        0xe7109bfba19c0c9d,0xcc512670a783ad4,
        0x906a617d450187e2,0x27fb2b80668b24c5,
        0xb484f9dc9641e9da,0xb1f9f660802dedf6,
        0xe1a63853bbd26451,0x5e7873f8a0396973,
        0x8d07e33455637eb2,0xdb0b487b6423e1e8,
        0xb049dc016abc5e5f,0x91ce1a9a3d2cda62,
        0xdc5c5301c56b75f7,0x7641a140cc7810fb,
        0x89b9b3e11b6329ba,0xa9e904c87fcb0a9d,
        0xac2820d9623bf429,0x546345fa9fbdcd44,
        0xd732290fbacaf133,0xa97c177947ad4095,
        0x867f59a9d4bed6c0,0x49ed8eabcccc485d,
        0xa81f301449ee8c70,0x5c68f256bfff5a74,
        0xd226fc195c6a2f8c,0x73832eec6fff3111,
        0x83585d8fd9c25db7,0xc831fd53c5ff7eab,
        0xa42e74f3d032f525,0xba3e7ca8b77f5e55,
        0xcd3a1230c43fb26f,0x28ce1bd2e55f35eb,
        0x80444b5e7aa7cf85,0x7980d163cf5b81b3,
        0xa0555e361951c366,0xd7e105bcc332621f,
        0xc86ab5c39fa63440,0x8dd9472bf3fefaa7,
        0xfa856334878fc150,0xb14f98f6f0feb951,
        0x9c935e00d4b9d8d2,0x6ed1bf9a569f33d3,
        0xc3b8358109e84f07,0xa862f80ec4700c8,
        0xf4a642e14c6262c8,0xcd27bb612758c0fa,
        0x98e7e9cccfbd7dbd,0x8038d51cb897789c,
        0xbf21e44003acdd2c,0xe0470a63e6bd56c3,
        0xeeea5d5004981478,0x1858ccfce06cac74,
        0x95527a5202df0ccb,0xf37801e0c43ebc8,
        0xbaa718e68396cffd,0xd30560258f54e6ba,
        0xe950df20247c83fd,0x47c6b82ef32a2069,
        0x91d28b7416cdd27e,0x4cdc331d57fa5441,
        0xb6472e511c81471d,0xe0133fe4adf8e952,
        0xe3d8f9e563a198e5,0x58180fddd97723a6,
        0x8e679c2f5e44ff8f,0x570f09eaa7ea7648,};
};
#endif // SIMDJSON_STATIC_REFLECTION

extern SIMDJSON_DLLIMPORTEXPORT const uint64_t power_of_five_128[651*2];
} // namespace internal
} // namespace simdjson

#endif // SIMDJSON_INTERNAL_NUMBERPARSING_TABLES_H
/* end file simdjson/internal/numberparsing_tables.h */
/* including simdjson/internal/simdprune_tables.h: #include "simdjson/internal/simdprune_tables.h" */
/* begin file simdjson/internal/simdprune_tables.h */
#ifndef SIMDJSON_INTERNAL_SIMDPRUNE_TABLES_H
#define SIMDJSON_INTERNAL_SIMDPRUNE_TABLES_H

/* skipped duplicate #include "simdjson/base.h" */

#include <cstdint>

namespace simdjson { // table modified and copied from
namespace internal { // http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetTable

extern SIMDJSON_DLLIMPORTEXPORT const unsigned char BitsSetTable256mul2[256];

extern SIMDJSON_DLLIMPORTEXPORT const uint8_t pshufb_combine_table[272];

// 256 * 8 bytes = 2kB, easily fits in cache.
extern SIMDJSON_DLLIMPORTEXPORT const uint64_t thintable_epi8[256];

} // namespace internal
} // namespace simdjson

#endif // SIMDJSON_INTERNAL_SIMDPRUNE_TABLES_H
/* end file simdjson/internal/simdprune_tables.h */
#endif // SIMDJSON_GENERIC_DEPENDENCIES_H
/* end file simdjson/generic/dependencies.h */

/* defining SIMDJSON_CONDITIONAL_INCLUDE */
#define SIMDJSON_CONDITIONAL_INCLUDE

#if SIMDJSON_BUILTIN_IMPLEMENTATION_IS(arm64)
/* including simdjson/arm64/implementation.h: #include "simdjson/arm64/implementation.h" */
/* begin file simdjson/arm64/implementation.h */
#ifndef SIMDJSON_ARM64_IMPLEMENTATION_H
#define SIMDJSON_ARM64_IMPLEMENTATION_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/implementation.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/instruction_set.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
namespace arm64 {

/**
 * @private
 */
class implementation final : public simdjson::implementation {
public:
  simdjson_inline implementation() : simdjson::implementation("arm64", "ARM NEON", internal::instruction_set::NEON) {}
  simdjson_warn_unused error_code create_dom_parser_implementation(
    size_t capacity,
    size_t max_length,
    std::unique_ptr<internal::dom_parser_implementation>& dst
  ) const noexcept final;
  simdjson_warn_unused error_code minify(const uint8_t *buf, size_t len, uint8_t *dst, size_t &dst_len) const noexcept final;
  simdjson_warn_unused bool validate_utf8(const char *buf, size_t len) const noexcept final;
};

} // namespace arm64
} // namespace simdjson

#endif // SIMDJSON_ARM64_IMPLEMENTATION_H
/* end file simdjson/arm64/implementation.h */
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(fallback)
/* including simdjson/fallback/implementation.h: #include "simdjson/fallback/implementation.h" */
/* begin file simdjson/fallback/implementation.h */
#ifndef SIMDJSON_FALLBACK_IMPLEMENTATION_H
#define SIMDJSON_FALLBACK_IMPLEMENTATION_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/fallback/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/implementation.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
namespace fallback {

/**
 * @private
 */
class implementation final : public simdjson::implementation {
public:
  simdjson_inline implementation() : simdjson::implementation(
      "fallback",
      "Generic fallback implementation",
      0
  ) {}
  simdjson_warn_unused error_code create_dom_parser_implementation(
    size_t capacity,
    size_t max_length,
    std::unique_ptr<simdjson::internal::dom_parser_implementation>& dst
  ) const noexcept final;
  simdjson_warn_unused error_code minify(const uint8_t *buf, size_t len, uint8_t *dst, size_t &dst_len) const noexcept final;
  simdjson_warn_unused bool validate_utf8(const char *buf, size_t len) const noexcept final;
};

} // namespace fallback
} // namespace simdjson

#endif // SIMDJSON_FALLBACK_IMPLEMENTATION_H
/* end file simdjson/fallback/implementation.h */
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(haswell)
/* including simdjson/haswell/implementation.h: #include "simdjson/haswell/implementation.h" */
/* begin file simdjson/haswell/implementation.h */
#ifndef SIMDJSON_HASWELL_IMPLEMENTATION_H
#define SIMDJSON_HASWELL_IMPLEMENTATION_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/haswell/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/implementation.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/instruction_set.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

// The constructor may be executed on any host, so we take care not to use SIMDJSON_TARGET_HASWELL
namespace simdjson {
namespace haswell {

/**
 * @private
 */
class implementation final : public simdjson::implementation {
public:
  simdjson_inline implementation() : simdjson::implementation(
      "haswell",
      "Intel/AMD AVX2",
      internal::instruction_set::AVX2 | internal::instruction_set::PCLMULQDQ | internal::instruction_set::BMI1 | internal::instruction_set::BMI2
  ) {}
  simdjson_warn_unused error_code create_dom_parser_implementation(
    size_t capacity,
    size_t max_length,
    std::unique_ptr<internal::dom_parser_implementation>& dst
  ) const noexcept final;
  simdjson_warn_unused error_code minify(const uint8_t *buf, size_t len, uint8_t *dst, size_t &dst_len) const noexcept final;
  simdjson_warn_unused bool validate_utf8(const char *buf, size_t len) const noexcept final;
};

} // namespace haswell
} // namespace simdjson

#endif // SIMDJSON_HASWELL_IMPLEMENTATION_H
/* end file simdjson/haswell/implementation.h */
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(icelake)
/* including simdjson/icelake/implementation.h: #include "simdjson/icelake/implementation.h" */
/* begin file simdjson/icelake/implementation.h */
#ifndef SIMDJSON_ICELAKE_IMPLEMENTATION_H
#define SIMDJSON_ICELAKE_IMPLEMENTATION_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/icelake/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/implementation.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/instruction_set.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

// The constructor may be executed on any host, so we take care not to use SIMDJSON_TARGET_ICELAKE
namespace simdjson {
namespace icelake {

/**
 * @private
 */
class implementation final : public simdjson::implementation {
public:
  simdjson_inline implementation() : simdjson::implementation(
      "icelake",
      "Intel/AMD AVX512",
      internal::instruction_set::AVX2 | internal::instruction_set::PCLMULQDQ | internal::instruction_set::BMI1 | internal::instruction_set::BMI2 | internal::instruction_set::AVX512F | internal::instruction_set::AVX512DQ | internal::instruction_set::AVX512CD | internal::instruction_set::AVX512BW | internal::instruction_set::AVX512VL | internal::instruction_set::AVX512VBMI2
  ) {}
  simdjson_warn_unused error_code create_dom_parser_implementation(
    size_t capacity,
    size_t max_length,
    std::unique_ptr<internal::dom_parser_implementation>& dst
  ) const noexcept final;
  simdjson_warn_unused error_code minify(const uint8_t *buf, size_t len, uint8_t *dst, size_t &dst_len) const noexcept final;
  simdjson_warn_unused bool validate_utf8(const char *buf, size_t len) const noexcept final;
};

} // namespace icelake
} // namespace simdjson

#endif // SIMDJSON_ICELAKE_IMPLEMENTATION_H
/* end file simdjson/icelake/implementation.h */
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(ppc64)
/* including simdjson/ppc64/implementation.h: #include "simdjson/ppc64/implementation.h" */
/* begin file simdjson/ppc64/implementation.h */
#ifndef SIMDJSON_PPC64_IMPLEMENTATION_H
#define SIMDJSON_PPC64_IMPLEMENTATION_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/ppc64/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/implementation.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/instruction_set.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {

/**
 * Implementation for ALTIVEC (PPC64).
 */
namespace ppc64 {

/**
 * @private
 */
class implementation final : public simdjson::implementation {
public:
  simdjson_inline implementation()
      : simdjson::implementation("ppc64", "PPC64 ALTIVEC",
                                 internal::instruction_set::ALTIVEC) {}

  simdjson_warn_unused error_code create_dom_parser_implementation(
      size_t capacity, size_t max_length,
      std::unique_ptr<internal::dom_parser_implementation> &dst)
      const noexcept final;
  simdjson_warn_unused error_code minify(const uint8_t *buf, size_t len,
                                         uint8_t *dst,
                                         size_t &dst_len) const noexcept final;
  simdjson_warn_unused bool validate_utf8(const char *buf,
                                          size_t len) const noexcept final;
};

} // namespace ppc64
} // namespace simdjson

#endif // SIMDJSON_PPC64_IMPLEMENTATION_H
/* end file simdjson/ppc64/implementation.h */
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(westmere)
/* including simdjson/westmere/implementation.h: #include "simdjson/westmere/implementation.h" */
/* begin file simdjson/westmere/implementation.h */
#ifndef SIMDJSON_WESTMERE_IMPLEMENTATION_H
#define SIMDJSON_WESTMERE_IMPLEMENTATION_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/westmere/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/implementation.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/instruction_set.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

// The constructor may be executed on any host, so we take care not to use SIMDJSON_TARGET_WESTMERE
namespace simdjson {
namespace westmere {

/**
 * @private
 */
class implementation final : public simdjson::implementation {
public:
  simdjson_inline implementation() : simdjson::implementation("westmere", "Intel/AMD SSE4.2", internal::instruction_set::SSE42 | internal::instruction_set::PCLMULQDQ) {}
  simdjson_warn_unused error_code create_dom_parser_implementation(
    size_t capacity,
    size_t max_length,
    std::unique_ptr<internal::dom_parser_implementation>& dst
  ) const noexcept final;
  simdjson_warn_unused error_code minify(const uint8_t *buf, size_t len, uint8_t *dst, size_t &dst_len) const noexcept final;
  simdjson_warn_unused bool validate_utf8(const char *buf, size_t len) const noexcept final;
};

} // namespace westmere
} // namespace simdjson

#endif // SIMDJSON_WESTMERE_IMPLEMENTATION_H
/* end file simdjson/westmere/implementation.h */
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(lsx)
/* including simdjson/lsx/implementation.h: #include "simdjson/lsx/implementation.h" */
/* begin file simdjson/lsx/implementation.h */
#ifndef SIMDJSON_LSX_IMPLEMENTATION_H
#define SIMDJSON_LSX_IMPLEMENTATION_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/implementation.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/instruction_set.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
namespace lsx {

/**
 * @private
 */
class implementation final : public simdjson::implementation {
public:
  simdjson_inline implementation() : simdjson::implementation("lsx", "LoongArch SX", internal::instruction_set::LSX) {}
  simdjson_warn_unused error_code create_dom_parser_implementation(
    size_t capacity,
    size_t max_length,
    std::unique_ptr<internal::dom_parser_implementation>& dst
  ) const noexcept final;
  simdjson_warn_unused error_code minify(const uint8_t *buf, size_t len, uint8_t *dst, size_t &dst_len) const noexcept final;
  simdjson_warn_unused bool validate_utf8(const char *buf, size_t len) const noexcept final;
};

} // namespace lsx
} // namespace simdjson

#endif // SIMDJSON_LSX_IMPLEMENTATION_H
/* end file simdjson/lsx/implementation.h */
#elif SIMDJSON_BUILTIN_IMPLEMENTATION_IS(lasx)
/* including simdjson/lasx/implementation.h: #include "simdjson/lasx/implementation.h" */
/* begin file simdjson/lasx/implementation.h */
#ifndef SIMDJSON_LASX_IMPLEMENTATION_H
#define SIMDJSON_LASX_IMPLEMENTATION_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/implementation.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/instruction_set.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
namespace lasx {

/**
 * @private
 */
class implementation final : public simdjson::implementation {
public:
  simdjson_inline implementation() : simdjson::implementation("lasx", "LoongArch ASX", internal::instruction_set::LASX) {}
  simdjson_warn_unused error_code create_dom_parser_implementation(
    size_t capacity,
    size_t max_length,
    std::unique_ptr<internal::dom_parser_implementation>& dst
  ) const noexcept final;
  simdjson_warn_unused error_code minify(const uint8_t *buf, size_t len, uint8_t *dst, size_t &dst_len) const noexcept final;
  simdjson_warn_unused bool validate_utf8(const char *buf, size_t len) const noexcept final;
};

} // namespace lasx
} // namespace simdjson

#endif // SIMDJSON_LASX_IMPLEMENTATION_H
/* end file simdjson/lasx/implementation.h */
#else
#error Unknown SIMDJSON_BUILTIN_IMPLEMENTATION
#endif

/* undefining SIMDJSON_CONDITIONAL_INCLUDE */
#undef SIMDJSON_CONDITIONAL_INCLUDE

namespace simdjson {
  /**
   * Function which returns a pointer to an implementation matching the "builtin" implementation.
   * The builtin implementation is the best statically linked simdjson implementation that can be used by the compiling
   * program. If you compile with g++ -march=haswell, this will return the haswell implementation.
   * It is handy to be able to check what builtin was used: builtin_implementation()->name().
   */
  const implementation * builtin_implementation();
} // namespace simdjson

#endif // SIMDJSON_BUILTIN_IMPLEMENTATION_H
/* end file simdjson/builtin/implementation.h */

/* skipped duplicate #include "simdjson/generic/dependencies.h" */

/* defining SIMDJSON_CONDITIONAL_INCLUDE */
#define SIMDJSON_CONDITIONAL_INCLUDE

#if SIMDJSON_BUILTIN_IMPLEMENTATION_IS(arm64)
/* including simdjson/arm64.h: #include "simdjson/arm64.h" */
/* begin file simdjson/arm64.h */
#ifndef SIMDJSON_ARM64_H
#define SIMDJSON_ARM64_H

/* including simdjson/arm64/begin.h: #include "simdjson/arm64/begin.h" */
/* begin file simdjson/arm64/begin.h */
/* defining SIMDJSON_IMPLEMENTATION to "arm64" */
#define SIMDJSON_IMPLEMENTATION arm64
/* including simdjson/arm64/base.h: #include "simdjson/arm64/base.h" */
/* begin file simdjson/arm64/base.h */
#ifndef SIMDJSON_ARM64_BASE_H
#define SIMDJSON_ARM64_BASE_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/base.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
/**
 * Implementation for NEON (ARMv8).
 */
namespace arm64 {

class implementation;

namespace {
namespace simd {
template <typename T> struct simd8;
template <typename T> struct simd8x64;
} // namespace simd
} // unnamed namespace

} // namespace arm64
} // namespace simdjson

#endif // SIMDJSON_ARM64_BASE_H
/* end file simdjson/arm64/base.h */
/* including simdjson/arm64/intrinsics.h: #include "simdjson/arm64/intrinsics.h" */
/* begin file simdjson/arm64/intrinsics.h */
#ifndef SIMDJSON_ARM64_INTRINSICS_H
#define SIMDJSON_ARM64_INTRINSICS_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/arm64/base.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

// This should be the correct header whether
// you use visual studio or other compilers.
#include <arm_neon.h>

static_assert(sizeof(uint8x16_t) <= simdjson::SIMDJSON_PADDING, "insufficient padding for arm64");

#endif //  SIMDJSON_ARM64_INTRINSICS_H
/* end file simdjson/arm64/intrinsics.h */
/* including simdjson/arm64/bitmanipulation.h: #include "simdjson/arm64/bitmanipulation.h" */
/* begin file simdjson/arm64/bitmanipulation.h */
#ifndef SIMDJSON_ARM64_BITMANIPULATION_H
#define SIMDJSON_ARM64_BITMANIPULATION_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/arm64/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/arm64/intrinsics.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
namespace arm64 {
namespace {

// We sometimes call trailing_zero on inputs that are zero,
// but the algorithms do not end up using the returned value.
// Sadly, sanitizers are not smart enough to figure it out.
SIMDJSON_NO_SANITIZE_UNDEFINED
// This function can be used safely even if not all bytes have been
// initialized.
// See issue https://github.com/simdjson/simdjson/issues/1965
SIMDJSON_NO_SANITIZE_MEMORY
simdjson_inline int trailing_zeroes(uint64_t input_num) {
#if SIMDJSON_REGULAR_VISUAL_STUDIO
  unsigned long ret;
  // Search the mask data from least significant bit (LSB)
  // to the most significant bit (MSB) for a set bit (1).
  _BitScanForward64(&ret, input_num);
  return (int)ret;
#else // SIMDJSON_REGULAR_VISUAL_STUDIO
  return __builtin_ctzll(input_num);
#endif // SIMDJSON_REGULAR_VISUAL_STUDIO
}

/* result might be undefined when input_num is zero */
simdjson_inline uint64_t clear_lowest_bit(uint64_t input_num) {
  return input_num & (input_num-1);
}

// We sometimes call leading_zeroes on inputs that are zero,
// but the algorithms do not end up using the returned value.
// Sadly, sanitizers are not smart enough to figure it out.
// Applies only when SIMDJSON_PREFER_REVERSE_BITS is defined and true.
// (See below.)
SIMDJSON_NO_SANITIZE_UNDEFINED
/* result might be undefined when input_num is zero */
simdjson_inline int leading_zeroes(uint64_t input_num) {
#if SIMDJSON_REGULAR_VISUAL_STUDIO
  unsigned long leading_zero = 0;
  // Search the mask data from most significant bit (MSB)
  // to least significant bit (LSB) for a set bit (1).
  if (_BitScanReverse64(&leading_zero, input_num))
    return (int)(63 - leading_zero);
  else
    return 64;
#else
  return __builtin_clzll(input_num);
#endif// SIMDJSON_REGULAR_VISUAL_STUDIO
}

/* result might be undefined when input_num is zero */
simdjson_inline int count_ones(uint64_t input_num) {
   return vaddv_u8(vcnt_u8(vcreate_u8(input_num)));
}


#if defined(__GNUC__) // catches clang and gcc
/**
 * ARM has a fast 64-bit "bit reversal function" that is handy. However,
 * it is not generally available as an intrinsic function under Visual
 * Studio (though this might be changing). Even under clang/gcc, we
 * apparently need to invoke inline assembly.
 */
/*
 * We use SIMDJSON_PREFER_REVERSE_BITS as a hint that algorithms that
 * work well with bit reversal may use it.
 */
#define SIMDJSON_PREFER_REVERSE_BITS 1

/* reverse the bits */
simdjson_inline uint64_t reverse_bits(uint64_t input_num) {
  uint64_t rev_bits;
  __asm("rbit %0, %1" : "=r"(rev_bits) : "r"(input_num));
  return rev_bits;
}

/**
 * Flips bit at index 63 - lz. Thus if you have 'leading_zeroes' leading zeroes,
 * then this will set to zero the leading bit. It is possible for leading_zeroes to be
 * greating or equal to 63 in which case we trigger undefined behavior, but the output
 * of such undefined behavior is never used.
 **/
SIMDJSON_NO_SANITIZE_UNDEFINED
simdjson_inline uint64_t zero_leading_bit(uint64_t rev_bits, int leading_zeroes) {
  return rev_bits ^ (uint64_t(0x8000000000000000) >> leading_zeroes);
}

#endif

simdjson_inline bool add_overflow(uint64_t value1, uint64_t value2, uint64_t *result) {
#if SIMDJSON_REGULAR_VISUAL_STUDIO
  *result = value1 + value2;
  return *result < value1;
#else
  return __builtin_uaddll_overflow(value1, value2,
                                   reinterpret_cast<unsigned long long *>(result));
#endif
}

} // unnamed namespace
} // namespace arm64
} // namespace simdjson

#endif // SIMDJSON_ARM64_BITMANIPULATION_H
/* end file simdjson/arm64/bitmanipulation.h */
/* including simdjson/arm64/bitmask.h: #include "simdjson/arm64/bitmask.h" */
/* begin file simdjson/arm64/bitmask.h */
#ifndef SIMDJSON_ARM64_BITMASK_H
#define SIMDJSON_ARM64_BITMASK_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/arm64/base.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
namespace arm64 {
namespace {

//
// Perform a "cumulative bitwise xor," flipping bits each time a 1 is encountered.
//
// For example, prefix_xor(00100100) == 00011100
//
simdjson_inline uint64_t prefix_xor(uint64_t bitmask) {
  /////////////
  // We could do this with PMULL, but it is apparently slow.
  //
  //#ifdef __ARM_FEATURE_CRYPTO // some ARM processors lack this extension
  //return vmull_p64(-1ULL, bitmask);
  //#else
  // Analysis by @sebpop:
  // When diffing the assembly for src/stage1_find_marks.cpp I see that the eors are all spread out
  // in between other vector code, so effectively the extra cycles of the sequence do not matter
  // because the GPR units are idle otherwise and the critical path is on the FP side.
  // Also the PMULL requires two extra fmovs: GPR->FP (3 cycles in N1, 5 cycles in A72 )
  // and FP->GPR (2 cycles on N1 and 5 cycles on A72.)
  ///////////
  bitmask ^= bitmask << 1;
  bitmask ^= bitmask << 2;
  bitmask ^= bitmask << 4;
  bitmask ^= bitmask << 8;
  bitmask ^= bitmask << 16;
  bitmask ^= bitmask << 32;
  return bitmask;
}

} // unnamed namespace
} // namespace arm64
} // namespace simdjson

#endif
/* end file simdjson/arm64/bitmask.h */
/* including simdjson/arm64/numberparsing_defs.h: #include "simdjson/arm64/numberparsing_defs.h" */
/* begin file simdjson/arm64/numberparsing_defs.h */
#ifndef SIMDJSON_ARM64_NUMBERPARSING_DEFS_H
#define SIMDJSON_ARM64_NUMBERPARSING_DEFS_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/arm64/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/arm64/intrinsics.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/numberparsing_tables.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

#include <cstring>

#if SIMDJSON_REGULAR_VISUAL_STUDIO && SIMDJSON_IS_ARM64
// __umulh requires intrin.h
#include <intrin.h>
#endif // SIMDJSON_REGULAR_VISUAL_STUDIO && SIMDJSON_IS_ARM64

namespace simdjson {
namespace arm64 {
namespace numberparsing {

// we don't have SSE, so let us use a scalar function
// credit: https://johnnylee-sde.github.io/Fast-numeric-string-to-int/
/** @private */
static simdjson_inline uint32_t parse_eight_digits_unrolled(const uint8_t *chars) {
  uint64_t val;
  std::memcpy(&val, chars, sizeof(uint64_t));
  val = (val & 0x0F0F0F0F0F0F0F0F) * 2561 >> 8;
  val = (val & 0x00FF00FF00FF00FF) * 6553601 >> 16;
  return uint32_t((val & 0x0000FFFF0000FFFF) * 42949672960001 >> 32);
}

simdjson_inline internal::value128 full_multiplication(uint64_t value1, uint64_t value2) {
  internal::value128 answer;
#if SIMDJSON_REGULAR_VISUAL_STUDIO || SIMDJSON_IS_32BITS
#if SIMDJSON_IS_ARM64
  // ARM64 has native support for 64-bit multiplications, no need to emultate
  answer.high = __umulh(value1, value2);
  answer.low = value1 * value2;
#else
  answer.low = _umul128(value1, value2, &answer.high); // _umul128 not available on ARM64
#endif // SIMDJSON_IS_ARM64
#else // SIMDJSON_REGULAR_VISUAL_STUDIO || SIMDJSON_IS_32BITS
  __uint128_t r = (static_cast<__uint128_t>(value1)) * value2;
  answer.low = uint64_t(r);
  answer.high = uint64_t(r >> 64);
#endif
  return answer;
}

} // namespace numberparsing
} // namespace arm64
} // namespace simdjson

#ifndef SIMDJSON_SWAR_NUMBER_PARSING
#if SIMDJSON_IS_BIG_ENDIAN
#define SIMDJSON_SWAR_NUMBER_PARSING 0
#else
#define SIMDJSON_SWAR_NUMBER_PARSING 1
#endif
#endif

#endif // SIMDJSON_ARM64_NUMBERPARSING_DEFS_H
/* end file simdjson/arm64/numberparsing_defs.h */
/* including simdjson/arm64/simd.h: #include "simdjson/arm64/simd.h" */
/* begin file simdjson/arm64/simd.h */
#ifndef SIMDJSON_ARM64_SIMD_H
#define SIMDJSON_ARM64_SIMD_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/arm64/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/arm64/bitmanipulation.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/simdprune_tables.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
namespace arm64 {
namespace {
namespace simd {

#if SIMDJSON_REGULAR_VISUAL_STUDIO
namespace {
// Start of private section with Visual Studio workaround


#ifndef simdjson_make_uint8x16_t
#define simdjson_make_uint8x16_t(x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, \
                             x13, x14, x15, x16)                                   \
   ([=]() {                                                                        \
     uint8_t array[16] = {x1, x2,  x3,  x4,  x5,  x6,  x7,  x8,                    \
                                 x9, x10, x11, x12, x13, x14, x15, x16};           \
     return vld1q_u8(array);                                                       \
   }())
#endif
#ifndef simdjson_make_int8x16_t
#define simdjson_make_int8x16_t(x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, \
                             x13, x14, x15, x16)                                  \
   ([=]() {                                                                       \
     int8_t array[16] = {x1, x2,  x3,  x4,  x5,  x6,  x7,  x8,                    \
                                 x9, x10, x11, x12, x13, x14, x15, x16};          \
     return vld1q_s8(array);                                                      \
   }())
#endif

#ifndef simdjson_make_uint8x8_t
#define simdjson_make_uint8x8_t(x1, x2, x3, x4, x5, x6, x7, x8)                \
   ([=]() {                                                                    \
     uint8_t array[8] = {x1, x2,  x3,  x4,  x5,  x6,  x7,  x8};                \
     return vld1_u8(array);                                                    \
   }())
#endif
#ifndef simdjson_make_int8x8_t
#define simdjson_make_int8x8_t(x1, x2, x3, x4, x5, x6, x7, x8)                 \
   ([=]() {                                                                    \
     int8_t array[8] = {x1, x2,  x3,  x4,  x5,  x6,  x7,  x8};                 \
     return vld1_s8(array);                                                    \
   }())
#endif
#ifndef simdjson_make_uint16x8_t
#define simdjson_make_uint16x8_t(x1, x2, x3, x4, x5, x6, x7, x8)               \
   ([=]() {                                                                    \
     uint16_t array[8] = {x1, x2,  x3,  x4,  x5,  x6,  x7,  x8};               \
     return vld1q_u16(array);                                                  \
   }())
#endif
#ifndef simdjson_make_int16x8_t
#define simdjson_make_int16x8_t(x1, x2, x3, x4, x5, x6, x7, x8)                \
   ([=]() {                                                                    \
     int16_t array[8] = {x1, x2,  x3,  x4,  x5,  x6,  x7,  x8};                \
     return vld1q_s16(array);                                                  \
   }())
#endif

// End of private section with Visual Studio workaround
} // namespace
#endif // SIMDJSON_REGULAR_VISUAL_STUDIO


  template<typename T>
  struct simd8;

  //
  // Base class of simd8<uint8_t> and simd8<bool>, both of which use uint8x16_t internally.
  //
  template<typename T, typename Mask=simd8<bool>>
  struct base_u8 {
    uint8x16_t value;
    static const int SIZE = sizeof(value);

    // Conversion from/to SIMD register
    simdjson_inline base_u8(const uint8x16_t _value) : value(_value) {}
    simdjson_inline operator const uint8x16_t&() const { return this->value; }
    simdjson_inline operator uint8x16_t&() { return this->value; }

    // Bit operations
    simdjson_inline simd8<T> operator|(const simd8<T> other) const { return vorrq_u8(*this, other); }
    simdjson_inline simd8<T> operator&(const simd8<T> other) const { return vandq_u8(*this, other); }
    simdjson_inline simd8<T> operator^(const simd8<T> other) const { return veorq_u8(*this, other); }
    simdjson_inline simd8<T> bit_andnot(const simd8<T> other) const { return vbicq_u8(*this, other); }
    simdjson_inline simd8<T> operator~() const { return *this ^ 0xFFu; }
    simdjson_inline simd8<T>& operator|=(const simd8<T> other) { auto this_cast = static_cast<simd8<T>*>(this); *this_cast = *this_cast | other; return *this_cast; }
    simdjson_inline simd8<T>& operator&=(const simd8<T> other) { auto this_cast = static_cast<simd8<T>*>(this); *this_cast = *this_cast & other; return *this_cast; }
    simdjson_inline simd8<T>& operator^=(const simd8<T> other) { auto this_cast = static_cast<simd8<T>*>(this); *this_cast = *this_cast ^ other; return *this_cast; }

    friend simdjson_inline Mask operator==(const simd8<T> lhs, const simd8<T> rhs) { return vceqq_u8(lhs, rhs); }

    template<int N=1>
    simdjson_inline simd8<T> prev(const simd8<T> prev_chunk) const {
      return vextq_u8(prev_chunk, *this, 16 - N);
    }
  };

  // SIMD byte mask type (returned by things like eq and gt)
  template<>
  struct simd8<bool>: base_u8<bool> {
    typedef uint16_t bitmask_t;
    typedef uint32_t bitmask2_t;

    static simdjson_inline simd8<bool> splat(bool _value) { return vmovq_n_u8(uint8_t(-(!!_value))); }

    simdjson_inline simd8(const uint8x16_t _value) : base_u8<bool>(_value) {}
    // False constructor
    simdjson_inline simd8() : simd8(vdupq_n_u8(0)) {}
    // Splat constructor
    simdjson_inline simd8(bool _value) : simd8(splat(_value)) {}

    // We return uint32_t instead of uint16_t because that seems to be more efficient for most
    // purposes (cutting it down to uint16_t costs performance in some compilers).
    simdjson_inline uint32_t to_bitmask() const {
#if SIMDJSON_REGULAR_VISUAL_STUDIO
      const uint8x16_t bit_mask =  simdjson_make_uint8x16_t(0x01, 0x02, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80,
                                                   0x01, 0x02, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80);
#else
      const uint8x16_t bit_mask =  {0x01, 0x02, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80,
                                    0x01, 0x02, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80};
#endif
      auto minput = *this & bit_mask;
      uint8x16_t tmp = vpaddq_u8(minput, minput);
      tmp = vpaddq_u8(tmp, tmp);
      tmp = vpaddq_u8(tmp, tmp);
      return vgetq_lane_u16(vreinterpretq_u16_u8(tmp), 0);
    }
    // Returns 4-bit out of each byte, alternating between the high 4 bits and low
    // bits result it is 64 bit.
    simdjson_inline uint64_t to_bitmask64() const {
      return vget_lane_u64(
          vreinterpret_u64_u8(vshrn_n_u16(vreinterpretq_u16_u8(*this), 4)), 0);
    }
    simdjson_inline bool any() const { return vmaxvq_u32(vreinterpretq_u32_u8(*this)) != 0; }
  };

  // Unsigned bytes
  template<>
  struct simd8<uint8_t>: base_u8<uint8_t> {
    static simdjson_inline uint8x16_t splat(uint8_t _value) { return vmovq_n_u8(_value); }
    static simdjson_inline uint8x16_t zero() { return vdupq_n_u8(0); }
    static simdjson_inline uint8x16_t load(const uint8_t* values) { return vld1q_u8(values); }

    simdjson_inline simd8(const uint8x16_t _value) : base_u8<uint8_t>(_value) {}
    // Zero constructor
    simdjson_inline simd8() : simd8(zero()) {}
    // Array constructor
    simdjson_inline simd8(const uint8_t values[16]) : simd8(load(values)) {}
    // Splat constructor
    simdjson_inline simd8(uint8_t _value) : simd8(splat(_value)) {}
    // Member-by-member initialization
#if SIMDJSON_REGULAR_VISUAL_STUDIO
    simdjson_inline simd8(
      uint8_t v0,  uint8_t v1,  uint8_t v2,  uint8_t v3,  uint8_t v4,  uint8_t v5,  uint8_t v6,  uint8_t v7,
      uint8_t v8,  uint8_t v9,  uint8_t v10, uint8_t v11, uint8_t v12, uint8_t v13, uint8_t v14, uint8_t v15
    ) : simd8(simdjson_make_uint8x16_t(
      v0, v1, v2, v3, v4, v5, v6, v7,
      v8, v9, v10,v11,v12,v13,v14,v15
    )) {}
#else
    simdjson_inline simd8(
      uint8_t v0,  uint8_t v1,  uint8_t v2,  uint8_t v3,  uint8_t v4,  uint8_t v5,  uint8_t v6,  uint8_t v7,
      uint8_t v8,  uint8_t v9,  uint8_t v10, uint8_t v11, uint8_t v12, uint8_t v13, uint8_t v14, uint8_t v15
    ) : simd8(uint8x16_t{
      v0, v1, v2, v3, v4, v5, v6, v7,
      v8, v9, v10,v11,v12,v13,v14,v15
    }) {}
#endif

    // Repeat 16 values as many times as necessary (usually for lookup tables)
    simdjson_inline static simd8<uint8_t> repeat_16(
      uint8_t v0,  uint8_t v1,  uint8_t v2,  uint8_t v3,  uint8_t v4,  uint8_t v5,  uint8_t v6,  uint8_t v7,
      uint8_t v8,  uint8_t v9,  uint8_t v10, uint8_t v11, uint8_t v12, uint8_t v13, uint8_t v14, uint8_t v15
    ) {
      return simd8<uint8_t>(
        v0, v1, v2, v3, v4, v5, v6, v7,
        v8, v9, v10,v11,v12,v13,v14,v15
      );
    }

    // Store to array
    simdjson_inline void store(uint8_t dst[16]) const { return vst1q_u8(dst, *this); }

    // Saturated math
    simdjson_inline simd8<uint8_t> saturating_add(const simd8<uint8_t> other) const { return vqaddq_u8(*this, other); }
    simdjson_inline simd8<uint8_t> saturating_sub(const simd8<uint8_t> other) const { return vqsubq_u8(*this, other); }

    // Addition/subtraction are the same for signed and unsigned
    simdjson_inline simd8<uint8_t> operator+(const simd8<uint8_t> other) const { return vaddq_u8(*this, other); }
    simdjson_inline simd8<uint8_t> operator-(const simd8<uint8_t> other) const { return vsubq_u8(*this, other); }
    simdjson_inline simd8<uint8_t>& operator+=(const simd8<uint8_t> other) { *this = *this + other; return *this; }
    simdjson_inline simd8<uint8_t>& operator-=(const simd8<uint8_t> other) { *this = *this - other; return *this; }

    // Order-specific operations
    simdjson_inline uint8_t max_val() const { return vmaxvq_u8(*this); }
    simdjson_inline uint8_t min_val() const { return vminvq_u8(*this); }
    simdjson_inline simd8<uint8_t> max_val(const simd8<uint8_t> other) const { return vmaxq_u8(*this, other); }
    simdjson_inline simd8<uint8_t> min_val(const simd8<uint8_t> other) const { return vminq_u8(*this, other); }
    simdjson_inline simd8<bool> operator<=(const simd8<uint8_t> other) const { return vcleq_u8(*this, other); }
    simdjson_inline simd8<bool> operator>=(const simd8<uint8_t> other) const { return vcgeq_u8(*this, other); }
    simdjson_inline simd8<bool> operator<(const simd8<uint8_t> other) const { return vcltq_u8(*this, other); }
    simdjson_inline simd8<bool> operator>(const simd8<uint8_t> other) const { return vcgtq_u8(*this, other); }
    // Same as >, but instead of guaranteeing all 1's == true, false = 0 and true = nonzero. For ARM, returns all 1's.
    simdjson_inline simd8<uint8_t> gt_bits(const simd8<uint8_t> other) const { return simd8<uint8_t>(*this > other); }
    // Same as <, but instead of guaranteeing all 1's == true, false = 0 and true = nonzero. For ARM, returns all 1's.
    simdjson_inline simd8<uint8_t> lt_bits(const simd8<uint8_t> other) const { return simd8<uint8_t>(*this < other); }

    // Bit-specific operations
    simdjson_inline simd8<bool> any_bits_set(simd8<uint8_t> bits) const { return vtstq_u8(*this, bits); }
    simdjson_inline bool any_bits_set_anywhere() const { return vmaxvq_u32(vreinterpretq_u32_u8(*this)) != 0; }
    simdjson_inline bool any_bits_set_anywhere(simd8<uint8_t> bits) const { return (*this & bits).any_bits_set_anywhere(); }
    template<int N>
    simdjson_inline simd8<uint8_t> shr() const { return vshrq_n_u8(*this, N); }
    template<int N>
    simdjson_inline simd8<uint8_t> shl() const { return vshlq_n_u8(*this, N); }

    // Perform a lookup assuming the value is between 0 and 16 (undefined behavior for out of range values)
    template<typename L>
    simdjson_inline simd8<L> lookup_16(simd8<L> lookup_table) const {
      return lookup_table.apply_lookup_16_to(*this);
    }

    // Returns 4-bit out of each byte, alternating between the high 4 bits and low
    // bits result it is 64 bit.
    simdjson_inline uint64_t to_bitmask64() const {
      return vget_lane_u64(
          vreinterpret_u64_u8(vshrn_n_u16(vreinterpretq_u16_u8(*this), 4)), 0);
    }
    // Copies to 'output" all bytes corresponding to a 0 in the mask (interpreted as a bitset).
    // Passing a 0 value for mask would be equivalent to writing out every byte to output.
    // Only the first 16 - count_ones(mask) bytes of the result are significant but 16 bytes
    // get written.
    // Design consideration: it seems like a function with the
    // signature simd8<L> compress(uint16_t mask) would be
    // sensible, but the AVX ISA makes this kind of approach difficult.
    template<typename L>
    simdjson_inline void compress(uint16_t mask, L * output) const {
      using internal::thintable_epi8;
      using internal::BitsSetTable256mul2;
      using internal::pshufb_combine_table;
      // this particular implementation was inspired by work done by @animetosho
      // we do it in two steps, first 8 bytes and then second 8 bytes
      uint8_t mask1 = uint8_t(mask); // least significant 8 bits
      uint8_t mask2 = uint8_t(mask >> 8); // most significant 8 bits
      // next line just loads the 64-bit values thintable_epi8[mask1] and
      // thintable_epi8[mask2] into a 128-bit register, using only
      // two instructions on most compilers.
      uint64x2_t shufmask64 = {thintable_epi8[mask1], thintable_epi8[mask2]};
      uint8x16_t shufmask = vreinterpretq_u8_u64(shufmask64);
      // we increment by 0x08 the second half of the mask
#if SIMDJSON_REGULAR_VISUAL_STUDIO
      uint8x16_t inc = simdjson_make_uint8x16_t(0, 0, 0, 0, 0, 0, 0, 0, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08);
#else
      uint8x16_t inc = {0, 0, 0, 0, 0, 0, 0, 0, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08};
#endif
      shufmask = vaddq_u8(shufmask, inc);
      // this is the version "nearly pruned"
      uint8x16_t pruned = vqtbl1q_u8(*this, shufmask);
      // we still need to put the two halves together.
      // we compute the popcount of the first half:
      int pop1 = BitsSetTable256mul2[mask1];
      // then load the corresponding mask, what it does is to write
      // only the first pop1 bytes from the first 8 bytes, and then
      // it fills in with the bytes from the second 8 bytes + some filling
      // at the end.
      uint8x16_t compactmask = vld1q_u8(reinterpret_cast<const uint8_t *>(pshufb_combine_table + pop1 * 8));
      uint8x16_t answer = vqtbl1q_u8(pruned, compactmask);
      vst1q_u8(reinterpret_cast<uint8_t*>(output), answer);
    }

    // Copies all bytes corresponding to a 0 in the low half of the mask (interpreted as a
    // bitset) to output1, then those corresponding to a 0 in the high half to output2.
    template<typename L>
    simdjson_inline void compress_halves(uint16_t mask, L *output1, L *output2) const {
      using internal::thintable_epi8;
      uint8_t mask1 = uint8_t(mask); // least significant 8 bits
      uint8_t mask2 = uint8_t(mask >> 8); // most significant 8 bits
      uint8x8_t compactmask1 = vcreate_u8(thintable_epi8[mask1]);
      uint8x8_t compactmask2 = vcreate_u8(thintable_epi8[mask2]);
      // we increment by 0x08 the second half of the mask
#if SIMDJSON_REGULAR_VISUAL_STUDIO
      uint8x8_t inc = simdjson_make_uint8x8_t(0x08, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08);
#else
      uint8x8_t inc = {0x08, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08};
#endif
      compactmask2 = vadd_u8(compactmask2, inc);
      // store each result (with the second store possibly overlapping the first)
      vst1_u8((uint8_t*)output1, vqtbl1_u8(*this, compactmask1));
      vst1_u8((uint8_t*)output2, vqtbl1_u8(*this, compactmask2));
    }

    template<typename L>
    simdjson_inline simd8<L> lookup_16(
        L replace0,  L replace1,  L replace2,  L replace3,
        L replace4,  L replace5,  L replace6,  L replace7,
        L replace8,  L replace9,  L replace10, L replace11,
        L replace12, L replace13, L replace14, L replace15) const {
      return lookup_16(simd8<L>::repeat_16(
        replace0,  replace1,  replace2,  replace3,
        replace4,  replace5,  replace6,  replace7,
        replace8,  replace9,  replace10, replace11,
        replace12, replace13, replace14, replace15
      ));
    }

    template<typename T>
    simdjson_inline simd8<uint8_t> apply_lookup_16_to(const simd8<T> original) {
      return vqtbl1q_u8(*this, simd8<uint8_t>(original));
    }
  };

  // Signed bytes
  template<>
  struct simd8<int8_t> {
    int8x16_t value;

    static simdjson_inline simd8<int8_t> splat(int8_t _value) { return vmovq_n_s8(_value); }
    static simdjson_inline simd8<int8_t> zero() { return vdupq_n_s8(0); }
    static simdjson_inline simd8<int8_t> load(const int8_t values[16]) { return vld1q_s8(values); }

    // Conversion from/to SIMD register
    simdjson_inline simd8(const int8x16_t _value) : value{_value} {}
    simdjson_inline operator const int8x16_t&() const { return this->value; }
    simdjson_inline operator int8x16_t&() { return this->value; }

    // Zero constructor
    simdjson_inline simd8() : simd8(zero()) {}
    // Splat constructor
    simdjson_inline simd8(int8_t _value) : simd8(splat(_value)) {}
    // Array constructor
    simdjson_inline simd8(const int8_t* values) : simd8(load(values)) {}
    // Member-by-member initialization
#if SIMDJSON_REGULAR_VISUAL_STUDIO
    simdjson_inline simd8(
      int8_t v0,  int8_t v1,  int8_t v2,  int8_t v3, int8_t v4,  int8_t v5,  int8_t v6,  int8_t v7,
      int8_t v8,  int8_t v9,  int8_t v10, int8_t v11, int8_t v12, int8_t v13, int8_t v14, int8_t v15
    ) : simd8(simdjson_make_int8x16_t(
      v0, v1, v2, v3, v4, v5, v6, v7,
      v8, v9, v10,v11,v12,v13,v14,v15
    )) {}
#else
    simdjson_inline simd8(
      int8_t v0,  int8_t v1,  int8_t v2,  int8_t v3, int8_t v4,  int8_t v5,  int8_t v6,  int8_t v7,
      int8_t v8,  int8_t v9,  int8_t v10, int8_t v11, int8_t v12, int8_t v13, int8_t v14, int8_t v15
    ) : simd8(int8x16_t{
      v0, v1, v2, v3, v4, v5, v6, v7,
      v8, v9, v10,v11,v12,v13,v14,v15
    }) {}
#endif
    // Repeat 16 values as many times as necessary (usually for lookup tables)
    simdjson_inline static simd8<int8_t> repeat_16(
      int8_t v0,  int8_t v1,  int8_t v2,  int8_t v3,  int8_t v4,  int8_t v5,  int8_t v6,  int8_t v7,
      int8_t v8,  int8_t v9,  int8_t v10, int8_t v11, int8_t v12, int8_t v13, int8_t v14, int8_t v15
    ) {
      return simd8<int8_t>(
        v0, v1, v2, v3, v4, v5, v6, v7,
        v8, v9, v10,v11,v12,v13,v14,v15
      );
    }

    // Store to array
    simdjson_inline void store(int8_t dst[16]) const { return vst1q_s8(dst, *this); }

    // Explicit conversion to/from unsigned
    //
    // Under Visual Studio/ARM64 uint8x16_t and int8x16_t are apparently the same type.
    // In theory, we could check this occurrence with std::same_as and std::enabled_if but it is C++14
    // and relatively ugly and hard to read.
#ifndef SIMDJSON_REGULAR_VISUAL_STUDIO
    simdjson_inline explicit simd8(const uint8x16_t other): simd8(vreinterpretq_s8_u8(other)) {}
#endif
    simdjson_inline explicit operator simd8<uint8_t>() const { return vreinterpretq_u8_s8(this->value); }

    // Math
    simdjson_inline simd8<int8_t> operator+(const simd8<int8_t> other) const { return vaddq_s8(*this, other); }
    simdjson_inline simd8<int8_t> operator-(const simd8<int8_t> other) const { return vsubq_s8(*this, other); }
    simdjson_inline simd8<int8_t>& operator+=(const simd8<int8_t> other) { *this = *this + other; return *this; }
    simdjson_inline simd8<int8_t>& operator-=(const simd8<int8_t> other) { *this = *this - other; return *this; }

    // Order-sensitive comparisons
    simdjson_inline simd8<int8_t> max_val(const simd8<int8_t> other) const { return vmaxq_s8(*this, other); }
    simdjson_inline simd8<int8_t> min_val(const simd8<int8_t> other) const { return vminq_s8(*this, other); }
    simdjson_inline simd8<bool> operator>(const simd8<int8_t> other) const { return vcgtq_s8(*this, other); }
    simdjson_inline simd8<bool> operator<(const simd8<int8_t> other) const { return vcltq_s8(*this, other); }
    simdjson_inline simd8<bool> operator==(const simd8<int8_t> other) const { return vceqq_s8(*this, other); }

    template<int N=1>
    simdjson_inline simd8<int8_t> prev(const simd8<int8_t> prev_chunk) const {
      return vextq_s8(prev_chunk, *this, 16 - N);
    }

    // Perform a lookup assuming no value is larger than 16
    template<typename L>
    simdjson_inline simd8<L> lookup_16(simd8<L> lookup_table) const {
      return lookup_table.apply_lookup_16_to(*this);
    }
    template<typename L>
    simdjson_inline simd8<L> lookup_16(
        L replace0,  L replace1,  L replace2,  L replace3,
        L replace4,  L replace5,  L replace6,  L replace7,
        L replace8,  L replace9,  L replace10, L replace11,
        L replace12, L replace13, L replace14, L replace15) const {
      return lookup_16(simd8<L>::repeat_16(
        replace0,  replace1,  replace2,  replace3,
        replace4,  replace5,  replace6,  replace7,
        replace8,  replace9,  replace10, replace11,
        replace12, replace13, replace14, replace15
      ));
    }

    template<typename T>
    simdjson_inline simd8<int8_t> apply_lookup_16_to(const simd8<T> original) {
      return vqtbl1q_s8(*this, simd8<uint8_t>(original));
    }
  };

  template<typename T>
  struct simd8x64 {
    static constexpr int NUM_CHUNKS = 64 / sizeof(simd8<T>);
    static_assert(NUM_CHUNKS == 4, "ARM kernel should use four registers per 64-byte block.");
    const simd8<T> chunks[NUM_CHUNKS];

    simd8x64(const simd8x64<T>& o) = delete; // no copy allowed
    simd8x64<T>& operator=(const simd8<T>& other) = delete; // no assignment allowed
    simd8x64() = delete; // no default constructor allowed

    simdjson_inline simd8x64(const simd8<T> chunk0, const simd8<T> chunk1, const simd8<T> chunk2, const simd8<T> chunk3) : chunks{chunk0, chunk1, chunk2, chunk3} {}
    simdjson_inline simd8x64(const T ptr[64]) : chunks{simd8<T>::load(ptr), simd8<T>::load(ptr+16), simd8<T>::load(ptr+32), simd8<T>::load(ptr+48)} {}

    simdjson_inline void store(T ptr[64]) const {
      this->chunks[0].store(ptr+sizeof(simd8<T>)*0);
      this->chunks[1].store(ptr+sizeof(simd8<T>)*1);
      this->chunks[2].store(ptr+sizeof(simd8<T>)*2);
      this->chunks[3].store(ptr+sizeof(simd8<T>)*3);
    }

    simdjson_inline simd8<T> reduce_or() const {
      return (this->chunks[0] | this->chunks[1]) | (this->chunks[2] | this->chunks[3]);
    }


    simdjson_inline uint64_t compress(uint64_t mask, T * output) const {
      uint64_t popcounts = vget_lane_u64(vreinterpret_u64_u8(vcnt_u8(vcreate_u8(~mask))), 0);
      // compute the prefix sum of the popcounts of each byte
      uint64_t offsets = popcounts * 0x0101010101010101;
      this->chunks[0].compress_halves(uint16_t(mask), output, &output[popcounts & 0xFF]);
      this->chunks[1].compress_halves(uint16_t(mask >> 16), &output[(offsets >> 8) & 0xFF], &output[(offsets >> 16) & 0xFF]);
      this->chunks[2].compress_halves(uint16_t(mask >> 32), &output[(offsets >> 24) & 0xFF], &output[(offsets >> 32) & 0xFF]);
      this->chunks[3].compress_halves(uint16_t(mask >> 48), &output[(offsets >> 40) & 0xFF], &output[(offsets >> 48) & 0xFF]);
      return offsets >> 56;
    }

    simdjson_inline uint64_t to_bitmask() const {
#if SIMDJSON_REGULAR_VISUAL_STUDIO
      const uint8x16_t bit_mask = simdjson_make_uint8x16_t(
        0x01, 0x02, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80,
        0x01, 0x02, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80
      );
#else
      const uint8x16_t bit_mask = {
        0x01, 0x02, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80,
        0x01, 0x02, 0x4, 0x8, 0x10, 0x20, 0x40, 0x80
      };
#endif
      // Add each of the elements next to each other, successively, to stuff each 8 byte mask into one.
      uint8x16_t sum0 = vpaddq_u8(this->chunks[0] & bit_mask, this->chunks[1] & bit_mask);
      uint8x16_t sum1 = vpaddq_u8(this->chunks[2] & bit_mask, this->chunks[3] & bit_mask);
      sum0 = vpaddq_u8(sum0, sum1);
      sum0 = vpaddq_u8(sum0, sum0);
      return vgetq_lane_u64(vreinterpretq_u64_u8(sum0), 0);
    }

    simdjson_inline uint64_t eq(const T m) const {
      const simd8<T> mask = simd8<T>::splat(m);
      return  simd8x64<bool>(
        this->chunks[0] == mask,
        this->chunks[1] == mask,
        this->chunks[2] == mask,
        this->chunks[3] == mask
      ).to_bitmask();
    }

    simdjson_inline uint64_t lteq(const T m) const {
      const simd8<T> mask = simd8<T>::splat(m);
      return  simd8x64<bool>(
        this->chunks[0] <= mask,
        this->chunks[1] <= mask,
        this->chunks[2] <= mask,
        this->chunks[3] <= mask
      ).to_bitmask();
    }
  }; // struct simd8x64<T>

} // namespace simd
} // unnamed namespace
} // namespace arm64
} // namespace simdjson

#endif // SIMDJSON_ARM64_SIMD_H
/* end file simdjson/arm64/simd.h */
/* including simdjson/arm64/stringparsing_defs.h: #include "simdjson/arm64/stringparsing_defs.h" */
/* begin file simdjson/arm64/stringparsing_defs.h */
#ifndef SIMDJSON_ARM64_STRINGPARSING_DEFS_H
#define SIMDJSON_ARM64_STRINGPARSING_DEFS_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #include "simdjson/arm64/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/arm64/simd.h" */
/* amalgamation skipped (editor-only): #include "simdjson/arm64/bitmanipulation.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
namespace arm64 {
namespace {

using namespace simd;

// Holds backslashes and quotes locations.
struct backslash_and_quote {
public:
  static constexpr uint32_t BYTES_PROCESSED = 32;
  simdjson_inline backslash_and_quote copy_and_find(const uint8_t *src, uint8_t *dst);

  simdjson_inline bool has_quote_first() { return ((bs_bits - 1) & quote_bits) != 0; }
  simdjson_inline bool has_backslash() { return bs_bits != 0; }
  simdjson_inline int quote_index() { return trailing_zeroes(quote_bits); }
  simdjson_inline int backslash_index() { return trailing_zeroes(bs_bits); }

  uint32_t bs_bits;
  uint32_t quote_bits;
}; // struct backslash_and_quote

simdjson_inline backslash_and_quote backslash_and_quote::copy_and_find(const uint8_t *src, uint8_t *dst) {
  // this can read up to 31 bytes beyond the buffer size, but we require
  // SIMDJSON_PADDING of padding
  static_assert(SIMDJSON_PADDING >= (BYTES_PROCESSED - 1), "backslash and quote finder must process fewer than SIMDJSON_PADDING bytes");
  simd8<uint8_t> v0(src);
  simd8<uint8_t> v1(src + sizeof(v0));
  v0.store(dst);
  v1.store(dst + sizeof(v0));

  // Getting a 64-bit bitmask is much cheaper than multiple 16-bit bitmasks on ARM; therefore, we
  // smash them together into a 64-byte mask and get the bitmask from there.
  uint64_t bs_and_quote = simd8x64<bool>(v0 == '\\', v1 == '\\', v0 == '"', v1 == '"').to_bitmask();
  return {
    uint32_t(bs_and_quote),      // bs_bits
    uint32_t(bs_and_quote >> 32) // quote_bits
  };
}

struct escaping {
  static constexpr uint32_t BYTES_PROCESSED = 16;
  simdjson_inline static escaping copy_and_find(const uint8_t *src, uint8_t *dst);

  simdjson_inline bool has_escape() { return escape_bits != 0; }
  simdjson_inline int escape_index() { return trailing_zeroes(escape_bits) / 4; }

  uint64_t escape_bits;
}; // struct escaping



simdjson_inline escaping escaping::copy_and_find(const uint8_t *src, uint8_t *dst) {
  static_assert(SIMDJSON_PADDING >= (BYTES_PROCESSED - 1), "escaping finder must process fewer than SIMDJSON_PADDING bytes");
  simd8<uint8_t> v(src);
  v.store(dst);
  simd8<bool> is_quote = (v == '"');
  simd8<bool> is_backslash = (v == '\\');
  simd8<bool> is_control = (v < 32);
  return {
    (is_backslash | is_quote | is_control).to_bitmask64()
  };
}



} // unnamed namespace
} // namespace arm64
} // namespace simdjson

#endif // SIMDJSON_ARM64_STRINGPARSING_DEFS_H
/* end file simdjson/arm64/stringparsing_defs.h */

#define SIMDJSON_SKIP_BACKSLASH_SHORT_CIRCUIT 1
/* end file simdjson/arm64/begin.h */
/* including simdjson/generic/amalgamated.h for arm64: #include "simdjson/generic/amalgamated.h" */
/* begin file simdjson/generic/amalgamated.h for arm64 */
#if defined(SIMDJSON_CONDITIONAL_INCLUDE) && !defined(SIMDJSON_GENERIC_DEPENDENCIES_H)
#error simdjson/generic/dependencies.h must be included before simdjson/generic/amalgamated.h!
#endif

/* including simdjson/generic/base.h for arm64: #include "simdjson/generic/base.h" */
/* begin file simdjson/generic/base.h for arm64 */
#ifndef SIMDJSON_GENERIC_BASE_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #define SIMDJSON_GENERIC_BASE_H */
/* amalgamation skipped (editor-only): #include "simdjson/base.h" */
/* amalgamation skipped (editor-only): // If we haven't got an implementation yet, we're in the editor, editing a generic file! Just */
/* amalgamation skipped (editor-only): // use the most advanced one we can so the most possible stuff can be tested. */
/* amalgamation skipped (editor-only): #ifndef SIMDJSON_IMPLEMENTATION */
/* amalgamation skipped (editor-only): #include "simdjson/implementation_detection.h" */
/* amalgamation skipped (editor-only): #if SIMDJSON_IMPLEMENTATION_ICELAKE */
/* amalgamation skipped (editor-only): #include "simdjson/icelake/begin.h" */
/* amalgamation skipped (editor-only): #elif SIMDJSON_IMPLEMENTATION_HASWELL */
/* amalgamation skipped (editor-only): #include "simdjson/haswell/begin.h" */
/* amalgamation skipped (editor-only): #elif SIMDJSON_IMPLEMENTATION_WESTMERE */
/* amalgamation skipped (editor-only): #include "simdjson/westmere/begin.h" */
/* amalgamation skipped (editor-only): #elif SIMDJSON_IMPLEMENTATION_ARM64 */
/* amalgamation skipped (editor-only): #include "simdjson/arm64/begin.h" */
/* amalgamation skipped (editor-only): #elif SIMDJSON_IMPLEMENTATION_PPC64 */
/* amalgamation skipped (editor-only): #include "simdjson/ppc64/begin.h" */
/* amalgamation skipped (editor-only): #elif SIMDJSON_IMPLEMENTATION_LSX */
/* amalgamation skipped (editor-only): #include "simdjson/lsx/begin.h" */
/* amalgamation skipped (editor-only): #elif SIMDJSON_IMPLEMENTATION_LASX */
/* amalgamation skipped (editor-only): #include "simdjson/lasx/begin.h" */
/* amalgamation skipped (editor-only): #elif SIMDJSON_IMPLEMENTATION_FALLBACK */
/* amalgamation skipped (editor-only): #include "simdjson/fallback/begin.h" */
/* amalgamation skipped (editor-only): #else */
/* amalgamation skipped (editor-only): #error "All possible implementations (including fallback) have been disabled! simdjson will not run." */
/* amalgamation skipped (editor-only): #endif */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_IMPLEMENTATION */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
namespace arm64 {

struct open_container;
class dom_parser_implementation;

/**
 * The type of a JSON number
 */
enum class number_type {
    floating_point_number=1, /// a binary64 number
    signed_integer,          /// a signed integer that fits in a 64-bit word using two's complement
    unsigned_integer,        /// a positive integer larger or equal to 1<<63
    big_integer              /// a big integer that does not fit in a 64-bit word
};

} // namespace arm64
} // namespace simdjson

#endif // SIMDJSON_GENERIC_BASE_H
/* end file simdjson/generic/base.h for arm64 */
/* including simdjson/generic/jsoncharutils.h for arm64: #include "simdjson/generic/jsoncharutils.h" */
/* begin file simdjson/generic/jsoncharutils.h for arm64 */
#ifndef SIMDJSON_GENERIC_JSONCHARUTILS_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #define SIMDJSON_GENERIC_JSONCHARUTILS_H */
/* amalgamation skipped (editor-only): #include "simdjson/generic/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/jsoncharutils_tables.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/numberparsing_tables.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
namespace arm64 {
namespace {
namespace jsoncharutils {

// return non-zero if not a structural or whitespace char
// zero otherwise
simdjson_inline uint32_t is_not_structural_or_whitespace(uint8_t c) {
  return internal::structural_or_whitespace_negated[c];
}

simdjson_inline uint32_t is_structural_or_whitespace(uint8_t c) {
  return internal::structural_or_whitespace[c];
}

// returns a value with the high 16 bits set if not valid
// otherwise returns the conversion of the 4 hex digits at src into the bottom
// 16 bits of the 32-bit return register
//
// see
// https://lemire.me/blog/2019/04/17/parsing-short-hexadecimal-strings-efficiently/
static inline uint32_t hex_to_u32_nocheck(
    const uint8_t *src) { // strictly speaking, static inline is a C-ism
  uint32_t v1 = internal::digit_to_val32[630 + src[0]];
  uint32_t v2 = internal::digit_to_val32[420 + src[1]];
  uint32_t v3 = internal::digit_to_val32[210 + src[2]];
  uint32_t v4 = internal::digit_to_val32[0 + src[3]];
  return v1 | v2 | v3 | v4;
}

// given a code point cp, writes to c
// the utf-8 code, outputting the length in
// bytes, if the length is zero, the code point
// is invalid
//
// This can possibly be made faster using pdep
// and clz and table lookups, but JSON documents
// have few escaped code points, and the following
// function looks cheap.
//
// Note: we assume that surrogates are treated separately
//
simdjson_inline size_t codepoint_to_utf8(uint32_t cp, uint8_t *c) {
  if (cp <= 0x7F) {
    c[0] = uint8_t(cp);
    return 1; // ascii
  }
  if (cp <= 0x7FF) {
    c[0] = uint8_t((cp >> 6) + 192);
    c[1] = uint8_t((cp & 63) + 128);
    return 2; // universal plane
    //  Surrogates are treated elsewhere...
    //} //else if (0xd800 <= cp && cp <= 0xdfff) {
    //  return 0; // surrogates // could put assert here
  } else if (cp <= 0xFFFF) {
    c[0] = uint8_t((cp >> 12) + 224);
    c[1] = uint8_t(((cp >> 6) & 63) + 128);
    c[2] = uint8_t((cp & 63) + 128);
    return 3;
  } else if (cp <= 0x10FFFF) { // if you know you have a valid code point, this
                               // is not needed
    c[0] = uint8_t((cp >> 18) + 240);
    c[1] = uint8_t(((cp >> 12) & 63) + 128);
    c[2] = uint8_t(((cp >> 6) & 63) + 128);
    c[3] = uint8_t((cp & 63) + 128);
    return 4;
  }
  // will return 0 when the code point was too large.
  return 0; // bad r
}

#if SIMDJSON_IS_32BITS // _umul128 for x86, arm
// this is a slow emulation routine for 32-bit
//
static simdjson_inline uint64_t __emulu(uint32_t x, uint32_t y) {
  return x * (uint64_t)y;
}
static simdjson_inline uint64_t _umul128(uint64_t ab, uint64_t cd, uint64_t *hi) {
  uint64_t ad = __emulu((uint32_t)(ab >> 32), (uint32_t)cd);
  uint64_t bd = __emulu((uint32_t)ab, (uint32_t)cd);
  uint64_t adbc = ad + __emulu((uint32_t)ab, (uint32_t)(cd >> 32));
  uint64_t adbc_carry = !!(adbc < ad);
  uint64_t lo = bd + (adbc << 32);
  *hi = __emulu((uint32_t)(ab >> 32), (uint32_t)(cd >> 32)) + (adbc >> 32) +
        (adbc_carry << 32) + !!(lo < bd);
  return lo;
}
#endif

} // namespace jsoncharutils
} // unnamed namespace
} // namespace arm64
} // namespace simdjson

#endif // SIMDJSON_GENERIC_JSONCHARUTILS_H
/* end file simdjson/generic/jsoncharutils.h for arm64 */
/* including simdjson/generic/atomparsing.h for arm64: #include "simdjson/generic/atomparsing.h" */
/* begin file simdjson/generic/atomparsing.h for arm64 */
#ifndef SIMDJSON_GENERIC_ATOMPARSING_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #define SIMDJSON_GENERIC_ATOMPARSING_H */
/* amalgamation skipped (editor-only): #include "simdjson/generic/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/generic/jsoncharutils.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

#include <cstring>

namespace simdjson {
namespace arm64 {
namespace {
/// @private
namespace atomparsing {

// The string_to_uint32 is exclusively used to map literal strings to 32-bit values.
// We use memcpy instead of a pointer cast to avoid undefined behaviors since we cannot
// be certain that the character pointer will be properly aligned.
// You might think that using memcpy makes this function expensive, but you'd be wrong.
// All decent optimizing compilers (GCC, clang, Visual Studio) will compile string_to_uint32("false");
// to the compile-time constant 1936482662.
simdjson_inline uint32_t string_to_uint32(const char* str) { uint32_t val; std::memcpy(&val, str, sizeof(uint32_t)); return val; }


// Again in str4ncmp we use a memcpy to avoid undefined behavior. The memcpy may appear expensive.
// Yet all decent optimizing compilers will compile memcpy to a single instruction, just about.
simdjson_warn_unused
simdjson_inline uint32_t str4ncmp(const uint8_t *src, const char* atom) {
  uint32_t srcval; // we want to avoid unaligned 32-bit loads (undefined in C/C++)
  static_assert(sizeof(uint32_t) <= SIMDJSON_PADDING, "SIMDJSON_PADDING must be larger than 4 bytes");
  std::memcpy(&srcval, src, sizeof(uint32_t));
  return srcval ^ string_to_uint32(atom);
}

simdjson_warn_unused
simdjson_inline bool is_valid_true_atom(const uint8_t *src) {
  return (str4ncmp(src, "true") | jsoncharutils::is_not_structural_or_whitespace(src[4])) == 0;
}

simdjson_warn_unused
simdjson_inline bool is_valid_true_atom(const uint8_t *src, size_t len) {
  if (len > 4) { return is_valid_true_atom(src); }
  else if (len == 4) { return !str4ncmp(src, "true"); }
  else { return false; }
}

simdjson_warn_unused
simdjson_inline bool is_valid_false_atom(const uint8_t *src) {
  return (str4ncmp(src+1, "alse") | jsoncharutils::is_not_structural_or_whitespace(src[5])) == 0;
}

simdjson_warn_unused
simdjson_inline bool is_valid_false_atom(const uint8_t *src, size_t len) {
  if (len > 5) { return is_valid_false_atom(src); }
  else if (len == 5) { return !str4ncmp(src+1, "alse"); }
  else { return false; }
}

simdjson_warn_unused
simdjson_inline bool is_valid_null_atom(const uint8_t *src) {
  return (str4ncmp(src, "null") | jsoncharutils::is_not_structural_or_whitespace(src[4])) == 0;
}

simdjson_warn_unused
simdjson_inline bool is_valid_null_atom(const uint8_t *src, size_t len) {
  if (len > 4) { return is_valid_null_atom(src); }
  else if (len == 4) { return !str4ncmp(src, "null"); }
  else { return false; }
}

} // namespace atomparsing
} // unnamed namespace
} // namespace arm64
} // namespace simdjson

#endif // SIMDJSON_GENERIC_ATOMPARSING_H
/* end file simdjson/generic/atomparsing.h for arm64 */
/* including simdjson/generic/dom_parser_implementation.h for arm64: #include "simdjson/generic/dom_parser_implementation.h" */
/* begin file simdjson/generic/dom_parser_implementation.h for arm64 */
#ifndef SIMDJSON_GENERIC_DOM_PARSER_IMPLEMENTATION_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #define SIMDJSON_GENERIC_DOM_PARSER_IMPLEMENTATION_H */
/* amalgamation skipped (editor-only): #include "simdjson/generic/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/dom_parser_implementation.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
namespace arm64 {

// expectation: sizeof(open_container) = 64/8.
struct open_container {
  uint32_t tape_index; // where, on the tape, does the scope ([,{) begins
  uint32_t count; // how many elements in the scope
}; // struct open_container

static_assert(sizeof(open_container) == 64/8, "Open container must be 64 bits");

class dom_parser_implementation final : public internal::dom_parser_implementation {
public:
  /** Tape location of each open { or [ */
  std::unique_ptr<open_container[]> open_containers{};
  /** Whether each open container is a [ or { */
  std::unique_ptr<bool[]> is_array{};
  /** Buffer passed to stage 1 */
  const uint8_t *buf{};
  /** Length passed to stage 1 */
  size_t len{0};
  /** Document passed to stage 2 */
  dom::document *doc{};

  inline dom_parser_implementation() noexcept;
  inline dom_parser_implementation(dom_parser_implementation &&other) noexcept;
  inline dom_parser_implementation &operator=(dom_parser_implementation &&other) noexcept;
  dom_parser_implementation(const dom_parser_implementation &) = delete;
  dom_parser_implementation &operator=(const dom_parser_implementation &) = delete;

  simdjson_warn_unused error_code parse(const uint8_t *buf, size_t len, dom::document &doc) noexcept final;
  simdjson_warn_unused error_code stage1(const uint8_t *buf, size_t len, stage1_mode partial) noexcept final;
  simdjson_warn_unused error_code stage2(dom::document &doc) noexcept final;
  simdjson_warn_unused error_code stage2_next(dom::document &doc) noexcept final;
  simdjson_warn_unused uint8_t *parse_string(const uint8_t *src, uint8_t *dst, bool allow_replacement) const noexcept final;
  simdjson_warn_unused uint8_t *parse_wobbly_string(const uint8_t *src, uint8_t *dst) const noexcept final;
  inline simdjson_warn_unused error_code set_capacity(size_t capacity) noexcept final;
  inline simdjson_warn_unused error_code set_max_depth(size_t max_depth) noexcept final;
private:
  simdjson_inline simdjson_warn_unused error_code set_capacity_stage1(size_t capacity);

};

} // namespace arm64
} // namespace simdjson

namespace simdjson {
namespace arm64 {

inline dom_parser_implementation::dom_parser_implementation() noexcept = default;
inline dom_parser_implementation::dom_parser_implementation(dom_parser_implementation &&other) noexcept = default;
inline dom_parser_implementation &dom_parser_implementation::operator=(dom_parser_implementation &&other) noexcept = default;

// Leaving these here so they can be inlined if so desired
inline simdjson_warn_unused error_code dom_parser_implementation::set_capacity(size_t capacity) noexcept {
  if(capacity > SIMDJSON_MAXSIZE_BYTES) { return CAPACITY; }
  // Stage 1 index output
  size_t max_structures = SIMDJSON_ROUNDUP_N(capacity, 64) + 2 + 7;
  structural_indexes.reset( new (std::nothrow) uint32_t[max_structures] );
  if (!structural_indexes) { _capacity = 0; return MEMALLOC; }
  structural_indexes[0] = 0;
  n_structural_indexes = 0;

  _capacity = capacity;
  return SUCCESS;
}

inline simdjson_warn_unused error_code dom_parser_implementation::set_max_depth(size_t max_depth) noexcept {
  // Stage 2 stacks
  open_containers.reset(new (std::nothrow) open_container[max_depth]);
  is_array.reset(new (std::nothrow) bool[max_depth]);
  if (!is_array || !open_containers) { _max_depth = 0; return MEMALLOC; }

  _max_depth = max_depth;
  return SUCCESS;
}

} // namespace arm64
} // namespace simdjson

#endif // SIMDJSON_GENERIC_DOM_PARSER_IMPLEMENTATION_H
/* end file simdjson/generic/dom_parser_implementation.h for arm64 */
/* including simdjson/generic/implementation_simdjson_result_base.h for arm64: #include "simdjson/generic/implementation_simdjson_result_base.h" */
/* begin file simdjson/generic/implementation_simdjson_result_base.h for arm64 */
#ifndef SIMDJSON_GENERIC_IMPLEMENTATION_SIMDJSON_RESULT_BASE_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #define SIMDJSON_GENERIC_IMPLEMENTATION_SIMDJSON_RESULT_BASE_H */
/* amalgamation skipped (editor-only): #include "simdjson/generic/base.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

namespace simdjson {
namespace arm64 {

// This is a near copy of include/error.h's implementation_simdjson_result_base, except it doesn't use std::pair
// so we can avoid inlining errors
// TODO reconcile these!
/**
 * The result of a simdjson operation that could fail.
 *
 * Gives the option of reading error codes, or throwing an exception by casting to the desired result.
 *
 * This is a base class for implementations that want to add functions to the result type for
 * chaining.
 *
 * Override like:
 *
 *   struct simdjson_result<T> : public internal::implementation_simdjson_result_base<T> {
 *     simdjson_result() noexcept : internal::implementation_simdjson_result_base<T>() {}
 *     simdjson_result(error_code error) noexcept : internal::implementation_simdjson_result_base<T>(error) {}
 *     simdjson_result(T &&value) noexcept : internal::implementation_simdjson_result_base<T>(std::forward(value)) {}
 *     simdjson_result(T &&value, error_code error) noexcept : internal::implementation_simdjson_result_base<T>(value, error) {}
 *     // Your extra methods here
 *   }
 *
 * Then any method returning simdjson_result<T> will be chainable with your methods.
 */
template<typename T>
struct implementation_simdjson_result_base {

  /**
   * Create a new empty result with error = UNINITIALIZED.
   */
  simdjson_inline implementation_simdjson_result_base() noexcept = default;

  /**
   * Create a new error result.
   */
  simdjson_inline implementation_simdjson_result_base(error_code error) noexcept;

  /**
   * Create a new successful result.
   */
  simdjson_inline implementation_simdjson_result_base(T &&value) noexcept;

  /**
   * Create a new result with both things (use if you don't want to branch when creating the result).
   */
  simdjson_inline implementation_simdjson_result_base(T &&value, error_code error) noexcept;

  /**
   * Move the value and the error to the provided variables.
   *
   * @param value The variable to assign the value to. May not be set if there is an error.
   * @param error The variable to assign the error to. Set to SUCCESS if there is no error.
   */
  simdjson_inline void tie(T &value, error_code &error) && noexcept;

  /**
   * Move the value to the provided variable.
   *
   * @param value The variable to assign the value to. May not be set if there is an error.
   */
  simdjson_warn_unused simdjson_inline error_code get(T &value) && noexcept;

  /**
   * The error.
   */
  simdjson_warn_unused simdjson_inline error_code error() const noexcept;

  /**
   * Whether there is a value.
   */
  simdjson_warn_unused simdjson_inline bool has_value() const noexcept;

#if SIMDJSON_EXCEPTIONS

  /**
   * Get the result value.
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline T& operator*() &  noexcept(false);
  simdjson_inline T&& operator*() &&  noexcept(false);
  /**
   * Arrow operator to access members of the contained value.
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline T* operator->() noexcept(false);
  simdjson_inline const T* operator->() const noexcept(false);

  simdjson_inline T& value() & noexcept(false);

  /**
   * Take the result value (move it).
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline T&& value() && noexcept(false);

  /**
   * Take the result value (move it).
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline T&& take_value() && noexcept(false);

  /**
   * Cast to the value (will throw on error).
   *
   * @throw simdjson_error if there was an error.
   */
  simdjson_inline operator T&&() && noexcept(false);


#endif // SIMDJSON_EXCEPTIONS

  /**
   * Get the result value. This function is safe if and only
   * the error() method returns a value that evaluates to false.
   */
  simdjson_inline const T& value_unsafe() const& noexcept;
  /**
   * Get the result value. This function is safe if and only
   * the error() method returns a value that evaluates to false.
   */
  simdjson_inline T& value_unsafe() & noexcept;
  /**
   * Take the result value (move it). This function is safe if and only
   * the error() method returns a value that evaluates to false.
   */
  simdjson_inline T&& value_unsafe() && noexcept;

  using value_type = T;
  using error_type = error_code;

protected:
  /** users should never directly access first and second. **/
  T first{}; /** Users should never directly access 'first'. **/
  error_code second{UNINITIALIZED}; /** Users should never directly access 'second'. **/
}; // struct implementation_simdjson_result_base

} // namespace arm64
} // namespace simdjson

#endif // SIMDJSON_GENERIC_IMPLEMENTATION_SIMDJSON_RESULT_BASE_H
/* end file simdjson/generic/implementation_simdjson_result_base.h for arm64 */
/* including simdjson/generic/numberparsing.h for arm64: #include "simdjson/generic/numberparsing.h" */
/* begin file simdjson/generic/numberparsing.h for arm64 */
#ifndef SIMDJSON_GENERIC_NUMBERPARSING_H

/* amalgamation skipped (editor-only): #ifndef SIMDJSON_CONDITIONAL_INCLUDE */
/* amalgamation skipped (editor-only): #define SIMDJSON_GENERIC_NUMBERPARSING_H */
/* amalgamation skipped (editor-only): #include "simdjson/generic/base.h" */
/* amalgamation skipped (editor-only): #include "simdjson/generic/jsoncharutils.h" */
/* amalgamation skipped (editor-only): #include "simdjson/internal/numberparsing_tables.h" */
/* amalgamation skipped (editor-only): #endif // SIMDJSON_CONDITIONAL_INCLUDE */

#include <limits>
#include <ostream>
#include <cstring>

namespace simdjson {
namespace arm64 {
namespace numberparsing {

#ifdef JSON_TEST_NUMBERS
#define INVALID_NUMBER(SRC) (found_invalid_number((SRC)), NUMBER_ERROR)
#define WRITE_INTEGER(VALUE, SRC, WRITER) (found_integer((VALUE), (SRC)), (WRITER).append_s64((VALUE)))
#define WRITE_UNSIGNED(VALUE, SRC, WRITER) (found_unsigned_integer((VALUE), (SRC)), (WRITER).append_u64((VALUE)))
#define WRITE_DOUBLE(VALUE, SRC, WRITER) (found_float((VALUE), (SRC)), (WRITER).append_double((VALUE)))
#define BIGINT_NUMBER(SRC) (found_invalid_number((SRC)), BIGINT_ERROR)
#else
#define INVALID_NUMBER(SRC) (NUMBER_ERROR)
#define WRITE_INTEGER(VALUE, SRC, WRITER) (WRITER).append_s64((VALUE))
#define WRITE_UNSIGNED(VALUE, SRC, WRITER) (WRITER).append_u64((VALUE))
#define WRITE_DOUBLE(VALUE, SRC, WRITER) (WRITER).append_double((VALUE))
#define BIGINT_NUMBER(SRC) (BIGINT_ERROR)
#endif

namespace {

// Convert a mantissa, an exponent and a sign bit into an ieee64 double.
// The real_exponent needs to be in [0, 2046] (technically real_exponent = 2047 would be acceptable).
// The mantissa should be in [0,1<<53). The bit at index (1ULL << 52) while be zeroed.
simdjson_inline double to_double(uint64_t mantissa, uint64_t real_exponent, bool negative) {
    double d;
    mantissa &= ~(1ULL << 52);
    mantissa |= real_exponent << 52;
    mantissa |= ((static_cast<uint64_t>(negative)) << 63);
    std::memcpy(&d, &mantissa, sizeof(d));
    return d;
}

// Attempts to compute i * 10^(power) exactly; and if "negative" is
// true, negate the result.
// This function will only work in some cases, when it does not work, success is
// set to false. This should work *most of the time* (like 99% of the time).
// We assume that power is in the [smallest_power,
// largest_power] interval: the caller is responsible for this check.
simdjson_inline bool compute_float_64(int64_t power, uint64_t i, bool negative, double &d) {
  // we start with a fast path
  // It was described in
  // Clinger WD. How to read floating point numbers accurately.
  // ACM SIGPLAN Notices. 1990
#ifndef FLT_EVAL_METHOD
#error "FLT_EVAL_METHOD should be defined, please include cfloat."
#endif
#if (FLT_EVAL_METHOD != 1) && (FLT_EVAL_METHOD != 0)
  // We cannot be certain that x/y is rounded to nearest.
  if (0 <= power && power <= 22 && i <= 9007199254740991)
#else
  if (-22 <= power && power <= 22 && i <= 9007199254740991)
#endif
  {
    // convert the integer into a double. This is lossless since
    // 0 <= i <= 2^53 - 1.
    d = double(i);
    //
    // The general idea is as follows.
    // If 0 <= s < 2^53 and if 10^0 <= p <= 10^22 then
    // 1) Both s and p can be represented exactly as 64-bit floating-point
    // values
    // (binary64).
    // 2) Because s and p can be represented exactly as floating-point values,
    // then s * p
    // and s / p will produce correctly rounded values.
    //
    if (power < 0) {
      d = d / simdjson::internal::power_of_ten[-power];
    } else {
      d = d * simdjson::internal::power_of_ten[power];
    }
    if (negative) {
      d = -d;
    }
    return true;
  }
  // When 22 < power && power <  22 + 16, we could
  // hope for another, secondary fast path.  It was
  // described by David M. Gay in  "Correctly rounded
  // binary-decimal and decimal-binary conversions." (1990)
  // If you need to compute i * 10^(22 + x) for x < 16,
  // first compute i * 10^x, if you know that result is exact
  // (e.g., when i * 10^x < 2^53),
  // then you can still proceed and do (i * 10^x) * 10^22.
  // Is this worth your time?
  // You need  22 < power *and* power <  22 + 16 *and* (i * 10^(x-22) < 2^53)
  // for this second fast path to work.
  // If you you have 22 < power *and* power <  22 + 16, and then you
  // optimistically compute "i * 10^(x-22)", there is still a chance that you
  // have wasted your time if i * 10^(x-22) >= 2^53. It makes the use cases of
  // this optimization maybe less common than we would like. Source:
  // http://www.exploringbinary.com/fast-path-decimal-to-floating-point-conversion/
  // also used in RapidJSON: https://rapidjson.org/strtod_8h_source.html

  // The fast path has now failed, so we are failing back on the slower path.

  // In the slow path, we need to adjust i so that it is > 1<<63 which is always
  // possible, except if i == 0, so we handle i == 0 separately.
  if(i == 0) {
    d = negative ? -0.0 : 0.0;
    return true;
  }


  // The exponent is 1024 + 63 + power
  //     + floor(log(5**power)/log(2)).
  // The 1024 comes from the ieee64 standard.
  // The 63 comes from the fact that we use a 64-bit word.
  //
  // Computing floor(log(5**power)/log(2)) could be
  // slow. Instead we use a fast function.
  //
  // For power in (-400,350), we have that
  // (((152170 + 65536) * power ) >> 16);
  // is equal to
  //  floor(log(5**power)/log(2)) + power when power >= 0
  // and it is equal to
  //  ceil(log(5**-power)/log(2)) + power when power < 0
  //
  // The 65536 is (1<<16) and corresponds to
  // (65536 * power) >> 16 ---> power
  //
  // ((152170 * power ) >> 16) is equal to
  // floor(log(5**power)/log(2))
  //
  // Note that this is not magic: 152170/(1<<16) is
  // approximately equal to log(5)/log(2).
  // The 1<<16 value is a power of two; we could use a
  // larger power of 2 if we wanted to.
  //
  int64_t exponent = (((152170 + 65536) * power) >> 16) + 1024 + 63;


  // We want the most significant bit of i to be 1. Shift if needed.
  int lz = leading_zeroes(i);
  i <<= lz;


  // We are going to need to do some 64-bit arithmetic to get a precise product.
  // We use a table lookup approach.
  // It is safe because
  // power >= smallest_power
  // and power <= largest_power
  // We recover the mantissa of the power, it has a leading 1. It is always
  // rounded down.
  //
  // We want the most significant 64 bits of the product. We know
  // this will be non-zero because the most significant bit of i is
  // 1.
  const uint32_t index = 2 * uint32_t(power - simdjson::internal::smallest_power);
  // Optimization: It may be that materializing the index as a variable might confuse some compilers and prevent effective complex-addressing loads. (Done for code clarity.)
  //
  // The full_multiplication function computes the 128-bit product of two 64-bit words
  // with a returned value of type value128 with a "low component" corresponding to the
  // 64-bit least significant bits of the product and with a "high component" corresponding
  // to the 64-bit most significant bits of the product.
#if SIMDJSON_STATIC_REFLECTION
  simdjson::internal::value128 firstproduct = full_multiplication(i, simdjson::internal::powers_template<>::power_of_five_128[index]);
#else
  simdjson::internal::value128 firstproduct = full_multiplication(i, simdjson::internal::power_of_five_128[index]);
#endif

  // Both i and power_of_five_128[index] have their most significant bit set to 1 which
  // implies that the either the most or the second most significant bit of the product
  // is 1. We pack values in this manner for efficiency reasons: it maximizes the use
  // we make of the product. It also makes it easy to reason about the product: there
  // is 0 or 1 leading zero in the product.

  // Unless the least significant 9 bits of the high (64-bit) part of the full
  // product are all 1s, then we know that the most significant 55 bits are
  // exact and no further work is needed. Having 55 bits is necessary because
  // we need 53 bits for the mantissa but we have to have one rounding bit and
  // we can waste a bit if the most significant bit of the product is zero.
  if((firstproduct.high & 0x1FF) == 0x1FF) {
    // We want to compute i * 5^q, but only care about the top 55 bits at most.
    // Consider the scenario where q>=0. Then 5^q may not fit in 64-bits. Doing
    // the full computation is wasteful. So we do what is called a "truncated
    // multiplication".
    // We take the most significant 64-bits, and we put them in
    // power_of_five_128[index]. Usually, that's good enough to approximate i * 5^q
    // to the desired approximation using one multiplication. Sometimes it does not suffice.
    // Then we store the next most significant 64 bits in power_of_five_128[index + 1], and
    // then we get a better approximation to i * 5^q.
    //
    // That's for when q>=0. The logic for q<0 is somewhat similar but it is somewhat
    // more complicated.
    //
    // There is an extra layer of complexity in that we need more than 55 bits of
    // accuracy in the round-to-even scenario.
    //
    // The full_multiplication function computes the 128-bit product of two 64-bit words
    // with a returned value of type value128 with a "low component" corresponding to the
    // 64-bit least significant bits of the product and with a "high component" corresponding
    // to the 64-bit most significant bits of the product.
#if SIMDJSON_STATIC_REFLECTION
    simdjson::internal::value128 secondproduct = full_multiplication(i, simdjson::internal::powers_template<>::power_of_five_128[index + 1]);
#else
    simdjson::internal::value128 secondproduct = full_multiplication(i, simdjson::internal::power_of_five_128[index + 1]);
#endif
    firstproduct.low += secondproduct.high;
    if(secondproduct.high > firstproduct.low) { firstproduct.high++; }
    // As it has been proven by Noble Mushtak and Daniel Lemire in "Fast Number Parsing Without
    // Fallback" (https://arxiv.org/abs/2212.06644), at this point we are sure that the product
    // is sufficiently accurate, and more computation is not needed.
  }
  uint64_t lower = firstproduct.low;
  uint64_t upper = firstproduct.high;
  // The final mantissa should be 53 bits with a leading 1.
  // We shift it so that it occupies 54 bits with a leading 1.
  ///////
  uint64_t upperbit = upper >> 63;
  uint64_t mantissa = upper >> (upperbit + 9);
  lz += int(1 ^ upperbit);

  // Here we have mantissa < (1<<54).
  int64_t real_exponent = exponent - lz;
  if (simdjson_unlikely(real_exponent <= 0)) { // we have a subnormal?
    // Here have that real_exponent <= 0 so -real_exponent >= 0
    if(-real_exponent + 1 >= 64) { // if we have more than 64 bits below the minimum exponent, you have a zero for sure.
      d = negative ? -0.0 : 0.0;
      return true;
    }
    // next line is safe because -real_exponent + 1 < 0
    mantissa >>= -real_exponent + 1;
    // Thankfully, we can't have both "round-to-even" and subnormals because
    // "round-to-even" only occurs for powers close to 0.
    mantissa += (mantissa & 1); // round up
    mantissa >>= 1;
    // There is a weird scenario where we don't have a subnormal but just.
    // Suppose we start with 2.2250738585072013e-308, we end up
    // with 0x3fffffffffffff x 2^-1023-53 which is technically subnormal
    // whereas 0x40000000000000 x 2^-1023-53  is normal. Now, we need to round
    // up 0x3fffffffffffff x 2^-1023-53  and once we do, we are no longer
    // subnormal, but we can only know this after rounding.
    // So we only declare a subnormal if we are smaller than the threshold.
    real_exponent = (mantissa < (uint64_t(1) << 52)) ? 0 : 1;
    d = to_double(mantissa, real_exponent, negative);
    return true;
  }
  // We have to round to even. The "to even" part
  // is only a problem when we are right in between two floats
  // which we guard against.
  // If we have lots of trailing zeros, we may fall right between two
  // floating-point values.
  //
  // The round-to-even cases take the form of a number 2m+1 which is in (2^53,2^54]
  // times a power of two. That is, it is right between a number with binary significand
  // m and another number with binary significand m+1; and it must be the case
  // that it cannot be represented by a float itself.
  //
  // We must have that w * 10 ^q == (2m+1) * 2^p for some power of two 2^p.
  // Recall that 10^q = 5^q * 2^q.
  // When q >= 0, we must have that (2m+1) is divible by 5^q, so 5^q <= 2^54. We have that
  //  5^23 <=  2^54 and it is the last power of five to qualify, so q <= 23.
  // When q<0, we have  w  >=  (2m+1) x 5^{-q}.  We must have that w<2^{64} so
  // (2m+1) x 5^{-q} < 2^{64}. We have that 2m+1>2^{53}. Hence, we must have
  // 2^{53} x 5^{-q} < 2^{64}.
  // Hence we have 5^{-q} < 2^{11}$ or q>= -4.
  //
  // We require lower <= 1 and not lower == 0 because we could not prove that
  // that lower == 0 is implied; but we could prove that lower <= 1 is a necessary and sufficient test.
  if (simdjson_unlikely((lower <= 1) && (power >= -4) && (power <= 23) && ((mantissa & 3) == 1))) {
    if((mantissa  << (upperbit + 64 - 53 - 2)) ==  upper) {
      mantissa &= ~1;             // flip it so that we do not round up
    }
  }

  mantissa += mantissa & 1;
  mantissa >>= 1;

  // Here we have mantissa < (1<<53), unless there was an overflow
  if (mantissa >= (1ULL << 53)) {
    //////////
    // This will happen when parsing values such as 7.2057594037927933e+16
    ////////
    mantissa = (1ULL << 52);
    real_exponent++;
  }
  mantissa &= ~(1ULL << 52);
  // we have to check that real_exponent is in range, otherwise we bail out
  if (simdjson_unlikely(real_exponent > 2046)) {
    // We have an infinite value!!! We could actually throw an error here if we could.
    return false;
  }
  d = to_double(mantissa, real_exponent, negative);
  return true;
}

// We call a fallback floating-point parser that might be slow. Note
// it will accept JSON numbers, but the JSON spec. is more restrictive so
// before you call parse_float_fallback, you need to have validated the input
// string with the JSON grammar.
// It will return an error (false) if the parsed number is infinite.
// The string parsing itself always succeeds. We know that there is at least
// one digit.
static bool parse_float_fallback(const uint8_t *ptr, double *outDouble) {
  *outDouble = simdjson::internal::from_chars(reinterpret_cast<const char *>(ptr));
  // We do not accept infinite values.

  // Detecting finite values in a portable manner is ridiculously hard, ideally
  // we would want to do:
  // return !std::isfinite(*outDouble);
  // but that mysteriously fails under legacy/old libc++ libraries, see
  // https://github.com/simdjson/simdjson/issues/1286
  //
  // Therefore, fall back to this solution (the extra parens are there
  // to handle that max may be a macro on windows).
  return !(*outDouble > (std::numeric_limits<double>::max)() || *outDouble < std::numeric_limits<double>::lowest());
}

static bool parse_float_fallback(const uint8_t *ptr, const uint8_t *end_ptr, double *outDouble) {
  *outDouble = simdjson::internal::from_chars(reinterpret_cast<const char *>(ptr), reinterpret_cast<const char *>(end_ptr));
  // We do not accept infinite values.

  // Detecting finite values in a portable manner is ridiculously hard, ideally
  // we would want to do:
  // return !std::isfinite(*outDouble);
  // but that mysteriously fails under legacy/old libc++ libraries, see
  // https://github.com/simdjson/simdjson/issues/1286
  //
  // Therefore, fall back to this solution (the extra parens are there
  // to handle that max may be a macro on windows).
  return !(*outDouble > (std::numeric_limits<double>::max)() || *outDouble < std::numeric_limits<double>::lowest());
}

// check quickly whether the next 8 chars are made of digits
// at a glance, it looks better than Mula's
// http://0x80.pl/articles/swar-digits-validate.html
simdjson_inline bool is_made_of_eight_digits_fast(const uint8_t *chars) {
  uint64_t val;
  // this can read up to 7 bytes beyond the buffer size, but we require
  // SIMDJSON_PADDING of padding
  static_assert(7 <= SIMDJSON_PADDING, "SIMDJSON_PADDING must be bigger than 7");
  std::memcpy(&val, chars, 8);
  // a branchy method might be faster:
  // return (( val & 0xF0F0F0F0F0F0F0F0 ) == 0x3030303030303030)
  //  && (( (val + 0x0606060606060606) & 0xF0F0F0F0F0F0F0F0 ) ==
  //  0x3030303030303030);
  return (((val & 0xF0F0F0F0F0F0F0F0) |
           (((val + 0x0606060606060606) & 0xF0F0F0F0F0F0F0F0) >> 4)) ==
          0x3333333333333333);
}

template<typename I>
SIMDJSON_NO_SANITIZE_UNDEFINED // We deliberately allow overflow here and check later
simdjson_inline bool parse_digit(const uint8_t c, I &i) {
  const uint8_t digit = static_cast<uint8_t>(c - '0');
  if (digit > 9) {
    return false;
  }
  // PERF NOTE: multiplication by 10 is cheaper than arbitrary integer multiplication
  i = 10 * i + digit; // might overflow, we will handle the overflow later
  return true;
}

simdjson_inline bool is_digit(const uint8_t c) {
  return static_cast<uint8_t>(c - '0') <= 9;
}

simdjson_warn_unused simdjson_inline error_code parse_decimal_after_separator(simdjson_unused const uint8_t *const src, const uint8_t *&p, uint64_t &i, int64_t &exponent) {
  // we continue with the fiction that we have an integer. If the
  // floating point number is representable as x * 10^z for some integer
  // z that fits in 53 bits, then we will be able to convert back the
  // the integer into a float in a lossless manner.
  const uint8_t *const first_after_period = p;

#ifdef SIMDJSON_SWAR_NUMBER_PARSING
#if SIMDJSON_SWAR_NUMBER_PARSING
  // this helps if we have lots of decimals!
  // this turns out to be frequent enough.
  if (is_made_of_eight_digits_fast(p)) {
    i = i * 100000000 + parse_eight_digits_unrolled(p);
    p += 8;
  }
#endif // SIMDJSON_SWAR_NUMBER_PARSING
#endif // #ifdef SIMDJSON_SWAR_NUMBER_PARSING
  // Unrolling the first digit makes a small difference on some implementations (e.g. westmere)
  if (parse_digit(*p, i)) { ++p; }
  while (parse_digit(*p, i)) { p++; }
  exponent = first_after_period - p;
  // Decimal without digits (123.) is illegal
  if (exponent == 0) {
    return INVALID_NUMBER(src);
  }
  return SUCCESS;
}

simdjson_warn_unused simdjson_inline error_code parse_exponent(simdjson_unused const uint8_t *const src, const uint8_t *&p, int64_t &exponent) {
  // Exp Sign: -123.456e[-]78
  bool neg_exp = ('-' == *p);
  if (neg_exp || '+' == *p) { p++; } // Skip + as well

  // Exponent: -123.456e-[78]
  auto start_exp = p;
  int64_t exp_number = 0;
  while (parse_digit(*p, exp_number)) { ++p; }
  // It is possible for parse_digit to overflow.
  // In particular, it could overflow to INT64_MIN, and we cannot do - INT64_MIN.
  // Thus we *must* check for possible overflow before we negate exp_number.

  // Performance notes: it may seem like combining the two "simdjson_unlikely checks" below into
  // a single simdjson_unlikely path would be faster. The reasoning is sound, but the compiler may
  // not oblige and may, in fact, generate two distinct paths in any case. It might be
  // possible to do uint64_t(p - start_exp - 1) >= 18 but it could end up trading off
  // instructions for a simdjson_likely branch, an unconclusive gain.

  // If there were no digits, it's an error.
  if (simdjson_unlikely(p == start_exp)) {
    return INVALID_NUMBER(src);
  }
  // We have a valid positive exponent in exp_number at this point, except that
  // it may have overflowed.

  // If there were more than 18 digits, we may have overflowed the integer. We have to do
  // something!!!!
  if (simdjson_unlikely(p > start_exp+18)) {
    // Skip leading zeroes: 1e000000000000000000001 is technically valid and does not overflow
    while (*start_exp == '0') { start_exp++; }
    // 19 digits could overflow int64_t and is kind of absurd anyway. We don't
    // support exponents smaller than -999,999,999,999,999,999 and bigger
    // than 999,999,999,999,999,999.
    // We can truncate.
    // Note that 999999999999999999 is assuredly too large. The maximal ieee64 value before
    // infinity is ~1.8e308. The smallest subnormal is ~5e-324. So, actually, we could
    // truncate at 324.
    // Note that there is no reason to fail per se at this point in time.
    // E.g., 0e999999999999999999999 is a fine number.
    if (p > start_exp+18) { exp_number = 999999999999999999; }
  }
  // At this point, we know that exp_number is a sane, positive, signed integer.
  // It is <= 999,999,999,999,999,999. As long as 'exponent' is in
  // [-8223372036854775808, 8223372036854775808], we won't overflow. Because 'exponent'
  // is bounded in magnitude by the size of the JSON input, we are fine in this universe.
  // To sum it up: the next line should never overflow.
  exponent += (neg_exp ? -exp_number : exp_number);
  return SUCCESS;
}

simdjson_inline bool check_if_integer(const uint8_t *const src, size_t max_length) {
  const uint8_t *const srcend = src + max_length;
  bool negative = (*src == '-'); // we can always read at least one character after the '-'
  const uint8_t *p = src + uint8_t(negative);
  if(p == srcend) { return false; }
  if(*p == '0') {
    ++p;
    if(p == srcend) { return true; }
    if(jsoncharutils::is_not_structural_or_whitespace(*p)) { return false; }
    return true;
  }
  while(p != srcend && is_digit(*p)) { ++p; }
  if(p == srcend) { return true; }
  if(jsoncharutils::is_not_structural_or_whitespace(*p)) { return false; }
  return true;
}

simdjson_inline size_t significant_digits(const uint8_t * start_digits, size_t digit_count) {
  // It is possible that the integer had an overflow.
  // We have to handle the case where we have 0.0000somenumber.
  const uint8_t *start = start_digits;
  while ((*start == '0') || (*start == '.')) { ++start; }
  // we over-decrement by one when there is a '.'
  return digit_count - size_t(start - start_digits);
}

} // unnamed namespace

/** @private */
static error_code slow_float_parsing(simdjson_unused const uint8_t * src, double* answer) {
  if (parse_float_fallback(src, answer)) {
    return SUCCESS;
  }
  return INVALID_NUMBER(src);
}

/** @private */
template<typename W>
simdjson_warn_unused simdjson_inline error_code write_float(const uint8_t *const src, bool negative, uint64_t i, const uint8_t * start_digits, size_t digit_count, int64_t exponent, W &writer) {
  // If we frequently had to deal with long strings of digits,
  // we could extend our code by using a 128-bit integer instead
  // of a 64-bit integer. However, this is uncommon in practice.
  //
  // 9999999999999999999 < 2**64 so we can accommodate 19 digits.
  // If we have a decimal separator, then digit_count - 1 is the number of digits, but we
  // may not have a decimal separator!
  if (simdjson_unlikely(digit_count > 19 && significant_digits(start_digits, digit_count) > 19)) {
    // Ok, chances are good that we had an overflow!
    // this is almost never going to get called!!!
    // we start anew, going slowly!!!
    // This will happen in the following examples:
    // 10000000000000000000000000000000000000000000e+308
    // 3.1415926535897932384626433832795028841971693993751
    //
    // NOTE: We do not pass a reference to the to slow_float_parsing. If we passed our writer
    // reference to it, it would force it to be stored in memory, preventing the compiler from
    // picking it apart and putting into registers. i.e. if we pass it as reference,
    // it gets slow.
    double d;
    error_code error = slow_float_parsing(src, &d);
    writer.append_double(d);
    return error;
  }
  // NOTE: it's weird that the simdjson_unlikely() only wraps half the if, but it seems to get slower any other
  // way we've tried: https://github.com/simdjson/simdjson/pull/990#discussion_r448497331
  // To future reader: we'd love if someone found a better way, or at least could explain this result!
  if (simdjson_unlikely(exponent < simdjson::internal::smallest_power) || (exponent > simdjson::internal::largest_power)) {
    //
    // Important: smallest_power is such that it leads to a zero value.
    // Observe that 18446744073709551615e-343 == 0, i.e. (2**64 - 1) e -343 is zero
    // so something x 10^-343 goes to zero, but not so with  something x 10^-342.
    static_assert(simdjson::internal::smallest_power <= -342, "smallest_power is not small enough");
    //
    if((exponent < simdjson::internal::smallest_power) || (i == 0)) {
      // E.g. Parse "-0.0e-999" into the same value as "-0.0". See https://en.wikipedia.org/wiki/Signed_zero
      WRITE_DOUBLE(negative ? -0.0 : 0.0, src, writer);
      return SUCCESS;
    } else { // (exponent > largest_power) and (i != 0)
      // We have, for sure, an infinite value and simdjson refuses to parse infinite values.
      return INVALID_NUMBER(src);
    }
  }
  double d;
  if (!compute_float_64(exponent, i, negative, d)) {
    // we are almost never going to get here.
    if (!parse_float_fallback(src, &d)) { return INVALID_NUMBER(src); }
  }
  WRITE_DOUBLE(d, src, writer);
  return SUCCESS;
}

// parse the number at src
// define JSON_TEST_NUMBERS for unit testing
//
// It is assumed that the number is followed by a structural ({,},],[) character
// or a white space character. If that is not the case (e.g., when the JSON
// document is made of a single number), then it is necessary to copy the
// content and append a space before calling this function.
//
// Our objective is accurate parsing (ULP of 0) at high speed.
template<typename W>
simdjson_warn_unused simdjson_inline error_code parse_number(const uint8_t *const src, W &writer);

// for performance analysis, it is sometimes  useful to skip parsing
#ifdef SIMDJSON_SKIPNUMBERPARSING

template<typename W>
simdjson_warn_unused simdjson_inline error_code parse_number(const uint8_t *const, W &writer) {
  writer.append_s64(0);        // always write zero
  return SUCCESS;              // always succeeds
}

simdjson_unused simdjson_inline simdjson_result<uint64_t> parse_unsigned(const uint8_t * const src) noexcept { return 0; }
simdjson_unused simdjson_inline simdjson_result<int64_t> parse_integer(const uint8_t * const src) noexcept { return 0; }
simdjson_unused simdjson_inline simdjson_result<double> parse_double(const uint8_t * const src) noexcept { return 0; }
simdjson_unused simdjson_inline simdjson_result<uint64_t> parse_unsigned_in_string(const uint8_t * const src) noexcept { return 0; }
simdjson_unused simdjson_inline simdjson_result<int64_t> parse_integer_in_string(const uint8_t * const src) noexcept { return 0; }
simdjson_unused simdjson_inline simdjson_result<double> parse_double_in_string(const uint8_t * const src) noexcept { return 0; }
simdjson_unused simdjson_inline bool is_negative(const uint8_t * src) noexcept  { return false; }
simdjson_unused simdjson_inline simdjson_result<bool> is_integer(const uint8_t * src) noexcept  { return false; }
simdjson_unused simdjson_inline simdjson_result<number_type> get_number_type(const uint8_t * src) noexcept { return number_type::signed_integer; }
#else

// parse the number at src
// define JSON_TEST_NUMBERS for unit testing
//
// It is assumed that the number is followed by a structural ({,},],[) character
// or a white space character. If that is not the case (e.g., when the JSON
// document is made of a single number), then it is necessary to copy the
// content and append a space before calling this function.
//
// Our objective is accurate parsing (ULP of 0) at high speed.
template<typename W>
simdjson_warn_unused simdjson_inline error_code parse_number(const uint8_t *const src, W &writer) {
  //
  // Check for minus sign
  //
  bool negative = (*src == '-');
  const uint8_t *p = src + uint8_t(negative);

  //
  // Parse the integer part.
  //
  // PERF NOTE: we don't use is_made_of_eight_digits_fast because large integers like 123456789 are rare
  const uint8_t *const start_digits = p;
  uint64_t i = 0;
  while (parse_digit(*p, i)) { p++; }

  // If there were no digits, or if the integer starts with 0 and has more than one digit, it's an error.
  // Optimization note: size_t is expected to be unsigned.
  size_t digit_count = size_t(p - start_digits);
  if (digit_count == 0 || ('0' == *start_digits && digit_count > 1)) { return INVALID_NUMBER(src); }

  //
  // Handle floats if there is a . or e (or both)
  //
  int64_t exponent = 0;
  bool is_float = false;
  if ('.' == *p) {
    is_float = true;
    ++p;
    SIMDJSON_TRY( parse_decimal_after_separator(src, p, i, exponent) );
    digit_count = int(p - start_digits); // used later to guard against overflows
  }
  if (('e' == *p) || ('E' == *p)) {
    is_float = true;
    ++p;
    SIMDJSON_TRY( parse_exponent(src, p, exponent) );
  }
  if (is_float) {
    const bool dirty_end = jsoncharutils::is_not_structural_or_whitespace(*p);
    SIMDJSON_TRY( write_float(src, negative, i, start_digits, digit_count, exponent, writer) );
    if (dirty_end) { return INVALID_NUMBER(src); }
    return SUCCESS;
  }

  // The longest negative 64-bit number is 19 digits.
  // The longest positive 64-bit number is 20 digits.
  // We do it this way so we don't trigger this branch unless we must.
  size_t longest_digit_count = negative ? 19 : 20;
  if (digit_count > longest_digit_count) { return BIGINT_NUMBER(src); }
  if (digit_count == longest_digit_count) {
    if (negative) {
      // Anything negative above INT64_MAX+1 is invalid
      if (i > uint64_t(INT64_MAX)+1) { return BIGINT_NUMBER(src);  }
      WRITE_INTEGER(~i+1, src, writer);
      if (jsoncharutils::is_not_structural_or_whitespace(*p)) { return INVALID_NUMBER(src); }
      return SUCCESS;
    // Positive overflow check:
    // - A 20 digit number starting with 2-9 is overflow, because 18,446,744,073,709,551,615 is the
    //   biggest uint64_t.
    // - A 20 digit number starting with 1 is overflow if it is less than INT64_MAX.
    //   If we got here, it's a 20 digit number starting with the digit "1".
    // - If a 20 digit number starting with 1 overflowed (i*10+digit), the result will be smaller
    //   than 1,553,255,926,290,448,384.
    // - That is smaller than the smallest possible 20-digit number the user could write:
    //   10,000,000,000,000,000,000.
    // - Therefore, if the number is positive and lower than that, it's overflow.
    // - The value we are looking at is less than or equal to INT64_MAX.
    //
    }  else if (src[0] != uint8_t('1') || i <= uint64_t(INT64_MAX)) { return INVALID_NUMBER(src); }
  }

  // Write unsigned if it does not fit in a signed integer.
  if (i > uint64_t(INT64_MAX)) {
    WRITE_UNSIGNED(i, src, writer);
  } else {
#if SIMDJSON_MINUS_ZERO_AS_FLOAT
    if(i == 0 && negative) {
      // We have to write -0.0 instead of 0
      WRITE_DOUBLE(-0.0, src, writer);
    } else {
      WRITE_INTEGER(negative ? (~i+1) : i, src, writer);
    }
#else
  WRITE_INTEGER(negative ? (~i+1) : i, src, writer);
#endif
  }
  if (jsoncharutils::is_not_structural_or_whitespace(*p)) { return INVALID_NUMBER(src); }
  return SUCCESS;
}

// Inlineable functions
namespace {

// This table can be used to characterize the final character of an integer
// string. For JSON structural character and allowable white space characters,
// we return SUCCESS. For 'e', '.' and 'E', we return INCORRECT_TYPE. Otherwise
// we return NUMBER_ERROR.
// Optimization note: we could easily reduce the size of the table by half (to 128)
// at the cost of an extra branch.
// Optimization note: we want the values to use at most 8 bits (not, e.g., 32 bits):
static_assert(error_code(uint8_t(NUMBER_ERROR))== NUMBER_ERROR, "bad NUMBER_ERROR cast");
static_assert(error_code(uint8_t(SUCCESS))== SUCCESS, "bad NUMBER_ERROR cast");
static_assert(error_code(uint8_t(INCORRECT_TYPE))== INCORRECT_TYPE, "bad NUMBER_ERROR cast");

const uint8_t integer_string_finisher[256] = {
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, SUCCESS,
    SUCCESS,      NUMBER_ERROR,   NUMBER_ERROR, SUCCESS,      NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   SUCCESS,      NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, SUCCESS,
    NUMBER_ERROR, INCORRECT_TYPE, NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, SUCCESS,      NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, INCORRECT_TYPE,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, SUCCESS,        NUMBER_ERROR, SUCCESS,      NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, INCORRECT_TYPE, NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, SUCCESS,      NUMBER_ERROR,
    SUCCESS,      NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR, NUMBER_ERROR,   NUMBER_ERROR, NUMBER_ERROR, NUMBER_ERROR,
    NUMBER_ERROR};

// Parse any number from 0 to 18,446,744,073,709,551,615
simdjson_unused simdjson_inline simdjson_result<uint64_t> parse_unsigned(const uint8_t * const src) noexcept {
  const uint8_t *p = src;
  //
  // Parse the integer part.
  //
  // PERF NOTE: we don't use is_made_of_eight_digits_fast because large integers like 123456789 are rare
  const uint8_t *const start_digits = p;
  uint64_t i = 0;
  while (parse_digit(*p, i)) { p++; }

  // If there were no digits, or if the integer starts with 0 and has more than one digit, it's an error.
  // Optimization note: size_t is expected to be unsigned.
  size_t digit_count = size_t(p - start_digits);
  // The longest positive 64-bit number is 20 digits.
  // We do it this way so we don't trigger this branch unless we must.
  // Optimization note: the compiler can probably merge
  // ((digit_count == 0) || (digit_count > 20))
  // into a single  branch since digit_count is unsigned.
  if ((digit_count == 0) || (digit_count > 20)) { return INCORRECT_TYPE; }
  // Here digit_count > 0.
  if (('0' == *start_digits) && (digit_count > 1)) { return NUMBER_ERROR; }
  // We can do the following...
  // if (!jsoncharutils::is_structural_or_whitespace(*p)) {
  //  return (*p == '.' || *p == 'e' || *p == 'E') ? INCORRECT_TYPE : NUMBER_ERROR;
  // }
  // as a single table lookup:
  if (integer_string_finisher[*p] != SUCCESS) { return error_code(integer_string_finisher[*p]); }

  if (digit_count == 20) {
    // Positive overflow check:
    // - A 20 digit number starting with 2-9 is overflow, because 18,446,744,073,709,551,615 is the
    //   biggest uint64_t.
    // - A 20 digit number starting with 1 is overflow if it is less than INT64_MAX.
    //   If we got here, it's a 20 digit number starting with the digit "1".
    // - If a 20 digit number starting with 1 overflowed (i*10+digit), the result will be smaller
    //   than 1,553,255,926,290,448,384.
    // - That is smaller than the smallest possible 20-digit number the user could write:
    //   10,000,000,000,000,000,000.
    // - Therefore, if the number is positive and lower than that, it's overflow.
    // - The value we are looking at is less than or equal to INT64_MAX.
    //
    if (src[0] != uint8_t('1') || i <= uint64_t(INT64_MAX)) { return INCORRECT_TYPE; }
  }

  return i;
}


// Parse any number from 0 to 18,446,744,073,709,551,615
// Never read at src_end or beyond
simdjson_unused simdjson_inline simdjson_result<uint64_t> parse_unsigned(const uint8_t * const src, const uint8_t * const src_end) noexcept {
  const uint8_t *p = src;
  //
  // Parse the integer part.
  //
  // PERF NOTE: we don't use is_made_of_eight_digits_fast because large integers like 123456789 are rare
  const uint8_t *const start_digits = p;
  uint64_t i = 0;
  while ((p != src_end) && parse_digit(*p, i)) { p++; }

  // If there were no digits, or if the integer starts with 0 and has more than one digit, it's an error.
  // Optimization note: size_t is expected to be unsigned.
  size_t digit_count = size_t(p - start_digits);
  // The longest positive 64-bit number is 20 digits.
  // We do it this way so we don't trigger this branch unless we must.
  // Optimization note: the compiler can probably merge
  // ((digit_count == 0) || (digit_count > 20))
  // into a single  branch since digit_count is unsigned.
  if ((digit_count == 0) || (digit_count > 20)) { return INCORRECT_TYPE; }
  // Here digit_count > 0.
  if (('0' == *start_digits) && (digit_count > 1)) { return NUMBER_ERROR; }
  // We can do the following...
  // if (!jsoncharutils::is_structural_or_whitespace(*p)) {
  //  return (*p == '.' || *p == 'e' || *p == 'E') ? INCORRECT_TYPE : NUMBER_ERROR;
  // }
  // as a single table lookup:
  if ((p != src_end) && integer_string_finisher[*p] != SUCCESS) { return error_code(integer_string_finisher[*p]); }

  if (digit_count == 20) {
    // Positive overflow check:
    // - A 20 digit number starting with 2-9 is overflow, because 18,446,744,073,709,551,615 is the
    //   biggest uint64_t.
    // - A 20 digit number starting with 1 is overflow if it is less than INT64_MAX.
    //   If we got here, it's a 20 digit number starting with the digit "1".
    // - If a 20 digit number starting with 1 overflowed (i*10+digit), the result will be smaller
    //   than 1,553,255,926,290,448,384.
    // - That is smaller than the smallest possible 20-digit number the user could write:
    //   10,000,000,000,000,000,000.
    // - Therefore, if the number is positive and lower than that, it's overflow.
    // - The value we are looking at is less than or equal to INT64_MAX.
    //
    if (src[0] != uint8_t('1') || i <= uint64_t(INT64_MAX)) { return INCORRECT_TYPE; }
  }

  return i;
}

// Parse any number from 0 to 18,446,744,073,709,551,615
simdjson_unused simdjson_inline simdjson_result<uint64_t> parse_unsigned_in_string(const uint8_t * const src) noexcept {
  const uint8_t *p = src + 1;
  //
  // Parse the integer part.
  //
  // PERF NOTE: we don't use is_made_of_eight_digits_fast because large integers like 123456789 are rare
  const uint8_t *const start_digits = p;
  uint64_t i = 0;
  while (parse_digit(*p, i)) { p++; }

  // If there were no digits, or if the integer starts with 0 and has more than one digit, it's an error.
  // Optimization note: size_t is expected to be unsigned.
  size_t digit_count = size_t(p - start_digits);
  // The longest positive 64-bit number is 20 digits.
  // We do it this way so we don't trigger this branch unless we must.
  // Optimization note: the compiler can probably merge
  // ((digit_count == 0) || (digit_count > 20))
  // into a single  branch since digit_count is unsigned.
  if ((digit_count == 0) || (digit_count > 20)) { return INCORRECT_TYPE; }
  // Here digit_count > 0.
  if (('0' == *start_digits) && (digit_count > 1)) { return NUMBER_ERROR; }
  // We can do the following...
  // if (!jsoncharutils::is_structural_or_whitespace(*p)) {
  //  return (*p == '.' || *p == 'e' || *p == 'E') ? INCORRECT_TYPE : NUMBER_ERROR;
  // }
  // as a single table lookup:
  if (*p != '"') { return NUMBER_ERROR; }

  if (digit_count == 20) {
    // Positive overflow check:
    // - A 20 digit number starting with 2-9 is overflow, because 18,446,744,073,709,551,615 is the
    //   biggest uint64_t.
    // - A 20 digit number starting with 1 is overflow if it is less than INT64_MAX.
    //   If we got here, it's a 20 digit number starting with the digit "1".
    // - If a 20 digit number starting with 1 overflowed (i*10+digit), the result will be smaller
    //   than 1,553,255,926,290,448,384.
    // - That is smaller than the smallest possible 20-digit number the user could write:
    //   10,000,000,000,000,000,000.
    // - Therefore, if the number is positive and lower than that, it's overflow.
    // - The value we are looking at is less than or equal to INT64_MAX.
    //
    // Note: we use src[1] and not src[0] because src[0] is the quote character in this
    // instance.
    if (src[1] != uint8_t('1') || i <= uint64_t(INT64_MAX)) { return INCORRECT_TYPE; }
  }

  return i;
}

// Parse any number from  -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807
simdjson_unused simdjson_inline simdjson_result<int64_t> parse_integer(const uint8_t *src) noexcept {
  //
  // Check for minus sign
  //
  bool negative = (*src == '-');
  const uint8_t *p = src + uint8_t(negative);

  //
  // Parse the integer part.
  //
  // PERF NOTE: we don't use is_made_of_eight_digits_fast because large integers like 123456789 are rare
  const uint8_t *const start_digits = p;
  uint64_t i = 0;
  while (parse_digit(*p, i)) { p++; }

  // If there were no digits, or if the integer starts with 0 and has more than one digit, it's an error.
  // Optimization note: size_t is expected to be unsigned.
  size_t digit_count = size_t(p - start_digits);
  // We go from
  // -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807
  // so we can never represent numbers that have more than 19 digits.
  size_t longest_digit_count = 19;
  // Optimization note: the compiler can probably merge
  // ((digit_count == 0) || (digit_count > longest_digit_count))
  // into a single  branch since digit_count is unsigned.
  if ((digit_count == 0) || (digit_count > longest_digit_count)) { return INCORRECT_TYPE; }
  // Here digit_count > 0.
  if (('0' == *start_digits) && (digit_count > 1)) { return NUMBER_ERROR; }
  // We can do the following...
  // if (!jsoncharutils::is_structural_or_whitespace(*p)) {
  //  return (*p == '.' || *p == 'e' || *p == 'E') ? INCORRECT_TYPE : NUMBER_ERROR;
  // }
  // as a single table lookup:
  if(integer_string_finisher[*p] != SUCCESS) { return error_code(integer_string_finisher[*p]); }
  // Negative numbers have can go down to - INT64_MAX - 1 whereas positive numbers are limited to INT64_MAX.
  // Performance note: This check is only needed when digit_count == longest_digit_count but it is
  // so cheap that we might as well always make it.
  if(i > uint64_t(INT64_MAX) + uint64_t(negative)) { return INCORRECT_TYPE; }
  return negative ? (~i+1) : i;
}

// Parse any number from  -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807
// Never read at src_end or beyond
simdjson_unused simdjson_inline simdjson_result<int64_t> parse_integer(const uint8_t * const src, const uint8_t * const src_end) noexcept {
  //
  // Check for minus sign
  //
  if(src == src_end) { return NUMBER_ERROR; }
  bool negative = (*src == '-');
  const uint8_t *p = src + uint8_t(negative);

  //
  // Parse the integer part.
  //
  // PERF NOTE: we don't use is_made_of_eight_digits_fast because large integers like 123456789 are rare
  const uint8_t *const start_digits = p;
  uint64_t i = 0;
  while ((p != src_end) && parse_digit(*p, i)) { p++; }

  // If there were no digits, or if the integer starts with 0 and has more than one digit, it's an error.
  // Optimization note: size_t is expected to be unsigned.
  size_t digit_count = size_t(p - start_digits);
  // We go from
  // -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807
  // so we can never represent numbers that have more than 19 digits.
  size_t longest_digit_count = 19;
  // Optimization note: the compiler can probably merge
  // ((digit_count == 0) || (digit_count > longest_digit_count))
  // into a single  branch since digit_count is unsigned.
  if ((digit_count == 0) || (digit_count > longest_digit_count)) { return INCORRECT_TYPE; }
  // Here digit_count > 0.
  if (('0' == *start_digits) && (digit_count > 1)) { return NUMBER_ERROR; }
  // We can do the following...
  // if (!jsoncharutils::is_structural_or_whitespace(*p)) {
  //  return (*p == '.' || *p == 'e' || *p == 'E') ? INCORRECT_TYPE : NUMBER_ERROR;
  // }
  // as a single table lookup:
  if((p != src_end) && integer_string_finisher[*p] != SUCCESS) { return error_code(integer_string_finisher[*p]); }
  // Negative numbers have can go down to 