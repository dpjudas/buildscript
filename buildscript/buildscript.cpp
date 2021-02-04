
#include <iostream>
#include <vector>
#include <map>
#include <string>
#include "file.h"
#include "buildscript.h"

BuildScript::BuildScript(const std::string& exe_path)
{
	initV8(exe_path);
	createIsolate();
	createContext();
}

BuildScript::~BuildScript()
{
	using namespace v8;
	modules.clear();
	persistent_context.Reset();
	isolate->Dispose();
	array_buffer_allocator.reset();
	V8::Dispose();
	V8::ShutdownPlatform();
}

int BuildScript::run(const std::string& scriptname)
{
	using namespace v8;

	Isolate::Scope isolate_scope(isolate);
	HandleScope handle_scope(isolate);
	Local<Context> context = persistent_context.Get(isolate);
	Context::Scope context_scope(context);
	TryCatch try_catch(isolate);

	Local<v8::Module> module = loadModule(context, scriptname).ToLocalChecked();
	Maybe<bool> bresult = module->InstantiateModule(context, resolveModule);
	if (bresult.IsNothing())
	{
		reportException(&try_catch);
		return 1;
	}
	if (!bresult.FromJust())
	{
		std::cout << "Could not instantiate module" << std::endl;
		return 1;
	}
	if (loadError)
	{
		return 1;
	}
	Local<Value> result;
	if (!module->Evaluate(context).ToLocal(&result))
	{
		reportException(&try_catch);
		return 1;
	}

	return 0;
}

void BuildScript::reportException(v8::TryCatch* try_catch)
{
	using namespace v8;

	HandleScope handle_scope(isolate);
	String::Utf8Value exception(isolate, try_catch->Exception());
	std::string exception_string(*exception, exception.length());
	Local<v8::Message> message = try_catch->Message();
	if (message.IsEmpty())
	{
		std::cout << exception_string.c_str() << std::endl;
	}
	else
	{
		String::Utf8Value filename(isolate, message->GetScriptOrigin().ResourceName());
		Local<v8::Context> context(isolate->GetCurrentContext());
		std::string filename_string(*filename, filename.length());
		int linenum = message->GetLineNumber(context).FromJust();
		std::cout << filename_string.c_str() << ":" << linenum << ": " << exception_string.c_str() << std::endl;

		v8::String::Utf8Value sourceline(isolate, message->GetSourceLine(context).ToLocalChecked());
		std::string sourceline_string(*sourceline, sourceline.length());
		std::cout << sourceline_string.c_str() << std::endl;

		int start = message->GetStartColumn(context).FromJust();
		int end = message->GetEndColumn(context).FromJust();
		for (int i = 0; i < start; i++)
			std::cout << " ";
		for (int i = start; i < end; i++)
			std::cout << "^";
		std::cout << std::endl;

		Local<v8::Value> stack_trace_string;
		if (try_catch->StackTrace(context).ToLocal(&stack_trace_string) && stack_trace_string->IsString() && stack_trace_string.As<v8::String>()->Length() > 0)
		{
			String::Utf8Value stack_trace(isolate, stack_trace_string);
			std::string stack_trace_string(*stack_trace, stack_trace.length());
			std::cout << stack_trace_string.c_str() << std::endl;
		}
	}
}

void BuildScript::initV8(const std::string& exe_path)
{
	using namespace v8;
	V8::InitializeICUDefaultLocation(exe_path.c_str());
	V8::InitializeExternalStartupData(exe_path.c_str());
	platform = platform::NewDefaultPlatform();
	V8::InitializePlatform(platform.get());
	V8::Initialize();
}

void BuildScript::createIsolate()
{
	using namespace v8;
	array_buffer_allocator.reset(ArrayBuffer::Allocator::NewDefaultAllocator());
	Isolate::CreateParams create_params;
	create_params.array_buffer_allocator = array_buffer_allocator.get();
	isolate = Isolate::New(create_params);
}

