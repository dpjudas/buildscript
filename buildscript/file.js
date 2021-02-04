
export { File, Directory, FilePath };

class File
{
    static writeAllBytes(filename, data) {
    }
    
    static writeAllText(filename, text) {
        fileWriteAllText(filename, text);
    }
    
    static readAllBytes(filename) {
        return [];
    }
    
    static readAllText(filename) {
        return "";
    }
    
    static getLastWriteTime(filename) {
        return 0;
    }
}

class Directory
{
    static folders(filter) {
        return [];
    }
    
    static files(filter) {
        return [];
    }
}

class FilePath
{
    static hasExtension(filename, extension) {
        return false;
    }
    
    static extension(filename) {
        return "";
    }
    
    static removeExtension(filename) {
        return "";
    }
    
    static lastComponent(path) {
        return "";
    }
    
    static removeLastComponent(path) {
        return "";
    }

    static combine(part1, part2) {
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
