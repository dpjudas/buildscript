# buildscript
Buildscript is a make/build tool that uses Javascript modules as its scripting language.

Here is a simple example of how such a build script might look like:

```cs
import { VSSolution, VSSolutionConfiguration, VSCppProject, VSCppProjectConfiguration, VSCppProjectFilter } from "vsgenerator.js"

var sourceFiles = [
    "buildscript.cpp",
    "thirdparty/duktape/duktape.c"
];

var headerFiles = [
    "thirdparty/duktape/duktape.h",
    "thirdparty/duktape/duk_config.h"
];

var extraFiles = [
    "vsgenerator.js"
];

var includeDirs = [
    "$(SolutionDir)",
    "$(SolutionDir)thirdparty/duktape"
];

var defines = [
    "WIN32",
    "_DEBUG",
    "_CONSOLE"
];

var debugConfig = new VSCppProjectConfiguration("Debug", "x64");
debugConfig.general.useDebugLibraries = "true";
debugConfig.general.wholeProgramOptimization = "false";
debugConfig.general.linkIncremental = "true";
debugConfig.clCompile.preprocessorDefinitions = debugConfig.clCompile.preprocessorDefinitions.concat(defines);
debugConfig.clCompile.functionLevelLinking = "false";
debugConfig.clCompile.intrinsicFunctions = "false";
debugConfig.clCompile.runtimeLibrary = "MultiThreadedDebug";
debugConfig.clCompile.additionalIncludeDirectories = debugConfig.clCompile.additionalIncludeDirectories.concat(includeDirs);

var releaseConfig = new VSCppProjectConfiguration("Release", "x64");
releaseConfig.clCompile.preprocessorDefinitions = releaseConfig.clCompile.preprocessorDefinitions.concat(defines);
releaseConfig.clCompile.additionalIncludeDirectories = releaseConfig.clCompile.additionalIncludeDirectories.concat(includeDirs);

var project = new VSCppProject("buildscriptexample");
project.configurations.push(debugConfig);
project.configurations.push(releaseConfig);
project.sourceFiles = project.sourceFiles.concat(sourceFiles);
project.headerFiles = project.headerFiles.concat(headerFiles);
project.extraFiles = project.extraFiles.concat(extraFiles);

var solution = new VSSolution("buildscriptexample");
solution.configurations.push(new VSSolutionConfiguration("Debug", "x64"));
solution.configurations.push(new VSSolutionConfiguration("Release", "x64"));
solution.projects.push(project);
solution.generate();
```