void BuildScript::createContext()
{
	using namespace v8;
	Isolate::Scope isolate_scope(isolate);
	HandleScope handle_scope(isolate);

	Local<ObjectTemplate> global = ObjectTemplate::New(isolate);
	global->Set(isolate, "__fileWriteAllText", FunctionTemplate::New(isolate, &BuildScript::fileWriteAllText));
	global->Set(isolate, "__fileWriteAllBytes", FunctionTemplate::New(isolate, &BuildScript::fileWriteAllBytes));
	global->Set(isolate, "__fileReadAllBytes", FunctionTemplate::New(isolate, &BuildScript::fileReadAllBytes));
	global->Set(isolate, "__fileReadAllText", FunctionTemplate::New(isolate, &BuildScript::fileReadAllText));
	global->Set(isolate, "__fileGetLastWriteTime", FunctionTemplate::New(isolate, &BuildScript::fileGetLastWriteTime));
	global->Set(isolate, "__directoryFolders", FunctionTemplate::New(isolate, &BuildScript::directoryFolders));
	global->Set(isolate, "__directoryFiles", FunctionTemplate::New(isolate, &BuildScript::directoryFiles));
	global->Set(isolate, "__processRun", FunctionTemplate::New(isolate, &BuildScript::processRun));

	Local<Context> context = Context::New(isolate, nullptr, global);
	context->SetAlignedPointerInEmbedderData(1, this);
	persistent_context = UniquePersistent<Context>(isolate, context);
}

void BuildScript::fileWriteAllText(const v8::FunctionCallbackInfo<v8::Value>& args)
{
	using namespace v8;

	HandleScope handle_scope(args.GetIsolate());

	try
	{
		if (args.Length() != 2)
			throw std::runtime_error("Bad parameters");

		String::Utf8Value filename(args.GetIsolate(), args[0]);
		if (*filename == nullptr)
			throw std::runtime_error("Bad parameters");

		String::Utf8Value text(args.GetIsolate(), args[1]);
		if (*text == nullptr)
			throw std::runtime_error("Bad parameters");

		File::write_all_text(std::string(*filename, filename.length()), std::string(*text, text.length()));
	}
	catch (const std::exception& e)
	{
		args.GetIsolate()->ThrowException(String::NewFromUtf8(args.GetIsolate(), e.what()).ToLocalChecked());
	}
}

void BuildScript::fileWriteAllBytes(const v8::FunctionCallbackInfo<v8::Value>& args)
{
	using namespace v8;
	HandleScope handle_scope(args.GetIsolate());
	try
	{
	}
	catch (const std::exception& e)
	{
		args.GetIsolate()->ThrowException(String::NewFromUtf8(args.GetIsolate(), e.what()).ToLocalChecked());
	}
}

void BuildScript::fileReadAllBytes(const v8::FunctionCallbackInfo<v8::Value>& args)
{
	using namespace v8;
	HandleScope handle_scope(args.GetIsolate());
	try
	{
	}
	catch (const std::exception& e)
	{
		args.GetIsolate()->ThrowException(String::NewFromUtf8(args.GetIsolate(), e.what()).ToLocalChecked());
	}
}

void BuildScript::fileReadAllText(const v8::FunctionCallbackInfo<v8::Value>& args)
{
	using namespace v8;
	HandleScope handle_scope(args.GetIsolate());
	try
	{
	}
	catch (const std::exception& e)
	{
		args.GetIsolate()->ThrowException(String::NewFromUtf8(args.GetIsolate(), e.what()).ToLocalChecked());
	}
}

void BuildScript::fileGetLastWriteTime(const v8::FunctionCallbackInfo<v8::Value>& args)
{
	using namespace v8;
	HandleScope handle_scope(args.GetIsolate());
	try
	{
		if (args.Length() != 1)
			throw std::runtime_error("Bad parameters");

		String::Utf8Value filename(args.GetIsolate(), args[0]);
		if (*filename == nullptr)
			throw std::runtime_error("Bad parameters");

		args.GetReturnValue().Set((double)File::get_last_write_time(std::string(*filename, filename.length())));
	}
	catch (const std::exception& e)
	{
		args.GetIsolate()->ThrowException(String::NewFromUtf8(args.GetIsolate(), e.what()).ToLocalChecked());
	}
}

