
export { File, Directory, FilePath };

class File
{
    static writeAllBytes(filename, data) {
        __fileWriteAllBytes(filename, data);
    }
    
    static writeAllText(filename, text) {
        __fileWriteAllText(filename, text);
    }
    
    static readAllBytes(filename) {
        return __fileReadAllBytes(filename);
    }
    
    static readAllText(filename) {
        return __fileReadAllText(filename);
    }
    
    static getLastWriteTime(filename) {
        return __fileGetLastWriteTime(filename);
    }
}

class Directory
{
    static folders(filter) {
        return __directoryFolders(filter);
    }
    
    static files(filter) {
        return __directoryFiles(filter);
    }
}

class FilePath
{
    static hasExtension(filename, extension) {
        var fileext = FilePath.extension(filename);
        return fileext.toLowerCase() == extension.toLowerCase();
    }
    
    static extension(filename) {
        var file = FilePath.lastComponent(filename);
        var pos = file.lastIndexOf('.');
        if (pos != -1) {
            return file.substring(pos + 1);
        }
        else {
            return "";
        }
    }
    
    static removeExtension(filename) {
        var file = FilePath.lastComponent(filename);
        var pos = file.lastIndexOf('.');
        if (pos != -1) {
            return filename.substring(0, filename.length - file.length + pos);
        }
        else {
            return filename;
        }
    }
    
    static lastComponent(path) {
        var lastSlash = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
        if (lastSlash != -1) {
            return path.substring(lastSlash + 1);
        }
        else {
            return path;
        }
    }
    
    static removeLastComponent(path) {
        var lastSlash = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
        if (lastSlash != -1) {
            return path.substring(0, lastSlash + 1);
        }
        else {
            return "";
        }
    }

    static combine(path1, path2) {
        if (path1 == "") {
            return path2;
        }
        else if (path2 == "") {
            return path1;
        }
        else if (path2[0] == '/' || path2[0] == '\\') {
            return path2;
        }
        else if (path1[path1.length - 1] != '/' && path1[path1.length - 1] != '\\') {
            return path1 + "\\" + path2;
        }
        else {
            return path1 + path2;
        }
        return "";
    }
    
    static forceFilesysSlash(path) {
        return FilePath.forceBackslash(path);
    }
    
    static forceSlash(path) {
        return path.replaceAll("\\", "/");
    }
    
    static forceBackslash(path) {
        return path.replaceAll("/", "\\");
    }
}
