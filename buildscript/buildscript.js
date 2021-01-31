
import { VSSolution, VSSolutionConfiguration, VSCppProject, VSCppProjectConfiguration, VSCppProjectFilter } from "vsgenerator.js"

var sourceFiles = [
    "buildscript.cpp",
    "..\\thirdparty\\duktape\\duktape.c"
];

var headerFiles = [
    "..\\thirdparty\\duktape\\duktape.h",
    "..\\thirdparty\\duktape\\duk_config.h"
];

var extraFiles = [
    "vsgenerator.js"
];

var debugConfig = new VSCppProjectConfiguration("Debug", "x64");
debugConfig.general.useDebugLibraries = "true";
debugConfig.general.wholeProgramOptimization = "false";
debugConfig.general.linkIncremental = "true";
debugConfig.clCompile.preprocessorDefinitions.push("WIN32", "_DEBUG", "_CONSOLE");
debugConfig.clCompile.functionLevelLinking = "false";
debugConfig.clCompile.intrinsicFunctions = "false";
debugConfig.clCompile.runtimeLibrary = "MultiThreadedDebug";
debugConfig.clCompile.additionalIncludeDirectories.push("$(SolutionDir)", "$(SolutionDir)thirdparty\\duktape");

var releaseConfig = new VSCppProjectConfiguration("Release", "x64");
releaseConfig.clCompile.preprocessorDefinitions.push("WIN32", "_RELEASE", "_CONSOLE");
releaseConfig.clCompile.additionalIncludeDirectories.push("$(SolutionDir)", "$(SolutionDir)thirdparty\\duktape");

var project = new VSCppProject("buildscript2");
project.configurations.push(debugConfig);
project.configurations.push(releaseConfig);
project.sourceFiles = project.sourceFiles.concat(sourceFiles);
project.headerFiles = project.headerFiles.concat(headerFiles);
project.extraFiles = project.extraFiles.concat(extraFiles);

var solution = new VSSolution("buildscript2");
solution.configurations.push(new VSSolutionConfiguration("Debug", "x64"));
solution.configurations.push(new VSSolutionConfiguration("Release", "x64"));
solution.projects.push(project);
solution.generate();
