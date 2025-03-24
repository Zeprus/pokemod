var baseAddr = Module.findBaseAddress('libil2cpp.so');
//public class EncounterState : GameState, IEncounterState // TypeDefIndex: 6809
//	public void ApproachComplete(); // RVA: 0xB0BA0C Offset: 0xB0BA0C
var EncounterState_ApproachComplete = new NativeFunction(baseAddr.add("0xB3BDBC"), "void", ["pointer"]);
//	private void BeginEncounterApproach(); // RVA: 0xB31E6C Offset: 0xB31E6C
Interceptor.replace(baseAddr.add("0xB6221C"), new NativeCallback(function(object){
    EncounterState_ApproachComplete(object);
}, "void", ["pointer"]));

//public class EncounterParkCameraController : MonoBehaviour, IEncounterCameraController, ICameraController // TypeDefIndex: 6668
//	private float tweenDurationSeconds; // 0x10
//	private float introDurationSeconds; // 0x20

//public class EncounterInteractionState : GameState, IEncounterInteractionState, ICustomInstaller // TypeDefIndex: 6683
//	private EncounterParkCameraController parkCameraController; // 0x6C
//	private void InitializeState(); // RVA: 0xB18984 Offset: 0xB18984
Interceptor.attach(baseAddr.add("0xB48D34"), {
    onEnter: function(args){
        this.object = args[0];
    },
    onLeave: function(retval){
        var camera = this.object.add("0x6C").readPointer(); /*Mod.NoTranslate*/
        camera.add("0x10").writeFloat(0); /*Mod.NoTranslate*/
        camera.add("0x20").writeFloat(0); /*Mod.NoTranslate*/
    }
});
