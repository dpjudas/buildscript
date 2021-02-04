#pragma once

#include "javascript.h"

class BuildScript
{
public:
	BuildScript(const std::string& exe_path);
	~BuildScript();

	int run(const std::string& scriptname);

private:
	void initV8(const std::string& exe_path);
	void createIsolate();
	void createContext();
	void reportException(v8::TryCatch* try_catch);

	static void fileWriteAllText(const v8::FunctionCallbackInfo<v8::Value>& args);
	static void fileWriteAllBytes(const v8::FunctionCallbackInfo<v8::Value>& args);
	static void fileReadAllBytes(const v8::FunctionCallbackInfo<v8::Value>& args);
	static void fileReadAllText(const v8::FunctionCallbackInfo<v8::Value>& args);
	static void fileGetLastWriteTime(const v8::FunctionCallbackInfo<v8::Value>& args);
	static void directoryFolders(const v8::FunctionCallbackInfo<v8::Value>& args);
	static void directoryFiles(const v8::FunctionCallbackInfo<v8::Value>& args);
	static void processRun(const v8::FunctionCallbackInfo<v8::Value>& args);

	v8::MaybeLocal<v8::Module> loadModule(v8::Local<v8::Context> context, std::string moduleName);
	static v8::MaybeLocal<v8::Module> resolveModule(v8::Local<v8::Context> context, v8::Local<v8::String> specifier, v8::Local<v8::FixedArray> import_assertions, v8::Local<v8::Module> referrer);

	std::unique_ptr<v8::Platform> platform;
	std::unique_ptr<v8::ArrayBuffer::Allocator> array_buffer_allocator;
	v8::Isolate* isolate = nullptr;
	v8::UniquePersistent<v8::Context> persistent_context;
	std::map<std::string, v8::UniquePersistent<v8::Module>> modules;
	bool loadError = false;
};