void BuildScript::directoryFolders(const v8::FunctionCallbackInfo<v8::Value>& args)
{
	using namespace v8;
	HandleScope handle_scope(args.GetIsolate());
	try
	{
	}
	catch (const std::exception& e)
	{
		args.GetIsolate()->ThrowException(String::NewFromUtf8(args.GetIsolate(), e.what()).ToLocalChecked());
	}
}

void BuildScript::directoryFiles(const v8::FunctionCallbackInfo<v8::Value>& args)
{
	using namespace v8;
	HandleScope handle_scope(args.GetIsolate());
	try
	{
	}
	catch (const std::exception& e)
	{
		args.GetIsolate()->ThrowException(String::NewFromUtf8(args.GetIsolate(), e.what()).ToLocalChecked());
	}
}

void BuildScript::processRun(const v8::FunctionCallbackInfo<v8::Value>& args)
{
	using namespace v8;
	HandleScope handle_scope(args.GetIsolate());
	try
	{
		if (args.Length() != 1)
			throw std::runtime_error("Bad parameters");

		String::Utf8Value filename(args.GetIsolate(), args[0]);
		if (*filename == nullptr)
			throw std::runtime_error("Bad parameters");

		int retcode = std::system(std::string(*filename, filename.length()).c_str());
		args.GetReturnValue().Set(retcode);
	}
	catch (const std::exception& e)
	{
		args.GetIsolate()->ThrowException(String::NewFromUtf8(args.GetIsolate(), e.what()).ToLocalChecked());
	}
}

v8::MaybeLocal<v8::Module> BuildScript::loadModule(v8::Local<v8::Context> context, std::string moduleName)
{
	using namespace v8;

	Isolate::Scope isolate_scope(context->GetIsolate());
	EscapableHandleScope handle_scope(context->GetIsolate());
	Context::Scope context_scope(context);
	TryCatch try_catch(isolate);

	bool alreadyLoaded = (modules.find(moduleName) != modules.end());
	auto& module = modules[moduleName];
	if (!module.IsEmpty())
		return handle_scope.Escape(module.Get(context->GetIsolate()));
	else if (alreadyLoaded)
		return {};

	std::string text;
	try
	{
		text = File::read_all_text(moduleName);
	}
	catch (const std::exception& e)
	{
		std::cout << e.what() << std::endl;
		loadError = true;
		return {};
	}

	Local<String> resource_name;
	if (!String::NewFromUtf8(isolate, moduleName.c_str()).ToLocal(&resource_name))
	{
		reportException(&try_catch);
		loadError = true;
		return {};
	}

	Local<String> source;
	if (!String::NewFromUtf8(isolate, text.c_str()).ToLocal(&source))
	{
		reportException(&try_catch);
		loadError = true;
		return {};
	}

	ScriptOrigin origin(isolate, resource_name, 0, 0, false, -1, {}, false, false, true, {});
	ScriptCompiler::Source src(source, origin);

	Local<Module> compiled_module;
	if (!ScriptCompiler::CompileModule(isolate, &src).ToLocal(&compiled_module))
	{
		reportException(&try_catch);
		loadError = true;
		return {};
	}

	module = UniquePersistent<Module>(context->GetIsolate(), compiled_module);
	return handle_scope.Escape(compiled_module);
}

v8::MaybeLocal<v8::Module> BuildScript::resolveModule(v8::Local<v8::Context> context, v8::Local<v8::String> specifier, v8::Local<v8::FixedArray> import_assertions, v8::Local<v8::Module> referrer)
{
	using namespace v8;
	BuildScript* self = (BuildScript*)context->GetAlignedPointerFromEmbedderData(1);
	Isolate::Scope isolate_scope(context->GetIsolate());
	EscapableHandleScope handle_scope(context->GetIsolate());
	Context::Scope context_scope(context);
	String::Utf8Value utf8(context->GetIsolate(), specifier);
	std::string moduleName(*utf8, utf8.length());
	return handle_scope.EscapeMaybe(self->loadModule(context, moduleName));
};

int main(int argc, char** argv)
{
	try
	{
		BuildScript bscript(argv[0]);
		if (argc == 2)
			return bscript.run(FilePath::combine(argv[1], "buildscript.js"));
		else
			return bscript.run("buildscript.js");
	}
	catch (const std::exception& e)
	{
		std::cout << e.what() << std::endl;
		return 255;
	}
}
