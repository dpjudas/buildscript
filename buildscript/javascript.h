#pragma once

#define V8_COMPRESS_POINTERS
#include <libplatform/libplatform.h>
#include <v8.h>

#ifdef _MSC_VER
#pragma comment(lib, "v8_monolith.lib")
#pragma comment(lib, "dbghelp.lib")
#pragma comment(lib, "winmm.lib")
#endif
