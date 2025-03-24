var baseAddr = Module.findBaseAddress('libil2cpp.so');
//public class Reticle : MonoBehaviour, IReticle
//public float get_NormalizedSize();
Interceptor.attach(baseAddr.add("0xD12FF8"), {
    onLeave: function(retval){
        var memoryPointer = Memory.alloc(64);
        var number = (Math.random() * (0.3 - 0.1) + 0.1);
        memoryPointer.writeFloat(number);
        var floatAsHex = memoryPointer.readPointer();
        retval.replace(floatAsHex);
    }
});