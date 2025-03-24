var baseAddr = Module.findBaseAddress('libil2cpp.so');
var encounterCaptureState;
var encounterGuiController;
//public class EncounterCaptureState : GameState, IEncounterCaptureState
//	private float postCaptureWait; // 0x84
//	private float postBreakoutWait; // 0x88
//  private void PlayPokemonCaptured(CatchPokemonOutProto captureResults);
var capture = new NativeFunction(baseAddr.add("0xB3F79C"), 'void', ['pointer', 'pointer']);
Interceptor.replace(baseAddr.add("0xB3F79C"), new NativeCallback(function(){
}, 'void', ['pointer', 'pointer']));
//  private void PlayBreakout(CatchPokemonOutProto captureResults);
var breakout = new NativeFunction(baseAddr.add("0xB3FA1C"), 'void', ['pointer', 'pointer']);

//public class EncounterInteractionState : GameState, IEncounterInteractionState, ICustomInstaller
//	public EncounterCaptureState captureStatePrefab; // 0x30
//  private EncounterGuiController uiControllerPrefab; // 0x48
//	public EncounterNameplate namePlatePrefab; // 0x5C
//	public void PokemonCaptured(); // RVA: 0xB49B5C Offset: 0xB49B5C
var EncounterInteractionState_PokemonCaptured = new NativeFunction(baseAddr.add("0xB49B5C"), "void", ["pointer"]);
//	public void EnterCaptureState(); // RVA: 0xB4AD60 Offset: 0xB4AD60
Interceptor.attach(baseAddr.add("0xB4AD60"), {
    onLeave: function(retval){
        encounterCaptureState = ptr(retval);
    }
});
//	public IEncounterGuiController get_EncounterUI(); // RVA: 0xB48720 Offset: 0xB48720
Interceptor.attach(baseAddr.add("0xB48720"), {
    onLeave: function(retval){
        encounterGuiController = ptr(retval);
    }
});

//public class EncounterGuiController : GuiController, IEncounterGuiController, IInitializer`1<IEncounterPokemon>, IGuiController, IScoped, IGuiLayerable, IHideable // TypeDefIndex: 7185
//	public void set_ActiveBerry(Item value);
var EncounterGuiController_setActiveBerry = new NativeFunction(baseAddr.add("0xB435AC"), 'void', ['pointer', 'pointer']);

//public class EncounterNameplate : MonoBehaviour
//  public void SetActiveBerry(Item item);
var setActiveBerry = new NativeFunction(baseAddr.add("0xB43660"), 'void', ['pointer', 'pointer']);

//public class Pokeball : MonoBehaviour, IPokeball
//  private int GetCaptureShakes(CatchPokemonOutProto proto);
//	private readonly IEncounterInteractionState interactionState;

var getCaptureShakes = baseAddr.add("0xC8D7E4");
Interceptor.attach(getCaptureShakes,{
    onEnter: function(args){
        this.catchPokemonOutProto = args[1];
        this.object = args[0];
        this.encounterInteractionState = this.object.add(0xFC).readPointer(); /*Mod.NoTranslate*/
        this.encounterCaptureState = this.encounterInteractionState.add(0x30).readPointer(); /*Mod.NoTranslate*/
        this.encounterNameplate = this.encounterInteractionState.add(0x5C).readPointer(); /*Mod.NoTranslate*/
    },
    onLeave: function(retval){
        if(retval != "0x4"){ /*Mod.NoTranslate*/
            breakout(encounterCaptureState, this.catchPokemonOutProto);
            //	private Item activeBerry;
            var berry = this.encounterInteractionState.add("0x10C"); /*Mod.NoTranslate*/
            berry.writeInt(0);
            EncounterGuiController_setActiveBerry(encounterGuiController, ptr(0x0));
        } else {
            //EncounterInteractionState_PokemonCaptured(this.encounterInteractionState);
            capture(encounterCaptureState, this.catchPokemonOutProto);
        }
    }
});

//public class EncounterCaptureCameraController : MonoBehaviour, ICameraController
//  public void OnStart(Camera cam);
var onStart = baseAddr.add("0xB3E230");
Interceptor.replace(onStart, new NativeCallback(function(){

}, 'void', ['pointer']));