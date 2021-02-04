
export { Process };

class Process
{
    static run(cmdline) {
        return __processRun(cmdline);
    }
}
