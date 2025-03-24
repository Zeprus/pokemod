var baseAddr = Module.findBaseAddress('libil2cpp.so');
var catchPokemonOutProto;
var encounterCaptureState;
var encounterInteractionState;
var encounterGuiController;

//public class EncounterCaptureState : GameState, IEncounterCaptureState
//  public void .ctor();
Interceptor.attach(baseAddr.add("0x14904FC"), {
    onLeave: function(retval){
        encounterCaptureState = ptr(retval.toString());
    }
});
//  private void PlayPokemonCaptured(CatchPokemonOutProto captureResults);
var capture = new NativeFunction(baseAddr.add("0x1490F6C"), 'void', ['pointer', 'pointer']);
Interceptor.replace(baseAddr.add("0x1490F6C"), new NativeCallback(function(){
}, 'void', ['pointer', 'pointer']));
//  private void PlayBreakout(CatchPokemonOutProto captureResults);
var breakout = new NativeFunction(baseAddr.add("0x14911A0"), 'void', ['pointer', 'pointer']);


//public class EncounterInteractionState : GameState, IEncounterInteractionState, ICustomInstaller
//	public void .ctor();
Interceptor.attach(baseAddr.add("0x1498B2C"), {
    onLeave: function(retval){
        encounterInteractionState = ptr(retval.toString());
    }
});

//public class EncounterNameplate : MonoBehaviour
//  public void .ctor();
Interceptor.attach(baseAddr.add("0x14A13A4"), {
    onLeave: function(retval){
        encounterGuiController = ptr(retval.toString());
    }
});
//  public void SetActiveBerry(Item item);
var setActiveBerry = new NativeFunction(baseAddr.add("0x1494524"), 'void', ['pointer', 'pointer']);

//public class Pokeball : MonoBehaviour, IPokeball
//  private int GetCaptureShakes(CatchPokemonOutProto proto);
var getCaptureShakes = baseAddr.add("0x16966E0");
Interceptor.attach(getCaptureShakes,{
    onEnter: function(args){
        catchPokemonOutProto = args[1];
    },
    onLeave: function(retval){
        if(retval != "0x4"){ /*Mod.NoTranslate*/
            breakout(encounterCaptureState, catchPokemonOutProto);
            //	private Item activeBerry;
            var berry = encounterInteractionState.add("0x210"); /*Mod.NoTranslate*/
            berry.writeInt(0);
            setActiveBerry(encounterGuiController, ptr("0x0")); /*Mod.NoTranslate*/
        } else {
            capture(encounterCaptureState, catchPokemonOutProto);
        }
    }
});

//public class EncounterCaptureCameraController : MonoBehaviour, ICameraController
//  public void OnStart(Camera cam);
var onStart = baseAddr.add("0x148FD0C");
Interceptor.replace(onStart, new NativeCallback(function(){

}, 'void', ['pointer']));