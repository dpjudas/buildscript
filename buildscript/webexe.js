
import { File, Directory, FilePath } from "file.js";
import { Process } from "process.js";
import { ZipWriter } from "zip.js";
export { buildWebExe };

function buildWebExe(outputFilename, sourceDir) {
    var shellfile = FilePath.combine(sourceDir, "Sources/Framework/shell.html");
    var preJS = FilePath.combine(sourceDir, "Sources/Framework/JSCallback.js");
    var includePath = FilePath.combine(sourceDir, "Sources");

    // To do: use -gseparate-dwarf[=FILENAME] maybe

    var flags = "--bind -s DISABLE_EXCEPTION_CATCHING=0";
    var compileFlags = flags + " -I " + includePath;
    var linkFlags = flags + " --pre-js=" + preJS + " --shell-file " + shellfile;
    
    var compileFlagsDebug = "-g -O0 " + compileFlags;
    var linkFlagsDebug = "-g4 -O0 --source-map-base " + mapbase + " " + linkFlags;
    
    var compileFlagsRelease = "-O2 " + compileFlags;
    var linkFlagsRelease = "-O2 " + linkFlags;
    
    var emcc = "C:\\Development\\musicplayer\\Thirdparty\\emsdk\\upstream\\emscripten\\emcc";
    
    var outputHtml = "index.html";
    var outputJS = "index.js";
    var outputWasm = "index.wasm";
    var outputMap = "index.wasm.map";
    
    var objFiles = [];
    compileFolder(emcc + " " + compileFlagsDebug, FilePath.combine(sourceDir, "Sources"), objFiles);
    linkExe(emcc + " " + linkFlagsDebug, outputHtml, objFiles);
    
    var zip = new ZipWriter(outputFilename);
    [outputHtml, outputJS, outputWasm].forEach(filename => {
        var data = File.readAllBytes(filename);
        zip.addFile(FilePath.lastComponent(filename), data);
    });
    addFolder(zip, FilePath.combine(sourceDir, "wwwroot"), "");
    
    // Add every file listed to the package and remap the filenames
    var sources = [];
    var mapJson = JSON.parse(File.readAllText(outputMap));
    mapJson.sources.forEach((source, index) => {
        var srcfilename = source;
        var destfilename = srcfilename.replaceAll("../", ""); 
        mapJson.sources[index] = destfilename;
        sources.push({ src: srcfilename, dest: destfilename });
    });
    // sourcemaps.info spec says the order of the properties matters:
    var outputMapJson = "{";
    var propOrder = ["version", "file", "sourceRoot", "sources", "sourcesContent", "names", "mappings"];
    propOrder.forEach((prop, index) => {
        if (mapJson[prop] != undefined) {
            if (index != 0) {
                outputMapJson += ",";
            }
            outputMapJson += "\r\n\"" + prop + "\": ";
            outputMapJson += JSON.stringify(mapJson[prop]);
        }
    });
    outputMapJson += "\r\n}";
    // File.writeAllText("index.wasm.map.txt", outputMapJson);
    zip.addFile(outputMap, outputMapJson);
    sources.forEach(source => {
        var data = File.readAllBytes(source.src);
        zip.addFile(source.dest, data);
    });
    zip.finalizeArchive();
}

function compileFolder(emcc, srcdir, outputFiles) {
    Directory.folders(FilePath.combine(srcdir, "*.*")).forEach(filename => {
        compileFolder(emcc, FilePath.combine(srcdir, filename), outputFiles);
    });
    
    Directory.files(FilePath.combine(srcdir, "*.cpp")).forEach(filename => {
        var cppFile = FilePath.combine(srcdir, filename);
        var objFile = FilePath.removeExtension(filename) + ".obj";
        var depFile = FilePath.removeExtension(filename) + ".d";
        
        var needsCompile = false;
        try {
            var objTime = File.getLastWriteTime(objFile);
            readDependencyFile(depFile).forEach(dependency => {
                if (!needsCompile) {
                    var depTime = File.getLastWriteTime(dependency);
                    if (depTime > objTime) {
                        needsCompile = true;
                    }
                }
            });
        }
        catch (e) {
            needsCompile = true;
        }
        
        if (needsCompile) {
            Console.log(filename);
            var result = Process.run(emcc + " -MD -c " + cppFile + " -o " + objFile);
            if (result != 0) {
                throw "Could not compile " + cppFile;
            }
        }
        
        outputFiles.push(objFile);
    });
}

function linkExe(emcc, outputExe, objFiles) {
    var needsLink = false;
    try {
        var exeTime = File.getLastWriteTime(outputExe);
        objFiles.forEach(dependency => {
            if (!needsLink) {
                var depTime = File.getLastWriteTime(dependency);
                if (depTime > exeTime) {
                    needsLink = true;
                }
            }
        });
    }
    catch (e) {
        needsLink = true;
    }
    
    if (needsLink) {
        Console.log("Linking " + outputExe);
        var cmdline = emcc + " -o " + outputExe;
        objFiles.forEach(file => {
            cmdline += " ";
            cmdline += file;
        });
        var result = Process.run(cmdline);
        if (result != 0) {
            throw "Could not link " + outputExe;
        }
    }
}

function addFolder(zip, srcdir, destdir) {
    Directory.files(FilePath.combine(srcdir, "*.*")).forEach(filename => {
        var data = File.readAllBytes(FilePath.combine(srcdir, filename));
        zip.addFile(FilePath.combine(destdir, filename), data);
    });
    
    Directory.folders(FilePath.combine(srcdir, "*.*")).forEach(filename => {
        addFolder(FilePath.combine(srcdir, filename), FilePath.combine(destdir, filename));
    });
}

var MakeTokenType = {
    STRING: 0,
    COLON: 1,
    NEWLINE: 2
};

function readDependencyFile(filename) {
    var tokens = tokenizeMakefile(File.readAllText(filename));
    
    if (tokens.length < 2 || tokens[0].type != MakeTokenType.STRING || tokens[1].type != MakeTokenType.COLON) {
        throw "Invalid or empty dependency file";
    }
    
    var files = [];
    for (var i = 2; i < tokens.length; i++) {
        if (tokens[i].type == MakeTokenType.NEWLINE) {
            break;
        }
        else if (tokens[i].type != MakeTokenType.STRING) {
            throw "Parse error reading dependency target";
        }
        files.push(tokens[i].value);
    }
    return files;
}

function tokenizeMakefile(text) {
    var tokens = [];
    
    return tokens;
}
