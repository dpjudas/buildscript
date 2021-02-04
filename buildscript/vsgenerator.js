
import { File } from "file.js";
export { VSSolution, VSSolutionConfiguration, VSCppProject, VSCppProjectConfiguration, VSCppProjectFilter };

class LineWriter {
    constructor() {
        this.lines = [];
    }

	writeLine(text) {
        this.lines.push(text);
	}

	save(filename) {
        var text = this.lines.reduce((accumulator, value) => accumulator + value + "\r\n", "");
        File.writeAllText(filename, text);
	}
}

class VSSolution {
    constructor(name) {
        this.visualStudioVersion = "16.0.30621.155";
        this.minimumVisualStudioVersion = "10.0.40219.1";
        this.solutionGuid = "B61D85A2-54FA-468F-9672-7BF3012676B4";
        this.projects = [];
        this.configurations = [];
        this.name = name;
    }

    generate() {
        var generator = new VSGenerator();
        generator.writeSolution(this);
        this.projects.forEach(project => {
            generator.writeProject(project);
        });
    }
}

class VSSolutionConfiguration {
    constructor(name, platform) {
        if (name == undefined) name = "Release";
        if (platform == undefined) platform = "x64";

        this.platform = platform;
        this.name = name;
    }
}

class VSCppProjectConfiguration {
    constructor(name, platform) {
        if (name == undefined) name = "Release";
        if (platform == undefined) platform = "x64";

        this.platform = platform;
        this.name = name;
        this.general = {
            configurationType: "Application",
            useDebugLibraries: "false",
            platformToolset: "v142",
            characterSet: "Unicode",
            wholeProgramOptimization: "true",
            linkIncremental: "false",
            outDir: "$(SolutionDir)Build\\$(Configuration)\\$(Platform)\\bin\\",
            intDir: "$(SolutionDir)Build\\$(Configuration)\\$(Platform)\\obj\\"
        };
        this.clCompile = {
            warningLevel: "Level3",
            functionLevelLinking: "true",
            intrinsicFunctions: "true",
            sdlCheck: "true",
            preprocessorDefinitions: [],
            conformanceMode: "true",
            additionalIncludeDirectories: [],
            runtimeLibrary: "MultiThreaded"
        }
        this.link = {
            subSystem: "Console",
            enableCOMDATFolding: "true",
            optimizeReferences: "true",
            generateDebugInformation: "true"
        }
    }
}

class VSCppProjectFilter {
    constructor(name, guid) {
        this.name = name;
        this.guid = guid;
        this.sourceFiles = [];
        this.headerFiles = [];
        this.extraFiles = [];
    }
}

class VSCppProject {
    constructor(name) {
        this.name = name;
        this.typeGuid = "8BC9CEB8-8B4A-11D0-8D11-00A0C91BC942";
        this.projectGuid = "B9C229A1-BDC0-4C10-973A-694146B89016";
        this.vcProjectVersion = "16.0";
        this.windowsTargetPlatformVersion = "10.0";
        this.configurations = [];
        this.sourceFiles = [];
        this.headerFiles = [];
        this.extraFiles = [];
        this.filters = [];
    }
}

class VSGenerator {
	writeSolution(solution) {
		var output = new LineWriter();
		output.writeLine("Microsoft Visual Studio Solution File, Format Version 12.00");
		output.writeLine("# Visual Studio Version 16");
		output.writeLine("VisualStudioVersion = " + solution.visualStudioVersion);
		output.writeLine("MinimumVisualStudioVersion = " + solution.minimumVisualStudioVersion);
        solution.projects.forEach(project => {
		    output.writeLine("Project(\"" + project.typeGuid + "\") = \"" + project.name + "\", \"" + project.name + "\\" + project.name + ".vcxproj\", \"" + project.projectGuid + "\")");
		    output.writeLine("EndProject");
        });
		output.writeLine("Global");
		output.writeLine("\tGlobalSection(SolutionConfigurationPlatforms) = preSolution");
        solution.configurations.forEach(configuration => {
	    	output.writeLine("\t\t" + configuration.name + "|" + configuration.platform + " = " + configuration.name + "|" + configuration.platform);
        });
		output.writeLine("\tEndGlobalSection");
		output.writeLine("\tGlobalSection(ProjectConfigurationPlatforms) = postSolution");
        solution.projects.forEach(project => {
            project.configurations.forEach(configuration => {
    	    	output.writeLine("\t\t{" + project.projectGuid + "}." + configuration.name + "|" + configuration.platform + ".ActiveCfg = " + configuration.name + "|" + configuration.platform);
	    	    output.writeLine("\t\t{" + project.projectGuid + "}." + configuration.name + "|" + configuration.platform + ".Build.0 = " + configuration.name + "|" + configuration.platform);
            });
        });
		output.writeLine("\tEndGlobalSection");
		output.writeLine("\tGlobalSection(SolutionProperties) = preSolution");
		output.writeLine("\t\tHideSolutionNode = FALSE");
		output.writeLine("\tEndGlobalSection");
		output.writeLine("\tGlobalSection(ExtensibilityGlobals) = postSolution");
		output.writeLine("\t\tSolutionGuid = {" + solution.solutionGuid + "}");
		output.writeLine("\tEndGlobalSection");
		output.writeLine("EndGlobal");
		output.save(solution.name + ".sln");
	}

