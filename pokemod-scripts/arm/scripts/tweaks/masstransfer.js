var baseAddr = Module.findBaseAddress('libil2cpp.so');
//public class PokemonInventoryMultiSelect
//  public string VerifySelection(PokemonProto pokemon);
Interceptor.attach(baseAddr.add("0x9FBFAC"), {
    onLeave: function(retval){
        retval.replace(ptr("0x0")); /*Mod.NoTranslate*/
    }
});