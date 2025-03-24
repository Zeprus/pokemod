var baseAddr = Module.findBaseAddress('libil2cpp.so');
var pokeball;

//public class EncounterPokemon
//  protected virtual float get_AttackProbability();
Interceptor.attach(baseAddr.add("0x14A3DA4"), {
    onLeave: function(retval){
        retval.replace(0);
    }
});
//  protected virtual float get_DodgeProbability();
Interceptor.attach(baseAddr.add("0x14A3DE8"), {
    onLeave: function(retval){
        retval.replace(0);
    }
});
//  private HoloPokemonMovementType get_MovementType();
Interceptor.attach(baseAddr.add("0x14A3E2C"), {
    onLeave: function(retval){
        retval.replace(0);
    }
});

//public class Reticle : MonoBehaviour, IReticle
//  public float get_NormalizedSize();
Interceptor.attach(baseAddr.add("0x169C880"), {
    onLeave: function(retval){
        var memoryPointer = Memory.alloc(64);
        var number = (Math.random() * (0.3 - 0.1) + 0.1);
        memoryPointer.writeFloat(number);
        var floatAsHex = memoryPointer.readPointer();
        retval.replace(floatAsHex);
    }
});
//  public bool ScreenPositionOverBullseye(Vector2 screenPos);
Interceptor.attach(baseAddr.add("0x169D89C"), {
    onLeave: function(retval){
        retval.replace(1);
    }
});

//public class Pokeball
//  public void .ctor();
Interceptor.attach(baseAddr.add("0x1691C30"), {
    onLeave: function(retval){
        pokeball = ptr(retval.toString());
    }
});
//  private bool get_IsSpinning();
Interceptor.attach(baseAddr.add("0x1693F2C"), {
    onLeave: function(retval) {
        retval.replace(1);
    }
});
//  public void SetActive(bool active);
var setActive = new NativeFunction(baseAddr.add("0x1695038"), 'void', ['pointer', 'pointer']);

//private sealed class Pokeball.<FlyStateImpl>c__Iterator5.<FlyStateImpl>c__AnonStoreyF
//  internal void <>m__0();
Interceptor.replace(baseAddr.add("0x1699F64"), new NativeCallback(function(){
    setActive(pokeball, ptr("0x0")); /*Mod.NoTranslate*/
    setActive(pokeball, ptr("0x1")); /*Mod.NoTranslate*/
}, 'void', ['pointer']));