	writeProject(project) {
		var output = new LineWriter();
        output.writeLine("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
        output.writeLine("<Project DefaultTargets=\"Build\" xmlns=\"http://schemas.microsoft.com/developer/msbuild/2003\">");
        output.writeLine("  <ItemGroup Label=\"ProjectConfigurations\">");
        project.configurations.forEach(configuration => {
            output.writeLine("    <ProjectConfiguration Include=\"" + configuration.name + "|" + configuration.platform + "\">");
            output.writeLine("      <Configuration>" + configuration.name + "</Configuration>");
            output.writeLine("      <Platform>" + configuration.platform + "</Platform>");
            output.writeLine("    </ProjectConfiguration>");
        });
        output.writeLine("  </ItemGroup>");
        output.writeLine("  <PropertyGroup Label=\"Globals\">");
        output.writeLine("    <VCProjectVersion>" + project.vcProjectVersion + "</VCProjectVersion>");
        output.writeLine("    <Keyword>Win32Proj</Keyword>");
        output.writeLine("    <ProjectGuid>{" + project.projectGuid.toLowerCase() + "}</ProjectGuid>");
        output.writeLine("    <RootNamespace>" + project.name + "</RootNamespace>");
        output.writeLine("    <WindowsTargetPlatformVersion>" + project.windowsTargetPlatformVersion + "</WindowsTargetPlatformVersion>");
        output.writeLine("  </PropertyGroup>");
        output.writeLine("  <Import Project=\"$(VCTargetsPath)\\Microsoft.Cpp.Default.props\" />");
        project.configurations.forEach(configuration => {
            output.writeLine("  <PropertyGroup Condition=\"'$(Configuration)|$(Platform)'=='" + configuration.name + "|" + configuration.platform + "'\" Label=\"Configuration\">");
            output.writeLine("    <ConfigurationType>" + configuration.general.configurationType + "</ConfigurationType>");
            output.writeLine("    <UseDebugLibraries>" + configuration.general.useDebugLibraries + "</UseDebugLibraries>");
            output.writeLine("    <PlatformToolset>" + configuration.general.platformToolset + "</PlatformToolset>");
            output.writeLine("    <WholeProgramOptimization>" + configuration.general.wholeProgramOptimization + "</WholeProgramOptimization>");
            output.writeLine("    <CharacterSet>" + configuration.general.characterSet + "</CharacterSet>");
            output.writeLine("  </PropertyGroup>");
        });
        output.writeLine("  <Import Project=\"$(VCTargetsPath)\\Microsoft.Cpp.props\" />");
        output.writeLine("  <ImportGroup Label=\"ExtensionSettings\">");
        output.writeLine("  </ImportGroup>");
        output.writeLine("  <ImportGroup Label=\"Shared\">");
        output.writeLine("  </ImportGroup>");
        project.configurations.forEach(configuration => {
            output.writeLine("  <ImportGroup Label=\"PropertySheets\" Condition=\"'$(Configuration)|$(Platform)'=='" + configuration.name + "|" + configuration.platform + "'\">");
            output.writeLine("    <Import Project=\"$(UserRootDir)\\Microsoft.Cpp.$(Platform).user.props\" Condition=\"exists('$(UserRootDir)\\Microsoft.Cpp.$(Platform).user.props')\" Label=\"LocalAppDataPlatform\" />");
            output.writeLine("  </ImportGroup>");
        });
        output.writeLine("  <PropertyGroup Label=\"UserMacros\" />");
        project.configurations.forEach(configuration => {
            output.writeLine("  <PropertyGroup Condition=\"'$(Configuration)|$(Platform)'=='" + configuration.name + "|" + configuration.platform + "'\">");
            output.writeLine("    <LinkIncremental>" + configuration.general.linkIncremental + "</LinkIncremental>");
            output.writeLine("    <OutDir>" + configuration.general.outDir + "</OutDir>");
            output.writeLine("    <IntDir>" + configuration.general.outDir + "</IntDir>");
            output.writeLine("  </PropertyGroup>");
        });
        project.configurations.forEach(configuration => {
            var preprocessorDefinitions = configuration.clCompile.preprocessorDefinitions.reduce((accumulator,value) => accumulator + ";" + value) + ";%(PreprocessorDefinitions)";
            var additionalIncludeDirectories = configuration.clCompile.additionalIncludeDirectories.reduce((accumulator,value) => accumulator + ";" + value) + "%(AdditionalIncludeDirectories)";

            output.writeLine("  <ItemDefinitionGroup Condition=\"'$(Configuration)|$(Platform)'=='" + configuration.name + "|" + configuration.platform + "'\">");
            output.writeLine("    <ClCompile>");
            output.writeLine("      <WarningLevel>" + configuration.clCompile.warningLevel + "</WarningLevel>");
            output.writeLine("      <FunctionLevelLinking>" + configuration.clCompile.functionLevelLinking + "</FunctionLevelLinking>");
            output.writeLine("      <IntrinsicFunctions>" + configuration.clCompile.intrinsicFunctions + "</IntrinsicFunctions>");
            output.writeLine("      <SDLCheck>" + configuration.clCompile.sdlCheck + "</SDLCheck>");
            output.writeLine("      <PreprocessorDefinitions>" + preprocessorDefinitions + "</PreprocessorDefinitions>");
            output.writeLine("      <ConformanceMode>" + configuration.clCompile.conformanceMode + "</ConformanceMode>");
            output.writeLine("      <AdditionalIncludeDirectories>" + additionalIncludeDirectories + "</AdditionalIncludeDirectories>");
            output.writeLine("      <RuntimeLibrary>" + configuration.clCompile.runtimeLibrary + "</RuntimeLibrary>");
            output.writeLine("    </ClCompile>");
            output.writeLine("    <Link>");
            output.writeLine("      <SubSystem>" + configuration.link.subSystem + "</SubSystem>");
            output.writeLine("      <GenerateDebugInformation>" + configuration.link.generateDebugInformation + "</GenerateDebugInformation>");
            output.writeLine("    </Link>");
            output.writeLine("  </ItemDefinitionGroup>");
        });
        output.writeLine("  <ItemGroup>");
        project.sourceFiles.forEach(file => {
            output.writeLine("    <ClCompile Include=\"" + file + "\" />");
        });
        output.writeLine("  </ItemGroup>");
        output.writeLine("  <ItemGroup>");
        project.headerFiles.forEach(file => {
            output.writeLine("    <ClInclude Include=\"" + file + "\" />");
        });
        output.writeLine("  </ItemGroup>");
        output.writeLine("  <ItemGroup>");
        project.extraFiles.forEach(file => {
            output.writeLine("    <None Include=\"" + file + "\" />");
        });
        output.writeLine("  </ItemGroup>");
        output.writeLine("  <Import Project=\"$(VCTargetsPath)\\Microsoft.Cpp.targets\" />");
        output.writeLine("  <ImportGroup Label=\"ExtensionTargets\">");
        output.writeLine("  </ImportGroup>");
        output.writeLine("</Project>");
		output.save(project.name + ".vcxproj");

        if (project.filters.length > 0) {
            this.writeProjectFilters(project);
        }
	}

    writeProjectFilters(project) {
    	var output = new LineWriter();

        output.writeLine("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
        output.writeLine("<Project ToolsVersion=\"4.0\" xmlns=\"http://schemas.microsoft.com/developer/msbuild/2003\">");
        output.writeLine("  <ItemGroup>");
        project.filters.forEach(filter => {
            filter.sourceFiles.forEach(file => {
                if (filer.name == "") {
                    output.writeLine("    <ClCompile Include=\"" + file + "\" />");
                }
                else {
                    output.writeLine("    <ClCompile Include=\"" + file + "\">");
                    output.writeLine("      <Filter>" + filter.name + "</Filter>");
                    output.writeLine("    </ClCompile>");
                }
            });
        });
        output.writeLine("  </ItemGroup>");
        output.writeLine("  <ItemGroup>");
        project.filters.forEach(filter => {
            filter.sourceFiles.forEach(file => {
                if (filer.name != "") {
                    output.writeLine("    <Filter Include=\"" + file + "\">");
                    output.writeLine("      <UniqueIdentifier>{" + filter.guid + "}</UniqueIdentifier>");
                    output.writeLine("    </Filter>");
                }
            });
        });
        output.writeLine("  </ItemGroup>");
        output.writeLine("  <ItemGroup>");
        project.filters.forEach(filter => {
            filter.headerFiles.forEach(file => {
                if (filer.name == "") {
                    output.writeLine("    <ClInclude Include=\"" + file + "\" />");
                }
                else {
                    output.writeLine("    <ClInclude Include=\"" + file + "\">");
                    output.writeLine("      <Filter>" + filter.name + "</Filter>");
                    output.writeLine("    </ClInclude>");
                }
            });
        });
        output.writeLine("  </ItemGroup>");
        output.writeLine("  <ItemGroup>");
        project.filters.forEach(filter => {
            filter.headerFiles.forEach(file => {
                if (filer.name == "") {
                    output.writeLine("    <None Include=\"" + file + "\" />");
                }
                else {
                    output.writeLine("    <None Include=\"" + file + "\">");
                    output.writeLine("      <Filter>" + filter.name + "</Filter>");
                    output.writeLine("    </None>");
                }
            });
        });
        output.writeLine("  </ItemGroup>");
        output.writeLine("</Project>");

		output.save(project.name + ".vcxproj.filters");
    }
}
