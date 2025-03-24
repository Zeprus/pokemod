var baseAddr = Module.findBaseAddress('libil2cpp.so');

//public class CheatingWarningGui : LegacyGuiController, ICheatingWarningGui, IGuiController, IHideable, IScoped // TypeDefIndex: 10838
//	private string MakeWarningString(); // RVA: 0x85B6F4 Offset: 0x85B6F4
Interceptor.attach(baseAddr.add("0x85B6F4"), {
    onEnter: function(args){
        this.object = args[0];
        //this.loginHandler = this.object.add("0x6C").readPointer();
    },
    onLeave: function(retval){
        var prevSuspended = this.loginHandler.add("0x47").readPointer();
        var isBanned = this.loginHandler.add("0x5C").readPointer();
        var warnLeftMS = this.loginHandler.add("0x50").readLong();
        var warnedReason = this.object.add("0x7C").readInt();
        switch(warnedReason){
            case 0: warnedReason = "CHEAT_WARNING";
            break;
            case 1: warnedReason = "POST_SUSPENSION_WARNING";
            break;
        }
        var replaceString = Memory.allocUtf16String("Previously suspended: " + prevSuspended + "\nBanned: " + isBanned + "\nReason: " + warnedReason + "\nTime left MS: " + warnLeftMS).sub("0xC");
        retval.replace(replaceString);
    }
});