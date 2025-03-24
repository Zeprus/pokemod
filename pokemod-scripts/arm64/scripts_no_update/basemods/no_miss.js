var baseAddr = Module.findBaseAddress('libil2cpp.so');

//public class Pokeball : MonoBehaviour, IPokeball
//public void .ctor();
var pokeball;
Interceptor.attach(baseAddr.add("0xD06A04"), {
    onLeave: function(retval){
        pokeball = ptr(retval.toString());
    }
});
//public void SetActive(bool active);
var setActive = new NativeFunction(baseAddr.add("0xD0A324"), 'void', ['pointer', 'pointer']);

//private sealed class Pokeball.<FlyStateImpl>c__Iterator5.<FlyStateImpl>c__AnonStoreyF
//	internal void <>m__0();
Interceptor.replace(baseAddr.add("0xD10030"), new NativeCallback(function(){
    setActive(pokeball, ptr("0x0"));
    setActive(pokeball, ptr("0x1"));
}, 'void', ['pointer']));