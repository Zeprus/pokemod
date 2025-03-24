var baseAddr = Module.findBaseAddress('libil2cpp.so');
//public class PokemonModel : MonoBehaviour, IPokemonModel // TypeDefIndex: 8032
//	public bool get_IsShiny(); // RVA: 0xA9930C Offset: 0xA9930C
Interceptor.attach(baseAddr.add("0x9E6518"), {
    onLeave: function(retval){
        retval.replace(ptr("0x1"));
    }
});
//	public bool get_Shiny(); // RVA: 0x16E3FE8 Offset: 0x16E3FE8
Interceptor.attach(baseAddr.add("0x727330"), {
    onLeave: function(retval){
        retval.replace(ptr("0x1"));
    }
});
/**DEPRECATED */