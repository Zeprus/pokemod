var baseAddr = Module.findBaseAddress('libil2cpp.so');
var pokeball;

//public class EncounterPokemon
//  protected virtual float get_AttackProbability();
Interceptor.attach(baseAddr.add("0xB553CC"), {
    onLeave: function(retval){
        retval.replace(0);
    }
});
//  protected virtual float get_DodgeProbability();
Interceptor.attach(baseAddr.add("0xB55410"), {
    onLeave: function(retval){
        retval.replace(0);
    }
});
//  private HoloPokemonMovementType get_MovementType();
Interceptor.attach(baseAddr.add("0xB55454"), {
    onLeave: function(retval){
        retval.replace(0);
    }
});

//public class Reticle : MonoBehaviour, IReticle
//  public float get_NormalizedSize();
Interceptor.attach(baseAddr.add("0xC94A70"), {
    onLeave: function(retval){
        var memoryPointer = Memory.alloc(64);
        var number = (Math.random() * (0.3 - 0.1) + 0.1);
        memoryPointer.writeFloat(number);
        var floatAsHex = memoryPointer.readPointer();
        retval.replace(floatAsHex);
    }
});
//  public bool ScreenPositionOverBullseye(Vector2 screenPos);
Interceptor.attach(baseAddr.add("0xC95D4C"), {
    onLeave: function(retval){
        retval.replace(1);
    }
});

//public class Pokeball
//  private bool get_IsSpinning();
Interceptor.attach(baseAddr.add("0xC8AA10"), {
    onEnter: function(args){
            pokeball = args[0];
    },
    onLeave: function(retval) {
        retval.replace(1);
    }
});
//  public void SetActive(bool active);
var setActive = new NativeFunction(baseAddr.add("0xC8BD9C"), 'void', ['pointer', 'pointer']);

//private sealed class Pokeball.<FlyStateImpl>c__Iterator5.<FlyStateImpl>c__AnonStoreyF
//  internal void <>m__0();
Interceptor.replace(baseAddr.add("0xC91AA8"), new NativeCallback(function(){
    setActive(pokeball, ptr("0x0")); /*Mod.NoTranslate*/
    setActive(pokeball, ptr("0x1")); /*Mod.NoTranslate*/
}, 'void', ['pointer']));